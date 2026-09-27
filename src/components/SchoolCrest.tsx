import React, { useState, useEffect } from 'react';

interface SchoolCrestProps {
  customLogoUrl?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  schoolName?: string;
  schoolId?: string;
}

export function formatLogoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Convert Google Drive view links to direct high-speed CDN thumbnail images
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}=w800`;
  }
  const driveIdMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?.*id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}=w800`;
  }
  // If user entered drive thumbnail link directly, upgrade to lh3
  const driveThumbMatch = trimmed.match(/drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/);
  if (driveThumbMatch && driveThumbMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveThumbMatch[1]}=w800`;
  }

  return trimmed;
}

export const SchoolCrest: React.FC<SchoolCrestProps> = ({
  customLogoUrl,
  className = '',
  size = 'md',
  schoolName = 'Vinisitahan Integrated School',
  schoolId = '502996',
}) => {
  const [imageError, setImageError] = useState(false);
  const formattedUrl = formatLogoUrl(customLogoUrl);

  // Crucial: Reset imageError whenever the logo URL changes
  useEffect(() => {
    setImageError(false);
  }, [customLogoUrl]);

  // Size definitions in pixels
  const sizeMap = {
    sm: { container: 'w-10 h-10', px: 40 },
    md: { container: 'w-16 h-16 sm:w-20 sm:h-20', px: 80 },
    lg: { container: 'w-24 h-24 sm:w-28 sm:h-28', px: 112 },
    xl: { container: 'w-32 h-32 sm:w-36 sm:h-36', px: 144 },
  };

  // If there's a custom logo that hasn't errored out, render it nicely
  if (formattedUrl && !imageError) {
    return (
      <div
        id="school-crest-custom"
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden border-2 border-amber-400/80 shadow-md bg-white ${sizeMap[size].container} ${className}`}
      >
        <img
          key={formattedUrl}
          src={formattedUrl}
          alt={`${schoolName} Official Logo`}
          className="w-full h-full object-contain p-0.5"
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Official high-fidelity vector seal for Vinisitahan Integrated School
  return (
    <div
      id="school-crest-vector"
      className={`relative inline-flex items-center justify-center select-none rounded-full shadow-md bg-white border border-amber-400/40 p-0.5 ${sizeMap[size].container} ${className}`}
      title={`${schoolName} (ID: ${schoolId}) Official Seal`}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="visGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="visBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="visRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          {/* Circular path for top text */}
          <path
            id="topTextPath"
            d="M 22, 100 A 78,78 0 1,1 178,100"
            fill="none"
          />
          {/* Circular path for bottom text */}
          <path
            id="bottomTextPath"
            d="M 178, 100 A 78,78 0 0,1 22,100"
            fill="none"
          />
        </defs>

        {/* Outer Gold Rope Ring */}
        <circle cx="100" cy="100" r="97" fill="none" stroke="url(#visGoldGrad)" strokeWidth="3" />
        <circle cx="100" cy="100" r="94" fill="none" stroke="#FDE68A" strokeWidth="1" strokeDasharray="3 2" />

        {/* Outer Deep Blue Banner Ring */}
        <circle cx="100" cy="100" r="91" fill="url(#visBlueGrad)" />

        {/* Circular text */}
        <text fill="#FEF3C7" fontSize="10.8" fontWeight="bold" letterSpacing="1.2">
          <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
            VINISITAHAN INTEGRATED SCHOOL
          </textPath>
        </text>

        <text fill="#FCD34D" fontSize="9.5" fontWeight="bold" letterSpacing="1.5">
          <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
            • DONSOL WEST II • ID 502996 •
          </textPath>
        </text>

        {/* Inner Gold Border & Shield background */}
        <circle cx="100" cy="100" r="66" fill="#FFFFFF" stroke="url(#visGoldGrad)" strokeWidth="3" />
        <circle cx="100" cy="100" r="62" fill="#F8FAFC" />

        {/* Rays of enlightenment / sun */}
        <g opacity="0.25" stroke="#F59E0B" strokeWidth="1.5">
          <line x1="100" y1="52" x2="100" y2="42" />
          <line x1="134" y1="66" x2="141" y2="59" />
          <line x1="66" y1="66" x2="59" y2="59" />
          <line x1="148" y1="100" x2="158" y2="100" />
          <line x1="52" y1="100" x2="42" y2="100" />
        </g>

        {/* Laurel Wreath */}
        <g stroke="#15803D" fill="#22C55E" opacity="0.85">
          {/* Left Leaves */}
          <path d="M 52,118 C 46,105 50,88 60,78 C 58,86 60,98 66,106 Z" />
          <path d="M 56,128 C 48,120 48,110 56,100 C 58,108 62,116 68,122 Z" />
          {/* Right Leaves */}
          <path d="M 148,118 C 154,105 150,88 140,78 C 142,86 140,98 134,106 Z" />
          <path d="M 144,128 C 152,120 152,110 144,100 C 142,108 138,116 132,122 Z" />
        </g>

        {/* Central Heraldic Elements */}
        {/* Open Book of Knowledge */}
        <path
          d="M 100,126 C 92,122 78,120 66,125 L 66,104 C 78,99 92,101 100,106 C 108,101 122,99 134,104 L 134,125 C 122,120 108,122 100,126 Z"
          fill="#EFF6FF"
          stroke="#1E3A8A"
          strokeWidth="2"
        />
        <line x1="100" y1="106" x2="100" y2="126" stroke="#1E3A8A" strokeWidth="2" />
        {/* Book lines */}
        <line x1="74" y1="110" x2="92" y2="114" stroke="#93C5FD" strokeWidth="1.2" />
        <line x1="74" y1="116" x2="92" y2="120" stroke="#93C5FD" strokeWidth="1.2" />
        <line x1="108" y1="114" x2="126" y2="110" stroke="#93C5FD" strokeWidth="1.2" />
        <line x1="108" y1="120" x2="126" y2="116" stroke="#93C5FD" strokeWidth="1.2" />

        {/* Blazing Torch of Wisdom */}
        {/* Flame */}
        <path
          d="M 100,56 C 106,63 111,70 107,76 C 104,80 100,77 98,81 C 97,76 93,73 95,68 C 96,62 100,56 100,56 Z"
          fill="url(#visRedGrad)"
        />
        <path
          d="M 100,64 C 103,68 105,73 103,76 C 101,78 99,76 98,78 C 98,75 96,73 97,70 C 98,67 100,64 100,64 Z"
          fill="#FDE047"
        />
        {/* Torch handle */}
        <polygon points="95,81 105,81 103,101 97,101" fill="#B45309" stroke="#78350F" strokeWidth="1" />
        <rect x="94" y="80" width="12" height="3" rx="1" fill="#F59E0B" />

        {/* Mini 3 stars (Philippine symbolism: Luzon, Visayas, Mindanao) */}
        <polygon points="100,43 101.5,47.5 106,47.5 102.5,50 104,54 100,51.5 96,54 97.5,50 94,47.5 98.5,47.5" fill="#EAB308" />
        <polygon points="80,50 81.2,53.5 85,53.5 82,55.5 83.2,59 80,57 76.8,59 78,55.5 75,53.5 78.8,53.5" fill="#EAB308" />
        <polygon points="120,50 121.2,53.5 125,53.5 122,55.5 123.2,59 120,57 116.8,59 118,55.5 115,53.5 118.8,53.5" fill="#EAB308" />

        {/* Small Year / Foundation Ribbon */}
        <rect x="76" y="132" width="48" height="12" rx="3" fill="#1E3A8A" />
        <text x="100" y="141" fill="#FEF08A" fontSize="7.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">
          DEPED • SORSOGON
        </text>
      </svg>
    </div>
  );
};
