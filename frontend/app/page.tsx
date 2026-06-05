import Link from "next/link";
import { GameSummary } from "@/types/game";

// This is a Server Component (no "use client") — Next.js runs it on the server,
// fetches the data, and sends ready HTML to the browser. No loading state needed.
export default async function Home() {
  let games: GameSummary[] = [];
  let error = false;

  try {
    const res = await fetch("http://localhost:8000/games", {
      cache: "no-store", // always fetch fresh — game statuses change constantly
    });
    games = await res.json();
  } catch {
    error = true;
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-2 tracking-tight">NBA Live</h1>
      <p className="text-gray-400 mb-10 text-sm">Select a game to watch</p>

      {error && (
        <p className="text-red-400 text-sm">
          Could not reach backend — make sure <code className="bg-gray-800 px-1 rounded">python -m backend.main</code> is running.
        </p>
      )}

      {!error && games.length === 0 && (
        <p className="text-gray-500">No games today.</p>
      )}

      <div className="flex flex-col gap-4 w-full max-w-md">
        {games.map((game) => (
          <Link
            key={game.game_id}
            href={`/game/${game.game_id}`}
            className="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 transition-colors rounded-xl p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4 text-lg font-semibold">
              <span>{game.away_team}</span>
              <span className="text-gray-500 text-sm font-normal">@</span>
              <span>{game.home_team}</span>
            </div>
            <div className="text-right">
              {game.score_home !== "0" || game.score_away !== "0" ? (
                <div className="text-xl font-mono font-bold">
                  {game.score_away} – {game.score_home}
                </div>
              ) : null}
              <div className="text-xs text-gray-400 mt-1">{game.status}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Replay section — test with a completed game when no live games are on */}
      <div className="mt-12 w-full max-w-md">
        <p className="text-gray-600 text-xs uppercase tracking-widest mb-3">Test with replay</p>
        <Link
          href="/game/0042500401?replay=1"
          className="bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-gray-500 transition-colors rounded-xl p-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 text-lg font-semibold">
            <span>NYK</span>
            <span className="text-gray-500 text-sm font-normal">@</span>
            <span>SAS</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-yellow-500 font-medium">Replay</div>
            <div className="text-xs text-gray-500 mt-1">Finals Game 1 · Final</div>
          </div>
        </Link>
      </div>
    </main>
  );
}
