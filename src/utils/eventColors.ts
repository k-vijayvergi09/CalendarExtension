export const eventColors = [
  'bg-blue-100 text-blue-900',
  'bg-purple-100 text-purple-900',
  'bg-pink-100 text-pink-900',
  'bg-yellow-100 text-yellow-900',
  'bg-green-100 text-green-900',
  'bg-orange-100 text-orange-900',
];

const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
};

export const getEventColor = (eventId: string) => {
  const colorIndex = Math.abs(hashString(eventId)) % eventColors.length;
  return eventColors[colorIndex];
}; 