import React from "react";
import { Calendar, Check, Clock, FileText, Link as LinkIcon, List, Pencil, X } from "lucide-react";
import { CheckboxField, FormField, FormSelect } from "./SharedFormFields";

// components/add-resource/ArticleMetadataForm.jsx


/**
 * আর্টিকেল মেটাডেটা এবং কনফিগারেশন ফর্ম (SEO প্যানেলের বাইরে)
 * @param {object} props
 * @param {object} props.formData - আর্টিকেল ডেটার স্টেট
 * @param {function} props.handleInputChange - সাধারণ ইনপুট হ্যান্ডলার
 * @param {Array<object>} props.categories - API থেকে লোড করা ক্যাটেগরি লিস্ট
 * @param {Array<object>} props.sidebars - API থেকে লোড করা সাইডবার মেনু লিস্ট
 * @param {function} props.handleToggleChange - Checkbox হ্যান্ডলার
 * @param {boolean} props.isEditMode - এডিট মোড কিনা
 * @param {function} props.handlePermalinkChange - পার্মালিংক ইনপুট হ্যান্ডলার
 * @param {function} props.generatePermalink - পার্মালিংক জেনারেট ফাংশন
 * @param {string} props.permalinkStatus - পার্মালিংক স্ট্যাটাস
 */
const ArticleMetadataForm = ({
    formData,
    handleInputChange,
    categories,
    sidebars,
    handleToggleChange,
    isEditMode,
    handlePermalinkChange,
    generatePermalink,
    permalinkStatus,
}) => {
    
    // ক্যাটেগরি এবং সাইডবারের জন্য অপশন লিস্ট তৈরি
    const categoryOptions = categories.map(cat => ({ id: cat.slug, name: cat.name }));
    const sidebarOptions = sidebars.map(sb => ({ id: sb.id, name: sb.name }));

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Article Core Details
            </h2>

            {/* 1. Title */}
            <FormField
                label="Article Title"
                id="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="The Ultimate Guide to Instagram Marketing"
                required={true}
                maxLength={100}
            />

            {/* 2. Permalink / Slug */}
            <div className="flex gap-4">
                <FormField
                    label="Permalink / Slug"
                    id="permalink"
                    value={formData.permalink}
                    onChange={handlePermalinkChange}
                    placeholder="instagram-marketing-strategy"
                    required={true}
                    maxLength={150}
                    className="flex-grow"
                >
                    <div className="relative">
                        <input
                            type="text"
                            id="permalink"
                            value={formData.permalink}
                            onChange={handlePermalinkChange}
                            placeholder="instagram-marketing-strategy"
                            required={true}
                            maxLength={150}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200 text-sm pr-12"
                        />
                        <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium ${
                            permalinkStatus === 'Valid' ? 'text-green-500' : 
                            permalinkStatus === 'Invalid' ? 'text-red-500' : 
                            'text-yellow-500'
                        }`}>
                            {permalinkStatus === 'Valid' ? <Check className="w-5 h-5" /> : 
                             permalinkStatus === 'Invalid' ? <X className="w-5 h-5" /> : 
                             <LinkIcon className="w-5 h-5" />}
                        </span>
                    </div>
                </FormField>
                <div className="self-end mb-4">
                    <button
                        type="button"
                        onClick={generatePermalink}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition font-semibold text-sm h-[42px]"
                    >
                        Generate
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 3. Author Name */}
                <FormField
                    label="Author Name"
                    id="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="e.g., Shuvro Sen"
                    required={true}
                />

                {/* 4. Read Time */}
                <FormField
                    label="Read Time (mins)"
                    id="readTime"
                    type="number"
                    value={formData.readTime}
                    onChange={handleInputChange}
                    placeholder="e.g., 7"
                    required={true}
                />
                
                {/* 5. Publication Date */}
                <FormField
                    label="Published Date"
                    id="publishedDate"
                    type="date"
                    value={formData.publishedDate}
                    onChange={handleInputChange}
                    required={true}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 6. Status */}
                <FormSelect
                    label="Status"
                    id="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    options={[
                        { id: 'Draft', name: 'Draft (Unpublished)' },
                        { id: 'Published', name: 'Published (Live)' },
                    ]}
                    defaultOptionText="Select Status"
                    required={true}
                />

                {/* 7. Category */}
                <FormSelect
                    label="Category"
                    id="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    options={categoryOptions}
                    defaultOptionText="Select Category"
                    required={true}
                />

                {/* 8. Sidebar Config */}
                <FormSelect
                    label="Sidebar Menu"
                    id="sidebarConfig"
                    value={formData.sidebarConfig}
                    onChange={handleInputChange}
                    options={sidebarOptions}
                    defaultOptionText="Select Sidebar Menu"
                    required={false}
                />
            </div>

            {/* 9. Robots.txt Meta Tag */}
            <div className="md:w-1/3">
                <FormSelect
                    label="Robots.txt Meta Tag"
                    id="robotsTxt"
                    value={formData.robotsTxt}
                    onChange={handleInputChange}
                    options={[
                        { id: 'index, follow', name: 'Index, Follow (Default)' },
                        { id: 'noindex, follow', name: 'No Index, Follow' },
                        { id: 'index, nofollow', name: 'Index, No Follow' },
                        { id: 'noindex, nofollow', name: 'No Index, No Follow' },
                    ]}
                    defaultOptionText="Select Indexing Rule"
                    required={true}
                />
            </div>
            
            {/* Lazy Load Checkbox for Cover Photo (Should be moved to ImageUploadField but kept here for now) */}
            {/* Note: In a production app, the isLazyLoad checkbox is usually inside the ImageUploadField. */}
            {/* <CheckboxField
                label="Lazy Load Cover Photo"
                id="isLazyLoad"
                checked={formData.isLazyLoad}
                onChange={(e) => handleToggleChange('isLazyLoad', e.target.checked)}
                description="Faster loading for article images (LCP focus)."
            /> */}
        </div>
    );
};

export default ArticleMetadataForm;