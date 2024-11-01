"use client";

import { useState } from "react";
import { supabase } from "../../utils/supabase/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/userContext";

export default function CreateGame() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const user = useUser();

  const createNewGame = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("tictactoe_games")
        .insert([
          {
            squares: Array(9).fill(null),
            x_is_next: true,
            status: "waiting",
            creator_id: user?.id ?? null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Redirect to the game page with the new game ID
      router.push(`/tic-tac-toe/${data.id}`);
    } catch (error) {
      console.error("Error creating game:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-black">
          Create New Game
        </h1>
        <button
          onClick={createNewGame}
          disabled={creating}
          className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
        >
          {creating ? "Creating..." : "Create New Game"}
        </button>
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
