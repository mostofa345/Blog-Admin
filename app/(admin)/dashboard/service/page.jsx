"use client";
import React, { useState } from "react";

// File: app/admin/terms/page.jsx

import { 
    Save, 
    FileText, 
    Globe, 
    Shield, 
    Zap, 
    HelpCircle,
    Pencil,
    Clock, 
    CheckCircle
} from "lucide-react";

// ডেমো ডেটা: আপনার Terms of Service এর সেকশনগুলো
const initialTermsData = [
    {
        id: 'acceptance',
        title: "1. Acceptance of Terms",
        icon: Globe,
        content: "By accessing or using the Blog-App website (\"Service\"), you agree to be bound by these Terms of Service (\"Terms\"). If you disagree with any part of the terms, then you may not access the Service. Your continued use of the Service signifies your acceptance of these Terms."
    },
    {
        id: 'obligations',
        title: "2. User Obligations",
        icon: FileText,
        content: "You agree not to use the Service in any way that violates any applicable local, national, or international law. Users are solely responsible for all content they submit to the Service. We reserve the right to remove any content without prior notice."
    },
    {
        id: 'ip-rights',
        title: "3. Intellectual Property Rights",
        icon: Zap,
        content: "The Service and its original content, features, and functionality are and will remain the exclusive property of Blog-App and its licensors. User-generated content remains the property of the user."
    },
    {
        id: 'termination',
        title: "4. Termination",
        icon: Shield,
        content: "We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms."
    },
    {
        id: 'governing-law',
        title: "5. Governing Law",
        icon: HelpCircle,
        content: "These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions."
    },
];

// এই কম্পোনেন্টটি প্রতিটি এডিটরেবল সেকশন দেখাবে
const TermsSectionEditor = ({ section, handleContentChange }) => {
    const Icon = section.icon;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <Icon className="w-6 h-6 mr-3 text-indigo-600 dark:text-teal-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {section.title}
                </h3>
            </div>
            
            {/* Rich Text Editor Placeholder - এখানে আপনি আপনার আসল Rich Text Editor যোগ করবেন */}
            <div className="mt-4">
                <label 
                    htmlFor={`editor-${section.id}`} 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Section Content:
                </label>
                <textarea
                    id={`editor-${section.id}`}
                    rows="8"
                    value={section.content}
                    onChange={(e) => handleContentChange(section.id, e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200 resize-y transition-colors duration-300"
                    placeholder="Enter the detailed terms for this section..."
                />
                {/* *** পরামর্শ: এখানে আপনি আপনার Rich Text Editor (যেমন, React-Quill) বসাবেন।
                <RichTextEditor 
                    value={section.content} 
                    onChange={(content) => handleContentChange(section.id, content)} 
                /> 
                */}
            </div>

        </div>
    );
};


const AdminTermsOfServicePage = () => {
    // সেকশন ডেটা স্টেট ম্যানেজ করা
    const [termsData, setTermsData] = useState(initialTermsData);
    const [lastUpdated, setLastUpdated] = useState("October 4, 2025");
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // প্রতিটি সেকশনের কন্টেন্ট আপডেট করার ফাংশন
    const handleContentChange = (id, newContent) => {
        setTermsData(prevData =>
            prevData.map(section =>
                section.id === id ? { ...section, content: newContent } : section
            )
        );
        setSaveSuccess(false); // কনটেন্ট পরিবর্তন হলে সেভ সাকসেস স্টেট রিসেট
    };
    
    // সেভ করার লজিক (প্র্যাক্টিক্যাল ক্ষেত্রে এখানে API কল হবে)
    const handleSave = () => {
        setIsSaving(true);
        setSaveSuccess(false);
        
        // ডেমো সেভিং লজিক: ২ সেকেন্ড অপেক্ষা
        setTimeout(() => {
            console.log("Saving data:", termsData);
            // API কল সফল হলে:
            setLastUpdated(new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }));
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
                <header className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                            <Shield className="w-8 h-8 mr-3 text-red-600 dark:text-green-500" />
                            Terms of Service Management
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center">
                             <Clock className="w-4 h-4 mr-1"/> Last Updated on: {lastUpdated} 
                        </p>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        {/* Status Message */}
                        {saveSuccess && (
                            <div className="flex items-center text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 p-2 rounded-lg transition-opacity duration-300">
                                <CheckCircle className="w-4 h-4 mr-1" /> Changes Saved!
                            </div>
                        )}
                        
                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`flex items-center px-6 py-3 font-semibold rounded-lg shadow-md transition duration-300 
                                ${isSaving 
                                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-teal-500 dark:hover:bg-teal-600 dark:text-gray-900'
                                }`}
                        >
                            {isSaving ? (
                                <>
                                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </header>

                {/* Terms Sections Management */}
                <section className="space-y-6">
                    {termsData.map((section) => (
                        <TermsSectionEditor
                            key={section.id}
                            section={section}
                            handleContentChange={handleContentChange}
                        />
                    ))}
                </section>
                
                {/* Footer Note */}
                <div className="mt-10 p-4 text-center bg-gray-100 dark:bg-gray-800/50 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                    <Pencil className="w-4 h-4 inline mr-2"/>
                    Remember to review all changes before saving. Changes here directly affect the public-facing 'Terms of Service' page.
                </div>

            </div>
        </div>
    );
};

export default AdminTermsOfServicePage;