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
    x: float
    y: float
    period: int
    clock: str           # "PT11M58.00S"
    description: str

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
