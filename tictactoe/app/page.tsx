"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { User, Loader2 } from "lucide-react";
import { supabase } from "./utils/supabase/supabaseClient";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [inputName, setInputName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    const storedName = localStorage.getItem("username");
    if (storedName) {
      setUsername(storedName);
    }

    const fetchUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUserId(data.user?.id || null);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (inputName.trim()) {
      setUsername(inputName.trim());
      localStorage.setItem("username", inputName.trim());
    }
    setIsSubmitting(false);
    console.log("Submittied");
  };

  if (!mounted) {
    return null;
  }

  if (!username) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <form
            onSubmit={handleSubmit}
            className="bg-gray-800 p-8 rounded-lg shadow-lg"
          >
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Enter your username
            </h2>
            <div className="relative mb-6">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full p-3 pl-10 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Username"
                required
                aria-label="Username"
                id="username"
              />
            </div>
            <motion.button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Submit"
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  const animationProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 1 },
      };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans" lang="en">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-500 text-white p-2 rounded focus:ring-2 focus:ring-white"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      <header className="p-4" role="banner">
        <h1 className="text-4xl font-bold text-center mb-8">Accessible Toes</h1>
        <p className="text-center">Welcome, {username}!</p>
      </header>

      <main
        id="main-content"
        className="container mx-auto px-4"
        role="main"
        aria-label="Main content"
      >
        <div className="relative">
          <Image
            src="/placeholder.svg"
            alt="Decorative space background image"
            width={800}
            height={400}
            className="w-full h-64 object-cover rounded-lg mb-8"
            priority
          />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-white text-center"
            {...animationProps}
          >
            <h2>Welcome to accessible toes!</h2>
          </motion.div>
        </div>

        <nav role="navigation" aria-label="Main navigation">
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6" role="menubar">
            {[
              {
                href: "/pages/createGame",
                text: "Create Game",
                icon: "🚀",
                description: "Start a new game",
              },
              {
                href: "/pages/viewGames",
                text: "View Other Games",
                icon: "🌌",
                description: "Join existing games",
              },
              {
                href: "/pages/viewYourGames",
                text: "View Your Active Games",
                icon: "🎮",
                description: "Continue your active games",
              },
            ].map((link) => (
              <li key={link.href} role="menuitem">
                <Link
                  href={link.href}
                  className="group block p-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={`${link.text} - ${link.description}`}
                >
                  <motion.div
                    className="flex flex-col items-center space-y-4"
                    whileHover={shouldReduceMotion ? {} : { y: -5 }}
                  >
                    <span className="text-4xl" role="img" aria-hidden="true">
                      {link.icon}
                    </span>
                    <span className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                      {link.text}
                    </span>
                    <div
                      className="w-full h-1 bg-blue-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"
                      aria-hidden="true"
                    />
                  </motion.div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>

      <footer
        className="mt-12 text-center p-4 text-sm text-gray-400"
        role="contentinfo"
      >
        <p>
          &copy; {new Date().getFullYear()} Accessible Toes. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
