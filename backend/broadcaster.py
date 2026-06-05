import json
from collections import defaultdict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # Maps game_id -> list of active WebSocket connections.
        # defaultdict(list) means accessing a missing key auto-creates an empty list.
        self._connections: dict[str, list[WebSocket]] = defaultdict(list)

    def connect(self, game_id: str, ws: WebSocket) -> None:
        self._connections[game_id].append(ws)

    def disconnect(self, game_id: str, ws: WebSocket) -> None:
        self._connections[game_id].remove(ws)

    async def broadcast(self, game_id: str, payload: dict) -> None:
        """Send a JSON payload to every client watching this game."""
        message = json.dumps(payload)
        dead: list[WebSocket] = []

        for ws in self._connections[game_id]:
            try:
                await ws.send_text(message)
            except Exception:
                # Client disconnected between polls — mark for removal.
                dead.append(ws)

        for ws in dead:
            self.disconnect(game_id, ws)

    def watcher_count(self, game_id: str) -> int:
        return len(self._connections[game_id])


# Single shared instance imported by both server.py and poller.py.
# Because Python caches module imports, both files get the exact same object.
manager = ConnectionManager()
