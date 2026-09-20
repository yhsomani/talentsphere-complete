'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  BookOpen, 
  Trophy, 
  MessageSquare, 
  Bell, 
  Settings,
  GraduationCap,
  Target,
  FileText,
  BarChart3
} from 'lucide-react';

const candidateNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/candidates/profile', label: 'Profile', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/assessments', label: 'Code Arena', icon: Trophy },
  { href: '/learning', label: 'Learning', icon: BookOpen },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

const recruiterNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/candidates', label: 'Candidates', icon: Users },
  { href: '/company', label: 'Company', icon: GraduationCap },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const adminNav = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/institutions', label: 'Institutions', icon: GraduationCap },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  userRole: string;
  className?: string;
}

export function Sidebar({ userRole, className }: SidebarProps) {
  const pathname = usePathname();
  
  let navItems = candidateNav;
  if (userRole === 'recruiter' || userRole === 'hiring_manager') {
    navItems = recruiterNav;
  } else if (userRole === 'admin') {
    navItems = adminNav;
  }
  
  return (
    <aside className={cn('w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto', className)}>
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2">
          <Target className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">TalentSphere</span>
        </Link>
      </div>
      
      <nav className="mt-6 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-lg mb-1 transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* XP Progress Section */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Level 3</span>
          <span className="text-xs text-gray-500">1,250 / 1,500 XP</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '83%' }} />
        </div>
      </div>
    </aside>
  );
}

interface HeaderProps {
  userName: string;
  userAvatar?: string;
  notificationCount?: number;
  className?: string;
}

export function Header({ userName, userAvatar, notificationCount = 0, className }: HeaderProps) {
  return (
    <header className={cn('bg-white border-b border-gray-200 px-6 py-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}</h1>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening today</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600">
            <Bell className="h-6 w-6" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
          
          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <span className="text-gray-600 font-medium">
                  {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function DashboardLayout({ 
  children, 
  userRole,
  userName,
  userAvatar,
  notificationCount 
}: { 
  children: React.ReactNode;
  userRole: string;
  userName: string;
  userAvatar?: string;
  notificationCount?: number;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userAvatar={userAvatar} notificationCount={notificationCount} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
