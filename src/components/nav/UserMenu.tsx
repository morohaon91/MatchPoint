import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import signout from '@/lib/firebase/signout';

interface UserMenuProps {
  displayName: string;
  email: string;
  photoURL?: string | null;
}

export default function UserMenu({ displayName, email, photoURL }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signout(async () => {
        router.push('/login');
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setIsOpen(false);
  };

  const defaultImage = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
  const imageToShow = (!photoURL || imageError) ? defaultImage : photoURL;

  // Format display name to show only first name if it's a full name
  const shortDisplayName = displayName.split(' ')[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200"
      >
        <div className="w-8 h-8 relative">
          <Image
            src={imageToShow}
            alt={`${displayName}'s profile picture`}
            width={32}
            height={32}
            className="rounded-full"
            onError={() => setImageError(true)}
            priority
          />
        </div>
        <div className="hidden md:block text-left">
          <div className="font-medium text-sm">{shortDisplayName}</div>
          <div className="text-xs text-gray-500 truncate w-24">{email}</div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="font-medium text-sm">{displayName}</div>
            <div className="text-xs text-gray-500 truncate">{email}</div>
          </div>
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
          <Link
            href="/app/dashboard"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/app/settings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
} 