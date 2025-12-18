"use client";
import React, { useCallback, useEffect, useState } from "react";

// File: app/admin/faq/page.jsx (Finalized with API Calls and ID Cleaning Fix)

import { 
    Plus, 
    Minus, 
    Trash2, 
    Save, 
    BookOpen, 
    User, 
    DollarSign, 
    Settings, 
    Pencil, 
    ArrowDown, 
    ArrowUp,
    CheckCircle,
    AlertTriangle,
    Loader2,
    Briefcase,
    Code,
    Cpu,
    Globe 
} from "lucide-react";

// --- Utility Components and Data (Previous code remains the same) ---

// Lucide Icon Mapping 
const IconMap = {
    BookOpen, User, DollarSign, Settings, Briefcase, Code, Cpu, Globe
};

const getIconComponent = (iconName) => {
    const Icon = IconMap[iconName] || BookOpen;
    return <Icon className="w-6 h-6 mr-2 text-indigo-600 dark:text-teal-400" />;
};

const Notification = ({ message, type }) => {
    if (!message) return null;
    const isError = type === 'error';
    const bgColor = isError ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900';
    const textColor = isError ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300';
    const Icon = isError ? AlertTriangle : CheckCircle;

    return (
        <div className={`p-4 rounded-lg flex items-center ${bgColor} ${textColor} my-4 transition-all duration-300`}>
            <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
};

// Faq Item Editor Component (No change needed here)
const FaqItemEditor = ({ item, categoryId, updateItem, deleteItem, moveItem, index, totalItems }) => {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="border-l-4 border-gray-200 dark:border-gray-700 p-4 pl-6 space-y-3 transition duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">FAQ Item #{index + 1}</p>
                <div className="flex space-x-2">
                    {/* Move Up/Down Buttons */}
                    <button onClick={() => moveItem(categoryId, item._id, 'up')} disabled={index === 0} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 transition">
                        <ArrowUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => moveItem(categoryId, item._id, 'down')} disabled={index === totalItems - 1} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 transition">
                        <ArrowDown className="w-4 h-4" />
                    </button>
                    
                    {/* Edit/Save Button */}
                    <button onClick={() => setIsEditing(!isEditing)} className="p-1 rounded-full text-indigo-600 dark:text-teal-400 hover:bg-indigo-100 dark:hover:bg-teal-900 transition">
                        {isEditing ? <Save className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                    </button>
                    
                    {/* Delete Button */}
                    <button onClick={() => deleteItem(categoryId, item._id)} className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <input
                        type="text"
                        value={item.q}
                        onChange={(e) => updateItem(categoryId, item._id, 'q', e.target.value)}
                        placeholder="Question"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <textarea
                        value={item.a}
                        onChange={(e) => updateItem(categoryId, item._id, 'a', e.target.value)}
                        placeholder="Answer"
                        rows="3"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                </div>
            ) : (
                <div className="space-y-1">
                    <p className="font-medium text-gray-900 dark:text-white">Q: {item.q}</p>
                    <p className="text-gray-600 dark:text-gray-400">A: {item.a}</p>
                </div>
            )}
        </div>
    );
};

// Category Editor Component (No change needed here)
const CategoryEditor = ({ category, updateItem, deleteItem, moveItem, deleteCategory, addFaqItem }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    
    // category._id is used as the identifier from MongoDB

    // Function to update the category property (title or icon)
    const updateCategoryProperty = (prop, value) => {
        updateItem(category._id, category._id, prop, value, true); // The last true flag indicates it's a category update
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-indigo-600 dark:border-teal-500">
            <header 
                className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-xl"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center">
                    {getIconComponent(category.icon)}
                    {isEditingTitle ? (
                         <input
                            type="text"
                            value={category.category}
                            onChange={(e) => updateCategoryProperty('category', e.target.value)}
                            onBlur={() => setIsEditingTitle(false)}
                            className="text-xl font-bold dark:bg-gray-700 dark:text-white p-1 border rounded"
                            autoFocus
                        />
                    ) : (
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mr-3">{category.category}</h2>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }} className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-teal-400 transition">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <span className="ml-4 text-sm font-medium text-gray-500 dark:text-gray-400">({category.items.length} Items)</span>
                </div>
                
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={(e) => { e.stopPropagation(); addFaqItem(category._id); }}
                        className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 dark:bg-teal-600 dark:hover:bg-teal-700 transition flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add Q&A
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); deleteCategory(category._id); }}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    {isExpanded ? <Minus className="w-5 h-5 text-gray-500" /> : <Plus className="w-5 h-5 text-gray-500" />}
                </div>
            </header>

            {isExpanded && (
                <div className="p-5 pt-0 space-y-4 border-t border-gray-200 dark:border-gray-700">
                    {/* Icon Selector */}
                    <div className="flex items-center pt-3">
                         <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">Icon:</label>
                         <select
                            value={category.icon}
                            onChange={(e) => updateCategoryProperty('icon', e.target.value)}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        >
                            {Object.keys(IconMap).map(iconName => (
                                <option key={iconName} value={iconName}>{iconName}</option>
                            ))}
                        </select>
                    </div>

                    {category.items.map((item, index) => (
                        <FaqItemEditor
                            key={item._id || index} 
                            item={item}
                            categoryId={category._id}
                            updateItem={updateItem}
                            deleteItem={deleteItem}
                            moveItem={moveItem}
                            index={index}
                            totalItems={category.items.length}
                        />
                    ))}
                    
                    {category.items.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 p-4 border border-dashed rounded-lg">No questions in this category. Click 'Add Q&A' to start.</p>
                    )}
                </div>
            )}
        </div>
    );
};


