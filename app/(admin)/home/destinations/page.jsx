"use client";
import { Edit, Loader2, Plus, Save, Trash2, X, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// page.jsx (AdminTabManagement - Corrected)

// Assuming your backend is running on the PORT defined in your .env (e.g., 5000)
const API_BASE_URL = 'https://blog-server-0exu.onrender.com/api/tabs'; 

export default function AdminTabManagement() {
    const [tabs, setTabs] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [newTabName, setNewTabName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editName, setEditName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // --- Data Fetching ---
    const fetchTabs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(API_BASE_URL);
            const result = await res.json();

            if (result.success) {
                let fetchedTabs = result.data;
                const exploreAllExists = fetchedTabs.some(tab => tab.name === 'Explore all');
                
                // Only mock if it's missing from the fetched data
                if (!exploreAllExists) {
                    // *** FIX: Changed 'id' to '_id' for consistency with MongoDB response ***
                    fetchedTabs = [...fetchedTabs, { _id: 'mock-explore-all-tab-key', name: 'Explore all', postCount: 0 }];
                }

                setTabs(fetchedTabs);
            } else {
                setError(result.error || 'Failed to fetch tabs.');
            }
        } catch (err) {
            setError('Network Error: Could not connect to API.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTabs();
    }, [fetchTabs]);


    // --- Handlers ---

    const handleAddTab = async () => {
        if (!newTabName.trim()) {
            alert("Tab Name cannot be empty.");
            return;
        }
        setIsSaving(true);
        try {
            const res = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTabName.trim() }),
            });
            const result = await res.json();

            if (result.success) {
                setNewTabName('');
                setIsAdding(false);
                fetchTabs(); // Refetch to include the new tab
            } else {
                alert(`Error adding tab: ${result.error}`);
            }
        } catch (err) {
            alert("Error: Could not connect to the server.");
        } finally {
            setIsSaving(false);
        }
    };

    // *** FIX: Changed 'tab.id' to 'tab._id' ***
    const handleEditStart = (tab) => {
        setEditingId(tab._id); // Use _id for editing state
        setEditName(tab.name);
        setIsAdding(false);
    };

    // *** FIX: Changed 'id' parameter to use in API call ***
    const handleEditSave = async (_id) => {
        // Find the tab by its _id to check the name before saving
        const tabToEdit = tabs.find(t => t._id === _id);
        if (tabToEdit && tabToEdit.name === 'Explore all') {
             alert("The 'Explore all' tab name cannot be modified.");
             setEditingId(null);
             return;
        }
        setIsSaving(true);
        try {
            // *** FIX: Use _id in the API URL ***
            const res = await fetch(`${API_BASE_URL}/${_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName.trim() }),
            });
            const result = await res.json();

            if (result.success) {
                fetchTabs(); // Refetch updated data
                setEditingId(null);
            } else {
                alert(`Error updating tab: ${result.error}`);
            }
        } catch (err) {
            alert("Error: Could not connect to the server.");
        } finally {
            setIsSaving(false);
        }
    };

    // *** FIX: Changed 'id' parameter to use in API call and name for prompt ***
    const handleDelete = async (_id, name) => {
        if (name === 'Explore all') {
            alert("The 'Explore all' tab cannot be deleted as it is required for functionality.");
            return;
        }
        if (!window.confirm(`Are you sure you want to delete the tab "${name}"?`)) {
            return;
        }
        
        try {
            // *** FIX: Use _id in the API URL ***
            const res = await fetch(`${API_BASE_URL}/${_id}`, {
                method: 'DELETE',
            });
            const result = await res.json();

            if (result.success) {
                fetchTabs(); // Refetch remaining tabs
            } else {
                 alert(`Error deleting tab: ${result.error}`);
            }
        } catch (err) {
            alert("Error: Could not connect to the server.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                <span className="ml-3 text-lg dark:text-gray-300">Loading Tabs...</span>
            </div>
        );
    }

    if (error) {
        return (
             <div className="p-8 dark:bg-gray-900 text-red-500">
                <h2 className="text-2xl font-bold">API Connection Error</h2>
                <p>{error}</p>
                <button onClick={fetchTabs} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                    Try Again
                </button>
            </div>
        );
    }
    
    // UI rendering starts here

    return (
        <div className="p-8 bg-gray-50 min-h-screen dark:bg-gray-900 transition-colors duration-500">
            <header className="mb-10 border-b pb-4 dark:border-gray-700">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center">
                    <Zap className="w-8 h-8 mr-3 text-teal-500 dark:text-red-500" />
                    Destinations Tab/Menu Management
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Control the filter categories that appear on your "Top Destinations" page.
                </p>
            </header>

            {/* Add New Tab Section */}
            <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        {isAdding ? 'New Tab Details' : 'Add New Tab'}
                    </h3>
                    <button
                        onClick={() => {setIsAdding(!isAdding); setEditingId(null);}}
                        className={`flex items-center px-4 py-2 text-white rounded-lg transition duration-200 ${isAdding ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-600 hover:bg-teal-700'}`}
                        disabled={isSaving}
                    >
                        {isAdding ? <X className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                        {isAdding ? 'Cancel' : 'Add New'}
                    </button>
                </div>
                
                {isAdding && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <input
                            type="text"
                            placeholder="Tab Name (e.g., Seasonal Picks)"
                            value={newTabName}
                            onChange={(e) => setNewTabName(e.target.value)}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            disabled={isSaving}
                        />
                        <button
                            onClick={handleAddTab}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 flex items-center justify-center"
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                            {isSaving ? 'Saving...' : 'Save Tab'}
                        </button>
                    </div>
                )}
            </div>

            {/* Existing Tabs Table */}
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/2">Tab Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Post Count</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {tabs.map((tab) => (
                            // *** FIX APPLIED HERE: Using tab._id as the key ***
                            <tr key={tab._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                                {editingId === tab._id ? (
                                    // Edit Mode
                                    <>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="p-1 border rounded dark:bg-gray-700 dark:text-white w-full"
                                                disabled={isSaving || tab.name === 'Explore all'}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {tab.postCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleEditSave(tab._id)} // Using tab._id
                                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mr-3"
                                                title="Save"
                                                disabled={isSaving || tab.name === 'Explore all'}
                                            >
                                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            </button>
                                            <button 
                                                onClick={() => setEditingId(null)}
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                title="Cancel"
                                                disabled={isSaving}
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    // Display Mode
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {tab.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {tab.postCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleEditStart(tab)}
                                                className={`text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4 ${tab.name === 'Explore all' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title={tab.name === 'Explore all' ? "Cannot edit required tab" : "Edit"}
                                                disabled={tab.name === 'Explore all'}
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(tab._id, tab.name)} // Using tab._id
                                                className={`text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ${tab.name === 'Explore all' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title={tab.name === 'Explore all' ? "Cannot delete required tab" : "Delete"}
                                                disabled={tab.name === 'Explore all'}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}