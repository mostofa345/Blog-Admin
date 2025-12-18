"use client";
import AdvancedSEOSchemaTechnical from "../../../../../components/blog-components/AdvancedSEOSchemaTechnical";
import ArticleCoreDetails from "../../../../../components/blog-components/ArticleCoreDetails";
import ArticleLivePreview from "../../../../../components/blog-components/ArticleLivePreview";
import ImageUploadField from "../../../../../components/blog-components/ImageUploadField";
import Link from "next/link";
import LiveSeoAnalyzer from "../../../../../components/blog-components/LiveSeoAnalyzer";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SeoPanel from "../../../../../components/blog-components/SeoPanel";
import SuggestedBlogsPanel from "../../../../../components/blog-components/SuggestedBlogsPanel";
import dynamic from "next/dynamic";
import slugify from "slugify";
import { AlertTriangle, BookOpen, Calendar, Check, Clock, FileText, Link as LinkIcon, List, Loader2, Monitor, Pencil, Plus, Save, Trash2, Type as TypeIcon, Upload, Zap } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

// File: page.jsx
// import RichTextEditor from "../../../../../components/blog-components/RichTextEditor"; // <--- REMOVED direct import

// --- Dynamic Import for RichTextEditor to fix Hydration Mismatch ---
// TinyMCE generates a dynamic ID, which causes the mismatch.
// Disabling SSR ensures it only renders client-side.
const DynamicRichTextEditor = dynamic(
    () => import("../../../../../components/blog-components/RichTextEditor"),
    { ssr: false } // <--- FIX: Disable Server-Side Rendering
);


// --- Custom Components (from components/add-resource/) ---
import { 
    FormField, 
    TextAreaField, 
    SelectField as FormSelect, 
    CheckboxField 
} from "../../../../../components/blog-components/SharedFormFields"; 

// --- API Configuration ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';
const CREATE_BLOG_API_URL = `${API_BASE_URL}/blog`; // PUT/GET for single blog
const SUBCATEGORY_API_URL = `${API_BASE_URL}/subcategories`; 
const ARTICLE_LIST_API_URL = `${API_BASE_URL}/article/list`; 
const BLOG_LIST_API_URL = `${API_BASE_URL}/blog`;       
// ✅ ADDED: Destination Tabs API URL
const DESTINATION_TABS_API_URL = `${API_BASE_URL}/tabs`; 


// ----------------------------------------------------------------------
// Initial State & Helpers
// ----------------------------------------------------------------------
const getCurrentDate = (dateString = null) => {
    const now = dateString ? new Date(dateString) : new Date();
    // ISO string এর প্রথম ১০টি অক্ষর (YYYY-MM-DD) রিটার্ন করবে
    return now.toISOString().substring(0, 10); 
};
const today = getCurrentDate();

// Initial structure for new blog/reset
const initialFormData = {
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

    focusKeyword: '', 

    // Content Metadata
    author: 'Admin', 
    readTime: '5', 
    publishedDate: today, 

    // Configuration
    subcategory: '', 
    // ✅ ADDED: Destination Tab
    destinationTab: '', // Article-কে একটি নির্দিষ্ট ডেস্টিনেশন ট্যাবের সাথে যুক্ত করার জন্য
    // ✅ ADDED: Optional Latest Article Flag
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
};


// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------

