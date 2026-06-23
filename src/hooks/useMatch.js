// src/hooks/useMatch.js
import { useEffect, useRef, useState } from 'react';
import {
  subscribeToMatch, addPoint, sideOut,
  undoLastPoint, rotateServer,
} from '../services/matchService';

export function useMatch(matchId) {
  const [match, setMatch]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!matchId) return;
    setLoading(true);
    unsubRef.current = subscribeToMatch(matchId, data => {
      setMatch(data);
      setLoading(false);
    });
    return () => unsubRef.current?.();
  }, [matchId]);

  const wrap = fn => async (...args) => {
    try { return await fn(...args); }
    catch (e) { setError(e.message); }
  };

  return {
    match,
    loading,
    error,
    scorePoint:  wrap(team => addPoint(matchId, team)),
    changeSide:  wrap(() => sideOut(matchId)),
    undo:        wrap(() => undoLastPoint(matchId)),
    nextServer:  wrap(() => rotateServer(matchId)),
  };
}
