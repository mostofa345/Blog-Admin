"use client";
import AdvancedSEOSchemaTechnical from "../../../../components/article-components/AdvancedSEOSchemaTechnical";
import ArticleCoreDetails from "../../../../components/article-components/ArticleCoreDetails";
import ArticleLivePreview from "../../../../components/article-components/ArticleLivePreview";
import ImageUploadField from "../../../../components/article-components/ImageUploadField";
import Link from "next/link";
import LiveSeoAnalyzer from "../../../../components/article-components/LiveSeoAnalyzer";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SeoPanel from "../../../../components/article-components/SeoPanel";
import SuggestedBlogsPanel from "../../../../components/article-components/SuggestedBlogsPanel";
import dynamic from "next/dynamic";
import slugify from "slugify";
import { AlertTriangle, BookOpen, Calendar, Check, Clock, FileText, Link as LinkIcon, List, Loader2, Monitor, Pencil, Plus, Save, Trash2, Type as TypeIcon, Upload, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

// import RichTextEditor from "../../../../components/article-components/RichTextEditor"; // <--- REMOVED direct import

// --- FIX 1: Dynamic Import for RichTextEditor to fix Hydration Mismatch ---
// TinyMCE generates a dynamic ID, which causes the mismatch.
// Disabling SSR ensures it only renders client-side.
const DynamicRichTextEditor = dynamic(
    () => import("../../../../components/article-components/RichTextEditor"),
    { ssr: false } // <--- FIX: Disable Server-Side Rendering
);


// page.jsx (Updated with Destination Tab and Is Latest Article fields)

// ✅ NOTE: Article এর জন্য Suggested Blogs দেখানো হবে

// --- Custom Components (from components/add-resource/) ---
import { 
    FormField, 
    TextAreaField, 
    SelectField as FormSelect, 
    CheckboxField 
} from "../../../../components/article-components/SharedFormFields"; 

// --- API Configuration ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';

// ✅ FIX: শুধুমাত্র Article API URL ব্যবহার করা হচ্ছে
const CREATE_ARTICLE_API_URL = `${API_BASE_URL}/article`; // articleRoute: '/api/article'

// ✅ NEW API URL: Destination Tabs API
const DESTINATION_TABS_API_URL = `${API_BASE_URL}/tabs`; 

// ✅ KEPT: Category Article এর জন্য আবশ্যক
const CATEGORY_API_URL = `${API_BASE_URL}/categories`; 
// ✅ KEPT: Suggested Resources হিসেবে Blog List
const BLOG_LIST_API = `${API_BASE_URL}/blog/list`;      
const ARTICLE_MEDIA_UPLOAD_API = `${API_BASE_URL}/article/upload-editor-media`; // ✅ FIX: API URL-কে সঠিক করে দেওয়া হলো
// ----------------------------------------------------------------------
// Initial State & Helpers
// ----------------------------------------------------------------------
const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().substring(0, 10); 
};
const today = getCurrentDate();


// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------

export default function CreateContentPage() {
    const router = useRouter();
    // ✅ FIX: contentType ডিফল্টভাবে 'Article' সেট করা হলো
    const [contentType, setContentType] = useState('Article'); 

    // API থেকে আসা ডেটার স্টেট
    // ✅ KEPT: categories স্টেট
    const [categories, setCategories] = useState([]); 
    // ✅ NEW STATE: Destination Tabs স্টেট
    const [destinationTabs, setDestinationTabs] = useState([]);
    
    const [allResourcesList, setAllResourcesList] = useState([]); 
    
    const [focusKeyword, setFocusKeyword] = useState(''); 
    
    // 💡 Updated formData structure
    const [formData, setFormData] = useState({
        // Core & SEO
        title: '',
        expertSummary: '', 
        mainKeywords: [], 
        permalink: '', 
        metaTitle: '',
        metaDescription: '',
        keywords: '', 
        robotsTxt: 'index, follow', 
        
        // Advanced SEO & Schema Fields
        schemaType: 'Article', // ✅ FIX: ডিফল্ট 'Article'
        canonicalUrl: '', 
        redirectTarget: '', 
        isPillarContent: 'no', 
        faqEntries: [{ question: '', answer: '', id: Date.now() + 3 }], 

        focusKeyword: '', 

        // Content Metadata
        author: 'Admin', 
        readTime: '5', 
        publishedDate: today, 

        // Configuration (Conditional Fields)
        category: '', // ✅ KEPT: Article এর জন্য Category লাগবে
        
        // ✅ NEW FIELD 1: Optional Destination Tab
        destinationTab: '', // Article-কে একটি নির্দিষ্ট ডেস্টিনেশন ট্যাবের সাথে যুক্ত করার জন্য
        
        // ✅ NEW FIELD 2: Optional Latest Article Flag
        isLatest: false, // Article-কে "Latest" সেকশনে দেখানোর জন্য

        // Image Upload
        coverPhotoFile: null, 
        coverPhotoUrl: '', 
        coverPhotoAlt: '', 
        isLazyLoad: false, 
        
        // Content
        articleContent: '', 
        
        // Structure (TOC and Guide Links removed from state)
        suggestedResources: [], // ✅ UPDATE: এখন এটি নির্বাচিত ব্লগের আইডিগুলির অ্যারে রাখবে

        status: 'Draft', 
        seoScore: 0,
    });
    
    const [loading, setLoading] = useState(false); 
    const [dataLoading, setDataLoading] = useState(true); 
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [previewMode, setPreviewMode] = useState('desktop'); 

    // ----------------------------------------------------------------------
    // Handlers
    // ----------------------------------------------------------------------
    const handleChange = useCallback((e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => {
            const newValue = type === 'checkbox' ? checked : value;
            return {
                ...prev,
                [id]: newValue,
            };
        });
    }, []);
    
    const updateFormData = useCallback((id, value) => {
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
        if (id === 'focusKeyword') {
            setFocusKeyword(value);
        }
    }, [setFocusKeyword]);

    const handleRichTextChange = (content) => {
        updateFormData('articleContent', content);
    };
    
    // ✅ UPDATE: Suggested Resources চেকবক্স হ্যান্ডলার
    const handleSuggestedResourcesChange = useCallback((id, isChecked) => {
        setFormData(prev => {
            let newSuggestedResources = [...prev.suggestedResources];
            
            if (isChecked) {
                // Checkbox checked: Add ID if not already present
                if (!newSuggestedResources.includes(id)) {
                    newSuggestedResources.push(id);
                }
            } else {
                // Checkbox unchecked: Remove ID from the array
                newSuggestedResources = newSuggestedResources.filter(resourceId => resourceId !== id);
            }

            return {
                ...prev,
                suggestedResources: newSuggestedResources,
            };
        });
    }, []);


    const setImageFile = (file) => updateFormData('coverPhotoFile', file);
    const setImageUrl = (url) => updateFormData('coverPhotoUrl', url);
    const setImageAltText = (alt) => updateFormData('coverPhotoAlt', alt);
    const setIsNextImage = (isNext) => updateFormData('isLazyLoad', !isNext); 
    
    // --- FAQ Handlers (UNCHANGED) ---
    const handleFAQChange = (id, field, value) => {
        setFormData(prev => ({ 
            ...prev, 
            faqEntries: prev.faqEntries.map(faq => 
                faq.id === id ? { ...faq, [field]: value } : faq
            )
        }));
    };

    const addFAQ = () => {
        setFormData(prev => ({ 
            ...prev, 
            faqEntries: [...prev.faqEntries, { question: '', answer: '', id: Date.now() + Math.random() }] 
        }));
    };

    const removeFAQ = (id) => {
        setFormData(prev => ({ 
            ...prev, 
            faqEntries: prev.faqEntries.filter(faq => faq.id !== id) 
        }));
    };

    // ----------------------------------------------------------------------
    // API Data Fetching (Article-specific logic)
    // ----------------------------------------------------------------------
    useEffect(() => {
        const fetchExternalData = async () => {
            if (!API_BASE_URL) {
                console.error("API_BASE_URL is not configured.");
                setDataLoading(false);
                return;
            }
            
            // ✅ FIX: `fetch(CATEGORY_API_URL)`-কে আলাদাভাবে রাখা হলো
            const fetchPromises = [
                // 1. Categories - Article এর জন্য আবশ্যক
                fetch(CATEGORY_API_URL).then(res => {
                    if (!res.ok) throw new Error(`Category API failed with status ${res.status}`);
                    return res.json();
                }),
                
                // 2. Blogs List (Suggested Resources এর জন্য)
                // ✅ FIX: Limit & status added to blog list API for comprehensive list
                fetch(`${BLOG_LIST_API}?limit=9999&status=Published`).then(res => { 
                    if (!res.ok) throw new Error(`Blog List API failed with status ${res.status}`);
                    return res.json();
                }),
                
                // ✅ NEW FETCH: Destination Tabs
                fetch(DESTINATION_TABS_API_URL).then(res => {
                    if (!res.ok) throw new Error(`Destination Tabs API failed with status ${res.status}`);
                    return res.json();
                }),
            ];

            try {
                // ✅ FIX: fetchPromises-এর রেজাল্ট অনুযায়ী destructuring করা হলো (৩টি রেজাল্ট)
                const [categoryRes, blogRes, tabsRes] = await Promise.all(fetchPromises);

                // 1. Categories Mapping Logic
                const categoryData = categoryRes.data || categoryRes;
                if (Array.isArray(categoryData)) {
                    setCategories(categoryData.map(c => ({
                        // _id বা id/slug যেটি থাকে, সেটি ব্যবহার করা হচ্ছে
                        id: c._id || c.id || c.slug, 
                        name: c.name || c.title || 'Untitled Category'
                    })));
                } else {
                    console.error("Category API response format is incorrect:", categoryRes);
                }
                
                // ✅ NEW LOGIC: Destination Tabs Mapping Logic
                const tabsData = tabsRes.data || tabsRes;
                // 'Explore all' tab-টিকে বাদ দেওয়া হলো কারণ এটি শুধু filtering-এর জন্য
                if (Array.isArray(tabsData)) {
                    setDestinationTabs(tabsData.filter(t => t.name !== 'Explore all').map(t => ({
                        // Destination tab-এর ক্ষেত্রে _id ব্যবহার করা উচিত
                        id: t._id || t.id, 
                        name: t.name
                    })));
                } else {
                    console.error("Destination Tabs API response format is incorrect:", tabsRes);
                }


                // 2. All Resources List (Suggested Resources) - Combining Articles and Blogs
                let combinedResources = [];
                
                // ✅ FIX: Safely accessing blog data
                const blogData = blogRes.data && blogRes.data.list ? blogRes.data.list : blogRes.data || blogRes;
                
                if (Array.isArray(blogData)) {
                    combinedResources = [...combinedResources, ...blogData.map(r => ({
                        id: r.permalink || r._id, // ✅ FIX: ID হিসেবে _id/permalink ব্যবহার করা
                        name: r.title || 'Untitled Blog',
                        type: 'Blog' 
                    }))];
                }

                setAllResourcesList(combinedResources);

            } catch (err) {
                console.error("Error fetching initial data:", err);
                // ✅ FIX: Error message updated to reflect what was actually fetched
                setError(`Failed to load essential data (Categories, Suggested Blogs, Destination Tabs). Check network and API configuration.`); 
            } finally {
                setDataLoading(false);
            }
        };

        fetchExternalData();
    }, []);

    // ----------------------------------------------------------------------
    // Derived State & Submission (Article-specific logic)
    // ----------------------------------------------------------------------
    const suggestedResourceOptions = useMemo(() => {
        // ✅ FIX: Article বানালে শুধু Blog দেখাবে
        const targetType = 'Blog'; 
        
        return allResourcesList
            // টাইপ অনুযায়ী ফিল্টার করা হচ্ছে
            .filter(res => res.type === targetType)
            // অপশন ফরম্যাট করা হচ্ছে
            .map(res => ({ 
                id: res.id, 
                name: `${res.type}: ${res.name} (ID: ${res.id})` // 💡 ID for easy debugging
            }));
    }, [allResourcesList]); 
    
    const suggestedResourceLabel = useMemo(() => {
        // ✅ FIX: ফিক্সড লেবেল 'Suggested Blogs'
        return 'Suggested Blogs';
    }, []); 

    const destinationTabOptions = useMemo(() => {
        const defaultOption = { id: '', name: '— None (Optional) —' };
        
        const options = destinationTabs.map(tab => ({
            id: tab.id, 
            name: tab.name 
        }));
        
        return [defaultOption, ...options];
    }, [destinationTabs]);

    const handleSubmit = async (e, finalStatus) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);
        
        const payload = new FormData();

        const processedMainKeywords = Array.isArray(formData.mainKeywords) ? formData.mainKeywords : [];

        const finalFormData = {
            ...formData,
            contentType: 'Article', // ✅ FIX: ফিক্সড 'Article'
            mainKeywords: processedMainKeywords, 
            status: finalStatus, 
            faqEntries: formData.schemaType === 'FAQPage' ? formData.faqEntries : [],
            suggestedBlogs: formData.suggestedResources, // ✅ FIX: API-তে 'suggestedBlogs' নামে যাচ্ছে 
            
            // ✅ NEW FIELDS FOR API:
            destinationTab: formData.destinationTab || undefined, // যদি ফাঁকা থাকে, তবে undefined পাঠাবে
            isLatest: formData.isLatest, // boolean হিসাবে যাবে
        };
        
        // ❌ REMOVED: subcategory ফিল্ড রিমুভ করা হলো
        delete finalFormData.subcategory; 
        
        // ❌ REMOVED: suggestedResources-কে suggestedBlogs-এ ম্যাপ করা হয়েছে, তাই মূলটি মুছে ফেলা হলো
        delete finalFormData.suggestedResources;
        
        // ✅ FIX: destinationTab যদি ফাঁকা স্ট্রিং হয়, তবে তা payload থেকে বাদ দেওয়া উচিত
        if (finalFormData.destinationTab === '') {
            delete finalFormData.destinationTab;
        }


        for (const key in finalFormData) {
            if (key === 'coverPhotoFile') continue;
            
            if (Array.isArray(finalFormData[key]) || (typeof finalFormData[key] === 'object' && finalFormData[key] !== null && key !== 'coverPhotoFile' && key !== 'coverPhotoFile')) {
                payload.append(key, JSON.stringify(finalFormData[key]));
            } else {
                // boolean value-এর জন্য stringify করা প্রয়োজন নেই
                payload.append(key, finalFormData[key]);
            }
        }

        if (formData.coverPhotoFile) {
            payload.append('coverPhotoFile', formData.coverPhotoFile);
        }

        try {
            // ✅ FIX: শুধুমাত্র Article API URL ব্যবহার করা হলো
            const response = await fetch(CREATE_ARTICLE_API_URL, { 
                method: 'POST',
                body: payload, 
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Failed to submit article.');
            }

            const resourceType = 'Article'; // ✅ FIX: ফিক্সড
            setSuccessMessage(`${resourceType} successfully ${finalStatus === 'Published' ? 'published' : 'saved as draft'}!`);
            
            // ✅ FIX: Successful submission এর পর ফর্ম ডেটা রিসেট করা হলো (ঐচ্ছিক, তবে ভালো প্র্যাকটিস)
            setFormData(prev => ({
                ...prev,
                title: '',
                expertSummary: '',
                permalink: '',
                metaTitle: '',
                metaDescription: '',
                keywords: '',
                focusKeyword: '',
                articleContent: '',
                coverPhotoFile: null,
                coverPhotoUrl: '',
                suggestedResources: [],
                mainKeywords: [],
                faqEntries: [{ question: '', answer: '', id: Date.now() + 3 }],
                // Retain category, author, readTime, publishedDate, robotsTxt, isLatest, destinationTab for quick reuse of metadata
            }));
            setFocusKeyword('');

        } catch (err) {
            console.error("Submission Error:", err);
            setError(err.message || "An unexpected error occurred during submission.");
        } finally {
            setLoading(false);
        }
    };


    // ----------------------------------------------------------------------
    // Main Render (Article-specific UI changes)
    // ----------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
            <header className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-red-600 dark:text-red-400">
                    <Pencil className="inline w-7 h-7 mr-2" />
                    Create New Article
                </h1>
                <div className="flex space-x-3">
                    <Link 
                        href="/admin/content-management/article-list" 
                        className="flex items-center text-sm font-semibold px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition"
                    >
                        <List className="w-4 h-4 mr-2" />
                        Articles
                    </Link>
                    <Link 
                        href="/admin/content-management/blog-list" 
                        className="flex items-center text-sm font-semibold px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition"
                    >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Blogs
                    </Link>
                </div>
            </header>

            {dataLoading && (
                <div className="flex justify-center items-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                    <Loader2 className="w-8 h-8 mr-3 animate-spin text-red-500" />
                    <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading essential data...</span>
                </div>
            )}
            {!dataLoading && error && (
                <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-300 flex items-center shadow-lg">
                    <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <p className="font-medium">Error: {error}</p>
                </div>
            )}
            {!dataLoading && successMessage && (
                <div className="p-4 mb-4 bg-green-100 border border-green-400 text-green-700 rounded-lg dark:bg-green-900 dark:border-green-700 dark:text-green-300 flex items-center shadow-lg">
                    <Check className="w-5 h-5 mr-3 flex-shrink-0" />
                    <p className="font-medium">{successMessage}</p>
                </div>
            )}
            

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    
                    {/* ❌ REMOVED: 1. Content Type Selector Section (Hidden for fixed Article) */}
                    <div className="hidden">
                        <FormSelect
                            id="contentType"
                            label="Content Type"
                            value={contentType}
                            options={[
                                { id: 'Article', name: 'Article' }
                            ]}
                            required={true}
                        />
                    </div>
                    
                    {/* 2. Core Details & Configuration */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-red-500" />
                            1. Core Details & Configuration
                        </h2>
                        
                        <div className="space-y-4">
                            {/* Title (Always needed) */}
                            <FormField 
                                id="title"
                                label="Title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter Article Title"
                                required={true}
                                note="The main heading for your content."
                            />
                            
                            {/* Expert/Summary Field (UNCHANGED) */}
                            <TextAreaField 
                                id="expertSummary" 
                                label="Expert/Summary (Short Summary)"
                                value={formData.expertSummary}
                                onChange={handleChange}
                                placeholder="Write a brief, compelling summary (e.g., 1-2 sentences) of the content."
                                required={false}
                                rows={3} 
                                note="This short summary can be used for expert sections or above the main content."
                            />

                            {/* URL SLUG (UNCHANGED) */}
                            <FormField 
                                id="permalink" 
                                label="URL Slug" 
                                value={formData.permalink}
                                onChange={handleChange}
                                placeholder="e.g., a-nice-readable-slug"
                                required={true}
                                note={`The final path for your article (e.g., /${formData.permalink})`}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Main Keywords / Tags (UNCHANGED) */}
                                <FormField 
                                    id="mainKeywords" 
                                    label="Main Keywords / Tags (Enter to add)"
                                    value={formData.mainKeywords.join(', ')}
                                    onChange={(e) => updateFormData('mainKeywords', e.target.value.split(',').map(tag => tag.trim()))}
                                    placeholder="tag1, tag2, tag3"
                                    required={false}
                                />
                                
                                {/* Author Name (UNCHANGED) */}
                                <FormField 
                                    id="author"
                                    label="Author Name"
                                    value={formData.author}
                                    onChange={handleChange}
                                    placeholder="Admin"
                                    required={true}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Read Time (Minutes) (UNCHANGED) */}
                                <FormField 
                                    id="readTime"
                                    label="Read Time (Minutes)"
                                    type="number"
                                    value={formData.readTime}
                                    onChange={handleChange}
                                    required={true}
                                />

                                {/* Published Date (UNCHANGED) */}
                                <FormField 
                                    id="publishedDate"
                                    label="Published Date"
                                    type="date"
                                    value={formData.publishedDate}
                                    onChange={handleChange}
                                    required={true}
                                />
                            </div>

                            <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-900 dark:text-gray-100 border-t pt-4">
                                Article Specific Configuration
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* ✅ KEPT: Category Selection (Article Specific) */}
                                <FormSelect
                                    id="category"
                                    label="Category" 
                                    value={formData.category}
                                    onChange={handleChange}
                                    options={categories.map(c => ({ id: c.id, name: c.name }))} 
                                    required={true}
                                    note="Select the primary category for the Article."
                                />
                                
                                {/* ✅ NEW FIELD 1: Optional Destination Tab Selection */}
                                <FormSelect
                                    id="destinationTab"
                                    label="Optional Destination Tab" 
                                    value={formData.destinationTab}
                                    onChange={handleChange}
                                    // Default option to allow optional selection
                                    options={destinationTabOptions} // Updated to use useMemo variable
                                    required={false}
                                    note="Optional: Select a tab to feature this article in the Top Destinations section."
                                />
                            </div>
                            
                            <div className="mt-4">
                                {/* ✅ NEW FIELD 2: Optional Latest Article Checkbox */}
                                <CheckboxField
                                    id="isLatest"
                                    label="Feature as Latest Article"
                                    checked={formData.isLatest}
                                    onChange={handleChange}
                                    note="Check this box if you want this article to be featured in the 'Latest Article' section (Optional)."
                                />
                            </div>
                        </div>

                    </div>


                    {/* 3. SEO Panel (UNCHANGED) */}
                    <SeoPanel 
                        formData={formData} 
                        handleChange={handleChange} 
                        updateFormData={updateFormData}
                        slugify={slugify}
                    />
                    
                    {/* 3A. Live SEO Analyzer (UNCHANGED) */}
                    <LiveSeoAnalyzer
                        formData={formData}
                        updateFormData={updateFormData} 
                        focusKeyword={focusKeyword} 
                        setFocusKeyword={setFocusKeyword} 
                    />

                    {/* 4. Image Upload Field (UNCHANGED) */}
                    <ImageUploadField 
                        label={`Article Cover Photo`} 
                        required={true}
                        file={formData.coverPhotoFile}
                        setFile={setImageFile}
                        url={formData.coverPhotoUrl}
                        setUrl={setImageUrl}
                        altText={formData.coverPhotoAlt}
                        setAltText={setImageAltText}
                        isNextImage={!formData.isLazyLoad} 
                        setIsNextImage={setIsNextImage} 
                        note="Upload a high-resolution, relevant image."
                    />

                    {/* 5. Suggested Resources Panel (Updated logic) */}
                    {/* ✅ FIX: handleSuggestedBlogsChange ফাংশন পাস করা হলো */}
                    <SuggestedBlogsPanel 
                        suggestedBlogOptions={suggestedResourceOptions} 
                        suggestedBlogs={formData.suggestedResources} 
                        handleSuggestedBlogsChange={handleSuggestedResourcesChange} 
                        dataLoading={dataLoading} 
                        label={suggestedResourceLabel} 
                    />
                    
                    {/* 6. Robots.txt Configuration (UNCHANGED) */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-teal-500" />
                            6. Robots.txt Configuration
                        </h2>
                        <FormSelect
                            id="robotsTxt"
                            label="Robots.txt Directives"
                            value={formData.robotsTxt}
                            onChange={handleChange}
                            options={[
                                { id: 'index, follow', name: 'index, follow (Default - Allow indexing)' },
                                { id: 'noindex, follow', name: 'noindex, follow (Hide from search results, but follow links)' },
                                { id: 'index, nofollow', name: 'index, nofollow (Allow indexing, but do not follow links)' },
                                { id: 'noindex, nofollow', name: 'noindex, nofollow (Strictly block indexing and link following)' },
                            ]}
                            required={true}
                            note="Select the appropriate directive for search engine bots."
                        />
                    </div>


                    {/* 7. Advanced SEO, Schema & Technical Fields (UNCHANGED) */}
                    <AdvancedSEOSchemaTechnical
                        formData={formData}
                        handleChange={handleChange}
                        handleFAQChange={handleFAQChange}
                        addFAQ={addFAQ}
                        removeFAQ={removeFAQ}
                    />


                    {/* 9. Rich Text Editor (Article Content) (UPDATED WITH Dynamic Component) */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-red-500" />
                            8. Content Editor
                        </h2>

                        {/* --- FIX 1: Using DynamicRichTextEditor to prevent Hydration Error --- */}
                        <DynamicRichTextEditor // <--- FIX: Changed to Dynamic Import
                            uploadApiUrl={ARTICLE_MEDIA_UPLOAD_API} 
                            onChange={handleRichTextChange} 
                            value={formData.articleContent} // ✅ FIX: Changed `initialContent` to `value`
                        /> 
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            This is the main content area for your Article.
                        </p>
                    </div>
                    
                    {/* 10. Content Live Preview (UNCHANGED) */}
                    <ArticleLivePreview 
                        formData={formData} 
                        previewMode={previewMode}
                        setPreviewMode={setPreviewMode}
                    />

                    {/* 11. Status/Save Panel (UNCHANGED) */}
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-4 border-red-500/50 dark:border-red-600/50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-6">
                        
                        {/* Status & Score Display */}
                        <div className="flex flex-col space-y-1 text-center md:text-left">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 justify-center md:justify-start">
                                <Zap className="w-5 h-5 text-red-500" />
                                Article Status & Actions
                            </h3>
                            <p className={`text-sm font-semibold ${formData.status === 'Published' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                Current Status: <span className="font-extrabold">{formData.status}</span>
                            </p>
                            <p className={`text-sm font-semibold ${formData.seoScore > 70 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                SEO Score: <span className="font-extrabold">{formData.seoScore}%</span>
                            </p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
                            {/* Save as Draft Button (Secondary) */}
                            <button
                                type="button" 
                                onClick={(e) => handleSubmit(e, 'Draft')}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold flex items-center disabled:opacity-50 justify-center w-full sm:w-auto"
                                disabled={loading || dataLoading}
                            >
                                {loading && formData.status === 'Draft' ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                                Save as Draft
                            </button>
                            
                            {/* Save & Publish Button (Primary) */}
                            <button
                                type="button" 
                                onClick={(e) => handleSubmit(e, 'Published')}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center disabled:opacity-50 justify-center w-full sm:w-auto"
                                disabled={loading || dataLoading}
                            >
                                {loading && formData.status === 'Published' ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                                Save & Publish
                            </button>
                        </div>
                    </div>

                </div>

            </form>
        </div>
    );
}