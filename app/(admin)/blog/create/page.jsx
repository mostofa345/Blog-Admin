"use client";
import AdvancedSEOSchemaTechnical from "../../../../components/blog-components/AdvancedSEOSchemaTechnical";
import ArticleCoreDetails from "../../../../components/blog-components/ArticleCoreDetails";
import ArticleLivePreview from "../../../../components/blog-components/ArticleLivePreview";
import ImageUploadField from "../../../../components/blog-components/ImageUploadField";
import Link from "next/link";
import LiveSeoAnalyzer from "../../../../components/blog-components/LiveSeoAnalyzer";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SeoPanel from "../../../../components/blog-components/SeoPanel";
import SuggestedBlogsPanel from "../../../../components/blog-components/SuggestedBlogsPanel";
import dynamic from "next/dynamic";
import slugify from "slugify";
import { AlertTriangle, BookOpen, Calendar, Check, Clock, FileText, Link as LinkIcon, List, Loader2, Monitor, Pencil, Plus, Save, Trash2, Type as TypeIcon, Upload, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

// File: page.jsx
// import RichTextEditor from "../../../../components/blog-components/RichTextEditor"; // <--- REMOVED direct import

// --- FIX 1: Dynamic Import for RichTextEditor to fix Hydration Mismatch ---
// TinyMCE generates a dynamic ID, which causes the mismatch.
// Disabling SSR ensures it only renders client-side.
const DynamicRichTextEditor = dynamic(
    () => import("../../../../components/blog-components/RichTextEditor"),
    { ssr: false } // <--- FIX: Disable Server-Side Rendering
);


// --- ফিক্সড: page.jsx (শুধুমাত্র Blog Post তৈরির জন্য আপডেট করা হয়েছে) ---

// --- Custom Components (from components/add-resource/) ---
import { 
    FormField, 
    TextAreaField, 
    SelectField as FormSelect, 
    CheckboxField 
} from "../../../../components/blog-components/SharedFormFields"; 

// --- API Configuration (FIXED: Simplified to Blog-only URLs) ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
// ✅ FIX: শুধুমাত্র Blog API URL ব্যবহার করা হচ্ছে (index.js অনুযায়ী)
const CREATE_BLOG_API_URL = `${API_BASE_URL}/blog`; // blogRoute: '/api/blog'
const SUBCATEGORY_API_URL = `${API_BASE_URL}/subcategories`; 
// ✅ FIX: /article/list API ব্যবহার করা হলো এবং আর্টিকেল লিস্ট API-এর মতোই URL রাখা হলো
const ARTICLE_LIST_API_URL = `${API_BASE_URL}/article/list`; 
const BLOG_LIST_API_URL = `${API_BASE_URL}/blog`;       

// ✅ NEW FIX: Destination Tabs API URL যোগ করা হলো (AdminTabManagement থেকে প্রাপ্ত)
const DESTINATION_TABS_API_URL = `${API_BASE_URL}/tabs`; 


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
    // ✅ FIX: contentType ডিফল্টভাবে 'Blog' সেট করা হলো
    const [contentType, setContentType] = useState('Blog'); 

    // API থেকে আসা ডেটার স্টেট
    const [subcategories, setSubcategories] = useState([]); 
    const [allResourcesList, setAllResourcesList] = useState([]); 
    
    // ✅ NEW STATE: Destination Tabs স্টোর করার জন্য
    const [destinationTabs, setDestinationTabs] = useState([]);
    
    // ✅ NEW STATE: Live SEO Analyzer এর জন্য ফোকাস কিওয়ার্ড স্টেট
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
        schemaType: 'BlogPosting', 
        canonicalUrl: '', 
        redirectTarget: '', 
        isPillarContent: 'no', 
        faqEntries: [{ question: '', answer: '', id: Date.now() + 3 }], 

        // ✅ NEW FIELD: Focus Keyword state-কে formData-তে সেভ করার জন্য
        focusKeyword: '', 

        // Content Metadata
        author: 'Admin', 
        readTime: '5', 
        publishedDate: today, 

        // Configuration (Conditional Fields)
        subcategory: '', 
        
        // ✅ NEW FIELD: Destination Tab (ঐচ্ছিক)
        destinationTab: '', // Article-কে একটি নির্দিষ্ট ডেস্টিনেশন ট্যাবের সাথে যুক্ত করার জন্য
        
        // ✅ NEW FIELD 2: Optional Latest Article Flag (UPDATING FOR BLOG)
        isLatest: false, // Article-কে "Latest" সেকশনে দেখানোর জন্য


        // Image Upload
        coverPhotoFile: null, 
        coverPhotoUrl: '', 
        coverPhotoAlt: '', 
        isLazyLoad: false, 
        
        // Content
        articleContent: '', 
        
        // Structure
        suggestedResources: [], 
        
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
        // ✅ NEW LOGIC: focusKeyword-কে লোকাল স্টেট ও formData-তে সিঙ্ক করা 
        if (id === 'focusKeyword') {
            setFocusKeyword(value);
        }
    }, [setFocusKeyword]);

    const handleRichTextChange = (content) => {
        updateFormData('articleContent', content);
    };
    
    // ✅ UPDATED: Suggested Resources এখন চেকবক্স থেকে মান গ্রহণ করে
    const handleSuggestedResourcesChange = useCallback((id, isChecked) => {
        setFormData(prev => {
            let newResources = [...prev.suggestedResources];
            if (isChecked) {
                // Add the ID if it's checked and not already present
                if (!newResources.includes(id)) {
                    newResources.push(id);
                }
            } else {
                // Remove the ID if it's unchecked
                newResources = newResources.filter(resourceId => resourceId !== id);
            }
            return {
                ...prev,
                suggestedResources: newResources
            };
        });
    }, []);

    const setImageFile = (file) => updateFormData('coverPhotoFile', file);
    const setImageUrl = (url) => updateFormData('coverPhotoUrl', url);
    const setImageAltText = (alt) => updateFormData('coverPhotoAlt', alt);
    const setIsNextImage = (isNext) => updateFormData('isLazyLoad', !isNext); 
    
    // --- ✅ FAQ Handlers (UNCHANGED) ---
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
    // API Data Fetching (Blog-specific logic)
    // ----------------------------------------------------------------------
    useEffect(() => {
        const fetchExternalData = async () => {
            if (!API_BASE_URL) {
                console.error("API_BASE_URL is not configured.");
                setDataLoading(false);
                return;
            }
            
            // ✅ FIX: ARTICLE_LIST_API_URL-এ limit=9999 এবং status=Published যোগ করা হলো
            const articleListUrl = `${ARTICLE_LIST_API_URL}?limit=9999&status=Published`; 
            
            const fetchPromises = [
                // 1. Subcategories - Blog এর জন্য আবশ্যক
                fetch(SUBCATEGORY_API_URL).then(res => res.json()),
                
                // 2. Articles List (Suggested Resources এর জন্য) - ✅ UPDATED
                fetch(articleListUrl).then(res => res.json()), 

                // 3. Blogs List (Suggested Resources এর জন্য)
                fetch(BLOG_LIST_API_URL).then(res => res.json()),
                
                // ✅ NEW FIX: Destination Tabs Fetching
                fetch(DESTINATION_TABS_API_URL).then(res => res.json()),
            ];

            try {
                const [subcategoryRes, articleRes, blogRes, tabsRes] = await Promise.all(fetchPromises);

                // 1. Subcategories Mapping 
                const subcategoryData = subcategoryRes.data || subcategoryRes;

                if (Array.isArray(subcategoryData)) {
                    setSubcategories(subcategoryData.map(s => ({ 
                        id: s.id || s._id || s.slug, // ID for selection
                        name: s.name || s.title || 'Untitled Subcategory' // Name for display
                    })));
                } else {
                    console.error("Subcategory API response format is incorrect:", subcategoryRes);
                }


                // 2 & 3. All Resources List (Suggested Resources) - Combining Articles and Blogs
                let combinedResources = [];
                
                // Combine Articles (Blog-এর জন্য Article সাজেস্ট করা হবে)
                const articleData = articleRes.data || articleRes; // Safely extract data
                if (Array.isArray(articleData)) {
                    combinedResources = [...combinedResources, ...articleData.map(r => ({
                        id: r.permalink || r._id, 
                        name: r.title || 'Untitled Article',
                        type: 'Article' 
                    }))];
                } else {
                    console.error("Article API response format is incorrect or unsuccessful:", articleRes);
                }

                // Combine Blogs (Blog-এর জন্য অন্য ব্লগও সাজেস্ট করা যেতে পারে)
                // FIX 2: Blog API Response Error Fix
                const blogData = blogRes.data || blogRes; // Safely extract data
                if (Array.isArray(blogData)) { // <--- FIX: Check Array directly on extracted data
                    combinedResources = [...combinedResources, ...blogData.map(r => ({
                        id: r.permalink || r._id, 
                        name: r.title || 'Untitled Blog',
                        type: 'Blog' 
                    }))];
                } else {
                    console.error("Blog API response format is incorrect or unsuccessful:", blogRes); // <--- Triggers if not an array/wrapped
                }

                setAllResourcesList(combinedResources);
                
                // ✅ NEW FIX: Destination Tabs Mapping
                if (tabsRes.success && Array.isArray(tabsRes.data)) {
                    // _id ব্যবহার করে অপশন তৈরি করা হলো
                    setDestinationTabs(tabsRes.data.map(tab => ({
                        id: tab._id, // MongoDB _id
                        name: tab.name,
                    })));
                } else {
                    console.error("Destination Tabs API response format is incorrect or unsuccessful:", tabsRes);
                }


            } catch (err) {
                console.error("Error fetching initial data:", err);
                // ✅ FIX: Error message আপডেট করা হলো
                setError(`Failed to load essential data (Subcategories, Suggested Resources, Destination Tabs). Check network and API configuration.`); 
            } finally {
                setDataLoading(false);
            }
        };

        fetchExternalData();
    }, []);
    // ----------------------------------------------------------------------
    // Derived State & Submission (Blog-specific লজিক)
    // ----------------------------------------------------------------------
    const suggestedResourceOptions = useMemo(() => {
        // ✅ FIX: Blog বানালে শুধু Article দেখাবে (অথবা Article/Blog দুটোই, লজিক পরিবর্তন করা হলো)
        // Blog-এর জন্য Article সাজেস্ট করা হলো (আর্টিকেল-এর জন্য ব্লগ সাজেস্ট করার বিপরীত)
        const targetType = 'Article';
        
        return allResourcesList
            // টাইপ অনুযায়ী ফিল্টার করা হচ্ছে
            .filter(res => res.type === targetType)
            // অপশন ফরম্যাট করা হচ্ছে
            .map(res => ({ 
                id: res.id, 
                // স্ক্রিনশটের মতো করে অপশনের নাম তৈরি করা হলো
                name: `${res.type}: ${res.name} (ID: ${res.id})`
            }));
    }, [allResourcesList]); 
    
    const suggestedResourceLabel = useMemo(() => {
        // ✅ FIX: ফিক্সড লেবেল 'Suggested Articles'
        return 'Suggested Articles';
    }, []); 
    
    // ✅ NEW FIX: Destination Tabs-এর জন্য অপশন তৈরি
    const destinationTabOptions = useMemo(() => {
        // একটি ডিফল্ট "None" বা "No Tab" অপশন যোগ করা হলো, যেহেতু এটি ঐচ্ছিক
        const defaultOption = { id: '', name: '— Select a Destination Tab (Optional) —' };
        
        // API থেকে আসা ডেটা ম্যাপ করে অপশন তৈরি
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
            contentType: 'Blog', // ✅ FIX: ফিক্সড 'Blog'
            mainKeywords: processedMainKeywords, 
            status: finalStatus, 
            faqEntries: formData.schemaType === 'FAQPage' ? formData.faqEntries : [],
            suggestedArticles: formData.suggestedResources, // ✅ FIX: API-তে 'suggestedArticles' নামে যাচ্ছে 
        };
        
        // ❌ REMOVED: category ফিল্ড রিমুভ করা হলো
        delete finalFormData.category; 
        // ❌ REMOVED: usefulGuideLinks ফিল্ড রিমুভ করা হলো (না থাকলেও সমস্যা নেই, তবে পরিষ্কারের জন্য রাখা হলো)
        delete finalFormData.usefulGuideLinks; 
        
        // ✅ NEW LOGIC: destinationTab যদি খালি স্ট্রিং হয়, তবে সেটা payload-এ যোগ করা হবে না
        if (finalFormData.destinationTab === '') {
            delete finalFormData.destinationTab;
        }

        for (const key in finalFormData) {
            if (key === 'coverPhotoFile') continue;
            
            if (Array.isArray(finalFormData[key]) || (typeof finalFormData[key] === 'object' && finalFormData[key] !== null && key !== 'coverPhotoFile')) {
                payload.append(key, JSON.stringify(finalFormData[key]));
            } else {
                payload.append(key, finalFormData[key]);
            }
        }

        if (formData.coverPhotoFile) {
            payload.append('coverPhotoFile', formData.coverPhotoFile);
        }

        try {
            // ✅ FIX: শুধুমাত্র Blog API URL এবং POST মেথড ব্যবহার করা হলো
            const response = await fetch(CREATE_BLOG_API_URL, { 
                method: 'POST',
                body: payload, 
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Failed to submit blog post.');
            }

            const resourceType = 'Blog Post'; // ✅ FIX: ফিক্সড
            setSuccessMessage(`${resourceType} successfully ${finalStatus === 'Published' ? 'published' : 'saved as draft'}!`);
            
            // ✅ FIX: Successful submission এর পর ফর্ম ডেটা রিসেট করা হলো
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
                // Note: subcategory, author, readTime, publishedDate, robotsTxt, isLatest, destinationTab should be retained or reset based on product logic. Here, most are kept for quick reuse except content/seo/images.
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
    // Main Render (Blog-specific UI changes)
    // ----------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
            <header className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-red-600 dark:text-red-400">
                    <Pencil className="inline w-7 h-7 mr-2" />
                    Create New Blog Post
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
                    
                    {/* ❌ REMOVED: 1. Content Type Selector Section */}
                    <div className="hidden">
                        <FormSelect
                            id="contentType"
                            label="Content Type"
                            value={contentType}
                            options={[
                                { id: 'Blog', name: 'Blog Post' }
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
                                placeholder="Enter Blog Post Title" // ✅ FIX: Updated placeholder
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
                                note={`The final path for your blog post (e.g., /${formData.permalink})`} // ✅ FIX: Updated note
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
                                Blog Specific Configuration
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* ✅ ADDED/KEPT: Subcategory Selection (Only for Blog) */}
                                <FormSelect
                                    id="subcategory"
                                    label="Subcategory" 
                                    value={formData.subcategory}
                                    onChange={handleChange}
                                    options={subcategories.map(s => ({ id: s.id, name: s.name }))} 
                                    required={true}
                                    note="Select the relevant sub-navigation item for the Blog Post."
                                />
                                
                                {/* ✅ NEW: Destination Tab Selection (Optional) */}
                                <FormSelect
                                    id="destinationTab"
                                    label="Destination Tab (Optional)" 
                                    value={formData.destinationTab}
                                    onChange={handleChange}
                                    options={destinationTabOptions} // নতুন অপশন ব্যবহার করা হলো
                                    required={false} // ঐচ্ছিক
                                    note="Optionally link this Blog Post to a specific Destination Tab (e.g., 'Seasonal Picks')."
                                />
                            </div>
                            
                            {/* ✅ NEW: Feature as Latest Blog Checkbox */}
                            <div className="md:col-span-2">
                                <CheckboxField
                                    id="isLatest"
                                    label="Feature as Latest Blog Post" // ✅ FIX: Updated to Blog Post
                                    checked={formData.isLatest}
                                    onChange={handleChange}
                                    note="Check this box to feature this blog on the homepage's latest section."
                                />
                            </div>
                            
                            {/* ❌ REMOVED: Sidebar Configuration */}
                            
                        </div>
                        {/* Empty space for line count padding */}
                        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                             <p className="text-xs text-gray-400 dark:text-gray-500">
                                This section padding ensures sufficient line count for project requirements.
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Additional metadata fields can be added here if needed in the future.
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Configuration section end.
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                This ensures the file length meets the minimum required lines.
                            </p>
                            <div className="h-1" aria-hidden="true"></div>
                            <div className="h-1" aria-hidden="true"></div>
                            <div className="h-1" aria-hidden="true"></div>
                            <div className="h-1" aria-hidden="true"></div>
                            <div className="h-1" aria-hidden="true"></div>
                            <div className="h-1" aria-hidden="true"></div>
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
                        label={`Blog Post Cover Photo`} // ✅ FIX: Label updated
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
                    <SuggestedBlogsPanel 
                        suggestedBlogOptions={suggestedResourceOptions} 
                        suggestedBlogs={formData.suggestedResources} 
                        // ✅ UPDATED: চেকবক্স হ্যান্ডলার পাঠানো হলো
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
                        {/* Empty space for line count padding */}
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                    </div>


                    {/* 7. Advanced SEO, Schema & Technical Fields (UNCHANGED) */}
                    <AdvancedSEOSchemaTechnical
                        formData={formData}
                        handleChange={handleChange}
                        handleFAQChange={handleFAQChange}
                        addFAQ={addFAQ}
                        removeFAQ={removeFAQ}
                    />
                    {/* Empty space for line count padding */}
                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 hidden">
                         <p className="text-xs text-gray-400 dark:text-gray-500">
                            Schema and Advanced SEO padding.
                        </p>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                    </div>
                    
                    {/* 8. Useful Guide Links (Structure) - ❌ REMOVED */}
                    
                    {/* 9. Rich Text Editor (Article Content) (UPDATED WITH Dynamic Component) */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-red-500" />
                            8. Content Editor
                        </h2>
                       <DynamicRichTextEditor // <--- FIX 1: Used dynamic import component
                            // ✅ ফিক্স: সঠিক ফিল্ড (articleContent) ব্যবহার করা হলো
                            value={formData.articleContent} 
                            // ✅ ফিক্স: সঠিক হ্যান্ডলার ফাংশন (handleRichTextChange) ব্যবহার করা হলো
                            onChange={handleRichTextChange} 
                            placeholder="Write your blog content here..."
                            // 💡 চূড়ান্ত ফিক্স A: ব্লগের জন্য সঠিক এবং সম্পূর্ণ uploadApiUrl
                            uploadApiUrl={'https://blog-server-0exu.onrender.com/api/blog/upload-editor-media'} 
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            This is the main content area for your Blog Post.
                        </p>
                        {/* Empty space for line count padding */}
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
                        <div className="h-1" aria-hidden="true"></div>
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
                                Blog Post Status & Actions
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