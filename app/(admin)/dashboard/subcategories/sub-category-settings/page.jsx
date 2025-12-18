"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";

// /app/sub-category-settings/page.jsx

// 💡 API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
// সাব-ক্যাটাগরি লিস্টের API URL
const SUBCATEGORY_API_URL = `${API_BASE_URL}/subcategories`; 
// সেটিংস API URL
const SETTINGS_API_URL = `${API_BASE_URL}/settings`; 


// 💡 ইনিশিয়াল খালি ডেটা স্ট্রাকচার (API থেকে লোড না হওয়া পর্যন্ত)
const initialSettingsState = {
    subCategorySlug: '', 
    coverTitle: '', 
    coverSubtitle: '',
    coverImage: { url: '', alt: '', file: null },
    featuredImage: { url: '', alt: '', file: null },
    newsletterImage: { url: '', alt: '', file: null },
};


// --- Helper Component: Image Uploader with File Select (Gallery) ---
const ImageUploader = ({ label, section, currentImage, onImageSelect, onAltChange }) => {
    const fileInputRef = useRef(null);
    const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-300";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            alert("Please select a valid image file.");
            return;
        }

        const localUrl = URL.createObjectURL(file); 
        
        onImageSelect(section, 'url', localUrl);
        onImageSelect(section, 'file', file);
    };
    
    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="space-y-4 border border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">{label}</h4>
            
            {/* Current Image Preview */}
            {currentImage.url ? (
                <div className="relative h-32 w-full rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {/* Image URL check যোগ করা হয়েছে */}
                    {currentImage.url && <img src={currentImage.url} alt={currentImage.alt} className="w-full h-full object-cover" />}
                    {currentImage.file && (
                           <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-bl-md">
                               New File Selected
                           </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-semibold">
                        {currentImage.file ? `Ready to Upload: ${currentImage.file.name}` : 'Current Image URL'}
                    </div>
                </div>
            ) : (
                <div className="h-20 flex items-center justify-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-400 rounded-md">
                    No image selected.
                </div>
            )}

            {/* Hidden File Input */}
            <input 
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => handleFile(e.target.files[0])}
                style={{ display: 'none' }} 
            />

            {/* Clickable Upload Button Area */}
            <div 
                className={`flex justify-center items-center h-12 rounded-md transition-colors cursor-pointer 
                    bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md border-red-700 border
                `}
                onClick={handleButtonClick}
            >
                <p className="text-white font-semibold text-center text-lg">
                    🖼️ Upload Image (Select from Gallery)
                </p>
            </div>
            
            {/* Alt Text Field */}
            <div>
                <label className={labelClass} htmlFor={`${section}-alt`}>Alt Text (SEO)</label>
                <input
                    type="text"
                    id={`${section}-alt`}
                    value={currentImage.alt || ''}
                    onChange={(e) => onAltChange(section, 'alt', e.target.value)}
                    placeholder="Descriptive text for the image"
                    className={inputClass}
                    name={`${section}_alt`} 
                />
            </div>
        </div>
    );
};


// --- Main Admin Component ---
const SubCategorySettingsPage = () => {
    const [settings, setSettings] = useState(initialSettingsState);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [subCategories, setSubCategories] = useState([]); // ✅ API থেকে লোড হবে

    // --- সেটিংস লোড করার ফাংশন ---
    const loadSettings = useCallback(async (slug, allCats) => {
        if (!slug) return;
        setStatusMessage(`Loading settings for: ${slug}...`);
        
        try {
            // GET /api/settings/:slug
            const response = await fetch(`${SETTINGS_API_URL}/${slug}`);
            
            if (response.status === 404) {
                // সেটিংস না পেলে default initial state সেট করা হবে
                const catName = allCats.find(c => c.slug === slug)?.name || slug;
                setSettings({
                    ...initialSettingsState,
                    subCategorySlug: slug,
                    coverTitle: catName,
                    // coverSubtitle: `${catName} - In-depth articles and guides from the ${catName} category.`, // ডিফল্ট সাবটাইটেল
                });
                setStatusMessage(`Settings not found for "${slug}". Using initial form values.`);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch settings from API.');
            }

            const data = await response.json();
            
            // API ডেটা থেকে settings state তৈরি করা
            // এখানে ধরে নেওয়া হচ্ছে API রেসপন্সটি settings-এর মতই, শুধু image object-এ url ও alt আছে
            setSettings({
                subCategorySlug: data.subCategorySlug || data.slug,
                coverTitle: data.coverTitle || '',
                coverSubtitle: data.coverSubtitle || '',
                coverImage: { ...data.coverImage, file: null }, // URL ও Alt সহ file: null সেট করা
                featuredImage: { ...data.featuredImage, file: null },
                newsletterImage: { ...data.newsletterImage, file: null },
            });
            setStatusMessage(`Loaded settings for: ${data.subCategorySlug} successfully.`);

        } catch (error) {
            console.error("Load Error:", error);
            setStatusMessage(`❌ Error loading settings for ${slug}: ${error.message}`);
        }
    }, []);

    // --- SubCategories লোড করার জন্য useEffect (মেইন ফিক্স) ---
    const fetchSubCategories = useCallback(async () => {
        setStatusMessage('Loading sub-categories list...');
        try {
            const response = await fetch(SUBCATEGORY_API_URL);
            
            if (!response.ok) {
                throw new Error('Failed to fetch sub-categories list.');
            }

            const responseData = await response.json();
            
            let categoryArray = [];
            // SubCategoryListPage-এর মতো ডেটা স্ট্রাকচার হ্যান্ডেল করা
            if (Array.isArray(responseData)) {
                categoryArray = responseData;
            } else if (responseData && Array.isArray(responseData.subCategories)) {
                categoryArray = responseData.subCategories;
            } else if (responseData && Array.isArray(responseData.data)) {
                 categoryArray = responseData.data;
            }
            
            // ডেটা স্ট্রাকচার ম্যাপ করা (slug এবং name দরকার)
            const mappedCategories = categoryArray.map(item => ({
                id: item._id || item.id,
                name: item.name,
                slug: item.slug, // 💡 ড্রপডাউনের value হিসেবে slug ব্যবহার করা হবে
            }));

            setSubCategories(mappedCategories);
            
            // প্রথমটি ডিফল্ট হিসেবে সেট করা
            if (mappedCategories.length > 0) {
                const defaultSlug = mappedCategories[0].slug;
                loadSettings(defaultSlug, mappedCategories);
            } else {
                 setStatusMessage('No sub-categories found. Please add one first.');
            }

        } catch (error) {
            console.error("Sub-Category List Fetch Error:", error);
            setStatusMessage(`❌ Error loading sub-categories list: ${error.message}`);
        }
    }, [loadSettings]);

    useEffect(() => {
        fetchSubCategories();
    }, [fetchSubCategories]); // ✅ Component load হওয়ার সময় লিস্ট লোড করবে
    

    // --- SubCategory চেঞ্জ হলে নতুন সেটিংস লোড করা ---
    const handleSubCategoryChange = (e) => {
        const newSlug = e.target.value;
        setSettings(prev => ({ ...prev, subCategorySlug: newSlug }));
        loadSettings(newSlug, subCategories); // নতুন স্লাগের জন্য সেটিংস লোড করুন
    };
    
    // --- অন্যান্য হ্যান্ডলার্স (আগের মতোই) ---
    const handleTextChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    // --- ফর্ম সাবমিশন হ্যান্ডলার (Next.js Server Action/API Route Compatible) ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setStatusMessage('Saving settings...');

        const formData = new FormData(e.target); 
        
        // File Object ও Existing URL গুলি ম্যানুয়ালি FormData-তে যুক্ত করা
        Object.entries(settings).forEach(([key, value]) => {
            if (key.endsWith('Image')) {
                if (value.file) {
                    formData.append(key, value.file); 
                } 
                else if (value.url) {
                    // এটি নিশ্চিত করবে যে সার্ভার বুঝতে পারে যে এই ইমেজটি আপডেট করতে হবে না
                    formData.append(key + '_url', value.url); 
                }
                formData.append(key + '_alt', value.alt || '');
            }
        });

        // Current subCategorySlug ম্যানুয়ালি যোগ করা
        formData.set('subCategorySlug', settings.subCategorySlug);


        try {
            // POST /api/settings
            const response = await fetch(SETTINGS_API_URL, { 
                method: 'POST', 
                body: formData, 
            }); 

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to save settings on server.');
            }

            const data = await response.json();

            setStatusMessage(`✅ Settings for "${data.settings.subCategorySlug}" saved successfully!`);
            
            // সফল হলে, ফাইল স্টেট null করে দেওয়া
            setSettings(prev => ({
                ...prev,
                coverImage: { ...prev.coverImage, file: null },
                featuredImage: { ...prev.featuredImage, file: null },
                newsletterImage: { ...prev.newsletterImage, file: null },
            }));

        } catch (error) {
            console.error("Save Error:", error);
            setStatusMessage(`❌ Error saving settings: ${error.message || 'Check console.'}`);
        }
        
        setIsSaving(false);
    };
    
    // UI স্টাইল
    const cardClass = "bg-white p-6 rounded-lg shadow-xl dark:bg-gray-800 transition-colors duration-300";
    const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-300";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";


    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition-colors duration-500">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 border-b border-red-500 pb-2">
                    Sub-Category Page Content Manager 🚀
                </h1>
                
                {/* Status Message */}
                {statusMessage && (
                    <div className={`p-3 mb-6 rounded-lg font-medium ${statusMessage.startsWith('✅') ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : statusMessage.startsWith('❌') ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'}`}>
                        {statusMessage}
                    </div>
                )}

                {/* --- SubCategory Selector --- */}
                <div className={`${cardClass} mb-8`}>
                    <label htmlFor="subCategorySelector" className="block text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Select Sub-Category to Edit
                    </label>
                    <select
                        id="subCategorySelector"
                        value={settings.subCategorySlug}
                        onChange={handleSubCategoryChange}
                        className={inputClass}
                        name="subCategorySlug"
                        disabled={subCategories.length === 0 || isSaving}
                    >
                        {subCategories.length === 0 ? (
                            <option value="" disabled>
                                {statusMessage.includes('Error') ? 'Error loading list' : 'Loading Sub-Categories...'}
                            </option>
                        ) : (
                            subCategories.map((cat) => (
                                <option key={cat.slug} value={cat.slug}>
                                    {cat.name} ({cat.slug})
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-8">
                    
                    {/* --- 1. Cover Content (Text & Image) --- */}
                    <div className={cardClass}>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 border-b pb-2">
                            1. Cover/Banner Content (Text & Image)
                        </h2>
                        
                        {/* Cover Text Fields */}
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className={labelClass} htmlFor="coverTitle">Cover Title (H1)</label>
                                <input
                                    type="text"
                                    id="coverTitle"
                                    value={settings.coverTitle}
                                    onChange={(e) => handleTextChange('coverTitle', e.target.value)}
                                    placeholder="Main title for the banner"
                                    className={inputClass}
                                    name="coverTitle"
                                />
                            </div>
                            <div>
                                <label className={labelClass} htmlFor="coverSubtitle">Cover Subtitle (P)</label>
                                <textarea
                                    id="coverSubtitle"
                                    rows="2"
                                    value={settings.coverSubtitle}
                                    onChange={(e) => handleTextChange('coverSubtitle', e.target.value)}
                                    placeholder="Secondary text below the title"
                                    className={inputClass}
                                    name="coverSubtitle"
                                />
                            </div>
                        </div>

                        {/* Cover Image Uploader (Gallery Select Button) */}
                        <ImageUploader
                            label="Cover Background Image"
                            section="coverImage"
                            currentImage={settings.coverImage}
                            onImageSelect={handleImageChange}
                            onAltChange={handleImageChange}
                        />
                    </div>

                    {/* --- 2. Featured Section Image --- */}
                    <div className={cardClass}>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                            2. Featured Section Background
                        </h2>
                           <ImageUploader
                            label="Featured Section Background Image"
                            section="featuredImage"
                            currentImage={settings.featuredImage}
                            onImageSelect={handleImageChange}
                            onAltChange={handleImageChange}
                        />
                    </div>

                    {/* --- 3. Newsletter Section Image --- */}
                    <div className={cardClass}>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                            3. Newsletter Section Background
                        </h2>
                        <ImageUploader
                            label="Newsletter Background Image"
                            section="newsletterImage"
                            currentImage={settings.newsletterImage}
                            onImageSelect={handleImageChange}
                            onAltChange={handleImageChange}
                        />
                    </div>
                    
                    {/* --- Save Button --- */}
                    <button
                        type="submit"
                        disabled={isSaving || !settings.subCategorySlug}
                        className={`w-full px-6 py-3 text-lg font-semibold text-white rounded-lg transition-all duration-300 shadow-xl 
                            ${(isSaving || !settings.subCategorySlug) ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 transform hover:scale-[1.01]'}
                        `}
                    >
                        {isSaving ? 'Saving...' : 'Save Category Settings'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default SubCategorySettingsPage;