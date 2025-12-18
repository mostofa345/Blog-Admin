"use client";
import React, { useCallback, useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

// PopularPostManager.jsx - Layout Modified: Selected Posts moved to the bottom, API ready, No limit
import { 
    BookOpen, 
    TrendingUp, 
    ListTree, 
    PlusCircle, 
    Trash2, // Trash2 added for removal
    Loader2, 
    Search, 
    GripVertical,
    Save,
    X,
    MessageCircle 
} from 'lucide-react';

// --- API Configuration (For Reference Only) ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
// API endpoints used by this component
const BLOG_LIST_API = `${API_BASE_URL}/blog/list`;      // Fetches available blogs
const SUBCATEGORY_API = `${API_BASE_URL}/subcategories`; // Fetches all subcategories
const POPULAR_POSTS_API = `${API_BASE_URL}/admin/popular-posts`; // Fetches/Saves selected popular posts

// --- Styling Constants ---
const primaryBg = 'bg-indigo-600 dark:bg-sky-600';
const hoverBg = 'hover:bg-indigo-700 dark:hover:bg-sky-700';
const secondaryBg = 'bg-gray-100 dark:bg-gray-700';

// --- Component Boilerplate (Simplified for completeness) ---

// 1. BlogCard Component (Available Blogs List)
const BlogCard = ({ post, onAdd }) => (
    <div className={`p-4 rounded-xl shadow-lg transition-all duration-300 ${secondaryBg} dark:border-gray-600 flex items-start space-x-4`}>
        <div className="flex-shrink-0 w-20 h-20 bg-gray-300 rounded-lg overflow-hidden">
            <img src={post.coverPhotoUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-grow">
            <h3 className="font-semibold text-base line-clamp-2">{post.title}</h3>
            <div className="flex items-center space-x-4 text-xs mt-1 text-gray-500 dark:text-gray-400">
                <span className="flex items-center"><BookOpen className="w-3 h-3 mr-1" /> {post.readTime} min read</span>
                <span className="flex items-center"><MessageCircle className="w-3 h-3 mr-1" /> {post.comments} comments</span>
            </div>
            <button
                onClick={() => onAdd(post)}
                className={`mt-2 flex items-center text-sm px-3 py-1 rounded-full font-medium text-white ${primaryBg} hover:opacity-80 transition`}
            >
                <PlusCircle className="w-4 h-4 mr-1" /> Add
            </button>
        </div>
    </div>
);

// 2. SelectedPostCard Component (Drag & Drop List)
const SelectedPostCard = ({ post, index, onRemove }) => (
    <Draggable draggableId={post._id} index={index}>
        {(provided) => (
            <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                className={`p-4 rounded-xl shadow-md transition-all duration-300 ${secondaryBg} flex items-center space-x-3 my-2`}
            >
                <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab">
                    <GripVertical className="w-5 h-5" />
                </div>
                <div className="flex-shrink-0 w-12 h-12 bg-gray-300 rounded overflow-hidden">
                    <img src={post.coverPhotoUrl} alt={post.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-sm line-clamp-2">{post.title}</p>
                </div>
                <button
                    onClick={() => onRemove(post._id)}
                    className="flex-shrink-0 text-red-500 hover:text-red-700 transition"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        )}
    </Draggable>
);

// --- PopularPostManager Component ---
export default function PopularPostManager() {
    // 1. Data State
    const [subCategories, setSubCategories] = useState([]); 
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [availableBlogs, setAvailableBlogs] = useState([]); 
    const [selectedPosts, setSelectedPosts] = useState([]); 
    
    // 2. UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true); 
    const [message, setMessage] = useState({ text: '', type: '' }); 

    // --- API Interactions ---

    // 💡 1. Fetch ALL Subcategories from server
    const fetchSubCategories = useCallback(async () => {
        // Assume API call to SUBCATEGORY_API returns { success: true, data: [{ _id, name, slug }, ...] }
        try {
            const response = await fetch(SUBCATEGORY_API); 
            const result = await response.json();

            if (response.ok && result.success) {
                setSubCategories(result.data);
                // Select the first subcategory by default if none is selected
                if (!selectedSubcategory && result.data.length > 0) {
                    setSelectedSubcategory(result.data[0]._id);
                }
            } else {
                setMessage({ text: 'Failed to load subcategories.', type: 'error' });
            }
        } catch (error) {
            console.error("Error fetching subcategories:", error);
            setMessage({ text: 'Network error while fetching subcategories.', type: 'error' });
        }
    }, [selectedSubcategory]);


    // 💡 2. Fetch the Popular Posts for the currently selected subcategory
    const fetchPopularPosts = useCallback(async (subId) => {
        if (!subId) {
            setSelectedPosts([]); // Clear posts if no subcategory is selected
            return;
        }
        
        // 🔥 CHANGE: Add subCategory ID to the query parameters
        const query = new URLSearchParams();
        query.append('subCategory', subId); 
        
        try {
            // GET /api/admin/popular-posts?subCategory=id
            const response = await fetch(`${POPULAR_POSTS_API}?${query.toString()}`); 
            const result = await response.json();

            if (response.ok && result.success) {
                // 🔥 CHANGE: API এখন শুধু { data: { popularPosts: [...] } } স্ট্রাকচারে ডেটা রিটার্ন করবে
                setSelectedPosts(result.data.popularPosts || []);
                setMessage({ text: `Popular posts loaded for subcategory ID: ${subId}`, type: 'success' });
                
            } else {
                setMessage({ text: 'Failed to load selected popular posts.', type: 'error' });
            }
        } catch (error) {
            console.error("Error fetching popular posts:", error);
            setMessage({ text: 'Network error while fetching popular posts.', type: 'error' });
        } 
    }, []);


    // 💡 3. Fetch Available Blogs based on subcategory and search term
    const fetchAvailableBlogs = useCallback(async (subId) => {
        const query = new URLSearchParams();
        query.append('subCategory', subId);
        if (searchTerm) {
            query.append('search', searchTerm);
        }
        query.append('limit', 50); // Fetch a reasonable number of blogs

        try {
            const response = await fetch(`${BLOG_LIST_API}?${query.toString()}`);
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Remove posts that are already in the selectedPosts list
                const selectedIds = new Set(selectedPosts.map(p => p._id));
                const filteredBlogs = result.data.filter(blog => !selectedIds.has(blog._id));
                setAvailableBlogs(filteredBlogs);
            } else {
                setMessage({ text: 'Failed to load available blogs.', type: 'error' });
            }
        } catch (error) {
            console.error("Error fetching available blogs:", error);
            setMessage({ text: 'Network error while fetching available blogs.', type: 'error' });
        }
    }, [searchTerm, selectedPosts]); 

    // --- Effects Management ---

    // 1. Initial Load: Fetch Subcategories (Only)
    useEffect(() => {
        async function loadInitialData() {
            await fetchSubCategories();
            // Initial popular post fetch removed here, it's now handled by the selectedSubcategory change.
            setInitialLoading(false);
        }
        loadInitialData();
    }, [fetchSubCategories]); 

    // 2. Fetch Blogs and Popular Posts when Category or Search Term changes
    useEffect(() => {
        if (selectedSubcategory) {
            fetchAvailableBlogs(selectedSubcategory); // Fetch blogs to show for selection
            fetchPopularPosts(selectedSubcategory);  // 🔥 CHANGE: Fetch previously saved list for this subcategory
        }
    }, [selectedSubcategory, fetchAvailableBlogs, fetchPopularPosts]);
    
    // --- Handler Functions ---
    
    // Select Post: Move from Available to Selected
    const handleAddPost = (postToAdd) => {
        // Prevent duplicates
        if (!selectedPosts.some(p => p._id === postToAdd._id)) {
            setSelectedPosts(prev => [...prev, postToAdd]);
            // Remove from available blogs list
            setAvailableBlogs(prev => prev.filter(p => p._id !== postToAdd._id));
        }
    };
    
    // Remove Selected Post: Move from Selected back to Available (and trigger list update)
    const handleRemovePost = (postId) => {
        const postToRemove = selectedPosts.find(p => p._id === postId);
        
        // 1. Remove from selected list
        setSelectedPosts(prev => prev.filter(p => p._id !== postId));
        
        // 2. Add back to available list
        if (postToRemove) {
            // Re-fetch available blogs to correctly update the list based on search/category
            fetchAvailableBlogs(selectedSubcategory); 
        }
    };
    
    // Drag & Drop Handler
    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(selectedPosts);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setSelectedPosts(items);
    };

    // Save Handler (Uses POST to POPULAR_POSTS_API)
    const handleSave = async () => {
        if (selectedPosts.length === 0) {
            setMessage({ text: 'Please select at least one post to save.', type: 'error' });
            return;
        }
        
        setLoading(true);
        setMessage({ text: 'Saving changes...', type: 'info' });

        const blogIds = selectedPosts.map(p => p._id);
        
        // Payload remains correct: subCategoryId is included
        const payload = {
            blogIds,
            subCategoryId: selectedSubcategory 
        };

        try {
            const response = await fetch(POPULAR_POSTS_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload), 
            });
            const result = await response.json();

            if (result.success) {
                // 🔥 CHANGE: API থেকে শুধু popularPosts array অ্যাক্সেস করা হচ্ছে
                setSelectedPosts(result.data.popularPosts || []); 
                setMessage({ text: 'Popular Posts saved successfully!', type: 'success' });
            } else {
                setMessage({ text: `Save failed: ${result.message || 'Server error'}`, type: 'error' });
            }

        } catch (error) {
            console.error("Save error:", error);
            setMessage({ text: 'Network error during save operation.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };
    
    // --- Render Logic ---

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-gray-500">
                <Loader2 className="w-8 h-8 mr-2 animate-spin" /> Loading manager...
            </div>
        );
    }
    
    const selectedSubcategoryName = subCategories.find(sub => sub._id === selectedSubcategory)?.name || 'Select a Subcategory';

    return (
        <div className="min-h-screen p-8 dark:bg-gray-900 dark:text-gray-100">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold flex items-center">
                    <TrendingUp className="w-8 h-8 mr-2 text-indigo-500 dark:text-sky-500" />
                    Popular Posts Manager
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Select and order the most popular posts for each subcategory.</p>
            </header>

            {message.text && (
                <div 
                    className={`p-3 rounded-xl mb-6 text-sm font-medium ${
                        message.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}
                >
                    {message.text}
                </div>
            )}

            <div className="flex space-x-8">
                {/* --- Left Column: Available Blogs & Subcategory Selector --- */}
                <main className="flex-grow max-w-4xl">
                    <div className="mb-6 p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-800 border dark:border-gray-700">
                        <h2 className="text-xl font-bold flex items-center mb-4">
                            <ListTree className="w-5 h-5 mr-2 text-indigo-500 dark:text-sky-500" />
                            Subcategory & Blog Selector
                        </h2>
                        
                        {/* Subcategory Dropdown */}
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Select Subcategory:</label>
                        <select
                            value={selectedSubcategory}
                            onChange={(e) => setSelectedSubcategory(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">-- Select a Subcategory --</option>
                            {subCategories.map(sub => (
                                <option key={sub._id} value={sub._id}>{sub.name}</option>
                            ))}
                        </select>

                        {/* Search Input */}
                        <div className="mt-4 relative">
                            <input
                                type="text"
                                placeholder="Search available blogs by title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchAvailableBlogs(selectedSubcategory)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={!selectedSubcategory}
                            />
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Available Blogs List */}
                    <div className="p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-800 border dark:border-gray-700">
                        <h2 className="text-xl font-bold mb-4">
                            Available Blogs ({selectedSubcategoryName}) - {availableBlogs.length} results
                        </h2>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {loading ? (
                                <div className="text-center py-10 text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading blogs...
                                </div>
                            ) : availableBlogs.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    No available blogs found.
                                </div>
                            ) : (
                                availableBlogs.map(post => (
                                    <BlogCard key={post._id} post={post} onAdd={handleAddPost} />
                                ))
                            )}
                        </div>
                    </div>
                </main>

                {/* --- Right Column: Selected Posts (Drag and Drop Area) --- */}
                <aside className="w-96 flex-shrink-0">
                    <div className="sticky top-8 p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-800 border dark:border-gray-700">
                        <h2 className="text-xl font-bold flex items-center mb-4 text-indigo-600 dark:text-sky-400">
                            <GripVertical className="w-5 h-5 mr-2" />
                            Popular List ({selectedPosts.length})
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Drag and drop to set the display order for **{selectedSubcategoryName}**.
                        </p>

                        {/* Selected Posts D&D List */}
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="selected-posts-list">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="min-h-[100px] p-2 border-dashed border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                                    >
                                        {selectedPosts.length === 0 ? (
                                            <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-10">
                                                No posts selected. <br/>
                                                <p className="text-sm mt-1">Click 'Add' from the list above.</p>
                                            </div>
                                        ) : (
                                            selectedPosts.map((post, index) => (
                                                <SelectedPostCard key={post._id} post={post} index={index} onRemove={handleRemovePost} />
                                            ))
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={loading || !selectedSubcategory}
                            className={`w-full mt-6 flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-extrabold text-lg text-white transition duration-300 transform shadow-md ${
                                (loading || !selectedSubcategory) ? 'bg-gray-500 cursor-not-allowed' : `${primaryBg} ${hoverBg} shadow-indigo-500/50 dark:shadow-sky-500/50`
                            }`}
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <Save className="w-6 h-6" />
                            )}
                            <span>{loading ? 'Saving...' : 'Save Popular Posts'}</span>
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}