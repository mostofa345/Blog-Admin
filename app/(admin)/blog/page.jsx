"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";

// BlogList.jsx (for Admin Panel)
import { 
    BookOpen, 
    Pencil, 
    Trash2, 
    Loader2, 
    Filter, 
    Eye, 
    Heart, 
    MessageCircle, 
    Share2, 
    Calendar 
} from 'lucide-react';

// --- API Configuration ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
const BLOG_LIST_API = `${API_BASE_URL}/blog/list`; 
const SUBCATEGORY_API = `${API_BASE_URL}/subcategories`; 
const BLOG_STATUS_API = `${API_BASE_URL}/blog/status`; 
const BLOG_DELETE_API = `${API_BASE_URL}/blog`; 


// --- Reusable Components (for Blog List) ---

const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full min-w-[75px] text-center";
    switch (status) {
        case 'Published': return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>{status}</span>;
        case 'Draft': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>{status}</span>;
        case 'Archived': return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>{status}</span>;
        default: return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>{status}</span>;
    }
};

const StatusUpdateDropdown = ({ id, currentStatus, onUpdate }) => {
    const [status, setStatus] = useState(currentStatus);
    const statuses = ['Draft', 'Published', 'Archived'];

    const handleChange = (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        onUpdate(id, newStatus);
    };

    return (
        <select 
            value={status} 
            onChange={handleChange}
            className="p-1 text-xs border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition min-w-[75px]"
        >
            {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
            ))}
        </select>
    );
};

const BlogListRow = ({ blog, onStatusUpdate, onDelete }) => {
    const publishedDate = blog.publishedDate ? format(new Date(blog.publishedDate), 'dd MMM yyyy') : 'N/A';
    
    const loves = blog.loves || 0;
    const views = blog.views || 0;
    const comments = (blog.comments && blog.comments.length) || 0; 
    const shares = blog.shares || 0; 

    const defaultCover = "https://via.placeholder.com/150x100?text=No+Image";

    const editUrl = `/admin/blog/edit/${blog._id}`; 

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 grid grid-cols-12 gap-4 items-center border border-gray-100 dark:border-gray-700">
            
            {/* 1. Image & Title & Summary (col-span-4) */}
            <div className="col-span-12 md:col-span-4 flex items-start space-x-4">
                <div className="relative w-20 h-14 flex-shrink-0 rounded-md overflow-hidden">
                    <Image 
                        src={blog.coverPhotoUrl || defaultCover} 
                        alt={blog.title || "Blog Cover"} 
                        layout="fill" 
                        objectFit="cover" 
                        className="transition duration-300 hover:scale-105"
                    />
                </div>
                <div className="flex flex-col">
                    <Link 
                        href={editUrl} 
                        className="text-base font-bold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition leading-tight line-clamp-2"
                    > 
                        {blog.title} 
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {blog.expertSummary || 'No summary available.'}
                    </p>
                    {/* Author & Subcategory on mobile (Bottom of Title block) */}
                    <div className="md:hidden mt-2 text-xs space-y-1">
                        <p className="flex items-center text-gray-600 dark:text-gray-400 font-medium">
                            <Pencil className="w-3 h-3 mr-1" /> {blog.author || 'N/A'}
                        </p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center">
                            <Filter className="w-3 h-3 mr-1" />
                            {blog.subcategory ? (
                                <Link 
                                    href={`/admin/blog?subcategorySlug=${blog.subcategory.slug}`} 
                                    className="hover:underline"
                                >
                                    {blog.subcategory.name}
                                </Link>
                            ) : 'No Subcategory'}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. Author (col-span-2) */}
            <div className="hidden md:block md:col-span-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                {blog.author || 'N/A'}
            </div>

            {/* 3. Subcategory (col-span-2) */}
            <div className="hidden md:block md:col-span-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                {blog.subcategory ? (
                    <Link 
                        href={`/admin/blog?subcategorySlug=${blog.subcategory.slug}`} 
                        className="hover:underline"
                    >
                        {blog.subcategory.name}
                    </Link>
                ) : 'N/A'}
            </div>
            
            {/* 4. Stats (col-span-2) */}
            <div className="col-span-12 md:col-span-2 flex flex-wrap gap-2 justify-between items-center text-gray-600 dark:text-gray-400 text-xs">
                <div className="flex items-center space-x-1 min-w-[45%]">
                    <Eye className="w-3 h-3 text-blue-500" title="Views" />
                    <span className="font-medium">{views}</span>
                </div>
                <div className="flex items-center space-x-1 min-w-[45%]">
                    <Heart className="w-3 h-3 text-red-500" title="Loves" />
                    <span className="font-medium">{loves}</span>
                </div>
                <div className="flex items-center space-x-1 min-w-[45%]">
                    <MessageCircle className="w-3 h-3 text-yellow-500" title="Comments" />
                    <span className="font-medium">{comments}</span>
                </div>
                <div className="flex items-center space-x-1 min-w-[45%]">
                    <Share2 className="w-3 h-3 text-purple-500" title="Shares" />
                    <span className="font-medium">{shares}</span>
                </div>
            </div>

            {/* 5. Status & Actions (col-span-2) */}
            <div className="col-span-12 md:col-span-2 flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 items-center md:items-end justify-between md:justify-center">
                <StatusBadge status={blog.status} />
                <StatusUpdateDropdown 
                    id={blog._id} 
                    currentStatus={blog.status} 
                    onUpdate={onStatusUpdate} 
                />
                {/* 🔥 EDIT Button Added */}
                 <Link 
                    href={editUrl} 
                    className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-700 rounded-lg transition"
                    title="Edit Blog"
                >
                    <Pencil className="w-4 h-4" />
                </Link>
                <button
                    onClick={() => onDelete(blog._id)}
                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700 rounded-lg transition"
                    title="Delete Blog"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            
            {/* Dates/Edit on mobile (Full width row) */}
            <div className="col-span-12 flex justify-between items-center text-xs text-gray-500 dark:text-gray-500 mt-2 md:mt-0 md:hidden border-t pt-2 border-dashed">
                 <p className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" /> Published: {publishedDate}
                </p>
                <Link href={editUrl} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                </Link>
            </div>
        </div>
    );
};


