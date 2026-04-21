'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Peer } from 'peerjs';

function JoinContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id') || '';

  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'AUTHENTICATING' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);

  const peerRef = useRef<Peer | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  const connectToSession = async (providedPassword = '') => {
    if (!sessionId) {
      setErrorMessage('No session ID found in URL.');
      setStatus('ERROR');
      return;
    }

    setStatus('AUTHENTICATING');
    setErrorMessage('');

    try {
      const peer = new Peer();
      peerRef.current = peer;
peer.on('open', () => {
  const conn = peer.connect(`web-screenshare-app-${sessionId}`);

  // Listen for incoming call from host
  peer.on('call', (call) => {
    console.log('Received call from host');
    call.answer(); // Answer with no stream

    call.on('stream', (remoteStream) => {
      console.log('Received stream from host');
      if (videoRef.current) {
        videoRef.current.srcObject = remoteStream;
        setStatus('CONNECTED');
      }
    });

    call.on('error', (err) => {
      console.error('Call error:', err);
      setErrorMessage('Failed to receive video stream.');
      setStatus('ERROR');
    });
  });

  conn.on('open', () => {
    conn.send({ type: 'auth', password: providedPassword });
  });

  conn.on('data', (data: any) => {
    if (data.type === 'auth-success') {
      setStatus('CONNECTING');
      // Host will now call us
    } else if (data.type === 'auth-failed') {
            setErrorMessage(data.message || 'Incorrect password');
            setStatus('IDLE');
            peer.destroy();
          }
        });

        conn.on('error', (err) => {
          console.error('Connection error:', err);
          setErrorMessage('Could not connect to host.');
          setStatus('ERROR');
        });
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        setErrorMessage('Failed to connect to signaling server.');
        setStatus('ERROR');
      });

    } catch (err) {
      console.error('Connection failed:', err);
      setErrorMessage('Unexpected error occurred.');
      setStatus('ERROR');
    }
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  if (!sessionId && status !== 'ERROR') {
    return (
      <div className="z-10 max-w-md w-full p-8 bg-gray-800 rounded-xl border border-red-500 flex flex-col gap-6 items-center">
        <h1 className="text-2xl font-bold text-red-400">Error: No Session ID</h1>
        <p className="text-gray-400 text-center">Please enter a valid session ID to join.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-lg transition-all"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <>
      {status === 'IDLE' && (
        <div className="z-10 max-w-md w-full p-8 bg-gray-800 rounded-xl border border-gray-700 flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-center text-blue-400">Join Session: {sessionId}</h1>
          <p className="text-gray-400 text-center">Enter the password if this session is locked.</p>
          
          <div className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Password (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            {errorMessage && <p className="text-red-400 text-sm text-center">{errorMessage}</p>}
            <button
              onClick={() => connectToSession(password)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Connect
            </button>
          </div>
        </div>
      )}

      {(status === 'AUTHENTICATING' || status === 'CONNECTING') && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">{status === 'AUTHENTICATING' ? 'Authenticating...' : 'Connecting to stream...'}</p>
        </div>
      )}

      {status === 'CONNECTED' && (
        <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-black group">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="max-w-full max-h-full object-contain"
          />
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-4">
            <button
              onClick={toggleFullScreen}
              className="bg-blue-600/80 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full backdrop-blur-sm transition-all"
            >
              {isFullScreen ? 'Exit Full Screen' : 'Go Full Screen'}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600/80 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full backdrop-blur-sm transition-all"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {status === 'ERROR' && (
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl border border-red-500 flex flex-col items-center gap-4">
          <p className="text-red-400 font-bold">Connection Failed</p>
          <p className="text-gray-300 text-center">{errorMessage}</p>
          <button
            onClick={() => setStatus('IDLE')}
            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-lg transition-all"
          >
            Try Again
          </button>
        </div>
      )}
    </>
  );
}

export default function JoinPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <Suspense fallback={<div className="text-gray-400">Loading session...</div>}>
        <JoinContent />
      </Suspense>
    </main>
  );
}
