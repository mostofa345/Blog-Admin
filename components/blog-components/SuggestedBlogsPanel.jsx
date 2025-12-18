import React from "react";
import { ChevronDown, Loader2 } from "lucide-react";

// components/add-resource/SuggestedBlogsPanel.jsx


// components/add-resource/SuggestedBlogsCompactPanel.jsx

const SuggestedBlogsCompactPanel = ({ 
    suggestedBlogs = [], 
    suggestedBlogOptions = [], 
    handleSuggestedBlogsChange, 
    dataLoading,
    label = 'Suggested Resources' 
}) => {
    
    // Display name for the summary/arrow icon part
    const selectedCount = suggestedBlogs.length; 
    const summaryText = selectedCount > 0 
        ? `${selectedCount} ${label.replace('Suggested ', '')} Selected` 
        : `Select related ${label.toLowerCase().replace('suggested ', '')}`; 

    // ✅ NEW: Individual Checkbox Change Handler
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        handleSuggestedBlogsChange(value, checked); // Call parent handler
    };

    return (
        // 💡 Use <details> to create a native collapsible section
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
            
            {/* 2. Collapsible Content (Checkbox List Field) */}
            <div className="p-4 pt-0">
                <label htmlFor="suggestedResources" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label} Selection
                </label>
                
                {/* 💡 NEW: Checkbox List Container */}
                <div 
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 text-sm h-40 overflow-y-auto space-y-1 p-2"
                >
                    {dataLoading ? (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading {label}...
                        </div>
                    ) : suggestedBlogOptions.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            No {label.replace('Suggested ', '')} Found
                        </div>
                    ) : (
                        suggestedBlogOptions.map(option => (
                            <div key={option.id} className="flex items-center py-1">
                                <input
                                    type="checkbox"
                                    id={`suggested-resource-${option.id}`}
                                    value={option.id}
                                    checked={suggestedBlogs.includes(option.id)}
                                    onChange={handleCheckboxChange}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-600"
                                />
                                <label 
                                    htmlFor={`suggested-resource-${option.id}`} 
                                    className="ml-2 text-gray-700 dark:text-gray-300 cursor-pointer text-xs"
                                >
                                    {option.name}
                                </label>
                            </div>
                        ))
                    )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Tick the box next to the articles you want to suggest.</p>
            </div>
        </details>
    );
};

export default SuggestedBlogsCompactPanel;