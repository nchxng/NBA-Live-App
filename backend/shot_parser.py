from __future__ import annotations

from backend.models import ShotEvent

def parse_shot(action: dict, game_id: str) -> ShotEvent | None:
    # only care about field goal attempts
    if action.get("isFieldGoal") != 1:
        return None

    # skip if no coordinates
    if action.get("x") is None or action.get("y") is None:
        return None

    made = "made" in action.get("description", "").lower()

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
    )