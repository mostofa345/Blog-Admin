"use client";
import React, { useCallback, useEffect, useState } from "react";

// Get the base API URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const INFO_API_URL = `${API_BASE_URL}/info`; // Final endpoint for GET/PUT: https://blog-server-0exu.onrender.com/api/info

// Initial state with empty values (no dummy data)
const emptyContactInfo = {
    email: "",
    phone: "",
    address: "",
};

const AdminInfoManager = () => {
    // Current live data (read-only display)
    const [liveInfo, setLiveInfo] = useState(emptyContactInfo);
    
    // Form data for editing
    const [formData, setFormData] = useState(emptyContactInfo);
    const [status, setStatus] = useState(''); // 'success', 'error', 'loading', 'fetching'

    // --- 1. Data Fetching Logic (GET /api/info) ---
    const fetchInfo = useCallback(async () => {
        setStatus('fetching');
        try {
            const response = await fetch(INFO_API_URL, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch info. Status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                // Set both live display and edit form with fetched data
                const fetchedData = {
                    email: result.data.email || '',
                    phone: result.data.phone || '',
                    address: result.data.address || '',
                };
                setLiveInfo(fetchedData); 
                setFormData(fetchedData);
                setStatus(''); // Clear fetching status
            } else {
                throw new Error(result.message || "Invalid data format received from server.");
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setStatus('error');
            setLiveInfo(emptyContactInfo); 
            setFormData(emptyContactInfo);
        }
    }, []);

    // Fetch data on component mount
    useEffect(() => {
        fetchInfo();
    }, [fetchInfo]);

    // Handler for form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- 2. Data Submission Logic (PUT /api/info) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading'); // Use 'loading' for submission

        try {
            const response = await fetch(INFO_API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Add your admin authentication token here if needed:
                    // 'Authorization': `Bearer ${adminToken}`, 
                },
                body: JSON.stringify(formData),
            });
            
            const result = await response.json();

            if (!response.ok || !result.success) {
                // Check if the response is successful based on HTTP status and API structure
                throw new Error(result.error || `Failed to update info. Status: ${response.status}`);
            }
            
            // Update the live data state upon successful API call
            setLiveInfo(result.data); 
            
            setStatus('success');
            setTimeout(() => setStatus(''), 3000); // Clear status after 3 seconds

        } catch (error) {
            setStatus('error');
            console.error('Update error:', error);
            const errorMessage = error.message.includes('Failed to update info') ? '❌ Failed to update. Please ensure the server is running and data is valid.' : `❌ Update failed: ${error.message}`;
            alert(errorMessage); 
            setTimeout(() => setStatus(''), 5000); 
        }
    };

    const isFetching = status === 'fetching';
    const isLoading = status === 'loading';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
            <header className="mb-8 max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-red-600 dark:text-red-500 flex items-center">
                    <span className="mr-3">🔧</span> Manage Contact Info
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Update the Email, Phone, and Address displayed on the main Contact Us page.
                </p>
            </header>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. Current Live Information Display */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl h-fit">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                        Current Live Information
                    </h2>

                    {isFetching ? (
                         <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading current info from server...</div>
                    ) : (
                        <div className="space-y-4">
                            {/* Email */}
                            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email (📧)</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                                    {liveInfo.email || 'N/A (Server Offline or No Data)'}
                                </p>
                            </div>
                            {/* Phone */}
                            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone (📞)</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {liveInfo.phone || 'N/A (Server Offline or No Data)'}
                                </p>
                            </div>
                            {/* Address */}
                            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address (📍)</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                                    {liveInfo.address || 'N/A (Server Offline or No Data)'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Update/Edit Form */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                        Update Contact Details
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Email Address</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isFetching || isLoading}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white disabled:opacity-70 disabled:bg-gray-200 dark:disabled:bg-gray-700/50"
                            />
                        </div>

                        {/* Phone Input */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                id="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                disabled={isFetching || isLoading}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white disabled:opacity-70 disabled:bg-gray-200 dark:disabled:bg-gray-700/50"
                            />
                        </div>

                        {/* Address Input */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Physical Address</label>
                            <textarea
                                name="address"
                                id="address"
                                rows="3"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                disabled={isFetching || isLoading}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white disabled:opacity-70 disabled:bg-gray-200 dark:disabled:bg-gray-700/50"
                            ></textarea>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isFetching || isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out disabled:opacity-50"
                        >
                            {isFetching ? 'Loading Data...' : isLoading ? 'Saving Changes...' : 'Save & Update Info'}
                        </button>
                        
                        {/* Status Message */}
                        {status && status !== 'loading' && status !== 'fetching' && (
                            <div className={`mt-4 text-center font-medium p-3 rounded-lg ${
                                status === 'success' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' :
                                status === 'error' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' : ''
                            }`}>
                                {status === 'success' && '✅ Contact Information updated successfully!'}
                                {status === 'error' && '❌ Failed to update. Please check the network and server response.'}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminInfoManager;