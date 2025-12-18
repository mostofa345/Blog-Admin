"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

// API URL for fetching all subscribers (Assume this endpoint is protected by Admin Auth)
const SUBSCRIBERS_LIST_API_URL = "https://blog-server-0exu.onrender.com/api/v1/subscribers"; // আপনার সার্ভারের আসল URL দিন

export default function AdminSubscribersPage() {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ডেটা ফেচ করার ফাংশন
    const fetchSubscribers = async () => {
        setLoading(true);
        setError(null);
        try {
            // **গুরুত্বপূর্ণ:** বাস্তব ক্ষেত্রে, এই রিকোয়েস্টে অ্যাডমিন অথেন্টিকেশন টোকেন (Authorization Header) পাঠাতে হবে।
            const response = await fetch(SUBSCRIBERS_LIST_API_URL, {
                method: 'GET',
                headers: {
                    // 'Authorization': `Bearer ${adminAuthToken}` // অথেন্টিকেশন টোকেন
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                // অথেন্টিকেশন এরর হলে 401 বা 403 আসবে
                if (response.status === 401 || response.status === 403) {
                    throw new Error("Access Denied: You must be logged in as an Admin.");
                }
                throw new Error("Failed to fetch data.");
            }

            const data = await response.json();
            setSubscribers(data.data.subscribers || []);

        } catch (err) {
            console.error("Fetch Error:", err.message);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []); // কম্পোনেন্ট মাউন্ট হওয়ার সময় একবার কল হবে


    // --- রেন্ডারিং লজিক ---

    if (loading) {
        return (
            <div className="container mx-auto p-8 text-center">
                <p className="text-xl text-gray-600 dark:text-gray-400">Loading Subscribers...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600">Error Loading Data</h2>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
                <button onClick={fetchSubscribers} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-3xl font-extrabold mb-6 border-b pb-2 text-gray-800 dark:text-white">
                📰 Newsletter Subscribers ({subscribers.length})
            </h1>

            {subscribers.length === 0 ? (
                <p className="text-lg text-gray-500 dark:text-gray-400">No subscribers found yet.</p>
            ) : (
                <div className="overflow-x-auto shadow-lg rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    #
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Email Address
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Subscribed On
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {subscribers.map((sub, index) => (
                                <tr key={sub._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {sub.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(sub.subscribedAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// **দ্রষ্টব্য:** এই পেজটি আপনার অ্যাডমিন রুটের মধ্যে সুরক্ষিতভাবে রেন্ডার করা উচিত।