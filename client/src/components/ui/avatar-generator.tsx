import React from 'react';

// Kedi avatarları - 24 farklı renk ve desen kombinasyonu
const catAvatars = [
  // Siamese kediler
  {
    id: 1,
    body: '#F5DEB3',
    face: '#8B4513',
    ears: '#654321',
    eyes: '#4169E1',
    nose: '#FF69B4'
  },
  {
    id: 2,
    body: '#2F2F2F',
    face: '#2F2F2F',
    ears: '#1C1C1C',
    eyes: '#FFD700',
    nose: '#FF69B4'
  },
  {
    id: 3,
    body: '#F5DEB3',
    face: '#F5DEB3',
    ears: '#DEB887',
    eyes: '#4169E1',
    nose: '#FF69B4'
  },
  {
    id: 4,
    body: '#8B4513',
    face: '#8B4513',
    ears: '#654321',
    eyes: '#32CD32',
    nose: '#FF69B4'
  },
  {
    id: 5,
    body: '#F5DEB3',
    face: '#8B4513',
    ears: '#654321',
    eyes: '#FFD700',
    nose: '#FF69B4'
  },
  {
    id: 6,
    body: '#654321',
    face: '#654321',
    ears: '#4A4A4A',
    eyes: '#FFD700',
    nose: '#FF69B4'
  },
  {
    id: 7,
    body: '#808080',
    face: '#808080',
    ears: '#696969',
    eyes: '#4169E1',
    nose: '#FF69B4'
  },
  {
    id: 8,
    body: '#FFFFFF',
    face: '#FFFFFF',
    ears: '#FFB6C1',
    eyes: '#4169E1',
    nose: '#FF69B4'
  },
  {
    id: 9,
    body: '#2F2F2F',
    face: '#FFFFFF',
    ears: '#2F2F2F',
    eyes: '#FFD700',
    nose: '#FF69B4'
  },
  {
    id: 10,
    body: '#D2691E',
    face: '#D2691E',
    ears: '#8B4513',
    eyes: '#32CD32',
    nose: '#FF69B4'
  },
  {
    id: 11,
    body: '#FFFFFF',
    face: '#D2691E',
    ears: '#8B4513',
    eyes: '#4169E1',
    nose: '#FF69B4'
  },
  {
    id: 12,
    body: '#D2691E',
    face: '#D2691E',
    ears: '#8B4513',
    eyes: '#4169E1',
    nose: '#FF69B4'
  },
  {
    id: 13,
    body: '#2F2F2F',
    face: '#2F2F2F',
    ears: '#1C1C1C',
    eyes: '#FFD700',
    nose: '#FF69B4'
  },
  {
    id: 14,
    body: '#8B4513',
    face: '#FFFFFF',
    ears: '#8B4513',
    eyes: '#32CD32',
    nose: '#FF69B4'
  },
  {
    id: 15,
    body: '#2F2F2F',
    face: '#2F2F2F',
    ears: '#1C1C1C',
    eyes: '#FFD700',
    nose: '#FF69B4'
  },
  {
    id: 16,
    body: '#D2691E',
    face: '#D2691E',
    ears: '#8B4513',
    eyes: '#4169E1',
    nose: '#FF69B4'
  },
  {
    id: 17,
    body: '#808080',
    face: '#FFFFFF',
    ears: '#808080',
    eyes: '#4169E1',
    nose: '#FF69B4'
  },
  {
    id: 18,
    body: '#F5DEB3',
    face: '#F5DEB3',
    ears: '#DEB887',
    eyes: '#32CD32',
    nose: '#FF69B4'
  },
  {
    id: 19,
    body: '#FFFFFF',
    face: '#2F2F2F',
    ears: '#1C1C1C',
    eyes: '#4169E1',
    nose: '#FF69B4'
  },
  {
    id: 20,
    body: '#D2691E',
    face: '#D2691E',
    ears: '#8B4513',
    eyes: '#FFD700',
    nose: '#FF69B4'
  },
  {
    id: 21,
    body: '#654321',
    face: '#654321',
    ears: '#4A4A4A',
    eyes: '#32CD32',
    nose: '#FF69B4'
  },
  {
    id: 22,
    body: '#2F2F2F',
    face: '#FFFFFF',
    ears: '#2F2F2F',
    eyes: '#FFD700',
    nose: '#FF69B4'
  },
  {
    id: 23,
    body: '#8B4513',
    face: '#8B4513',
    ears: '#654321',
    eyes: '#4169E1',
    nose: '#FF69B4'
  },
  {
    id: 24,
    body: '#808080',
    face: '#808080',
    ears: '#696969',
    eyes: '#32CD32',
    nose: '#FF69B4'
  }
];

interface CatAvatarProps {
  avatarId: number;
  size?: number;
  className?: string;
}

export function CatAvatar({ avatarId, size = 48, className = '' }: CatAvatarProps) {
  const avatar = catAvatars.find(cat => cat.id === avatarId) || catAvatars[0];
  
  return (
    <div className={`inline-block rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="w-full h-full"
      >
        {/* Kedi kafası */}
        <circle cx="50" cy="55" r="35" fill={avatar.body} />
        
        {/* Kulaklar */}
        <polygon points="25,30 35,15 45,30" fill={avatar.ears} />
        <polygon points="55,30 65,15 75,30" fill={avatar.ears} />
        
        {/* Kulak içi */}
        <polygon points="30,25 35,18 40,25" fill={avatar.face} />
        <polygon points="60,25 65,18 70,25" fill={avatar.face} />
        
        {/* Yüz rengi (bazı kedilerde farklı) */}
        {avatar.face !== avatar.body && (
          <ellipse cx="50" cy="60" rx="25" ry="20" fill={avatar.face} />
        )}
        
        {/* Gözler */}
        <ellipse cx="42" cy="50" rx="4" ry="6" fill={avatar.eyes} />
        <ellipse cx="58" cy="50" rx="4" ry="6" fill={avatar.eyes} />
        
        {/* Göz bebekleri */}
        <ellipse cx="42" cy="50" rx="2" ry="4" fill="#000" />
        <ellipse cx="58" cy="50" rx="2" ry="4" fill="#000" />
        
        {/* Burun */}
        <polygon points="50,58 47,62 53,62" fill={avatar.nose} />
        
        {/* Ağız */}
        <path d="M 50 62 Q 45 66 40 64" stroke="#000" strokeWidth="1" fill="none" />
        <path d="M 50 62 Q 55 66 60 64" stroke="#000" strokeWidth="1" fill="none" />
        
        {/* Bıyıklar */}
        <line x1="25" y1="55" x2="35" y2="57" stroke="#000" strokeWidth="1" />
        <line x1="25" y1="60" x2="35" y2="60" stroke="#000" strokeWidth="1" />
        <line x1="65" y1="57" x2="75" y2="55" stroke="#000" strokeWidth="1" />
        <line x1="65" y1="60" x2="75" y2="60" stroke="#000" strokeWidth="1" />
      </svg>
    </div>
  );
}

// Rastgele avatar ID üretici
export function generateRandomAvatarId(): number {
  return Math.floor(Math.random() * 24) + 1;
}

// Kullanıcı ID'sine göre deterministik avatar
export function getUserAvatarId(userId: number): number {
  return ((userId - 1) % 24) + 1;
}

export { catAvatars };