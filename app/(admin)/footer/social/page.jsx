"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Facebook, Instagram, Link as LinkIcon, Linkedin, Loader2, Plus, Save, Trash2, Twitter, X, Youtube } from "lucide-react";

// src/app/admin/footer/social/page.jsx

// API Base URL environment variable থেকে নেওয়া
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Lucide Icons Map: ফ্রন্টএন্ডে আইকন রেন্ডার করার জন্য
const IconMap = {
  Facebook: Facebook,
  Twitter: Twitter,
  Linkedin: Linkedin,
  Youtube: Youtube,
  Instagram: Instagram,
  LinkIcon: LinkIcon, // Default fallback
};

// --- Main Component ---
const SocialManage = () => {
  // state initialization
  const [links, setLinks] = useState([]); 
  // mounted state removed: const [mounted, setMounted] = useState(false); 
  const [isAdding, setIsAdding] = useState(false);
  
  // input fields state
  const [platform, setPlatform] = useState("");
  const [url, setUrl] = useState("");
  const [iconCode, setIconCode] = useState("LinkIcon"); 
  const [editingId, setEditingId] = useState(null); 
  
  // Loading and Error State 
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true); // Initial state is true
  const [error, setError] = useState(null);

  // API URL Define করা হলো
  const SOCIAL_API_URL = `${API_BASE_URL}/social-links`;

  useEffect(() => {
    // setMounted(true) is removed
    fetchSocialLinks();
  }, []);

  // ১. Social Links Fetch করার ফাংশন (Real API)
  const fetchSocialLinks = async () => {
      setLoading(true);
      setError(null);
      try {
          // Changed API endpoint to use the correct root path
          const response = await axios.get(SOCIAL_API_URL);
          setLinks(response.data);
      } catch (err) {
          console.error("Error fetching social links:", err);
          setError("Failed to fetch links. Check if the API server is running at " + SOCIAL_API_URL);
      } finally {
          setLoading(false);
      }
  };

  const resetForm = () => {
    setPlatform("");
    setUrl("");
    setIconCode("LinkIcon");
    setEditingId(null); 
    setIsAdding(false); 
  };

  // ২. নতুন লিঙ্ক অ্যাড বা আপডেট করা (Real API)
  const handleAddOrUpdateLink = async () => {
    if (!platform || !url || !iconCode) {
      alert("Platform, URL, and Icon Code are required!");
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = { platform, url, iconCode };

    try {
        if (editingId) {
            const response = await axios.put(`${SOCIAL_API_URL}/update/${editingId}`, payload);
            setLinks(links.map(link => (link._id === editingId ? response.data : link)));
            alert("Link updated successfully!");
        } else {
            const response = await axios.post(`${SOCIAL_API_URL}/add`, payload);
            setLinks([...links, response.data]);
            alert("Link added successfully!");
        }
    } catch (err) {
        console.error("Error saving link:", err);
        setError("Failed to save link. Check API response in console.");
    } finally {
        setIsSaving(false);
        resetForm();
    }
  };

  // ৩. ডিলিট অপারেশন (Real API)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this social link?")) return;
    
    try {
        await axios.delete(`${SOCIAL_API_URL}/delete/${id}`);
        setLinks(links.filter(link => link._id !== id));
        alert("Link deleted successfully!");
    } catch (err) {
        console.error("Error deleting link:", err);
        setError("Failed to delete link.");
    }
  };

  // ৪. Edit বাটনে ক্লিক
  const handleEditClick = (link) => {
    setIsAdding(true); 
    setEditingId(link._id);
    setPlatform(link.platform);
    setUrl(link.url);
    setIconCode(link.iconCode);
  };


  // রেন্ডার করার জন্য সঠিক আইকন কম্পোনেন্ট বের করা
  const getIconComponent = (code) => {
    const Icon = IconMap[code] || LinkIcon; 
    return <Icon className="w-5 h-5" />;
  };

  // 🔥 Hydration Fix: শুধু মাত্র loading state এর উপর নির্ভর করা হলো
  if (loading) return <div className="p-6 text-center dark:text-gray-200 flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Social Links...</div>;

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6 flex items-center space-x-2">
        <LinkIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        <span>Manage Social Media Links</span>
      </h1>
      
      {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}

      {/* Add New Link Button */}
      <button 
        onClick={() => {
            if (editingId) resetForm(); 
            setIsAdding(!isAdding); 
        }}
        className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition shadow-md flex items-center space-x-2"
      >
        {isAdding && !editingId ? <X className="w-5 h-5" /> : (editingId ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />)}
        <span>{editingId ? "Cancel Edit" : (isAdding ? "Cancel Adding" : "Add New Social Link")}</span>
      </button>

      {/* Add/Edit New Link Form (Conditional Display) */}
      {(isAdding || editingId) && (
        <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg mb-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400 border-b border-gray-200 dark:border-gray-700 pb-2">
            {editingId ? "Edit Social Link" : "New Social Link Details"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Platform/Name */}
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">Platform Name (e.g., Facebook)</label>
              <input 
                  type="text" 
                  placeholder="Platform Name" 
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full p-2.5 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-green-500 outline-none" 
              />
            </div>
            
            {/* Icon Code (User Input) */}
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">Lucide Icon Code (e.g., Facebook, Twitter)</label>
              <input 
                  type="text" 
                  placeholder="Icon Code" 
                  value={iconCode}
                  onChange={(e) => setIconCode(e.target.value)}
                  className="w-full p-2.5 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-green-500 outline-none" 
              />
            </div>

            {/* URL Link */}
            <div className="md:col-span-1">
              <label className="block text-xs font-medium mb-1 opacity-70">Full URL</label>
              <input 
                  type="url" 
                  placeholder="https://..." 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full p-2.5 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-green-500 outline-none" 
              />
            </div>
            
            {/* Add/Update Button */}
            <div className="flex items-end space-x-2">
              <button 
                  onClick={handleAddOrUpdateLink}
                  disabled={isSaving || !platform || !url || !iconCode}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded transition shadow-md disabled:bg-green-400 flex justify-center items-center space-x-2"
              >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>{editingId ? "Update Link" : "Add Link"}</span>
              </button>
              {editingId && (
                  <button
                      onClick={resetForm}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2.5 px-4 rounded transition shadow-md"
                  >
                      Cancel
                  </button>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            *Icon codes must match exported names from `@lucide/react` (e.g., use "Facebook" for the &lt;Facebook /&gt; icon).
          </p>
        </div>
      )}

      {/* Existing Links List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <th className="p-4 text-sm font-bold uppercase tracking-wider w-16">Icon</th>
                <th className="p-4 text-sm font-bold uppercase tracking-wider">Platform Name</th>
                <th className="p-4 text-sm font-bold uppercase tracking-wider">URL Link</th>
                <th className="p-4 text-sm font-bold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {links.map((link) => (
                <tr key={link._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <td className="p-4 flex justify-center items-center text-indigo-500 dark:text-indigo-400">
                    {getIconComponent(link.iconCode)} 
                  </td>
                  <td className="p-4 font-medium">{link.platform}</td>
                  <td className="p-4 text-sm opacity-80 break-all">
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 hover:underline"
                    >
                      {link.url}
                    </a>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleEditClick(link)}
                      className="text-blue-500 hover:text-blue-600 font-semibold mr-4 transition"
                    >
                        <Edit className="w-5 h-5 inline" />
                    </button>
                    <button 
                      onClick={() => handleDelete(link._id)}
                      className="text-red-500 hover:text-red-600 font-semibold transition"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {links.length === 0 && (
             <p className="p-4 text-center text-gray-500 dark:text-gray-400">No social links found. Add a new link above.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialManage;