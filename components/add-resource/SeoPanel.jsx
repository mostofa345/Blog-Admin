import React from "react";
import { Zap } from "lucide-react";
import { FormField, TextAreaField } from "./SharedFormFields";

// app/add-resource/components/SeoPanel.jsx

// SEO Score Color Helper (আপনার দেওয়া লজিক)
const getScoreStyles = (score) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 50) return "bg-yellow-600";
    return "bg-red-600";
};

// ✅ FIX: props-এ `updateFormData` যোগ করা হয়েছে এবং `seoKeyword` এর পরিবর্তে 
// `formData.focusKeyword` ব্যবহার করা হয়েছে।
const SeoPanel = ({ formData, handleChange, updateFormData, seoScore }) => {
    return (
        <>
            <h2 className="text-xl font-semibold mb-6 mt-8 text-gray-900 dark:text-gray-100 border-b pb-2 dark:border-gray-700 flex items-center justify-between">
                <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    SEO Optimization Tools
                </span>
                {/* SEO Score Display */}
                <div className="text-sm font-bold flex items-center gap-2 px-3 py-1 rounded-full text-white" style={{ backgroundColor: getScoreStyles(seoScore) }}>
                    SEO Score: {seoScore}%
                </div>
            </h2>
            
            {/* ✅ Focus Keyword - এখন updateFormData ব্যবহার করে এরর ফিক্স করা হয়েছে */}
            <FormField
                label="Focus SEO Keyword"
                id="focusKeyword" // এই id-তেই formData-তে সেভ হবে
                value={formData.focusKeyword || ''}
                // ERROR FIX: updateFormData ব্যবহার করা হয়েছে
                onChange={(e) => updateFormData('focusKeyword', e.target.value)} 
                placeholder="e.g., আলিয়া মাদ্রাসা অনার্স কোর্স"
                required={false}
            />
            
            <FormField
                label="Meta Title (For Search Engine, Max 60 chars)"
                id="metaTitle"
                value={formData.metaTitle}
                // ✅ ERROR FIX: setMetaTitle-এর পরিবর্তে handleChange ব্যবহার করা হয়েছে
                onChange={handleChange} 
                placeholder="Your SEO Optimized Title"
                required={false}
                maxLength={60}
            />
            
            <TextAreaField
                label="Meta Description (For Search Engine, Max 158 chars)"
                id="metaDescription"
                value={formData.metaDescription}
                // ✅ ERROR FIX: setMetaDescription-এর পরিবর্তে handleChange ব্যবহার করা হয়েছে
                onChange={handleChange} 
                placeholder="Your search-engine-optimized description."
                required={false}
                rows={2}
                maxLength={158}
            />
        </>
    );
};

export default SeoPanel;