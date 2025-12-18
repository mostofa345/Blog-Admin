"use client";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Edit, ListTree, Loader2, PlusCircle, Search, Trash2 } from "lucide-react";

// API Endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
const SUBCATEGORY_API_URL = `${API_BASE_URL}/subcategories`; 

export default function SubCategoryListPage() {
    const [subCategories, setSubCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('dateCreated');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const categoriesPerPage = 5;

    // 🌟 API থেকে সাব-ক্যাটাগরি ডেটা লোড করার ফাংশন
    const fetchSubCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(SUBCATEGORY_API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch sub-categories: ${response.statusText}`);
            }

            const responseData = await response.json();
            
            // 💡 ফিক্সড: নিশ্চিত করা যে 'responseData.subCategories' একটি অ্যারে এবং এটিকে UI state-এ সেট করা।
            // যদি আপনার API সরাসরি অ্যারে রিটার্ন করে, তবে responseData ব্যবহার করুন।
            // যদি অবজেক্টের মধ্যে subCategories নামে অ্যারে থাকে (যেমনটি Node/Express এ প্রচলিত), তবে সেই অ্যারেটি ব্যবহার করুন।
            let categoryArray = [];

            if (Array.isArray(responseData)) {
                categoryArray = responseData;
            } else if (responseData && Array.isArray(responseData.subCategories)) {
                categoryArray = responseData.subCategories;
            } else if (responseData && Array.isArray(responseData.data)) {
                 categoryArray = responseData.data;
            }
            
            // ডেটা স্ট্রাকচার ম্যাপ করা
            // API থেকে আসা ডেটা (যেমন: _id, category ObjectId) কে ফ্রন্টএন্ডের জন্য সহজ ফরম্যাটে ম্যাপ করা।
            const mappedCategories = categoryArray.map(item => ({
                // API থেকে আসা ডেটা এখানে mapping হবে
                id: item._id || item.id, // MongoDB _id
                name: item.name,
                slug: item.slug,
                // parentName এর জন্য নিশ্চিত করুন যে আপনার ব্যাকএন্ডে Populate করা আছে। 
                // যদি Populate করা থাকে, তবে item.category.name ব্যবহার করুন।
                parentName: item.category ? item.category.name : 'Uncategorized', 
                // 👆 যদি item.category একটি Object না হয়ে শুধু ID হয়, তাহলে এই ম্যাপ কাজ করবে না। 
                // এক্ষেত্রে শুধু ID দেখাবে অথবা আপনাকে আলাদাভাবে ক্যাটেগরি নাম আনতে হবে।
                dateCreated: item.createdAt || new Date().toISOString(),
                postCount: item.postCount || 0, // যদি থাকে
            }));


            setSubCategories(mappedCategories); 

        } catch (err) {
            console.error("Fetch Error:", err);
            setError(`Could not load sub-categories. ${err.message}`);
            // ফেইলারের ক্ষেত্রে state-এ একটি খালি অ্যারে সেট করা যাতে পরে সর্টিং ক্র্যাশ না করে
            setSubCategories([]); 
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubCategories();
    }, [fetchSubCategories]);

    // 💡 ফিক্সড: `subCategories` একটি অ্যারে কিনা তা নিশ্চিত করার জন্য একটি ফলব্যাক যোগ করা হলো।
    const categoriesToFilter = Array.isArray(subCategories) ? subCategories : [];
    
    // সর্টিং লজিক
    const sortedCategories = [...categoriesToFilter].sort((a, b) => {
        // null/undefined চেক যোগ করা
        const aVal = a[sortBy] || '';
        const bVal = b[sortBy] || '';

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    // সার্চ লজিক
    const filteredCategories = sortedCategories.filter(cat => 
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        cat.parentName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // পেজিনেশন লজিক
    const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);

    const handleSort = (key) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortOrder('asc');
        }
    };

    // 💥 API দিয়ে ডিলিট লজিক
    const handleDelete = async (id, name) => {
        // 🚨 IMPORTANT: alert() ও window.confirm() ব্যবহার না করার জন্য একটি সতর্কতা। 
        // এই পরিবেশে এর পরিবর্তে একটি কাস্টম modal ব্যবহার করুন। 
        if (!confirm(`Are you sure you want to delete the sub-category: "${name}"?`)) {
             return;
        }

        try {
            const response = await fetch(`${SUBCATEGORY_API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete sub-category.');
            }

            // সফলভাবে ডিলিট হলে UI আপডেট
            setSubCategories(prev => prev.filter(cat => cat.id !== id));
            // alert(`Sub-Category "${name}" deleted successfully.`);
            
            if (currentCategories.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }
        } catch (err) {
            console.error("Delete Error:", err);
            // alert(`Deletion failed: ${err.message}`);
        }
    };

    const SortButton = ({ column, label }) => (
        <button 
            className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300" 
            onClick={() => handleSort(column)}
        >
            {label}
            {sortBy === column ? (
                <ArrowUpDown className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            ) : (
                <ArrowUpDown className="w-4 h-4 opacity-30" />
            )}
        </button>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3 mb-4 sm:mb-0">
                    <ListTree className="w-7 h-7 text-indigo-500" />
                    Sub-Category List
                </h1>
                <Link href="/dashboard/subcategories/create" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-md hover:bg-indigo-700 transition duration-200 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Add New Sub-Category
                </Link>
            </div>

            {/* Controls and Search */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
                <div className="relative w-full sm:w-80">
                    <input
                        type="text"
                        placeholder="Search sub-categories..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 sm:mt-0">
                    Total Sub-Categories: {filteredCategories.length}
                </p>
            </div>
            
            {/* Loading/Error State */}
            {loading ? (
                <div className="flex justify-center items-center h-64 text-indigo-600 dark:text-indigo-400">
                    <Loader2 className="w-8 h-8 animate-spin mr-2" />
                    Loading sub-categories...
                </div>
            ) : error ? (
                <div className="p-4 text-center text-red-700 bg-red-100 dark:bg-red-800 dark:text-red-100 rounded-lg shadow-md">
                    Error: {error}
                </div>
            ) : (
                <>
                    {/* Sub-Category Table */}
                    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        <SortButton column="name" label="Sub-Category Name" />
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                                        <SortButton column="parentName" label="Parent Category" />
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                                        <SortButton column="postCount" label="Posts" />
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                                        <SortButton column="dateCreated" label="Date Created" />
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {currentCategories.length > 0 ? (
                                    currentCategories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {cat.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400 hidden sm:table-cell">
                                                {cat.parentName} 
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                                                {cat.postCount || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                                                {cat.dateCreated ? new Date(cat.dateCreated).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Link href={`/dashboard/subcategories/edit/${cat.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition">
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    {/* NOTE: window.confirm/alert replaced by console log or custom UI in real apps */}
                                                    <button onClick={() => handleDelete(cat.id, cat.name)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-gray-700 transition">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                            No sub-categories found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {indexOfFirstCategory + 1} to {Math.min(indexOfLastCategory, filteredCategories.length)} of {filteredCategories.length} results
                            </p>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
