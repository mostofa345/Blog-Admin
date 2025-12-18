"use client";
import React, { useEffect, useRef, useState } from "react";

import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  UserCog,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

export default function MyAccount() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const fileInputRef = useRef(null);

  // Profile State
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    profilePic: null,
    role: ""
  });

  // Password State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // 1. Fetch Logged-in Admin Data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('https://blog-server-0exu.onrender.com/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          setProfile({
            username: data.admin.username || "",
            email: data.admin.email || "",
            profilePic: data.admin.profilePic || null,
            role: data.admin.role || "Admin"
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchAdminData();
  }, []);

  // Image to Base64 (For Cloudinary)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Main Update Function
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwords.current) {
      alert("Please enter your current password to save changes.");
      return;
    }
    if (passwords.new && passwords.new !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://blog-server-0exu.onrender.com/api/auth/update-profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: profile.username,
          email: profile.email,
          profilePic: profile.profilePic, // Base64 string pathano hoyeche
          currentPassword: passwords.current,
          newPassword: passwords.new
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Profile & Security updated successfully!");
        setPasswords({ current: "", new: "", confirm: "" }); // Reset password fields
        if (data.admin) {
            setProfile(prev => ({ ...prev, profilePic: data.admin.profilePic }));
        }
      } else {
        alert(data.message || "Update failed. Check your password.");
      }
    } catch (error) {
      alert("Server connection failed!");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
            <UserCog className="text-blue-500" size={36} />
            My Account
          </h1>
          <p className="text-slate-400 mt-2">Manage your info, photo and security settings.</p>
        </div>

        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="lg:col-span-1">
            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 border border-slate-800 shadow-xl text-center">
              <div className="relative w-40 h-40 mx-auto mb-6">
                <div className="w-full h-full rounded-full border-4 border-blue-500/20 p-1 bg-gradient-to-tr from-blue-600 to-indigo-600">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                    {profile.profilePic ? (
                      <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={60} className="text-slate-500" />
                    )}
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-2xl shadow-lg border-4 border-[#0f172a]"
                >
                  <Camera size={20} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{profile.username}</h2>
              <span className="text-[10px] font-black px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                {profile.role}
              </span>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 border border-slate-800 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username</label>
                  <input 
                    type="text" 
                    value={profile.username}
                    onChange={(e) => setProfile({...profile, username: e.target.value})}
                    className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-2xl py-3 px-6 text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-2xl py-3 px-6 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="h-px bg-slate-800/50 mb-8"></div>
              <h3 className="text-white font-bold mb-6 flex items-center gap-2"><Lock size={18} className="text-purple-500"/> Security</h3>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Current Password *</label>
                  <div className="relative">
                    <input 
                      type={showPass ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                      placeholder="Verify to save"
                      className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-2xl py-3 px-6 text-white outline-none"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                      {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">New Password (Optional)</label>
                    <input 
                      type="password" 
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-2xl py-3 px-6 text-white outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-2xl py-3 px-6 text-white outline-none"
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18}/>}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}