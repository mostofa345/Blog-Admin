"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { 
    Plus, Trash2, Save, Loader2, Image as ImageIcon, Heading, AlignLeft, Grid3X3, ArrowUpDown, 
    Edit, ScrollText
} from "lucide-react";

// API Base URL (আপনার .env.local ফাইল থেকে)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://blog-server-0exu.onrender.com/api";

// ✅ API Endpoints সেট করা হলো
const SUBCATEGORIES_API = `${API_BASE_URL}/subcategories`; 
const FLEXIBLE_CONTENT_API = `${API_BASE_URL}/flexible-content`;

// --- ডেটা স্ট্রাকচার ও ইনিশিয়াল স্টেট ---

const initialSection = {
    id: Date.now(), // ফ্রন্টএন্ড ব্যবহারের জন্য ইউনিক আইডি
    type: 'banner', 
    heading: '',
    paragraph: '',
    // ইমেজ সোর্স ম্যানেজমেন্ট
    imageSourceType: 'upload', // 'upload' বা 'gallery'
    imageFile: null,         // ফাইল আপলোডের জন্য (ফ্রন্টএন্ডের জন্য)
    imageURL: '',            // সেভ করা বা গ্যালারি থেকে আসা URL
    galleryImageId: '',      // গ্যালারি থেকে বেছে নিলে সেই ইমেজের ID
    altText: '',             // Alt Text ফিল্ড
    // সার্ভার থেকে আসা: cloudinaryPublicId
};

// ডেমো গ্যালারি ইমেজ ডেটা (API থেকে না আসা পর্যন্ত এটি রাখা হলো)
const dummyGalleryImages = [
    { id: 'img-101', url: '/Assets/images/gallery/image_1.jpg', alt: 'Sunrise over mountain range' },
    { id: 'img-102', url: '/Assets/images/gallery/image_2.jpg', alt: 'Person working on laptop at cafe' },
    { id: 'img-103', url: '/Assets/images/gallery/image_3.jpg', alt: 'Modern home interior design' },
];


export default function FlexibleContentAdminPage() {
    
    // --- স্টেট ম্যানেজমেন্ট ---
    const [allSubCategories, setAllSubCategories] = useState([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    
    const [sections, setSections] = useState([]); // ডাইনামিক সেকশনের অ্যারে
    const [loading, setLoading] = useState(false); // Saving/Loading in progress
    const [dataLoaded, setDataLoaded] = useState(false); // Check if content for selected slug is loaded
    
    
    // --- ১. সাব-ক্যাটাগরি লোড করা (API Call) ---
    const fetchSubcategories = useCallback(async () => {
        try {
            const response = await fetch(SUBCATEGORIES_API);
            if (!response.ok) {
                throw new Error(`Failed to fetch subcategories: ${response.statusText}`);
            }
            const data = await response.json();
            
            // ধরে নেওয়া হলো API থেকে { success: true, data: [{ slug: '...' }, ...] } ফরমেটে আসছে
            const slugs = (data.data || data).map(item => item.slug || item);

            setAllSubCategories(slugs);
            if (slugs.length > 0 && !selectedSubCategory) {
                setSelectedSubCategory(slugs[0]); 
            }
        } catch (error) {
            console.error("Error fetching subcategories:", error);
            alert(`Error loading subcategories. Please check API: ${error.message}`);
        }
    }, [selectedSubCategory]);
    
    useEffect(() => {
        fetchSubcategories();
    }, [fetchSubcategories]);

    // --- ২. সাব-ক্যাটাগরি পরিবর্তন হলে ডেটা লোড করা (Edit Mode) ---
    const fetchFlexibleContent = useCallback(async (slug) => {
        if (!slug) return;

        setDataLoaded(false);
        setSections([]);
        setLoading(true);

        try {
            // ✅ GET API Call: /api/flexible-content/:selectedSubCategory
            const response = await fetch(`${FLEXIBLE_CONTENT_API}/${slug}`);
            
            if (response.ok || response.status === 404) {
                 const data = await response.json();
                 
                 let loadedSections = [];
                 
                 if(data.data && data.data.sections && data.data.sections.length > 0) {
                      loadedSections = data.data.sections.map(sec => ({
                        ...sec, 
                        id: sec.id || Date.now() + Math.random(), // DB id থাকলে সেটি ব্যবহার করা হলো
                        imageFile: null // নিশ্চিত করা হলো যে কোনো ফাইল লোড হয়নি
                    }));
                 } else {
                    // কোনো কন্টেন্ট সেভ না হলে একটি ডিফল্ট সেকশন তৈরি করা হলো
                    loadedSections = [ { ...initialSection, id: Date.now() } ];
                 }
                 setSections(loadedSections);
            } else {
                 throw new Error(`Failed to fetch flexible content: ${response.statusText}`);
            }

        } catch (error) {
            console.error("Error loading saved content:", error);
            alert(`Error loading saved content: ${error.message}`);
            setSections([ { ...initialSection, id: Date.now() } ]); // Error fallback
        } finally {
            setDataLoaded(true);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedSubCategory) {
            fetchFlexibleContent(selectedSubCategory);
        }
    }, [selectedSubCategory, fetchFlexibleContent]);
    
    // --- ৩. সেকশন/ইনপুট পরিবর্তন হ্যান্ডেল করা ---
    const handleSectionChange = useCallback((id, field, value) => {
        setSections(prevSections => prevSections.map(sec => 
            sec.id === id ? { ...sec, [field]: value } : sec
        ));
    }, []);
    
    // গ্যালারি থেকে ইমেজ সিলেক্ট করা
    const handleGallerySelect = useCallback((id, galleryImageId) => {
        const selectedImage = dummyGalleryImages.find(img => img.id === galleryImageId);
        if (selectedImage) {
             setSections(prevSections => prevSections.map(sec => 
                sec.id === id ? { 
                    ...sec, 
                    imageSourceType: 'gallery', 
                    galleryImageId: selectedImage.id, 
                    imageURL: selectedImage.url, 
                    altText: selectedImage.alt,
                    imageFile: null, // গ্যালারি ইমেজ মানে ফাইল আপলোড করার প্রয়োজন নেই
                    cloudinaryPublicId: '' // গ্যালারি ইমেজ হলে পাবলিক আইডি ক্লিয়ার করা হলো
                } : sec
            ));
        }
    }, []);

    // --- ৪. সেকশন যোগ করা/মুছে ফেলা/উপরে নিচে সরানো (unchanged) ---
    const addSection = () => {
        setSections(prevSections => [...prevSections, { ...initialSection, id: Date.now() }]);
    };
    
    const removeSection = (id) => {
        setSections(prevSections => {
            const newSections = prevSections.filter(sec => sec.id !== id);
            // কমপক্ষে একটি সেকশন রাখা হলো
            if (newSections.length === 0) {
                 return [ { ...initialSection, id: Date.now() } ];
            }
            return newSections;
        });
    };

    const moveSection = (index, direction) => {
        const newSections = [...sections];
        if (direction === 'up' && index > 0) {
            [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
        } else if (direction === 'down' && index < newSections.length - 1) {
            [newSections[index + 1], newSections[index]] = [newSections[index], newSections[index + 1]];
        }
        setSections(newSections);
    };

    // --- ৫. ফর্ম সাবমিট (Save Logic) ---
    const handleSubmit = async () => {
        if (!selectedSubCategory) return alert("Please select a Sub-Category first.");
        setLoading(true);

        const formData = new FormData();
        formData.append('subCategorySlug', selectedSubCategory);

        // সেকশনের ডেটা (ফাইল ছাড়া) একটি JSON স্ট্রিং হিসেবে যোগ করা
        // সার্ভারে শুধু ডেটা পাঠাতে হবে, ফাইল অবজেক্ট নয়
        const sectionsToSubmit = sections.map(sec => {
            const { imageFile, ...rest } = sec;
            return rest;
        });
        formData.append('sections', JSON.stringify(sectionsToSubmit));

        // ফাইল আপলোড করা
        sections.forEach((section) => {
            if (section.imageFile) {
                // সার্ভারের Multer-এর জন্য সঠিক fieldname ব্যবহার করা হলো: section_<id>_imageFile
                const fieldName = `section_${section.id}_imageFile`;
                formData.append(fieldName, section.imageFile);
            }
        });
        
        try {
            // ✅ POST API Call: /api/flexible-content/
            const response = await fetch(FLEXIBLE_CONTENT_API, {
                method: 'POST',
                body: formData, // FormData ব্যবহার করায় Content-Type: multipart/form-data স্বয়ংক্রিয়ভাবে সেট হয়ে যাবে
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || `API call failed with status: ${response.status}`);
            }

            // সফলভাবে সেভ হলে নতুন ডেটা লোড করা
            alert(`Content for ${selectedSubCategory} saved successfully!`);
            fetchFlexibleContent(selectedSubCategory);

        } catch (error) {
            console.error("Save Error:", error);
            alert(`Error saving content: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    
    // --- সেকশন রেন্ডারার কম্পোনেন্ট ---
    const SectionRenderer = ({ section, index }) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border-t-4 border-indigo-500 dark:border-yellow-500 space-y-4">
            
            {/* হেডার ও মুভ বাটন */}
            <div className="flex justify-between items-start pb-4 border-b dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    <span className="text-indigo-500 dark:text-yellow-400 mr-2">#{index + 1}</span> Content Block
                </h3>
                {/* Move Up/Down & Remove */}
                <div className="flex space-x-2">
                    <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-2 text-indigo-500 dark:text-yellow-400 bg-indigo-50 dark:bg-gray-700 rounded-full hover:bg-indigo-100 disabled:opacity-30 transition" title="Move Up"><ArrowUpDown className="w-4 h-4 transform -rotate-90" /></button>
                    <button onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1} className="p-2 text-indigo-500 dark:text-yellow-400 bg-indigo-50 dark:bg-gray-700 rounded-full hover:bg-indigo-100 disabled:opacity-30 transition" title="Move Down"><ArrowUpDown className="w-4 h-4 transform rotate-90" /></button>
                    <button onClick={() => removeSection(section.id)} className="p-2 text-red-500 bg-red-100 rounded-full hover:bg-red-200 transition" title="Remove Section"><Trash2 className="w-5 h-5" /></button>
                </div>
            </div>
            
            {/* সেকশন টাইপ ড্রপডাউন */}
            <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-1"><Grid3X3 className="w-4 h-4 mr-2"/>Section Layout Type</span>
                <select 
                    value={section.type}
                    onChange={(e) => handleSectionChange(section.id, 'type', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-900 dark:text-gray-300 focus:ring-indigo-500"
                >
                    <option value="banner">Full-Width Banner (Image + Text)</option>
                    <option value="text-image">Image Right, Text Left</option>
                    <option value="text-block">Only Text Block</option>
                    <option value="gallery">Small Gallery/Carousel</option>
                </select>
            </label>

            {/* হেডিং ইনপুট */}
            <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-1"><Heading className="w-4 h-4 mr-2"/>Heading (Optional)</span>
                <input 
                    type="text"
                    value={section.heading}
                    onChange={(e) => handleSectionChange(section.id, 'heading', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-900 dark:text-gray-300"
                />
            </label>

            {/* প্যারাগ্রাফ ইনপুট */}
            <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-1"><AlignLeft className="w-4 h-4 mr-2"/>Paragraph/Body Text</span>
                <textarea 
                    value={section.paragraph}
                    onChange={(e) => handleSectionChange(section.id, 'paragraph', e.target.value)}
                    rows="4"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-900 dark:text-gray-300"
                />
            </label>
            
            {/* --- ইমেজ সোর্স, অল্টার টেক্সট ও আপলোড --- */}
            {section.type !== 'text-block' && (
                <div className="border border-indigo-100 dark:border-indigo-900 p-4 rounded-lg space-y-3">
                    <h4 className="text-md font-semibold text-indigo-600 dark:text-yellow-400 flex items-center"><ImageIcon className="w-4 h-4 mr-2"/>Image Settings</h4>

                    {/* ইমেজ সোর্স টগল */}
                    <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 text-sm">
                            <input type="radio" name={`image-source-${section.id}`} checked={section.imageSourceType === 'upload'} onChange={() => handleSectionChange(section.id, 'imageSourceType', 'upload')} className="text-indigo-600"/> <span>New Upload / Existing Upload</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                            <input type="radio" name={`image-source-${section.id}`} checked={section.imageSourceType === 'gallery'} onChange={() => handleSectionChange(section.id, 'imageSourceType', 'gallery')} className="text-indigo-600"/> <span>From Gallery</span>
                        </label>
                    </div>
                    
                    {/* অল্টার টেক্সট ইনপুট */}
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-1"><ScrollText className="w-4 h-4 mr-2"/>Image Alt Text (SEO)</span>
                        <input 
                            type="text"
                            value={section.altText}
                            onChange={(e) => handleSectionChange(section.id, 'altText', e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-900 dark:text-gray-300"
                            placeholder="Describe the image content for screen readers and SEO"
                        />
                    </label>

                    {/* কন্ডিশনাল আপলোড/গ্যালারি ফিল্ড */}
                    {section.imageSourceType === 'upload' ? (
                        <label className="block border-t pt-3 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-1">Upload New Image / Keep Existing Image</span>
                            <input 
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSectionChange(section.id, 'imageFile', e.target.files[0])}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-yellow-100 dark:file:text-gray-900 hover:file:bg-indigo-100 dark:hover:file:bg-yellow-200"
                            />
                             {(section.imageURL && !section.imageFile) && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Current Image: **{section.imageURL.substring(0, 40)}...** (Will be kept unless a new file is uploaded)
                                </p>
                             )}
                        </label>
                    ) : (
                        <label className="block border-t pt-3 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-1">Select from Image Gallery</span>
                            <select 
                                value={section.galleryImageId}
                                onChange={(e) => handleGallerySelect(section.id, e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-900 dark:text-gray-300 focus:ring-indigo-500"
                            >
                                <option value="">-- Select an image from the gallery --</option>
                                {/* ডেমো গ্যালারি ইমেজেস */}
                                {dummyGalleryImages.map(img => (
                                    <option key={img.id} value={img.id}>{img.alt || img.id}</option>
                                ))}
                            </select>
                        </label>
                    )}
                    
                    {/* ইমেজ প্রিভিউ */}
                    {(section.imageURL || section.imageFile) && (
                        <div className="mt-3 w-40 h-24 overflow-hidden rounded-lg relative border dark:border-gray-700">
                            <img 
                                src={section.imageFile ? URL.createObjectURL(section.imageFile) : section.imageURL} 
                                alt={section.altText} 
                                className="w-full h-full object-cover"
                            />
                            <span className="absolute top-0 right-0 bg-indigo-600/80 text-white text-xs p-1 rounded-bl-lg">
                                {section.imageFile ? 'NEW FILE' : 'EXISTING'}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center"><Edit className="w-7 h-7 mr-2 text-indigo-600 dark:text-yellow-400"/>Flexible Page Content Manager</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Manage the dynamic content blocks for a specific sub-category page.</p>

            {/* --- সাব-ক্যাটাগরি ড্রপডাউন --- */}
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-8 flex flex-col md:flex-row gap-4 items-end">

                <label className="block w-full md:w-1/3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sub-Category (Page Slug)</span>
                    <select 
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-900 dark:text-gray-300"
                        disabled={loading}
                    >
                        <option value="">-- Select Sub-Category --</option>
                        {/* ✅ API থেকে লোড হওয়া Sub-Category Slugs এখানে দেখানো হবে */}
                        {allSubCategories.map(subCat => <option key={subCat} value={subCat}>{subCat}</option>)}
                    </select>
                </label>
                
                {allSubCategories.length === 0 && !loading && (
                    <p className="text-red-500 text-sm">❌ No Sub-Categories loaded. Check API: {SUBCATEGORIES_API}</p>
                )}
            </div>
            
            {/* --- মেইন Save বাটন (Sticky Header) --- */}
            <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 py-4 border-b dark:border-gray-700 flex justify-between items-center">
                 <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Editing: **{selectedSubCategory.toUpperCase() || 'Please Select a Page'}**</p>
                <button
                    onClick={handleSubmit}
                    // Save বাটন শুধুমাত্র তখনই সক্ষম হবে যখন একটি স্ল্যাগ সিলেক্ট করা হয়েছে এবং ডেটা লোড হয়েছে
                    disabled={loading || !selectedSubCategory || !dataLoaded} 
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                    Save All Sections ({sections.length} Blocks)
                </button>
            </div>
            
            {/* --- লোডিং/সেকশন লিস্ট --- */}
            {selectedSubCategory && !dataLoaded ? (
                 <div className="mt-8 text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-indigo-500 dark:text-yellow-400" />
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Loading content for **{selectedSubCategory}**...</p>
                 </div>
            ) : selectedSubCategory && dataLoaded ? (
                <div className="mt-8 space-y-6">
                    {sections.map((section, index) => (
                        <SectionRenderer key={section.id} section={section} index={index} />
                    ))}
                </div>
            ) : (
                 <div className="mt-8 text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">Please select a Sub-Category above to load or create new content blocks.</p>
                 </div>
            )}
            

            {/* --- নতুন সেকশন যোগ করার বাটন --- */}
            <div className="mt-10">
                <button
                    onClick={addSection}
                    type="button"
                    disabled={!selectedSubCategory || loading}
                    className="w-full py-3 border-2 border-dashed border-indigo-300 dark:border-yellow-400 text-indigo-600 dark:text-yellow-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 transition font-semibold flex items-center justify-center disabled:opacity-50"
                >
                    <Plus className="w-5 h-5 mr-2" /> Add New Content Section
                </button>
            </div>

        </div>
    );
}