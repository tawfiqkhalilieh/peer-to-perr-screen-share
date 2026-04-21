'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Peer, DataConnection } from 'peerjs';

function HostContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id') || '';
  
  const [password, setPassword] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [peerId, setPeerId] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'READY' | 'SHARING' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  const [connections, setConnections] = useState<number>(0);

  const peerRef = useRef<Peer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dataConnectionsRef = useRef<Map<string, DataConnection>>(new Map());

  useEffect(() => {
    return () => {
      stopSharing();
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  const startSharing = async () => {
    if (!sessionId) {
      setErrorMessage('No session ID found in URL.');
      setStatus('ERROR');
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setErrorMessage('Screen sharing is not supported in this browser or requires an HTTPS connection.');
      setStatus('ERROR');
      return;
    }

    setStatus('CONNECTING');
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as any,
        audio: false
      });
      streamRef.current = stream;

      stream.getVideoTracks()[0].onended = () => {
        stopSharing();
      };

      const peer = new Peer(`web-screenshare-app-${sessionId}`);
      peerRef.current = peer;

      peer.on('open', (id) => {
        setPeerId(id);
        setStatus('SHARING');
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        if (err.type === 'unavailable-id') {
          setErrorMessage('Session ID already in use. Try a different one.');
        } else {
          setErrorMessage('Failed to connect to signaling server.');
        }
        setStatus('ERROR');
      });

      peer.on('connection', (conn) => {
        conn.on('data', (data: any) => {
          if (data && data.type === 'auth') {
            if (!isLocked || data.password === password) {
              conn.send({ type: 'auth-success' });
              dataConnectionsRef.current.set(conn.peer, conn);
              
              // Immediately call the viewer with the stream
              if (streamRef.current) {
                console.log('Calling viewer:', conn.peer);
                peer.call(conn.peer, streamRef.current);
              }
            } else {
              conn.send({ type: 'auth-failed', message: 'Incorrect password' });
            }
          }
        });

        conn.on('close', () => {
          dataConnectionsRef.current.delete(conn.peer);
          setConnections(dataConnectionsRef.current.size);
        });

        setConnections(dataConnectionsRef.current.size + 1);
      });

      peer.on('call', (call) => {
        if (dataConnectionsRef.current.has(call.peer)) {
          call.answer(streamRef.current!);
        }
      });

    } catch (err) {
      console.error('Sharing failed:', err);
      setErrorMessage('Could not start screen sharing. Please check permissions.');
      setStatus('ERROR');
    }
  };

  const stopSharing = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    dataConnectionsRef.current.clear();
    setConnections(0);
    setStatus('IDLE');
  };

  if (!sessionId && status !== 'ERROR') {
      return (
        <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-400">Error: No Session ID</h1>
            <p className="text-gray-400 mt-4">Please return to the home page and start a new session.</p>
        </div>
      )
  }

  return (
    <div className="z-10 max-w-2xl w-full flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold text-blue-400">Host Session: {sessionId}</h1>

        {status === 'IDLE' && (
          <div className="w-full p-8 bg-gray-800 rounded-xl border border-gray-700 flex flex-col gap-6">
            <h2 className="text-xl font-semibold">Session Settings</h2>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLocked}
                  onChange={(e) => setIsLocked(e.target.checked)}
                  className="w-5 h-5 accent-blue-500"
                />
                <span className="ml-2 text-gray-300">Lock with password</span>
              </label>
            </div>

            {isLocked && (
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            )}

            <button
              onClick={startSharing}
              disabled={isLocked && !password}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Start Screen Sharing
            </button>
          </div>
        )}

        {status === 'SHARING' && (
          <div className="w-full p-8 bg-gray-800 rounded-xl border border-green-500 flex flex-col items-center gap-6">
            <div className="animate-pulse flex items-center gap-2 text-green-400">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="font-bold">LIVE SHARING</span>
            </div>
            
            <p className="text-center text-gray-400">
              Your screen is being shared. Give the session ID below to your computer.
            </p>

            <div className="bg-gray-700 p-6 rounded-lg text-center w-full relative group">
              <p className="text-sm text-gray-400 mb-2 uppercase tracking-widest font-bold">Session ID</p>
              <p className="text-5xl font-bold text-blue-400 tracking-widest">{sessionId}</p>
              <button
                onClick={() => {
                  const url = `${window.location.origin}${window.location.pathname.replace('/host', '/join')}?id=${sessionId}`;
                  navigator.clipboard.writeText(url);
                  alert('Join link copied to clipboard!');
                }}
                className="mt-4 text-xs bg-gray-600 hover:bg-gray-500 text-gray-200 py-1 px-3 rounded transition-all"
              >
                Copy Join Link
              </button>
            </div>

            <div className="flex items-center gap-4 text-gray-300">
              <p>Connected Viewers: <span className="text-white font-bold">{connections}</span></p>
              <p>Privacy: <span className="text-white font-bold">{isLocked ? 'Locked' : 'Public'}</span></p>
            </div>

            <button
              onClick={stopSharing}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all w-full"
            >
              Stop Sharing
            </button>
          </div>
        )}

        {status === 'CONNECTING' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400">Initializing session...</p>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="w-full p-8 bg-gray-800 rounded-xl border border-red-500 flex flex-col items-center gap-4">
            <p className="text-red-400 font-bold">Error</p>
            <p className="text-gray-300 text-center">{errorMessage}</p>
            <button
              onClick={() => setStatus('IDLE')}
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-lg transition-all"
            >
              Try Again
            </button>
          </div>
        )}
    </div>
  );
}

export default function HostPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <Suspense fallback={<div className="text-gray-400">Loading session...</div>}>
        <HostContent />
      </Suspense>
    </main>
  );
}
