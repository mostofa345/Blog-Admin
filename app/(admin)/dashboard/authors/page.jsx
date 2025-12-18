"use client";
import React, { useRef, useState } from "react";

// মক ডেটা (Mock Data) - সোশ্যাল লিঙ্ক সহ
const initialAuthors = [
  { id: 1, name: 'আরিফ রহমান', title: 'টেকনোলজি রাইটার', email: 'arif@example.com', bio: 'ব্লকচেইন ও এআই বিশেষজ্ঞ।', image: 'https://placehold.co/100x100/10b981/ffffff?text=AR', linkedin: 'https://linkedin.com/in/arif', facebook: 'https://facebook.com/arif', twitter: 'https://twitter.com/arif_dev' },
  { id: 2, name: 'নিলুফা ইয়াসমিন', title: 'ফ্যাশন এডিটর', email: 'nilufa@example.com', bio: 'লেটেস্ট ফ্যাশন ট্রেন্ড নিয়ে লেখেন।', image: 'https://placehold.co/100x100/ef4444/ffffff?text=NY', linkedin: 'https://linkedin.com/in/nilufa', facebook: '', twitter: 'https://twitter.com/nilufa' },
  { id: 3, name: 'রেজাউল করিম', title: 'ফিন্যান্স অ্যানালিস্ট', email: 'rezaul@example.com', bio: 'শেয়ার বাজার ও ইনস্যুরেন্স কভার করেন।', image: 'https://placehold.co/100x100/3b82f6/ffffff?text=RK', linkedin: '', facebook: 'https://facebook.com/rezaulk', twitter: '' },
];

