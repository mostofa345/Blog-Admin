"use client";
import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, ListOrdered, Loader2, Save, Target, X } from "lucide-react";

// app/admin/content/next-read-spotlight/page.jsx


// --- API Configuration ---
// .env file থেকে API Base URL ব্যবহার করা
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
// Blog List API URL
const BLOG_LIST_API = `${API_BASE_URL}/blog/list`; 
// 🎯 ক্যাটাগরি ফেচ করার জন্য
const CATEGORIES_API = `${API_BASE_URL}/categories`; 
// Spotlight API (Admin POST & Client GET)
const SPOTLIGHT_API = `${API_BASE_URL}/spotlight`; 


const MAX_SELECTION = 4; // Your Next Read-এ 4টি আইটেম দেখানোর জন্য


const NextReadSpotlightManagerPage = () => {
    // থিম ম্যানেজমেন্ট (পূর্বের মতোই রাখা হলো)
    const [theme, setTheme] = useState('dark');
    
    // স্টেটস
    const [availableBlogs, setAvailableBlogs] = useState([]);
    const [categories, setCategories] = useState([]); // ক্যাটাগরি তালিকা
    const [selectedCategory, setSelectedCategory] = useState(''); // নির্বাচিত ক্যাটাগরি ID
    const [selectedBlogs, setSelectedBlogs] = useState([]); // নির্বাচিত ব্লগ
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // থিম টগল এবং HTML ট্যাগ আপডেট করার লজিক
    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', theme === 'dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(current => (current === 'light' ? 'dark' : 'light'));
    };

    // 🎯 ডেটা ফেচ করার মূল লজিক (Blogs, Categories, এবং Current Spotlight)
    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Blog List ফেচ করা (/api/blog/list)
                const [blogResponse, categoryResponse, spotlightResponse] = await Promise.all([
                    fetch(BLOG_LIST_API),
                    fetch(CATEGORIES_API), // ক্যাটাগরি ফেচ করা
                    fetch(SPOTLIGHT_API)
                ]);


                // --- Blog ডেটা প্রসেস ---
                const blogResult = await blogResponse.json();
                if (!blogResponse.ok || !blogResult.success) {
                    throw new Error(blogResult.message || 'Failed to fetch blogs');
                }
                
                // Note: Blog object-এ এখন Category ID এবং Name প্রসেস করা হচ্ছে।
                const blogs = blogResult.data.map(blog => ({
                    id: blog._id, 
                    title: blog.title, 
                    categoryID: blog.category?._id || 'uncategorized', 
                    categoryName: blog.category?.name || 'Uncategorized', 
                    author: blog.author?.name || 'Unknown', 
                }));
                setAvailableBlogs(blogs);
                
                // --- Category ডেটা প্রসেস ---
                const categoryResult = await categoryResponse.json();
                if (categoryResponse.ok && categoryResult.success && Array.isArray(categoryResult.data)) {
                    setCategories(categoryResult.data);
                }


                // --- Current Spotlight কন্টেন্ট ফেচ করা (/api/spotlight - GET) ---
                const spotlightResult = await spotlightResponse.json();
                
                if (spotlightResponse.ok && spotlightResult.success && spotlightResult.data) {
                    const { categoryId: currentCategoryId, content: currentContent } = spotlightResult.data;
                    
                    // নির্বাচিত ক্যাটাগরি সেট করা
                    if (currentCategoryId) {
                        setSelectedCategory(currentCategoryId);
                    }
                    
                    // প্রাপ্ত Blog ID অনুযায়ী উপলব্ধ ব্লগগুলোকে প্রাক-নির্বাচন করা
                    if (Array.isArray(currentContent)) {
                        const currentSelectedIds = currentContent.map(item => item.id);
                        const initialSelected = blogs.filter(blog => currentSelectedIds.includes(blog.id));
                        setSelectedBlogs(initialSelected);
                    }
                }


            } catch (err) {
                console.error("Data Fetch Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    // ❌ REMOVED: নির্বাচিত ক্যাটাগরি অনুসারে ব্লগ ফিল্টার করার useMemo ফাংশনটি সরিয়ে দেওয়া হলো।
    //             এখন 'availableBlogs' তালিকা সব সময় ব্যবহার করা হবে।
    /*
    const filteredBlogs = useMemo(() => {
        if (!selectedCategory) return availableBlogs;
        return availableBlogs.filter(blog => blog.categoryID === selectedCategory);
    }, [availableBlogs, selectedCategory]);
    */


    // ক্যাটাগরি পরিবর্তন হলে নির্বাচিত ব্লগগুলি রিসেট করা
    const handleCategoryChange = (e) => {
        const newCategoryId = e.target.value;
        setSelectedCategory(newCategoryId);
        // ক্যাটাগরি পরিবর্তন হলে নির্বাচিত তালিকা পরিষ্কার করা
        setSelectedBlogs([]);
    };


    // ব্লগ নির্বাচন/বাতিল করার ফাংশন
    const handleContentToggle = (blogItem) => {
        // যদি কোনো ক্যাটাগরি নির্বাচন করা না হয়, তাহলে নির্বাচন সম্ভব নয়
        if (!selectedCategory) {
            alert("অনুগ্রহ করে প্রথমে একটি ক্যাটাগরি নির্বাচন করুন।");
            return;
        }

        setSelectedBlogs(prev => {
            if (prev.find(a => a.id === blogItem.id)) {
                // রিমুভ
                return prev.filter(a => a.id !== blogItem.id);
            } else if (prev.length < MAX_SELECTION) {
                // যোগ করা
                return [...prev, blogItem];
            }
            return prev;
        });
    };

    // সেভ বাটন হ্যান্ডলার (API কল লজিক)
    const handleSave = async () => {
        if (!selectedCategory) {
            alert("অনুগ্রহ করে একটি ক্যাটাগরি নির্বাচন করুন।");
            return;
        }

        if (selectedBlogs.length === 0) {
            alert("অনুগ্রহ করে অন্তত একটি ব্লগ নির্বাচন করুন।");
            return;
        }
        
        // Payload স্ট্রাকচার: categoryId এবং content আইডি পাস করা হলো
        const payload = {
            categoryId: selectedCategory, 
            content: selectedBlogs.map(a => ({ id: a.id })), 
        };
        
        try {
            const response = await fetch(SPOTLIGHT_API, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Authorization header যদি দরকার হয়, তবে এখানে যোগ করতে হবে
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert(`সফলভাবে ${selectedBlogs.length} টি ব্লগ '${categories.find(c => c._id === selectedCategory)?.name || 'Unknown'}' ক্যাটাগরির জন্য সেট করা হয়েছে!`);
            } else {
                alert(`সেভ করতে সমস্যা হয়েছে: ${result.message || 'Unknown error'}`);
            }

        } catch (error) {
            console.error('Save failed:', error);
            alert('নেটওয়ার্ক বা সার্ভার কানেকশনে সমস্যা হয়েছে।');
        }
    };

    // ... (Loading/Error Check is the same) ...
    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500 dark:text-yellow-400" />
                <p className="ml-4">Loading Admin Data...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }


    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* হেডার */}
                <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-3xl font-extrabold text-indigo-500 dark:text-yellow-400 flex items-center">
                        <Target className="w-8 h-8 mr-3"/> 
                        Next Read Spotlight Manager
                    </h1>
                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150 ease-in-out shadow-md text-sm"
                    >
                        {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                    </button>
                </header>

                {/* মূল ফর্ম */}
                <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl space-y-8">
                    
                    {/* 🎯 ধাপ ১: ক্যাটাগরি নির্বাচন */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3 border-b pb-2 border-indigo-400 dark:border-yellow-400 flex items-center">
                            <ListOrdered className="w-5 h-5 mr-2"/> 1. ক্যাটাগরি নির্বাচন
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                            এই Spotlight ব্লকটি কোন ক্যাটাগরির জন্য সেট করা হবে তা নির্বাচন করুন।
                        </p>
                        <select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            <option value="">-- একটি ক্যাটাগরি নির্বাচন করুন --</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                        {!selectedCategory && (
                             <p className="mt-2 text-sm text-red-500">
                                অনুগ্রহ করে ব্লগ নির্বাচন করার আগে একটি ক্যাটাগরি নির্বাচন করুন।
                             </p>
                        )}
                    </section>


                    {/* ধাপ ২ (আগের ২): ব্লগ নির্বাচন */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3 border-b pb-2 border-indigo-400 dark:border-yellow-400 flex items-center">
                            <BookOpen className="w-5 h-5 mr-2"/> 2. ব্লগ নির্বাচন (সর্বোচ্চ {MAX_SELECTION})
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                            নির্বাচিত ক্যাটাগরির জন্য ৪টি ব্লগ নির্বাচন করুন। এই তালিকা সব ব্লগ দেখাবে।
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            {/* 🎯 পরিবর্তন: filteredBlogs এর পরিবর্তে availableBlogs ব্যবহার করা হলো */}
                            {availableBlogs.length > 0 ? (
                                availableBlogs.map(content => {
                                    const isSelected = selectedBlogs.find(a => a.id === content.id);
                                    return (
                                        <div 
                                            key={content.id} 
                                            onClick={() => handleContentToggle(content)}
                                            className={`p-4 rounded-lg cursor-pointer transition duration-200 border-2 flex flex-col ${
                                                isSelected
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 shadow-md'
                                                    : 'bg-gray-50 dark:bg-gray-700 border-transparent hover:border-gray-400 dark:hover:border-gray-500'
                                            } ${selectedBlogs.length >= MAX_SELECTION && !isSelected || !selectedCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            // 🎯 যদি ক্যাটাগরি সিলেক্ট না করা হয়, তবে ডিসেবল করুন
                                            aria-disabled={!selectedCategory}
                                        >
                                            <div className="flex justify-between items-center">
                                                <p className={`text-xs font-medium uppercase text-green-600 dark:text-yellow-400`}>
                                                    {content.categoryName} (Blog)
                                                </p>
                                                {isSelected && <X className="w-4 h-4 text-red-500"/>}
                                            </div>
                                            <p className="text-base font-bold truncate mt-1">
                                                {content.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                By {content.author}
                                            </p>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="col-span-2 text-center py-10 text-gray-500 dark:text-gray-400">
                                    কোনো ব্লগ পাওয়া যায়নি। অনুগ্রহ করে নিশ্চিত করুন `BLOG_LIST_API` থেকে ডেটা আসছে।
                                </p>
                            )}
                        </div>
                    </section>

                    {/* ধাপ ৩ (আগের ৩): রিভিউ এবং সেভ */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3 border-b pb-2 border-indigo-400 dark:border-yellow-400 flex items-center">
                            <Save className="w-5 h-5 mr-2"/> 3. নির্বাচন রিভিউ এবং সংরক্ষণ
                        </h2>
                        
                        <div className="mb-4 p-4 border border-indigo-200 dark:border-gray-600 rounded-lg bg-indigo-50 dark:bg-gray-700">
                            <p className="font-medium mb-2">
                                নির্বাচিত ক্যাটাগরি: <span className="font-bold text-indigo-600 dark:text-yellow-400">
                                    {categories.find(c => c._id === selectedCategory)?.name || 'Not Selected'}
                                </span>
                            </p>
                            <p className="font-medium mb-2">
                                বর্তমান নির্বাচন ({selectedBlogs.length} / {MAX_SELECTION}):
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm pl-4">
                                {selectedBlogs.length > 0 ? (
                                    selectedBlogs.map(content => (
                                        <li key={content.id} className="truncate">
                                            <span className="font-bold text-yellow-600 dark:text-yellow-400">
                                                [Blog]
                                            </span> {content.title}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500 dark:text-gray-400">
                                        কোনো কন্টেন্ট নির্বাচন করা হয়নি।
                                    </li>
                                )}
                            </ul>
                        </div>

                        <button
                            onClick={handleSave}
                            // 🎯 সেভ করার জন্য ক্যাটাগরি এবং ব্লগ উভয়ই নির্বাচন করা বাধ্যতামূলক
                            disabled={selectedBlogs.length === 0 || !selectedCategory}
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center space-x-2"
                        >
                            <Save className="w-5 h-5"/>
                            <span>Save Next Read Spotlight</span>
                        </button>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default NextReadSpotlightManagerPage;