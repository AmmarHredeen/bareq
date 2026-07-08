export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  ORDERS: '/orders',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  BRANDS: '/brands',
  STORAGE: '/storage',
  NEWSLETTER: '/newsletter',
  USERS: '/users',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
