import { NavLink as RouterNavLink } from 'react-router-dom';
import clsx from 'clsx';
import type { NavItem } from './Navigation';

interface NavLinkItemProps {
  item: NavItem;
  onClick?: () => void;
}

export function NavLinkItem({ item, onClick }: NavLinkItemProps) {
  return (
    <RouterNavLink
      to={item.href}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-700 hover:bg-gray-100'
        )
      }
    >
      <item.icon className="w-5 h-5 mr-3" />
      {item.name}
    </RouterNavLink>
  );
}
