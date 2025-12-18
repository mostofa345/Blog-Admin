"use client";
import React, { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Edit, Facebook, Linkedin, Loader2, Plus, Search, Trash2, Users, X } from "lucide-react";

// Simple Modal Component
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
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};


const AdminTeamPage = () => {
    // API Integration States
    const [team, setTeam] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); 

    const [searchTerm, setSearchTerm] = useState("");
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentMember, setCurrentMember] = useState(null); // For edit/delete
    
    // --- ফিক্স: .env ফাইল থেকে API Base URL ব্যবহার করা ---
    // এটি নিশ্চিত করে যে কলটি আপনার Express সার্ভারের (যেমন https://blog-server-0exu.onrender.com/api) কাছে যাচ্ছে।
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
    const API_URL = `${API_BASE_URL}/team`; // e.g., https://blog-server-0exu.onrender.com/api/team
    // ----------------------------------------------------

    // --- Core Data Fetching Function ---
    const fetchTeamMembers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            
            // Response OK না হলে JSON হিসেবে পার্স করার চেষ্টা করুন
            if (!response.ok) {
                 const text = await response.text(); 
                 let errorMessage = `HTTP error! Status: ${response.status}.`;
                try {
                    // যদি সার্ভার কোনো এরর JSON পাঠায়
                    const data = JSON.parse(text);
                    errorMessage = data.message || errorMessage;
                } catch {
                    // যদি সার্ভার HTML (DOCTYPE) বা অন্য কিছু পাঠায়
                    errorMessage = `Server Error: ${text.substring(0, 50)}... (Not valid JSON)`;
                }
                throw new Error(errorMessage);
            }
            
            const data = await response.json();

            if (data.success) {
                // MongoDB তে _id ব্যবহার হয়
                setTeam(data.data || []); 
            } else {
                throw new Error(data.message || 'Failed to fetch team members.');
            }
        } catch (err) {
            setError(err.message);
            setTeam([]);
            console.error("Fetch Error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [API_URL]);

    // Load data on component mount
    useEffect(() => {
        fetchTeamMembers();
    }, [fetchTeamMembers]);
    
    // --- API Handlers ---
    
    const handleSaveMember = async (memberData) => {
        // Close the modal immediately for better UX
        setIsAddEditModalOpen(false);
        setIsLoading(true);
        
        // MongoDB ID (_id) এর উপস্থিতি অনুসারে POST বা PUT নির্ধারণ
        const isEditing = memberData._id;
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}/${memberData._id}` : API_URL;
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                // FormData-তে _id থাকলে তা API তে পাঠাতে হবে
                body: JSON.stringify(memberData),
            });

            const data = await response.json();

            if (!response.ok) {
                // Validation Error বা অন্য API এরর এখানে হ্যান্ডেল হবে
                throw new Error(data.message || `Failed to ${isEditing ? 'update' : 'add'} member.`);
            }

            // সফলভাবে অপারেশন হলে তালিকা রিফ্রেশ করুন
            await fetchTeamMembers();
            setCurrentMember(null); 
            setError(null); 

        } catch (err) {
            setError(err.message);
            console.error("Save Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMember = async () => {
        if (!currentMember || !currentMember._id) {
            setIsDeleteModalOpen(false);
            return;
        }

        setIsLoading(true);
        setIsDeleteModalOpen(false); 
        
        try {
            const response = await fetch(`${API_URL}/${currentMember._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete member.');
            }

            // সফলভাবে ডিলিট হলে তালিকা রিফ্রেশ করুন
            await fetchTeamMembers();
            setCurrentMember(null);
            setError(null);
            
        } catch (err) {
            setError(err.message);
            console.error("Delete Error:", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- Modal Control Functions ---
    
    const openAddModal = () => {
        setCurrentMember(null);
        setIsAddEditModalOpen(true);
    };

    const openEditModal = (member) => {
        setCurrentMember(member);
        setIsAddEditModalOpen(true);
    };

    const openDeleteModal = (member) => {
        setCurrentMember(member);
        setIsDeleteModalOpen(true);
    };


    // --- FILTERING LOGIC ---
    const filteredTeam = team.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // --- END FILTERING LOGIC ---
    
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-red-500 dark:border-green-400">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
                        <Users className="w-8 h-8 mr-3 text-red-600 dark:text-green-400" />
                        Team Management Panel
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Manage all team members displayed on the client-side "About Us" page.
                    </p>
                </header>

                {/* Loading and Error Feedback */}
                {isLoading && (
                    <div className="flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg mb-6">
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        <span>Loading team members...</span>
                    </div>
                )}
                
                {/* 🔴 ফিক্সড এরর ডিসপ্লে */}
                {error && (
                    <div className="flex items-center p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg mb-6">
                        <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />
                        <p className="font-medium">API Error: {error}</p>
                    </div>
                )}
                
                {/* Controls & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name, role, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:ring-red-500 focus:border-red-500 dark:focus:ring-green-400 dark:focus:border-green-400 text-gray-900 dark:text-white transition duration-300"
                            disabled={isLoading}
                        />
                    </div>
                    
                    {/* Add Member Button */}
                    <button
                        onClick={openAddModal}
                        className="w-full md:w-auto flex items-center justify-center px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-green-500 dark:hover:bg-green-600 text-white dark:text-gray-900 font-semibold rounded-lg shadow-md transition duration-300 transform hover:scale-[1.02] disabled:opacity-50"
                        disabled={isLoading}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Member
                    </button>
                </div>

                {/* Team Members Table/List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members: {filteredTeam.length}</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            {/* Table Header */}
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">Social</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Expertise/Category</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredTeam.map((member) => (
                                    <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{member.role}</div>
                                        </td>
                                        {/* Social Column */}
                                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                            <div className="flex space-x-2">
                                                {member.linkedin && <Linkedin className="w-5 h-5 text-blue-600 dark:text-blue-400" title="LinkedIn Linked" />}
                                                {member.facebook && <Facebook className="w-5 h-5 text-indigo-600 dark:text-indigo-400" title="Facebook Linked" />}
                                                {!member.linkedin && !member.facebook && <span className="text-gray-400 text-xs italic">N/A</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-green-900 dark:text-green-300">
                                                {member.category}
                                            </span>
                                        </td>
                                        {/* Actions column */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => openEditModal(member)}
                                                className="text-red-600 hover:text-red-900 dark:text-green-400 dark:hover:text-green-600 transition duration-150 mr-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                                                title="Edit"
                                                disabled={isLoading}
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => openDeleteModal(member)}
                                                className="text-gray-400 hover:text-red-500 transition duration-150 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                                                title="Delete"
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredTeam.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                            No team members found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add/Edit Modal */}
                <Modal 
                    title={currentMember ? "Edit Team Member" : "Add New Team Member"} 
                    isOpen={isAddEditModalOpen} 
                    onClose={() => setIsAddEditModalOpen(false)}
                >
                    <AddEditForm 
                        // MongoDB _id কে formData তে পাস করা হয়েছে
                        initialData={currentMember} 
                        onSave={handleSaveMember} 
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
                                Are you sure you want to delete **{currentMember?.name}**? This action cannot be undone.
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
                                onClick={handleDeleteMember} 
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

// Form for Adding and Editing Team Members
const AddEditForm = ({ initialData, onSave, onCancel }) => {
    
    // formData তে MongoDB এর _id কে সংরক্ষণ করা হয়েছে
    const [formData, setFormData] = useState({
        _id: initialData?._id || null, 
        name: initialData?.name || "",
        role: initialData?.role || "",
        category: initialData?.category || "",
        linkedin: initialData?.linkedin || "", 
        facebook: initialData?.facebook || "", 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // save handler-এ পুরো formData পাঠানো হয়েছে, যেখানে _id থাকতে পারে
        onSave(formData);
    };

    const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 dark:focus:ring-green-400 dark:focus:border-green-400 text-gray-900 dark:text-white transition duration-300";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
                <label htmlFor="name" className={labelClasses}>Full Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} />
            </div>
            
            <div>
                <label htmlFor="role" className={labelClasses}>Role/Title</label>
                <input type="text" id="role" name="role" value={formData.role} onChange={handleChange} required className={inputClasses} />
            </div>

            <div>
                <label htmlFor="category" className={labelClasses}>Expertise/Category (e.g., AI & Future Tech)</label>
                <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} required className={inputClasses} />
            </div>

            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 pt-2 border-t dark:border-gray-700">Social Media Links</h4>

            {/* LinkedIn Link Field */}
            <div>
                <label htmlFor="linkedin" className={labelClasses}>
                    <Linkedin className="w-4 h-4 inline mr-1 text-blue-600" /> LinkedIn URL (Optional)
                </label>
                <input 
                    type="url" 
                    id="linkedin" 
                    name="linkedin" 
                    value={formData.linkedin} 
                    onChange={handleChange} 
                    placeholder="https://linkedin.com/in/username"
                    className={inputClasses}
                />
            </div>
            
            {/* Facebook Link Field */}
            <div>
                <label htmlFor="facebook" className={labelClasses}>
                    <Facebook className="w-4 h-4 inline mr-1 text-indigo-600" /> Facebook URL (Optional)
                </label>
                <input 
                    type="url" 
                    id="facebook" 
                    name="facebook" 
                    value={formData.facebook} 
                    onChange={handleChange} 
                    placeholder="https://facebook.com/username"
                    className={inputClasses}
                />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 dark:bg-green-500 dark:hover:bg-green-600 dark:text-gray-900 transition duration-150 flex items-center"
                >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {formData._id ? "Save Changes" : "Add Member"}
                </button>
            </div>
        </form>
    );
};

export default AdminTeamPage;