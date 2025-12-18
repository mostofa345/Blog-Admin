"use client";
import React, { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";

// Get the base API URL from environment variables
// https://blog-server-0exu.onrender.com/api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
const CONTACT_API_URL = `${API_BASE_URL}/contact`; // Final endpoint for GET: https://blog-server-0exu.onrender.com/api/contact

const AdminMessagesPage = () => {
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch messages from the server. Use useCallback for stability.
    const fetchMessages = useCallback(async (currentSelectedId = null) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(CONTACT_API_URL, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || `Failed to fetch messages. Status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                // Process fetched messages
                const fetchedMessages = result.data.map(msg => ({
                    ...msg,
                    receivedAt: new Date(msg.createdAt || msg.receivedAt), 
                    id: msg._id, // Use MongoDB _id as the local id
                }));
                
                // Sort by receivedAt descending (newest first)
                fetchedMessages.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());

                setMessages(fetchedMessages);
                
                // --- Stable Selection Logic ---
                let newSelected = null;
                
                if (currentSelectedId) {
                    newSelected = fetchedMessages.find(msg => msg.id === currentSelectedId);
                }
                
                if (!newSelected && fetchedMessages.length > 0) {
                    newSelected = fetchedMessages[0];
                }
                
                setSelectedMessage(newSelected);
                
            } else {
                throw new Error(result.message || "Invalid data format received from server.");
            }
        } catch (err) {
            console.error('API Error:', err);
            setError(`Could not load messages. Please ensure the server is running. (${err.message})`);
            setMessages([]);
            setSelectedMessage(null);
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array ensures fetchMessages function reference is stable

    // Load messages on component mount
    useEffect(() => {
        // Run once on mount
        fetchMessages();
    }, [fetchMessages]);

    // Handler to mark a message as read/unread (Local UI update for demo)
    const toggleReadStatus = async (messageId) => {
        const messageToUpdate = messages.find(m => m.id === messageId);
        if (!messageToUpdate) return;
        
        // ** NOTE: This is a temporary UI-only update. 
        // For persistent changes, you MUST uncomment and implement the PATCH API call here. **
        
        setMessages(prevMessages => 
            prevMessages.map(msg => 
                msg.id === messageId ? { ...msg, isRead: !msg.isRead } : msg
            )
        );
        if (selectedMessage && selectedMessage.id === messageId) {
            setSelectedMessage(prev => ({ ...prev, isRead: !prev.isRead }));
        }
    };

    // Handler for selecting a message from the list
    const selectMessage = (message) => {
        if (selectedMessage?.id === message.id) return;
        
        setSelectedMessage(message);
        // Automatically mark as read when selected, if it's unread
        if (!message.isRead) {
            // This calls the local update for immediate visual feedback
            toggleReadStatus(message.id); 
        }
    };

    // Filter messages based on the current filter state
    const filteredMessages = messages.filter(msg => {
        if (filter === 'unread') return !msg.isRead;
        if (filter === 'read') return msg.isRead;
        return true;
    });


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-red-600 dark:text-red-500">
                    Admin Message Inbox
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Manage and respond to customer contact form submissions.
                </p>
            </header>

            <div className="flex flex-col lg:flex-row gap-6 h-[80vh]">
                {/* Message List Panel */}
                <div className="lg:w-1/3 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 flex flex-col overflow-hidden">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                        Messages ({filteredMessages.length})
                    </h2>
                    
                    {/* Filter Tabs */}
                    <div className="flex space-x-2 mb-4">
                        {['all', 'unread', 'read'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-3 py-1 text-sm rounded-full capitalize transition-colors duration-200 
                                    ${filter === tab 
                                        ? 'bg-red-600 text-white shadow-md' 
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Loading, Error, or Message List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar flex flex-col">
                        {isLoading ? (
                            // Loading state
                            <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading messages...</div>
                        ) : error ? (
                            // Error state
                            <div className="text-center py-10 text-red-600 dark:text-red-400 font-medium">{error}</div>
                        ) : filteredMessages.length > 0 ? (
                            // Message List
                            filteredMessages.map(msg => (
                                <div
                                    key={msg.id} // Must be unique and stable
                                    onClick={() => selectMessage(msg)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border 
                                        ${msg.isRead 
                                            ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-700' 
                                            : 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-800'
                                        }
                                        ${selectedMessage?.id === msg.id 
                                            ? 'ring-2 ring-red-500 dark:ring-red-400 shadow-lg' 
                                            : 'hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className={`font-semibold ${msg.isRead ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white'}`}>
                                            {msg.name}
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {msg.receivedAt && format(msg.receivedAt, 'MMM d, h:mm a')} 
                                        </span>
                                    </div>
                                    <p className="text-sm truncate text-gray-600 dark:text-gray-300 mt-1">
                                        **{msg.subject || 'No Subject'}** - {msg.message.substring(0, 50)}...
                                    </p>
                                    {!msg.isRead && (
                                        <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-red-600 text-white rounded-full">
                                            New
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            // No messages state
                            <p className="text-center text-gray-500 dark:text-gray-400 mt-10">No messages found for this filter.</p>
                        )}
                    </div>
                </div>

                {/* Message Detail Panel */}
                <div className="lg:w-2/3 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 overflow-y-auto">
                    {selectedMessage ? (
                        <>
                            <div className="flex justify-between items-start border-b pb-4 mb-4 border-gray-200 dark:border-gray-700">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                        {selectedMessage.subject || 'No Subject'}
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        **From:** {selectedMessage.name} &lt;{selectedMessage.email}&gt;
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        **Received:** {selectedMessage.receivedAt && format(selectedMessage.receivedAt, 'MMMM d, yyyy @ h:mm a')}
                                    </p>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => toggleReadStatus(selectedMessage.id)}
                                        className="p-2 rounded-full text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                        title={selectedMessage.isRead ? 'Mark as Unread' : 'Mark as Read'}
                                    >
                                        {selectedMessage.isRead ? '✅' : '📧'}
                                    </button>
                                    <button
                                        // This would typically involve a delete function (Requires DELETE API call)
                                        className="p-2 rounded-full text-sm bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                                        title="Delete Message"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            
                            {/* Message Body */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner">
                                <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                                    {selectedMessage.message}
                                </p>
                            </div>

                            {/* Response / Reply Section (Optional but helpful for admin) */}
                            <div className="mt-8">
                                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                                    Respond to {selectedMessage.name}
                                </h3>
                                <textarea 
                                    rows="4"
                                    placeholder="Write your reply here..."
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-red-500 focus:border-red-500"
                                ></textarea>
                                <button
                                    className="mt-3 py-2 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Send Reply (Simulated)
                                </button>
                            </div>

                        </>
                    ) : (
                        // Initial/No message state
                        <div className="flex items-center justify-center h-full">
                            <p className="text-xl font-medium text-gray-500 dark:text-gray-400">
                                {isLoading 
                                    ? 'Fetching initial messages...' 
                                    : 'Select a message from the list to view its details, or wait for new submissions.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessagesPage;