"use client";
import React, { useEffect, useState } from "react";

import { 
  FileText, 
  Layers, 
  ListTree, 
  TrendingUp, 
  PlusCircle, 
  RefreshCcw,
  Zap
} from 'lucide-react';

export default function Dashboard() {
  const [counts, setCounts] = useState({
    categories: 0,
    subCategories: 0,
    articles: 0,
    blogs: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      const baseUrl = "https://blog-server-0exu.onrender.com/api";
      const [catRes, subRes, artRes, blogRes] = await Promise.all([
        fetch(`${baseUrl}/categories`),
        fetch(`${baseUrl}/subcategories`),
        fetch(`${baseUrl}/article/all`),
        fetch(`${baseUrl}/blog/list`)
      ]);

      const catData = await catRes.json();
      const subData = await subRes.json();
      const artData = await artRes.json();
      const blogData = await blogRes.json();

      setCounts({
        categories: catData.data?.length || 0, 
        subCategories: subData.data?.length || 0,
        articles: artData.articles?.length || 0,
        blogs: blogData.totalDocs || blogData.blogs?.length || 0
      });

    } catch (error) {
      console.error("Stats error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStats();
  }, []);

  const statsConfigs = [
    { title: 'Categories', value: counts.categories, icon: <Layers size={24}/>, color: "from-cyan-400 to-blue-600", shadow: "shadow-blue-500/50" },
    { title: 'Sub Categories', value: counts.subCategories, icon: <ListTree size={24}/>, color: "from-purple-400 to-fuchsia-600", shadow: "shadow-purple-500/50" },
    { title: 'Articles', value: counts.articles, icon: <FileText size={24}/>, color: "from-orange-400 to-red-600", shadow: "shadow-orange-500/50" },
    { title: 'Blogs', value: counts.blogs, icon: <TrendingUp size={24}/>, color: "from-emerald-400 to-teal-600", shadow: "shadow-emerald-500/50" },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-10 font-sans selection:bg-cyan-500/30">
      
      {/* Header with Neon Glow */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-yellow-400 animate-pulse" size={20} />
            <span className="text-cyan-400 font-bold tracking-widest text-xs uppercase">System Live</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
            Welcome Back <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">MeHraj Uddin</span>
          </h1>
          <p className="text-slate-400 font-medium">Monitoring real-time database activity.</p>
        </div>
        
        <button 
          onClick={fetchAllStats}
          className="group relative px-8 py-3 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden transition-all hover:border-cyan-500/50 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center gap-3 font-bold text-sm">
            <RefreshCcw size={18} className={`${loading ? "animate-spin text-cyan-400" : "text-slate-300 group-hover:rotate-180 transition-transform duration-500"}`} />
            REFRESH ENGINE
          </div>
        </button>
      </div>

      {/* Stats Cards with Lighting */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {statsConfigs.map((stat, index) => (
          <div key={index} className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-3xl blur opacity-20 group-hover:opacity-60 transition duration-500`}></div>
            <div className="relative bg-[#0f172a] p-7 rounded-3xl border border-slate-800 flex flex-col items-start overflow-hidden">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} text-white mb-6 shadow-lg ${stat.shadow}`}>
                {stat.icon}
              </div>
              <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{stat.title}</h3>
              <div className="text-4xl font-black text-white">{loading ? "..." : stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Colorful Animated Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[3rem] blur-xl"></div>
          <div className="relative bg-[#0f172a]/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl h-full">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-2 h-8 bg-cyan-500 rounded-full"></div>
                Content Lighting Map
              </h2>
            </div>
            
            <div className="h-80 flex items-end justify-around gap-8 px-4 border-b border-slate-800 pb-1 relative">
              {statsConfigs.map((stat, i) => {
                const maxVal = Math.max(...Object.values(counts), 1);
                const heightVal = (stat.value / maxVal) * 100;
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Glowing Bar */}
                    <div 
                      style={{ height: `${loading ? 0 : Math.max(heightVal, 8)}%` }} 
                      className={`w-full max-w-[70px] bg-gradient-to-t ${stat.color} rounded-t-2xl transition-all duration-[1500ms] cubic-bezier(0.34, 1.56, 0.64, 1) relative shadow-[0_0_30px_-5px] group-hover:shadow-[0_0_40px_0px] group-hover:scale-105`}
                    >
                      {/* Reflection Line */}
                      <div className="absolute top-0 left-0 w-full h-full bg-white/10 rounded-t-2xl opacity-50"></div>
                      
                      {/* Value Tag */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-14 left-1/2 -translate-x-1/2 bg-white text-[#020617] px-4 py-2 rounded-xl text-sm font-black shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2">
                        {stat.value}
                      </div>
                    </div>
                    
                    {/* Label */}
                    <span className="absolute -bottom-10 text-[10px] font-black text-slate-500 group-hover:text-white transition-colors uppercase tracking-tighter text-center">
                      {stat.title}
                    </span>
                  </div>
                );
              })}

              {/* Grid Horizontal Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-full h-px bg-white"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Sidebar with Gradient Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-cyan-500 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(8,112,184,0.3)] text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-black text-3xl mb-4">Express Actions</h3>
              <p className="text-blue-50/80 text-sm mb-10 leading-relaxed font-medium">Quickly deploy new content to the edge network.</p>
              
              <div className="space-y-4">
                <button className="w-full bg-white text-blue-900 font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform active:scale-95 shadow-xl">
                  <PlusCircle size={20} /> NEW ARTICLE
                </button>
                <button className="w-full bg-black/20 hover:bg-black/40 border border-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all">
                  <PlusCircle size={20} /> POST BLOG
                </button>
              </div>
            </div>
            
            {/* Animated Background Light */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-400/20 rounded-full blur-[80px] group-hover:bg-cyan-400/40 transition-colors duration-700"></div>
          </div>
          
          <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
            <h4 className="text-slate-400 font-black text-[10px] tracking-[0.2em] mb-4 uppercase text-center">System Health</h4>
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
              DB CONNECTED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}