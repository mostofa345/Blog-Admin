"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

// src/app/admin/footer/menu/page.jsx (Final Corrected Code)

// API Base URL environment variable থেকে নেওয়া
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const FooterMenuManage = () => {
  // state initialization
  const [links, setLinks] = useState([]);
  // const [columns, setColumns] = useState([]); // Removed: No longer fetching columns
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // input fields state
  const [columnTitle, setColumnTitle] = useState(""); // This will now be a text input
  const [label, setLabel] = useState(""); 
  const [url, setUrl] = useState(""); 
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // API Endpoints
  const MENU_API_URL = `${API_BASE_URL}/footer-menu`;
  // const COLUMNS_API_URL = `${API_BASE_URL}/footer-columns`; // Removed: No longer needed

  // mount check and data fetch
  useEffect(() => {
    setMounted(true);
    fetchData(); 
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Menu Links only
      const linksResponse = await axios.get(MENU_API_URL);
      setLinks(linksResponse.data);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load footer links. Please ensure menu API is running.");
      setLoading(false);
    }
  };

  const resetForm = () => {
    setColumnTitle("");
    setLabel("");
    setUrl("");
    setEditingId(null);
  };


  // নতুন লিঙ্ক অ্যাড বা আপডেট করা 
  const handleAddOrUpdate = async () => {
    if (!columnTitle || !label || !url) return alert("Column Title, Link Label, and URL are required!");

    setIsSaving(true);
    setError(null);

    const payload = {
      columnTitle, // Now directly from the input field
      label,
      url,
    };

    try {
      if (editingId) {
        // Update existing link
        const response = await axios.put(`${MENU_API_URL}/update/${editingId}`, payload);
        setLinks(links.map(link => (link._id === editingId ? response.data : link)));
        alert("Menu link updated successfully!");
      } else {
        // Add new link
        const response = await axios.post(`${MENU_API_URL}/add`, payload);
        setLinks([response.data, ...links]);
        alert("Menu link added successfully!");
      }
      resetForm();
    } catch (err) {
      setError("Failed to save menu link. Check API.");
      console.error("Error saving link:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // এডিট বাটনে ক্লিক
  const handleEditClick = (link) => {
    setEditingId(link._id);
    setColumnTitle(link.columnTitle); 
    setLabel(link.label);
    setUrl(link.url);
  };

  // ডিলিট অপারেশন
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu link?")) return;
    
    try {
      await axios.delete(`${MENU_API_URL}/delete/${id}`);
      setLinks(links.filter(link => link._id !== id));
      alert("Menu link deleted successfully!");
    } catch (err) {
      setError("Failed to delete menu link.");
      console.error("Error deleting link:", err);
    }
  };
  
  // Loading state condition updated
  if (!mounted || loading) return <div className="p-6 text-center dark:text-gray-200 flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Footer Links...</div>;

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6">Manage Footer Links</h1>
      
      {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}

      {/* Add/Edit New Link Form */}
      <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg mb-8 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400 border-b border-gray-200 dark:border-gray-700 pb-2">
            {editingId ? "Edit Menu Link" : "Add New Menu Link"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* ১. Column Title Input Field */}
          <div>
            <label className="block text-xs font-medium mb-1 opacity-70">Footer Column Title</label>
            <input 
                type="text" 
                placeholder="e.g. Quick Links" 
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
                className="w-full p-2.5 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-green-500 outline-none" 
            />
          </div>

          {/* ২. মেনুর নাম (Link Label) */}
          <div>
            <label className="block text-xs font-medium mb-1 opacity-70">Link Label</label>
            <input 
                type="text" 
                placeholder="e.g. Our Mission" 
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full p-2.5 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-green-500 outline-none" 
            />
          </div>

          {/* ৩. ইউআরএল বা স্লাগ */}
          <div>
            <label className="block text-xs font-medium mb-1 opacity-70">URL / Slug</label>
            <input 
                type="text" 
                placeholder="e.g. /our-mission" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2.5 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-green-500 outline-none" 
            />
          </div>

          {/* ৪. বাটন */}
          <div className="flex items-end space-x-2">
            <button 
                onClick={handleAddOrUpdate}
                disabled={isSaving || !columnTitle || !label || !url} // Disable if required fields are empty
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded transition shadow-md disabled:bg-green-400"
            >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingId ? "Update Link" : "Add Link")}
            </button>
            {editingId && (
                <button
                    onClick={resetForm}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2.5 px-4 rounded transition shadow-md"
                >
                    Cancel Edit
                </button>
            )}
          </div>
        </div>
      </div>

      {/* Existing Links List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* 🔥 Whitespace Error Fix: সব <th> একই লাইনে লেখা হয়েছে */}
              <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600"><th className="p-4 text-sm font-bold uppercase tracking-wider">Footer Column</th><th className="p-4 text-sm font-bold uppercase tracking-wider">Link Label</th><th className="p-4 text-sm font-bold uppercase tracking-wider">URL / Slug</th><th className="p-4 text-sm font-bold uppercase tracking-wider text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {links.map((link) => (
                <tr key={link._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <td className="p-4 font-medium">{link.columnTitle}</td> 
                  <td className="p-4">{link.label}</td>
                  <td className="p-4 text-sm font-mono opacity-80">{link.url}</td>
                  <td className="p-4 text-right">
                    <button 
                        onClick={() => handleEditClick(link)}
                        className="text-blue-500 hover:text-blue-600 font-semibold mr-4 transition"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => handleDelete(link._id)}
                        className="text-red-500 hover:text-red-600 font-semibold transition"
                    >
                        Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {links.length === 0 && (
             <p className="p-4 text-center text-gray-500 dark:text-gray-400">No footer links found. Add a new link above.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FooterMenuManage;