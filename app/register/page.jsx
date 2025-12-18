"use client";
import React, { useState } from "react";
import { Key, Loader2, Mail, ShieldCheck } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';

export default function LoginPage() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admins/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            
            if (data.success) {
                localStorage.setItem("adminToken", data.token);
                localStorage.setItem("adminData", JSON.stringify(data.admin));
                alert("Login Successful!");
                window.location.href = "/dashboard"; 
            } else {
                alert(data.message || "Login failed!");
            }
        } catch (error) {
            alert("Server connection failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 font-sans">
            <div className="max-w-md w-full bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-800">
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-indigo-900/30 rounded-2xl mb-4 text-indigo-500">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tight text-white">
                        Admin <span className="text-indigo-500">Login</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-2 font-medium">Enter credentials to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                            name="email"
                            type="email" 
                            required
                            placeholder="Email Address"
                            className="w-full bg-slate-800/50 border border-slate-700 pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-white font-bold"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                            name="password"
                            type="password" 
                            required
                            placeholder="Password"
                            className="w-full bg-slate-800/50 border border-slate-700 pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-white font-bold"
                            onChange={handleChange}
                        />
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Sign In Access"}
                    </button>
                </form>

                <p className="text-center mt-6 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                    Authorized Admin Access Only
                </p>
            </div>
        </div>
    );
}