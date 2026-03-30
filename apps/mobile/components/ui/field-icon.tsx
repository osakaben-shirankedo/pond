import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  field: string;
  color?: string;
  size?: number;
};

export function FieldIcon({ field, color = '#000', size = 20 }: Props) {
  switch (field) {
    case 'programming': return <MaterialCommunityIcons name="code-tags" size={size} color={color} />;
    case 'math': return <MaterialCommunityIcons name="sigma" size={size} color={color} />;
    case 'english': return <Ionicons name="language" size={size} color={color} />;
    case 'art': return <Ionicons name="color-palette-outline" size={size} color={color} />;
    case 'music': return <Ionicons name="musical-notes-outline" size={size} color={color} />;
    case 'science': return <MaterialCommunityIcons name="flask-outline" size={size} color={color} />;
    default: return <Ionicons name="star-outline" size={size} color={color} />;
  }
}
