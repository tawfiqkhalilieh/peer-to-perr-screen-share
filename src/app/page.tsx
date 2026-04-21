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
    router.push(`host/?id=${newSessionId}`);
  };

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId.trim()) {
      router.push(`join/?id=${sessionId.trim().toUpperCase()}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-gray-900 text-white selection:bg-blue-500/30">
      <div className="z-10 max-w-4xl w-full flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          WebScreen
        </h1>
        <p className="text-lg md:text-xl mb-16 text-gray-400 max-w-2xl font-medium leading-relaxed">
          The simplest way to share your iPad screen to any computer. 
          <span className="block mt-2 opacity-80 text-sm">No software, no accounts, just instant peer-to-peer streaming.</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl px-4">
          {/* HOST SECTION */}
          <div className="group relative flex flex-col p-8 bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 shadow-xl hover:shadow-blue-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 self-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-3 text-white">Start Sharing</h2>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              Generate a unique session and start broadcasting your screen securely.
            </p>
            <button
              onClick={handleStartSession}
              className="mt-auto w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
            >
              Launch Session
            </button>
          </div>

          {/* JOIN SECTION */}
          <div className="group relative flex flex-col p-8 bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-700 hover:border-green-500/50 transition-all duration-300 shadow-xl hover:shadow-green-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 self-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-3 text-white">Join Session</h2>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              Enter a session ID to view a shared screen in full screen mode.
            </p>
            <form onSubmit={handleJoinSession} className="flex flex-col gap-3 mt-auto w-full">
              <input
                type="text"
                placeholder="Enter Session ID"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="bg-gray-700/50 border border-gray-600 rounded-2xl py-4 px-6 text-white text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-green-600/20 active:scale-95 transition-all"
              >
                Connect Now
              </button>
            </form>
          </div>
        </div>
        
        <p className="mt-16 text-gray-500 text-xs">
          Built for iPadOS & Modern Browsers • Fully Peer-to-Peer
        </p>
      </div>
    </main>
  );
}
