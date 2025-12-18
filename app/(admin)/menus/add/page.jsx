"use client";
import Link from "next/link";
import React, { useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

// File: /app/admin/menus/add/page.jsx

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/menus`;

const AdminMenuAddPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', link: '/', order: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'order' ? parseInt(value) || 0 : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlertMessage({ type: '', text: '' });
        setIsLoading(true);

        try {
            const res = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                // ⚠️ ডুপ্লিকেট কী এররসহ অন্যান্য এরর হ্যান্ডলিং
                throw new Error(errorData.message || 'Failed to create menu.');
            }

            setAlertMessage({ type: 'success', text: `Menu "${formData.name}" added successfully!` });
            setFormData({ name: '', link: '/', order: 0 }); // Reset form
            
            // সফলভাবে যোগ হলে কিছু সময় পর মেনু লিস্ট পেজে ফিরে যাবে
            setTimeout(() => {
                router.push('/admin/menus');
            }, 1500);

        } catch (err) {
            console.error('Creation Error:', err);
            setAlertMessage({ type: 'error', text: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    const Alert = ({ type, text }) => (
        <div className={`p-4 mb-4 rounded-md flex items-center ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border-l-4 ${type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            {type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
            {text}
        </div>
    );

    return (
        <div className="p-6">
            <div className="max-w-xl mx-auto bg-white shadow-xl rounded-lg p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Plus className="w-5 h-5 mr-2 text-indigo-600" /> Add New Header Menu
                    </h1>
                    <Link href="/admin/menus" className="flex items-center text-indigo-600 hover:text-indigo-800 transition">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
                    </Link>
                </div>

                {alertMessage.text && <Alert type={alertMessage.type} text={alertMessage.text} />}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Menu Name (Unique)</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., About Us"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                        <input
                            type="text"
                            id="link"
                            name="link"
                            value={formData.link}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., /about"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">Display Order (Lower is earlier)</label>
                        <input
                            type="number"
                            id="order"
                            name="order"
                            value={formData.order}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            min="0"
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-1" />}
                        {isLoading ? 'Adding Menu...' : 'Add Menu Item'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminMenuAddPage;