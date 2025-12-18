"use client";
import React, { useEffect, useState } from "react";
import { Grid3X3, ListTree, Loader2, PlusCircle, Save, Trash2, XCircle } from "lucide-react";

// API Base URL (page.jsx এবং subcategorylist.jsx থেকে প্রাপ্ত)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://blog-server-0exu.onrender.com/api";
// ✅ নতুন API URL যোগ করা হলো টপ টপিক সেভ করার জন্য
const TOP_TOPICS_API_URL = `${API_BASE_URL}/v1/admin/top-topics`;

// --- API ফেচিং ফাংশন (আগের সলিউশন থেকে) ---

// ✅ API Call function: সকল ক্যাটাগরি ফেচ
const fetchCategories = async () => {
  const url = `${API_BASE_URL}/categories`; // /api/categories
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories. Status: ${response.status}`);
    }
    const data = await response.json();
    if (data?.success && Array.isArray(data.data)) {
      return data.data.map(cat => ({ id: cat._id, name: cat.name })); 
    }
    throw new Error("Unexpected data format from categories API.");
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    throw error;
  }
};

// ✅ API Call function: সকল সাব-ক্যাটাগরি ফেচ (স্বাধীনভাবে)
const fetchSubCategories = async () => {
  const url = `${API_BASE_URL}/subcategories`; // /api/subcategories
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch sub-categories. Status: ${response.statusText}`);
    }
    const responseData = await response.json();
    
    let categoryArray = [];
    if (Array.isArray(responseData)) {
        categoryArray = responseData;
    } else if (responseData && Array.isArray(responseData.subCategories)) {
        categoryArray = responseData.subCategories;
    } else if (responseData && Array.isArray(responseData.data)) {
        categoryArray = responseData.data;
    }

    return categoryArray.map(subcat => ({ 
        id: subcat._id || subcat.id, 
        name: subcat.name,
        // articleCount যোগ করা হলো, যা টপ টপিক লিস্টে দেখাতে সুবিধা হবে
        articleCount: subcat.articleCount || 0 
    }));

  } catch (error) {
    console.error("Error fetching sub-categories:", error.message);
    throw error;
  }
};


// ✅ API Call function: বর্তমান নির্বাচিত টপ টপিক লোড করা (যদি থাকে)
const fetchCurrentTopTopics = async (categoryId) => {
    // Note: আপনার topTopicRoutes.js-এ এই ধরনের কোনো রুট নেই। 
    // তবে যদি টপ টপিকগুলো ক্যাটাগরি ID এর ভিত্তিতে লোড করতে হয়, তবে backend-এ একটি GET রুট থাকতে হবে, 
    // যা TopTopicSelection মডেল থেকে নির্বাচিত subCategoryIds ফেরত দেবে। 
    // আপাতত, ক্যাটাগরি সিলেক্ট করলে শুধু সাব-ক্যাটাগরি লিস্ট দেখাবে। 
    // এই ফাংশনটি লোড হওয়া ডেটাকে ফিল্টার করার জন্য ব্যবহার করা যেতে পারে, যা আপাতত প্রয়োজন নেই।
    return []; 
};


const TopTopicsManagerPage = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  
  const [targetCategory, setTargetCategory] = useState(""); // ক্যাটাগরি ID
  const [targetSubCategory, setTargetSubCategory] = useState(""); // সাব-ক্যাটাগরি ID
  
  // নির্বাচিত টপ টপিকগুলির একটি অ্যারে ({id, name, articleCount})
  const [selectedTopTopics, setSelectedTopTopics] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // ক্যাটাগরি এবং সাব-ক্যাটাগরি ডেটা স্বাধীনভাবে লোড করা
    const loadData = async () => {
      let fetchError = [];
      setLoading(true);

      // 1. Fetch Categories
      try {
        const catData = await fetchCategories();
        setCategories(catData);
      } catch (err) {
        fetchError.push(`Category Load Error: ${err.message}`);
      }
      
      // 2. Fetch Sub-Categories
      try {
        const subCatData = await fetchSubCategories();
        setSubCategories(subCatData);
      } catch (err) {
        fetchError.push(`Sub-Category Load Error: ${err.message}`);
      }
      
      if (fetchError.length > 0) {
          setError(`ডেটা লোড ত্রুটি: ${fetchError.join(' | ')}. অনুগ্রহ করে API কনফিগারেশন চেক করুন।`);
      } else {
          setError(null);
      }
      
      setLoading(false);
    };

    loadData();
  }, []);

  // --- টপিক নির্বাচন হ্যান্ডেল করা ---

  const handleSelectTopTopic = () => {
    if (!targetSubCategory) return;
    setMessage(null);
    setError(null);

    // সাব-ক্যাটাগরি ডেটা থেকে নির্বাচিত টপিকটি খুঁজে বের করা
    const topicToAdd = subCategories.find(sub => sub.id === targetSubCategory);

    if (!topicToAdd) return;

    // টপিকটি ইতিমধ্যে নির্বাচিত কিনা চেক করা
    const isAlreadySelected = selectedTopTopics.some(topic => topic.id === topicToAdd.id);
    if (isAlreadySelected) {
        setMessage("এই টপিকটি ইতিমধ্যে নির্বাচিত হয়েছে।");
        return;
    }

    // সর্বোচ্চ ৫টি টপিক নির্বাচন সীমাবদ্ধতা
    if (selectedTopTopics.length >= 5) {
        setMessage("সর্বোচ্চ ৫টি টপিক নির্বাচন করা যেতে পারে।");
        return;
    }

    // টপিকটি নির্বাচিত তালিকায় যোগ করা
    setSelectedTopTopics(prev => [...prev, topicToAdd]);
    setTargetSubCategory(""); // নির্বাচন ফিল্ড রিসেট করা
    setMessage("টপিকটি সফলভাবে যোগ করা হয়েছে।");
  };

  const handleRemoveTopTopic = (topicId) => {
      setSelectedTopTopics(prev => prev.filter(topic => topic.id !== topicId));
      setMessage("টপিকটি তালিকা থেকে সরানো হয়েছে।");
  };

  // --- সেভ ফাংশন (আপনার অনুরোধ অনুযায়ী API কল যোগ করা হলো) ---

  const handleSave = async () => {
    if (!targetCategory) {
        setError("অনুগ্রহ করে টার্গেট ক্যাটাগরি নির্বাচন করুন।");
        return;
    }
    if (selectedTopTopics.length === 0) {
        setError("অনুগ্রহ করে কমপক্ষে একটি টপিক নির্বাচন করুন।");
        return;
    }

    const subCategoryIds = selectedTopTopics.map(topic => topic.id);
    
    const payload = {
        categoryId: targetCategory,
        subCategoryIds: subCategoryIds
    };

    setSaving(true);
    setError(null);
    setMessage(null);
    
    try {
        // topTopicRoutes.js-এ সংজ্ঞায়িত রুট: /api/v1/admin/top-topics (POST)
        const response = await fetch(TOP_TOPICS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Authorization Token (যদি দরকার হয়, তবে এখানে যোগ করতে হবে)
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            setMessage(`✅ সফলভাবে টপ টপিকগুলি সেভ করা হয়েছে: ${data.message || 'সংরক্ষণ সম্পন্ন'}`);
        } else {
            // সার্ভার থেকে আসা এরর মেসেজ প্রদর্শন
            throw new Error(data.message || `API ত্রুটি: ${response.statusText}`);
        }

    } catch (err) {
        console.error("Save Error:", err);
        setError(`সংরক্ষণ ব্যর্থ: ${err.message}`);
    } finally {
        setSaving(false);
    }
  };


  // --- JSX Rendering ---

  // ক্যাটাগরি নির্বাচনের জন্য নাম খুঁজে বের করা
  const targetCategoryName = categories.find(c => c.id === targetCategory)?.name || 'Category';

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          ⭐ টপ টপিক ম্যানেজার
        </h1>
      </div>
      

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-48 text-indigo-600 dark:text-indigo-400">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          ক্যাটাগরি এবং সাব-ক্যাটাগরি লোড করা হচ্ছে...
        </div>
      )}

      {/* Message/Error Display */}
      {message && !error && (
        <div className="p-4 mb-4 bg-green-100 border border-green-400 text-green-700 dark:bg-green-900 dark:text-green-100 rounded-lg" role="alert">
          {message}
        </div>
      )}
      
      {error && (
        <div className="p-4 mb-4 flex flex-col bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:text-red-100 rounded-lg" role="alert">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 mr-3" />
            <span className="font-medium">ত্রুটি:</span>
          </div>
          <p className="text-sm mt-1 ml-8">{error}</p>
        </div>
      )}
      
      {/* Selection Fields and Top Topics List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* বাম দিকের টার্গেট ফিল্ডস */}
        <section className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">নির্বাচন সেকশন</h2>

            {/* 1. Category Selection */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-3">
                    <Grid3X3 className="w-5 h-5" />
                    টার্গেট ক্যাটাগরি নির্বাচন
                </h3>
                <select
                    value={targetCategory}
                    onChange={(e) => {
                        setTargetCategory(e.target.value);
                        setSelectedTopTopics([]); // ক্যাটাগরি পরিবর্তন হলে নির্বাচিত টপিক রিসেট
                        setMessage("টার্গেট ক্যাটাগরি পরিবর্তিত হয়েছে। টপ টপিক রিসেট করা হলো।");
                    }}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 transition duration-150"
                    disabled={loading || error || categories.length === 0}
                >
                    <option value="">-- একটি ক্যাটাগরি নির্বাচন করুন --</option>
                    {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.name}
                    </option>
                    ))}
                </select>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-xl font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-2 mb-4">
                    <ListTree className="w-5 h-5" />
                    সাব-ক্যাটাগরি নির্বাচন ও যোগ করুন
                </h3>
                <div className="flex space-x-3">
                    {/* 2. Sub-Category Selection */}
                    <select
                        value={targetSubCategory}
                        onChange={(e) => setTargetSubCategory(e.target.value)}
                        className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-gray-100 transition duration-150"
                        disabled={loading || error || subCategories.length === 0}
                    >
                        <option value="">-- একটি সাব-ক্যাটাগরি নির্বাচন করুন --</option>
                        {subCategories.map((subcat) => (
                        <option key={subcat.id} value={subcat.id}>
                            {subcat.name} ({subcat.articleCount} Articles)
                        </option>
                        ))}
                    </select>
                    <button
                        onClick={handleSelectTopTopic}
                        disabled={!targetSubCategory || selectedTopTopics.length >= 5}
                        className="py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center space-x-2"
                    >
                        <PlusCircle className="w-5 h-5" />
                        <span>যোগ করুন</span>
                    </button>
                </div>
                {selectedTopTopics.length >= 5 && (
                    <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                        সর্বোচ্চ ৫টি টপিক নির্বাচন করা হয়েছে।
                    </p>
                )}
            </div>
        </section>


        {/* ডান দিকের নির্বাচিত টপিক এবং সেভ সেকশন */}
        <section className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col h-full">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center justify-between">
                <span>নির্বাচিত টপ টপিক (Max 5)</span>
                <span className="text-lg font-mono text-indigo-500 dark:text-yellow-400">{selectedTopTopics.length}/5</span>
            </h2>

            {/* নির্বাচিত টপিক লিস্ট */}
            <div className="flex-grow min-h-[200px] bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-600">
                <ul className="space-y-3">
                    {selectedTopTopics.length > 0 ? (
                        selectedTopTopics.map((topic, index) => (
                            <li key={topic.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-gray-100 dark:border-gray-600">
                                <span className="truncate text-gray-800 dark:text-gray-100 font-medium">
                                    {index + 1}. {topic.name}
                                </span>
                                <button
                                    onClick={() => handleRemoveTopTopic(topic.id)}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 p-1"
                                    title="অপসারণ করুন"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </li>
                        ))
                    ) : (
                        <li className="text-gray-500 dark:text-gray-400 text-center py-8">
                            কোনো টপিক নির্বাচন করা হয়নি।
                        </li>
                    )}
                </ul>
            </div>

            {/* সেভ বাটন (আপনার অনুরোধ অনুযায়ী যুক্ত করা হয়েছে) */}
            <button
                onClick={handleSave}
                disabled={!targetCategory || selectedTopTopics.length === 0 || saving}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center space-x-2"
            >
                {saving ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                ) : (
                    <>
                        <Save className="w-5 h-5"/>
                        <span>{`Save Top Topics for ${targetCategoryName}`}</span>
                    </>
                )}
            </button>
        </section>

      </div>
    </div>
  );
};

export default TopTopicsManagerPage;