"use client";
import Image from "next/image";
import React, { useState } from "react";
import { BookOpen, FileText, Plus, Tag, UploadCloud, User, X } from "lucide-react";

// File: components/BlogHeaderForm.jsx


// Updated prop list: allSubCategories is expected instead of allCategories/subCategoryOptions
const BlogHeaderForm = ({ formData, handleChange, handleFileChange, allSubCategories, isDark }) => {
    
    // UI utilities (unchanged)
    const inputStyle = `w-full p-3 border rounded-lg focus:outline-none transition-colors duration-200 ${
        isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
    }`;
    const labelStyle = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
    const tagInputStyle = `p-2 border rounded-l-lg focus:outline-none transition-colors duration-200 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'}`
    
    // Local tag state and handlers (unchanged)
    const [currentTag, setCurrentTag] = useState('');
    const handleAddTag = () => {
        if (currentTag.trim() !== '') {
            const newTags = formData.tags ? `${formData.tags}, ${currentTag.trim()}` : currentTag.trim();
            handleChange({ target: { name: 'tags', value: newTags } });
            setCurrentTag('');
        }
    };
    const handleRemoveTag = (tagToRemove) => {
        const updatedTags = formData.tags.split(',').filter(tag => tag.trim() !== tagToRemove.trim()).join(', ');
        handleChange({ target: { name: 'tags', value: updatedTags } });
    };
    const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

    // Local state for image preview
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileChange(file); // Pass the file object to the parent
            setPreviewUrl(URL.createObjectURL(file)); // Set local preview URL
        }
    };
    
    // FIX: Check if allSubCategories is an array to prevent 'length' error.
    const subCategoryOptions = Array.isArray(allSubCategories) ? allSubCategories : [];


    return (
        <section className={`p-6 rounded-xl shadow-2xl transition-colors duration-500 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-6 border-b pb-3 ${isDark ? 'border-gray-700 text-cyan-400' : 'border-gray-200 text-blue-600'}`}>
                Post Details <span className="text-red-500">*</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Image Upload/Preview */}
                <div className="md:col-span-2">
                    <label className={labelStyle}>Cover Image <span className="text-red-500">*</span></label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors duration-200"
                        style={{ 
                            backgroundImage: `url(${previewUrl || formData.coverImage || ''})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            minHeight: '200px'
                        }}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="coverImageUpload"
                        />
                        <label 
                            htmlFor="coverImageUpload" 
                            className={`flex flex-col items-center justify-center w-full h-full text-center p-8 rounded-lg ${
                                previewUrl || formData.coverImage 
                                    ? 'bg-black/50 hover:bg-black/60 backdrop-blur-sm'
                                    : (isDark ? 'bg-gray-700/50 hover:bg-gray-700/70' : 'bg-gray-50/50 hover:bg-gray-50/70')
                            } transition-all duration-300`}
                        >
                            <UploadCloud className={`w-8 h-8 mb-2 ${isDark || previewUrl || formData.coverImage ? 'text-white' : 'text-gray-500'}`} />
                            <span className={`text-sm font-semibold ${isDark || previewUrl || formData.coverImage ? 'text-white' : 'text-gray-700'}`}>
                                {previewUrl || formData.coverImage ? 'Change Image' : 'Click to Upload Cover Image (Required)'}
                            </span>
                        </label>
                    </div>
                </div>

                {/* Left Column (Title, Slug, Summary, Subcategory) */}
                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className={labelStyle}>Post Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={inputStyle}
                            placeholder="A descriptive title for your blog post"
                            required
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label htmlFor="slug" className={labelStyle}>URL Slug</label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className={inputStyle}
                            placeholder="auto-generated-slug-from-title"
                        />
                    </div>

                    {/* Summary */}
                    <div>
                        <label htmlFor="summary" className={labelStyle}>Summary / Excerpt</label>
                        <textarea
                            id="summary"
                            name="summary"
                            value={formData.summary}
                            onChange={handleChange}
                            className={`${inputStyle} h-24 resize-none`}
                            placeholder="A short, catchy summary for the blog list and social media."
                            maxLength={300}
                        />
                        <p className={`text-xs mt-1 text-right ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{formData.summary.length}/300 characters</p>
                    </div>
                </div>

                {/* Right Column (Subcategory, Tags, Status, Featured) */}
                <div className="space-y-6">
                    
                    {/* Subcategory Select (Removed Main Category) */}
                    <div>
                        <label htmlFor="subcategory" className={labelStyle}>Subcategory <span className="text-red-500">*</span></label>
                        <select
                            id="subcategory"
                            name="subcategory"
                            value={formData.subcategory}
                            onChange={handleChange}
                            className={inputStyle}
                            required
                        >
                            {subCategoryOptions.length === 0 && (
                                <option value="">--- Loading Subcategories... ---</option>
                            )}
                            {subCategoryOptions.length > 0 && subCategoryOptions.map((sub, index) => (
                                // API might return objects with 'name' and 'slug' or just strings. 
                                // Assuming it returns objects with a 'name' or 'slug' field.
                                <option key={sub.slug || sub.name || index} value={sub.name || sub.slug || sub}>
                                    {sub.name || sub.slug || sub}
                                </option>
                            ))}
                        </select>
                    </div>


                    {/* Tags Input */}
                    <div>
                        <label htmlFor="tags" className={labelStyle}>Tags (Comma separated or use Add button)</label>
                        <div className="flex">
                            <input
                                type="text"
                                id="tags"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                                className={tagInputStyle}
                                placeholder="e.g. react, seo, tutorial"
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className={`px-4 py-2 rounded-r-lg font-semibold transition-colors duration-200 ${isDark ? 'bg-cyan-600 text-white hover:bg-cyan-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Display current tags */}
                        <div className="mt-2 flex flex-wrap gap-2">
                            {tagsArray.map((tag, index) => (
                                <span key={index} className={`flex items-center text-xs px-3 py-1 rounded-full font-medium ${isDark ? 'bg-gray-700 text-cyan-400' : 'bg-blue-100 text-blue-800'}`}>
                                    {tag}
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveTag(tag)} 
                                        className={`ml-1 ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-blue-600 hover:text-red-600'}`}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Publish Status */}
                    <div>
                        <label htmlFor="status" className={labelStyle}>Publish Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className={inputStyle}
                        >
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                            <option value="Archived">Archived</option>
                        </select>
                    </div>

                    {/* Featured Checkbox */}
                    <div className="flex items-center pt-6">
                        <input
                            type="checkbox"
                            id="isFeatured"
                            name="isFeatured"
                            checked={formData.isFeatured}
                            onChange={(e) => handleChange({ target: { name: 'isFeatured', checked: e.target.checked } })}
                            className={`w-4 h-4 mr-2 ${isDark ? 'bg-gray-700 border-gray-500' : 'bg-gray-100 border-gray-300'} rounded text-blue-600 focus:ring-blue-500`}
                        />
                        <label htmlFor="isFeatured" className={labelStyle}>Mark as Featured Post</label>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BlogHeaderForm;