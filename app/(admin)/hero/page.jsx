"use client";
import React, { useEffect, useState } from "react";

// app/admin/hero/page.jsx

// .env.local থেকে API Base URL ব্যবহার করা হলো
// NEXT_PUBLIC_API_BASE_URL: https://blog-server-0exu.onrender.com/api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://blog-server-0exu.onrender.com/api";
// 🔥 সল্যুশন: API ENDPOINT পরিবর্তন করা হলো /featured-hero এ
const API_ENDPOINT = `${API_BASE_URL}/featured-hero`; // Featured Hero API পাথ (সংশোধিত)
const CATEGORIES_API_ENDPOINT = `${API_BASE_URL}/categories`; // ক্যাটাগরি ফেচ করার API পাথ

const FeaturedHeroAdminPage = () => {
    // ফর্ম স্টেট
    const [formData, setFormData] = useState({
        categorySlug: '', // ফেচ করা ক্যাটাগরি দিয়ে এটি প্রথম ক্যাটাগরি স্লাগ-এ সেট হবে
        heroTitle: '',
        heroDescription: '',
        imageURL: '/Assets/images/default_hero.jpg', 
        altText: '', 
        isPublished: true,
    });
    // ইমেজ আপলোডের জন্য ডেডিকেটেড স্টেট
    const [heroImageFile, setHeroImageFile] = useState(null); 
    // ফেচ করা ক্যাটাগরিগুলি রাখার স্টেট
    const [fetchedCategories, setFetchedCategories] = useState([]); 

    // ✅ Effect: API থেকে ক্যাটাগরি লোড করা হচ্ছে
    useEffect(() => {
        const loadCategories = async () => {
            try {
                console.log(`Fetching categories from: ${CATEGORIES_API_ENDPOINT}`);
                const response = await fetch(CATEGORIES_API_ENDPOINT);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch categories. Status: ${response.status}`);
                }
                
                const data = await response.json(); 
                
                // ডেটা সঠিকভাবে এলে এবং অ্যারে হলে
                if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
                    const categorySlugs = data.data.map(cat => ({
                        slug: cat.slug,
                        name: cat.name 
                    }));
                    setFetchedCategories(categorySlugs);
                    // প্রথম ক্যাটাগরি দিয়ে categorySlug সেট করা
                    setFormData(prev => ({ 
                        ...prev, 
                        categorySlug: categorySlugs[0].slug 
                    }));
                } else {
                    console.warn("No categories fetched or unexpected data format:", data);
                    // যদি কোনো ক্যাটাগরি না থাকে, তবে একটি ফলব্যাক যুক্ত করা যেতে পারে
                    setFetchedCategories([]); 
                }
            } catch (error) {
                console.error("Failed to load categories:", error.message);
                alert('🚨 Error loading categories. Check if backend is running.');
            }
        };
        loadCategories();
    }, []); // কম্পোনেন্ট মাউন্ট হওয়ার সময় একবার রান করবে


    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file') {
            // ফাইল ইনপুট হ্যান্ডলিং
            setHeroImageFile(files[0]);
        } else {
            // অন্যান্য ইনপুট হ্যান্ডলিং
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // FormData ব্যবহার করে টেক্সট ও ফাইল একসাথে পাঠানো
        const uploadData = new FormData();
        uploadData.append('categorySlug', formData.categorySlug);
        uploadData.append('heroTitle', formData.heroTitle);
        uploadData.append('heroDescription', formData.heroDescription);
        uploadData.append('imageURL', formData.imageURL);
        uploadData.append('altText', formData.altText);
        // Checkbox value is sent as a string to the server
        uploadData.append('isPublished', formData.isPublished.toString()); 
        
        // যদি নতুন ফাইল সিলেক্ট করা হয়, তবে heroImageFile নামে ফাইলটি পাঠানো হবে
        // সার্ভারে `middleware/upload.js` এ এই নাম (`heroImageFile`) ব্যবহার করা হয়েছে
        if (heroImageFile) {
            uploadData.append('heroImageFile', heroImageFile); 
        }

        try {
            console.log(`Attempting to save Featured Hero data to: ${API_ENDPOINT}`);

            const response = await fetch(API_ENDPOINT, { 
                method: 'POST',
                // FormData ব্যবহার করার জন্য 'Content-Type' হেডার সেট করার দরকার নেই।
                body: uploadData, 
            });

            if (response.ok) {
                const result = await response.json();
                alert(`✅ Success: ${result.message}`);
                console.log("API Response:", result.data);
                // সাফল্যের পরে আপনি চাইলে form reset করে দিতে পারেন
            } else {
                const error = await response.json();
                alert(`❌ Error: Failed to save hero content. ${error.message || response.statusText}`);
                console.error("API Error:", error);
            }
        } catch (error) {
            alert('🚨 Network Error: API কল ব্যর্থ হয়েছে। আপনার ব্যাকএন্ড সার্ভার চলছে কিনা চেক করুন।');
            console.error('Network or Server Error:', error);
        }
    };

    return (
        <div className="min-h-screen p-4 sm:p-8 bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
            
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    🌟 Featured Hero Management
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                    Select a category and define its main Article Hero section content.
                </p>
            </header>

            <div className="max-w-4xl bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl transition duration-500">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* ১. ক্যাটাগরি নির্বাচন */}
                    <div>
                        <label 
                            htmlFor="categorySlug" 
                            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Select Category
                        </label>
                        <select
                            id="categorySlug"
                            name="categorySlug"
                            value={formData.categorySlug}
                            onChange={handleChange}
                            required // এটি ক্যাটাগরি সিলেক্ট করা আবশ্যক করে
                            disabled={fetchedCategories.length === 0} // ক্যাটাগরি লোড না হলে disabled থাকবে
                            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-yellow-400 dark:focus:border-yellow-400 disabled:opacity-50"
                        >
                            {/* ক্যাটাগরি লোড না হলে একটি ডিফল্ট অপশন দেখাবে */}
                            {fetchedCategories.length === 0 && (
                                <option value="">{formData.categorySlug ? formData.categorySlug.toUpperCase() : "Loading categories..."}</option>
                            )}

                            {/* ফেচ করা ক্যাটাগরি তালিকা */}
                            {fetchedCategories.map(cat => (
                                <option key={cat.slug} value={cat.slug}>
                                    {cat.name} 
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ২. হিরো টাইটেল */}
                    <div>
                        <label 
                            htmlFor="heroTitle" 
                            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Hero Title (FeaturedArticleHero H1)
                        </label>
                        <input
                            type="text"
                            name="heroTitle"
                            id="heroTitle"
                            value={formData.heroTitle}
                            onChange={handleChange}
                            required
                            placeholder="e.g., The Future of AI in Technology"
                            className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500 dark:focus:ring-yellow-400 dark:focus:border-yellow-400"
                        />
                    </div>

                    {/* ৩. ইমেজ ম্যানেজমেন্ট */}
                    <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                         {/* ৩.১. বর্তমান ইমেজ URL প্রদর্শন (এডিট করার জন্য) */}
                        <label 
                            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Current Image URL
                        </label>
                        <input
                            type="text"
                            name="imageURL"
                            value={formData.imageURL}
                            onChange={handleChange}
                            placeholder="/path/to/current/image.jpg"
                            className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500 dark:focus:ring-yellow-400 dark:focus:border-yellow-400"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {/* নতুন ফাইল সিলেক্ট হলে ফাইলের নাম দেখাবে */}
                            {heroImageFile 
                                ? `New file selected: ${heroImageFile.name}` 
                                : 'Upload a new image file below to replace the current one.'}
                        </p>
                        
                        {/* ৩.২. ইমেজ আপলোড ইনপুট */}
                        <div>
                            <label 
                                htmlFor="heroImageFile" 
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                            >
                                Upload New Image File (Optional)
                            </label>
                            <input
                                type="file"
                                name="heroImageFile"
                                id="heroImageFile"
                                accept="image/*"
                                onChange={handleChange}
                                className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-yellow-400 dark:file:text-gray-900 hover:file:bg-indigo-100 dark:hover:file:bg-yellow-500"
                            />
                        </div>
                    </div>

                    {/* ৪. Alt Text */}
                    <div>
                        <label 
                            htmlFor="altText" 
                            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Image Alt Text (SEO & Accessibility)
                        </label>
                        <input
                            type="text"
                            name="altText"
                            id="altText"
                            value={formData.altText}
                            onChange={handleChange}
                            required
                            placeholder="Describe the image content for screen readers."
                            className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500 dark:focus:ring-yellow-400 dark:focus:border-yellow-400"
                        />
                    </div>

                    {/* ৫. হিরো ডেসক্রিপশন */}
                    <div>
                        <label 
                            htmlFor="heroDescription" 
                            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Hero Description
                        </label>
                        <textarea
                            name="heroDescription"
                            id="heroDescription"
                            rows="3"
                            value={formData.heroDescription}
                            onChange={handleChange}
                            placeholder="A short description of what this featured content is about."
                            className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500 dark:focus:ring-yellow-400 dark:focus:border-yellow-400"
                        ></textarea>
                    </div>

                    {/* ৬. পাবলিশ স্ট্যাটাস */}
                    <div className="flex items-center">
                        <input
                            id="isPublished"
                            name="isPublished"
                            type="checkbox"
                            checked={formData.isPublished}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-yellow-400 dark:checked:bg-yellow-400 dark:checked:border-yellow-400"
                        />
                        <label 
                            htmlFor="isPublished" 
                            className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-200"
                        >
                            Publish Hero Section
                        </label>
                    </div>

                    {/* ৭. সেভ বাটন */}
                    <div>
                        <button
                            type="submit"
                            disabled={fetchedCategories.length === 0} // ক্যাটাগরি লোড না হলে সাবমিট disabled থাকবে
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-yellow-400 dark:text-gray-900 dark:hover:bg-yellow-500 dark:focus:ring-yellow-400 dark:focus:ring-offset-gray-900 transition duration-300 disabled:opacity-50"
                        >
                            Save Featured Hero Content
                        </button>
                    </div>
                </form>
            </div>
            
            {/* প্রিভিউ সেকশন */}
<div className="mt-10">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Live Preview (Simulated)</h2>
    <div className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden p-4">
        <p className="text-gray-600 dark:text-gray-400">
            **Preview Data:**
            <br/>Category Slug: **{formData.categorySlug.toUpperCase()}**
            <br/>Title: **{formData.heroTitle || 'No Title Entered'}**
            <br/>Image Alt: **{formData.altText || 'No Alt Text'}**
            <br/>Description: {formData.heroDescription || 'No Description'}
            <br/>Current/Old Image URL: {formData.imageURL}
            {/* ✅ FIX: <p> কে <span> দিয়ে প্রতিস্থাপন করা হলো */}
            {heroImageFile && <span className="block text-sm text-indigo-500 dark:text-yellow-400 mt-2">New Image File Selected: {heroImageFile.name}</span>}
        </p>
    </div>
</div>
        </div>
    );
};

export default FeaturedHeroAdminPage;