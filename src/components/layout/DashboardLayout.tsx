'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn, getLevelDetails } from '@/utils';
import { Avatar } from '@/components/ui';
import { createBrowserClient } from '@/lib/supabase';
import { messageService } from '@/services/message.service';
import { notificationService } from '@/services/notification.service';
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
  BarChart3,
  Award,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Search,
  User
} from 'lucide-react';
import { CommandPalette } from '@/components/common/CommandPalette';

const candidateNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/candidates/profile', label: 'Profile', icon: User },
  { href: '/network', label: 'Network', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/applications', label: 'Applications', icon: FileText },
  { href: '/challenges', label: 'Code Arena', icon: Trophy },
  { href: '/leaderboard', label: 'Leaderboard', icon: Award },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const recruiterNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/jobs/post', label: 'Post a Job', icon: Target },
  { href: '/candidates', label: 'Candidates', icon: Users },
  { href: '/network', label: 'Network', icon: Users },
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
  userXp?: number;
  unreadMessageCount?: number;
  unreadNotificationCount?: number;
  className?: string;
  onCloseMobile?: () => void;
}

export function Sidebar({ 
  userRole, 
  userXp = 0, 
  unreadMessageCount = 0, 
  unreadNotificationCount = 0, 
  className, 
  onCloseMobile 
}: SidebarProps) {
  const pathname = usePathname();
  const xpInfo = getLevelDetails(userXp);
  
  let navItems = candidateNav;
  if (userRole === 'recruiter' || userRole === 'hiring_manager') {
    navItems = recruiterNav;
  } else if (userRole === 'admin') {
    navItems = adminNav;
  }
  
  return (
    <aside className={cn('w-64 bg-white border-r border-slate-200/80 h-screen flex flex-col justify-between shrink-0 select-none', className)}>
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Logo Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight">TalentSphere</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">Career OS</span>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg lg:hidden"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Platform
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
            const isMessages = item.href === '/messages';
            const isNotifications = item.href === '/notifications';
            const showMessageBadge = isMessages && unreadMessageCount > 0;
            const showNotificationBadge = isNotifications && unreadNotificationCount > 0;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 text-xs font-medium group',
                  isActive
                    ? 'bg-indigo-50/80 text-indigo-700 font-semibold border-r-2 border-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('h-4 w-4 transition-colors', isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600')} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {showMessageBadge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded-full min-w-4 text-center leading-none">
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </span>
                  )}
                  {showNotificationBadge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full min-w-4 text-center leading-none">
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Gamification Level & XP Banner */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-sm border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold tracking-tight">Level {xpInfo.level}</span>
          </div>
          <span className="text-[11px] font-mono text-indigo-200">
            {xpInfo.totalXp.toLocaleString()} XP
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 to-indigo-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${xpInfo.percentage}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
          <span>{xpInfo.percentage}% completed</span>
          <Link href="/leaderboard" className="text-indigo-300 hover:underline">Rankings →</Link>
        </div>
      </div>
    </aside>
  );
}

interface HeaderProps {
  userName?: string;
  userAvatar?: string;
  userRole?: string;
  notificationCount?: number;
  unreadMessageCount?: number;
  className?: string;
  onOpenMobileMenu?: () => void;
  onOpenCommandPalette?: () => void;
}

