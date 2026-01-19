import { Bars3Icon, BellAlertIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const parts = user.name.split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : user.name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 flex items-center h-16 px-4 bg-white border-b lg:px-8">
      {/* Mobile menu button */}
      <button
        className="lg:hidden -ml-2 p-2 rounded-md hover:bg-gray-100"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button
          className="relative p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          aria-label="View notifications"
        >
          <BellAlertIcon className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User avatar and menu */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-700">{getUserInitials()}</span>
          </div>
          {user && (
            <span className="hidden md:block text-sm text-gray-700">{user.name}</span>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          aria-label="Logout"
          title="Logout"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
