import React from 'react';

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number;
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Traveler avatar: the uploaded photo when there is one, otherwise an ink monogram. */
export const Avatar: React.FC<AvatarProps> = ({ name, avatarUrl, size = 26 }) => {
  const box = { width: size, height: size };

  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="avatar-monogram" style={box} />;
  }

  return (
    <span className="avatar-monogram" style={{ ...box, fontSize: Math.round(size * 0.4) }}>
      {initialsOf(name)}
    </span>
  );
};
