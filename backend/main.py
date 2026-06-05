import uvicorn
from backend.config import PORT

if __name__ == "__main__":
    # uvicorn is the async HTTP/WebSocket server that runs our FastAPI app.
    # "backend.server:app" means: find the `app` object in backend/server.py.
    # reload=True restarts the server automatically when you save a file — useful during development.
    uvicorn.run("backend.server:app", host="0.0.0.0", port=PORT, reload=True)
