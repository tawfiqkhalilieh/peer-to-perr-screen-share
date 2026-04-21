'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [sessionId, setSessionId] = useState('');
  const router = useRouter();

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleStartSession = () => {
    const newSessionId = generateSessionId();
    router.push(`/host?id=${newSessionId}`);
  };

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId.trim()) {
      router.push(`/join?id=${sessionId.trim().toUpperCase()}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8 text-blue-400">Web Screen Share</h1>
        <p className="mb-12 text-center text-gray-400 max-w-md">
          Share your iPad screen to your computer instantly. No apps required.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
          <div className="flex flex-col p-8 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors">
            <h2 className="text-2xl font-semibold mb-4 text-blue-300">Share Screen</h2>
            <p className="text-gray-400 mb-6">Create a new session to start sharing your screen.</p>
            <button
              onClick={handleStartSession}
              className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Start Session
            </button>
          </div>

          <div className="flex flex-col p-8 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors">
            <h2 className="text-2xl font-semibold mb-4 text-green-300">Join Session</h2>
            <p className="text-gray-400 mb-6">Enter a session ID to view a shared screen.</p>
            <form onSubmit={handleJoinSession} className="flex flex-col gap-4 mt-auto">
              <input
                type="text"
                placeholder="Session ID (e.g. AB12CD)"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
