"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle, Loader2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

// File: /app/admin/menus/edit/[id]/page.jsx

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/menus`;

const AdminMenuEditPage = ({ params }) => {
    const { id } = params; // Next.js dynamic route parameter
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', link: '', order: 0, isDefault: false });
    const [isLoading, setIsLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchMenuDetails(id);
        }
    }, [id]);

    const fetchMenuDetails = async (menuId) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/${menuId}`, { cache: 'no-store' });
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            
            const data = await res.json();
            const menu = data.data;
            setFormData({
                name: menu.name,
                link: menu.link,
                order: menu.order || 0,
                isDefault: menu.isDefault || false,
            });
        } catch (err) {
            console.error(err);
            setAlertMessage({ type: 'error', text: 'Failed to load menu details. Item might not exist.' });
        } finally {
            setIsLoading(false);
        }
    };

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
        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                // isDefault যাতে অপরিবর্তিত থাকে, তা নিশ্চিত করা হলো
                body: JSON.stringify({
                    name: formData.name,
                    link: formData.link,
                    order: formData.order,
                    isDefault: formData.isDefault 
                }),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                // ⚠️ ডুপ্লিকেট কী এররসহ অন্যান্য এরর হ্যান্ডলিং
                throw new Error(errorData.message || 'Failed to update menu.');
            }

            setAlertMessage({ type: 'success', text: `Menu "${formData.name}" updated successfully!` });
            
            // সফলভাবে আপডেট হলে কিছু সময় পর মেনু লিস্ট পেজে ফিরে যাবে
            setTimeout(() => {
                router.push('/admin/menus');
            }, 1500);

        } catch (err) {
            console.error('Update Error:', err);
            setAlertMessage({ type: 'error', text: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const Alert = ({ type, text }) => (
        <div className={`p-4 mb-4 rounded-md flex items-center ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border-l-4 ${type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            {type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
            {text}
        </div>
    );

    if (isLoading) {
        return (
            <div className="text-center py-20 text-indigo-600 flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Menu Details...
            </div>
        );
    }
    
    if (alertMessage.type === 'error' && !formData.name) {
        // লোডিং এরর হলে ব্যাক বাটন দেখাবে
        return (
            <div className="max-w-xl mx-auto p-8">
                <Alert type="error" text={alertMessage.text} />
                <Link href="/admin/menus" className="flex items-center text-indigo-600 hover:text-indigo-800 transition mt-4">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-xl mx-auto bg-white shadow-xl rounded-lg p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Pencil className="w-5 h-5 mr-2 text-indigo-600" /> Edit Header Menu
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
                            readOnly={formData.isDefault}
                            className={`w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${formData.isDefault ? 'bg-gray-100' : ''}`}
                            placeholder="e.g., About Us"
                        />
                        {formData.isDefault && <p className="text-xs text-red-500 mt-1">Default menu name cannot be changed.</p>}
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
                        disabled={isSubmitting}
                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Pencil className="w-5 h-5 mr-1" />}
                        {isSubmitting ? 'Updating Menu...' : 'Update Menu Item'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminMenuEditPage;