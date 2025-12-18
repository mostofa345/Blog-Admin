"use client";
import React, { useCallback, useEffect, useState } from "react";
import { FileText, Heading, Image as ImageIcon, Loader2, Save, Tag, Trash2, Upload } from "lucide-react";

// .env.local থেকে API Base URL ব্যবহার করা হলো
// NEXT_PUBLIC_API_BASE_URL: https://blog-server-0exu.onrender.com/api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://blog-server-0exu.onrender.com/api";
const API_ENDPOINT = `${API_BASE_URL}/hero`; // Hero Routes এর জন্য নতুন API পাথ

export default function HeroSectionForm() {
    const initialState = {
        // Text Content
        mainHeading: "",
        highlightWord: "",
        description: "",
        
        // Main Image (Stored URL and Alt Text)
        mainImageUrl: "",
        mainImageAlt: "", 
        
        // Small Top Image
        smallTopImageUrl: "",
        smallTopImageAlt: "", 
        
        // Small Bottom Image
        smallBottomImageUrl: "",
        smallBottomImageAlt: "", 
    };

    const [formData, setFormData] = useState(initialState);
    
    // 💡 ফাইলগুলো state-এ রাখার জন্য আলাদা অবজেক্ট
    const [imageFiles, setImageFiles] = useState({
        mainImageFile: null,
        smallTopImageFile: null,
        smallBottomImageFile: null,
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' or 'error'

    // ✅ Effect: API থেকে বর্তমান ডেটা লোড করা হচ্ছে
    useEffect(() => {
        const loadHeroData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(API_ENDPOINT);
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.data) {
                        const data = result.data;
                        // সার্ভার ডেটা অনুযায়ী ফর্ম স্টেট সেট করা
                        setFormData({
                            mainHeading: data.mainHeading || "",
                            highlightWord: data.highlightWord || "",
                            description: data.description || "",
                            
                            mainImageUrl: data.mainImage?.imageUrl || "",
                            mainImageAlt: data.mainImage?.altText || "",
                            
                            smallTopImageUrl: data.smallTopImage?.imageUrl || "",
                            smallTopImageAlt: data.smallTopImage?.altText || "",
                            
                            smallBottomImageUrl: data.smallBottomImage?.imageUrl || "",
                            smallBottomImageAlt: data.smallBottomImage?.altText || "",
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to load initial hero data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadHeroData();
    }, []);

    // --- Content Input Handlers ---
    const handleTextChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    // --- Image File Selector Handler ---
    const handleFileChange = useCallback((e, fileKey) => {
        const file = e.target.files[0];
        if (file) {
             // ফাইল state-এ সেভ করা
            setImageFiles(prev => ({ ...prev, [fileKey]: file }));
            // ফাইলের নাম দেখানোর জন্য formData-তে অস্থায়ী নাম সেভ করা (প্রিভিউয়ের জন্য)
            setFormData(prev => ({ ...prev, [`${fileKey}Name`]: file.name }));
        }
    }, []);

    const handleRemoveImage = (urlKey, altKey, fileKey) => {
        setFormData(prev => ({
            ...prev,
            [urlKey]: '',
            [altKey]: '',
            [`${fileKey}Name`]: null // প্রিভিউ নাম রিমুভ করা
        }));
        setImageFiles(prev => ({ ...prev, [fileKey]: null })); // ফাইল রিমুভ করা
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus(null);
        
        // 💡 FormData তৈরি করা: এটি টেক্সট এবং ফাইল দুটোই একসাথে পাঠাতে পারে
        const uploadData = new FormData();
        
        // ১. টেক্সট ডেটা যোগ করা
        uploadData.append('mainHeading', formData.mainHeading);
        uploadData.append('highlightWord', formData.highlightWord);
        uploadData.append('description', formData.description);

        // ২. প্রতিটি ছবির ডেটা যোগ করা
        const images = [
            { urlKey: 'mainImageUrl', altKey: 'mainImageAlt', fileKey: 'mainImageFile' },
            { urlKey: 'smallTopImageUrl', altKey: 'smallTopImageAlt', fileKey: 'smallTopImageFile' },
            { urlKey: 'smallBottomImageUrl', altKey: 'smallBottomImageAlt', fileKey: 'smallBottomImageFile' },
        ];

        images.forEach(img => {
            // বিদ্যমান URL (যদি থাকে)
            uploadData.append(img.urlKey, formData[img.urlKey]); 
            // Alt Text
            uploadData.append(img.altKey, formData[img.altKey]);
            // ফাইল (যদি নতুন সিলেক্ট করা হয়) - সার্ভার এটি ইমেজ হিসেবে পাবে
            if (imageFiles[img.fileKey]) {
                uploadData.append(img.fileKey, imageFiles[img.fileKey]); 
            }
        });

        // 💡 API কল
        try {
            const response = await fetch(API_ENDPOINT, { 
                method: 'POST',
                // FormData ব্যবহার করার জন্য 'Content-Type' হেডার সেট করার দরকার নেই।
                body: uploadData, 
            });

            if (response.ok) {
                const result = await response.json();
                setSaveStatus('success');
                console.log("API Response:", result.data);
                // সাফল্যের পরে নতুন URL দিয়ে ফর্ম আপডেট করা
                // এবং ফাইল স্টেট রিসেট করা
                setFormData({
                    mainHeading: result.data.mainHeading,
                    highlightWord: result.data.highlightWord,
                    description: result.data.description,
                    mainImageUrl: result.data.mainImage.imageUrl,
                    mainImageAlt: result.data.mainImage.altText,
                    smallTopImageUrl: result.data.smallTopImage.imageUrl,
                    smallTopImageAlt: result.data.smallTopImage.altText,
                    smallBottomImageUrl: result.data.smallBottomImage.imageUrl,
                    smallBottomImageAlt: result.data.smallBottomImage.altText,
                });
                setImageFiles({ mainImageFile: null, smallTopImageFile: null, smallBottomImageFile: null });
                setTimeout(() => setSaveStatus(null), 3000);

            } else {
                const error = await response.json();
                setSaveStatus('error');
                console.error("API Error:", error);
                setTimeout(() => setSaveStatus(null), 5000);
            }
        } catch (error) {
            setSaveStatus('error');
            console.error('Network or Server Error:', error);
            setTimeout(() => setSaveStatus(null), 5000);
        } finally {
            setIsSaving(false);
        }
    };

    // Helper component for consistent input styling
    const InputField = ({ label, name, value, icon: Icon, placeholder = '' }) => (
        <div className="mb-6">
            <label htmlFor={name} className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Icon className="w-4 h-4 mr-2 text-red-500 dark:text-teal-400" />
                {label}
            </label>
            <input
                type="text"
                id={name}
                name={name}
                value={value}
                onChange={handleTextChange}
                placeholder={placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-teal-400 dark:focus:border-teal-400 transition-colors duration-200"
                required
            />
        </div>
    );

    // Helper component for Image Upload and Alt Text
    const ImageUploadBlock = ({ label, urlKey, altKey, fileKey }) => (
        <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
            <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                {label}
            </h4>
            
            {(formData[urlKey] || imageFiles[fileKey]) ? (
                // Image is uploaded/selected
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white dark:bg-gray-700 p-3 rounded-lg border border-red-200 dark:border-teal-700">
                        <div className="flex flex-col flex-1 min-w-0">
                            {imageFiles[fileKey] ? (
                                <span className="text-sm font-semibold text-red-600 dark:text-teal-400 truncate">
                                    New File Selected: {imageFiles[fileKey].name}
                                </span>
                            ) : (
                                <>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 truncate">Current URL (Saved):</span>
                                    <span className="text-sm text-red-600 dark:text-teal-400 truncate font-mono">{formData[urlKey]}</span>
                                </>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemoveImage(urlKey, altKey, fileKey)}
                            className="ml-4 p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
                            title="Remove Image"
                            disabled={isSaving}
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Alt Text Input */}
                    <div className="mb-4">
                        <label htmlFor={altKey} className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Tag className="w-4 h-4 mr-2 text-red-500 dark:text-teal-400" />
                            Alt Text (for SEO)
                        </label>
                        <input
                            type="text"
                            id={altKey}
                            name={altKey}
                            value={formData[altKey]}
                            onChange={handleTextChange}
                            placeholder="e.g., A vibrant city skyline at sunset"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-teal-400 dark:focus:border-teal-400 transition-colors duration-200"
                            required
                            disabled={isSaving}
                        />
                    </div>
                </div>
            ) : (
                // No image uploaded, show upload field
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-inner">
                    <Upload className="w-8 h-8 text-red-400 dark:text-teal-300 mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Click to upload or drag & drop</p>
                    <label 
                        htmlFor={fileKey} 
                        className="cursor-pointer bg-red-500 dark:bg-teal-400 text-white dark:text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-red-600 dark:hover:bg-teal-500 transition duration-200 text-sm"
                    >
                        Select Image
                    </label>
                    <input
                        type="file"
                        id={fileKey}
                        name={fileKey} // সার্ভারে এই নামে যাবে
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, fileKey)}
                        className="hidden"
                        disabled={isSaving}
                    />
                </div>
            )}
        </div>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
                <div className="flex items-center text-xl font-medium text-gray-700 dark:text-gray-300">
                    <Loader2 className="w-6 h-6 mr-3 animate-spin text-red-500 dark:text-teal-400" />
                    Loading Hero Data...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-8 lg:p-12 bg-white dark:bg-gray-950 transition-colors duration-500">
            <header className="mb-8 border-b pb-4 border-gray-200 dark:border-gray-800">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                    <ImageIcon className="w-7 h-7 mr-3 text-red-500 dark:text-teal-400" />
                    Hero Section Management
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Update the primary content, three featured images, and SEO metadata for the homepage hero section.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Text Content Section */}
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 transition-colors duration-200">
                    <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200 border-b pb-3 border-gray-300 dark:border-gray-700">
                        <Heading className="w-5 h-5 inline-block mr-2" />
                        Text Content
                    </h3>
                    
                    <InputField 
                        label="Main Heading"
                        name="mainHeading"
                        value={formData.mainHeading}
                        icon={Heading}
                        placeholder="e.g., Discover the World's Wonders"
                    />

                    <InputField 
                        label="Highlight Word (Color Change)"
                        name="highlightWord"
                        value={formData.highlightWord}
                        icon={FileText}
                        placeholder="e.g., Hidden"
                    />

                    <div className="mb-6">
                        <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <FileText className="w-4 h-4 mr-2 text-red-500 dark:text-teal-400" />
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleTextChange}
                            rows="4"
                            placeholder="Enter the main description text..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-teal-400 dark:focus:border-teal-400 transition-colors duration-200"
                            required
                        ></textarea>
                    </div>
                </div>

                {/* Image Gallery Section */}
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 transition-colors duration-200">
                    <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200 border-b pb-3 border-gray-300 dark:border-gray-700">
                        <ImageIcon className="w-5 h-5 inline-block mr-2" />
                        Image Gallery & SEO Metadata
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Upload your three images and provide descriptive Alt Text for each one.
                    </p>

                    {/* Responsive Grid for Images */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ImageUploadBlock
                            label="1. Main Featured Image"
                            urlKey="mainImageUrl"
                            altKey="mainImageAlt"
                            fileKey="mainImageFile"
                        />
                        <ImageUploadBlock
                            label="2. Small Top Image"
                            urlKey="smallTopImageUrl"
                            altKey="smallTopImageAlt"
                            fileKey="smallTopImageFile"
                        />
                        <ImageUploadBlock
                            label="3. Small Bottom Image"
                            urlKey="smallBottomImageUrl"
                            altKey="smallBottomImageAlt"
                            fileKey="smallBottomImageFile"
                        />
                    </div>
                </div>

                {/* Submit Button and Status */}
                <div className="flex flex-col sm:flex-row justify-between items-center pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={`flex items-center justify-center w-full sm:w-auto font-semibold py-3 px-8 rounded-xl transition duration-300 shadow-md 
                            ${isSaving 
                                ? 'bg-gray-400 dark:bg-gray-600 text-gray-800 dark:text-gray-300 cursor-not-allowed'
                                : 'bg-red-500 dark:bg-teal-400 text-white dark:text-gray-900 hover:bg-red-600 dark:hover:bg-teal-500'
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin h-5 w-5 mr-3 text-white dark:text-gray-900" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>

                    {saveStatus === 'success' && (
                        <p className="mt-3 sm:mt-0 text-green-600 dark:text-green-400 font-medium">
                            ✅ Successfully updated Hero Section!
                        </p>
                    )}
                    {saveStatus === 'error' && (
                        <p className="mt-3 sm:mt-0 text-red-600 dark:text-red-400 font-medium">
                            ❌ Error saving data. Please try again.
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}