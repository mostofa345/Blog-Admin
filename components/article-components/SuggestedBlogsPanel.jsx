import React from "react";
import { CheckCircle, ChevronDown, Square } from "lucide-react";

// components/article-components/SuggestedBlogsPanel.jsx

// ✅ NEW: SuggestedBlogsPanel কম্পোনেন্ট এখন চেকবক্স লজিক ব্যবহার করবে
const SuggestedBlogsPanel = ({ 
    suggestedBlogs = [], // বর্তমানে নির্বাচিত ব্লগ আইডিগুলির অ্যারে
    suggestedBlogOptions = [], // নির্বাচনের জন্য উপলব্ধ সমস্ত ব্লগের অ্যারে ({ id, name })
    handleSuggestedBlogsChange, // নতুন চেকবক্স-ভিত্তিক হ্যান্ডলার
    dataLoading,
    label = 'Suggested Resources' 
}) => {
    
    const selectedCount = suggestedBlogs.length; 
    const resourceType = label.replace('Suggested ', ''); // e.g., 'Blogs'
    
    const summaryText = selectedCount > 0 
        ? `${selectedCount} ${resourceType} Selected`
        : `Select related ${resourceType.toLowerCase()}`;

    // চেকবক্সের জন্য নতুন হ্যান্ডলার, যা আইডি এবং চেকবক্সের অবস্থা (checked) গ্রহণ করে
    const handleCheckboxChange = (id, checked) => {
        handleSuggestedBlogsChange(id, checked);
    };

    return (
        <details className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            
            {/* 1. Panel Header (summary) */}
            <summary 
                className={`flex items-center justify-between cursor-pointer text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100 border-b pb-2 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 -m-6 p-6 rounded-t-xl ${selectedCount > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-100'}`}
            >
                <div className="flex items-center gap-2">
                    <ChevronDown className="w-5 h-5 text-red-500 details-arrow" />
                    5. {label}
                </div>
                {/* Selection Summary Badge */}
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${selectedCount > 0 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {summaryText}
                </span>
            </summary>
            
            {/* 2. Collapsible Content (Checkbox List) */}
            <div className="pt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select the {resourceType.toLowerCase()} you wish to link as suggested reading:
                </p>
                
                {dataLoading && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading {resourceType}...</div>
                )}
                
                {!dataLoading && suggestedBlogOptions.length === 0 && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">No {resourceType} Found to Suggest.</div>
                )}

                {!dataLoading && suggestedBlogOptions.length > 0 && (
                    <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                        {suggestedBlogOptions.map(option => {
                            const isSelected = suggestedBlogs.includes(option.id);
                            return (
                                <div 
                                    key={option.id} 
                                    className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-all duration-150 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-300 dark:border-indigo-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    onClick={() => handleCheckboxChange(option.id, !isSelected)}
                                >
                                    <input
                                        type="checkbox"
                                        id={`suggested-blog-${option.id}`}
                                        checked={isSelected}
                                        onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}
                                        className="hidden" // Hiding the native checkbox
                                    />
                                    
                                    {/* Custom Checkbox Icon */}
                                    {isSelected ? (
                                        <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                                    ) : (
                                        <Square className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                    )}

                                    <label 
                                        htmlFor={`suggested-blog-${option.id}`} 
                                        className={`text-sm flex-1 ${isSelected ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-800 dark:text-gray-200'}`}
                                    >
                                        {option.name}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Select or deselect any blog title to manage your suggested resources.
                </p>
            </div>
        </details>
    );
};

export default SuggestedBlogsPanel;