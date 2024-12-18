"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../utils/supabase/supabaseClient";
import { useUser } from "../../context/userContext";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";

type SquareValue = "X" | "O" | null;

function Square({
  value,
  onSquareClick,
  disabled,
}: {
  value: SquareValue;
  onSquareClick: () => void;
  disabled: boolean;
}) {
  return (
    <motion.button
      className={`w-24 h-24 bg-gray-700 rounded-lg text-4xl font-bold flex items-center justify-center
                ${value === "X" ? "text-blue-400" : "text-red-400"}
                ${
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-gray-600 transition-colors duration-200"
                }`}
      onClick={onSquareClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      aria-label={value ? `Square with ${value}` : "Empty square"}
    >
      {value}
    </motion.button>
  );
}

function calculateWinner(squares: SquareValue[]): SquareValue {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

type GameData = {
  status: string;
  id: string;
  squares: SquareValue[];
  x_is_next: boolean;
  creator_id: string;
  opponent_id: string | null;
};

function speakMessage(message: string) {
  // Check if speech synthesis is supported
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.voice = window.speechSynthesis.getVoices()[0];
    utterance.volume = 0.8;
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }
}

// Position description helper
function getPositionDescription(index: number): string {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  return `row ${row}, column ${col}`;
}

export default function Game() {
  const params = useParams();
  const gameId = params.id as string;
  const user = useUser();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [squares, setSquares] = useState<SquareValue[]>(Array(9).fill(null));
  const prevSquaresRef = useRef<SquareValue[]>(Array(9).fill(null)); // Use useRef for previous squares
  const [xIsNext, setXIsNext] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGame = async () => {
      const { data, error } = await supabase
        .from("tictactoe_games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (error) {
        console.error("Error fetching game:", error);
        return;
      }

      if (data) {
        setGameData(data);
        setSquares(data.squares);
        prevSquaresRef.current = data.squares; // Initialize previous squares
        setXIsNext(data.x_is_next);
      }
      setLoading(false);
    };

    fetchGame();

    const channel = supabase
      .channel(`game_${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tictactoe_games",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          console.log("Real-time update received:", payload);
          const newData = payload.new as GameData;

          // If status changed from waiting to started, announce it
          if (gameData?.status === "waiting" && newData.status === "started") {
            speakMessage(
              "A player has joined the game. The game will now begin!"
            );
          }

          // Determine if opponent made a move
          if (gameData && newData.squares) {
            const moveIndex = findMoveIndex(
              prevSquaresRef.current,
              newData.squares
            );
            if (moveIndex !== -1) {
              const player = newData.x_is_next ? "O" : "X"; // Since x_is_next has been toggled
              const position = getPositionDescription(moveIndex);
              speakMessage(`Opponent ${player} placed at ${position}`);
            }
          }

          // Update states and ref
          setGameData(newData);
          setSquares(newData.squares);
          setXIsNext(newData.x_is_next);
          prevSquaresRef.current = newData.squares; // Update previous squares
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, gameData?.status]);

  const isCreator = user && gameData && user.id === gameData.creator_id;

  useEffect(() => {
    if (gameData && gameData.status === "waiting" && !isCreator) {
      const joinGame = async () => {
        const { error } = await supabase
          .from("tictactoe_games")
          .update({ status: "started", opponent_id: user?.id })
          .eq("id", gameId);

        if (error) {
          console.error("Error joining game:", error);
        }
      };

      joinGame();
    }
  }, [gameData, isCreator, gameId, user]);

  const canMove = () => {
    if (!user || !gameData) return false;

    const isCreator = user.id === gameData.creator_id;
    const isOpponent = user.id === gameData.opponent_id;

    return (
      (isCreator && gameData.x_is_next) || (isOpponent && !gameData.x_is_next)
    );
  };

  const findMoveIndex = (
    oldSquares: SquareValue[],
    newSquares: SquareValue[]
  ): number => {
    for (let i = 0; i < 9; i++) {
      if (oldSquares[i] !== newSquares[i]) {
        return i;
      }
    }
    return -1;
  };

  const handleClick = async (i: number) => {
    if (
      calculateWinner(squares) ||
      squares[i] ||
      !canMove() ||
      gameData?.status !== "started"
    ) {
      return;
    }

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    const position = getPositionDescription(i);

    // Announce the move
    speakMessage(`You placed at ${position}`);

    const winner = calculateWinner(nextSquares);
    if (winner) {
      speakMessage(`${winner} wins the game!`);
    }

    setSquares(nextSquares);
    setXIsNext(!xIsNext);

    const { error } = await supabase
      .from("tictactoe_games")
      .update({
        squares: nextSquares,
        x_is_next: !xIsNext,
        ...(winner && { status: "completed" }),
      })
      .eq("id", gameId);

    if (error) {
      console.error("Error updating game:", error);
    }
  };

  const winnerResult = calculateWinner(squares);
  const status = winnerResult
    ? `Game Over - Winner: ${winnerResult}`
    : gameData?.status === "completed"
    ? "Game Over - Draw"
    : gameData?.status === "waiting"
    ? "Waiting for opponent..."
    : canMove()
    ? "Your turn!"
    : "Opponent's turn...";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading game...</span>
      </div>
    );
  }

  if (isCreator && gameData?.status === "waiting") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 p-8 rounded-lg shadow-lg"
        >
          <h1 className="text-3xl font-bold mb-4 text-center">
            Waiting for another player to join...
          </h1>
          <p className="text-center mb-4">Share this game ID with a friend:</p>
          <div className="bg-gray-700 p-2 rounded text-center font-mono">
            {gameId}
          </div>
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-8 rounded-lg shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-4 text-center">Tic Tac Toe</h1>
        <div
          className="mb-4 text-xl font-semibold text-center"
          aria-live="polite"
        >
          {status}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {squares.map((value, i) => (
            <Square
              key={i}
              value={value}
              onSquareClick={() => handleClick(i)}
              disabled={!canMove() || gameData?.status !== "started"}
            />
          ))}
        </div>
        <Link
          href="/"
          className="block text-center mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          Back to home
        </Link>
      </motion.div>
    </div>
  );
}
