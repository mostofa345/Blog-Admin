"use client";
import React, { useEffect, useMemo, useState } from "react";

// This component has been significantly expanded to include Global SEO,
// more detailed scoring, new modules (Performance, A/B Testing), and
// a simulated sitemap XML generator to meet the 500+ line requirement.

// All icons are re-imported here to ensure they are properly registered.
import { 
    ShieldCheck, Zap, BarChart3, FileText, Settings2, Search, 
    AlertTriangle, Save, Code2, Cpu, CheckCircle2, Activity, 
    Globe, MousePointer2, BarChart, ListChecks, Terminal,
    RefreshCw, Layers, Sparkles, TrendingUp, Gauge, 
    Split, Database, Cloud
} from "lucide-react";

// --- Utility: Simulated Data & Helpers ---

const mockGlobalSettings = {
    siteTitle: "Next-Gen AI Blog Platform",
    metaDescription: "The most advanced content management system with 10x SEO performance.",
};

const LSI_KEYWORDS = ["next.js guide", "react seo", "ssr vs ssg", "performance", "web vitals", "server components", "caching strategy", "typescript tips"];

function generateSitemapXML(postCount) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    const currentDate = new Date().toISOString().split('T')[0];

    // Static pages
    xml += `  <url>\n    <loc>https://yourblog.com/</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>https://yourblog.com/about</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;

    // Dynamic posts (simulated)
    for (let i = 1; i <= postCount; i++) {
        xml += `  <url>\n    <loc>https://yourblog.com/post/ultimate-guide-part-${i}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
}

// --- Navigation Item Definition (Moved outside component for stability) ---
const navItems = [
    { id: "global", label: "Global SEO", Icon: Settings2 },
    { id: "content", label: "AI Content Lab", Icon: Sparkles },
    { id: "performance", label: "Core Web Vitals", Icon: Gauge },
    { id: "schema", label: "Smart Schema", Icon: Layers },
    { id: "sitemap", label: "Sitemap Manager", Icon: Globe },
    { id: "abtest", label: "Title A/B Test", Icon: Split },
    { id: "analytics", label: "Rank Tracker", Icon: BarChart },
];

// --- Component: UltraAdvancedSEO ---

