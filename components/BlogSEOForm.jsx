"use client";
import React from "react";
import { BarChart3, ClipboardList, Clock, Eye, Link, ListOrdered, Lock, Plus, TrendingUp, X, Zap } from "lucide-react";

// components/BlogSEOForm.jsx


const BlogSEOForm = ({ formData, handleChange, handleTocHeadingAdd, removeTocHeading, isDark }) => {
    
    // UI utilities
    const inputStyle = `w-full p-3 border rounded-lg focus:outline-none transition-colors duration-200 ${
        isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
    }`;
    const labelStyle = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

    return (
        <section className={`p-6 rounded-xl shadow-2xl transition-colors duration-500 ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
            <h2 className={`text-2xl font-bold mb-6 border-b pb-3 ${isDark ? 'border-gray-700 text-cyan-400' : 'border-gray-200 text-blue-600'}`}>
                <TrendingUp className="inline-block w-6 h-6 mr-2" />
                Advanced SEO & Structure
            </h2>

            <div className="space-y-6">
                
                {/* 1. Meta Title (Max 60 chars) */}
                <div>
                    <label htmlFor="metaTitle" className={labelStyle}>
                        1. Meta Title (SEO Title)
                        <span className="text-xs ml-2">({formData.metaTitle ? formData.metaTitle.length : 0} / 60 chars)</span>
                    </label>
                    <input
                        type="text"
                        id="metaTitle"
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleChange}
                        className={inputStyle}
                        placeholder="Optimized title for search engine results"
                        maxLength={60}
                    />
                </div>

                {/* 2. Meta Description (Max 160 chars) */}
                <div>
                    <label htmlFor="metaDescription" className={labelStyle}>
                        2. Meta Description
                        <span className="text-xs ml-2">({formData.metaDescription ? formData.metaDescription.length : 0} / 160 chars)</span>
                    </label>
                    <textarea
                        id="metaDescription"
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleChange}
                        className={`${inputStyle} h-20`}
                        placeholder="Write a compelling description for search engine snippets"
                        maxLength={160}
                    />
                </div>
                
                {/* 3. Focus Keyword */}
                <div>
                    <label htmlFor="focusKeyword" className={labelStyle}>
                        3. Focus Keyword
                    </label>
                    <input
                        type="text"
                        id="focusKeyword"
                        name="focusKeyword"
                        value={formData.focusKeyword}
                        onChange={handleChange}
                        className={inputStyle}
                        placeholder="e.g., responsive web design"
                    />
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>The main keyword you want to rank for.</p>
                </div>

                {/* 4. Blog Slug (URL) */}
                <div>
                    <label htmlFor="slug" className={labelStyle}>
                        4. Post Slug (URL Path)
                    </label>
                    <input
                        type="text"
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        className={inputStyle}
                        placeholder="auto-generated-from-title"
                    />
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Must be lowercase and hyphenated.</p>
                </div>

                {/* 5. Canonical URL */}
                <div>
                    <label htmlFor="canonicalUrl" className={labelStyle}>
                        5. Canonical URL <Link className="w-4 h-4 inline-block" />
                    </label>
                    <input
                        type="url"
                        id="canonicalUrl"
                        name="canonicalUrl"
                        value={formData.canonicalUrl}
                        onChange={handleChange}
                        className={inputStyle}
                        placeholder="https://yourdomain.com/original-source-url"
                    />
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>If this content is a repost, link to the original source.</p>
                </div>
                
                {/* 🔥🔥🔥 নতুন ফিল্ড: 6. Suggested Blogs (Optional Multi-Select) 🔥🔥🔥 */}
                <div>
                    <label htmlFor="suggestedBlogs" className={labelStyle}>
                        6. Suggested Blogs (Optional) <ClipboardList className="w-4 h-4 inline-block" />
                    </label>
                    <select
                        // MongoDB array অফ ID-এর জন্য `multiple` অ্যাট্রিবিউট ব্যবহার করা হলো
                        multiple
                        id="suggestedBlogs"
                        name="suggestedBlogs"
                        // formData.suggestedBlogs যদি undefined বা null হয়, তবে খালি array ব্যবহার করা হয়েছে
                        value={formData.suggestedBlogs || []} 
                        onChange={(e) => {
                            // মাল্টি-সিলেক্ট থেকে সব নির্বাচিত অপশনের ভ্যালু array আকারে বের করা
                            const selectedOptions = Array.from(e.target.selectedOptions);
                            const values = selectedOptions.map(option => option.value);
                            // handleChange ফাংশনকে কল করা, যা একটি array পাঠাচ্ছে
                            handleChange({ target: { name: 'suggestedBlogs', value: values } });
                        }}
                        className={`${inputStyle} h-28`} // মাল্টি-সিলেক্টের জন্য উচ্চতা বাড়ানো হলো
                    >
                        {/* আপাতত খালি থাকার কারণে এই অপশনটি দেখাবে */}
                        <option value="" disabled>-- No other published articles found --</option>
                        {/* ভবিষ্যতে, এখানে API কল করে লোড হওয়া ব্লগের তালিকা যুক্ত হবে */}
                        {/*
                        {availableBlogs.map((blog) => (
                            <option key={blog._id} value={blog._id}>
                                {blog.title}
                            </option>
                        ))}
                        */}
                    </select>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Select relevant blogs to link at the end of the post.</p>
                </div>
                {/* 🔥🔥🔥 নতুন ফিল্ডের সমাপ্তি 🔥🔥🔥 */}

                {/* 7. Robots Meta Tag (আগের 6) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center pt-2">
                        <input
                            type="checkbox"
                            id="noIndex"
                            name="noIndex"
                            checked={formData.noIndex}
                            onChange={(e) => handleChange({ target: { name: 'noIndex', value: e.target.checked } })}
                            className={`w-4 h-4 mr-2 ${isDark ? 'bg-gray-700 border-gray-500' : 'bg-gray-100 border-gray-300'} rounded text-red-600 focus:ring-red-500`}
                        />
                        <label htmlFor="noIndex" className={labelStyle}>No Index (Hide from search)</label>
                    </div>
                    <div className="flex items-center pt-2">
                           <input
                            type="checkbox"
                            id="noFollow"
                            name="noFollow"
                            checked={formData.noFollow}
                            onChange={(e) => handleChange({ target: { name: 'noFollow', value: e.target.checked } })}
                            className={`w-4 h-4 mr-2 ${isDark ? 'bg-gray-700 border-gray-500' : 'bg-gray-100 border-gray-300'} rounded text-red-600 focus:ring-red-500`}
                        />
                        <label htmlFor="noFollow" className={labelStyle}>No Follow (Don't follow links)</label>
                    </div>
                </div>

                {/* 8. Readability Score (আগের 7) */}
                <div className="flex items-center justify-between p-3 rounded-lg border-l-4 border-cyan-500" style={{ backgroundColor: isDark ? '#1F2937' : '#F0F9FF' }}>
                    <p className="font-semibold flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" /> 8. Readability Score
                    </p>
                    <span className="text-lg font-bold text-cyan-500">72.5 (Good)</span>
                </div>
                
                {/* 9. Keyword Density (আগের 8) */}
                <div className="flex items-center justify-between p-3 rounded-lg border-l-4 border-green-500" style={{ backgroundColor: isDark ? '#1F2937' : '#F0FFF4' }}>
                    <p className="font-semibold flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-400" /> 9. Keyword Density
                    </p>
                    <span className="text-lg font-bold text-green-500">1.5% (Optimal)</span>
                </div>
                
                {/* 10. Image Alt Text Check (আগের 9) */}
                <div className="flex items-center justify-between p-3 rounded-lg border-l-4 border-yellow-500" style={{ backgroundColor: isDark ? '#1F2937' : '#FFFBEB' }}>
                    <p className="font-semibold flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-yellow-400" /> 10. Image Alt Text Check
                    </p>
                    <span className="text-sm font-semibold text-yellow-500">2/5 Images Missing Alt</span>
                </div>
                
                {/* 11. Post Expiration Date (আগের 10) */}
                <div>
                    <label htmlFor="expireDate" className={labelStyle}>
                        11. Post Expiration Date (Optional) <Clock className="w-4 h-4 inline-block" />
                    </label>
                    <input
                        type="date"
                        id="expireDate"
                        name="expireDate"
                        value={formData.expireDate}
                        onChange={handleChange}
                        className={inputStyle}
                        placeholder="Automatically unpublish after this date."
                    />
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Automatically unpublish after this date.</p>
                </div>
                
                {/* 12. Table of Contents (TOC) Headings (আগের 11) */}
                <div>
                    <label className={labelStyle}>12. Table of Contents (TOC) Headings</label>
                    <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manually add H2/H3 headings for navigation. <span className="font-semibold">Format: Heading | Level (2 or 3)</span></p>

                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            id="tocHeading"
                            name="tocHeading"
                            // No value binding here, this is just for temporary input
                            className={`${inputStyle} flex-grow`}
                            placeholder="Heading Text"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTocHeadingAdd(e.target.value, 2); 
                            }}
                        />
                           <select
                            id="tocLevel"
                            name="tocLevel"
                            className={`${inputStyle} w-16`}
                        >
                            <option value="2">H2</option>
                            <option value="3">H3</option>
                        </select>
                        <button
                            type="button"
                            onClick={() => {
                                const headingText = document.getElementById('tocHeading').value;
                                const level = parseInt(document.getElementById('tocLevel').value);
                                handleTocHeadingAdd(headingText, level);
                                document.getElementById('tocHeading').value = ''; // Clear input
                            }}
                            className={`p-3 rounded-lg transition-colors duration-200 ${isDark ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                            title="Add Heading"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Display current TOC items */}
                    {formData.tocHeadings && formData.tocHeadings.length > 0 && (
                        <div className="space-y-2 mt-3">
                            {formData.tocHeadings.map((item, index) => (
                                <div key={index} className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                        <span className={`font-bold mr-2 ${item.level === 2 ? 'text-cyan-500' : 'text-yellow-500'}`}>{`H${item.level}`}</span>
                                        {item.heading}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeTocHeading(index)}
                                        className={`p-1 rounded-full transition-colors duration-200 ${isDark ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'}`}
                                        title="Remove Heading"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
};

export default BlogSEOForm;