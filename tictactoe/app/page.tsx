import Image from "next/image";
import Link from "next/link";
export default function Home() {
  return (
    <main>
      <Link
        className="mt-4 rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        href={`/tic-tac-toe`}
      >
        Go to Tic Tac Toe
      </Link>
      <Link
        className="mt-4 rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        href={`/socket`}
      >
        Go to Socket
      </Link>
    </main>
  );
}