export default function EditContentPage() {
    const router = useRouter();
    const params = useParams(); // URL প্যারামিটার অ্যাক্সেস করা হলো
    const blogId = params.id; // ব্লগ ID
    
    const [contentType, setContentType] = useState('Blog'); // ফিক্সড 'Blog'

    // API থেকে আসা ডেটার স্টেট
    const [subcategories, setSubcategories] = useState([]); 
    const [allResourcesList, setAllResourcesList] = useState([]); 
    // ✅ ADDED: Destination Tabs স্টোর করার জন্য
    const [destinationTabs, setDestinationTabs] = useState([]);

    // Live SEO Analyzer এর জন্য ফোকাস কিওয়ার্ড স্টেট
    const [focusKeyword, setFocusKeyword] = useState(''); 
    
    const [formData, setFormData] = useState(initialFormData);
    
    const [loading, setLoading] = useState(false); 
    const [dataLoading, setDataLoading] = useState(true); 
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [previewMode, setPreviewMode] = useState('desktop'); 

    // ----------------------------------------------------------------------
    // Handlers (Create Page থেকে অপরিবর্তিত)
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
        // focusKeyword-কে লোকাল স্টেট ও formData-তে সিঙ্ক করা 
        if (id === 'focusKeyword') {
            setFocusKeyword(value);
        }
    }, [setFocusKeyword]);

    const handleRichTextChange = (content) => {
        updateFormData('articleContent', content);
    };

    // ✅ UPDATED: Suggested Resources এখন চেকবক্স থেকে মান গ্রহণ করে (create.jsx অনুযায়ী)
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
    // API Data Fetching (Initial Data & Existing Blog Data)
    // ----------------------------------------------------------------------
    useEffect(() => {
        if (!blogId) {
            setError("Blog ID is missing from the URL.");
            setDataLoading(false);
            return;
        }

        const fetchExistingBlogData = async () => {
            try {
                // ১. Existing Blog Data Fetch
                const blogRes = await fetch(`${CREATE_BLOG_API_URL}/id/${blogId}`);
                const blogData = await blogRes.json();
                
                if (!blogRes.ok) {
                    throw new Error(blogData.message || `Failed to fetch blog with ID: ${blogId}`);
                }
                
                // ২. Data Mapping for Form State
                const fetchedData = blogData;
                
                // FAQ entries-এ একটি `id` ফিল্ড যুক্ত করা যা ফ্রন্টএন্ডে রেন্ডারিং-এর জন্য প্রয়োজন
                const mappedFaqEntries = (fetchedData.faqEntries || []).map(entry => ({
                    ...entry,
                    id: entry.frontendId || Date.now() + Math.random(), // Add a unique ID for frontend keying
                }));
                
                // Existing Blog Data দিয়ে formData আপডেট করা
                setFormData(prev => ({
                    ...prev,
                    ...fetchedData,
                    // MongoDB ID গুলোকে ফ্রন্টএন্ড-ফ্রেন্ডলি ফর্মেট করা
                    publishedDate: getCurrentDate(fetchedData.publishedDate), 
                    mainKeywords: Array.isArray(fetchedData.mainKeywords) ? fetchedData.mainKeywords : [],
                    // Suggested Resources model এ suggestedResources এ সেভ হলেও, আমরা এটিকে frontend state: suggestedResources এ ম্যাপ করছি
                    suggestedResources: fetchedData.suggestedResources || [], 
                    faqEntries: mappedFaqEntries.length > 0 ? mappedFaqEntries : initialFormData.faqEntries, // Empty array হলে একটি ডিফল্ট এন্ট্রি যোগ করা
                    // coverPhotoFile কে null রাখতে হবে, কারণ ফাইলটি পুনরায় আপলোড করতে হবে
                    coverPhotoFile: null, 
                    // ✅ ADDED: isLatest এবং destinationTab সেট করা
                    isLatest: fetchedData.isLatest || false,
                    destinationTab: fetchedData.destinationTab || '', // যদি না থাকে, তবে খালি স্ট্রিং
                }));
                setFocusKeyword(fetchedData.focusKeyword || '');

            } catch (err) {
                console.error("Error fetching existing blog data:", err);
                setError(err.message || `Failed to load existing blog post data for ID: ${blogId}.`); 
                // শুধুমাত্র এই ফেচ ব্যর্থ হলে DataLoading কে false করে দেব, External Data Fetching এর জন্য অপেক্ষা করব না
                setDataLoading(false); 
                return false; // ব্যর্থতার ইঙ্গিত
            }
            return true; // সাফল্যের ইঙ্গিত
        };
        
        const fetchExternalData = async () => {
            if (!API_BASE_URL) {
                console.error("API_BASE_URL is not configured.");
                return;
            }
            
            // Article List URL (Published status)
            const articleListUrl = `${ARTICLE_LIST_API_URL}?limit=9999&status=Published`; 
            
            const fetchPromises = [
                // 1. Subcategories - Blog এর জন্য আবশ্যক
                fetch(SUBCATEGORY_API_URL).then(res => res.json()),
                
                // 2. Articles List (Suggested Resources এর জন্য)
                fetch(articleListUrl).then(res => res.json()), 

                // 3. Blogs List (Suggested Resources এর জন্য)
                fetch(BLOG_LIST_API_URL).then(res => res.json()),  
                
                // ✅ ADDED: Destination Tabs Fetching
                fetch(DESTINATION_TABS_API_URL).then(res => res.json()),
            ];

            try {
                const [subcategoryRes, articleRes, blogRes, tabsRes] = await Promise.all(fetchPromises);

                // 1. Subcategories Mapping 
                const subcategoryData = subcategoryRes.data || subcategoryRes;
                if (Array.isArray(subcategoryData)) {
                    setSubcategories(subcategoryData.map(s => ({ 
                        id: s.id || s._id || s.slug, 
                        name: s.name || s.title || 'Untitled Subcategory' 
                    })));
                } else {
                    console.error("Subcategory API response format is incorrect:", subcategoryRes);
                }

                // 2 & 3. All Resources List (Suggested Resources) - Combining Articles and Blogs
                let combinedResources = [];
                
                // Combine Articles 
                if (articleRes.success && Array.isArray(articleRes.data)) {
                    combinedResources = [...combinedResources, ...articleRes.data.map(r => ({
                        id: r.permalink || r._id, 
                        name: r.title || 'Untitled Article',
                        type: 'Article' 
                    }))];
                } 

                // Combine Blogs 
                if (blogRes.success && Array.isArray(blogRes.data)) {
                    // Current blog-টিকে Suggested Blog list থেকে বাদ দেওয়া
                    const filteredBlogs = blogRes.data.filter(r => r._id !== blogId); 

                    combinedResources = [...combinedResources, ...filteredBlogs.map(r => ({
                        id: r.permalink || r._id, 
                        name: r.title || 'Untitled Blog',
                        type: 'Blog' 
                    }))];
                } 

                setAllResourcesList(combinedResources);
                
                // ✅ ADDED: Destination Tabs Mapping
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
                console.error("Error fetching external data:", err);
                setError(prev => prev || `Failed to load essential data (Subcategories, Suggested Resources, Destination Tabs). Check network and API configuration.`); 
            }
        };

        const loadData = async () => {
            setDataLoading(true);
            const success = await fetchExistingBlogData();
            if (success) {
                await fetchExternalData();
            }
            setDataLoading(false);
        };

        loadData();
    }, [blogId]); // blogId এর উপর নির্ভর করে ডেটা লোড হবে


    // ----------------------------------------------------------------------
    // Derived State & Submission
    // ----------------------------------------------------------------------
    const suggestedResourceOptions = useMemo(() => {
        // Blog বানালে শুধু Article দেখাবে
        const targetType = 'Article'; 
        
        return allResourcesList
            .filter(res => res.type === targetType)
            .map(res => ({ 
                id: res.id, 
                name: `${res.type}: ${res.name} (ID: ${res.id})`
            }));
    }, [allResourcesList]); 
    
    const suggestedResourceLabel = useMemo(() => {
        // ফিক্সড লেবেল 'Suggested Articles'
        return 'Suggested Articles';
    }, []); 
    
    // ✅ ADDED: Destination Tabs-এর জন্য অপশন তৈরি (create.jsx অনুযায়ী)
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
            contentType: 'Blog', 
            mainKeywords: processedMainKeywords, 
            status: finalStatus, 
            faqEntries: formData.schemaType === 'FAQPage' ? formData.faqEntries : [],
            // Suggested Resources model field: suggestedResources (backend এ `suggestedArticles` থেকে ম্যাপ হবে)
            suggestedArticles: formData.suggestedResources, 
        };
        
        // Unused fields রিমুভ করা
        delete finalFormData.category; 
        delete finalFormData.usefulGuideLinks; 
        delete finalFormData.cloudinaryAssetId; // এটি PUT/PATCH রিকোয়েস্টে পাঠানো উচিত না
        delete finalFormData.views; 
        delete finalFormData.loves; 
        delete finalFormData.shares; 
        delete finalFormData.comments; 
        delete finalFormData.createdAt; 
        delete finalFormData.updatedAt; 
        delete finalFormData._id; 
        delete finalFormData.__v; 
        
        // ✅ ADDED LOGIC: destinationTab যদি খালি স্ট্রিং হয়, তবে সেটা payload-এ যোগ করা হবে না (create.jsx অনুযায়ী)
        if (finalFormData.destinationTab === '') {
            delete finalFormData.destinationTab;
        }

        // Form Data তৈরি করা
        for (const key in finalFormData) {
            if (key === 'coverPhotoFile') continue;
            
            // Array/Object ফিল্ডগুলি JSON.stringify করে পাঠানো
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
            // FIX: PUT মেথড এবং ব্লগ ID সহ আপডেট API URL ব্যবহার করা হলো
            const response = await fetch(`${CREATE_BLOG_API_URL}/${blogId}`, { 
                method: 'PUT',
                body: payload, 
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Failed to update blog post.');
            }

            const resourceType = 'Blog Post'; 
            setSuccessMessage(`${resourceType} successfully ${finalStatus === 'Published' ? 'published' : 'saved as draft'}!`);

        } catch (err) {
            console.error("Submission Error:", err);
            setError(err.message || "An unexpected error occurred during submission.");
        } finally {
            setLoading(false);
        }
    };


    // ----------------------------------------------------------------------
    // Main Render
    // ----------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
            <header className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400"> {/* হেডিং কালার পরিবর্তন করা হলো */}
                    <Pencil className="inline w-7 h-7 mr-2" />
                    Edit Blog Post: <span className="text-gray-900 dark:text-gray-100 font-bold">{formData.title || blogId}</span> {/* ID বা Title দেখানো */}
                </h1>
                <div className="flex space-x-3">
                    {/* একটি Delete Button যোগ করা যেতে পারে, যা বর্তমান কাজের বাইরে */}
                    <button 
                        type="button" 
                        className="flex items-center text-sm font-semibold px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        onClick={() => { /* Delete logic here */ }} 
                        disabled={loading || dataLoading}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Post
                    </button>
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
                    <Loader2 className="w-8 h-8 mr-3 animate-spin text-indigo-500" />
                    <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading existing blog data...</span>
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
            
            {/* ডেটা লোড হলে এবং কোনো বড় এরর না থাকলে ফর্ম দেখানো হবে */}
            {!dataLoading && !error && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        
                        {/* 1. Core Details & Configuration */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" />
                                1. Core Details & Configuration
                            </h2>
                            
                            <div className="space-y-4">
                                {/* Title */}
                                <FormField 
                                    id="title"
                                    label="Title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter Blog Post Title" 
                                    required={true}
                                    note="The main heading for your content."
                                />
                                
                                {/* Expert/Summary Field */}
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

                                {/* URL SLUG */}
                                <FormField 
                                    id="permalink" 
                                    label="URL Slug" 
                                    value={formData.permalink}
                                    onChange={handleChange}
                                    placeholder="e.g., a-nice-readable-slug"
                                    required={true}
                                    note={`The final path for your blog post (e.g., /${formData.permalink})`} 
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Main Keywords / Tags */}
                                    <FormField 
                                        id="mainKeywords" 
                                        label="Main Keywords / Tags (Enter to add)"
                                        value={formData.mainKeywords.join(', ')}
                                        onChange={(e) => updateFormData('mainKeywords', e.target.value.split(',').map(tag => tag.trim()))}
                                        placeholder="tag1, tag2, tag3"
                                        required={false}
                                    />
                                    
                                    {/* Author Name */}
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
                                    {/* Read Time (Minutes) */}
                                    <FormField 
                                        id="readTime"
                                        label="Read Time (Minutes)"
                                        type="number"
                                        value={formData.readTime}
                                        onChange={handleChange}
                                        required={true}
                                    />

                                    {/* Published Date */}
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
                                    {/* Subcategory Selection (Only for Blog) */}
                                    <FormSelect
                                        id="subcategory"
                                        label="Subcategory" 
                                        value={formData.subcategory}
                                        onChange={handleChange}
                                        // subcategories লোড না হলেও ডিফল্ট ভ্যালু দিয়ে এটি ক্র্যাশ হওয়া থেকে বাঁচানো হলো
                                        options={subcategories.map(s => ({ id: s.id, name: s.name }))} 
                                        required={true}
                                        note="Select the relevant sub-navigation item for the Blog Post."
                                    />

                                    {/* ✅ ADDED: Destination Tab Selection (Optional) - create.jsx থেকে যোগ করা হয়েছে */}
                                    <FormSelect
                                        id="destinationTab"
                                        label="Destination Tab (Optional)" 
                                        value={formData.destinationTab}
                                        onChange={handleChange}
                                        options={destinationTabOptions} 
                                        required={false} 
                                        note="Optionally link this Blog Post to a specific Destination Tab (e.g., 'Seasonal Picks')."
                                    />
                                </div>
                                
                                {/* ✅ ADDED: Feature as Latest Blog Checkbox - create.jsx থেকে যোগ করা হয়েছে */}
                                <div className="md:col-span-2">
                                    <CheckboxField
                                        id="isLatest"
                                        label="Feature as Latest Blog Post" 
                                        checked={formData.isLatest}
                                        onChange={handleChange}
                                        note="Check this box to feature this blog on the homepage's latest section."
                                    />
                                </div>
                                
                            </div>

                        </div>


                        {/* 2. SEO Panel (UNCHANGED) */}
                        <SeoPanel 
                            formData={formData} 
                            handleChange={handleChange} 
                            updateFormData={updateFormData}
                            slugify={slugify}
                        />
                        
                        {/* 2A. Live SEO Analyzer (UNCHANGED) */}
                        <LiveSeoAnalyzer
                            formData={formData}
                            updateFormData={updateFormData} 
                            focusKeyword={focusKeyword} 
                            setFocusKeyword={setFocusKeyword} 
                        />

                        {/* 3. Image Upload Field (UNCHANGED) */}
                        <ImageUploadField 
                            label={`Blog Post Cover Photo`} 
                            required={true}
                            file={formData.coverPhotoFile}
                            setFile={setImageFile}
                            url={formData.coverPhotoUrl}
                            setUrl={setImageUrl}
                            altText={formData.coverPhotoAlt}
                            setAltText={setImageAltText}
                            isNextImage={!formData.isLazyLoad} 
                            setIsNextImage={setIsNextImage} 
                            note="Upload a high-resolution, relevant image. New file will replace the existing one."
                        />

                        {/* 4. Suggested Resources Panel (UNCHANGED) */}
                        <SuggestedBlogsPanel 
                            suggestedBlogOptions={suggestedResourceOptions} 
                            suggestedBlogs={formData.suggestedResources} 
                            // ✅ Updated handler for checkbox logic
                            handleSuggestedBlogsChange={handleSuggestedResourcesChange} 
                            dataLoading={dataLoading} 
                            label={suggestedResourceLabel} 
                        />
                        
                        {/* 5. Robots.txt Configuration (UNCHANGED) */}
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


                        {/* 6. Advanced SEO, Schema & Technical Fields (UNCHANGED) */}
                        <AdvancedSEOSchemaTechnical
                            formData={formData}
                            handleChange={handleChange}
                            handleFAQChange={handleFAQChange}
                            addFAQ={addFAQ}
                            removeFAQ={removeFAQ}
                        />

                        {/* 7. Rich Text Editor (Article Content) (UPDATED COMPONENT) */}
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-red-500" />
                            8. Content Editor
                        </h2>
                       <DynamicRichTextEditor // <--- FIX: Used dynamic import component
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
                    </div>
                        
                        {/* 8. Content Live Preview (UNCHANGED) */}
                        <ArticleLivePreview 
                            formData={formData} 
                            previewMode={previewMode}
                            setPreviewMode={setPreviewMode}
                        />

                        {/* 9. Status/Save Panel (Updated Button Text) */}
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-4 border-indigo-500/50 dark:border-indigo-600/50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-6">
                            
                            {/* Status & Score Display */}
                            <div className="flex flex-col space-y-1 text-center md:text-left">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 justify-center md:justify-start">
                                    <Zap className="w-5 h-5 text-indigo-500" />
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
                                {/* Update as Draft Button (Secondary) */}
                                <button
                                    type="button" 
                                    onClick={(e) => handleSubmit(e, 'Draft')}
                                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold flex items-center disabled:opacity-50 justify-center w-full sm:w-auto"
                                    disabled={loading || dataLoading}
                                >
                                    {loading && formData.status === 'Draft' ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                                    Update as Draft
                                </button>
                                
                                {/* Update & Publish Button (Primary) */}
                                <button
                                    type="button" 
                                    onClick={(e) => handleSubmit(e, 'Published')}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center disabled:opacity-50 justify-center w-full sm:w-auto"
                                    disabled={loading || dataLoading}
                                >
                                    {loading && formData.status === 'Published' ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                                    Update & Publish
                                </button>
                            </div>
                        </div>

                    </div>

                </form>
            )}
        </div>
    );
}