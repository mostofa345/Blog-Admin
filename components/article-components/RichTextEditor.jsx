"use client";
import React from "react";
import { Editor } from "@tinymce/tinymce-react";

// components/article-components/RichTextEditor.jsx

// TinyMCE API Key এনভায়রনমেন্ট ভেরিয়েবল থেকে নেওয়া
// 💡 ফিক্স: ভেরিয়েবলটি কম্পোনেন্টের বাইরে বা ভিতরে প্রয়োজন অনুযায়ী ব্যবহার করুন
const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;

// ✅ New Prop: uploadApiUrl যোগ করা হলো
const RichTextEditor = ({ value, onChange, placeholder = "Write your full article content here...", className = "", uploadApiUrl, darkTheme = true }) => {
    
    // --- ✅ ফিক্স: Real Cloudinary Image/Media Upload Handler (কম্পোনেন্টের ভিতরে ডিফাইন করা) ---
    // এই ফাংশনটি ফাইল ব্রাউজ করে এবং আপলোড API তে পাঠায়
    const filePickerCallback = (cb, value, meta) => {
        // ফাইল ইনপুট তৈরি
        const input = document.createElement('input');
        input.setAttribute('type', 'file');

        // meta.filetype চেক করে image/media/file এর জন্য accept এট্রিবিউট সেট করা
        if (meta.filetype === 'image') {
            input.setAttribute('accept', 'image/*');
        } else if (meta.filetype === 'media') {
            input.setAttribute('accept', 'video/*, audio/*'); // ভিডিও ও অডিও সাপোর্ট
        } else {
            // অন্য কোনো ফাইল টাইপ যদি ভবিষ্যতে যোগ হয়
            input.setAttribute('accept', '*/*');
        }

        // 🚨 API URL validation
        if (!uploadApiUrl) {
            console.error("RichTextEditor Error: uploadApiUrl prop is missing.");
            return;
        }

        // ফাইল সিলেক্ট হলে কি হবে
        input.onchange = () => {
            const file = input.files[0];
            if (!file) return;

            // FormData তৈরি করা
            const formData = new FormData();
            // 💡 গুরুত্বপূর্ণ ফিক্স: সার্ভার-সাইডে (articleRoute.js) আমরা 'file' ফিল্ডের নাম ব্যবহার করেছি।
            formData.append('file', file, file.name); 

            // API তে ফাইল আপলোড করা
            fetch(uploadApiUrl, { // ✅ ফিক্স B: এখানে 'uploadApiUrl' prop ব্যবহার করা হলো
                method: 'POST',
                body: formData,
                // headers: {
                //     'Authorization': `Bearer ${yourAuthToken}`, // যদি auth টোকেন লাগে
                // },
            })
            .then(response => {
                if (!response.ok) {
                    // সার্ভার-সাইড এরর (যেমন 404, 500) হলে
                    throw new Error(`Upload failed with status: ${response.status} (${response.statusText})`);
                }
                return response.json();
            })
            .then(data => {
                // Cloudinary আপলোড সফল হলে (সার্ভার থেকে { location: 'URL' } আসা উচিত)
                if (data.location) {
                    // TinyMCE-কে ইমেজ URL ফেরত দেওয়া
                    cb(data.location, { alt: file.name });
                } else {
                    throw new Error('Upload failed: Server did not return image location.');
                }
            })
            .catch(error => {
                console.error("Error uploading file:", error);
                alert(`Error uploading file: ${error.message}`);
            });
        };

        // ইনপুট ফাইল ডায়ালগ ওপেন করা
        input.click();
    };

    // --- 3. TinyMCE Configuration (init) ---
    const editorConfig = {
        height: 800,
        menubar: false,
        skin: darkTheme ? 'oxide-dark' : 'oxide', // ✅ ফিক্স: ডার্ক/লাইট থিম বজায় রাখা
        content_css: darkTheme ? 'dark' : 'default', // ✅ ফিক্স: ডার্ক/লাইট থিম বজায় রাখা
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 
            'print', 'preview', 'anchor', 'searchreplace', 'visualblocks', 
            'code', 'fullscreen', 'insertdatetime', 'media', 'table', // 'media' added
            'paste', 'wordcount', 'help', 'forecolor', 
        ],
        
        // 🚨 ফিক্স C: টুলবার অপশনে 'media' যোগ করা হলো
        toolbar: 
            'undo redo | formatselect | bold italic backcolor | \
            alignleft aligncenter alignright alignjustify | \
            bullist numlist outdent indent | removeformat | link image media | code | forecolor backcolor | help', 
        
        // --- 2. ইমেজ/মিডিয়া আপলোড করার জন্য ---
        // ✅ ফিক্স D: ফাইল পিকার যোগ করা হলো
        file_picker_callback: filePickerCallback,
        
        // ✅ ফিক্স E: ইমেজ এবং মিডিয়া উভয়ই ব্রাউজ করা যাবে
        file_picker_types: 'image media', 

        // ❌ images_upload_url বা images_upload_handler দরকার নেই যদি file_picker_callback ব্যবহার করেন।
    };

    // 🚨 এরর ফিক্স: ফাংশন থেকে শুধুমাত্র একবারই রিটার্ন করা যাবে।
    // আপনার আগের কোডটি সিনট্যাক্স ভুল ছিল। এখন সঠিক উপায়ে লেখা হলো।
    if (!TINYMCE_API_KEY) {
        return (
            <div className={`p-4 bg-red-100 text-red-700 border border-red-400 rounded-lg dark:bg-red-900 dark:text-red-300 dark:border-red-700 ${className}`}>
                🚨 **TINYMCE API KEY MISSING!** Please add NEXT_PUBLIC_TINYMCE_API_KEY to your .env.local file to load the Rich Text Editor.
            </div>
        );
    }

    return (
        <Editor
            apiKey={TINYMCE_API_KEY}
            value={value}
            onEditorChange={onChange}
            placeholder={placeholder}
            init={editorConfig} // ✅ এখানে editorConfig ব্যবহার করা হলো
        />
    );
};

export default RichTextEditor;