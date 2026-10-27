import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import { AdminToastProvider } from '../context/AdminToastContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

function AdminShell() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isLoginPage = location.pathname === '/admin/login' || location.pathname.endsWith('/admin/login');

  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[#F0F6FB] text-[#182541] flex flex-col font-sans antialiased selection:bg-[#094899] selection:text-white">
      {/* Sidebar */}
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <AdminTopbar
          onOpenMobile={() => setIsMobileOpen(true)}
          isCollapsed={isCollapsed}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminLayout() {
  return (
    <AdminAuthProvider>
      <AdminToastProvider>
        <AdminShell />
      </AdminToastProvider>
    </AdminAuthProvider>
  );
}
