import { useState, useEffect } from 'react';
import { gameService } from '../services/api';

export function useGameStats() {
  const [stats, setStats] = useState<{ activePlayers: number; activeGames: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await gameService.getStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch game stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);

    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error };
}
