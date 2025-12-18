"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { List, Loader2, Save, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// app/dashboard/subcategories/edit/[id]/page.jsx

// API Base URL (আপনার .env.local থেকে আসা উচিত)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://blog-server-0exu.onrender.com/api";

// ডেমো ক্যাটেগরি ডেটা (রিয়েল অ্যাপ্লিকেশনে API থেকে লোড হবে)
const dummyCategories = [
    { _id: 'tech-101', name: 'Technology' },
    { _id: 'design-202', name: 'Design' },
    // ...
];

// 💡 ডাইনামিক রাউট থেকে ID পেতে props ব্যবহার করা হয়
export default function EditSubCategoryPage({ params }) {
    const subCategoryId = params.id; // URL থেকে ID নেওয়া
    const router = useRouter();
    
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(''); // প্রধান ক্যাটেগরি ID
    const [categories, setCategories] = useState(dummyCategories);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // ১. ডেটা ফেইচ করা
    useEffect(() => {
        const fetchSubCategoryData = async () => {
            if (!subCategoryId) return;
            setIsLoading(true);
            try {
                // 🚨 রিয়েল API কল: নির্দিষ্ট সাব-ক্যাটেগরি ডেটা ফেইচ করা
                const res = await fetch(`${API_BASE_URL}/subcategories/${subCategoryId}`);
                const data = await res.json();

                if (res.ok && data.success) {
                    setName(data.data.name);
                    setSlug(data.data.slug);
                    // ডেটা পপুলেট হলে data.data.category._id হবে, অন্যথায় data.data.category
                    setSelectedCategory(data.data.category._id || data.data.category); 
                } else {
                    setError(data.message || "Failed to load sub-category data.");
                }
            } catch (err) {
                setError("Network error or invalid sub-category ID.");
            } finally {
                setIsLoading(false);
            }
        };

        // 🚨 প্রধান ক্যাটেগরি ফেইচ করার ফাংশনটিও এখানে কল করুন (categories এর জন্য)
        // fetchCategoriesForDropdown(); 

        fetchSubCategoryData();
    }, [subCategoryId]);

    const handleNameChange = (e) => {
        const newName = e.target.value;
        setName(newName);
        // অটোমেটিক স্ল্যাগ আপডেট
        const newSlug = newName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
        setSlug(newSlug);
        setError(null);
    };

    // ২. ডেটা আপডেট করা
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!name || !slug || !selectedCategory) {
            setError("All fields are required.");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/subcategories/${subCategoryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, slug, category: selectedCategory }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setSuccess(true);
                // সাফল্যের পর ইউজারকে লিস্ট পেজে রিডাইরেক্ট করতে পারেন
                setTimeout(() => router.push('/dashboard/subcategories'), 1000); 
            } else {
                setError(data.message || "Failed to update sub-category.");
            }
        } catch (err) {
            setError("Network error during update.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" /> Loading...</div>;
    }

    if (error && !name) { // লোডের সময় এরর হলে মেসেজ দেখাবে
        return <div className="p-8 text-center text-red-500 flex items-center justify-center gap-2"><XCircle className="w-6 h-6" /> Error: {error}</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <Save className="w-7 h-7 text-indigo-500" />
                    Edit Sub-Category: {name}
                </h1>
                <Link href="/dashboard/subcategories" className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-700 transition duration-200 flex items-center gap-2">
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
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 pr-10"
                            >
                                <option value="" disabled>-- Choose a Category --</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
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
                            value={name}
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
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            required
                            placeholder="e.g., ui-ux-principles"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                    </div>

                    {/* Status/Message Area */}
                    {error && (
                        <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-800 dark:text-red-100 rounded-md" role="alert">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 text-sm text-green-700 bg-green-100 dark:bg-green-800 dark:text-green-100 rounded-md" role="alert">
                            Sub-Category **"{name}"** updated successfully! Redirecting...
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition duration-200 ${
                            isSaving 
                                ? 'bg-indigo-400 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800'
                        }`}
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <Save className="w-5 h-5 mr-2" />
                        )}
                        {isSaving ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}