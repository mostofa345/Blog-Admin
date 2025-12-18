"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AlertTriangle, Home, Loader2, Pencil, Plus, Trash2 } from "lucide-react";

// 🔗 API বেস URL, যা .env ফাইল থেকে নেওয়া হয়েছে
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/menus`;

// ✅ মেনু ফেচ করার ফাংশন (API এরর হ্যান্ডলিং সহ)
const fetchMenus = async () => {
    // API কল
    const res = await fetch(API_BASE_URL, { cache: 'no-store' });
    
    if (!res.ok) {
        let errorMsg = `API Error: ${res.status} (${res.statusText})`;
        
        // সার্ভার থেকে আসা বিস্তারিত এরর মেসেজ নেওয়ার চেষ্টা করা হবে
        try {
            const errorData = await res.json();
            // সার্ভার থেকে আসা 'message' ফিল্ডটি ব্যবহার করা হলো
            errorMsg = errorData.message || errorMsg; 
        } catch (e) {
            // যদি রেসপন্স JSON না হয়
            console.error("Failed to parse error response as JSON:", e);
        }
        
        // 400 Bad Request এর জন্য সঠিক মেসেজ থ্রো করা হলো
        throw new Error(errorMsg || `Failed to fetch menus with status: ${res.status}`);
    }
    
    const data = await res.json();
    return data.data || [];
};


const AdminMenuListPage = () => {
    const [menus, setMenus] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // এরর স্টেট UI-তে দেখানোর জন্য

    useEffect(() => {
        loadMenus();
    }, []);

    // 🚀 Load Menus ফাংশন (API কল এবং স্টেট ম্যানেজমেন্ট)
    const loadMenus = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchMenus(); 
            // API থেকে আসা _id ফিল্ডটিকে front-end ব্যবহারের জন্য id-তে ম্যাপ করা হলো
            setMenus(data.map(m => ({
                id: m._id,
                name: m.name,
                link: m.link,
                isDefault: m.isDefault,
                order: m.order || 0,
            })));
        } catch (err) {
            // API থেকে আসা সঠিক এরর মেসেজটি error স্টেট-এ সেট করা হলো
            console.error("Frontend Menu Fetch Error:", err);
            setError(err.message || 'An unknown error occurred while fetching menus.');
            setMenus([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id, name, isDefault) => {
        // (ডিলিট লজিক এখানে অপরিবর্তিত আছে)
        if (isDefault) {
            alert("Default menu items cannot be deleted.");
            return;
        }

        if (!confirm(`Are you sure you want to delete the menu item: "${name}"?`)) return;

        try {
            setIsLoading(true);
            const res = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
            });
            
            if (!res.ok) {
                let errorMsg = 'Failed to delete menu.';
                try {
                    const errorData = await res.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) {
                    // JSON parse error
                }
                throw new Error(errorMsg);
            }

            // Successfully deleted. Update the list locally.
            setMenus(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            alert(err.message);
        } finally {
            setIsLoading(false);
            loadMenus(); // ডিলিটের পরে লিস্ট রিফ্রেশ করা হলো
        }
    };

    const btnBase = "transition duration-200 text-sm font-medium rounded-full flex items-center justify-center p-2";

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                        <Home className="w-6 h-6 mr-2 text-indigo-600" /> Header Menu List
                    </h1>
                    <Link href="/admin/menus/add" className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 shadow-md hover:shadow-lg">
                        <Plus className="w-5 h-5 mr-1" /> Add New Menu
                    </Link>
                </div>

                {isLoading && (
                    <div className="text-center py-10 text-indigo-600 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> মেনু লোড হচ্ছে...
                    </div>
                )}

                {/* ❌ এখন API এররগুলো পরিষ্কারভাবে দেখানো হবে */}
                {error && !isLoading && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-center font-medium rounded-lg">
                        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" /> 
                        <span className="font-bold mr-1">মেনু লোড এরর (সম্ভাব্য রাউটিং সমস্যা):</span> {error}
                        <button 
                            onClick={loadMenus} 
                            className="ml-auto text-sm text-red-800 hover:underline font-bold px-3 py-1 bg-red-200 rounded-md"
                        >
                            পুনরায় চেষ্টা করুন
                        </button>
                    </div>
                )}

                {!isLoading && !error && menus.length > 0 && (
                    <div className="overflow-x-auto rounded-lg shadow-sm border">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Link</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {menus.sort((a, b) => a.order - b.order).map(menu => (
                                    <tr key={menu.id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{menu.order}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{menu.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 break-all">{menu.link}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${menu.isDefault ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                                                {menu.isDefault ? 'Default' : 'Custom'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {/* Edit Link (আপডেটের জন্য /edit/ যুক্ত করা হলো) */}
                                            <Link href={`/admin/menus/edit/${menu.id}`} className={`${btnBase} text-indigo-600 hover:bg-indigo-100`}>
                                                <Pencil className="w-5 h-5 inline" />
                                            </Link>
                                            {/* Delete Button */}
                                            <button 
                                                onClick={() => handleDelete(menu.id, menu.name, menu.isDefault)}
                                                disabled={menu.isDefault}
                                                className={`${btnBase} bg-red-600 hover:bg-red-700 text-white ${menu.isDefault ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <Trash2 className="w-5 h-5 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {!isLoading && menus.length === 0 && !error && (
                    <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg p-8">
                        <p className="text-lg mb-2">কোনো মেনু আইটেম পাওয়া যায়নি।</p>
                        <p className="text-sm">"Add New Menu" এ ক্লিক করে আপনার প্রথম আইটেমটি তৈরি করুন।</p>
                    </div>
                )}
                
                 <p className="mt-6 text-sm text-gray-500 border-t pt-4">
                    * ডিফল্ট মেনু আইটেমগুলো (যেমন: Home, About Us) ডিলিট করা যাবে না।
                </p>
            </div>
        </div>
    );
};

export default AdminMenuListPage;
