import {
  LayoutDashboard,
  ShoppingBag,
  Smartphone,
  Tags,
  Award,
  HardDrive,
  Megaphone,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from './routes';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'لوحة التحكم', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'الطلبات', path: ROUTES.ORDERS, icon: ShoppingBag },
  { label: 'المنتجات', path: ROUTES.PRODUCTS, icon: Smartphone },
  { label: 'الفئات', path: ROUTES.CATEGORIES, icon: Tags },
  { label: 'العلامات التجارية', path: ROUTES.BRANDS, icon: Award },
  { label: 'الذاكرة', path: ROUTES.STORAGE, icon: HardDrive },
  { label: 'النشرة', path: ROUTES.NEWSLETTER, icon: Megaphone },
  { label: 'المستخدمون', path: ROUTES.USERS, icon: Users },
];
