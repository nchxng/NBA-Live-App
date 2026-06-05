import asyncio
import json
import logging

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from dataclasses import asdict

from backend.broadcaster import manager
from backend.config import CORS_ORIGINS
from backend.models import GameSummary
from backend.nba_client import get_scoreboard_games, get_plays, get_boxscore
from backend.poller import get_initial_state, poll_game, _extract_game_state, _extract_players
from backend.shot_parser import parse_shot

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS lets our Next.js frontend (localhost:3000) talk to this server (localhost:8000).
# Without this the browser blocks cross-origin requests as a security policy.
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/games")
async def list_games() -> list[dict]:
    """Return today's games with scores and status."""
    try:
        # get_scoreboard_games() is a blocking requests call, so we offload it
        # to a thread with asyncio.to_thread to avoid freezing the event loop.
        raw_games = await asyncio.to_thread(get_scoreboard_games)
    except Exception as e:
        logger.error(f"Failed to fetch scoreboard: {e}")
        return []

    from dataclasses import asdict
    summaries = []
    for g in raw_games:
        home = g["homeTeam"]
        away = g["awayTeam"]
        summaries.append(asdict(GameSummary(
            game_id=g["gameId"],
            home_team=home["teamTricode"],
            away_team=away["teamTricode"],
            home_team_id=home["teamId"],
            away_team_id=away["teamId"],
            status=g.get("gameStatusText", ""),
            score_home=str(home.get("score", "0")),
            score_away=str(away.get("score", "0")),
        )))
    return summaries


@app.websocket("/ws/{game_id}")
async def websocket_endpoint(ws: WebSocket, game_id: str) -> None:
    # Step 1: Complete the WebSocket handshake.
    await ws.accept()
    manager.connect(game_id, ws)
    logger.info(f"Client connected to game {game_id} ({manager.watcher_count(game_id)} watchers)")

    try:
        # Step 2: Send the full game history immediately so the client can render
        # all past shots before the poller starts sending incremental updates.
        init_payload = await get_initial_state(game_id)
        await ws.send_text(json.dumps(init_payload))

        # Step 3: Start the background polling loop for this game if not already running.
        # create_task() fires it off and returns immediately — we don't await it.
        asyncio.create_task(poll_game(game_id))

        # Step 4: Keep the connection alive by waiting for client messages.
        # We don't expect any, but receive_text() will raise WebSocketDisconnect
        # when the tab closes — that's our signal to clean up.
        while True:
            await ws.receive_text()

    except WebSocketDisconnect:
        logger.info(f"Client disconnected from game {game_id}")
    finally:
        # finally always runs — even on unexpected exceptions — so cleanup is guaranteed.
        manager.disconnect(game_id, ws)


@app.websocket("/replay/{game_id}")
async def replay_endpoint(ws: WebSocket, game_id: str) -> None:
    """
    Replay mode — for testing with completed games.
    Connects like a normal game but starts with an empty court, then feeds
    all historical shots one-by-one with a delay so animations can be seen.
    """
    await ws.accept()
    logger.info(f"Replay client connected for game {game_id}")

    try:
        # Fetch all data up front (blocking calls offloaded to threads)
        actions, boxscore = await asyncio.gather(
            asyncio.to_thread(get_plays, game_id),
            asyncio.to_thread(get_boxscore, game_id),
        )

        players = _extract_players(boxscore)
        game_state = _extract_game_state(boxscore)

        # Send game_init with an empty shots list — the court starts blank.
        await ws.send_text(json.dumps({
            "type": "game_init",
            "game_id": game_id,
            "shots": [],
            "players": [asdict(p) for p in players],
            "game_state": asdict(game_state),
        }))

        # Collect all shots that have coordinates.
        shots = [s for a in actions if (s := parse_shot(a, game_id))]
        logger.info(f"Replaying {len(shots)} shots for game {game_id}")

        # Send each shot as a shot_update, one at a time, with a delay.
        for shot in shots:
            try:
                await ws.send_text(json.dumps({
                    "type": "shot_update",
                    "shots": [asdict(shot)],
                    "game_state": asdict(game_state),
                }))
                # 800ms between shots — fast enough to test, slow enough to see animations.
                await asyncio.sleep(0.8)
            except Exception:
                break  # client disconnected mid-replay

        logger.info(f"Replay complete for game {game_id}")
        # Keep connection open after replay finishes so the court stays visible.
        while True:
            await ws.receive_text()

    except WebSocketDisconnect:
        logger.info(f"Replay client disconnected from game {game_id}")
    except Exception as e:
        logger.error(f"Replay error for game {game_id}: {e}")
