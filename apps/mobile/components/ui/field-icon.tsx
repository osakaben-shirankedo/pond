import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  field: string;
  color?: string;
  size?: number;
};

export function FieldIcon({ field, color = '#000', size = 20 }: Props) {
  switch (field) {
    case 'programming': return <MaterialCommunityIcons name="code-tags"          size={size} color={color} />;
    case 'math':        return <MaterialCommunityIcons name="sigma"               size={size} color={color} />;
    case 'english':     return <Ionicons               name="language"            size={size} color={color} />;
    case 'art':         return <Ionicons               name="color-palette-outline" size={size} color={color} />;
    case 'music':       return <Ionicons               name="musical-notes-outline" size={size} color={color} />;
    case 'science':     return <MaterialCommunityIcons name="flask-outline"       size={size} color={color} />;
    case 'physics':     return <MaterialCommunityIcons name="atom"                size={size} color={color} />;
    case 'chemistry':   return <MaterialCommunityIcons name="beaker-outline"      size={size} color={color} />;
    case 'biology':     return <MaterialCommunityIcons name="leaf"                size={size} color={color} />;
    case 'history':     return <MaterialCommunityIcons name="book-open-outline"   size={size} color={color} />;
    case 'geography':   return <MaterialCommunityIcons name="earth"               size={size} color={color} />;
    case 'japanese':    return <MaterialCommunityIcons name="pen"                 size={size} color={color} />;
    case 'ethics':      return <MaterialCommunityIcons name="head-lightbulb-outline" size={size} color={color} />;
    case 'economics':   return <MaterialCommunityIcons name="chart-line"          size={size} color={color} />;
    default:            return <Ionicons               name="star-outline"        size={size} color={color} />;
  }
}
