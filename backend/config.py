import os

# How often the poller asks the NBA API for new plays.
# 2.5s is a good balance: fast enough to feel live, slow enough to avoid
# getting rate-limited by cdn.nba.com.
POLL_INTERVAL_SECONDS = 2.5

# Allowed origins for CORS. Next.js dev server runs on 3000.
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

# Timeout for outbound requests to the NBA API.
NBA_REQUEST_TIMEOUT = 10

# The NBA CDN requires Origin and Referer headers or it returns 403.
NBA_HEADERS = {
    "Origin": "https://www.nba.com",
    "Referer": "https://www.nba.com/",
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
}

# Port this server listens on.
PORT = int(os.getenv("PORT", "8000"))
