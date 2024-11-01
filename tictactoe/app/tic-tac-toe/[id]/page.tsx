"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../utils/supabase/supabaseClient";
import { useUser } from "../../context/userContext";
import Link from "next/link";

type SquareValue = "X" | "O" | null;

function Square({
  value,
  onSquareClick,
}: {
  value: SquareValue;
  onSquareClick: () => void;
}) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
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
};
export default function Game() {
  const params = useParams();
  const gameId = params.id as string;
  const user = useUser();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [squares, setSquares] = useState<SquareValue[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch game data
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
        setXIsNext(data.x_is_next);
      }
      setLoading(false);
    };

    fetchGame();

    // Set up real-time subscription
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
          console.log("Real-time update received:", payload); // Debugging log
          setGameData(payload.new as GameData);
          setSquares(payload.new.squares);
          setXIsNext(payload.new.x_is_next);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  // Determine if the user is the creator
  const isCreator = user && gameData && user.id === gameData.creator_id;

  useEffect(() => {
    if (gameData && gameData.status === "waiting" && !isCreator) {
      const joinGame = async () => {
        const { error } = await supabase
          .from("tictactoe_games")
          .update({ status: "started" })
          .eq("id", gameId);

        if (error) {
          console.error("Error joining game:", error);
        }
      };

      joinGame();
    }
  }, [gameData, isCreator, gameId]);
  const handleClick = async (i: number) => {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";

    // Update local state immediately
    setSquares(nextSquares);
    setXIsNext(!xIsNext);

    // Update the database
    const { error } = await supabase
      .from("tictactoe_games")
      .update({
        squares: nextSquares,
        x_is_next: !xIsNext,
      })
      .eq("id", gameId);

    if (error) {
      console.error("Error updating game:", error);
      // Optionally revert local state if there's an error
    }
  };

  const winner = calculateWinner(squares);
  const status = winner
    ? `Winner: ${winner}`
    : `Next player: ${xIsNext ? "X" : "O"}`;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isCreator && gameData?.status === "waiting") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4 text-center text-black">
            Waiting for another player to join...
          </h1>
          <p className="text-center">Share this game ID: {gameId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-center text-black">
          Tic Tac Toe
        </h1>
        <div className="mb-4 text-xl font-semibold text-center text-black">
          {status}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4 text-black">
          {squares.map((value, i) => (
            <Square
              key={i}
              value={value}
              onSquareClick={() => handleClick(i)}
            />
          ))}
        </div>
        <Link href={"/"}>Back to home</Link>
      </div>
    </div>
  );
}
