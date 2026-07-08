import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useNewOrdersNotifier } from '@/features/orders/hooks/useNewOrdersNotifier';
import { useUpgradeRequestsNotifier } from '@/features/users/hooks/useUpgradeRequestsNotifier';

export function DashboardLayout() {
  const sidebar = useDisclosure(false);
  useNewOrdersNotifier();
  useUpgradeRequestsNotifier();


  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950" dir="rtl">
      <Sidebar isOpen={sidebar.isOpen} onClose={sidebar.close} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={sidebar.open} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );

  
}
