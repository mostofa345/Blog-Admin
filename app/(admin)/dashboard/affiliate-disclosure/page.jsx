"use client";
import React, { useCallback, useEffect, useState } from "react";

// File: app/admin/affiliate-disclosure/page.jsx

import { 
    Save, 
    Link, 
    Pencil, 
    Clock, 
    CheckCircle,
    Handshake, 
    DollarSign, 
    Target, 
    Heart,
    Loader2, // Loading আইকনের জন্য
    AlertTriangle, // Error আইকনের জন্য
} from "lucide-react";

// --- API Configuration ---
// .env ফাইল থেকে URL লোড করা
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
const AFFILIATE_DISCLOSURE_URL = `${API_BASE_URL}/affiliate-disclosure`;
// -------------------------

// Lucide-react এ 'Amazon' আইকন না থাকলে 'ShoppingBag' বা 'Package' ব্যবহার করতে পারেন।
const iconMap = {
    'Amazon': DollarSign, // ডেমোর জন্য DollarSign ব্যবহার করা হলো
    'Core': Handshake,
    'Link': DollarSign,
    'Integrity': Target,
    'Support': Heart,
};


// --- Disclosure Section Editor Component (No change needed) ---
const DisclosureSectionEditor = ({ section, updateSection }) => {
    const IconComponent = iconMap[section.iconKey] || Pencil;

    const handleTitleChange = (e) => {
        updateSection(section.key, 'title', e.target.value);
    };

    const handleContentChange = (e) => {
        updateSection(section.key, 'content', e.target.value);
    };

    const handleSubtitleChange = (e) => {
        updateSection(section.key, 'subtitle', e.target.value);
    };

    const isCoreSection = section.key === 'core';

    return (
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-shadow duration-300 hover:shadow-xl">
            {/* Header and Icon */}
            <div className="flex items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <IconComponent className="w-6 h-6 mr-3 text-indigo-600 dark:text-pink-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {section.title} Section
                </h3>
            </div>
            
            {/* Title Editor */}
            <div className="mb-4">
                <label 
                    htmlFor={`title-${section.key}`} 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Section Title:
                </label>
                <input
                    id={`title-${section.key}`}
                    type="text"
                    value={section.title}
                    onChange={handleTitleChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200 transition-colors duration-300"
                    placeholder="Enter the section title"
                />
            </div>
            
            {/* Subtitle/Core Text Editor (for the main introductory box) */}
            {isCoreSection && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700">
                    <label 
                        htmlFor={`subtitle-${section.key}`} 
                        className="block text-sm font-bold text-red-700 dark:text-red-400 mb-2"
                    >
                        Core Disclosure Summary:
                    </label>
                    <textarea
                        id={`subtitle-${section.key}`}
                        rows="3"
                        value={section.subtitle || ''} // Ensure it's not null for textarea
                        onChange={handleSubtitleChange}
                        className="w-full p-3 border border-red-300 dark:border-red-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-200 resize-y"
                        placeholder="Enter the introductory disclaimer text..."
                    />
                </div>
            )}

            {/* Content Editor (for detailed sections) */}
            {section.content !== null && (
                <div className="mt-4">
                    <label 
                        htmlFor={`content-${section.key}`} 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Detailed Content:
                    </label>
                    <textarea
                        id={`content-${section.key}`}
                        rows="6"
                        value={section.content}
                        onChange={handleContentChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200 resize-y transition-colors duration-300"
                        placeholder="Enter the detailed text for this section..."
                    />
                </div>
            )}

        </div>
    );
};


// --- Main Admin Affiliate Disclosure Page Component ---
const AdminAffiliateDisclosurePage = () => {
    // API থেকে লোড করার জন্য ডেটা ইনিশিয়ালাইজেশন null/empty
    const [disclosureData, setDisclosureData] = useState(null); 
    const [lastUpdated, setLastUpdated] = useState("");
    
    // নতুন স্টেট
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);


    // ----------------------------------------------------
    // ১. ডাটা ফেচ করার ফাংশন (GET API কল)
    // ----------------------------------------------------
    const fetchDisclosureData = useCallback(async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const response = await fetch(AFFILIATE_DISCLOSURE_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // API রেসপন্স থেকে ডেটা সেট করা
            setDisclosureData(data.sections || []);
            setLastUpdated(data.lastUpdated || "");
            
        } catch (error) {
            console.error("Failed to fetch disclosure data:", error);
            setFetchError("Failed to load data. Please check the server connection and API endpoint.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // কম্পোনেন্ট মাউন্ট হওয়ার সময় ডাটা লোড করা
    useEffect(() => {
        fetchDisclosureData();
    }, [fetchDisclosureData]);


    // ----------------------------------------------------
    // ২. ডেটা আপডেট করার ফাংশন
    // ----------------------------------------------------
    const updateSection = (key, field, value) => {
        setDisclosureData(prevData =>
            prevData.map(section =>
                section.key === key ? { ...section, [field]: value } : section
            )
        );
        setSaveSuccess(false); // ডেটা পরিবর্তন হলে সেভ সাকসেস স্টেট রিসেট
    };

    const handleDateChange = (e) => {
        setLastUpdated(e.target.value);
        setSaveSuccess(false);
    };
    

    // ----------------------------------------------------
    // ৩. সেভ করার ফাংশন (PUT API কল)
    // ----------------------------------------------------
    const handleSave = async () => {
        if (!disclosureData || !lastUpdated) {
            setFetchError("Error: Disclosure data or last updated date is missing.");
            return;
        }

        setIsSaving(true);
        setSaveSuccess(false);
        setFetchError(null);

        try {
            const response = await fetch(AFFILIATE_DISCLOSURE_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    sections: disclosureData, 
                    lastUpdated // সার্ভারে এই ডেটটি আপডেট হবে
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            // সার্ভার থেকে আসা ডেট দিয়ে ফ্রন্টএন্ড আপডেট করা (যদি সার্ভারে কোনো অটো-আপডেট লজিক থাকে)
            setLastUpdated(data.data.lastUpdated); 

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);

        } catch (error) {
            console.error("Failed to save disclosure data:", error);
            setFetchError(`Save failed: ${error.message}. Please check your server console.`);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Loading/Error State UI ---
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center text-indigo-600 dark:text-pink-500">
                    <Loader2 className="w-8 h-8 mr-3 animate-spin" />
                    <span className="text-xl font-medium dark:text-gray-300">Loading Disclosure Data...</span>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
                <div className="bg-red-100 dark:bg-red-900/40 p-6 rounded-xl shadow-lg border-l-4 border-red-500 text-red-800 dark:text-red-400">
                    <h2 className="text-xl font-bold flex items-center mb-2">
                        <AlertTriangle className="w-6 h-6 mr-2" />
                        Error Loading Content
                    </h2>
                    <p>{fetchError}</p>
                    <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                        Check if the server is running and the API endpoint (`{AFFILIATE_DISCLOSURE_URL}`) is correct.
                    </p>
                </div>
            </div>
        );
    }
    // ----------------------------
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header and Control Panel */}
                <header className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-indigo-600 dark:border-pink-500">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                            <Link className="w-8 h-8 mr-3 text-indigo-600 dark:text-pink-500" />
                            Affiliate Disclosure Management
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Edit the content and sections for the public Affiliate Disclosure page. API URL: 
                            <span className="font-mono text-xs ml-1 bg-gray-200 dark:bg-gray-700 p-1 rounded">
                                {AFFILIATE_DISCLOSURE_URL}
                            </span>
                        </p>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        {/* Status Message */}
                        {saveSuccess && (
                            <div className="flex items-center text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 p-2 rounded-lg transition-opacity duration-300">
                                <CheckCircle className="w-4 h-4 mr-1" /> Disclosure Saved!
                            </div>
                        )}
                        {fetchError && (
                             <div className="flex items-center text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 p-2 rounded-lg transition-opacity duration-300">
                                <AlertTriangle className="w-4 h-4 mr-1" /> Save Error!
                            </div>
                        )}
                        
                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !disclosureData}
                            className={`flex items-center px-6 py-3 font-semibold rounded-lg shadow-md transition duration-300 
                                ${isSaving || !disclosureData
                                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-pink-500 dark:hover:bg-pink-600 dark:text-gray-900'
                                }`}
                        >
                            {isSaving ? (
                                <>
                                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-2" />
                                    Publish Disclosure
                                </>
                            )}
                        </button>
                    </div>
                </header>

                {/* Last Updated Date Control */}
                <div className="mb-8 p-5 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-inner flex items-center justify-between">
                    <label 
                        htmlFor="lastUpdatedDate" 
                        className="flex items-center text-lg font-medium text-gray-700 dark:text-gray-300"
                    >
                        <Clock className="w-5 h-5 mr-2 text-red-500 dark:text-yellow-400"/>
                        Last Updated Date (Client-side display):
                    </label>
                    <input
                        id="lastUpdatedDate"
                        type="text"
                        value={lastUpdated}
                        onChange={handleDateChange}
                        className="w-auto min-w-[200px] p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white text-center"
                        placeholder="e.g., January 1, 2026"
                    />
                </div>

                {/* Disclosure Sections Management */}
                <section className="space-y-6">
                    {/* ডাটা লোড না হলে এই সেকশনটি রেন্ডার হবে না */}
                    {disclosureData && disclosureData.map((section) => (
                        <DisclosureSectionEditor
                            key={section.key}
                            section={section}
                            updateSection={updateSection}
                        />
                    ))}
                </section>
                
                {/* Footer Note */}
                <div className="mt-10 p-4 text-center bg-red-100 dark:bg-gray-800/50 rounded-lg text-sm text-gray-700 dark:text-gray-400 border border-red-300 dark:border-gray-700">
                    <Pencil className="w-4 h-4 inline mr-2"/>
                    Ensure that the 'Amazon Associates Program' section accurately reflects the blog's participation status.
                </div>

            </div>
        </div>
    );
};

export default AdminAffiliateDisclosurePage;