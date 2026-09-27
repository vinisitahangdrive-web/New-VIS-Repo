import React, { useState } from 'react';
import { User } from 'lucide-react';
import { PersonnelCategory } from '../types';

interface PersonnelAvatarProps {
  photoUrl?: string;
  name: string;
  category?: PersonnelCategory;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  ringClassName?: string;
}

export const getCategoryStyles = (category?: PersonnelCategory) => {
  switch (category) {
    case 'district':
      return {
        bg: 'from-amber-500 to-amber-700',
        text: 'text-amber-100',
        border: 'border-amber-400',
        ring: 'ring-amber-300',
        badge: 'bg-amber-100 text-amber-900 border-amber-300'
      };
    case 'district_admin_officer':
      return {
        bg: 'from-amber-600 to-orange-700',
        text: 'text-amber-100',
        border: 'border-amber-400',
        ring: 'ring-amber-400',
        badge: 'bg-amber-100 text-amber-950 border-amber-300'
      };
    case 'administration':
      return {
        bg: 'from-blue-600 to-blue-800',
        text: 'text-blue-100',
        border: 'border-blue-500',
        ring: 'ring-blue-300',
        badge: 'bg-blue-100 text-blue-900 border-blue-300'
      };
    case 'admin_officer':
      return {
        bg: 'from-teal-600 to-teal-800',
        text: 'text-teal-100',
        border: 'border-teal-400',
        ring: 'ring-teal-300',
        badge: 'bg-teal-100 text-teal-900 border-teal-300'
      };
    case 'elementary':
      return {
        bg: 'from-emerald-600 to-emerald-800',
        text: 'text-emerald-100',
        border: 'border-emerald-400',
        ring: 'ring-emerald-300',
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-300'
      };
    case 'secondary':
      return {
        bg: 'from-indigo-600 to-indigo-800',
        text: 'text-indigo-100',
        border: 'border-indigo-400',
        ring: 'ring-indigo-300',
        badge: 'bg-indigo-100 text-indigo-900 border-indigo-300'
      };
    case 'non_teaching':
      return {
        bg: 'from-purple-600 to-purple-800',
        text: 'text-purple-100',
        border: 'border-purple-400',
        ring: 'ring-purple-300',
        badge: 'bg-purple-100 text-purple-900 border-purple-300'
      };
    default:
      return {
        bg: 'from-slate-600 to-slate-800',
        text: 'text-slate-100',
        border: 'border-slate-400',
        ring: 'ring-slate-300',
        badge: 'bg-slate-100 text-slate-800 border-slate-300'
      };
  }
};

const getInitials = (fullName: string): string => {
  if (!fullName) return 'VIS';
  // Remove honorifics like Dr., Mr., Ms., Mrs., Engr.
  const cleaned = fullName.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.|Engr\.|Atty\.)\s+/i, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'V';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
};

export const PersonnelAvatar: React.FC<PersonnelAvatarProps> = ({
  photoUrl,
  name,
  category,
  size = 'md',
  className = '',
  ringClassName = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const initials = getInitials(name);
  const theme = getCategoryStyles(category);

  // Size dimensions
  const sizeMap = {
    xs: {
      box: 'w-7 h-7 text-[10px]',
      icon: 'w-3 h-3',
      ring: 'ring-1',
    },
    sm: {
      box: 'w-9 h-9 text-xs',
      icon: 'w-3.5 h-3.5',
      ring: 'ring-2',
    },
    md: {
      box: 'w-11 h-11 text-xs',
      icon: 'w-4 h-4',
      ring: 'ring-2',
    },
    lg: {
      box: 'w-14 h-14 text-sm font-bold',
      icon: 'w-5 h-5',
      ring: 'ring-2',
    },
    xl: {
      box: 'w-20 h-20 text-base font-extrabold',
      icon: 'w-6 h-6',
      ring: 'ring-4',
    },
    '2xl': {
      box: 'w-24 h-24 text-lg font-extrabold',
      icon: 'w-8 h-8',
      ring: 'ring-4',
    },
  };

  const currentSize = sizeMap[size];
  const showImage = Boolean(photoUrl && !hasError);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden shadow-xs bg-slate-100 ${
        currentSize.box
      } ${currentSize.ring} ${ringClassName || theme.ring} ${className}`}
    >
      {showImage ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover object-center"
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : (
        <div
          className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${theme.bg} ${theme.text} font-bold select-none`}
        >
          {initials ? (
            <span>{initials}</span>
          ) : (
            <User className={currentSize.icon} />
          )}
        </div>
      )}
    </div>
  );
};
