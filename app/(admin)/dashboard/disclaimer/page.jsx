"use client";
import React, { useCallback, useEffect, useState } from "react";

// File: app/admin/disclaimer/page.jsx

import { 
    Save, 
    Shield, 
    Pencil, 
    Clock, 
    CheckCircle,
    Lightbulb, // General Information (💡)
    Scale, // No Professional Advice (⚖️)
    Link, // External Links Disclaimer (🔗)
    DollarSign, // Affiliate Disclosure (💰)
    Loader2, // Loading icon
    AlertTriangle, // Error icon
} from "lucide-react";

// --- API Configuration ---
// .env ফাইল থেকে URL লোড করা
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
const DISCLAIMER_API_URL = `${API_BASE_URL}/disclaimer`; // ✅ ডিসক্লেমার API URL যুক্ত করা হলো
// -------------------------

// আইকন ম্যাপ: ইমোজি থেকে লুসিড আইকনে রূপান্তর
const iconMap = {
    "💡": Lightbulb,
    "⚖️": Scale,
    "🔗": Link,
    "💰": DollarSign,
};


// --- Disclaimer Section Editor Component ---
const DisclaimerSectionEditor = ({ section, updateSection }) => {
    // iconMap ব্যবহার করে Lucide Icon কম্পোনেন্ট নির্ধারণ করা হলো
    const IconComponent = iconMap[section.iconEmoji] || Pencil; 

    const handleTitleChange = (e) => {
        updateSection(section.key, 'title', e.target.value);
    };

    const handleContentChange = (e) => {
        updateSection(section.key, 'content', e.target.value);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-shadow duration-300 hover:shadow-xl">
            {/* Header and Icon */}
            <div className="flex items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <IconComponent className="w-6 h-6 mr-3 text-red-600 dark:text-yellow-400" />
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
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-200 transition-colors duration-300"
                    placeholder="Enter the section title"
                />
            </div>

            {/* Content Editor */}
            <div className="mt-4">
                <label 
                    htmlFor={`content-${section.key}`} 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Detailed Content:
                </label>
                <textarea
                    id={`content-${section.key}`}
                    rows="8"
                    value={section.content}
                    onChange={handleContentChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-200 resize-y transition-colors duration-300"
                    placeholder="Enter the detailed text for this section..."
                />
            </div>
        </div>
    );
};


// --- Main Admin Disclaimer Page Component ---
const AdminDisclaimerPage = () => {
    // API থেকে লোড করার জন্য ডেটা ইনিশিয়ালাইজেশন null/empty
    const [disclaimerData, setDisclaimerData] = useState(null); 

    // Loading & Error States
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);


    // ----------------------------------------------------
    // ১. ডাটা ফেচ করার ফাংশন (GET API কল)
    // ----------------------------------------------------
    const fetchDisclaimerData = useCallback(async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const response = await fetch(DISCLAIMER_API_URL);
            
            if (!response.ok) {
                // HTTP এরর পেলে সার্ভার থেকে মেসেজ পড়ার চেষ্টা
                let errorDetails = `HTTP error! Status: ${response.status}`;
                try {
                    const errorJson = await response.json();
                    errorDetails = errorJson.message || errorDetails;
                } catch (e) { /* silent fail if not JSON */ }
                throw new Error(errorDetails);
            }
            
            const data = await response.json();
            
            // API রেসপন্স থেকে ডেটা সেট করা
            setDisclaimerData(data.sections || []); 
            
        } catch (error) {
            console.error("Failed to fetch disclaimer data:", error);
            setFetchError(`Failed to load data: ${error.message}. Please check the server connection and API endpoint.`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // কম্পোনেন্ট মাউন্ট হওয়ার সময় ডাটা লোড করা
    useEffect(() => {
        fetchDisclaimerData();
    }, [fetchDisclaimerData]);


    // ----------------------------------------------------
    // ২. ডেটা আপডেট করার ফাংশন
    // ----------------------------------------------------
    const updateSection = (key, field, value) => {
        setDisclaimerData(prevData =>
            prevData.map(section =>
                section.key === key ? { ...section, [field]: value } : section
            )
        );
        setSaveSuccess(false); // ডেটা পরিবর্তন হলে সেভ সাকসেস স্টেট রিসেট
    };
    

    // ----------------------------------------------------
    // ৩. সেভ করার ফাংশন (PUT API কল)
    // ----------------------------------------------------
    const handleSave = async () => {
        if (!disclaimerData) {
            setFetchError("Error: Disclaimer data is missing.");
            return;
        }

        setIsSaving(true);
        setSaveSuccess(false);
        setFetchError(null);

        try {
            const response = await fetch(DISCLAIMER_API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                // সার্ভার শুধুমাত্র 'sections' ফিল্ড আশা করে
                body: JSON.stringify({ 
                    sections: disclaimerData, 
                }),
            });

            if (!response.ok) {
                let errorDetails = `HTTP error! Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorDetails = errorData.message || errorDetails;
                } catch (e) { /* silent fail if not JSON */ }
                throw new Error(errorDetails);
            }

            const data = await response.json();
            
            // সার্ভার থেকে আসা ডেটা দিয়ে ফ্রন্টএন্ড আপডেট করা
            setDisclaimerData(data.data.sections); 

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);

        } catch (error) {
            console.error("Failed to save disclaimer data:", error);
            setFetchError(`Save failed: ${error.message}. Please check your server console.`);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Loading State UI ---
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center text-red-600 dark:text-yellow-400">
                    <Loader2 className="w-8 h-8 mr-3 animate-spin" />
                    <span className="text-xl font-medium dark:text-gray-300">Loading Disclaimer Data...</span>
                </div>
            </div>
        );
    }

    // --- Error State UI ---
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
                        Check if the server is running and the API endpoint (`{DISCLAIMER_API_URL}`) is correct.
                    </p>
                    <button 
                        onClick={fetchDisclaimerData} 
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header and Control Panel */}
                <header className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-red-600 dark:border-yellow-500">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                            <Shield className="w-8 h-8 mr-3 text-red-600 dark:text-yellow-500" />
                            Website Disclaimer Management
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Edit the content for the public Disclaimer page. API URL: 
                            <span className="font-mono text-xs ml-1 bg-gray-200 dark:bg-gray-700 p-1 rounded">
                                {DISCLAIMER_API_URL}
                            </span>
                        </p>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        {/* Status Message */}
                        {saveSuccess && (
                            <div className="flex items-center text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 p-2 rounded-lg transition-opacity duration-300">
                                <CheckCircle className="w-4 h-4 mr-1" /> Disclaimer Saved!
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
                            disabled={isSaving || !disclaimerData}
                            className={`flex items-center px-6 py-3 font-semibold rounded-lg shadow-md transition duration-300 
                                ${isSaving || !disclaimerData
                                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                    : 'bg-red-600 text-white hover:bg-red-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-gray-900'
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
                                    Publish Disclaimer
                                </>
                            )}
                        </button>
                    </div>
                </header>

                {/* Disclaimer Sections Management */}
                <section className="space-y-6">
                    {/* ডাটা লোড না হলে এই সেকশনটি রেন্ডার হবে না */}
                    {disclaimerData && disclaimerData.map((section) => (
                        <DisclaimerSectionEditor
                            key={section.key}
                            section={section}
                            updateSection={updateSection}
                        />
                    ))}
                </section>
                
                {/* Footer Note */}
                <div className="mt-10 p-4 text-center bg-red-100 dark:bg-gray-800/50 rounded-lg text-sm text-gray-700 dark:text-gray-400 border border-red-300 dark:border-gray-700">
                    <Pencil className="w-4 h-4 inline mr-2"/>
                    Review all sections carefully. The affiliate disclosure specifically refers to U.S. FTC regulations (16 CFR § 255.5).
                </div>

            </div>
        </div>
    );
};

export default AdminDisclaimerPage;