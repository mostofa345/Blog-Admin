"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Copy, Loader2, Save } from "lucide-react";

// src/app/admin/footer/copyright/page.jsx

// API Base URL environment variable থেকে নেওয়া
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const COPYRIGHT_API_URL = `${API_BASE_URL}/copyright`; 

const CopyrightManage = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchCopyright();
  }, []);

  // ১. কপিরাইট টেক্সট ফেচ করা
  const fetchCopyright = async () => {
    // ... (API call logic - unchanged) ...
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(COPYRIGHT_API_URL);
      setText(response.data.text);
    } catch (err) {
      console.error("Error fetching copyright:", err);
      setError("Failed to fetch copyright text. Check if the API server is running at " + COPYRIGHT_API_URL);
    } finally {
      setLoading(false);
    }
  };

  // ২. কপিরাইট টেক্সট আপডেট করা
  const handleUpdate = async () => {
    // ... (Update logic - unchanged) ...
    if (!text.trim()) {
      alert("Copyright text cannot be empty!");
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await axios.put(COPYRIGHT_API_URL, { text });
      setText(response.data.text);
      setMessage("Copyright text updated successfully! 🎉");
    } catch (err) {
      console.error("Error updating copyright:", err);
      setError("Failed to update copyright text. Check API response.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) return <div className="p-6 text-center dark:text-gray-200 flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Copyright...</div>;

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6 flex items-center space-x-2">
        <Copy className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        <span>Manage Footer Copyright Text</span>
      </h1>
      
      <div className="max-w-2xl bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
        
        {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}
        {message && <div className="bg-green-500 text-white p-3 rounded mb-4">{message}</div>}

        <div className="mb-4">
          <label className="block font-semibold mb-2 dark:text-gray-300">Copyright Text</label>
          <textarea 
            rows="3" 
            className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-green-500 outline-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {/* 🔥 ফিক্স: ব্যাকটিকস সরিয়ে টেমপ্লেট স্ট্রিং (Template String) এর পরিবর্তে স্ট্রিং লিটারাল ব্যবহার করা হলো এবং <code> দিয়ে হাইলাইট করা হলো। 🔥 */}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            ডাইনামিক Current Year দেখানোর জন্য আপনি <code>© {'{YEAR}'} Your Company. All Rights Reserved.</code> এই ফরম্যাট ব্যবহার করতে পারেন।
          </p>
        </div>
        
        <button 
          onClick={handleUpdate}
          disabled={isSaving || loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded transition shadow-md flex justify-center items-center space-x-2 disabled:bg-green-400"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          <span>{isSaving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>
    </div>
  );
};

export default CopyrightManage;