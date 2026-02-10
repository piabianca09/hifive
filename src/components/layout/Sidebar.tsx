'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  name: string;
  href: string;
}

const Sidebar = () => {
  const pathname = usePathname();
  const { user, userRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Define navigation items based on user role
  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Check Ins', href: '/checkins' },
    { name: 'Customers', href: '/customers' },
    { name: 'Products', href: '/products' },
    { name: 'Expenses', href: '/expenses' },
    { name: 'Members', href: '/members' },
    { name: 'Profile', href: '/profile' },
    { name: 'Settings', href: '/settings' },
  ];

  // Filter items based on user role permissions
  const filteredNavItems = navItems.filter(item => {
    // Superadmin and admin can access everything
    if (userRole === 'superadmin' || userRole === 'admin') {
      return true;
    }
    
    // Staff can access most except members
    if (userRole === 'staff') {
      return item.name !== 'Members';
    }
    
    // Members only get profile and settings
    if (userRole === 'member') {
      return item.name === 'Profile' || item.name === 'Settings';
    }
    
    return false;
  });

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gradient-to-r from-[#1827a0] to-[#0c5ee5] text-white shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-[#03034b] to-[#1827a0] text-white transform transition-all duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#0c5ee5]">
          <h1 className="text-2xl font-bold tracking-tight">HiFive</h1>
          <button 
            onClick={toggleSidebar}
            className="md:hidden text-white hover:text-[#e8e4d5] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                    pathname === item.href 
                      ? 'bg-gradient-to-r from-[#0c5ee5] to-[#0a4ec0] text-white shadow-lg' 
                      : 'text-[#e8e4d5] hover:bg-[#0c5ee5] hover:text-white hover:shadow-md'
                  }`}
                  onClick={() => setIsOpen(false)} // Close sidebar on mobile after clicking
                >
                  <span className="ml-3 font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 w-full p-4 border-t border-[#0c5ee5]">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-[#0c5ee5] to-[#1827a0] border-2 border-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
              {user?.email?.charAt(0)?.toUpperCase() || 'G'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white truncate">
                {user?.email || 'Guest User'}
              </p>
              <p className="text-xs text-[#e8e4d5] truncate capitalize font-medium">
                {userRole || 'No Role'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay content when sidebar is open on mobile */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-30 pointer-events-none"></div>
      )}
    </>
  );
};

export default Sidebar;