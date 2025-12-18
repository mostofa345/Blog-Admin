import React, { useEffect, useMemo } from "react";
import { AlertTriangle, CheckCircle, Search, XCircle, Zap } from "lucide-react";
import { FormField } from "./SharedFormFields";

// components/add-resource/LiveSeoAnalyzer.jsx 
// ... (বাকি কোড)

// --- Helper Functions ---

// 1. Keyword Count
const countKeyword = (text, keyword) => {
    if (!text || !keyword) return 0;
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
    return (text.match(regex) || []).length;
};

// 2. Length Check
const checkLength = (text, min, max) => {
    const len = text ? text.length : 0;
    return {
        pass: len >= min && len <= max,
        current: len,
        min,
        max,
    };
};

// 3. Keyword Presence Check
const isKeywordPresent = (text, keyword) => {
    if (!text || !keyword) return false;
    return text.toLowerCase().includes(keyword.toLowerCase());
};


// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export default function LiveSeoAnalyzer({ formData, updateFormData, focusKeyword, setFocusKeyword }) {
    
    // Total word count for density calculation
    const totalWords = useMemo(() => {
        if (!formData.articleContent) return 0;
        const textOnly = formData.articleContent.replace(/<[^>]*>?/gm, ' ').trim();
        return textOnly.split(/\s+/).filter(Boolean).length;
    }, [formData.articleContent]);

    // Live Analysis Logic
    const analysisResults = useMemo(() => {
        const keyword = focusKeyword.trim();
        
        // --- Core Checks ---
        const checks = [
            // Check 1: Title Length & Keyword
            {
                id: 'titleLength',
                label: 'SEO Title Length (50-60 chars)',
                status: checkLength(formData.metaTitle, 50, 60).pass ? 'pass' : 'fail',
                details: `${checkLength(formData.metaTitle, 50, 60).current} chars.`,
            },
            {
                id: 'titleKeyword',
                label: 'Focus Keyword in SEO Title',
                status: isKeywordPresent(formData.metaTitle, keyword) ? 'pass' : 'fail',
                details: keyword ? `Keyword: "${keyword}"` : 'Please enter a Focus Keyword.',
            },
            
            // Check 2: Meta Description Length & Keyword
            {
                id: 'metaDescLength',
                label: 'Meta Description Length (150-160 chars)',
                status: checkLength(formData.metaDescription, 150, 160).pass ? 'pass' : 'fail',
                details: `${checkLength(formData.metaDescription, 150, 160).current} chars.`,
            },
            {
                id: 'metaDescKeyword',
                label: 'Focus Keyword in Meta Description',
                status: isKeywordPresent(formData.metaDescription, keyword) ? 'pass' : 'fail',
                details: keyword ? `Keyword: "${keyword}"` : 'Keyword required.',
            },
            
            // Check 3: Content & URL
            {
                id: 'contentLength',
                label: 'Content Length (> 1000 words)',
                status: totalWords >= 1000 ? 'pass' : (totalWords >= 500 ? 'warn' : 'fail'),
                details: `${totalWords} words found.`,
            },
            {
                id: 'urlKeyword',
                label: 'Focus Keyword in URL Slug',
                status: isKeywordPresent(formData.permalink, keyword) ? 'pass' : 'fail',
                details: `Slug: /${formData.permalink}`,
            },
            
            // Check 4: Keyword Density (1-3% is ideal)
            {
                id: 'keywordDensity',
                label: 'Keyword Density (1-3%)',
                calculate: () => {
                    if (totalWords === 0) return { density: 0, status: 'fail', count: 0 };
                    const count = countKeyword(formData.articleContent, keyword);
                    const density = (count / totalWords) * 100;
                    if (density >= 1.0 && density <= 3.0) return { density, status: 'pass', count };
                    if (density > 0.5 && density < 1.0 || density > 3.0) return { density, status: 'warn', count };
                    return { density, status: 'fail', count };
                },
                result: null, // Placeholder to be calculated
            },

            // Check 5: Image Alt Text
            {
                id: 'imageAlt',
                label: 'Focus Keyword in Cover Photo Alt Text',
                status: isKeywordPresent(formData.coverPhotoAlt, keyword) ? 'pass' : 'fail',
                details: `Alt Text: "${formData.coverPhotoAlt}"`,
            },
        ];

        // Calculate Density Separately
        const densityResult = checks.find(c => c.id === 'keywordDensity').calculate();
        checks.find(c => c.id === 'keywordDensity').result = densityResult;
        checks.find(c => c.id === 'keywordDensity').status = densityResult.status;
        checks.find(c => c.id === 'keywordDensity').details = `${densityResult.density.toFixed(2)}% (${densityResult.count} times)`;


        // Final Score Calculation
        const passedChecks = checks.filter(c => c.status === 'pass').length;
        const totalChecks = checks.length;
        let score = Math.round((passedChecks / totalChecks) * 80); // Max 80% from core checks
        
        // Bonus points for long content and internal linking (if you implement that later)
        if (totalWords >= 2000) score += 10;
        
        // Final Score clamping
        score = Math.min(100, score);
        
        // **১. এই লাইনটি মুছে ফেলা হলো (আগের কোডে লাইন ~139):** // updateFormData('seoScore', score);

        return { checks, score };

    }, [formData, focusKeyword, totalWords]); // **২. Dependency Array থেকে updateFormData মুছে ফেলা হলো**


    // 👇️ **৩. এই নতুন useEffect hook টি যোগ করা হলো (আগের কোডে লাইন ~144):**
    // এটি রেন্ডারিং শেষ হওয়ার পর স্টেট আপডেট করবে, ফলে ত্রুটি হবে না।
    useEffect(() => {
        const currentScore = analysisResults.score;
        
        // শুধুমাত্র স্কোর ভিন্ন হলেই আপডেট করুন, যাতে ইনফিনিট লুপ এড়ানো যায়
        if (formData.seoScore !== currentScore) {
            // updateFormData ফাংশনটি কল করুন
            updateFormData('seoScore', currentScore); 
        }
    }, [analysisResults.score, formData.seoScore, updateFormData]);
    // 👆️ নতুন useEffect hook এর শেষ


    // Icon map
    const StatusIcon = ({ status }) => {
        switch (status) {
            case 'pass':
                return <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />;
            case 'warn':
                return <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
            case 'fail':
            default:
                return <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
        }
    };


    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-500" />
                3A. Live SEO Analyzer (Yoast/Rank Math Style)
            </h2>

            {/* Focus Keyword Input */}
            <FormField 
                id="focusKeyword"
                label="Primary Focus Keyword"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)} // Local state update
                placeholder="e.g., Best Next.js SEO practices"
                required={false}
                note="Enter the main keyword to analyze your content's SEO performance."
            />
            
            {/* Live Score Display */}
            <div className={`mt-6 p-4 rounded-lg flex justify-between items-center ${analysisResults.score > 80 ? 'bg-green-100 dark:bg-green-900/50 border-green-500' : analysisResults.score > 50 ? 'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-500' : 'bg-red-100 dark:bg-red-900/50 border-red-500'} border-l-4 shadow-md`}>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Zap className="w-6 h-6" />
                    SEO Score:
                </span>
                <span className="text-3xl font-extrabold">{analysisResults.score}%</span>
            </div>

            {/* Analysis List */}
            <div className="mt-6 space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Analysis Breakdown:</h3>
                {analysisResults.checks.map((check) => (
                    <div key={check.id} className="flex items-start p-2 border-b dark:border-gray-700 last:border-b-0">
                        <StatusIcon status={check.status} />
                        <div className="ml-3 flex-grow">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{check.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{check.details}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                **Note:** Score is calculated based on keyword placement, content length, and meta-data length.
            </p>
        </div>
    );
}

// ----------------------------------------------------------------------
// CheckboxField Component (Re-added from SharedFormFields.jsx for dependency)
// ----------------------------------------------------------------------
/* **NOTE:** The actual CheckboxField component should be imported from your 
    '../../../components/add-resource/SharedFormFields' file in a real project.
    I am assuming it exists there.
*/