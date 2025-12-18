"use client";
import React from "react";
import { Image as ImageIcon, Upload } from "lucide-react";

// --- Shared Form Field Components (Integrated from SharedFormFields to fix import error) ---
const baseInputClasses = "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200 text-sm";

const FormField = ({ label, id, value, onChange, placeholder = "", type = "text", required = false, hideLabel = false }) => ( // hideLabel added for robustness
    <div className="mb-4">
        {!hideLabel && ( // Conditionally render label
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
        )}
        {type === "textarea" ? (
            <textarea
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows="3"
                className={`${baseInputClasses} resize-y`}
            />
        ) : (
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={baseInputClasses}
            />
        )}
    </div>
);

const CheckboxField = ({ label, id, checked, onChange, description }) => (
    <div className="mb-4 flex flex-col justify-start">
        <div className="flex items-center">
            <input
                type="checkbox"
                id={id}
                name={id}
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
            />
            <label htmlFor={id} className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {label}
            </label>
        </div>
        {description && (
            <p className="ml-6 mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
        )}
    </div>
);
// --- End Shared Form Field Components ---


const ImageUploadField = ({ 
    label = "Cover Photo", // ✅ FIX: Added default value to prevent TypeError
    required = true, 
    file, 
    setFile, 
    setUrl, 
    url, 
    altText, 
    setAltText, 
    isNextImage, 
    setIsNextImage, 
    note 
}) => {
    // label এখন আর undefined হবে না, তাই .toLowerCase() কল করলে TypeError আসবে না
    const fileId = `image-upload-${label.toLowerCase().replace(/\s/g, '-')}`; 

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            setUrl(''); // ফাইল সিলেক্ট হলে URL ফিল্ড খালি করা 
        }
    };
    
    // ফাইল প্রিভিউ ইউআরএল
    const previewUrl = file ? URL.createObjectURL(file) : (url || '');

    return (
        <div className="mb-4 p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500"/>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            
            <div className="flex items-center space-x-2 mb-4">
                {/* URL Input */}
                <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                        setUrl(e.target.value);
                        setFile(null); // URL ইনপুট করলে ফাইল খালি করা 
                    }}
                    placeholder="... or paste Image URL here"
                    required={required && !file} // ফাইল থাকলে URL প্রয়োজন নেই
                    className={baseInputClasses}
                />
                
                {/* Browse Button */}
                <label htmlFor={fileId} className="flex items-center justify-center p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md transition-colors duration-200 whitespace-nowrap dark:bg-blue-500 dark:hover:bg-blue-600 text-sm">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload
                </label>
                <input
                    type="file"
                    id={fileId}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            
            {/* Alt Text and Next Image Options */}
            {(setAltText && setIsNextImage) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="md:col-span-2">
                        <FormField
                            label="Image Alt Text (SEO Friendly)"
                            id={`${fileId}-alt`}
                            value={altText}
                            onChange={(e) => setAltText(e.target.value)}
                            placeholder="Describe the image content for screen readers and SEO"
                            required={false}
                        />
                    </div>
                    <CheckboxField
                        label="Use Next Image Optimization"
                        id={`${fileId}-next`}
                        checked={isNextImage}
                        onChange={(e) => setIsNextImage(e.target.checked)}
                        description="Faster loading for article images (LCP focus)."
                    />
                </div>
            )}
            
            {/* File/URL Name Display & Note */}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {(file || url) ? (
                    <span className={`font-medium ${file ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
                        {file ? `Selected File: ${file.name}` : `Using URL: ${url.substring(0, 50)}...`}
                    </span>
                ) : (
                    "Choose an image or paste a URL."
                )}
                <br/>
                <span className="text-orange-500 font-medium">{note}</span> (Recommended ratio: 16:9 or 4:3)
            </p>

            {/* Image Preview */}
            {previewUrl && (
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image Preview</label>
                    <img 
                        src={previewUrl} 
                        alt={altText || "Image Preview"} 
                        className="max-w-full h-auto max-h-48 rounded-md shadow-md object-cover border border-gray-300 dark:border-gray-600" 
                    />
                </div>
            )}
        </div>
    );
};

export default ImageUploadField;