import {
  HomeIcon,
  ServerStackIcon,
  ChartBarIcon,
  BellAlertIcon,
  MapIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { ROUTES } from '../../utils/constants';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const navigation: NavItem[] = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: HomeIcon },
  { name: 'Devices', href: ROUTES.DEVICES, icon: ServerStackIcon },
  { name: 'Telemetry', href: ROUTES.TELEMETRY, icon: ChartBarIcon },
  { name: 'Alerts', href: ROUTES.ALERTS, icon: BellAlertIcon },
  { name: 'Topology', href: ROUTES.TOPOLOGY, icon: MapIcon },
  { name: 'Settings', href: ROUTES.SETTINGS, icon: Cog6ToothIcon },
];
