"use client";
import React, { useEffect, useState } from "react";
import { ListOrdered, Loader2, RefreshCw } from "lucide-react";

// src/app/admin/footer/columns/page.jsx

// API Base URL environment variable থেকে নেওয়া
// .env.local ফাইলে সেট করা আছে: NEXT_PUBLIC_API_BASE_URL=https://blog-server-0exu.onrender.com/api 
// তাই সম্পূর্ণ endpoint হবে: https://blog-server-0exu.onrender.com/api/footer-columns
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/footer-columns`;

const FooterColumnsManage = () => {
    const [mounted, setMounted] = useState(false);
    const [columns, setColumns] = useState([]);
    const [newColumnTitle, setNewColumnTitle] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState(null);

    // --- API Call Functions ---

    // 1. সব কলাম লোড করা
    const fetchColumns = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // ডাটাবেস থেকে _id আসবে, তাই id হিসেবে সেটা ব্যবহার করা হলো
            setColumns(data.data.map(col => ({ ...col, id: col._id }))); 
        } catch (err) {
            console.error("Failed to fetch columns:", err);
            setError("Failed to load columns. Please check server connection.");
        } finally {
            setIsLoading(false);
        }
    };

    // 2. নতুন কলাম যোগ করা
    const handleAddColumn = async (e) => {
        e.preventDefault();
        if (!newColumnTitle.trim()) return;

        setIsAdding(true);
        setError(null);
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newColumnTitle.trim() }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                // সার্ভার থেকে আসা validation error হ্যান্ডেল করা
                const errorMessage = result.message || "Could not add column.";
                throw new Error(errorMessage);
            }

            // সফল হলে তালিকা আপডেট করা
            setNewColumnTitle("");
            fetchColumns(); // নতুন কলাম যুক্ত হবার পর পুরো তালিকা রিফ্রেশ করা
            
        } catch (err) {
            console.error("Failed to add column:", err);
            setError(`Error: ${err.message}`);
        } finally {
            setIsAdding(false);
        }
    };

    // 3. কলামের স্ট্যাটাস টগল (Toggle isActive Status) করার জন্য (Edit বাটনের ফাংশন)
    const handleToggleStatus = async (column) => {
        const columnId = column._id;
        const newStatus = !column.isActive;

        try {
            const response = await fetch(`${API_BASE_URL}/${columnId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: newStatus }),
            });

            if (!response.ok) {
                throw new Error("Could not update column status.");
            }

            // সফল হলে লোকাল স্টেট আপডেট করা
            setColumns(columns.map(col => 
                col._id === columnId ? { ...col, isActive: newStatus } : col
            ));
        } catch (err) {
            console.error("Failed to toggle status:", err);
            setError("Failed to update status.");
        }
    };

    // 4. কলাম মুছে ফেলা
    const handleDeleteColumn = async (columnId) => {
        if (!window.confirm("Are you sure you want to delete this column?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${columnId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error("Could not delete column.");
            }

            // সফল হলে লোকাল স্টেট থেকে কলামটি সরিয়ে দেওয়া
            setColumns(columns.filter(col => col._id !== columnId));
        } catch (err) {
            console.error("Failed to delete column:", err);
            setError("Failed to delete column.");
        }
    };


    // --- Effect Hooks ---

    useEffect(() => {
        // Hydration mismatch এড়ানোর জন্য মাউন্ট চেক
        setMounted(true);
        // মাউন্ট হওয়ার সাথে সাথে কলাম লোড করা
        fetchColumns();
    }, []);

    if (!mounted) return null;

    return (
        <div className="p-4 md:p-6 bg-white dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-6 flex items-center justify-between">
                <span className="flex items-center space-x-3">
                    <ListOrdered className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <span>Manage Footer Column Headers</span>
                </span>
                <button 
                    onClick={fetchColumns} 
                    className="p-2 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    disabled={isLoading || isAdding}
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </h1>

            {/* Error Message Display */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900 dark:text-red-100 dark:border-red-700" role="alert">
                    <strong className="font-bold">Error! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Add New Column Form */}
            <form onSubmit={handleAddColumn} className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg mb-8 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Add New Column Header
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* কলামের নাম */}
                    <div className="md:col-span-2">
                        <label htmlFor="columnTitle" className="block text-xs font-medium mb-1 opacity-70">Column Title (e.g. Top Categories)</label>
                        <input 
                            id="columnTitle"
                            type="text" 
                            placeholder="Enter Column Title" 
                            value={newColumnTitle}
                            onChange={(e) => setNewColumnTitle(e.target.value)}
                            disabled={isAdding}
                            required
                            className="w-full p-2.5 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-green-500 outline-none" 
                        />
                    </div>

                    {/* সাবমিট বাটন */}
                    <div className="flex items-end">
                        <button 
                            type="submit"
                            disabled={isAdding || !newColumnTitle.trim()}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isAdding ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                            ) : (
                                'Add Column'
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Existing Columns List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                                <th className="p-4 text-sm font-bold uppercase tracking-wider">Title</th>
                                <th className="p-4 text-sm font-bold uppercase tracking-wider">Status</th>
                                <th className="p-4 text-sm font-bold uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="3" className="text-center p-8 text-gray-500 dark:text-gray-400">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Loading columns...
                                    </td>
                                </tr>
                            ) : columns.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center p-8 text-gray-500 dark:text-gray-400">
                                        No columns found. Add one above!
                                    </td>
                                </tr>
                            ) : (
                                columns.map((column) => (
                                    // key prop-এ _id ব্যবহার করা হলো
                                    <tr key={column._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                                        <td className="p-4 font-medium">{column.title}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${column.isActive ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'}`}>
                                                {column.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {/* Edit বাটনে স্ট্যাটাস টগল ফাংশন যুক্ত করা হলো */}
                                            <button 
                                                onClick={() => handleToggleStatus(column)}
                                                className={`font-semibold mr-4 transition ${column.isActive ? 'text-orange-500 hover:text-orange-600' : 'text-green-500 hover:text-green-600'}`}
                                            >
                                                {column.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            
                                            {/* Delete বাটনে ডিলিট ফাংশন যুক্ত করা হলো */}
                                            <button 
                                                onClick={() => handleDeleteColumn(column._id)}
                                                className="text-red-500 hover:text-red-600 font-semibold transition"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FooterColumnsManage;