export function Header({ 
  userName = 'Member', 
  userAvatar, 
  userRole = 'candidate',
  notificationCount = 0, 
  unreadMessageCount = 0,
  className,
  onOpenMobileMenu,
  onOpenCommandPalette
}: HeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push('/auth/signin');
  };

  return (
    <header className={cn('bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 sticky top-0 z-30', className)}>
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu trigger & Welcome greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Hi, {userName}</span>
              <span className="hidden sm:inline-block">👋</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">TalentSphere Workspace</p>
          </div>
        </div>

        {/* Global Search Command Bar (⌘K) - Desktop */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 text-xs text-slate-400 bg-slate-100/80 hover:bg-slate-100 hover:text-slate-600 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs max-w-sm w-full"
          title="Quick Search (⌘K / Ctrl+K)"
          aria-label="Open command search palette"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-500 truncate flex-1 text-left">Search commands, pages, jobs...</span>
          <kbd className="font-mono text-[10px] font-semibold bg-white text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-200 shadow-2xs shrink-0">
            ⌘K
          </kbd>
        </button>

        {/* Action icons & user profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Search Icon */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Search (⌘K)"
            aria-label="Open command palette"
          >
            <Search className="h-4.5 w-4.5" />
          </button>

          {/* Messages */}
          <Link
            href="/messages"
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Messages"
            aria-label="View messages"
          >
            <MessageSquare className="h-4.5 w-4.5" />
            {unreadMessageCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white leading-none">
                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <Link
            href="/notifications"
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white leading-none">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Link>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Profile Card / Avatar */}
          <Link 
            href="/candidates/profile" 
            className="flex items-center gap-2 p-1 pl-2 pr-3 hover:bg-slate-100 rounded-full transition-colors border border-slate-200/60"
          >
            <Avatar
              src={userAvatar}
              alt={userName}
              fallback={userName.charAt(0).toUpperCase()}
              size="sm"
            />
            <div className="hidden sm:block text-left">
              <span className="text-xs font-semibold text-slate-800 block leading-tight">{userName}</span>
              <span className="text-[10px] text-slate-400 capitalize">{userRole}</span>
            </div>
          </Link>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            title="Sign Out"
            aria-label="Sign out"
            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function DashboardLayout({ 
  children, 
  userRole = 'candidate',
  userName = 'Member',
  userAvatar,
  notificationCount,
  unreadMessageCount,
  userXp = 0
}: { 
  children: React.ReactNode;
  userRole?: string;
  userName?: string;
  userAvatar?: string;
  notificationCount?: number;
  unreadMessageCount?: number;
  userXp?: number;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [internalUnread, setInternalUnread] = useState(0);
  const resolvedUnread = unreadMessageCount ?? internalUnread;

  const [internalUnreadNotifications, setInternalUnreadNotifications] = useState(0);
  const resolvedNotificationCount = notificationCount ?? internalUnreadNotifications;

  // Global shortcut (⌘K / Ctrl+K) listener for Command Palette (SEARCH-001)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Poll / fetch unread message & notification count periodically and listen for realtime updates
  useEffect(() => {
    let isMounted = true;
    const supabase = createBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let notifChannel: any = null;

    async function fetchCounts() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) {
          if (unreadMessageCount === undefined) {
            const msgCount = await messageService.getUnreadCount(user.id);
            if (isMounted) setInternalUnread(msgCount);
          }
          if (notificationCount === undefined) {
            const notifCount = await notificationService.getUnreadCount(user.id);
            if (isMounted) setInternalUnreadNotifications(notifCount);
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    fetchCounts();
    const interval = setInterval(fetchCounts, 20000);
    const handleFocus = () => fetchCounts();
    window.addEventListener('focus', handleFocus);

    // Setup Supabase Realtime subscription for incoming notifications
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || !isMounted) return;
      notifChannel = supabase
        .channel(`shell-notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchCounts();
          }
        )
        .subscribe();
    });

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      if (notifChannel) supabase.removeChannel(notifChannel);
    };
  }, [unreadMessageCount, notificationCount]);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <Sidebar 
        userRole={userRole} 
        userXp={userXp} 
        unreadMessageCount={resolvedUnread}
        unreadNotificationCount={resolvedNotificationCount}
        className="hidden lg:flex" 
      />

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)} 
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50">
            <Sidebar 
              userRole={userRole} 
              userXp={userXp} 
              unreadMessageCount={resolvedUnread}
              unreadNotificationCount={resolvedNotificationCount}
              className="w-full"
              onCloseMobile={() => setMobileOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          userName={userName} 
          userAvatar={userAvatar} 
          userRole={userRole}
          notificationCount={resolvedNotificationCount} 
          unreadMessageCount={resolvedUnread}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Command Search Palette (SEARCH-001) */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
        userRole={userRole} 
      />
    </div>
  );
}

export default DashboardLayout;