// 4. Main Component Logic (BlogList)
const BlogList = () => {
    const [blogs, setBlogs] = useState([]); 
    const [subcategories, setSubcategories] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedSubcategory, setSelectedSubcategory] = useState(''); 
    const [statusFilter, setStatusFilter] = useState('');

    // ফ্রন্টএন্ড থেকে subcategorySlug ঠিকভাবেই যাচ্ছে
    const fetchBlogs = useCallback(async (page, subcategorySlug, status) => { 
        setLoading(true);
        setError(null);
        try {
            const url = `${BLOG_LIST_API}?page=${page}&limit=10&status=${status || ''}&subcategorySlug=${subcategorySlug || ''}`;
            
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.success) {
                setBlogs(data.data); 
                setTotalPages(data.totalPages);
                setCurrentPage(data.page);
            } else {
                throw new Error(data.message || 'Failed to fetch blogs.');
            }
        } catch (err) {
            console.error("Fetch Blog Error:", err);
            setError(err.message);
            setBlogs([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSubcategories = async () => {
        try {
            const res = await fetch(SUBCATEGORY_API);
            const data = await res.json();
            
            if (Array.isArray(data)) {
                setSubcategories(data.map(c => ({ slug: c.slug || c._id, name: c.name || c.title })));
            }
            else if (data.success && Array.isArray(data.data)) {
                setSubcategories(data.data.map(c => ({ slug: c.slug || c._id, name: c.name || c.title })));
            } else {
                console.warn("Subcategory data format unexpected. Expected array or data.data array:", data);
            }
        } catch (err) {
            console.error("Fetch Subcategory Error:", err);
        }
    };

    // useEffect hooks
    useEffect(() => {
        fetchSubcategories();
    }, []);
    
    useEffect(() => {
        fetchBlogs(currentPage, selectedSubcategory, statusFilter); 
    }, [currentPage, selectedSubcategory, statusFilter, fetchBlogs]);

    const handleSubcategoryChange = (e) => { 
        setSelectedSubcategory(e.target.value); 
        setCurrentPage(1); 
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const res = await fetch(`${BLOG_STATUS_API}/${id}`, {
                method: 'PATCH', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();

            if (data.success) {
                setBlogs(prev => prev.map(blog => 
                    blog._id === id ? { ...blog, status: newStatus } : blog
                ));
            } else {
                alert(`Status update failed: ${data.message}`);
                fetchBlogs(currentPage, selectedSubcategory, statusFilter);
            }
        } catch (err) {
            console.error("Status Update Error:", err);
            alert("Failed to update blog status. Check network.");
            fetchBlogs(currentPage, selectedSubcategory, statusFilter);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this Blog?")) return;

        try {
            const res = await fetch(`${BLOG_DELETE_API}/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.success) {
                alert("Blog deleted successfully!");
                setBlogs(prev => prev.filter(blog => blog._id !== id));
                if (blogs.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchBlogs(currentPage, selectedSubcategory, statusFilter);
                }
            } else {
                alert(`Deletion failed: ${data.message}`);
            }
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Failed to delete blog. Check network.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            {/* Header */}
            <header className="flex justify-between items-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center">
                    <BookOpen className="w-8 h-8 mr-3" /> Admin Blog List 
                </h1>
                <Link 
                    href="/admin/blog/create" 
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
                >
                    <Pencil className="w-5 h-5 mr-2" /> New Blog
                </Link>
            </header>

            {/* Filters and Pagination Info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                    {/* Subcategory Filter */}
                    <div className="flex items-center space-x-2">
                        <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <select
                            value={selectedSubcategory} 
                            onChange={handleSubcategoryChange} 
                            className="p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition text-sm"
                        >
                            <option value="">All Subcategories</option> 
                            {subcategories.map(cat => (
                                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={handleStatusChange}
                        className="p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition text-sm"
                    >
                        <option value="">All Statuses</option>
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                        <option value="Archived">Archived</option>
                    </select>
                </div>
                
                {/* Pagination Info */}
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Showing {blogs.length} results on Page {currentPage} of {totalPages}
                </div>
            </div>

            {/* List Content */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                    <p className="ml-2 text-indigo-600 dark:text-indigo-400">Loading Blogs...</p>
                </div>
            ) : error ? (
                <div className="text-center p-8 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
                    <p className="font-semibold">Error: {error}</p>
                    <p>Failed to fetch blog list.</p>
                </div>
            ) : blogs.length === 0 ? (
                <div className="text-center p-8 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-lg">
                    <p className="font-semibold">No Blogs Found.</p>
                    <p>Try adjusting your filters or <Link href="/admin/blog/create" className="text-indigo-600 dark:text-indigo-400 hover:underline">create a new blog</Link>.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {blogs.map((blog) => (
                        <BlogListRow 
                            key={blog._id} 
                            blog={blog} 
                            onStatusUpdate={handleStatusUpdate} 
                            onDelete={handleDelete} 
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div className="mt-8 flex justify-center items-center space-x-4">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
                >
                    Previous
                </button>
                <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || loading}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default BlogList;