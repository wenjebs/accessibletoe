"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/userContext";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import { createGame } from "@/app/services/gameService";

export default function CreateGame() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const user = useUser();

  const createNewGame = async () => {
    setCreating(true);
    try {
      const data = await createGame(user?.id ?? null);
      router.push(`/tic-tac-toe/${data.id}`);
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Failed to create game. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Create New Game</h1>
        <motion.button
          onClick={createNewGame}
          disabled={creating}
          className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {creating ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Plus size={20} />
              <span>Create New Game</span>
            </>
          )}
        </motion.button>
        <Link
          href="/"
          className="text-center mt-6 text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Back to Home</span>
        </Link>
      </motion.div>
    </div>
  );
}
