"use client";
import React, { useEffect, useState } from "react";
import { Image as ImageIcon, Loader2, Save, Upload } from "lucide-react";

// ব্যাকএন্ড এপিআই ইউআরএল
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
const SETTINGS_API_URL = `${API_BASE_URL}/settings/general`;
const DEFAULT_LOGO = "https://placehold.co/96x96/4f46e5/ffffff?text=Logo";

export default function GeneralSettingsPage() {
    // Hydration mismatch এড়াতে মাউন্ট স্টেট
    const [mounted, setMounted] = useState(false);
    
    // ডাটা স্টেট
    const [logoPreview, setLogoPreview] = useState(DEFAULT_LOGO);
    const [logoFile, setLogoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // ১. মাউন্ট চেক করা
    useEffect(() => {
        setMounted(true);
    }, []);

    // ২. সার্ভার থেকে লোগো লোড করা
    useEffect(() => {
        if (!mounted) return;

        const loadSettings = async () => {
            try {
                const response = await fetch(SETTINGS_API_URL);
                if (!response.ok) throw new Error("Server response was not ok");
                
                const data = await response.json();
                // যদি ডাটাবেসে logoUrl থাকে তবে সেটি সেট করা
                if (data && data.logoUrl) {
                    setLogoPreview(data.logoUrl);
                }
            } catch (error) {
                console.error("Fetch error:", error);
                // ফেইল করলে ডিফল্ট লোগো থাকবে
            } finally {
                setFetching(false);
            }
        };

        loadSettings();
    }, [mounted]);

    // ৩. লোগো সিলেক্ট করা
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    // ৪. আপডেট সাবমিট করা
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!logoFile) return alert("Please select a logo first");
        
        setLoading(true);
        const formData = new FormData();
        formData.append("logoFile", logoFile);

        try {
            const response = await fetch(SETTINGS_API_URL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Update failed");
            }

            const data = await response.json();
            alert("Logo updated successfully!");
            setLogoPreview(data.logoUrl);
            setLogoFile(null);
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Hydration mismatch ফিক্স
    if (!mounted) return null;

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-indigo-600 p-6 text-white flex items-center gap-3 shadow-lg">
                    <ImageIcon className="w-6 h-6" />
                    <h1 className="text-xl font-bold">Logo Settings</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col items-center gap-6 p-8 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50/50 dark:bg-gray-900/20">
                        <div className="relative group">
                            <img 
                                src={logoPreview || DEFAULT_LOGO} 
                                alt="Logo Preview" 
                                className="w-40 h-40 object-contain rounded-xl border-2 border-white shadow-xl bg-white"
                            />
                        </div>
                        
                        <div className="text-center">
                            <label className="cursor-pointer bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium flex items-center gap-2 shadow-md">
                                <Upload className="w-4 h-4" />
                                Choose New Logo
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                            <p className="mt-3 text-xs text-gray-500">Supported: JPG, PNG, SVG (Max 1MB)</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !logoFile}
                        className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                        {loading ? "Uploading..." : "Save Logo Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}