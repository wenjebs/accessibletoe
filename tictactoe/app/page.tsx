"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-500 text-white p-2 rounded"
      >
        Skip to main content
      </a>
      <header className="p-4">
        <h1 className="text-4xl font-bold text-center mb-8">Accessible Toes</h1>
      </header>
      <main id="main-content" className="container mx-auto px-4">
        <div className="relative">
          <Image
            src="/placeholder.svg"
            alt="Space background"
            width={800}
            height={400}
            className="w-full h-64 object-cover rounded-lg mb-8"
          />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-white text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Welcome to accessible toes!
          </motion.div>
        </div>
        <nav>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { href: "/pages/createGame", text: "Create Game", icon: "🚀" },
              {
                href: "/pages/viewGames",
                text: "View Other Games",
                icon: "🌌",
              },
              {
                href: "/pages/viewYourGames",
                text: "View Your Active Games",
                icon: "🎮",
              },
            ].map((link, index) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group block p-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={link.text}
                >
                  <motion.div
                    className="flex flex-col items-center space-y-4"
                    whileHover={{ y: -5 }}
                  >
                    <span className="text-4xl">{link.icon}</span>
                    <span className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                      {link.text}
                    </span>
                    <div className="w-full h-1 bg-blue-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
                  </motion.div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <footer className="mt-12 text-center p-4 text-sm text-gray-400">
        <p>&copy; 2024 Accessible Toes. All rights reserved.</p>
      </footer>
    </div>
  );
}
