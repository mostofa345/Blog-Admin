"use client";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

import { 
    AlertTriangle, 
    Eye, 
    Filter, 
    List, 
    Loader2, 
    Pencil, 
    Plus, 
    Search, 
    Trash2, 
    Image, // For Cover Photo Icon
    Heart, // For Loves/Share Count
    MessageSquare, // For Comment Count
    CheckCircle, // For Status Toggle (Published)
    XCircle // For Status Toggle (Draft)
} from "lucide-react";

// article/page.jsx (Article List Page)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
const ARTICLE_API_URL = `${API_BASE_URL}/article/list`; // assuming this fetches a paginated list
const CATEGORY_API_URL = `${API_BASE_URL}/categories`; // Added API URL for category fetch

export default function ArticleListPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
    const [filters, setFilters] = useState({ search: '', status: 'all', category: 'all' });

    const [categories, setCategories] = useState([]);

    const fetchArticles = useCallback(async (page, limit, search, status, category) => {
        setLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search: search,
                status: status,
                category: category,
            }).toString();

            const response = await fetch(`${ARTICLE_API_URL}?${query}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch articles with status ${response.status}`);
            }

            const result = await response.json();
            
            const articleList = result.data.list || result.data || [];
            
            // Map the API response structure to the local state structure
            setArticles(articleList.map(item => ({
                _id: item._id,
                title: item.title,
                permalink: item.permalink,
                category: item.category?.name || 'Uncategorized', // Assuming category is populated
                author: item.author || 'N/A',
                status: item.status || 'Draft',
                publishedDate: item.publishedDate ? new Date(item.publishedDate).toLocaleDateString() : 'N/A',
                seoScore: item.seoScore || 0,
                
                coverPhotoUrl: item.coverPhotoUrl || '', 
                views: item.views || 0, 
                loves: item.loves || 0, 
                commentsCount: item.comments?.length || 0, 
            })));
            
            setPagination({
                page: result.data.page || page,
                limit: result.data.limit || limit,
                totalPages: result.data.totalPages || 1,
                totalItems: result.data.totalItems || articleList.length,
            });

        } catch (err) {
            console.error("Error fetching articles:", err);
            setError(`Failed to load article list: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Function to fetch Categories (for filter options)
    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch(CATEGORY_API_URL);
            if (!response.ok) throw new Error("Failed to fetch categories");
            const result = await response.json();
            const categoryData = result.data || result;
            if (Array.isArray(categoryData)) {
                setCategories(categoryData.map(c => ({ id: c._id, name: c.name })));
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
        fetchArticles(pagination.page, pagination.limit, filters.search, filters.status, filters.category);
    }, [fetchArticles, fetchCategories, pagination.page, pagination.limit, filters]);


    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };
    
    const handleFilterChange = (e) => {
        const { id, value } = e.target;
        setFilters(prev => ({ ...prev, [id]: value }));
        // Reset to first page when filters change
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleDelete = async (articleId) => {
        if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/article/${articleId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error("Failed to delete the article.");

            // Refetch the list to update the UI
            fetchArticles(pagination.page, pagination.limit, filters.search, filters.status, filters.category);
            alert("Article deleted successfully!");

        } catch (err) {
            console.error("Deletion Error:", err);
            setError(`Failed to delete article: ${err.message}`);
        }
    };
    
    // Function to update article status directly from the list
    const handleStatusChange = async (articleId, currentStatus) => {
        const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
        if (!confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;

        // Optimistic UI Update
        setArticles(prev => prev.map(art => art._id === articleId ? { ...art, status: 'Updating...' } : art));

        try {
            const response = await fetch(`${API_BASE_URL}/article/status/${articleId}`, { 
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error("Failed to update status.");
            
            // Final UI Update
            setArticles(prev => prev.map(art => art._id === articleId ? { ...art, status: newStatus } : art));
            alert(`Status updated to ${newStatus} successfully!`);

        } catch (err) {
            console.error("Status Update Error:", err);
            setError(`Failed to update status: ${err.message}`);
            // Revert or Refetch if failed
            fetchArticles(pagination.page, pagination.limit, filters.search, filters.status, filters.category); 
        }
    };
    
    // --- Render Logic ---

    const statusOptions = [
        { id: 'all', name: 'All Statuses' },
        { id: 'Published', name: 'Published' },
        { id: 'Draft', name: 'Draft' },
        { id: 'Pending Review', name: 'Pending Review' },
    ];

    const categoryOptions = [
        { id: 'all', name: 'All Categories' },
        ...categories
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-red-600 dark:text-red-400 mb-4 md:mb-0">
                    <List className="inline w-7 h-7 mr-2" />
                    Article List
                </h1>
                <div className="flex space-x-3">
                    <Link 
                        href="/admin/content-management/article/create" 
                        className="flex items-center text-sm font-semibold px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Article
                    </Link>
                </div>
            </header>
            
            {/* Filter and Search Panel (Improved Responsiveness) */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center w-full">
                    <Search className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                    <input
                        type="text"
                        id="search"
                        placeholder="Search by Title..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-red-500 focus:border-red-500"
                    />
                </div>

                <div className="flex items-center w-full">
                    <Filter className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                    <select
                        id="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-red-500 focus:border-red-500"
                    >
                        {statusOptions.map(option => (
                            <option key={option.id} value={option.id}>{option.name}</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex items-center w-full">
                    <Filter className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                    <select
                        id="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-red-500 focus:border-red-500"
                    >
                        {categoryOptions.map(option => (
                            <option key={option.id} value={option.id}>{option.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-300 flex items-center shadow-lg">
                    <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <p className="font-medium">Error: {error}</p>
                </div>
            )}

            {/* Main Content Table (Responsive structure applied) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        {/* FIX: Ensuring <tr> immediately follows <thead> for potential whitespace fix */}
                        <tr> 
                            {/* Responsiveness: Reduced Padding */}
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Cover</th> 
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Title & Permalink</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Category</th>
                            {/* Responsiveness: Shortened header text on mobile */}
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                <span className="hidden sm:inline">Published Date</span>
                                <span className="sm:hidden">Date</span>
                            </th>
                            {/* Responsiveness: Shortened header text on mobile */}
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                <span className="hidden sm:inline">SEO Score</span>
                                <span className="sm:hidden">SEO</span>
                            </th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Views</th> 
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Loves</th> 
                            {/* Responsiveness: Shortened header text on mobile */}
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                <span className="hidden sm:inline">Comments</span>
                                <span className="sm:hidden">Comm</span>
                            </th> 
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Status</th> 
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {/* FIX: Conditional rendering of rows is safe inside <tbody>, but ensured tight structure */}
                        {loading ? (
                            <tr>
                                <td colSpan="10" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    <Loader2 className="w-5 h-5 mx-auto animate-spin text-red-500" />
                                    Loading articles...
                                </td>
                            </tr>
                        ) : articles.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    No articles found based on current filters.
                                </td>
                            </tr>
                        ) : (
                            articles.map((resource) => (
                                <tr key={resource._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    {/* Cover Photo: Reduced padding, smaller image on mobile */}
                                    <td className="px-2 py-2 whitespace-nowrap text-center">
                                        {resource.coverPhotoUrl ? (
                                            <img 
                                                src={resource.coverPhotoUrl} 
                                                alt={resource.title} 
                                                className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-md mx-auto"
                                            />
                                        ) : (
                                            <Image className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 mx-auto" title="No Cover" />
                                        )}
                                    </td>
                                    
                                    {/* Title & Permalink: Reduced padding, fixed width for truncation on mobile */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{resource.title}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate w-32 sm:w-48">{resource.permalink}</div>
                                    </td>
                                    
                                    {/* Category: Reduced padding, smaller text on mobile */}
                                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                        {resource.category}
                                    </td>

                                    {/* Published Date: Reduced padding, smaller text on mobile */}
                                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                        {resource.publishedDate}
                                    </td>

                                    {/* SEO Score: Reduced padding, smaller font */}
                                    <td className="px-2 py-2 whitespace-nowrap text-center text-xs font-bold text-gray-900 dark:text-gray-100">
                                        {resource.seoScore}%
                                    </td>
                                    
                                    {/* Views: Reduced padding, smaller icon/font on mobile */}
                                    <td className="px-2 py-2 whitespace-nowrap text-center text-xs text-gray-700 dark:text-gray-300">
                                        <div className="flex items-center justify-center">
                                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-500" />
                                            {resource.views}
                                        </div>
                                    </td>
                                    
                                    {/* Loves: Reduced padding, smaller icon/font on mobile */}
                                    <td className="px-2 py-2 whitespace-nowrap text-center text-xs text-gray-700 dark:text-gray-300">
                                        <div className="flex items-center justify-center">
                                            <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-red-500" />
                                            {resource.loves}
                                        </div>
                                    </td>
                                    
                                    {/* Comments: Reduced padding, smaller icon/font on mobile */}
                                    <td className="px-2 py-2 whitespace-nowrap text-center text-xs text-gray-700 dark:text-gray-300">
                                        <div className="flex items-center justify-center">
                                            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-teal-500" />
                                            {resource.commentsCount}
                                        </div>
                                    </td>

                                    {/* Status (with Toggle): Reduced padding, smaller text/button on mobile */}
                                    <td className="px-3 py-2 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleStatusChange(resource._id, resource.status)}
                                            className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors duration-200 ${
                                                resource.status === 'Published' 
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800' 
                                                    : resource.status === 'Draft'
                                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800'
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                            }`}
                                            title={`Click to change status to ${resource.status === 'Published' ? 'Draft' : 'Published'}`}
                                            disabled={resource.status === 'Updating...'}
                                        >
                                            <span className="flex items-center gap-1">
                                                {resource.status === 'Published' ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                                                <span className="hidden sm:inline">{resource.status}</span>
                                                <span className="sm:hidden">{resource.status.charAt(0)}</span> {/* Show only first letter on smallest screens */}
                                            </span>
                                        </button>
                                    </td>

                                    {/* Actions: Reduced padding, smaller icons, reduced space */}
                                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2"> {/* space-x-3 -> space-x-2 */}
                                            {/* View Button */}
                                            <Link href={`/${resource.permalink}`} target="_blank" className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200" title="View Article">
                                                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </Link>
                                            
                                            {/* Edit Button */}
                                            <Link 
                                                href={`/admin/content-management/article/${resource._id}/edite`} 
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200" 
                                                title="Edit Article"
                                            >
                                                <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </Link>
                                            
                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDelete(resource._id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                                                title="Delete Article"
                                            >
                                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls (Improved Responsiveness) */}
            {pagination.totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg space-y-3 sm:space-y-0">
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.totalItems)}</span> of <span className="font-medium">{pagination.totalItems}</span> results
                    </p>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="relative inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 rounded-l-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Previous
                        </button>
                        {[...Array(pagination.totalPages).keys()].map(index => (
                            <button
                                key={index}
                                onClick={() => handlePageChange(index + 1)}
                                className={`relative inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 border text-xs sm:text-sm font-medium ${
                                    pagination.page === index + 1
                                        ? 'z-10 bg-red-50 border-red-500 text-red-600 dark:bg-red-900 dark:border-red-700 dark:text-red-300'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="relative inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 rounded-r-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
}