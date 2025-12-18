"use client";
import Header from "@components/Header";
import Sidebar from "@components/Sidebar";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar-এ isOpen এবং toggle ফাংশন পাঠানো হলো */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header-এ toggle ফাংশন পাঠানো হলো */}
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-grow pt-16 lg:ml-72">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* মোবাইল স্ক্রিনে সাইডবার খোলা থাকলে ব্যাকগ্রাউন্ড আবছা করার জন্য */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}