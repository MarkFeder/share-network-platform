import { XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { navigation } from './Navigation';
import { NavLinkItem } from './NavLink';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Logo() {
  return (
    <span className="text-xl font-bold text-primary-600">NetPlatform</span>
  );
}

function NavList({ onItemClick }: { onItemClick?: () => void }) {
  return (
    <nav className="px-4 py-4 space-y-1">
      {navigation.map((item) => (
        <NavLinkItem key={item.name} item={item} onClick={onItemClick} />
      ))}
    </nav>
  );
}

// Mobile sidebar with overlay
export function MobileSidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 lg:hidden',
        isOpen ? 'block' : 'hidden'
      )}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/80"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Logo />
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <NavList onItemClick={onClose} />
      </div>
    </div>
  );
}

// Desktop sidebar (always visible on large screens)
export function DesktopSidebar() {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-white border-r">
        <div className="flex items-center h-16 px-6 border-b">
          <Logo />
        </div>
        <div className="flex-1">
          <NavList />
        </div>
      </div>
    </div>
  );
}
