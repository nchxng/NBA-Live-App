import asyncio
import logging
from dataclasses import asdict

from backend.broadcaster import manager
from backend.config import POLL_INTERVAL_SECONDS, NBA_REQUEST_TIMEOUT
from backend.models import GameState, PlayerState
from backend.nba_client import get_plays, get_boxscore, get_scoreboard_games
from backend.shot_parser import parse_shot

logger = logging.getLogger(__name__)

# Tracks the highest action_number we've already broadcast per game.
# This is how we avoid resending old plays on every poll.
_last_action: dict[str, int] = {}

# Tracks the set of oncourt person_ids per game to detect substitutions.
_last_oncourt: dict[str, frozenset[int]] = {}

# Tracks which games currently have a running poll loop, so we don't start duplicates.
_active_polls: set[str] = set()


async def poll_game(game_id: str) -> None:
    """Long-running async loop that polls the NBA API and broadcasts updates."""
    if game_id in _active_polls:
        return
    _active_polls.add(game_id)
    logger.info(f"Starting poller for game {game_id}")

    try:
        while manager.watcher_count(game_id) > 0:
            await _tick(game_id)
            await asyncio.sleep(POLL_INTERVAL_SECONDS)
    finally:
        _active_polls.discard(game_id)
        logger.info(f"Poller stopped for game {game_id} (no watchers)")


async def _tick(game_id: str) -> None:
    """One poll cycle: fetch new plays and roster, broadcast if anything changed."""
    try:
        # asyncio.to_thread runs the blocking requests call in a thread pool
        # so it doesn't freeze the async event loop.
        actions = await asyncio.to_thread(get_plays, game_id)
        boxscore = await asyncio.to_thread(get_boxscore, game_id)
    except Exception as e:
        logger.warning(f"NBA API error for {game_id}: {e}")
        return

    await _handle_shots(game_id, actions, boxscore)
    await _handle_roster(game_id, boxscore)


async def _handle_shots(game_id: str, actions: list[dict], boxscore: dict) -> None:
    last = _last_action.get(game_id, -1)
    new_shots = []

    for action in actions:
        if action.get("actionNumber", 0) <= last:
            continue
        shot = parse_shot(action, game_id)
        if shot:
            new_shots.append(asdict(shot))

    if not new_shots:
        return

    # Advance our cursor to the highest action number we've seen.
    max_action = max(a["actionNumber"] for a in actions)
    _last_action[game_id] = max_action

    game_state = _extract_game_state(boxscore)
    await manager.broadcast(game_id, {
        "type": "shot_update",
        "shots": new_shots,
        "game_state": asdict(game_state),
    })


async def _handle_roster(game_id: str, boxscore: dict) -> None:
    players = _extract_players(boxscore)
    oncourt_ids = frozenset(p.person_id for p in players if p.oncourt)

    if oncourt_ids == _last_oncourt.get(game_id):
        return  # No substitution — skip broadcast.

    _last_oncourt[game_id] = oncourt_ids
    await manager.broadcast(game_id, {
        "type": "roster_update",
        "players": [asdict(p) for p in players],
    })


def _extract_game_state(boxscore: dict) -> GameState:
    game = boxscore["game"]
    home = game["homeTeam"]
    away = game["awayTeam"]
    return GameState(
        period=game.get("period", 0),
        clock=game.get("gameClock", "PT00M00.00S"),
        score_home=str(home.get("score", "0")),
        score_away=str(away.get("score", "0")),
        home_team=home["teamTricode"],
        away_team=away["teamTricode"],
        home_team_id=home["teamId"],
        away_team_id=away["teamId"],
    )


def _extract_players(boxscore: dict) -> list[PlayerState]:
    game = boxscore["game"]
    players = []
    for side in ("homeTeam", "awayTeam"):
        team = game[side]
        for p in team.get("players", []):
            if p.get("played") != "1" and p.get("oncourt") != "1":
                continue  # Skip players who haven't entered the game yet.
            players.append(PlayerState(
                person_id=p["personId"],
                name=p.get("nameI", p.get("name", "Unknown")),
                team=team["teamTricode"],
                team_id=team["teamId"],
                jersey=p.get("jerseyNum", ""),
                position=p.get("position", ""),
                oncourt=p.get("oncourt") == "1",
            ))
    return players


async def get_initial_state(game_id: str) -> dict:
    """
    Called when a client first connects. Returns a game_init payload
    containing all shots so far, current roster, and game state.
    """
    actions = await asyncio.to_thread(get_plays, game_id)
    boxscore = await asyncio.to_thread(get_boxscore, game_id)

    all_shots = [asdict(s) for a in actions if (s := parse_shot(a, game_id))]
    players = _extract_players(boxscore)
    game_state = _extract_game_state(boxscore)

    # Seed our cursor so the poller doesn't re-broadcast shots that were
    # already sent in this game_init payload.
    if actions:
        max_action = max(a["actionNumber"] for a in actions)
        _last_action[game_id] = max(max_action, _last_action.get(game_id, -1))

    return {
        "type": "game_init",
        "game_id": game_id,
        "shots": all_shots,
        "players": [asdict(p) for p in players],
        "game_state": asdict(game_state),
    }
