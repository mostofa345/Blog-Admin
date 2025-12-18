"use client";
import React, { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, Eye, Star } from "lucide-react";

// API URL Setup
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
const FEEDBACK_API_URL = `${API_BASE_URL}/feedback`; 

const AdminFeedbackPage = () => {
    const [feedbackList, setFeedbackList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'unreviewed', 'reviewed'

    // --- 1. Data Fetching Logic (GET /api/feedback) ---
    const fetchFeedback = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(FEEDBACK_API_URL, {
                method: 'GET',
                // Add Admin Auth Header here in a real app
                // headers: { 'Authorization': `Bearer ${adminToken}` },
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || `Failed to fetch feedback. Status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                // Process fetched data
                const fetchedList = result.data.map(f => ({
                    ...f,
                    receivedAt: new Date(f.createdAt), 
                    id: f._id, // Use MongoDB _id as the local id
                }));
                
                // Sorted by receivedAt descending (newest first is handled by controller, but we re-sort to be safe)
                fetchedList.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());

                setFeedbackList(fetchedList);
                
            } else {
                throw new Error(result.message || "Invalid data format received from server.");
            }
        } catch (err) {
            console.error('API Error:', err);
            setError(`Could not load feedback. Please ensure the server is running. (${err.message})`);
            setFeedbackList([]);
        } finally {
            setIsLoading(false);
        }
    }, []); 

    useEffect(() => {
        fetchFeedback();
    }, [fetchFeedback]);

    // --- 2. Update Review Status Logic (PATCH /api/feedback/:id) ---
    const toggleReviewStatus = async (feedbackId, currentStatus) => {
        const url = `${FEEDBACK_API_URL}/${feedbackId}`;
        const newStatus = !currentStatus;

        // Optimistic UI Update
        setFeedbackList(prevList => 
            prevList.map(f => f.id === feedbackId ? { ...f, isReviewed: newStatus } : f)
        );

        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Admin Auth Header here in a real app
                },
                body: JSON.stringify({ isReviewed: newStatus }),
            });

            if (!response.ok) {
                // Revert UI if API call fails
                setFeedbackList(prevList => 
                    prevList.map(f => f.id === feedbackId ? { ...f, isReviewed: currentStatus } : f)
                );
                throw new Error(`Failed to update status. Status: ${response.status}`);
            }

        } catch (err) {
            console.error('Update status error:', err);
            alert('Failed to update review status on server.');
        }
    };


    // Helper function to render star rating
    const renderRating = (rating) => (
        <div className="flex items-center space-x-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star 
                    key={i} 
                    className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                />
            ))}
            <span className="ml-2 text-sm font-semibold">({rating}/5)</span>
        </div>
    );
    
    // Filter logic
    const filteredFeedback = feedbackList.filter(f => {
        if (filter === 'unreviewed') return !f.isReviewed;
        if (filter === 'reviewed') return f.isReviewed;
        return true;
    });


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-red-600 dark:text-red-500">
                    User Feedback & Reviews
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Manage and review all incoming user feedback and ratings.
                </p>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
                
                {/* Filter Tabs */}
                <div className="flex space-x-4 mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                    {['all', 'unreviewed', 'reviewed'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 text-sm rounded-lg capitalize transition-colors duration-200 
                                ${filter === tab 
                                    ? 'bg-red-600 text-white shadow-md' 
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            {tab} ({feedbackList.filter(f => filter === 'all' || (filter === 'unreviewed' ? !f.isReviewed : f.isReviewed)).length})
                        </button>
                    ))}
                </div>

                {/* Content Area: Loading, Error, or List */}
                {isLoading ? (
                    <div className="text-center py-20 text-gray-500 dark:text-gray-400 text-xl">Loading feedback...</div>
                ) : error ? (
                    <div className="text-center py-20 text-red-600 dark:text-red-400 font-medium text-xl">{error}</div>
                ) : filteredFeedback.length > 0 ? (
                    // Feedback List Table
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr className="text-left text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-3">Rating</th>
                                    <th className="px-6 py-3">Message Preview</th>
                                    <th className="px-6 py-3">User/Email</th>
                                    <th className="px-6 py-3">Received</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredFeedback.map(f => (
                                    <tr 
                                        key={f.id} 
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!f.isReviewed ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                                    >
                                        {/* Rating */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderRating(f.rating)}
                                        </td>
                                        
                                        {/* Message Preview */}
                                        <td className="px-6 py-4 max-w-xs truncate text-gray-800 dark:text-gray-200">
                                            {f.message.substring(0, 80)}{f.message.length > 80 ? '...' : ''}
                                        </td>
                                        
                                        {/* User/Email */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {f.name || 'Anonymous'} <br/>
                                            {f.email && <span className="text-xs">{f.email}</span>}
                                        </td>
                                        
                                        {/* Received Date */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {f.receivedAt && format(f.receivedAt, 'MMM d, h:mm a')}
                                        </td>
                                        
                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${f.isReviewed ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'}`}>
                                                {f.isReviewed ? 'Reviewed' : 'New'}
                                            </span>
                                        </td>
                                        
                                        {/* Action */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button 
                                                onClick={() => toggleReviewStatus(f.id, f.isReviewed)}
                                                className={`p-2 rounded-full transition-colors duration-200 ${
                                                    f.isReviewed ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600' : 'bg-red-500 text-white hover:bg-red-600'
                                                }`}
                                                title={f.isReviewed ? 'Mark as Unreviewed' : 'Mark as Reviewed'}
                                            >
                                                {f.isReviewed ? <Eye className="w-4 h-4"/> : <Check className="w-4 h-4"/>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // No feedback state
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-10 text-lg">No feedback found for this filter.</p>
                )}
            </div>
        </div>
    );
};

export default AdminFeedbackPage;