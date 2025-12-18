"use client";
import React, { useState } from "react";
import { ChevronRight, Globe, History, Lock, LogOut, ShieldCheck, Smartphone } from "lucide-react";

export default function SecuritySettings() {
  const [twoFactor, setTwoFactor] = useState(false);

  const loginHistory = [
    { device: "Chrome / Windows 11", location: "Dhaka, Bangladesh", time: "Just now", status: "Current Session" },
    { device: "Safari / iPhone 14", location: "Chittagong, Bangladesh", time: "2 hours ago", status: "Logged out" }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
            <ShieldCheck className="text-emerald-400" size={36} />
            Security Shield
          </h1>
          <p className="text-slate-400 mt-2">Manage your account protection and active login sessions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Security Options */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 2FA Section */}
            <div className="bg-[#0f172a] rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden group">
              <div className="flex items-start justify-between relative z-10">
                <div className="flex gap-5">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
                    <Smartphone size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Two-Factor Authentication</h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                      Add an extra layer of security to your account by requiring a code from your phone.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setTwoFactor(!twoFactor)}
                  className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${twoFactor ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-lg ${twoFactor ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
            </div>

            {/* Login History */}
            <div className="bg-[#0f172a] rounded-3xl p-8 border border-slate-800 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <History className="text-blue-400" size={24} />
                Recent Login History
              </h3>
              <div className="space-y-6">
                {loginHistory.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/50 border border-slate-800/50 group hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-800 rounded-xl text-slate-400 group-hover:text-blue-400 transition-colors">
                        <Globe size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-white">{item.device}</p>
                        <p className="text-xs text-slate-500">{item.location} • {item.time}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${item.status === 'Current Session' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <button className="mt-8 text-blue-400 font-bold text-sm flex items-center gap-2 hover:underline">
                See all activity <ChevronRight size={16}/>
              </button>
            </div>
          </div>

          {/* Side Info Cards */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-red-600/10 to-transparent p-8 rounded-3xl border border-red-500/20">
              <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                <LogOut size={18}/>
                Emergency Action
              </h3>
              <p className="text-slate-400 text-sm mb-6">If you think your account is compromised, you can sign out from all other devices.</p>
              <button className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold py-3 rounded-2xl border border-red-500/20 transition-all active:scale-95">
                Sign out everywhere
              </button>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Lock size={18} className="text-cyan-400" />
                <span className="text-sm font-bold text-white">Password Tip</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                A strong password should have at least 12 characters, including numbers, symbols, and uppercase letters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}