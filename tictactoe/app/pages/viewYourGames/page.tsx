"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../utils/supabase/supabaseClient";
import { useUser } from "../../context/userContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ArrowLeft,
  Clock,
  CheckCircle,
  Hourglass,
} from "lucide-react";

type Game = {
  id: string;
  status: string;
  x_is_next: boolean;
  created_at: string;
};

export default function YourGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();

  useEffect(() => {
    const fetchYourGames = async () => {
      if (!user) return;

      setLoading(true);
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
      setLoading(false);
    };

    fetchYourGames();

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

  const getGameStatus = (game: Game) => {
    switch (game.status) {
      case "completed":
        return { text: "Game Over", icon: CheckCircle };
      case "waiting":
        return { text: "Waiting for opponent", icon: Hourglass };
      default:
        return {
          text: `In Progress - ${game.x_is_next ? "X" : "O"}'s turn`,
          icon: Clock,
        };
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
        <h1 className="text-3xl font-bold mb-6 text-center">
          Your Active Games
        </h1>
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin mr-2" />
            <span>Loading your games...</span>
          </div>
        ) : games.length === 0 ? (
          <p className="text-center text-gray-400">
            You don&apos;t have any active games.
          </p>
        ) : (
          <ul className="space-y-4">
            <AnimatePresence>
              {games.map((game) => {
                const status = getGameStatus(game);
                return (
                  <motion.li
                    key={game.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                  >
                    <Link href={`/tic-tac-toe/${game.id}`} className="block">
                      <div className="flex flex-col gap-2">
                        <span className="font-medium">Game ID: {game.id}</span>
                        <span className="text-sm text-gray-300 flex items-center">
                          <status.icon className="mr-2 h-4 w-4" />
                          {status.text}
                        </span>
                        <span className="text-xs text-gray-400">
                          Created:{" "}
                          {new Date(game.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
          >
            <ArrowLeft className="mr-2" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
