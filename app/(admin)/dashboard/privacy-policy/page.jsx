"use client";
import React, { useState } from "react";

// File: app/admin/privacy/page.jsx

import { 
    Save, 
    Shield, 
    Pencil, 
    Clock, 
    CheckCircle,
    Info, // Information We Collect
    Zap, // How We Use Your Information
    Share2, // Sharing of Information
    Lock, // Data Security
    Repeat, // Changes to the Policy
} from "lucide-react";

// ক্লায়েন্ট পেজ থেকে নেওয়া ডেমো পলিসি সেকশন
const initialPolicySections = [
    {
        key: 'information',
        title: '1. Information We Collect',
        icon: Info,
        content: "We collect information you provide directly to us, such as your name, email address, and any messages or comments when you subscribe, contact us, or participate in discussions. We also automatically collect information about your usage of our blog, including IP address, browser type, operating system, and pages viewed, using cookies and similar tracking technologies."
    },
    {
        key: 'use',
        title: '2. How We Use Your Information',
        icon: Zap,
        content: "The information we collect is used to: provide, maintain, and improve our services; personalize and enhance your experience; send you technical notices, updates, security alerts, and support messages; communicate with you about products, services, offers, and promotions; and monitor and analyze trends, usage, and activities in connection with our blog."
    },
    {
        key: 'sharing',
        title: '3. Sharing of Information',
        icon: Share2,
        content: "We do not sell, rent, or trade your Personal Information to third parties. We may share information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf (e.g., analytics services, hosting providers). We may also disclose information if required by law or in the good faith belief that such action is necessary to comply with legal obligations."
    },
    {
        key: 'security',
        title: '4. Data Security',
        icon: Lock,
        content: "We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. However, please be aware that no security measures are perfect or impenetrable, and we cannot guarantee the absolute security of your information."
    },
    {
        key: 'changes',
        title: '5. Changes to the Policy',
        icon: Repeat,
        content: "We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice (such as adding a statement to our homepage or sending you an email notification). We encourage you to review the Privacy Policy whenever you access the Services or otherwise interact with us to stay informed about our information practices."
    },
];

// --- Policy Section Editor Component ---
const PolicySectionEditor = ({ section, updateSection }) => {
    const IconComponent = section.icon;

    const handleTitleChange = (e) => {
        updateSection(section.key, 'title', e.target.value);
    };

    const handleContentChange = (e) => {
        updateSection(section.key, 'content', e.target.value);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            {/* Header and Icon */}
            <div className="flex items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <IconComponent className="w-6 h-6 mr-3 text-red-600 dark:text-pink-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {section.key.toUpperCase().replace('-', ' ')} Section
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
                    placeholder="Enter the section title (e.g., 1. Information We Collect)"
                />
            </div>
            
            {/* Content Editor */}
            <div className="mt-4">
                <label 
                    htmlFor={`content-${section.key}`} 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Section Content:
                </label>
                <textarea
                    id={`content-${section.key}`}
                    rows="8"
                    value={section.content}
                    onChange={handleContentChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200 resize-y transition-colors duration-300"
                    placeholder="Enter the detailed privacy policy text for this section..."
                />
                {/* *** পরামর্শ: এখানে আপনি আপনার Rich Text Editor (যেমন, React-Quill) বসাবেন। */}
            </div>

        </div>
    );
};


// --- Main Admin Privacy Policy Page Component ---
const AdminPrivacyPolicyPage = () => {
    const [policyData, setPolicyData] = useState(initialPolicySections);
    // ক্লায়েন্ট পেজের সর্বশেষ আপডেটের তারিখ
    const [lastUpdated, setLastUpdated] = useState("October 4, 2025"); 
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // সেকশনের কন্টেন্ট বা টাইটেল আপডেট করার ফাংশন
    const updateSection = (key, field, value) => {
        setPolicyData(prevData =>
            prevData.map(section =>
                section.key === key ? { ...section, [field]: value } : section
            )
        );
        setSaveSuccess(false);
    };

    // "Last Updated" ডেট ম্যানুয়ালি এডিট করার জন্য
    const handleDateChange = (e) => {
        setLastUpdated(e.target.value);
        setSaveSuccess(false);
    };
    
    // সেভ করার লজিক (প্র্যাক্টিক্যাল ক্ষেত্রে এখানে API কল হবে)
    const handleSave = () => {
        setIsSaving(true);
        setSaveSuccess(false);
        
        // ডেমো সেভিং লজিক: ২ সেকেন্ড অপেক্ষা
        setTimeout(() => {
            console.log("Saving policy data and date:", policyData, lastUpdated);
            // API কল সফল হলে:
            setIsSaving(false);
            setSaveSuccess(true);
            
            // সাকসেস মেসেজ কিছুক্ষণ দেখানোর পর হাইড করা
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header and Control Panel */}
                <header className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-red-600 dark:border-pink-500">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                            <Shield className="w-8 h-8 mr-3 text-red-600 dark:text-pink-500" />
                            Privacy Policy Management
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Edit and publish the public-facing Privacy Policy content.
                        </p>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        {/* Status Message */}
                        {saveSuccess && (
                            <div className="flex items-center text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 p-2 rounded-lg transition-opacity duration-300">
                                <CheckCircle className="w-4 h-4 mr-1" /> Policy Saved!
                            </div>
                        )}
                        
                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`flex items-center px-6 py-3 font-semibold rounded-lg shadow-md transition duration-300 
                                ${isSaving 
                                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                    : 'bg-red-600 text-white hover:bg-red-700 dark:bg-pink-500 dark:hover:bg-pink-600'
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
                                    Publish Policy
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
                        <Clock className="w-5 h-5 mr-2 text-indigo-500 dark:text-teal-400"/>
                        Last Updated Date (Client-side display):
                    </label>
                    <input
                        id="lastUpdatedDate"
                        type="text"
                        value={lastUpdated}
                        onChange={handleDateChange}
                        className="w-auto min-w-[200px] p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-center"
                        placeholder="e.g., January 1, 2026"
                    />
                </div>

                {/* Policy Sections Management */}
                <section className="space-y-6">
                    {policyData.map((section) => (
                        <PolicySectionEditor
                            key={section.key}
                            section={section}
                            updateSection={updateSection}
                        />
                    ))}
                </section>
                
                {/* Footer Note */}
                <div className="mt-10 p-4 text-center bg-red-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-600 dark:text-gray-400 border border-red-200 dark:border-gray-700">
                    <Pencil className="w-4 h-4 inline mr-2"/>
                    Note: Be extremely careful when editing policy sections. Ensure legal compliance before publishing changes.
                </div>

            </div>
        </div>
    );
};

export default AdminPrivacyPolicyPage;