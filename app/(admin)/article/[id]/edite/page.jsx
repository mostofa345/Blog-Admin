"use client";
import AdvancedSEOSchemaTechnical from "../../../../../components/add-resource/AdvancedSEOSchemaTechnical";
import ArticleLivePreview from "../../../../../components/add-resource/ArticleLivePreview";
import ImageUploadField from "../../../../../components/add-resource/ImageUploadField";
import Link from "next/link";
import LiveSeoAnalyzer from "../../../../../components/add-resource/LiveSeoAnalyzer";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import RichTextEditor from "../../../../../components/add-resource/RichTextEditor";
import SeoPanel from "../../../../../components/add-resource/SeoPanel";
import SuggestedBlogsPanel from "../../../../../components/add-resource/SuggestedBlogsPanel";
import slugify from "slugify";
import { AlertTriangle, ArrowLeftCircle, BookOpen, Calendar, Check, Clock, FileText, List, Loader2, Monitor, Pencil, Save, Trash2, Upload, Zap } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

// article/[id]/edit/page.jsx (Updated with Destination Tab and Is Latest Article fields)

// --- Custom Components (from components/add-resource/) ---
import { 
    FormField, 
    TextAreaField, 
    SelectField as FormSelect, 
    CheckboxField 
} from "../../../../../components/add-resource/SharedFormFields"; 

// --- API Configuration (FIXED: Simplified to Article-only URLs) ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';

// ✅ FIX: শুধুমাত্র Article API URL ব্যবহার করা হচ্ছে
const ARTICLE_BASE_API_URL = `${API_BASE_URL}/article`; // articleRoute: '/api/article'
const CATEGORY_API_URL = `${API_BASE_URL}/categories`; 
const BLOG_LIST_API = `${API_BASE_URL}/blog/list`;      
// ✅ NEW API URL: Destination Tabs API
const DESTINATION_TABS_API_URL = `${API_BASE_URL}/tabs`; 


// ----------------------------------------------------------------------
// Initial State & Helpers
// ----------------------------------------------------------------------
const getCurrentDate = () => new Date().toISOString().substring(0, 10);
const today = getCurrentDate();

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
    schemaType: 'Article',
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
    category: '', 
    // ✅ NEW FIELD 1: Optional Destination Tab
    destinationTab: '', 
    // ✅ NEW FIELD 2: Optional Latest Article Flag
    isLatest: false, 
    
    // Image Upload
    coverPhotoFile: null, 
    coverPhotoUrl: '', 
    coverPhotoAlt: '', 
    isLazyLoad: false, 
    
    // Content
    articleContent: '', 
    
    // Suggested Resources
    suggestedResources: [], 

    status: 'Draft', 
    seoScore: 0,
};

// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------

export default function EditArticlePage() {
    const router = useRouter();
    const params = useParams();
    const articleId = params.id; 

    const [contentType, setContentType] = useState('Article'); 
    const [categories, setCategories] = useState([]); 
    // ✅ NEW STATE: Destination Tabs স্টেট
    const [destinationTabs, setDestinationTabs] = useState([]);
    const [allResourcesList, setAllResourcesList] = useState([]); 
    const [focusKeyword, setFocusKeyword] = useState(''); 
    
    const [formData, setFormData] = useState(initialFormData); 
    
    const [loading, setLoading] = useState(false); 
    const [dataLoading, setDataLoading] = useState(true); 
    const [articleLoading, setArticleLoading] = useState(true); 
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
    
    // ✅ FIX: Suggested Resources চেকবক্স হ্যান্ডলার (create/page.jsx থেকে আনা হয়েছে)
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
    // API Data Fetching (Article Data, Categories, Blogs List, Tabs)
    // ----------------------------------------------------------------------
    
    // ✅ FIX: আর্টিকেল ডেটা আনার ফাংশন
    const fetchArticleData = useCallback(async () => {
        if (!articleId || !API_BASE_URL) return;

        setArticleLoading(true);
        setError(null);
        try {
            const response = await fetch(`${ARTICLE_BASE_API_URL}/id/${articleId}`);
            if (!response.ok) throw new Error(`Failed to fetch article data with status ${response.status}`);
            
            const articleData = await response.json();

            // 💡 ডেটা মডেলিং এবং ম্যাপ করা
            const categoryId = articleData.category._id || articleData.category; 
            
            const mappedFaqEntries = articleData.faqEntries.map(faq => ({
                question: faq.question || '',
                answer: faq.answer || '',
                id: faq.frontendId || faq._id || Date.now() + Math.random()
            }));

            const mappedSuggestedResources = articleData.suggestedResources || articleData.suggestedBlogs || [];


            const updatedFormData = {
                // Core & SEO
                title: articleData.title || '',
                expertSummary: articleData.expertSummary || '', 
                mainKeywords: articleData.mainKeywords || [], 
                permalink: articleData.permalink || '', 
                metaTitle: articleData.metaTitle || '',
                metaDescription: articleData.metaDescription || '',
                keywords: articleData.keywords || '', 
                robotsTxt: articleData.robotsTxt || 'index, follow', 
                
                // Advanced SEO & Schema Fields
                schemaType: articleData.schemaType || 'Article',
                canonicalUrl: articleData.canonicalUrl || '', 
                redirectTarget: articleData.redirectTarget || '', 
                isPillarContent: articleData.isPillarContent || 'no', 
                faqEntries: mappedFaqEntries.length > 0 ? mappedFaqEntries : initialFormData.faqEntries,

                focusKeyword: articleData.focusKeyword || '', 

                // Content Metadata
                author: articleData.author || 'Admin', 
                readTime: articleData.readTime?.toString() || '5', 
                publishedDate: articleData.publishedDate ? new Date(articleData.publishedDate).toISOString().substring(0, 10) : today, 

                // Configuration
                category: categoryId, 
                // ✅ NEW FIELD 1: Load Destination Tab
                destinationTab: articleData.destinationTab || '',
                // ✅ NEW FIELD 2: Load Is Latest Flag
                isLatest: articleData.isLatest || false,
                
                // Image Upload
                coverPhotoFile: null, 
                coverPhotoUrl: articleData.coverPhotoUrl || '', 
                coverPhotoAlt: articleData.coverPhotoAlt || '', 
                isLazyLoad: articleData.isLazyLoad || false, 
                
                // Content
                articleContent: articleData.articleContent || '', 
                
                // Suggested Resources
                suggestedResources: mappedSuggestedResources,

                status: articleData.status || 'Draft', 
                seoScore: articleData.seoScore || 0,
            };
            
            setFormData(updatedFormData);
            setFocusKeyword(updatedFormData.focusKeyword);

        } catch (err) {
            console.error("Error fetching article data:", err);
            setError(`Failed to load article details: ${err.message}`);
        } finally {
            setArticleLoading(false);
        }
    }, [articleId]);

    // ✅ FIX: সকল এক্সটার্নাল ডেটা আনার ফাংশন (Tabs সহ)
    useEffect(() => {
        if (!articleId) {
            setError("Invalid Article ID provided.");
            setDataLoading(false);
            setArticleLoading(false);
            return;
        }

        const fetchExternalData = async () => {
            if (!API_BASE_URL) {
                console.error("API_BASE_URL is not configured.");
                setDataLoading(false);
                return;
            }
            
            const fetchPromises = [
                // 1. Categories
                fetch(CATEGORY_API_URL).then(res => res.ok ? res.json() : Promise.reject(`Category API failed with status ${res.status}`)),
                // 2. Blogs List
                fetch(BLOG_LIST_API).then(res => res.ok ? res.json() : Promise.reject(`Blog List API failed with status ${res.status}`)),
                // 3. Destination Tabs
                fetch(DESTINATION_TABS_API_URL).then(res => res.ok ? res.json() : Promise.reject(`Destination Tabs API failed with status ${res.status}`)),
            ];

            try {
                // ৩টি রেজাল্ট destructuring করা হলো
                const [categoryRes, blogRes, tabsRes] = await Promise.all(fetchPromises);

                // 1. Categories Mapping Logic
                const categoryData = categoryRes.data || categoryRes;
                if (Array.isArray(categoryData)) {
                    setCategories(categoryData.map(c => ({
                        id: c._id || c.id || c.slug, 
                        name: c.name || c.title || 'Untitled Category'
                    })));
                } else {
                    console.error("Category API response format is incorrect:", categoryRes);
                }
                
                // 2. Destination Tabs Mapping Logic
                const tabsData = tabsRes.data || tabsRes;
                // 'Explore all' tab-টিকে বাদ দেওয়া হলো
                if (Array.isArray(tabsData)) {
                    setDestinationTabs(tabsData.filter(t => t.name !== 'Explore all').map(t => ({
                        id: t._id || t.id, 
                        name: t.name
                    })));
                } else {
                    console.error("Destination Tabs API response format is incorrect:", tabsRes);
                }


                // 3. All Resources List (Suggested Resources) - Only Blogs needed
                let combinedResources = [];
                const blogData = blogRes.data && blogRes.data.list ? blogRes.data.list : blogRes.data || blogRes;
                
                if (Array.isArray(blogData)) {
                    combinedResources = [...combinedResources, ...blogData.map(r => ({
                        id: r.permalink || r._id,
                        name: r.title || 'Untitled Blog',
                        type: 'Blog' 
                    }))];
                }

                setAllResourcesList(combinedResources);

            } catch (err) {
                console.error("Error fetching initial data:", err);
                setError(`Failed to load essential data (Categories, Suggested Blogs, Destination Tabs). Check network and API configuration.`); 
            } finally {
                setDataLoading(false);
            }
        };

        fetchArticleData();
        fetchExternalData();
    }, [articleId, fetchArticleData]);


    // ----------------------------------------------------------------------
    // Derived State & Submission (Article-specific logic)
    // ----------------------------------------------------------------------
    const suggestedResourceOptions = useMemo(() => {
        const targetType = 'Blog'; 
        
        return allResourcesList
            .filter(res => res.type === targetType)
            .map(res => ({ 
                id: res.id, 
                name: `${res.type}: ${res.name} (ID: ${res.id})`
            }));
    }, [allResourcesList]); 
    
    const suggestedResourceLabel = useMemo(() => 'Suggested Blogs', []); 

    // ✅ FIX: handleSubmit (Update logic with new fields)
    const handleSubmit = async (e, finalStatus) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);
        
        const payload = new FormData();

        const processedMainKeywords = Array.isArray(formData.mainKeywords) ? formData.mainKeywords : [];

        const finalFormData = {
            ...formData,
            contentType: 'Article',
            mainKeywords: processedMainKeywords, 
            status: finalStatus, 
            faqEntries: formData.schemaType === 'FAQPage' ? formData.faqEntries : [],
            suggestedBlogs: formData.suggestedResources, // API-তে 'suggestedBlogs' নামে যাচ্ছে 
            
            // ✅ NEW FIELDS FOR API:
            destinationTab: formData.destinationTab || undefined, // যদি ফাঁকা থাকে, তবে undefined পাঠাবে
            isLatest: formData.isLatest, // boolean হিসাবে যাবে
        };
        
        delete finalFormData.subcategory; 
        delete finalFormData.suggestedResources; // suggestedBlogs-এ ম্যাপ করা হয়েছে
        delete finalFormData.coverPhotoFile; // ফাইলটি আলাদাভাবে append করা হবে

        for (const key in finalFormData) {
            if (key === 'coverPhotoFile') continue;

            if (Array.isArray(finalFormData[key]) || (typeof finalFormData[key] === 'object' && finalFormData[key] !== null)) {
                payload.append(key, JSON.stringify(finalFormData[key]));
            } else {
                payload.append(key, finalFormData[key]);
            }
        }

        if (formData.coverPhotoFile) {
            payload.append('coverPhotoFile', formData.coverPhotoFile);
        }

        try {
            const response = await fetch(`${ARTICLE_BASE_API_URL}/${articleId}`, { 
                method: 'PUT',
                body: payload, 
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Failed to update article.');
            }

            const resourceType = 'Article'; 
            setSuccessMessage(`${resourceType} successfully updated and ${finalStatus === 'Published' ? 'published' : 'saved as draft'}!`);

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
    const isFetching = dataLoading || articleLoading;
    
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
            <header className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-red-600 dark:text-red-400">
                    <Pencil className="inline w-7 h-7 mr-2" />
                    Edit Article (ID: {articleId})
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

            {/* Global Loading & Error Messages */}
            {isFetching && (
                <div className="flex justify-center items-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                    <Loader2 className="w-8 h-8 mr-3 animate-spin text-red-500" />
                    <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading article and essential data...</span>
                </div>
            )}
            {!isFetching && error && (
                <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-300 flex items-center shadow-lg">
                    <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <p className="font-medium">Error: {error}</p>
                </div>
            )}
            {!isFetching && successMessage && (
                <div className="p-4 mb-4 bg-green-100 border border-green-400 text-green-700 rounded-lg dark:bg-green-900 dark:border-green-700 dark:text-green-300 flex items-center shadow-lg">
                    <Check className="w-5 h-5 mr-3 flex-shrink-0" />
                    <p className="font-medium">{successMessage}</p>
                </div>
            )}
            

            {/* Main Form (Hidden while fetching) */}
            {!isFetching && (
                <form onSubmit={(e) => handleSubmit(e, formData.status)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        
                        {/* 1. Core Details & Configuration */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-red-500" />
                                1. Core Details & Configuration
                            </h2>
                            
                            <div className="space-y-4">
                                {/* Title */}
                                <FormField 
                                    id="title"
                                    label="Title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter Article Title"
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
                                    note={`The final path for your article (e.g., /${formData.permalink})`}
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
                                    Article Specific Configuration
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Category Selection */}
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
                                        options={[{ id: '', name: '— None (Optional) —' }, ...destinationTabs.map(t => ({ id: t.id, name: t.name }))]} 
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


                        {/* 2. SEO Panel (UNCHANGED) */}
                        <SeoPanel 
                            formData={formData} 
                            handleChange={handleChange} 
                            updateFormData={updateFormData}
                            slugify={slugify}
                        />
                        
                        {/* 3. Live SEO Analyzer (UNCHANGED) */}
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
                            note="Upload a high-resolution, relevant image. Existing image will be replaced if a new file is uploaded."
                        />

                        {/* 5. Suggested Resources Panel (UPDATED handler) */}
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

                        {/* 8. Rich Text Editor (Article Content) (UNCHANGED) */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-red-500" />
                                8. Content Editor
                            </h2>
                            <RichTextEditor 
                                uploadApiUrl={'https://blog-server-0exu.onrender.com/api/article/upload-editor-media'} 
                                onChange={handleRichTextChange} 
                                initialContent={formData.articleContent} 
                            />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                This is the main content area for your Article.
                            </p>
                        </div>
                        
                        {/* 9. Content Live Preview (UNCHANGED) */}
                        <ArticleLivePreview 
                            formData={formData} 
                            previewMode={previewMode}
                            setPreviewMode={setPreviewMode}
                        />

                        {/* 10. Status/Save Panel (UNCHANGED) */}
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
                                    disabled={loading || isFetching}
                                >
                                    {loading && formData.status === 'Draft' ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                                    Save Draft
                                </button>
                                
                                {/* Save & Publish Button (Primary) */}
                                <button
                                    type="button" 
                                    onClick={(e) => handleSubmit(e, 'Published')}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center disabled:opacity-50 justify-center w-full sm:w-auto"
                                    disabled={loading || isFetching}
                                >
                                    {loading && formData.status === 'Published' ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                                    Save & Publish
                                </button>
                            </div>
                        </div>

                    </div>

                </form>
            )}
        </div>
    );
}