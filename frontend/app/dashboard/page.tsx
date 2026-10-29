
"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("Loading your profile...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        window.location.replace("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/users/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401 || response.status === 403) {
          sessionStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        if (!response.ok) {
          setMessage("Could not load your profile. Please try again.");
          return;
        }

        const data: User = await response.json();
        setUser(data);
      } catch {
        setMessage("Backend connection failed. Check the server.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("access_token");
    window.location.replace("/login");
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between">
        <h1 className="text-2xl font-bold">
          V-Fit <span className="text-purple-400">AI</span>
        </h1>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-gray-700 px-4 py-2 hover:bg-gray-800"
        >
          Logout
        </button>
      </header>

      <section className="mx-auto mt-12 max-w-5xl">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
          {loading ? (
            <p className="text-gray-300">{message}</p>
          ) : user ? (
            <>
              <p className="text-sm text-purple-400">
                YOUR PERSONAL STYLE SPACE
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Welcome, {user.name}!
              </h2>

              <p className="mt-2 text-gray-400">
                Your V-Fit AI journey starts here.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
                  <p className="text-sm text-gray-400">Full Name</p>
                  <p className="mt-2 text-lg font-semibold">
                    {user.name}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
                  <p className="text-sm text-gray-400">Email Address</p>
                  <p className="mt-2 break-all text-lg font-semibold">
                    {user.email}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
                  <p className="text-sm text-gray-400">User ID</p>
                  <p className="mt-2 text-lg font-semibold">
                    {user.id}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
                  <p className="text-sm text-gray-400">Account Status</p>
                  <p className="mt-2 text-lg font-semibold text-green-400">
                    Logged In
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-purple-900 bg-purple-950/30 p-5">
                <h3 className="text-xl font-semibold">
                  Your AI Style Assistant
                </h3>
                <p className="mt-2 text-gray-300">
                  Soon, you will be able to explore outfits,
                  get style recommendations, and try virtual looks.
                </p>
              </div>
            </>
          ) : (
            <div>
              <p className="text-red-300">{message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg bg-purple-600 px-4 py-2 hover:bg-purple-500"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
