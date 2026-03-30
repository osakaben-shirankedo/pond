import { Image, type ImageStyle, type StyleProp } from 'react-native';

// Static require map — dynamic paths are not supported in Metro bundler
const ICON_MAP: Record<string, number> = {
  fishbowl:    require('@/assets/profile_icons/icon-sheet-1-r1-c1.png'),
  coral:       require('@/assets/profile_icons/icon-sheet-1-r1-c2.png'),
  squid:       require('@/assets/profile_icons/icon-sheet-1-r1-c3.png'),
  turtle:      require('@/assets/profile_icons/icon-sheet-1-r1-c4.png'),
  diver:       require('@/assets/profile_icons/icon-sheet-1-r2-c1.png'),
  sailboat:    require('@/assets/profile_icons/icon-sheet-1-r2-c2.png'),
  orca:        require('@/assets/profile_icons/icon-sheet-1-r2-c3.png'),
  treasure:    require('@/assets/profile_icons/icon-sheet-1-r2-c4.png'),
  octopus:     require('@/assets/profile_icons/icon-sheet-1-r3-c1.png'),
  manta:       require('@/assets/profile_icons/icon-sheet-1-r3-c2.png'),
  submarine:   require('@/assets/profile_icons/icon-sheet-1-r3-c3.png'),
  deepfish:    require('@/assets/profile_icons/icon-sheet-1-r3-c4.png'),
  seacreature: require('@/assets/profile_icons/icon-sheet-1-r4-c1.png'),
  jellyfish:   require('@/assets/profile_icons/icon-sheet-1-r4-c2.png'),
  lighthouse:  require('@/assets/profile_icons/icon-sheet-1-r4-c3.png'),
  seahorse:    require('@/assets/profile_icons/icon-sheet-1-r4-c4.png'),
};

type Props = {
  presetId: string;
  size: number;
  style?: StyleProp<ImageStyle>;
};

export function AvatarSprite({ presetId, size, style }: Props) {
  const source = ICON_MAP[presetId] ?? ICON_MAP.fishbowl;
  return (
    <Image
      source={source}
      style={[{ width: size, height: size, borderRadius: size * 0.18 }, style]}
      resizeMode="contain"
    />
  );
}
