"use client";
import React, { useState } from "react";
import { Globe, Loader2, PlusCircle, Trash2 } from "lucide-react";

export default function LanguageManagementPage() {
    // 💡 মনে রাখবেন: মাল্টি-ল্যাঙ্গুয়েজ কার্যকারিতা একটি বিশাল কাজ। 
    // এই পেজটি শুধুমাত্র UI এবং State ম্যানেজমেন্টের একটি ভিত্তি তৈরি করছে।
    
    // ডেমো ভাষা তালিকা
    const initialLanguages = [
        { id: 1, name: 'English (US)', code: 'en', status: 'Active', isDefault: true },
        { id: 2, name: 'বাংলা (Bengali)', code: 'bn', status: 'Active', isDefault: false },
        { id: 3, name: 'Español (Spanish)', code: 'es', status: 'Inactive', isDefault: false },
    ];

    const [languages, setLanguages] = useState(initialLanguages);
    const [newLangName, setNewLangName] = useState('');
    const [newLangCode, setNewLangCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // নতুন ভাষা যুক্ত করার লজিক (API কল এখানে হবে)
    const handleAddLanguage = async (e) => {
        e.preventDefault();
        if (!newLangName || !newLangCode) return;

        setLoading(true);
        setMessage('');

        // API কল ডেমো
        try {
            const newId = Date.now();
            const newLang = {
                id: newId,
                name: newLangName,
                code: newLangCode.toLowerCase(),
                status: 'Active',
                isDefault: false,
            };

            // 💡 বাস্তবে এখানে API কল করে নতুন ভাষাটি ডেটাবেসে সেভ করতে হবে।
            // const response = await fetch('/api/settings/languages', { method: 'POST', body: JSON.stringify(newLang) });
            await new Promise(resolve => setTimeout(resolve, 1000)); // ডেমো লোডিং

            setLanguages(prev => [...prev, newLang]);
            setNewLangName('');
            setNewLangCode('');
            setMessage({ type: 'success', text: `Language "${newLang.name}" added successfully.` });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to add language.' });
        } finally {
            setLoading(false);
        }
    };

    // ডিফল্ট ভাষা সেট করার লজিক
    const handleSetDefault = (id) => {
        const updatedLangs = languages.map(lang => ({
            ...lang,
            isDefault: lang.id === id,
        }));
        setLanguages(updatedLangs);
        setMessage({ type: 'success', text: 'Default language updated (Demo). Remember to update your backend settings!' });
        
        // 💡 বাস্তবে, এই পরিবর্তনটি API এর মাধ্যমে সেভ করতে হবে।
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto">
                {/* Page Header */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <Globe className="w-7 h-7 text-indigo-500" />
                    Language Management
                </h1>

                {/* Status Message */}
                {message && (
                    <div className={`p-3 rounded-lg mb-6 shadow-md ${
                        message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* 1. Add New Language Form */}
                <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 mb-10">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Add New Language</h2>
                    <form onSubmit={handleAddLanguage} className="sm:flex sm:space-x-4 space-y-4 sm:space-y-0">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Language Name (e.g., Bengali)"
                                value={newLangName}
                                onChange={(e) => setNewLangName(e.target.value)}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                                required
                            />
                        </div>
                        <div className="w-full sm:w-32">
                            <input
                                type="text"
                                placeholder="Code (e.g., bn)"
                                value={newLangCode}
                                onChange={(e) => setNewLangCode(e.target.value.slice(0, 2))} // শুধু ২ অক্ষরের কোড
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                                maxLength={2}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                            Add Language
                        </button>
                    </form>
                </div>

                {/* 2. Language List Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Language Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Default</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {languages.map((lang) => (
                                <tr key={lang.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {lang.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {lang.code.toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            lang.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                        }`}>
                                            {lang.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {lang.isDefault ? (
                                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">YES</span>
                                        ) : (
                                            <button 
                                                onClick={() => handleSetDefault(lang.id)}
                                                className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition"
                                            >
                                                Set Default
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {/* <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 transition">
                                            <Trash2 className="w-4 h-4" />
                                        </button> */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
