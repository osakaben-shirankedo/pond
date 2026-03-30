import { SEED_POND_INSTANCES } from './pond-instance';

export const POND_POINTS_KEY = 'pond_my_points';

// シードメンバーのポイント（固定値）
const SEED_MEMBER_POINTS: Record<string, number> = {
  // programming
  pa1: 340, pa2: 280, pa3: 420, pa4: 190,
  pb1: 310, pb2: 250, pb3: 380, pb4: 220,
  ps1: 95,  ps2: 140, ps3: 110, ps4: 75,
  pd1: 520, pd2: 480, pd3: 610, pd4: 440,
  // math
  ms1: 120, ms2: 90,  ms3: 155, ms4: 80,
  mb1: 105, mb2: 135, mb3: 70,  mb4: 95,
  ma1: 290, ma2: 350, ma3: 210, ma4: 400,
  md1: 540, md2: 490, md3: 580, md4: 460,
  // english
  ed1: 510, ed2: 430, ed3: 560, ed4: 395,
  ea1: 260, ea2: 310, ea3: 195, ea4: 280,
  es1: 85,  es2: 130, es3: 100, es4: 65,
  // art
  aa1: 245, aa2: 320, aa3: 185, aa4: 270,
  as1: 110, as2: 75,  as3: 145, as4: 90,
  // music
  mua1: 300, mua2: 240, mua3: 360, mua4: 210,
  mus1: 130, mus2: 85,  mus3: 160, mus4: 95,
  // science
  ssa1: 100, ssa2: 140, ssa3: 120, ssa4: 80,
  sca1: 280, sca2: 230, sca3: 350, sca4: 195,
};

export type RankedMember = {
  id: string;
  name: string;
  avatarId: string;
  isMe?: boolean;
  points: number;
  rank: number;
};

export function getRankingForPond(
  pondId: string,
  myPoints: number,
  myAvatarId: string = 'fishbowl'
): RankedMember[] {
  const instance = SEED_POND_INSTANCES.find((p) => p.pondId === pondId);
  if (!instance) return [];

  const seedMembers = instance.members.map((m) => ({
    id: m.id,
    name: m.name,
    avatarId: m.avatarId,
    isMe: false,
    points: SEED_MEMBER_POINTS[m.id] ?? 100,
  }));

  const me = {
    id: 'me',
    name: 'あなた',
    avatarId: myAvatarId,
    isMe: true,
    points: myPoints,
  };

  const sorted = [...seedMembers, me].sort((a, b) => b.points - a.points);
  return sorted.map((m, i) => ({ ...m, rank: i + 1 }));
}
