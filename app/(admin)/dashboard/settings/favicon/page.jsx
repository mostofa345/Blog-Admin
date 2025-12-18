"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ImageIcon, Info, Loader2, Save, Trash2, Upload } from "lucide-react";

export default function FaviconSettingsPage() {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchCurrentFavicon = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${baseUrl}/favicon/current`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.faviconUrl) {
            setPreview(data.faviconUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching favicon:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isMounted) {
      fetchCurrentFavicon();
    }
  }, [isMounted]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 512 * 1024) {
        alert("File size 512KB er kom hote hobe!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!preview) return;
    setUploading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/favicon/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: preview }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Favicon updated!");
      } else {
        alert("Failed: " + data.message);
      }
    } catch (error) {
      alert("Server connection failed!");
    } finally {
      setUploading(false);
    }
  };

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#09090b]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-10 bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin/dashboard" className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Site Appearance</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your blog's visual branding</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-4">
                <Info size={20} />
                <h3 className="font-semibold text-sm uppercase">Instructions</h3>
              </div>
              <ul className="text-sm space-y-4 text-zinc-600 dark:text-zinc-400">
                <li>• Recommended size: 32x32px or 48x48px.</li>
                <li>• Support PNG, ICO, or SVG.</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-8">
                <div className="flex flex-col sm:flex-row items-center gap-10">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/40 overflow-hidden">
                      {preview ? <img src={preview} alt="Favicon" className="w-16 h-16 object-contain" /> : <ImageIcon className="text-zinc-300" size={40} />}
                    </div>
                    {preview && (
                      <button onClick={() => setPreview(null)} className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl font-semibold mb-2">Favicon Icon</h2>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                    <button onClick={() => fileInputRef.current.click()} className="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-xl flex items-center gap-2 mx-auto sm:mx-0">
                      <Upload size={18} />
                      Upload Photo
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-8 py-5 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                <button onClick={handleSave} disabled={uploading || !preview} className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all ${preview && !uploading ? 'bg-blue-600 text-white shadow-lg' : 'bg-zinc-200 text-zinc-400'}`}>
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {uploading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}