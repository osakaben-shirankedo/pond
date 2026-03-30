import { useState } from 'react';
import { type Challenge, CHALLENGES } from '@/models/challenges';

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>(CHALLENGES);

  const toggleJoin = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, joined: !c.joined, participants: c.joined ? c.participants - 1 : c.participants + 1 }
          : c
      )
    );
  };

  return { challenges, toggleJoin };
}
