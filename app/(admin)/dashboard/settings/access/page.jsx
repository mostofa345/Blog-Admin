"use client";
import React, { useCallback, useEffect, useState } from "react";

import { 
    UserPlus, ShieldCheck, Mail, Trash2, ShieldAlert, 
    CheckCircle2, Clock, Loader2, AlertCircle, RefreshCw
} from "lucide-react";

// সরাসরি ব্যাকএন্ড URL চেক করে নিচ্ছি
const API_BASE_URL = 'https://blog-server-0exu.onrender.com/api';
const ADMIN_API = `${API_BASE_URL}/admins`;

export default function AccessControlCenter() {
    const [mounted, setMounted] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [role, setRole] = useState("Editor");
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    // ১. সার্ভার থেকে অ্যাডমিন লিস্ট আনা
    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${ADMIN_API}/list`, {
                cache: 'no-store' // লেটেস্ট ডাটা পাওয়ার জন্য
            });
            if (!res.ok) throw new Error("Server Error: " + res.status);
            const data = await res.json();
            setAdmins(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Cannot connect to server at port 5000. Please check CORS or Server status.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setMounted(true);
        fetchAdmins();
    }, [fetchAdmins]);

    // ২. ইনভাইট পাঠানো
    const handleInvite = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await fetch(`${ADMIN_API}/invite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail, role })
            });
            const data = await res.json();
            if (data.success) {
                alert("Invite Successful!");
                setInviteEmail("");
                fetchAdmins();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Network error while inviting.");
        } finally {
            setActionLoading(false);
        }
    };

    // ৩. অ্যাক্সেস রিভোক/ডিলিট করা
    const handleRevoke = async (id) => {
        if (!confirm("Remove this admin's access permanently?")) return;
        try {
            const res = await fetch(`${ADMIN_API}/revoke/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setAdmins(prev => prev.filter(a => a._id !== id));
            }
        } catch (err) {
            alert("Failed to revoke access.");
        }
    };

    if (!mounted) return null;

    return (
        <div className="p-4 sm:p-8 max-w-[1400px] mx-auto dark:bg-[#0a0a0c] min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black italic mb-2 tracking-tight">
                        Admin <span className="text-indigo-600">Access</span> Panel
                    </h1>
                    <p className="text-slate-500 text-sm italic">Grant or revoke access via Email.</p>
                </div>

                <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <input 
                        type="email" 
                        required
                        placeholder="Enter Gmail address..."
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold sm:w-72"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <select 
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl text-sm font-bold"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="Editor">Editor</option>
                        <option value="SEO Manager">SEO Manager</option>
                        <option value="Admin">Full Admin</option>
                    </select>
                    <button 
                        disabled={actionLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                        {actionLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        Send Access
                    </button>
                </form>
            </div>

            {/* Error UI */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center justify-between text-red-600">
                    <div className="flex items-center gap-2 font-bold text-sm">
                        <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                    <button onClick={fetchAdmins} className="p-2 hover:bg-red-100 dark:hover:bg-red-800 rounded-full">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Table Area */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Permission</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan="4" className="py-20 text-center text-slate-400 italic font-bold">Connecting to Database...</td></tr>
                            ) : admins.length === 0 ? (
                                <tr><td colSpan="4" className="py-20 text-center text-slate-400 italic">No Admins found. Invite someone!</td></tr>
                            ) : admins.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black uppercase shadow-md">
                                                {user.username.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{user.username}</p>
                                                <p className="text-xs text-slate-400 font-medium italic">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 uppercase">{user.role}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-green-500 uppercase">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> {user.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button 
                                            onClick={() => handleRevoke(user._id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
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