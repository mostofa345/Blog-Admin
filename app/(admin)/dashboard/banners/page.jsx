"use client";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

// admin/bannermanagepage.jsx
import { 
    Edit2, 
    Image as ImageIcon, 
    Loader2, 
    Monitor, 
    PlusCircle, 
    Save, 
    Tags, 
    Trash2, 
    Type, 
    AlignLeft, 
    X
} from "lucide-react";

// .env ফাইল থেকে বেস URL ব্যবহার করা হয়েছে
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
const BANNER_API_URL = `${API_BASE_URL}/banners`;
const CATEGORY_API_URL = `${API_BASE_URL}/categories`; // ক্যাটাগরি API রুট

// ব্যানার মডেলের সাথে সামঞ্জস্যপূর্ণ প্রাথমিক স্টেট
const initialBannerData = {
    title: '',
    tag: '', // ডায়নামিকালি প্রথম ক্যাটাগরি দিয়ে সেট করা হবে
    heading: '', 
    description: '',
    altText: '',
    imageUrl: '', 
    isActive: true,
    order: 0,
};

export default function BannerManagementPage() {
    const [banners, setBanners] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]); // ✅ ডায়নামিক ক্যাটাগরি স্টেট
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBanner, setCurrentBanner] = useState(null); 
    const [bannerFormData, setBannerFormData] = useState(initialBannerData);
    const [imageFile, setImageFile] = useState(null); 
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Data Fetching Functions ---

    // ✅ ক্যাটাগরি ডেটা আনার ফাংশন
    const fetchCategories = useCallback(async () => {
        try {
            const response = await axios.get(CATEGORY_API_URL);
            setAvailableCategories(response.data.data); 
            return response.data.data;
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError("ক্যাটাগরি লোড করতে ব্যর্থ।");
            return [];
        }
    }, []);

    // ব্যানার ডেটা আনার ফাংশন
    const fetchBanners = useCallback(async () => {
        setError(null);
        try {
            const response = await axios.get(BANNER_API_URL);
            setBanners(response.data.data); 
        } catch (err) {
            console.error("Error fetching banners:", err);
            setError("ব্যানার ডেটা আনতে ব্যর্থ। সার্ভার চেক করুন।");
            setBanners([]);
        } 
    }, []);

    // 💡 useEffect: ব্যানার এবং ক্যাটাগরি একসাথে লোড করা
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            const categories = await fetchCategories(); // ক্যাটাগরি আগে লোড করা
            await fetchBanners();
            
            // ক্যাটাগরি লোড হলে প্রাথমিক ট্যাগ সেট করা
            if (categories.length > 0) {
                // সার্ভার থেকে আসা প্রথম ক্যাটাগরির `name` কে ডিফল্ট হিসেবে সেট করা হলো
                setBannerFormData(prev => ({
                    ...prev,
                    tag: categories[0].name || '', 
                }));
            }
            setIsLoading(false);
        };
        loadInitialData();
    }, [fetchBanners, fetchCategories]); 

    // --- State and Modal Handling ---
    const openCreateModal = () => {
        setCurrentBanner(null);
        setBannerFormData({
            ...initialBannerData,
            // মোডাল খোলার সময় ডায়নামিক ডিফল্ট ট্যাগ সেট করা
            tag: availableCategories.length > 0 ? availableCategories[0].name || '' : '', 
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const openEditModal = (banner) => {
        setCurrentBanner(banner);
        setBannerFormData({
            title: banner.title,
            tag: banner.tag,
            heading: banner.heading,
            description: banner.description,
            altText: banner.altText,
            imageUrl: banner.imageUrl,
            isActive: banner.isActive,
            order: banner.order,
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentBanner(null);
        setBannerFormData(initialBannerData);
        setImageFile(null);
        setError(null);
    };

    // --- Form Handlers ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setBannerFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
        // ফাইল সিলেক্ট হলে প্রিভিউ URL তৈরি করা
        setBannerFormData(prev => ({
            ...prev,
            imageUrl: e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : (currentBanner ? currentBanner.imageUrl : ''),
        }));
    };

    // --- API Operations ---
    const handleSaveBanner = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        // --- Validation ---
        if (!currentBanner && !imageFile) {
            setError("নতুন ব্যানার যোগ করার জন্য একটি ছবি অবশ্যই দরকার।");
            setIsSaving(false);
            return;
        }

        // --- FormData Preparation ---
        const formData = new FormData();
        formData.append('title', bannerFormData.title);
        formData.append('tag', bannerFormData.tag);
        formData.append('heading', bannerFormData.heading);
        formData.append('description', bannerFormData.description);
        formData.append('altText', bannerFormData.altText);
        formData.append('isActive', bannerFormData.isActive);
        formData.append('order', bannerFormData.order || 0);

        if (imageFile) {
            formData.append('bannerImage', imageFile);
        } else if (currentBanner) {
            // এডিটের ক্ষেত্রে বিদ্যমান URL পাঠানো
            formData.append('existingImageUrl', bannerFormData.imageUrl);
        }

        try {
            if (currentBanner) {
                // UPDATE
                await axios.put(`${BANNER_API_URL}/${currentBanner._id}`, formData);
            } else {
                // CREATE
                await axios.post(BANNER_API_URL, formData);
            }

            await fetchBanners(); // সফল হলে তালিকা রিফ্রেশ করা
            closeModal();

        } catch (err) {
            console.error("Failed to save banner:", err.response?.data || err);
            setError(err.response?.data?.message || `ব্যানার সেভ করতে ব্যর্থ: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBanner = async (id) => {
        if (!window.confirm("আপনি কি নিশ্চিত এই ব্যানারটি মুছে ফেলতে চান? এই পদক্ষেপটি পূর্বাবস্থায় ফেরানো যাবে না।")) {
            return;
        }
        try {
            await axios.delete(`${BANNER_API_URL}/${id}`);
            fetchBanners(); 
        } catch (err) {
            console.error("Failed to delete banner:", err);
            alert("ব্যানার মোছার সময় একটি ত্রুটি হয়েছে।");
        }
    };

    const handleToggleStatus = async (banner) => {
        try {
            const updatedData = { 
                ...banner, 
                isActive: !banner.isActive,
                // ইমেজ URL নিশ্চিত করা 
                existingImageUrl: banner.imageUrl 
            };
            // শুধুমাত্র isActive ফিল্ড আপডেট করা
            await axios.put(`${BANNER_API_URL}/${banner._id}`, updatedData);
            fetchBanners(); 
        } catch (err) {
            console.error("Failed to toggle banner status:", err);
            alert("স্ট্যাটাস পরিবর্তন করতে ব্যর্থ।");
        }
    };

    // --- Render Content ---
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <span className="ml-3 text-lg text-gray-700 dark:text-gray-300">ব্যানার ও ক্যাটাগরি লোড হচ্ছে...</span>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <Monitor className="w-7 h-7 text-indigo-500" />
                    ব্যানার ম্যানেজমেন্ট
                </h1>

                {/* Error Message */}
                {error && <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">{error}</div>}

                {/* Add New Banner Button */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                        <PlusCircle className="w-5 h-5" />
                        নতুন ব্যানার যোগ করুন
                    </button>
                </div>

                {/* Banner List Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">টাইটেল / ট্যাগ / অর্ডার</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">হেডিং ও বর্ণনা</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">ছবি (ALT)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">স্ট্যাটাস</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {banners.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                            কোনো ব্যানার পাওয়া যায়নি।
                                        </td>
                                    </tr>
                                ) : (
                                    banners.map((banner) => (
                                        <tr key={banner._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {banner.title}
                                                <div className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">#{banner.tag} | অর্ডার: {banner.order}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                                                <strong className="block truncate font-semibold">{banner.heading}</strong>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{banner.description}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <img 
                                                    src={banner.imageUrl} 
                                                    alt={banner.altText} 
                                                    className="w-20 h-10 object-cover rounded-md border border-gray-200 dark:border-gray-600" 
                                                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/80x40/7C3AED/FFFFFF?text=Image" }}
                                                />
                                                <div className="text-xs text-gray-400 truncate w-20 mt-0.5" title={banner.altText}>({banner.altText || 'No Alt Text'})</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span
                                                    onClick={() => handleToggleStatus(banner)}
                                                    className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors duration-200 ${
                                                         banner.isActive
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 hover:bg-red-200'
                                                    }`}
                                                >
                                                    {banner.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => openEditModal(banner)}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 transition"
                                                    aria-label="Edit Banner"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBanner(banner._id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition"
                                                    aria-label="Delete Banner"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal for Add/Edit Banner */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {currentBanner ? 'ব্যানার এডিট করুন' : 'নতুন ব্যানার যোগ করুন'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveBanner} className="p-6 space-y-4">
                            {error && <div className="p-3 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-700 dark:text-red-400" role="alert">{error}</div>}

                            {/* Title (Internal Use) */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ব্যানার টাইটেল (Internal Use)</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={bannerFormData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Homepage Main Banner 1"
                                    className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                                />
                            </div>

                            {/* Tag Select (ডায়নামিক ক্যাটাগরি) */}
                            <div>
                                <label htmlFor="tag" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <Tags className="w-4 h-4"/> ট্যাগ / ক্যাটাগরি
                                </label>
                                <select
                                    id="tag"
                                    name="tag"
                                    value={bannerFormData.tag}
                                    onChange={handleChange}
                                    required
                                    disabled={availableCategories.length === 0} // ক্যাটাগরি না থাকলে ডিসেবলড থাকবে
                                    className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 appearance-none disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
                                >
                                    {availableCategories.length === 0 && <option value="">ক্যাটাগরি লোড হয়নি/নেই</option>}
                                    {availableCategories.map(cat => (
                                        // ✅ cat.name ব্যবহার করা হলো
                                        <option key={cat._id} value={cat.name}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Heading */}
                            <div>
                                <label htmlFor="heading" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <Type className="w-4 h-4"/> প্রধান হেডিং (Headline)
                                </label>
                                <input
                                    type="text"
                                    id="heading"
                                    name="heading"
                                    value={bannerFormData.heading}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Hidden Gems: Exploring Lesser-Known World Tours"
                                    className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <AlignLeft className="w-4 h-4"/> সংক্ষিপ্ত বর্ণনা
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={bannerFormData.description}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    placeholder="এই ব্যানার কী বিষয়ে, তার সংক্ষিপ্ত বিবরণ দিন।"
                                    className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                                />
                            </div>

                            {/* Image File Upload */}
                            <div>
                                <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-2">
                                    <ImageIcon className="w-4 h-4"/> ব্যানার ছবি আপলোড
                                </label>
                                <input
                                    type="file"
                                    id="bannerImage"
                                    name="bannerImage"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required={!currentBanner} 
                                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />

                                {(bannerFormData.imageUrl || currentBanner?.imageUrl) && (
                                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                        ছবি প্রিভিউ: 
                                        <img 
                                            src={imageFile ? URL.createObjectURL(imageFile) : bannerFormData.imageUrl} 
                                            alt="Banner Preview" 
                                            className="w-full h-auto max-h-40 object-contain mt-2 rounded-md border border-dashed border-gray-300 p-2" 
                                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x100/A855F7/FFFFFF?text=Image+Error" }}
                                        />
                                        {currentBanner && !imageFile && (
                                            <p className="mt-1 text-xs text-indigo-500">বর্তমানে এই ছবিটি আছে। নতুন ছবি আপলোড না করলে এটিই থাকবে।</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Alt Text */}
                            <div>
                                <label htmlFor="altText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ALT Text (SEO/Accessibility)</label>
                                <input
                                    type="text"
                                    id="altText"
                                    name="altText"
                                    value={bannerFormData.altText}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., A cyclist on a mountain trail at sunset"
                                    className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                                />
                            </div>

                            {/* Order Input (Optional) */}
                            <div>
                                <label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ক্রম (Order - ঐচ্ছিক)</label>
                                <input
                                    type="number"
                                    id="order"
                                    name="order"
                                    value={bannerFormData.order}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                                />
                            </div>

                            {/* Status Checkbox */}
                            <div className="flex items-center">
                                <input
                                    id="isActive"
                                    name="isActive"
                                    type="checkbox"
                                    checked={bannerFormData.isActive}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Active ব্যানার
                                </label>
                            </div>

                            {/* Save Button */}
                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-5 py-2 text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {currentBanner ? 'আপডেট করুন' : 'যোগ করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}