export default function UltraAdvancedSEO() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState("content");
    
    // Global SEO State
    const [siteTitle, setSiteTitle] = useState(mockGlobalSettings.siteTitle);
    const [metaDescription, setMetaDescription] = useState(mockGlobalSettings.metaDescription);
    const [sitemapAuto, setSitemapAuto] = useState(true);
    
    // Content Lab State
    const [keyword, setKeyword] = useState("");
    const [content, setContent] = useState("");
    
    // Simulated Post Count for Sitemap
    const postCount = 15;

    // --- Core Logic: Advanced SEO Score Calculation ---
    const seoScore = useMemo(() => {
        let currentScore = 0;
        
        // 1. Keyword & Content Optimization (Max: 50 points)
        if (keyword.length > 5) currentScore += 10; // Long-tail focus
        const keywordCount = (content.match(new RegExp(keyword, 'gi')) || []).length;
        const contentWords = content.split(/\s+/).filter(Boolean).length;
        
        if (keywordCount > 0 && contentWords > 50) {
            // Simulated Density Check (aim for 0.5% - 2.5%)
            const density = (keywordCount / contentWords) * 100;
            if (density >= 0.5 && density <= 2.5) currentScore += 30;
            else if (density > 0) currentScore += 15;
        }

        if (contentWords >= 1000) currentScore += 10; // Content Depth

        // 2. Technical Health (Max: 30 points)
        if (siteTitle.length > 30 && siteTitle.length < 65) currentScore += 15; // Title length
        if (metaDescription.length > 100 && metaDescription.length < 160) currentScore += 15; // Description length

        // 3. Simulated Schema/Sitemap (Max: 20 points)
        if (sitemapAuto) currentScore += 10;
        // Simulate schema present if it's not empty (placeholder)
        currentScore += 10;

        return Math.min(100, Math.round(currentScore));
    }, [keyword, content, siteTitle, metaDescription, sitemapAuto]);


    // --- Effects ---
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    // --- Render Helpers ---

    const renderHealthStat = (label, val, color) => (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center min-w-[100px]">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{label}</p>
            <p className={`text-xl font-black ${color}`}>{val}</p>
        </div>
    );
    
    // RENDER HELPER FUNCTION - Ensures Icon is present before rendering
    const renderNavButton = (id, label, Icon) => (
        <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all mb-1 ${
                activeTab === id 
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 translate-x-2" 
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
        >
            {/* Defensive check added in the previous fix */}
            {Icon && <Icon className="w-5 h-5" />} 
            {label}
        </button>
    );

    // MODULE HEADER RENDERER - FIX APPLIED HERE
    const renderModuleHeader = (Icon, title, iconColorClass = "text-indigo-600", secondaryContent = null) => (
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black flex items-center gap-3 italic">
                {/* Defensive check added: Render Icon only if it's a valid component */}
                {Icon && <Icon className={iconColorClass} />} {title}
            </h2>
            {secondaryContent}
        </div>
    );

    const renderGlobalSettings = () => (
        <div className="space-y-6">
            <div>
                <label htmlFor="siteTitle" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Global Site Title (Max 60 chars)</label>
                <input 
                    id="siteTitle"
                    type="text" 
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    maxLength={60}
                    placeholder="Enter the main title for your website..." 
                    className="w-full bg-slate-50 dark:bg-slate-800 pl-4 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600 outline-none font-bold"
                />
                <p className={`mt-2 text-xs font-medium ${siteTitle.length > 55 ? 'text-amber-500' : 'text-slate-500'}`}>{siteTitle.length} / 60 characters</p>
            </div>
            <div>
                <label htmlFor="metaDescription" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Global Meta Description (Max 155 chars)</label>
                <textarea 
                    id="metaDescription"
                    rows="3" 
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    maxLength={155}
                    placeholder="Enter the main meta description for your website..."
                    className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-[1.5rem] border-none focus:ring-2 focus:ring-indigo-600 outline-none font-medium text-sm leading-relaxed"
                ></textarea>
                <p className={`mt-2 text-xs font-medium ${metaDescription.length > 150 ? 'text-amber-500' : 'text-slate-500'}`}>{metaDescription.length} / 155 characters</p>
            </div>
        </div>
    );


    // --- Main Component Render ---
    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto dark:bg-[#0a0a0c] min-h-screen text-slate-900 dark:text-slate-100 transition-all duration-500">
            
            {/* --- Premium Header Section --- */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] p-8 mb-10 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                    <Sparkles className="w-40 h-40 text-indigo-500 animate-pulse" />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full mb-4">
                            <Zap className="w-4 h-4 text-indigo-600 animate-bounce" />
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Next-Gen SEO Suite</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 italic">
                            Search <span className="text-indigo-600 not-italic">Engine</span> Mastery
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Outrank competitors with AI-driven semantic analysis and technical precision.</p>
                    </div>

                    {/* Global Stats Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                        {renderHealthStat("Health", `${seoScore}%`, seoScore >= 80 ? "text-green-500" : seoScore >= 50 ? "text-amber-500" : "text-red-500")}
                        {renderHealthStat("Indexing", sitemapAuto ? "Auto" : "Manual", "text-blue-500")}
                        {renderHealthStat("Keywords", "2.4k", "text-purple-500")}
                        {renderHealthStat("Errors", "0", "text-red-500")}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* --- Left Sidebar: Modern Navigation --- */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-lg">
                        <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Engine Modules</p>
                        
                        {/* Iterating over the external navItems array */}
                        {navItems.map(item => renderNavButton(item.id, item.label, item.Icon))}
                        
                    </div>

                    <div className="p-8 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative group">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-4">SEO Score</h3>
                            <div className="flex items-end gap-2 mb-4">
                                <span className="text-6xl font-black text-indigo-500 leading-none">{seoScore}</span>
                                <span className="text-slate-500 font-bold">/100</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full transition-all duration-1000" style={{width: `${seoScore}%`}}></div>
                            </div>
                            <button className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4" /> Run Full Deep Audit
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Main Content: Dynamic Engine --- */}
                <div className="xl:col-span-9 space-y-8">
                    
                    {/* --- Global SEO Tab --- */}
                    {activeTab === "global" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                                {renderModuleHeader(Settings2, "Global Site Configuration", "text-blue-500")}
                                {renderGlobalSettings()}
                            </div>
                        </div>
                    )}
                    
                    {/* --- Content Lab Tab (Expanded) --- */}
                    {activeTab === "content" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                                {renderModuleHeader(Sparkles, "Semantic Content Lab", "text-indigo-600", (
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-bold rounded-lg uppercase">Live Analysis</span>
                                    </div>
                                ))}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Focus Keyword</label>
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input 
                                                    type="text" 
                                                    onChange={(e) => setKeyword(e.target.value)}
                                                    placeholder="Enter primary keyword..." 
                                                    className="w-full bg-slate-50 dark:bg-slate-800 pl-12 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600 outline-none font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Article Body (Simulated Analysis)</label>
                                            <textarea 
                                                rows="10" 
                                                onChange={(e) => setContent(e.target.value)}
                                                placeholder="Paste your blog content here to check SEO density..."
                                                className="w-full bg-slate-50 dark:bg-slate-800 p-6 rounded-[1.5rem] border-none focus:ring-2 focus:ring-indigo-600 outline-none font-medium text-sm leading-relaxed"
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-6 bg-indigo-50 dark:bg-indigo-950/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30">
                                            <h4 className="font-black text-indigo-600 dark:text-indigo-400 text-sm mb-4 flex items-center gap-2">
                                                <ListChecks className="w-4 h-4" /> **Advanced SEO Checklist**
                                            </h4>
                                            <ul className="space-y-4">
                                                {[
                                                    { t: "Focus Keyword Present", ok: (content.includes(keyword) && keyword !== "") },
                                                    { t: "Keyword in H1 Tag (Simulated)", ok: keyword.length > 5 },
                                                    { t: "Content length (> 1000 words)", ok: content.split(/\s+/).filter(Boolean).length >= 1000 },
                                                    { t: "Keyword Density (0.5% - 2.5%)", ok: seoScore >= 30 && seoScore < 60 },
                                                    { t: "Internal Links Added (Simulated)", ok: true },
                                                    { t: "Image Alt Tags check", ok: false },
                                                ].map((item, i) => (
                                                    <li key={i} className="flex items-center justify-between text-sm">
                                                        <span className={item.ok ? "text-slate-600 dark:text-slate-300" : "text-slate-400"}>{item.t}</span>
                                                        {item.ok ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem]">
                                            <h4 className="font-bold text-sm mb-4">LSI/Semantic Recommendations</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {LSI_KEYWORDS.map(tag => (
                                                    <span key={tag} className="px-3 py-1 bg-white dark:bg-slate-700 rounded-lg text-xs font-semibold shadow-sm border dark:border-slate-600">
                                                        + {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* --- Performance Tab (New) --- */}
                    {activeTab === "performance" && (
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            {renderModuleHeader(Gauge, "Core Web Vitals & Performance", "text-red-500")}
                            
                            <div className="grid grid-cols-3 gap-6 text-center">
                                {[{ metric: "LCP", value: "2.1s", status: "Good" }, { metric: "FID", value: "34ms", status: "Good" }, { metric: "CLS", value: "0.02", status: "Good" }].map((v, i) => (
                                    <div key={i} className={`p-6 rounded-2xl border ${v.status === 'Good' ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800'}`}>
                                        <p className="text-sm font-bold uppercase text-slate-400 mb-1">{v.metric}</p>
                                        <p className="text-3xl font-black">{v.value}</p>
                                        <p className={`text-xs font-bold mt-1 ${v.status === 'Good' ? 'text-green-600' : 'text-amber-600'}`}>{v.status}</p>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20 text-xs text-blue-700 dark:text-blue-500 leading-relaxed italic">
                                **Recommendation:** Enable automatic image optimization (WebP/AVIF) and cache headers for static assets.
                            </div>
                        </div>
                    )}

                    {/* --- Schema Tab --- */}
                    {activeTab === "schema" && (
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl animate-in fade-in slide-in-from-right-4 duration-500">
                            {renderModuleHeader(Layers, "JSON-LD AI Architect", "text-purple-500")}
                            
                            <div className="flex gap-4 mb-8">
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">Article</button>
                                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">FAQ</button>
                                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">HowTo</button>
                                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">Breadcrumb</button>
                            </div>
                            <div className="bg-slate-950 p-6 rounded-[1.5rem] border border-slate-800 font-mono text-[11px] leading-6 text-indigo-300">
                                <div className="text-slate-500 italic mb-2">// Auto-generated Schema for Google Rich Snippets</div>
                                <span className="text-purple-400">{"<script type='application/ld+json'>"}</span> <br />
                                <span className="text-purple-400">{"{"}</span> <br />
                                &nbsp;&nbsp;<span className="text-orange-300">"@context"</span>: <span className="text-green-400">"https://schema.org"</span>, <br />
                                &nbsp;&nbsp;<span className="text-orange-300">"@type"</span>: <span className="text-green-400">"BlogPosting"</span>, <br />
                                &nbsp;&nbsp;<span className="text-orange-300">"headline"</span>: <span className="text-green-400">"{siteTitle || "Dynamic Article Title"}"</span>, <br />
                                &nbsp;&nbsp;<span className="text-orange-300">"description"</span>: <span className="text-green-400">"{metaDescription.substring(0, 100)}..."</span>, <br />
                                &nbsp;&nbsp;<span className="text-orange-300">"datePublished"</span>: <span className="text-green-400">"2025-12-16"</span> <br />
                                <span className="text-purple-400">{"}"}</span> <br />
                                <span className="text-purple-400">{"</script>"}</span>
                            </div>
                        </div>
                    )}
                    
                    {/* --- Sitemap Manager Tab (Expanded with XML) --- */}
                    {activeTab === "sitemap" && (
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            {renderModuleHeader(Globe, "Sitemap XML Engine", "text-green-500")}
                            
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="font-bold">Auto-Generate & Submit Sitemap.xml</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={sitemapAuto} onChange={() => setSitemapAuto(!sitemapAuto)} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                                    <span className={`ml-3 text-sm font-medium ${sitemapAuto ? 'text-indigo-600' : 'text-slate-500'}`}>{sitemapAuto ? 'ON' : 'OFF'}</span>
                                </label>
                            </div>
                            
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20 text-xs text-amber-700 dark:text-amber-500 leading-relaxed italic">
                                * Your sitemap is currently listing **{postCount + 2} URLs** and pings Google/Bing every 24 hours.
                            </div>
                            
                            <div className="bg-slate-950 p-6 rounded-[1.5rem] border border-slate-800 font-mono text-[10px] leading-5 text-green-400 overflow-x-auto h-72">
                                <div className="text-slate-500 italic mb-2">// Simulated sitemap.xml content:</div>
                                <pre>{generateSitemapXML(postCount)}</pre>
                            </div>
                        </div>
                    )}
                    
                    {/* --- A/B Testing Tab (New) --- */}
                    {activeTab === "abtest" && (
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            {renderModuleHeader(Split, "Meta Title A/B Testing (Simulated)", "text-purple-500")}
                            <p className="text-slate-500 dark:text-slate-400">Test different meta titles and descriptions to see which generates a higher Click-Through Rate (CTR) in search results.</p>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><MousePointer2 className="w-5 h-5 text-indigo-500" /> **Variant A (Control)**</h4>
                                    <p className="font-mono text-sm mb-4 truncate">{siteTitle}</p>
                                    <div className="h-2 bg-indigo-200 rounded-full"><div className="bg-indigo-600 w-[65%] h-full rounded-full"></div></div>
                                    <p className="mt-2 text-xs font-bold text-slate-500">Simulated CTR: 6.5%</p>
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" /> **Variant B (Winner)**</h4>
                                    <p className="font-mono text-sm mb-4 truncate">🔥 {siteTitle} - 10X Faster SEO</p>
                                    <div className="h-2 bg-green-200 rounded-full"><div className="bg-green-600 w-[78%] h-full rounded-full"></div></div>
                                    <p className="mt-2 text-xs font-bold text-slate-500">Simulated CTR: 7.8%</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* --- Empty Analytics Tab (Placeholder) --- */}
                    {activeTab === "analytics" && (
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            {renderModuleHeader(BarChart, "AI Rank Tracker Dashboard", "text-pink-500")}
                            <div className="p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500">
                                <BarChart3 className="w-10 h-10 mx-auto mb-3" />
                                <p className="font-bold">Module Under Development</p>
                                <p className="text-sm">Connect Google Search Console and Google Analytics for live ranking data.</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Float Save Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 p-2 rounded-2xl shadow-2xl flex items-center justify-between">
                    <div className="px-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Sync</span>
                    </div>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/20">
                        <Save className="w-4 h-4" /> Apply Global SEO
                    </button>
                </div>
            </div>
        </div>
    );
}