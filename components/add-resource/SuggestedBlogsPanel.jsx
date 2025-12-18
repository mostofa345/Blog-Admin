import React from "react";
import { ChevronDown } from "lucide-react";

// components/add-resource/SuggestedBlogsPanel.jsx


// components/add-resource/SuggestedBlogsCompactPanel.jsx

const SuggestedBlogsCompactPanel = ({ 
    suggestedBlogs = [], 
    suggestedBlogOptions = [], // ✅ FIX: Added default empty array to solve TypeError: Cannot read properties of undefined (reading 'length')
    handleSuggestedBlogsChange, 
    dataLoading,
    label = 'Suggested Resources' // ✅ NEW: Dynamic label support
}) => {
    
    // Display name for the summary/arrow icon part
    const selectedCount = suggestedBlogs.length; 
    const summaryText = selectedCount > 0 
        ? `${selectedCount} ${label.replace('Suggested ', '')} Selected` // e.g., 'Blogs Selected'
        : `Select related ${label.toLowerCase().replace('suggested ', '')}`; // e.g., 'Select related blogs'

    return (
        // 💡 Use <details> to create a native collapsible section, mimicking a compact dropdown look
        <details className="mb-4 mt-4 relative w-full border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200">
            
            {/* 1. Compact Header/Arrow Icon (summary) */}
            <summary 
                className={`flex items-center justify-between p-4 cursor-pointer text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg ${selectedCount > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-200'}`}
            >
                <div className="flex items-center gap-2">
                    {summaryText}
                </div>
                {/* Dynamic Chevron based on details open state (handled by browser) */}
                <span className="details-arrow">
                    <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </span>
            </summary>
            
            {/* 2. Collapsible Content (Select Field) */}
            <div className="p-4 pt-0">
                <label htmlFor="suggestedResources" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label} Selection
                </label>
                
                {/* 💡 The actual Multi-Select element is here */}
                <select
                    multiple
                    id="suggestedResources" // ✅ Changed ID to suggestedResources for unification
                    name="suggestedResources"
                    value={suggestedBlogs} 
                    onChange={handleSuggestedBlogsChange} 
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 text-sm h-40"
                    disabled={dataLoading || suggestedBlogOptions.length === 0}
                >
                    <option value="" disabled>
                        {dataLoading ? `Loading ${label}...` : (suggestedBlogOptions.length === 0 ? `No ${label.replace('Suggested ', '')} Found` : `Select 0 or more related ${label.replace('Suggested ', '')}`)}
                    </option>
                    {suggestedBlogOptions.map(option => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Hold Ctrl or Cmd to select multiple titles.</p>
            </div>
        </details>
    );
};

export default SuggestedBlogsCompactPanel;