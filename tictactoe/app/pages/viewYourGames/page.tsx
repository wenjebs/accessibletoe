"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../utils/supabase/supabaseClient";
import { useUser } from "../../context/userContext";

export default function YourGames() {
  const [games, setGames] = useState<any[]>([]);
  const user = useUser();

  useEffect(() => {
    const fetchYourGames = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("tictactoe_games")
        .select("*")
        .or(`creator_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching your games:", error);
      } else {
        setGames(data);
      }
    };

    fetchYourGames();

    // Set up real-time subscription
    const channel = supabase
      .channel("your_games_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tictactoe_games",
        },
        () => {
          fetchYourGames();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getGameStatus = (game: any) => {
    if (game.status === "waiting") {
      return "Waiting for opponent";
    }
    return `In Progress - ${game.x_is_next ? "X" : "O"}'s turn`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-black">
          Your Active Games
        </h1>
        {games.length === 0 ? (
          <p className="text-center text-gray-600">
            You don't have any active games.
          </p>
        ) : (
          <ul className="space-y-4">
            {games.map((game) => (
              <li
                key={game.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <Link href={`/tic-tac-toe/${game.id}`} className="block">
                  <div className="flex flex-col gap-2">
                    <span className="font-medium text-black">
                      Game ID: {game.id}
                    </span>
                    <span className="text-sm text-gray-600">
                      {getGameStatus(game)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Created: {new Date(game.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 flex justify-center">
          <Link href="/" className="text-blue-500 hover:text-blue-600">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
