from nba_api.live.nba.endpoints import scoreboard
from nba_api.live.nba.endpoints.playbyplay import PlayByPlay
from nba_api.live.nba.endpoints.boxscore import BoxScore

from backend.config import NBA_HEADERS, NBA_REQUEST_TIMEOUT

def get_live_game_ids() -> list[str]:
    board = scoreboard.ScoreBoard(headers=NBA_HEADERS, timeout=NBA_REQUEST_TIMEOUT).get_dict()
    games = board["scoreboard"]["games"]
    return [g["gameId"] for g in games]

def get_plays(game_id: str) -> list[dict]:
    pbp = PlayByPlay(game_id=game_id, headers=NBA_HEADERS, timeout=NBA_REQUEST_TIMEOUT).get_dict()
    return pbp["game"]["actions"]

def get_scoreboard_games() -> list[dict]:
    """Return the raw game dicts from today's scoreboard."""
    board = scoreboard.ScoreBoard(headers=NBA_HEADERS, timeout=NBA_REQUEST_TIMEOUT).get_dict()
    return board["scoreboard"]["games"]

def get_boxscore(game_id: str) -> dict:
    """Return the raw boxscore dict for a game."""
    return BoxScore(game_id=game_id, headers=NBA_HEADERS, timeout=NBA_REQUEST_TIMEOUT).get_dict()

if __name__ == "__main__":
    games = get_scoreboard_games()
    print(f"Games today: {len(games)}")
    for g in games:
        home = g["homeTeam"]["teamTricode"]
        away = g["awayTeam"]["teamTricode"]
        status = g.get("gameStatusText", "")
        print(f"  {away} @ {home}  —  {status}  (id: {g['gameId']})")

    if games:
        game_id = games[0]["gameId"]
        print(f"\nBoxscore sample for {game_id}:")
        bs = get_boxscore(game_id)
        home_players = bs["game"]["homeTeam"]["players"]
        oncourt = [p for p in home_players if p.get("oncourt") == "1"]
        print(f"  Home players oncourt: {[p['nameI'] for p in oncourt]}")
