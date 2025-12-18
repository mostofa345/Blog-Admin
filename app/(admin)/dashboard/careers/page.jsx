"use client";
import React, { useCallback, useEffect, useState } from "react";

// File: page.jsx (Updated with Icon support)


import { 
    Briefcase, Plus, Search, Trash2, Edit, X, CheckCircle, AlertTriangle, 
    Loader2, DollarSign, MapPin, Clock, 
    Code, Feather, Layers, Server, TrendingUp, Brush, Users, Coffee, // Added new icons
} from "lucide-react";

// --- Icon Mapping Utility ---
// আপনার JobPostModel.js-এ 'iconName' ফিল্ড অনুযায়ী Lucide কম্পোনেন্ট ম্যাপিং করা হলো
const IconMap = {
    Briefcase, Code, Feather, Layers, Server, TrendingUp, Brush, Users, Coffee
    // আপনি চাইলে আরও Lucide আইকনের নাম এখানে যোগ করতে পারেন
};

// ডায়নামিকভাবে আইকন কম্পোনেন্ট লোড করার জন্য
const getIconComponent = (iconName) => {
    // ডিফল্ট হিসেবে Briefcase ব্যবহার করা হয়েছে যদি কোনো আইকন না পাওয়া যায়
    return IconMap[iconName] || Briefcase; 
};


// --- Simple Modal Component (Admin UI এর জন্য) ---
const Modal = ({ title, children, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 dark:bg-opacity-80 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg transition-all duration-300 transform scale-100 opacity-100">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- Job Role Form Component (iconName added) ---
const AddEditJobForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        _id: initialData?._id || null, // MongoDB ID
        role: initialData?.role || "",
        location: initialData?.location || "Remote",
        salaryRange: initialData?.salaryRange || "Competitive",
        type: initialData?.type || "Full-time", // e.g., Full-time, Part-time, Contract
        description: initialData?.description || "",
        iconName: initialData?.iconName || "Briefcase", // <--- NEW FIELD
        isActive: initialData?.isActive ?? true, // Default to active
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        // Pass data to parent handler
        await onSave(formData); 
        setIsSaving(false);
    };

    const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 dark:focus:ring-green-400 dark:focus:border-green-400 text-gray-900 dark:text-white transition duration-300";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    
    // আইকন ড্রপডাউন-এর জন্য Lucide আইকনের নাম
    const availableIcons = Object.keys(IconMap).sort();

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Job Role */}
            <div>
                <label htmlFor="role" className={labelClasses}>Job Title</label>
                <input type="text" id="role" name="role" value={formData.role} onChange={handleChange} required className={inputClasses} />
            </div>
            
            {/* Icon Name */}
            <div>
                <label htmlFor="iconName" className={labelClasses}>Skill/Category Icon (Lucide Icon Name)</label>
                <div className="flex items-center space-x-2">
                    <select id="iconName" name="iconName" value={formData.iconName} onChange={handleChange} required className={inputClasses}>
                        {availableIcons.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    {/* Live Preview of the selected icon */}
                    <div className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 flex-shrink-0">
                        {React.createElement(getIconComponent(formData.iconName), { className: "w-6 h-6 text-red-600 dark:text-green-400" })}
                    </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Choose an icon to represent this job category on the public site.
                </p>
            </div>


            {/* Location & Type (Two columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="location" className={labelClasses}>Location</label>
                    <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="type" className={labelClasses}>Employment Type</label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange} required className={inputClasses}>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                    </select>
                </div>
            </div>

            {/* Salary Range */}
            <div>
                <label htmlFor="salaryRange" className={labelClasses}>Salary Range/Status</label>
                <input type="text" id="salaryRange" name="salaryRange" value={formData.salaryRange} onChange={handleChange} placeholder="e.g., $60k - $80k, Competitive" className={inputClasses} />
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className={labelClasses}>Full Job Description (Client Site)</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows="5" className={`${inputClasses} resize-none`} />
            </div>

            {/* Status Checkbox */}
            <div className="flex items-center pt-2">
                <input 
                    type="checkbox" 
                    id="isActive" 
                    name="isActive" 
                    checked={formData.isActive} 
                    onChange={handleChange} 
                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-green-400 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Active Job Posting (Show on client site)
                </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150"
                    disabled={isSaving}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 dark:bg-green-500 dark:hover:bg-green-600 dark:text-gray-900 transition duration-150 flex items-center disabled:opacity-50"
                    disabled={isSaving}
                >
                    {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                    {initialData ? "Save Changes" : "Create Job"}
                </button>
            </div>
        </form>
    );
};


