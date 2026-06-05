from __future__ import annotations

from backend.models import ShotEvent

def parse_shot(action: dict, game_id: str) -> ShotEvent | None:
    if action.get("isFieldGoal") != 1:
        return None

    if action.get("x") is None or action.get("y") is None:
        return None

    # Use the shotResult field — "Made" or "Missed" — rather than parsing
    # the description string, which never contains the word "made".
    made = action.get("shotResult") == "Made"

    return ShotEvent(
        game_id=game_id,
        action_number=action["actionNumber"],
        person_id=action.get("personId", 0),
        player=action.get("playerNameI", "Unknown"),
        team_id=action.get("teamId", 0),
        team=action.get("teamTricode", ""),
        made=made,
        x=action["x"],
        y=action["y"],
        period=action["period"],
        clock=action["clock"],
        description=action.get("description", ""),
        score_home=str(action.get("scoreHome", "0")),
        score_away=str(action.get("scoreAway", "0")),
    )