const AuthorManagementPage = () => {
  const [authors, setAuthors] = useState(initialAuthors);
  const [newAuthor, setNewAuthor] = useState({
    name: '',
    title: '',
    email: '',
    bio: '',
    image: '', // URL or temporary Blob URL
    imageFile: null, // For file upload handling
    linkedin: '',
    facebook: '',
    twitter: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  // ফাইল ইনপুট রেফারেন্স
  const fileInputRef = useRef(null);

  // ইনপুট ফিল্ডের ভ্যালু হ্যান্ডেল করা
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'imageFile' && files && files[0]) {
      const file = files[0];
      // File-এর একটি টেম্পোরারি URL তৈরি করা
      const tempImageUrl = URL.createObjectURL(file); 
      
      setNewAuthor(prev => ({ 
        ...prev, 
        imageFile: file, 
        image: tempImageUrl // প্রদর্শনীর জন্য টেম্পোরারি URL ব্যবহার করা
      }));

    } else {
      setNewAuthor(prev => ({ ...prev, [name]: value }));
    }
  };

  // ফর্ম সাবমিট হ্যান্ডেল করা (নতুন লেখক যোগ করা)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newAuthor.name || !newAuthor.email || !newAuthor.title) {
      setError("লেখক এর নাম, ইমেল এবং টাইটেল দেওয়া আবশ্যক।");
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    // বাস্তব অ্যাপ্লিকেশনে: imageFile ক্লাউড স্টোরেজে আপলোড হবে এবং image-এ পার্মানেন্ট URL সেট হবে।
    try {
      // সিমুলেটিং API latency & File Upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newId = authors.length + 1;
      const authorToAdd = { 
        id: newId, 
        name: newAuthor.name,
        title: newAuthor.title,
        email: newAuthor.email,
        bio: newAuthor.bio,
        // এখানে মক ডেটা হিসেবে প্রোফাইল ছবিটিকে টেম্প URL বা ইনিশিয়াল ব্যবহার করা হচ্ছে
        image: newAuthor.image || `https://placehold.co/100x100/9ca3af/ffffff?text=${newAuthor.name.slice(0, 2).toUpperCase()}`,
        linkedin: newAuthor.linkedin,
        facebook: newAuthor.facebook,
        twitter: newAuthor.twitter,
      };

      setAuthors(prev => [...prev, authorToAdd]);
      
      // ফর্ম রিসেট
      setNewAuthor({ name: '', title: '', email: '', bio: '', image: '', imageFile: null, linkedin: '', facebook: '', twitter: '' });
      if(fileInputRef.current) fileInputRef.current.value = ""; // ফাইল ইনপুট রিসেট
      
      setMessage("নতুন লেখক সফলভাবে যোগ করা হয়েছে!");

    } catch (err) {
      setError("লেখক যোগ করার সময় সমস্যা হয়েছে।");
    } finally {
      setIsSaving(false);
    }
  };

  // লেখক মুছে ফেলা (শুধুমাত্র মক ফাংশন)
  const handleDelete = (id) => {
    setMessage(null);
    const updatedAuthors = authors.filter(author => author.id !== id);
    setAuthors(updatedAuthors);
    setMessage(`লেখক ID: ${id} মুছে ফেলা হয়েছে।`);
  };

  // ইনপুট ফিল্ড কম্পোনেন্ট
  const InputField = ({ label, name, type = 'text', required = false }) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={newAuthor[name]}
          onChange={handleChange}
          required={required}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition duration-150"
        ></textarea>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={newAuthor[name]}
          onChange={handleChange}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition duration-150"
        />
      )}
    </div>
  );
  
  // ফাইল ইনপুট এবং প্রিভিউ কম্পোনেন্ট
  const FileUploadField = () => (
      <div className="mb-4">
          <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              প্রোফাইল পিকচার আপলোড
          </label>
          <div className="flex items-center space-x-4">
              <input
                  id="imageFile"
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  ref={fileInputRef}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200 dark:hover:file:bg-gray-600 cursor-pointer"
              />
              {newAuthor.image && (
                  <img
                      src={newAuthor.image}
                      alt="Preview"
                      className="h-14 w-14 rounded-full object-cover border-2 border-blue-500 shadow-lg"
                      // যদি ফাইল আপলোড না হয়, তবে ডিফল্ট প্লেসহোল্ডার দেখানো
                      onError={(e) => e.target.src = `https://placehold.co/100x100/9ca3af/ffffff?text=PIC`}
                  />
              )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">সর্বোত্তম ফলাফলের জন্য বর্গাকার ছবি ব্যবহার করুন।</p>
      </div>
  );
  
  // লেখক কার্ডে সোশ্যাল আইকনের জন্য একটি সহায়ক ফাংশন
  const SocialIcon = ({ href, Icon, label }) => {
    if (!href) return null;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition duration-150 ml-2">
        {/* মক SVG আইকন, বাস্তব অ্যাপ্লিকেশনে এখানে Tailwind-এর heroicons বা react-icons ব্যবহার করতে পারেন */}
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <title>{label}</title>
            {/* এখানে সোশ্যাল মিডিয়ার আইকনের SVG Path বসবে */}
            <path d={
              label === 'LinkedIn' ? "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM4 9h4v12H4zM6 4a2 2 0 100 4 2 2 0 000-4z" :
              label === 'Facebook' ? "M18 2h-3a4 4 0 00-4 4v3h-3v4h3v8h4v-8h3l1-4h-4V6a1 1 0 011-1h3z" :
              label === 'Twitter' ? "M22 5.8a8.4 8.4 0 01-2.4.6 4.2 4.2 0 001.8-2.2 8.4 8.4 0 01-2.6 1 4.2 4.2 0 00-7.2 3.8 11.9 11.9 0 01-8.6-4.3 4.2 4.2 0 001.3 5.6 4.2 4.2 0 01-1.9-.5v.1a4.2 4.2 0 003.4 4.1 4.2 4.2 0 01-1.9.1 4.2 4.2 0 003.9 2.9A8.4 8.4 0 012 18.2a11.9 11.9 0 006.4 1.9c7.7 0 12-6.4 12-12v-.5a8.4 8.4 0 002.2-2.3z" : ""
            } />
        </svg>
      </a>
    );
  };


  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
        লেখক ব্যবস্থাপনা (Author Management)
      </h1>

      {/* Message and Error Area */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg relative mb-6 transition duration-150" role="alert">
          <strong className="font-bold">ত্রুটি:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}
      {message && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg relative mb-6 transition duration-150" role="alert">
          <strong className="font-bold">সফল:</strong>
          <span className="block sm:inline ml-2">{message}</span>
        </div>
      )}

      {/* 1. Add New Author Form */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 md:p-8 mb-10 border border-gray-200 dark:border-gray-700 transition duration-300">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">নতুন লেখক যুক্ত করুন</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <InputField label="লেখক এর নাম" name="name" required />
            <InputField label="টাইটেল/পদবী (যেমন: টেক রাইটার)" name="title" required />
            <InputField label="ইমেল (Gmail)" name="email" type="email" required />
            <FileUploadField /> {/* আপলোড ইনপুট */}
            
            <InputField label="LinkedIn প্রোফাইল URL (ঐচ্ছিক)" name="linkedin" type="url" />
            <InputField label="Facebook প্রোফাইল URL (ঐচ্ছিক)" name="facebook" type="url" />
            <InputField label="Twitter প্রোফাইল URL (ঐচ্ছিক)" name="twitter" type="url" />
            {/* এখানে একটি খালি গ্রিড আইটেম ব্যবহার করা হয়েছে যাতে বায়ো নিচের লাইনে চলে আসে */}
            <div></div> 
          </div>
          <InputField label="লেখক পরিচিতি / Bio (সংক্ষিপ্ত বর্ণনা)" name="bio" type="textarea" />
          
          <button
            type="submit"
            disabled={isSaving}
            className="w-full md:w-auto mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                যোগ করা হচ্ছে...
              </>
            ) : (
              'লেখক যোগ করুন'
            )}
          </button>
        </form>
      </div>

      {/* 2. Author List */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 transition duration-300">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">সকল লেখক ({authors.length} জন)</h2>
        
        {/* Desktop/Tablet Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">লেখক</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">পদবী/টাইটেল</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ইমেল</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">সোশ্যাল</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bio</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-xl">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {authors.map((author) => (
                <tr key={author.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full object-cover" src={author.image} alt={author.name} onError={(e) => e.target.src = `https://placehold.co/100x100/9ca3af/ffffff?text=${author.name.slice(0, 2).toUpperCase()}`} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{author.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{author.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-blue-600 dark:text-blue-400 truncate max-w-[150px]">{author.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-start">
                        <SocialIcon href={author.linkedin} label="LinkedIn" />
                        <SocialIcon href={author.facebook} label="Facebook" />
                        <SocialIcon href={author.twitter} label="Twitter" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-48">{author.bio || '—'}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button 
                      onClick={() => handleDelete(author.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 transition duration-150 p-2 rounded-full hover:bg-red-50 dark:hover:bg-gray-700"
                    >
                      মুছে ফেলুন
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {authors.map((author) => (
            <div key={author.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow transition duration-150 border border-gray-200 dark:border-gray-600">
              <div className="flex items-start space-x-4">
                <img className="h-12 w-12 rounded-full object-cover" src={author.image} alt={author.name} onError={(e) => e.target.src = `https://placehold.co/100x100/9ca3af/ffffff?text=${author.name.slice(0, 2).toUpperCase()}`} />
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{author.name}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">{author.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{author.email}</div>
                </div>
              </div>
              
              {/* Mobile Social Links */}
              <div className="flex justify-start mt-2 border-t border-gray-200 dark:border-gray-600 pt-2">
                  <SocialIcon href={author.linkedin} label="LinkedIn" />
                  <SocialIcon href={author.facebook} label="Facebook" />
                  <SocialIcon href={author.twitter} label="Twitter" />
              </div>
              
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-600 pt-3">
                <span className="font-medium">Bio:</span> {author.bio || '—'}
              </p>
              <button 
                onClick={() => handleDelete(author.id)}
                className="mt-3 w-full py-2 text-red-600 hover:text-white bg-red-100 hover:bg-red-600 dark:bg-red-800 dark:hover:bg-red-700 dark:text-red-200 rounded-lg transition duration-150"
              >
                মুছে ফেলুন
              </button>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default AuthorManagementPage;