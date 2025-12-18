import React from "react";
// 🚨 FIX 2: Calendar, Clock, and BookOpen icons are imported from lucide-react.
import { 
    Image as ImageIcon, 
    Link as LinkIcon, 
    MessageCircle, 
    Monitor, 
    Smartphone, 
    Tablet, 
    Zap,
    Calendar, // Added Calendar
    Clock,    // Added Clock
    BookOpen  // Added BookOpen (used later in the file)
} from "lucide-react";

// 💡 Props:
// formData: Article data state (for title/content placeholder)
// previewMode: Current device mode ('desktop', 'tablet', 'mobile')
// setPreviewMode: Function to change the device mode

const ArticleLivePreview = ({ formData, previewMode, setPreviewMode }) => {
    
    // Check if the current resource is an Article or Blog
    const isArticle = formData.contentType === 'Article'; 
    const resourceType = formData.contentType || 'Resource';
    
    // FIX: Guard against formData.usefulGuideLinks being undefined
    const validGuideLinks = (formData.usefulGuideLinks || []).filter(link => link.text && link.url);
    // FIX/UPDATE: hasSidebarContent now only checks for validGuideLinks
    const hasSidebarContent = validGuideLinks.length > 0;
    
    // Check for FAQ/Suggested Resources content
    // NOTE: formData.suggestedResources must be checked instead of suggestedBlogs as per model changes
    const hasFooterContent = formData.schemaType === 'FAQPage' && formData.faqEntries.filter(f => f.question && f.answer).length > 0 || (formData.suggestedResources && formData.suggestedResources.length > 0);
    
    const imageSource = formData.coverPhotoFile 
        ? URL.createObjectURL(formData.coverPhotoFile)
        : formData.coverPhotoUrl;
        
    // Custom width for the preview frame based on the mode
    const previewWidth = previewMode === 'desktop' ? '100%' : previewMode === 'tablet' ? '768px' : '375px';

    // Tailwind Class for the preview frame container
    const previewContainerClass = previewMode === 'desktop'
        ? 'w-full'
        : 'mx-auto transition-all duration-300 shadow-2xl border-4 border-gray-800 dark:border-gray-100 rounded-3xl';

    const defaultContent = 'Your article content preview will appear here. Headings, lists, and colors from the editor will display correctly now.';

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                <Monitor className="w-5 h-5 mr-2" /> Article Live Preview
            </h3>
            
            {/* Device Mode Selector */}
            <div className="flex justify-center space-x-2 mb-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow">
                <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-2 rounded-lg transition ${previewMode === 'desktop' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    title="Desktop View"
                >
                    <Monitor className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setPreviewMode('tablet')}
                    className={`p-2 rounded-lg transition ${previewMode === 'tablet' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    title="Tablet View"
                >
                    <Tablet className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-2 rounded-lg transition ${previewMode === 'mobile' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    title="Mobile View"
                >
                    <Smartphone className="w-5 h-5" />
                </button>
            </div>
            
            {/* Preview Frame */}
            <div className={previewContainerClass} style={{ width: previewWidth }}>
                <div className={`bg-white dark:bg-gray-900 overflow-y-auto max-h-[70vh] p-4 ${previewMode !== 'desktop' ? 'rounded-2xl' : 'rounded-lg'}`}>
                    
                    {/* Article Layout Structure */}
                    <article className="relative">
                        
                        {/* Article Header (Title and Cover Image) */}
                        <header className="mb-6">
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
                                {formData.title || 'Sample Article Title Goes Here'}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                
                                By <span className="font-semibold">{formData.author || 'Admin'}</span> | 
                                {/* 🚨 FIX 2: Calendar icon is now correctly imported and used */}
                                <Calendar className="w-3 h-3 inline mr-1 ml-2" /> Published: Today | 
                                {/* 🚨 FIX 2: Clock icon is now correctly imported and used */}
                                <Clock className="w-3 h-3 inline mr-1 ml-2" /> Read Time: {formData.readTime || '5 min'}
                            </p>
                            
                            {/* Cover Photo */}
                            {imageSource && (
                                <div className="rounded-xl overflow-hidden shadow-lg mb-6">
                                    {/* Placeholder image or actual uploaded image */}
                                    <img 
                                        src={imageSource} 
                                        alt={formData.coverPhotoAlt || 'Article Cover Image'} 
                                        className="w-full h-auto object-cover max-h-96"
                                        loading={formData.isLazyLoad ? 'lazy' : 'eager'}
                                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/1200x400/1e293b/94a3b8?text=Placeholder+Image" }}
                                    />
                                </div>
                            )}
                            
                            {/* Expert Summary */}
                            <p className="p-4 border-l-4 border-indigo-500 bg-indigo-50 dark:bg-gray-800 dark:border-indigo-400 text-gray-800 dark:text-gray-300 italic mb-6 rounded-r-lg">
                                {formData.expertSummary || 'This is a brief summary of the article content.'}
                            </p>
                        </header>

                        {/* Main Content Area */}
                        <div className={`
                            ${hasSidebarContent ? 'lg:grid lg:grid-cols-12 lg:gap-8' : ''}
                        `}>
                            
                            {/* Article Body (Main Column) */}
                            <div className={`
                                ${hasSidebarContent ? 'lg:col-span-9' : 'lg:col-span-12'}
                            `}>
                                {/* Typography classes for Rich Text Content */}
                                <div 
                                    className="prose dark:prose-invert prose-lg max-w-none transition-colors duration-200"
                                    dangerouslySetInnerHTML={{ __html: formData.articleContent || defaultContent }} 
                                />
                            </div>

                            {/* Sidebar (Useful Links) */}
                            {hasSidebarContent && (
                                <aside className="lg:col-span-3 mt-8 lg:mt-0 sticky top-4">
                                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
                                        <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white flex items-center">
                                            <LinkIcon className="w-4 h-4 mr-2" /> Useful Links
                                        </h3>
                                        <ul className="space-y-2 text-sm">
                                            {validGuideLinks.map((link, index) => (
                                                <li key={link.frontendId || index} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                                        <Zap className="w-3 h-3 mr-1" /> {link.text}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </aside>
                            )}
                        </div>
                        
                        {/* Footer (FAQ/Suggested Resources) */}
                        {hasFooterContent && (
                            <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 space-y-6">
                                
                                {/* Suggested Resources */}
                                {formData.suggestedResources && formData.suggestedResources.length > 0 && (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg border border-green-200 dark:border-green-700">
                                        <h4 className="font-bold text-md mb-2 text-green-600 dark:text-green-400 flex items-center">
                                            <BookOpen className="w-4 h-4 mr-1"/> Suggested Articles/Resources
                                        </h4>
                                        <div className="space-y-1 text-sm">
                                            {formData.suggestedResources.map((permalink, index) => (
                                                <p key={index} className="text-gray-700 dark:text-gray-300 flex items-center">
                                                    <LinkIcon className="w-3 h-3 mr-1" /> {permalink}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* FAQ Schema Preview */}
                                {formData.schemaType === 'FAQPage' && formData.faqEntries.filter(f => f.question && f.answer).length > 0 && (
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                        <h4 className="font-bold text-md mb-2 text-indigo-600 dark:text-indigo-400 flex items-center">
                                            <MessageCircle className="w-4 h-4 mr-1"/> FAQ Schema Preview
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                            {formData.faqEntries.filter(f => f.question && f.answer).map((faq, index) => (
                                                <div key={index} className="border-b last:border-b-0 pb-2">
                                                    <p className="font-semibold text-gray-900 dark:text-white">Q: {faq.question}</p>
                                                    <p className="text-gray-700 dark:text-gray-300">A: {faq.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </footer>
                        )}

                    </article>

                    
                </div>
            </div>
        </div>
    );
};

export default ArticleLivePreview;