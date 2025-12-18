"use client";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Menu, Settings, ShieldCheck, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Header({ toggleSidebar }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm transition-colors duration-300 z-50">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition sm:hidden">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Admin <span className="hidden sm:inline">Panel</span>
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <button className="relative p-2.5 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition group">
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0f172a]"></span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 hover:border-blue-500/50 transition-all active:scale-95">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <User size={20} />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">MeHraj Uddin</p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium uppercase">Super Admin</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#1e293b] rounded-[1.5rem] shadow-2xl border border-gray-100 dark:border-slate-700 py-3 animate-in fade-in zoom-in duration-200 origin-top-right">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700 mb-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Admin Session</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">mehraj@example.com</p>
              </div>

              <div className="px-2 space-y-1">
                <Link href="/my-account" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all group">
                  <Settings size={16} /> My Account
                </Link>

                <Link href="/dashboard/settings/security-settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all group">
                  <ShieldCheck size={16} /> Security Settings
                </Link>

                <div className="h-px bg-gray-100 dark:bg-slate-700 my-2 mx-2"></div>

                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}