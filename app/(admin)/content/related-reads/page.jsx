"use client";
import React, { useEffect, useState } from "react";
import { BookOpen, Link, ListOrdered, Loader2, Save, X } from "lucide-react";

// app/admin/content/related-reads/page.jsx

// --- API Configuration ---
// .env.local থেকে NEXT_PUBLIC_API_BASE_URL ব্যবহার করবে
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';

// আপনার প্রদত্ত API URLs
const CATEGORY_API = `${API_BASE_URL}/categories`; 
const ARTICLE_LIST_API = `${API_BASE_URL}/article/list`; 

// নতুন Related Reads API URLs
const RELATED_READS_SET_API = `${API_BASE_URL}/related-reads/admin/set`; 
const RELATED_READS_GET_IDS_API = `${API_BASE_URL}/related-reads/admin/ids`; 


const RelatedReadsManagerPage = () => {
    // থিম ম্যানেজমেন্ট 
    const [theme, setTheme] = useState('dark');
    
    // API ডেটা স্টেটস
    const [categories, setCategories] = useState([]); // [{ _id, name, slug }]
    const [allArticles, setAllArticles] = useState([]); // [{ _id, categoryName, title, slug }]
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ফর্ম স্টেটস
    const [targetCategorySlug, setTargetCategorySlug] = useState(''); // Stores category slug (e.g., 'technology')
    const [selectedArticles, setSelectedArticles] = useState([]); // Stores Article Objects
    const [availableArticles, setAvailableArticles] = useState([]); // Stores filterable Article Objects
    const MAX_SELECTION = 4;
    
    // টার্গেট ক্যাটাগরির নাম খুঁজে বের করা (UI-তে দেখানোর জন্য)
    const selectedCategoryObject = categories.find(cat => cat.slug === targetCategorySlug);
    const selectedCategoryName = selectedCategoryObject ? selectedCategoryObject.name : '';


    // ডার্ক/লাইট মোড টগল লজিক
    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', theme === 'dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(current => (current === 'light' ? 'dark' : 'light'));
    };
    
    // --- Data Fetching Logic (Initial Load) ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch Categories
                const catResponse = await fetch(CATEGORY_API);
                if (!catResponse.ok) throw new Error('Failed to fetch categories.');
                const catData = await catResponse.json();
                // ধরে নিচ্ছি API থেকে catData.data তে ক্যাটাগরি অ্যারে আসছে
                setCategories(catData.data || []); 

                // 2. Fetch All Articles
                const artResponse = await fetch(ARTICLE_LIST_API);
                if (!artResponse.ok) throw new Error('Failed to fetch articles.');
                const artData = await artResponse.json();
                // ধরে নিচ্ছি API থেকে artData.data তে আর্টিকেল অ্যারে আসছে
                setAllArticles(artData.data || []); 

            } catch (err) {
                console.error("Data Fetch Error:", err);
                setError("ডেটা লোডিং ব্যর্থ হয়েছে: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); 


    // --- Logic when Target Category Changes (Filter & Load Existing) ---
    useEffect(() => {
        const updateListsAndLoadExisting = async () => {
            setSelectedArticles([]); // নতুন ক্যাটাগরি নির্বাচনের সাথে সাথে বিদ্যমান সিলেকশন খালি করে দিন
            
            if (targetCategorySlug) {
                const targetCat = categories.find(cat => cat.slug === targetCategorySlug);

                // A. Available Articles Filter:
                // নির্বাচিত টার্গেট ক্যাটাগরি বাদে অন্য ক্যাটাগরির আর্টিকেলগুলি পাওয়া যাবে
                if (targetCat) {
                    const filtered = allArticles.filter(
                        // article.categoryName আপনার Article মডেলের একটি ফিল্ড ধরে নিচ্ছি যা category.name এর সাথে মেলে
                        article => article.categoryName !== targetCat.name 
                    );
                    setAvailableArticles(filtered);
                } else {
                    setAvailableArticles(allArticles);
                }

                
                // B. Load Existing Related Reads (Admin API Call):
                try {
                    const response = await fetch(`${RELATED_READS_GET_IDS_API}/${targetCategorySlug}`);
                    const data = await response.json();
                    
                    if (response.ok && data.success && data.data && data.data.length > 0) {
                        // data.data হলো existing relatedArticleIds অ্যারে
                        const existingIds = data.data.map(id => id.toString());
                        
                        // allArticles থেকে _id অনুযায়ী আর্টিকেল অবজেক্টগুলি খুঁজে বের করা
                        const existingArticles = allArticles.filter(article => 
                            // মঙ্গুজের _id ফিল্ড ব্যবহার করা হয়েছে
                            article._id && existingIds.includes(article._id.toString()) 
                        );
                        
                        setSelectedArticles(existingArticles);
                    } 
                } catch (err) {
                    console.error("Error loading existing related IDs:", err);
                }

            } else {
                setAvailableArticles([]);
            }
        };
        
        if (!loading && categories.length > 0 && allArticles.length > 0) {
            updateListsAndLoadExisting();
        }
        // dependency array-তে targetCategorySlug, allArticles, categories, loading রয়েছে
    }, [targetCategorySlug, allArticles, categories, loading]);


    // আর্টিকেল নির্বাচন/বাতিল করার ফাংশন
    const handleArticleToggle = (article) => {
        setSelectedArticles(prev => {
            // Mongoose ObjectId comparison
            if (prev.find(a => a._id.toString() === article._id.toString())) {
                // রিমুভ
                return prev.filter(a => a._id.toString() !== article._id.toString());
            } else if (prev.length < MAX_SELECTION) {
                // যোগ করা
                return [...prev, article];
            }
            return prev;
        });
    };

    // সেভ বাটন হ্যান্ডলার (API কল লজিক)
    const handleSave = async () => {
        if (!targetCategorySlug || selectedArticles.length === 0) {
            alert("অনুগ্রহ করে টার্গেট ক্যাটাগরি এবং অন্তত একটি রিলেটেড আর্টিকেল নির্বাচন করুন।");
            return;
        }

        const payload = {
            targetCategorySlug: targetCategorySlug,
            // ObjectId গুলো স্ট্রিং হিসাবে পাঠান
            relatedArticleIds: selectedArticles.map(a => a._id.toString()), 
        };
        
        try {
            const response = await fetch(RELATED_READS_SET_API, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${adminToken}` // যদি authentication থাকে 
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert(`সফলভাবে ${selectedCategoryName} ক্যাটাগরির জন্য ${selectedArticles.length} টি রিলেটেড আর্টিকেল সেট করা হয়েছে!`);
            } else {
                alert(`সেভ করার সময় একটি সমস্যা হয়েছে: ${data.message || 'অজানা এরর'}`);
                console.error('Save API Error:', data.error);
            }

        } catch (error) {
            console.error("API Call Error:", error);
            alert("সার্ভার বা নেটওয়ার্ক এরর।");
        }
    };


    // Loading/Error State UI
    if (loading) {
        return (
             <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <Loader2 className="w-8 h-8 animate-spin mr-3 text-indigo-400" />
                <span>ডেটা লোড হচ্ছে...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500">
                <p className="p-4 bg-gray-800 rounded-lg shadow-xl">এরর: {error}</p>
            </div>
        );
    }


    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* হেডার এবং থিম টগল */}
                <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-3xl font-extrabold text-indigo-500 dark:text-yellow-400 flex items-center">
                        <Link className="w-8 h-8 mr-3"/> 
                        Related Reads Manager
                    </h1>
                    {/* ডামি থিম টগল বাটন */}
                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150 ease-in-out shadow-md text-sm"
                    >
                        {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                    </button>
                </header>

                {/* মূল ফর্ম */}
                <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl space-y-8">
                    
                    {/* ধাপ ১: টার্গেট ক্যাটাগরি নির্বাচন */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3 border-b pb-2 border-indigo-400 dark:border-yellow-400 flex items-center">
                            <ListOrdered className="w-5 h-5 mr-2"/> 1. টার্গেট ক্যাটাগরি নির্বাচন
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                            যে ক্যাটাগরি পেজে আপনি 'Related Reads' প্রদর্শন করতে চান, সেটি নির্বাচন করুন।
                        </p>
                        
                        <select
                            value={targetCategorySlug}
                            onChange={(e) => setTargetCategorySlug(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-base focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            <option value="">-- একটি ক্যাটাগরি নির্বাচন করুন --</option>
                            {categories.map(cat => (
                                // value হিসেবে slug ব্যবহার করা হচ্ছে, যা API এর জন্য প্রয়োজন
                                <option key={cat._id} value={cat.slug}>{cat.name}</option> 
                            ))}
                        </select>
                        {targetCategorySlug && (
                            <p className="mt-2 text-sm font-medium text-indigo-600 dark:text-yellow-400">
                                আপনি <span className="font-bold">{selectedCategoryName}</span> ক্যাটাগরির জন্য সেট করছেন।
                            </p>
                        )}
                    </section>

                    {/* ধাপ ২: আর্টিকেল নির্বাচন */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3 border-b pb-2 border-indigo-400 dark:border-yellow-400 flex items-center">
                            <BookOpen className="w-5 h-5 mr-2"/> 2. রিলেটেড আর্টিকেল নির্বাচন (সর্বোচ্চ {MAX_SELECTION})
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                            <span className="font-bold text-red-500">অন্যান্য ক্যাটাগরি</span> থেকে আর্টিকেল নির্বাচন করুন।
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            {targetCategorySlug ? (
                                availableArticles.length > 0 ? (
                                    availableArticles.map(article => {
                                        // Mongoose _id ব্যবহার করে সিলেকশন চেক
                                        const isSelected = selectedArticles.find(a => a._id.toString() === article._id.toString());
                                        return (
                                            <div 
                                                key={article._id} // _id ব্যবহার করা হয়েছে
                                                onClick={() => handleArticleToggle(article)}
                                                className={`p-4 rounded-lg cursor-pointer transition duration-200 border-2 flex flex-col ${
                                                    isSelected
                                                        ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 shadow-md'
                                                        : 'bg-gray-50 dark:bg-gray-700 border-transparent hover:border-gray-400 dark:hover:border-gray-500'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs font-medium uppercase text-yellow-600 dark:text-yellow-400">
                                                        {article.categoryName}
                                                    </p>
                                                    {isSelected && <X className="w-4 h-4 text-red-500"/>}
                                                </div>
                                                <p className="text-base font-bold truncate mt-1">
                                                    {article.title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    By {article.author}
                                                </p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="col-span-2 text-center py-10 text-gray-500 dark:text-gray-400">
                                        এই ক্যাটাগরি বাদে অন্য কোনো আর্টিকেল পাওয়া যায়নি।
                                    </p>
                                )
                            ) : (
                                <p className="col-span-2 text-center py-10 text-gray-500 dark:text-gray-400 font-medium">
                                    অনুগ্রহ করে প্রথমে টার্গেট ক্যাটাগরি নির্বাচন করুন।
                                </p>
                            )}
                        </div>
                    </section>

                    {/* ধাপ ৩: রিভিউ এবং সেভ */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3 border-b pb-2 border-indigo-400 dark:border-yellow-400 flex items-center">
                            <Save className="w-5 h-5 mr-2"/> 3. নির্বাচন রিভিউ এবং সংরক্ষণ
                        </h2>
                        
                        <div className="mb-4 p-4 border border-indigo-200 dark:border-gray-600 rounded-lg bg-indigo-50 dark:bg-gray-700">
                            <p className="font-medium mb-2">
                                বর্তমান নির্বাচন ({selectedArticles.length} / {MAX_SELECTION}):
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm pl-4">
                                {selectedArticles.length > 0 ? (
                                    selectedArticles.map(article => (
                                        <li key={article._id} className="truncate">
                                            <span className="font-bold text-indigo-600 dark:text-yellow-400">
                                                [{article.categoryName}]
                                            </span> {article.title}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500 dark:text-gray-400">
                                        কোনো আর্টিকেল নির্বাচন করা হয়নি।
                                    </li>
                                )}
                            </ul>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={!targetCategorySlug || selectedArticles.length === 0}
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center space-x-2"
                        >
                            <Save className="w-5 h-5"/>
                            <span>{`Save Related Reads for ${selectedCategoryName || 'Category'}`}</span>
                        </button>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default RelatedReadsManagerPage;