// --- Main Admin FAQ Page Component ---
const AdminFaqPage = () => {
    // API URL .env.local বা .env থেকে নেওয়া
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const API_URL = `${API_BASE_URL}/faq`;

    const [faqData, setFaqData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);


    // ------------------------------------
    // 1. API Fetch Logic (GET) (No change)
    // ------------------------------------
    const fetchFaqData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!API_BASE_URL) {
            setError("Configuration Error: API Base URL is missing. Check your .env.local file.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Server error' }));
                throw new Error(errorData.message || `Failed to fetch FAQ data with status: ${response.status}`);
            }

            const data = await response.json();
            // ডাটাবেস থেকে আসা data.data অ্যারে সেট করা
            setFaqData(data.data || []); 
        } catch (err) {
            setError(`Failed to load FAQ. Error: ${err.message}`);
            setFaqData([]); 
        } finally {
            setIsLoading(false);
        }
    }, [API_URL, API_BASE_URL]);

    useEffect(() => {
        fetchFaqData();
    }, [fetchFaqData]);


    // ------------------------------------
    // 2. API Save Logic (PUT) - **FIXED**
    // ------------------------------------
    const handleSaveChanges = async () => {
        if (faqData.length === 0) {
            setError("Cannot save empty FAQ data. Please add at least one category.");
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        // --- FIX: Data Cleaning Logic to remove temporary client-side IDs ---
        const cleanedData = faqData.map(category => {
            const cleanedCategory = { ...category };
            
            // Heuristic Check: If _id is a string but NOT a 24-char hex string (MongoDB ObjectId format), remove it.
            // This ensures Mongoose generates a valid _id for new sub-documents.
            if (typeof cleanedCategory._id === 'string' && !cleanedCategory._id.match(/^[0-9a-fA-F]{24}$/)) {
                delete cleanedCategory._id;
            }

            // Clean Q&A items' IDs as well
            cleanedCategory.items = category.items.map(item => {
                const cleanedItem = { ...item };
                if (typeof cleanedItem._id === 'string' && !cleanedItem._id.match(/^[0-9a-fA-F]{24}$/)) {
                    delete cleanedItem._id;
                }
                return cleanedItem;
            });
            return cleanedCategory;
        });
        // --- End FIX: Data Cleaning Logic ---

        try {
            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // এখানে Auth Token যোগ করতে পারেন
                },
                // সার্ভার শুধুমাত্র 'categories' অ্যারে আশা করে
                body: JSON.stringify({ categories: cleanedData }), // Sending cleaned data
            });

            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ message: 'Server error during save.' }));
                 // If the server sends a message, use it. Otherwise, use the generic server error.
                 throw new Error(errorData.message || `Failed to save FAQ data with status: ${response.status}`);
            }
            
            const updatedData = await response.json();
            setFaqData(updatedData.data || []); 
            setSuccessMessage("FAQ changes saved successfully!");
            
        } catch (err) {
            setError(`Failed to save changes. Error: ${err.message}`);
        } finally {
            setIsSaving(false);
            setTimeout(() => setSuccessMessage(null), 5000); 
        }
    };


    // ------------------------------------
    // 3. UI/Local State Management Logic (No change)
    // ------------------------------------
    
    // Add new empty category
    const addCategory = () => {
        setFaqData(prev => [
            ...prev,
            { 
                // Temporary ID for local manipulation
                _id: Date.now().toString(), 
                category: "New Category",
                icon: "Settings", 
                items: [],
            }
        ]);
    };

    // Delete category
    const deleteCategory = (categoryId) => {
        setFaqData(prev => prev.filter(cat => cat._id !== categoryId));
    };

    // Add new empty FAQ item to a category
    const addFaqItem = (categoryId) => {
        setFaqData(prev => prev.map(cat => {
            if (cat._id === categoryId) {
                return {
                    ...cat,
                    items: [...cat.items, { _id: Date.now().toString(), q: "New Question", a: "New Answer" }]
                };
            }
            return cat;
        }));
    };
    
    // Update question (q), answer (a), category title, or icon
    const updateItem = (categoryId, itemId, prop, value, isCategoryUpdate = false) => {
        setFaqData(prev => prev.map(cat => {
            if (cat._id === categoryId) {
                if (isCategoryUpdate) {
                    // Update category properties (title or icon)
                    return { ...cat, [prop]: value };
                }
                // Update specific FAQ item (q or a)
                return {
                    ...cat,
                    items: cat.items.map(item => 
                        (item._id === itemId) ? { ...item, [prop]: value } : item
                    )
                };
            }
            return cat;
        }));
    };

    // Delete FAQ item
    const deleteItem = (categoryId, itemId) => {
        setFaqData(prev => prev.map(cat => {
            if (cat._id === categoryId) {
                return {
                    ...cat,
                    items: cat.items.filter(item => item._id !== itemId)
                };
            }
            return cat;
        }));
    };
    
    // Move FAQ item up or down within a category
    const moveItem = (categoryId, itemId, direction) => {
        setFaqData(prev => prev.map(cat => {
            if (cat._id === categoryId) {
                const items = [...cat.items];
                const index = items.findIndex(item => item._id === itemId);

                if (index === -1) return cat; // Item not found

                let newIndex = index + (direction === 'up' ? -1 : 1);
                
                if (newIndex >= 0 && newIndex < items.length) {
                    // Swap items
                    [items[index], items[newIndex]] = [items[newIndex], items[index]];
                    return { ...cat, items };
                }
            }
            return cat;
        }));
    };


    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header and Controls */}
                <div className="flex justify-between items-center mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-b-4 border-indigo-600 dark:border-teal-500">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">FAQ Settings (Admin)</h1>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleSaveChanges}
                            className={`px-6 py-3 font-semibold rounded-lg transition disabled:opacity-50 flex items-center ${
                                isSaving ? 'bg-indigo-400 dark:bg-teal-400 text-gray-900' : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-teal-500 dark:hover:bg-teal-600 dark:text-gray-900'
                            }`}
                            disabled={isLoading || isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5 inline mr-2" />
                            )}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            onClick={addCategory}
                            className="px-6 py-3 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 dark:bg-teal-900 dark:text-teal-400 dark:hover:bg-teal-800 transition disabled:opacity-50"
                            disabled={isLoading || isSaving}
                        >
                            <Plus className="w-5 h-5 inline mr-2" />
                            Add Category
                        </button>
                    </div>
                </div>

                {/* Notifications & Loading */}
                <Notification message={error} type="error" />
                <Notification message={successMessage} type="success" />

                {isLoading && (
                    <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 flex items-center justify-center space-x-2">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <p>Loading FAQ data...</p>
                    </div>
                )}
                
                {/* FAQ Categories Management */}
                {!isLoading && (
                    <section className="space-y-6">
                        {faqData.map((category) => (
                            // MongoDB থেকে আসা _id ব্যবহার করা হলো
                            <CategoryEditor
                                key={category._id} 
                                category={category}
                                updateItem={updateItem}
                                deleteItem={deleteItem}
                                moveItem={moveItem}
                                deleteCategory={deleteCategory}
                                addFaqItem={addFaqItem}
                            />
                        ))}
                        
                        {faqData.length === 0 && (
                            <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400">
                                <AlertTriangle className="w-6 h-6 mx-auto mb-3 text-yellow-500" />
                                No FAQ categories found. Please add a new category above.
                            </div>
                        )}
                    </section>
                )}

            </div>
        </div>
    );
};

export default AdminFaqPage;