// --- Main Admin Page Component ---
const AdminCareersPage = () => {
    // ... (unchanged state and API setup)
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); 
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentJob, setCurrentJob] = useState(null); // For edit/delete
    
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const API_URL = `${API_BASE_URL}/jobs`; 
    // ... (unchanged state and API setup)


    // --- API Fetch Handlers (Logic Unchanged) ---

    const fetchJobs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        if (!API_BASE_URL) {
            setError("Configuration Error: API Base URL is missing.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Server error' }));
                throw new Error(errorData.message || `Failed to fetch jobs with status: ${response.status}`);
            }

            const data = await response.json();
            setJobs(data.data || []); 
        } catch (err) {
            setError(`Failed to fetch jobs. Error: ${err.message}`);
            setJobs([]); 
        } finally {
            setIsLoading(false);
        }
    }, [API_URL, API_BASE_URL]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleSaveJob = async (jobData) => {
        setIsAddEditModalOpen(false);
        setIsLoading(true);
        setError(null);
        
        const { _id, createdAt, updatedAt, ...payload } = jobData; 
        
        const method = _id ? 'PUT' : 'POST';
        const url = _id ? `${API_URL}/${_id}` : API_URL;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Server error' }));
                throw new Error(errorData.message || `Failed to save job post with status: ${response.status}`);
            }

            await fetchJobs(); 

        } catch (err) {
            setError(err.message || 'Failed to save job post.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteJob = async () => {
        if (!currentJob || !currentJob._id) return;

        setIsDeleteModalOpen(false);
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_URL}/${currentJob._id}`, { 
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Server error' }));
                throw new Error(errorData.message || `Failed to delete job post with status: ${response.status}`);
            }
            
            await fetchJobs(); 

        } catch (err) {
            setError(err.message || 'Failed to delete job post.');
        } finally {
            setIsLoading(false);
            setCurrentJob(null);
        }
    };
    
    // --- Modal Control Functions (Unchanged) ---
    
    const openAddModal = () => {
        setCurrentJob(null);
        setIsAddEditModalOpen(true);
    };

    const openEditModal = (job) => {
        setCurrentJob(job);
        setIsAddEditModalOpen(true);
    };

    const openDeleteModal = (job) => {
        setCurrentJob(job);
        setIsDeleteModalOpen(true);
    };


    // --- Filtering Logic (Unchanged) ---
    const filteredJobs = jobs.filter(job =>
        job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // --- Status colors (Unchanged) ---
    const getStatusStyles = (isActive) => isActive
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";

    
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header (Updated Icon rendering logic) */}
                <header className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-red-500 dark:border-green-400">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
                        <Briefcase className="w-8 h-8 mr-3 text-red-600 dark:text-green-400" />
                        Careers Management
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Create, update, and manage job openings displayed on the client-side careers page.
                    </p>
                </header>

                {/* Loading and Error Feedback */}
                {/* ... (unchanged) */}
                {isLoading && (
                    <div className="flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg mb-6">
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        <span>Loading job posts...</span>
                    </div>
                )}
                
                {error && (
                    <div className="flex items-start p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg mb-6">
                        <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />
                        <p className="font-medium">API Error: {error}</p>
                    </div>
                )}
                
                {/* Controls & Search */}
                {/* ... (unchanged) */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by role, location, or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:ring-red-500 focus:border-red-500 dark:focus:ring-green-400 dark:focus:border-green-400 text-gray-900 dark:text-white transition duration-300"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <button
                        onClick={openAddModal}
                        className="w-full md:w-auto flex items-center justify-center px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-green-500 dark:hover:bg-green-600 text-white dark:text-gray-900 font-semibold rounded-lg shadow-md transition duration-300 transform hover:scale-[1.02] disabled:opacity-50"
                        disabled={isLoading}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Job Post
                    </button>
                </div>

                {/* Job Roles Table/List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Showing {filteredJobs.length} of {jobs.length} job posts.</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            {/* Table Header */}
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Job Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Location/Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Salary</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredJobs.map((job) => {
                                    const JobIcon = getIconComponent(job.iconName); // Dynamically get the icon component
                                    return (
                                    <tr key={job._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150">
                                        {/* Job Role Column */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <JobIcon className="w-5 h-5 mr-2 text-red-600 dark:text-green-400 flex-shrink-0 hidden sm:block" />
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{job.role}</div>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 block sm:hidden">{job.location} ({job.type})</div>
                                        </td>
                                        
                                        {/* Location/Type Column */}
                                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-1">
                                                <MapPin className="w-4 h-4 mr-1 text-red-500 dark:text-green-400" /> {job.location}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                                <Clock className="w-4 h-4 mr-1 text-gray-400" /> {job.type}
                                            </div>
                                        </td>
                                        
                                        {/* Salary Column */}
                                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                                <DollarSign className="w-4 h-4 mr-1 text-gray-400" /> {job.salaryRange}
                                            </div>
                                        </td>

                                        {/* Status Column */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(job.isActive)}`}>
                                                {job.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        
                                        {/* Actions column */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => openEditModal(job)}
                                                className="text-red-600 hover:text-red-900 dark:text-green-400 dark:hover:text-green-600 transition duration-150 mr-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                                                title="Edit"
                                                disabled={isLoading}
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => openDeleteModal(job)}
                                                className="text-gray-400 hover:text-red-500 transition duration-150 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                                                title="Delete"
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                })}
                                {filteredJobs.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                            No job posts found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add/Edit Job Modal */}
                <Modal 
                    title={currentJob ? "Edit Job Post" : "Create New Job Post"} 
                    isOpen={isAddEditModalOpen} 
                    onClose={() => setIsAddEditModalOpen(false)}
                >
                    <AddEditJobForm 
                        initialData={currentJob} 
                        onSave={handleSaveJob} 
                        onCancel={() => setIsAddEditModalOpen(false)} 
                    />
                </Modal>
                
                {/* Delete Confirmation Modal */}
                <Modal 
                    title="Confirm Deletion" 
                    isOpen={isDeleteModalOpen} 
                    onClose={() => setIsDeleteModalOpen(false)}
                >
                    <div className="space-y-4">
                        <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
                            <p className="text-gray-700 dark:text-gray-300">
                                Are you sure you want to delete the job post: **{currentJob?.role}**? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteJob} 
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150 flex items-center disabled:opacity-50"
                                disabled={isLoading}
                            >
                                <Trash2 className="w-5 h-5 mr-2" />
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>

            </div>
        </div>
    );
};

export default AdminCareersPage;