"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { 
    FileText, LayoutDashboard, Menu, Moon, Settings, Sun, Users,
    Grid3X3, MessageSquare, Mail, Image, ChevronDown, BookOpen, 
    List, Plus, Brush, Globe, Monitor, SearchCheck, Home,
    MonitorPlay, Link as LinkIcon, ListOrdered, Target, CheckCircle2, X
} from "lucide-react"; 

// --- Custom Theme Hook ---
const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) return savedTheme;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    return { theme, toggleTheme };
};

// --- Your Full Menu Data Structure ---
const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { 
        name: 'Article', 
        icon: BookOpen,
        subItems: [
            { name: 'Add New Post', path: '/article/create', icon: Plus },
            { name: 'Artical-List', path: '/article', icon: List },
            { name: 'Banner', path: '/hero', icon: Settings },
            { name: 'Related Reads Manager', path: '/content/related-reads', icon: LinkIcon },
            { name: 'Top Topics Manager', path: '/content/top-topics', icon: ListOrdered },
            { name: 'Next Read Spotlight', path: '/content/next-read-spotlight', icon: Target },
        ]
    },
    { 
        name: 'Blog', 
        icon: BookOpen,
        subItems: [
            { name: 'Add New Post', path: '/blog/create', icon: Plus },
            { name: 'Blog-List', path: '/blog', icon: List },
            { name: 'Popular-Post', path: '/blog/popular-posts', icon: List },
            { name: 'Banner', path: '/flexible-content', icon: Settings },
        ]
    },
    { 
        name: 'Categories', 
        icon: Grid3X3,
        subItems: [
            { name: 'Category List', path: '/dashboard/categories', icon: List },
            { name: 'Add Category', path: '/dashboard/categories/create', icon: Plus }, 
            { name: 'Sub-Category List', path: '/dashboard/subcategories', icon: List },
            { name: 'Add Sub-Category', path: '/dashboard/subcategories/create', icon: Plus },
            { name: 'Edite-Category', path: '/categories/edite', icon: Plus }, 
            { name: 'SubCategorySettings', path: '/subcategories/sub-category-settings', icon: Plus },
        ]
    },
    { 
        name: 'Home Page', 
        icon: Home,
        subItems: [
            { name: 'Hero Section', path: '/home/hero' },
            { name: 'Top Destinations', path: '/home/destinations' },
            { name: 'Latest Stories', path: '/home/stories' },
            { name: 'Trekker Highlights', path: '/home/highlights' },
            { name: 'Newsletter CTA', path: '/home/newsletter' },
        ]
    },
    { 
        name: 'Manage Footer', 
        icon: LayoutDashboard,
        subItems: [
            { name: 'Footer Top Menu', icon: ListOrdered, path: '/footer/columns' },
            { name: 'Footer Menu', path: '/footer/menu', icon: List },
            { name: 'Social Links', path: '/footer/social', icon: LinkIcon },
            { name: 'Copyright Info', path: '/footer/copyright', icon: FileText },
            { name: 'About-Us', path: '/dashboard/about', icon: Plus },
            { name: 'Team', path: '/dashboard/team', icon: Plus }, 
            { name: 'Mission & Vision', path: '/dashboard/mission', icon: Plus },
            { name: 'FAQ', path: '/dashboard/faq', icon: Plus },
            { name: 'Terms of Service', path: '/dashboard/service', icon: Plus }, 
            { name: 'Privacy Policy', path: '/dashboard/privacy-policy', icon: Plus },
            { name: 'Disclaimer', path: '/dashboard/disclaimer', icon: Plus },
            { name: 'Affiliate Disclosure', path: '/dashboard/affiliate-disclosure', icon: Plus }, 
            { name: 'Press & Media', path: '/dashboard/media', icon: Plus },
            { name: 'Careers', path: '/dashboard/careers', icon: Plus },
            { name: 'Advertise with Us', path: '/dashboard/advertise', icon: Plus },
        ]
    },
    { name: 'Comments', path: '/dashboard/comments', icon: MessageSquare },
    { name: 'Massage', path: '/dashboard/massage', icon: MessageSquare },
    { name: 'Feedback', path: '/dashboard/feedback', icon: MessageSquare },
    { name: 'Users', path: '/dashboard/users', icon: Users },
    { name: 'Subscribers', path: '/dashboard/subscribers', icon: Mail },
    { name: 'Media Library', path: '/dashboard/media', icon: Image },
    { name: 'Author Management', path: '/dashboard/authors', icon: Users },
    { 
        name: "Settings", 
        icon: Settings, 
        subItems: [
            { name: "General Settings", path: "/dashboard/settings/general", icon: Brush },
            { name: "Language Management", path: "/dashboard/settings/language", icon: Globe },
            { name: "SEO Management", path: "/dashboard/settings/seo", icon: SearchCheck },
            { name: "Basic Info", path: "/dashboard/settings/info", icon: SearchCheck },
            { name: "Favicon", path: "/dashboard/settings/favicon", icon: Globe },
            { name: "Seo", path: "/dashboard/settings/seo", icon: CheckCircle2 },
            { name: "Access Control Center", path: "/dashboard/settings/access", icon: CheckCircle2 },
        ]
    },
    { name: 'Reports', path: '/dashboard/reports', icon: LayoutDashboard },
    { name: 'Analytics', path: '/dashboard/analytics', icon: LayoutDashboard },
    { name: 'Maintenance', path: '/dashboard/maintenance', icon: LayoutDashboard },
    { name: 'My Account', icon: Settings, path: "/dashboard/my-account" },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <>
            <aside className={`
                fixed top-0 left-0 h-full bg-white dark:bg-[#0f172a] border-r border-gray-200 dark:border-slate-800 
                transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-[60] shadow-2xl lg:shadow-none
                ${isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 lg:w-72"}
            `}>
                <div className="flex flex-col h-full p-5">
                    
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3">
                                <Brush className="text-white" size={22} />
                            </div>
                            <div className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 tracking-tight">
                                Admin Panel
                            </div>
                        </div>
                        <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500">
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="space-y-1.5 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                        {navItems.map((item) => (
                            <SidebarItem 
                                key={item.name} 
                                item={item} 
                                pathname={pathname} 
                                closeMobileMenu={toggleSidebar}
                            />
                        ))}
                    </nav>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                        <button 
                            onClick={toggleTheme} 
                            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30"
                        >
                            <div className="flex items-center gap-3">
                                {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-blue-600" />}
                                <span className="font-bold text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-6' : 'left-1'}`}></div>
                            </div>
                        </button>
                    </div>
                </div>
            </aside>

            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] lg:hidden transition-opacity duration-300"
                    onClick={toggleSidebar}
                ></div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
            `}</style>
        </>
    );
}

function SidebarItem({ item, pathname, closeMobileMenu }) {
    const [isOpen, setIsOpen] = useState(false);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    
    // Check if current path matches item or its sub-items
    const isActive = pathname === item.path || item.subItems?.some(s => pathname === s.path);

    return (
        <div className="mb-1">
            {hasSubItems ? (
                <div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group
                            ${isActive 
                                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                                : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={19} className={`${isActive ? "text-blue-600" : "group-hover:text-blue-500"} transition-colors`} />
                            <span className="font-bold text-[13.5px] tracking-wide">{item.name}</span>
                        </div>
                        <ChevronDown size={15} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    
                    {isOpen && (
                        <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 dark:border-slate-800 space-y-1">
                            {item.subItems.map((sub) => (
                                <Link
                                    key={sub.name}
                                    href={sub.path}
                                    onClick={() => window.innerWidth < 1024 && closeMobileMenu()}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all
                                        ${pathname === sub.path 
                                            ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/5" 
                                            : "text-gray-500 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400"
                                        }`}
                                >
                                    {sub.icon && <sub.icon size={14} />}
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <Link
                    href={item.path}
                    onClick={() => window.innerWidth < 1024 && closeMobileMenu()}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group
                        ${pathname === item.path 
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30" 
                            : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white"
                        }`}
                >
                    <item.icon size={19} />
                    <span className="font-bold text-[13.5px] tracking-wide">{item.name}</span>
                    {pathname === item.path && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>}
                </Link>
            )}
        </div>
    );
}