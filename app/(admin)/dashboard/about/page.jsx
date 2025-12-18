"use client";
import React, { useEffect, useState } from "react";
import { Loader, Moon, Plus, Save, Sun, X } from "lucide-react";

// File: app/admin/about/page.jsx

// --- Fallback/Empty Data Structure ---
// API থেকে ডেটা না পাওয়া গেলে এই খালি কাঠামোটি ব্যবহার করা হবে
const emptyData = {
    headerTitle: "",
    headerSubtitle: "",
    mission: "",
    vision: "",
    coreValues: [],
    teamMembers: []
};


// --- CORE ADMIN COMPONENT ---

const AboutUsAdminPage = () => {
    // API URL তৈরি: .env ফাইল থেকে NEXT_PUBLIC_API_BASE_URL ব্যবহার করা হয়েছে।
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
    
    const ABOUT_API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/about`;
    
    // State to hold data - emptyData দিয়ে ইনিশিয়ালাইজ করা হলো
    const [data, setData] = useState(emptyData); 
    // ^^^^ এইখানে  এর বদলে শুধু জাভাস্ক্রিপ্ট কমেন্ট রাখা হয়েছে।
    
    const [isLoading, setIsLoading] = useState(true); // Default to true for API fetch
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false); 

    // --- Data Fetcher (GET) ---
    const fetchAboutData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(ABOUT_API_URL);
            const result = await response.json();

            if (response.ok && result.success && result.data) {
                
                // MongoDB থেকে পাওয়া _id কে ক্লায়েন্ট-সাইড keying-এর জন্য 'id'-তে ম্যাপ করা হচ্ছে।
                const fetchedData = {
                    ...result.data,
                    // MongoDB-এর _id কে teamMembers-এর 'id' হিসেবে ব্যবহার করা হচ্ছে
                    teamMembers: (result.data.teamMembers || []).map((member, index) => ({
                        // _id ব্যবহার করা হলো, যদি না থাকে তবে Date.now()
                        id: member._id || Date.now() + index, 
                        name: member.name,
                        title: member.title,
                        bio: member.bio
                    }))
                };
                setData(fetchedData);
                console.log("Successfully fetched data from server:", fetchedData);

            } else if (response.status === 404 || !result.data) {
                // যদি সার্ভারে কোনো ডেটা না থাকে (404), তবে emptyData ব্যবহার করা হবে। 
                setData(emptyData);
                console.log("No existing About Us data found on server, using empty data structure.");
            } else {
                 // অন্য কোনো API এরর হলে
                throw new Error(result.message || 'Unknown error during fetch.');
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setStatusMessage('❌ ডেটা ফেচ করতে এরর হয়েছে! সার্ভার কানেকশন চেক করুন।');
            setData(emptyData); // এরর হলে ফলব্যাক হিসেবে খালি ডেটা ব্যবহার
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchAboutData(); // API থেকে ডেটা ফেচ করার জন্য কল করা হলো
        
        // Dark mode initialization logic
        setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);

    }, []);

    // Toggle Dark/Light Mode
    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };
    
    // Apply dark mode class to body/html
    useEffect(() => {
        if (typeof document !== 'undefined') {
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [isDarkMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prevData => ({ ...prevData, [name]: value }));
    };

    // --- Team Member Handlers ---
    const handleTeamChange = (id, field, value) => {
        setData(prevData => ({
            ...prevData,
            teamMembers: prevData.teamMembers.map(member =>
                // MongoDB _id অথবা ক্লায়েন্ট-জেনারেটেড id ধরে আপডেট
                member.id === id ? { ...member, [field]: value } : member
            )
        }));
    };

    const handleAddTeamMember = () => {
        // ক্লায়েন্ট-সাইড ইউনিক ID হিসেবে Date.now() ব্যবহার করা হলো।
        const newId = Date.now(); 
        setData(prevData => ({
            ...prevData,
            teamMembers: [
                ...prevData.teamMembers,
                { id: newId, name: "", title: "", bio: "" }
            ]
        }));
    };

    const handleRemoveTeamMember = (id) => {
        setData(prevData => ({
            ...prevData,
            teamMembers: prevData.teamMembers.filter(member => member.id !== id)
        }));
    };

    // --- Core Value Handlers ---
    const handleCoreValueChange = (index, value) => {
        const newValues = [...data.coreValues];
        newValues[index] = value;
        setData(prevData => ({ ...prevData, coreValues: newValues }));
    };

    const handleAddCoreValue = () => {
        setData(prevData => ({
            ...prevData,
            coreValues: [...prevData.coreValues, 'New Value']
        }));
    };

    const handleRemoveCoreValue = (index) => {
        setData(prevData => ({
            ...prevData,
            coreValues: prevData.coreValues.filter((_, i) => i !== index)
        }));
    };

    // --- Save Handler (Calling the actual POST API) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setStatusMessage('');

        // ডেটা সেভ করার আগে ক্লায়েন্ট-সাইড 'id' ফিল্ডগুলি বাদ দেওয়া হচ্ছে।
        const dataToSend = {
            ...data,
            // Team member array-এর প্রতিটি অবজেক্ট থেকে 'id' ফিল্ডটি বাদ দেওয়া হলো।
            // কারণ MongoDB _id অটো জেনারেট করে।
            teamMembers: data.teamMembers.map(({ id, ...rest }) => rest), 
            // MongoDB-এর internal field (যদি থাকে) সেগুলিও বাদ দেওয়া হলো।
            _id: undefined, 
            __v: undefined 
        };

        try {
            const response = await fetch(ABOUT_API_URL, {
                method: 'POST', // POST request to create or update
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });

            const result = await response.json();
            
            if (!response.ok || !result.success) {
                // API যদি এরর রিটার্ন করে
                throw new Error(result.message || 'Failed to save data on server.');
            }

            // সফলভাবে সেভ হলে, সার্ভার থেকে পাওয়া আপডেটেড ডেটা দিয়ে state আপডেট করা হলো
            // এবং teamMembers array-তে আবার ক্লায়েন্ট-সাইড 'id' যোগ করা হলো।
            const updatedData = {
                ...result.data,
                teamMembers: (result.data.teamMembers || []).map((member, index) => ({
                    // MongoDB _id কে ক্লায়েন্ট id হিসেবে সেট করা হলো
                    id: member._id || Date.now() + index, 
                    name: member.name,
                    title: member.title,
                    bio: member.bio
                }))
            };
            setData(updatedData);

            setStatusMessage('✅ Content saved successfully!');
            console.log("Data Sent and Updated from API:", updatedData);

        } catch (error) {
            console.error("Error saving data:", error);
            setStatusMessage(`❌ Error saving content: ${error.message}`);
        } finally {
            setIsSaving(false);
            setTimeout(() => setStatusMessage(''), 5000);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-700">
                <Loader className="animate-spin text-red-500 dark:text-green-400 w-8 h-8" />
                <p className="ml-3 text-red-500 dark:text-green-400">Loading Admin Data...</p>
            </div>
        );
    }

    // --- RENDER ADMIN UI ---
    return (
        <div className={`min-h-screen py-16 transition-colors duration-700 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header & Dark Mode Toggle */}
                <div className="flex justify-between items-center mb-12 border-b pb-4 border-gray-200 dark:border-gray-700">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                        About Us Content Management
                    </h1>
                    <button 
                        onClick={toggleDarkMode}
                        className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:ring-2 ring-red-500 dark:ring-green-400 transition"
                        aria-label="Toggle Dark Mode"
                    >
                        {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </button>
                </div>

                {/* Status Message */}
                {statusMessage && (
                    <div className={`p-4 mb-8 rounded-lg font-semibold text-white transition-opacity duration-500 ${statusMessage.startsWith('✅') ? 'bg-green-500' : 'bg-red-500'}`}>
                        {statusMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-12">
                    
                    {/* 1. Header Section */}
                    <SectionContainer title="Header Content (Our Story)">
                        <InputField label="Header Title (H1)" name="headerTitle" value={data.headerTitle} onChange={handleChange} />
                        <InputField label="Header Subtitle" name="headerSubtitle" value={data.headerSubtitle} onChange={handleChange} />
                    </SectionContainer>

                    {/* 2. Mission & Vision Section */}
                    <SectionContainer title="Mission & Vision">
                        <TextAreaField label="Mission" name="mission" value={data.mission} onChange={handleChange} rows={4} />
                        <TextAreaField label="Vision" name="vision" value={data.vision} onChange={handleChange} rows={4} />
                    </SectionContainer>

                    {/* 3. Core Values Section */}
                    <SectionContainer title="Core Values">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Manage the values that appear in the middle of the page (e.g., Quality Content).</p>
                        <div className="space-y-3">
                            {data.coreValues.map((value, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleCoreValueChange(index, e.target.value)}
                                        className="w-full input-field shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-opacity-50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCoreValue(index)}
                                        className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleAddCoreValue}
                            className="mt-4 flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                        >
                            <Plus className="w-5 h-5 mr-2" /> Add New Value
                        </button>
                    </SectionContainer>

                    {/* 4. Team Members Section */}
                    <SectionContainer title="Team Members">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Manage the individual team members shown at the bottom.</p>
                        <div className="space-y-6">
                            {data.teamMembers.map((member) => (
                                <div key={member.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 bg-gray-50 dark:bg-gray-800 shadow-inner">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="font-semibold text-lg text-red-500 dark:text-green-400">Member: {member.name || 'New Member'}</h3>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTeamMember(member.id)}
                                            className="text-red-500 hover:text-red-700 transition p-1"
                                        >
                                            <X className="w-5 h-5" /> Delete
                                        </button>
                                    </div>
                                    <InputField 
                                        label="Name" 
                                        value={member.name} 
                                        onChange={(e) => handleTeamChange(member.id, 'name', e.target.value)}
                                    />
                                    <InputField 
                                        label="Title" 
                                        value={member.title} 
                                        onChange={(e) => handleTeamChange(member.id, 'title', e.target.value)}
                                    />
                                    <TextAreaField 
                                        label="Bio" 
                                        value={member.bio} 
                                        onChange={(e) => handleTeamChange(member.id, 'bio', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddTeamMember}
                                className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                            >
                                <Plus className="w-5 h-5 mr-2" /> Add Team Member
                            </button>
                        </div>
                    </SectionContainer>

                    {/* 5. Save Button */}
                    <div className="text-center pt-8">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`flex items-center justify-center mx-auto px-12 py-4 text-xl font-bold rounded-full shadow-xl transition duration-300 ${isSaving ? 'bg-gray-400 cursor-not-allowed text-gray-700' : 'bg-red-500 dark:bg-green-500 text-white hover:bg-red-600 dark:hover:bg-green-600'}`}
                        >
                            {isSaving ? (
                                <>
                                    <Loader className="animate-spin w-6 h-6 mr-3" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-6 h-6 mr-3" /> Save All Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            {/* Global Styles must be included in the component or layout */}
            <GlobalStyles />
        </div>
    );
};

export default AboutUsAdminPage;


// --- Helper Components for Cleanliness and Reusability ---

const SectionContainer = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border-l-4 border-red-500 dark:border-green-400 transition-colors duration-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
            {title}
        </h2>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

// --- MODIFIED INPUT FIELD (Polished) ---
const InputField = ({ label, name, value, onChange }) => (
    <label className="block">
        <span className="text-gray-800 dark:text-gray-200 font-semibold mb-1 block">{label}:</span>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            // Polished classes applied here
            className="input-field shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-opacity-50" 
        />
    </label>
);

// --- MODIFIED TEXTAREA FIELD (Polished) ---
const TextAreaField = ({ label, name, value, onChange, rows }) => (
    <label className="block">
        <span className="text-gray-800 dark:text-gray-200 font-semibold mb-1 block">{label}:</span>
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            // Polished classes applied here
            className="input-field shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-opacity-50"
        />
    </label>
);


// --- MODIFIED GLOBAL CSS FOR POLISHED LOOK ---
// Note: This must be included in your component/layout for the 'input-field' class to work globally.
const GlobalStyles = () => (
    <style jsx global>{`
        .input-field {
            margin-top: 0.25rem;
            display: block;
            width: 100%;
            border-radius: 0.5rem;
            border: 1px solid #e5e7eb; /* Light Gray Border */
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.07); /* Subtle Shadow */
            padding: 0.75rem;
            transition: all 0.3s ease-in-out;
            background-color: white;
            color: #1f2937; /* Dark text */
        }

        .dark .input-field {
            background-color: #1f2937; /* Very Dark Gray */
            border-color: #374151; /* Slightly Darker Border */
            color: #e5e7eb; /* Light text */
        }
        
        /* Focus Effect (Polished) */
        .input-field:focus {
            border-color: #ef4444; /* Red-500 */
            outline: none;
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2); /* Red Glow */
        }

        .dark .input-field:focus {
            border-color: #4ade80; /* Green-400 (Accent color for dark mode) */
            box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.2); /* Green Glow */
        }
        
        /* Team Member Section Background Improvement (for inner background shading) */
        .dark .shadow-inner {
            box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.4);
        }
    `}</style>
);