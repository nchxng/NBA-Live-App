// These interfaces mirror the Python dataclasses in backend/models.py exactly.
// If you add a field to the Python model, add it here too.

export interface ShotEvent {
  action_number: number;
  person_id: number;
  player: string;         // "J. Tatum"
  team: string;           // "BOS"
  team_id: number;
  made: boolean;
  x: number;              // NBA API half-court x (0–500)
  y: number;              // NBA API half-court y (0–470)
  period: number;
  clock: string;          // "PT08M14.00S"
  description: string;
}

export interface PlayerState {
  person_id: number;
  name: string;           // "J. Tatum"
  team: string;           // "BOS"
  team_id: number;
  jersey: string;
  position: string;
  oncourt: boolean;
}

export interface GameState {
  period: number;
  clock: string;          // "PT08M14.00S"
  score_home: string;
  score_away: string;
  home_team: string;      // tricode
  away_team: string;      // tricode
  home_team_id: number;
  away_team_id: number;
}

export interface GameSummary {
  game_id: string;
  home_team: string;
  away_team: string;
  home_team_id: number;
  away_team_id: number;
  status: string;
  score_home: string;
  score_away: string;
}
