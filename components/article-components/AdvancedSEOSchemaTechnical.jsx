// components/add-resource/AdvancedSEOSchemaTechnical.jsx
import React from 'react';
import { BookOpen, List, Plus, Trash2 } from 'lucide-react';

// ✅ FIX: SelectField ke FormSelect naam-e import kora holo
import { FormField, SelectField as FormSelect, TextAreaField } from "./SharedFormFields"; 

const AdvancedSEOSchemaTechnical = ({ formData, handleChange, handleFAQChange, addFAQ, removeFAQ }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-red-500" />
                5. Advanced SEO, Schema & Technical Fields
            </h2>

            {/* Top Row: Schema, Pillar Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Schema Type Selector */}
                <FormSelect // Now correctly recognizes SelectField as FormSelect
                    label="Structured Data (Schema Type)"
                    id="schemaType"
                    value={formData.schemaType}
                    onChange={handleChange}
                    required={false}
                    defaultOptionText="Select Schema"
                    options={[
                        { id: 'BlogPosting', name: 'Blog Posting (Default)' },
                        { id: 'Article', name: 'Article' },
                        { id: 'NewsArticle', name: 'News Article' },
                        { id: 'FAQPage', name: 'FAQ Page' },
                        { id: 'HowTo', name: 'How To Guide' },
                    ]}
                    note="Crucial for Rich Snippets (FAQ, HowTo)."
                />
                 {/* Pillar Content */}
                <FormSelect
                    label="Pillar Content / Cornerstone"
                    id="isPillarContent"
                    value={formData.isPillarContent}
                    onChange={handleChange}
                    required={false}
                    defaultOptionText="Select"
                    options={[
                        { id: 'no', name: 'No' },
                        { id: 'yes', name: 'Yes, this is a Cornerstone Content' },
                    ]}
                    note="Identifies your most important content."
                />
            </div>

            {/* Middle Row: Canonical & Redirect */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                    label="Canonical URL (Optional)"
                    id="canonicalUrl"
                    value={formData.canonicalUrl}
                    onChange={handleChange}
                    placeholder="Leave blank for self-referencing"
                    required={false}
                    note="Use to prevent duplicate content issues."
                />
                 <FormField
                    label="301 Redirect Target (Optional)"
                    id="redirectTarget"
                    value={formData.redirectTarget}
                    onChange={handleChange}
                    placeholder="/new-article-slug"
                    required={false}
                    note="If this article is to be permanently moved."
                />
            </div>

            {/* --- Conditional: FAQ Schema Creator --- */}
            {formData.schemaType === 'FAQPage' && (
                <div className="mt-6 p-4 border border-green-300 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900/50">
                    <h3 className="text-lg font-semibold mb-4 text-green-800 dark:text-green-200 flex items-center gap-2">
                        <List className="w-5 h-5" />
                        FAQ Schema Questions
                    </h3>
                    
                    {formData.faqEntries.map((faq, index) => (
                        <div key={faq.id} className="mb-4 p-3 border border-green-300 dark:border-green-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Question {index + 1}</h4>
                            <FormField
                                label="Question"
                                id={`faq-q-${faq.id}`}
                                value={faq.question}
                                onChange={(e) => handleFAQChange(faq.id, 'question', e.target.value)}
                                placeholder="What is the main topic of this blog?"
                                required={true}
                            />
                            <TextAreaField
                                label="Answer"
                                id={`faq-a-${faq.id}`}
                                value={faq.answer}
                                onChange={(e) => handleFAQChange(faq.id, 'answer', e.target.value)}
                                placeholder="The answer should be concise and direct."
                                required={true}
                                className="mt-2"
                            />
                            <button
                                type="button"
                                onClick={() => removeFAQ(faq.id)}
                                className="mt-2 text-xs p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition flex items-center"
                                title="Remove FAQ"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Remove FAQ
                            </button>
                        </div>
                    ))}
                    
                    <button
                        type="button"
                        onClick={addFAQ}
                        className="mt-2 px-4 py-2 border border-green-500 text-green-600 dark:text-green-400 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/50 transition font-semibold flex items-center text-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add FAQ
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdvancedSEOSchemaTechnical;