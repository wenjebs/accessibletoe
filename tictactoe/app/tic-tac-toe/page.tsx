"use client";

import { useState } from "react";
// import { Button } from "@/components/ui/button";

type SquareValue = "X" | "O" | null;

function Square({
  value,
  onSquareClick,
}: {
  value: SquareValue;
  onSquareClick: () => void;
}) {
  return (
    <button
      className="w-20 h-20 border border-gray-400 text-4xl font-bold bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={onSquareClick}
    >
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
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default function TicTacToe() {
  const [squares, setSquares] = useState<SquareValue[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  function handleClick(i: number) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  function resetGame() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (squares.every((square) => square !== null)) {
    status = "It's a draw!";
  } else {
    status = `Next player: ${xIsNext ? "X" : "O"}`;
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
        <button
          onClick={resetGame}
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}
