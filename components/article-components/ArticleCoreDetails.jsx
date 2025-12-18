import React, { useCallback, useState } from "react";
import { Calendar, Clock, Pencil, X } from "lucide-react";
import { FormField } from "./SharedFormFields";

// components/add-resource/ArticleCoreDetails.jsx

// 💡 CRITICAL CHANGE: handlePermalinkChange prop is now handleSlugChange
const ArticleCoreDetails = ({ formData, handleChange, updateFormData, handleSlugChange }) => {
    // 💡 Main Keywords/Tags Logic (Managed internally, but updates parent formData)
    const [tagInput, setTagInput] = useState('');
    
    // Convert comma-separated string from formData to an array for display
    const tagsArray = Array.isArray(formData.mainKeywords) 
        ? formData.mainKeywords 
        : formData.mainKeywords 
            ? formData.mainKeywords.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) 
            : [];

    const handleTagInput = (e) => {
        setTagInput(e.target.value);

        // Check for Enter or comma
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault(); 
            const newTag = tagInput.trim().replace(/,/g, '');
            if (newTag && !tagsArray.includes(newTag)) {
                const newTagsArray = [...tagsArray, newTag];
                updateFormData('mainKeywords', newTagsArray); // Update parent state
            }
            setTagInput('');
        }
    };
    
    const removeTag = (tagToRemove) => {
        const newTagsArray = tagsArray.filter(tag => tag !== tagToRemove);
        updateFormData('mainKeywords', newTagsArray); // Update parent state
    };


    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                <Pencil className="w-5 h-5 mr-2" />
                Article Core Details
            </h2>

            {/* 1. Article Title Field */}
            <FormField
                label="Article Title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter article title"
                required={true}
            />

            {/* 2. Article URL Slug / Permalink Field */}
            <div className="mt-4">
                <label 
                    htmlFor="slug" // 💡 Change ID
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                    Article URL Slug / Permalink
                </label>
                <div className="flex rounded-lg shadow-sm">
                    {/* Assumed base URL prefix */}
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                        {/* 💡 Placeholder URL, change this to your actual base domain if needed */}
                        https://your-domain.com/
                    </span>
                    <input
                        type="text"
                        id="slug" // 💡 Change ID
                        name="slug" // 💡 Change Name
                        value={formData.slug} // 💡 Change Value
                        // 💡 CRITICAL CHANGE: Use the specific handler for slugify logic
                        onChange={(e) => handleSlugChange(e.target.value)} 
                        placeholder="a-nice-readable-slug"
                        className="flex-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200 text-sm"
                    />
                </div>
            </div>

            {/* 3. Main Keywords / Tags Input */}
            <div className="mt-4">
                <label 
                    htmlFor="tagInput" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                    Main Keywords / Tags (Enter to add)
                </label>
                <input
                    type="text"
                    id="tagInput"
                    value={tagInput}
                    onChange={handleTagInput}
                    onKeyDown={handleTagInput} // Handles 'Enter' key press
                    placeholder="tag1, tag2, tag3"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-colors duration-200 text-sm"
                />
                
                {/* Tag Display Area */}
                <div className="mt-2 flex flex-wrap gap-2">
                    {tagsArray.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full dark:bg-indigo-900 dark:text-indigo-200">
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-2 -mr-1 text-indigo-500 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </span>
                    ))}
                </div>
            </div>
            
            {/* 4. Author, Read Time, Published Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <FormField
                    label="Author Name"
                    id="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Admin"
                    required={false}
                />
                <FormField
                    label="Read Time (Minutes)"
                    id="readTime"
                    type="number"
                    value={formData.readTime}
                    onChange={handleChange}
                    placeholder="5"
                    required={true}
                    icon={<Clock className="w-4 h-4 text-gray-400" />}
                />
                <FormField
                    label="Published Date"
                    id="publishedDate"
                    type="date"
                    value={formData.publishedDate}
                    onChange={handleChange}
                    required={false}
                    icon={<Calendar className="w-4 h-4 text-gray-400" />}
                />
            </div>
        </div>
    );
};

export default ArticleCoreDetails;