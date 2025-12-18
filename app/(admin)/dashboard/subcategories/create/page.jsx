"use client";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, List, Loader2, PlusCircle } from "lucide-react";

// API Endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
const CATEGORY_API_URL = `${API_BASE_URL}/categories`; 
// URL ফিক্সড: আপনার সার্ভার রাউট অনুযায়ী /subcategories রাখা হলো
const SUBCATEGORY_API_URL = `${API_BASE_URL}/subcategories`; 

export default function AddSubCategoryPage() {
    const [subCategoryName, setSubCategoryName] = useState('');
    const [subCategorySlug, setSubCategorySlug] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(''); // প্রধান ক্যাটেগরি ID
    const [categories, setCategories] = useState([]); // প্রধান ক্যাটেগরিগুলির তালিকা
    const [isLoading, setIsLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // 🌟 API থেকে প্রধান ক্যাটেগরি ডেটা লোড করার ফাংশন 
    const fetchCategories = useCallback(async () => {
        setLoadingCategories(true);
        setError(null);
        try {
            const response = await fetch(CATEGORY_API_URL, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch categories: HTTP ${response.status} (${response.statusText})`);
            }

            const data = await response.json();
            
            // নিশ্চিত করা যে ডেটা একটি অ্যারে
            let categoriesArray = data;
            
            if (data && data.data && Array.isArray(data.data)) {
                 categoriesArray = data.data; 
            } else if (data && Array.isArray(data)) {
                 categoriesArray = data;
            } else if (data && data.categories && Array.isArray(data.categories)) {
                 categoriesArray = data.categories; 
            } else {
                categoriesArray = []; 
            }

            // ডেটা স্ট্রাকচার ম্যাপ করে ব্যবহার করুন 
            const formattedCategories = categoriesArray.map(item => ({ 
                id: item.id || item._id, // আপনার API অনুযায়ী ID
                name: item.name || item.title // আপনার API অনুযায়ী নাম
            }));

            setCategories(formattedCategories);
            
        } catch (err) {
            console.error("Fetch Categories Error:", err);
            setError(`Could not load parent categories: ${err.message}.`);
            setCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleNameChange = (e) => {
        const name = e.target.value;
        setSubCategoryName(name);
        setError(null);
        setSuccess(false);

        // অটোমেটিক স্ল্যাগ তৈরি
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
        setSubCategorySlug(slug);
    };

    // 💥 API দিয়ে সাব-ক্যাটাগরি তৈরি করার ফাংশন
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!subCategoryName || !subCategorySlug || !selectedCategory) {
            setError("All fields are required (Name, Slug, and Parent Category).");
            return;
        }

        setIsLoading(true);
        
        // 🚨 ফিক্সড: ব্যাকএন্ড কন্ট্রোলার অনুযায়ী 'category' হিসেবে পাঠানো হচ্ছে।
        const newSubCategory = {
            name: subCategoryName,
            slug: subCategorySlug,
            category: selectedCategory, 
            // অন্যান্য ফিল্ড
        };

        try {
            const response = await fetch(SUBCATEGORY_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify(newSubCategory),
            });

            if (!response.ok) {
                // error response body parse করার চেষ্টা এবং HTTP স্ট্যাটাস যুক্ত করা
                let errorMessage = `Failed to add sub-category (Status: ${response.status} ${response.statusText}).`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorData.text || errorMessage;
                } catch (e) {
                    // JSON parsing failed, use status text
                }
                // এখানে errorMessage সেট করে throw করা হচ্ছে, যা আপনার কনসোল এরর (Code Frame) এ ধরা পড়ছে
                throw new Error(errorMessage); 
            }

            // সফলতার বার্তা
            const data = await response.json();
            setSuccess(true);
            
            // ফর্ম রিসেট
            setSubCategoryName('');
            setSubCategorySlug('');
            setSelectedCategory('');

        } catch (err) {
            console.error("Submission Error:", err);
            // এখানে Error হ্যান্ডেল হচ্ছে
            setError(`Failed to add sub-category: ${err.message}.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <PlusCircle className="w-7 h-7 text-indigo-500" />
                    Add New Sub-Category
                </h1>
                <Link href="/dashboard/subcategories" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-md hover:bg-indigo-700 transition duration-200 flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Sub-Category List
                </Link>
            </div>

            {/* Form Card */}
            <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Parent Category Select Dropdown */}
                    <div>
                        <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Parent Category
                        </label>
                        <div className="relative">
                            <select
                                id="parentCategory"
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setError(null);
                                    setSuccess(false);
                                }}
                                required
                                disabled={isLoading || loadingCategories || categories.length === 0}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm appearance-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 pr-10 disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                {loadingCategories ? (
                                    <option value="" disabled>Loading Categories...</option>
                                ) : categories.length === 0 ? (
                                    <option value="" disabled>No Categories Found</option>
                                ) : (
                                    <>
                                        <option value="" disabled>-- Choose a Category --</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300 pointer-events-none" />
                        </div>
                    </div>

                    {/* Sub-Category Name Input */}
                    <div>
                        <label htmlFor="subCategoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sub-Category Name
                        </label>
                        <input
                            id="subCategoryName"
                            type="text"
                            value={subCategoryName}
                            onChange={handleNameChange}
                            required
                            placeholder="e.g., UI/UX Principles"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                    </div>

                    {/* Sub-Category Slug Input */}
                    <div>
                        <label htmlFor="subCategorySlug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sub-Category Slug
                        </label>
                        <input
                            id="subCategorySlug"
                            type="text"
                            value={subCategorySlug}
                            onChange={(e) => setSubCategorySlug(e.target.value)}
                            required
                            placeholder="e.g., ui-ux-principles"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            The slug is used in the URL.
                        </p>
                    </div>

                    {/* Status/Message Area */}
                    {error && (
                        <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-800 dark:text-red-100 rounded-md" role="alert">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 text-sm text-green-700 bg-green-100 dark:bg-green-800 dark:text-green-100 rounded-md" role="alert">
                            Sub-Category **"{subCategoryName}"** added successfully!
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || loadingCategories || categories.length === 0}
                        className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition duration-200 ${
                            isLoading || loadingCategories || categories.length === 0
                                ? 'bg-indigo-400 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800'
                        }`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <PlusCircle className="w-5 h-5 mr-2" />
                        )}
                        {isLoading ? 'Adding Sub-Category...' : 'Add Sub-Category'}
                    </button>
                </form>
            </div>
        </div>
    );
}
