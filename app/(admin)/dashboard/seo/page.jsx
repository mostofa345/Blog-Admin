"use client";
import React, { useState, useEffect } from "react";
import { 
    Globe, 
    Search, 
    Share2, 
    CheckCircle2, 
    AlertCircle, 
    Save, 
    Eye, 
    Smartphone, 
    Layout, 
    Loader2 
} from "lucide-react";

export default function SEOManagerPage() {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    // SEO States
    const [seoData, setSeoData] = useState({
        siteTitle: "My High Quality Blog",
        metaDescription: "The best place to learn about tech and development.",
        keywords: "nextjs, react, seo, blog",
        ogImage: "",
        twitterHandle: "@myblog",
        googleVerifyCode: "",
        indexing: true
    });

    useEffect(() => { setMounted(true); }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSeoData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    if (!mounted) return null;

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen transition-colors duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Search className="text-indigo-600" /> SEO Command Center
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Optimize your entire blog for search engines and social media.</p>
                </div>
                <button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500); }}
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar Tabs */}
                <div className="lg:col-span-3 space-y-2">
                    {[
                        { id: "general", label: "General SEO", icon: Globe },
                        { id: "social", label: "Social Media", icon: Share2 },
                        { id: "advanced", label: "Advanced", icon: Layout },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                                activeTab === tab.id 
                                ? "bg-indigo-600 text-white shadow-md" 
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                    
                    {/* SEO Health Score Card */}
                    <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-2xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-green-700 dark:text-green-400">SEO Health</span>
                            <span className="text-xl font-black text-green-600">92%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-[92%]"></div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9 space-y-6">
                    {activeTab === "general" && (
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Basic Optimization</h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Site Meta Title</label>
                                    <input 
                                        type="text" 
                                        name="siteTitle"
                                        value={seoData.siteTitle}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all dark:text-white"
                                    />
                                    <div className="flex justify-between mt-1">
                                        <span className="text-xs text-gray-400">{seoData.siteTitle.length} / 60 characters</span>
                                        {seoData.siteTitle.length > 60 && <span className="text-xs text-red-500">Too long!</span>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Meta Description</label>
                                    <textarea 
                                        rows="4"
                                        name="metaDescription"
                                        value={seoData.metaDescription}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all dark:text-white"
                                    />
                                    <span className="text-xs text-gray-400">{seoData.metaDescription.length} / 160 characters</span>
                                </div>

                                {/* Google Preview Mockup */}
                                <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Eye className="w-4 h-4" /> Google Search Preview
                                    </h3>
                                    <div className="max-w-xl">
                                        <p className="text-[#1a0dab] dark:text-[#8ab4f8] text-xl hover:underline cursor-pointer truncate">
                                            {seoData.siteTitle || "Page Title Goes Here"}
                                        </p>
                                        <p className="text-[#006621] dark:text-[#34a853] text-sm mt-1 truncate">
                                            https://yourblog.com › blog › post-url
                                        </p>
                                        <p className="text-[#4d5156] dark:text-gray-400 text-sm mt-1 line-clamp-2">
                                            {seoData.metaDescription || "Please provide a meta description to see how it looks in search results."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "social" && (
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
                            <div>
                                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                                    <Share2 className="text-blue-500" /> Facebook & Open Graph
                                </h2>
                                <p className="text-sm text-gray-500 mb-6">Control how your site looks when shared on social media.</p>
                                
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <label className="block text-sm font-semibold dark:text-gray-300">Social Share Image (OG Image)</label>
                                        <div className="h-48 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 transition-colors cursor-pointer">
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500">Click to upload 1200x630px image</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                                        <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2">Pro Tip:</h4>
                                        <p className="text-xs text-blue-600 dark:text-blue-500 leading-relaxed">
                                            Use images with a 1.91:1 ratio. This ensures your post looks perfect on Facebook, LinkedIn, and WhatsApp.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const Upload = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);