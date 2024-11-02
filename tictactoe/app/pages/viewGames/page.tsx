"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase/supabaseClient";
import { useUser } from "../../context/userContext";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, GamepadIcon, AlertCircle } from "lucide-react";
import { fetchActiveGames } from "@/app/services/gameService";

type Game = {
  id: string;
  status: string;
  creator_id: string;
};

export default function ActiveGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    const getGames = async () => {
      setLoading(true);
      try {
        const games = await fetchActiveGames(user!.id);
        setGames(games);
      } catch (err) {
        console.error("Error fetching active games:", err);
        setError("Failed to fetch active games. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    getGames();
  }, [user]);

  const joinGame = async (gameId: string) => {
    try {
      if (!user?.id) {
        setError("You must be logged in to join a game.");
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

      if (error) throw error;
      if (!data) throw new Error("No data returned from update");

      router.push(`/tic-tac-toe/${gameId}`);
    } catch (err) {
      console.error("Error joining game:", err);
      setError("Failed to join the game. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Active Games</h1>
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin mr-2" />
            <span>Loading games...</span>
          </div>
        ) : error ? (
          <div className="text-red-400 flex items-center justify-center">
            <AlertCircle className="mr-2" />
            <span>{error}</span>
          </div>
        ) : games.length === 0 ? (
          <p className="text-center text-gray-400">
            No active games available.
          </p>
        ) : (
          <ul className="space-y-4">
            <AnimatePresence>
              {games.map((game) => (
                <motion.li
                  key={game.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    onClick={() => joinGame(game.id)}
                    className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-between"
                    aria-label={`Join game ${game.id}`}
                  >
                    <span>Game ID: {game.id}</span>
                    <GamepadIcon className="ml-2" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
        <Link
          href="/"
          className="text-center mt-6 text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center"
        >
          <ArrowLeft className="mr-2" />
          <span>Back to Home</span>
        </Link>
      </motion.div>
    </div>
  );
}
