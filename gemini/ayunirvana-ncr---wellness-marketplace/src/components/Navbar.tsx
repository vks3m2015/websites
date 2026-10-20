import React, { useState } from 'react';
import { User, UserRole, Notification } from '../types';
import { api } from '../services/api';
import {
  Bell,
  CalendarCheck,
  ShieldCheck,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  PhoneCall,
  LogOut,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onUserChange,
  onNavigate,
  currentPage,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifications = api.getUserNotifications(currentUser.id);
  const unreadNotifs = notifications.filter((n) => !n.isRead);

  const handleRoleSwitch = (role: UserRole) => {
    const updated = api.switchUserRole(role);
    onUserChange(updated);
    setShowRoleDropdown(false);
    if (role === 'ADMIN') onNavigate('admin');
    else if (role === 'PROFESSIONAL') onNavigate('pro-dashboard');
    else onNavigate('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onNavigate('home')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse" />
              <span className="font-serif text-2xl font-bold tracking-tight text-stone-900 group-hover:text-emerald-900 transition-colors">
                AyuNirvana
              </span>
            </div>
            <span className="text-[11px] text-stone-500 font-medium tracking-wider uppercase block">
              Delhi NCR Wellness
            </span>
          </button>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <button
              onClick={() => onNavigate('search')}
              className={`hover:text-stone-900 transition-colors pb-0.5 cursor-pointer ${
                currentPage === 'search'
                  ? 'text-stone-950 font-semibold border-b-2 border-stone-900'
                  : ''
              }`}
            >
              Find Specialists
            </button>
            <button
              onClick={() => onNavigate('categories')}
              className={`hover:text-stone-900 transition-colors pb-0.5 cursor-pointer ${
                currentPage === 'categories'
                  ? 'text-stone-950 font-semibold border-b-2 border-stone-900'
                  : ''
              }`}
            >
              Services & Therapies
            </button>
            <button
              onClick={() => onNavigate('customer-dashboard')}
              className={`hover:text-stone-900 transition-colors pb-0.5 cursor-pointer ${
                currentPage === 'customer-dashboard'
                  ? 'text-stone-950 font-semibold border-b-2 border-stone-900'
                  : ''
              }`}
            >
              My Appointments
            </button>
            {currentUser.role === 'ADMIN' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`hover:text-amber-900 text-amber-800 font-semibold cursor-pointer pb-0.5 ${
                  currentPage === 'admin' ? 'border-b-2 border-amber-800' : ''
                }`}
              >
                Admin Console
              </button>
            )}
            {currentUser.role === 'PROFESSIONAL' && (
              <button
                onClick={() => onNavigate('pro-dashboard')}
                className={`hover:text-emerald-900 text-emerald-800 font-semibold cursor-pointer pb-0.5 ${
                  currentPage === 'pro-dashboard' ? 'border-b-2 border-emerald-800' : ''
                }`}
              >
                Specialist Portal
              </button>
            )}
          </nav>

          {/* Zone 3: Actions, Notifications & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Professional Onboarding CTA if customer */}
            {currentUser.role === 'CUSTOMER' && (
              <button
                onClick={() => onNavigate('onboard-pro')}
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-stone-800 hover:text-stone-950 bg-stone-100 hover:bg-stone-200/80 rounded-lg transition-colors border border-stone-200/60"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                Join As Specialist
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors relative cursor-pointer"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-600 rounded-full ring-2 ring-[#FAF9F5]" />
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-stone-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                      Notifications
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      {unreadNotifs.length} new
                    </span>
                  </div>
                  <div className="mt-2 divide-y divide-stone-100 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="py-6 text-center text-xs text-stone-500">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="py-3 px-1 hover:bg-stone-50 transition-colors cursor-pointer"
                          onClick={() => {
                            api.markNotificationRead(n.id);
                            if (n.actionLink) {
                              if (n.actionLink === '/bookings') onNavigate('customer-dashboard');
                              else if (n.actionLink === '/pro-dashboard') onNavigate('pro-dashboard');
                            }
                            setShowNotifs(false);
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-stone-900">{n.title}</p>
                              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-stone-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Demo Role Switcher & User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 bg-stone-100/80 hover:bg-stone-200/80 rounded-lg text-xs font-medium text-stone-800 transition-colors border border-stone-200/80 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-emerald-800 flex items-center justify-center text-white text-[10px] font-bold">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="block font-semibold text-stone-900 leading-tight">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                  <span className="block text-[10px] text-stone-500 font-normal">
                    {currentUser.role === 'ADMIN' ? 'Administrator' : currentUser.role === 'PROFESSIONAL' ? 'Specialist' : 'Customer'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 ml-0.5" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 p-2 z-50">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900">{currentUser.fullName}</p>
                    <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                  </div>

                  <div className="py-2">
                    <p className="px-3 py-1 text-[10px] uppercase font-semibold text-stone-400 tracking-wider">
                      Switch Role (Demo Preview)
                    </p>
                    <button
                      onClick={() => handleRoleSwitch('CUSTOMER')}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                        currentUser.role === 'CUSTOMER'
                          ? 'bg-emerald-50 text-emerald-900 font-semibold'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>Customer (Pooja Malhotra)</span>
                      {currentUser.role === 'CUSTOMER' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                    </button>

                    <button
                      onClick={() => handleRoleSwitch('PROFESSIONAL')}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                        currentUser.role === 'PROFESSIONAL'
                          ? 'bg-emerald-50 text-emerald-900 font-semibold'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>Specialist (Dr. Rajeshwar)</span>
                      {currentUser.role === 'PROFESSIONAL' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                    </button>

                    <button
                      onClick={() => handleRoleSwitch('ADMIN')}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                        currentUser.role === 'ADMIN'
                          ? 'bg-amber-50 text-amber-900 font-semibold'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>Admin Console (SuperAdmin)</span>
                      {currentUser.role === 'ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-stone-100">
                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        onNavigate('customer-dashboard');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 rounded-lg flex items-center gap-2"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-stone-500" />
                      Appointments & History
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
