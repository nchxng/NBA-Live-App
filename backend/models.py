from dataclasses import dataclass

@dataclass
class ShotEvent:
    game_id: str
    action_number: int
    person_id: int
    player: str          # playerNameI e.g. "J. Tatum"
    team_id: int
    team: str            # teamTricode e.g. "BOS"
    made: bool
    x: float             # 0–100, percentage of full court length (94ft)
    y: float             # 0–100, percentage of full court width (50ft)
    period: int
    clock: str           # "PT11M58.00S"
    description: str
    score_home: str      # score at moment of shot, for scoreboard updates
    score_away: str

@dataclass
class PlayerState:
    person_id: int
    name: str            # "J. Tatum"
    team: str            # teamTricode
    team_id: int
    jersey: str
    position: str
    oncourt: bool

@dataclass
class GameState:
    period: int
    clock: str           # "PT11M58.00S"
    score_home: str
    score_away: str
    home_team: str       # tricode
    away_team: str
    home_team_id: int
    away_team_id: int

@dataclass
class GameSummary:
    game_id: str
    home_team: str       # tricode
    away_team: str
    home_team_id: int
    away_team_id: int
    status: str          # "In Progress", "Final", etc.
    score_home: str
    score_away: str
