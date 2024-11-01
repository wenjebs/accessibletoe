"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase/supabaseClient";
import { useUser } from "../../context/userContext";

export default function ActiveGames() {
  const [games, setGames] = useState<any[]>([]);
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchActiveGames = async () => {
      const { data, error } = await supabase
        .from("tictactoe_games")
        .select("*")
        .eq("status", "waiting")
        .neq("creator_id", user?.id); // Exclude user's own games

      if (error) {
        console.error("Error fetching active games:", error);
      } else {
        setGames(data);
      }
    };

    if (user) {
      fetchActiveGames();
    }
  }, [user]);
  const joinGame = async (gameId: string) => {
    try {
      console.log(`Attempting to join game: ${gameId}`);

      if (!user?.id) {
        console.error("No user ID available");
        return;
      }

      const { data, error } = await supabase
        .from("tictactoe_games")
        .update({
          status: "started",
          opponent_id: user.id,
        })
        .eq("id", gameId)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error.message);
        return;
      }

      if (!data) {
        console.error("No data returned from update");
        return;
      }

      console.log("Update successful:", data);
      router.push(`/tic-tac-toe/${gameId}`);
    } catch (e) {
      console.error("Exception caught:", e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-black">
          Active Games
        </h1>
        {games.length === 0 ? (
          <p className="text-center">No active games available.</p>
        ) : (
          <ul>
            {games.map((game) => (
              <li key={game.id} className="mb-4">
                <button
                  onClick={() => joinGame(game.id)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Game ID: {game.id}
                </button>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/"
          className="block text-center mt-4 text-blue-500 hover:text-blue-600"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
