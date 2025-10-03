import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { 
  Home, 
  Users, 
  DollarSign, 
  Calendar, 
  FileText, 
  BarChart3, 
  Building2, 
  UserCheck, 
  Menu, 
  X,
  LogOut,
  Settings,
  PenTool,
  Send,
  Shield,
  Zap
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Deals', href: '/deals', icon: DollarSign },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'E-Signature', href: '/e-signature', icon: PenTool },
    { name: 'Automation', href: '/automation', icon: Send },
    { name: 'Integrations', href: '/integrations', icon: Zap },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Privacy & Compliance', href: '/privacy', icon: Shield },
  ];

  // Add industry-specific navigation
  if (user?.organization.industry === 'real_estate') {
    navigation.push({ name: 'Properties', href: '/properties', icon: Building2 });
  }

  if (user?.organization.industry === 'dental') {
    navigation.push({ name: 'Patients', href: '/patients', icon: UserCheck });
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition ease-in-out duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <X className="h-6 w-6 text-white" />
            </Button>
          </div>
          <SidebarContent navigation={navigation} currentPath={location.pathname} user={user} onLogout={handleLogout} />
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <SidebarContent navigation={navigation} currentPath={location.pathname} user={user} onLogout={handleLogout} />
      </div>

      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

const SidebarContent: React.FC<{
  navigation: any[];
  currentPath: string;
  user: any;
  onLogout: () => void;
}> = ({ navigation, currentPath, user, onLogout }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">CRM</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.organization.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.organization.industry?.replace('_', ' ')} CRM
              </p>
            </div>
          </div>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
              >
                <item.icon
                  className={`${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 flex-shrink-0 h-5 w-5`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center w-full">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="ml-2 h-8 w-8 text-gray-400 hover:text-gray-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Layout;