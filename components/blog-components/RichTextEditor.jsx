"use client";
import React from "react";
import { Editor } from "@tinymce/tinymce-react";

// components/add-resource/RichTextEditor.jsx

// TinyMCE API Key এনভায়রনমেন্ট ভেরিয়েবল থেকে নেওয়া
const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;

// ✅ New Prop: uploadApiUrl যোগ করা হলো
const RichTextEditor = ({ value, onChange, placeholder = "Write your full article content here...", className = "", uploadApiUrl }) => {
    
    // --- ✅ ফিক্স: Real Cloudinary Image/Media Upload Handler ---
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
            alert("Error: Image/Media upload URL is missing in RichTextEditor props.");
            return;
        }

        // ফাইল সিলেক্ট হওয়ার পর যা ঘটবে
        input.onchange = async function () {
            const file = this.files[0];
            
            if (file) {
                // ফর্ম ডেটা তৈরি করা
                const formData = new FormData();
                // সার্ভার-সাইডে Multer/Express-এ এই ফিল্ডের নাম 'file' হতে হবে
                formData.append('file', file); 

                try {
                    // আপলোড API কল করা
                    const response = await fetch(uploadApiUrl, {
                        method: 'POST',
                        body: formData,
                        // 'Content-Type': 'multipart/form-data' সেট করার প্রয়োজন নেই, 
                        // কারণ ব্রাউজার নিজে থেকেই এটি boundary সহ সেট করবে।
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Upload failed with status: ${response.status}`);
                    }

                    const json = await response.json();

                    // TinyMCE কে প্রাপ্ত URL দিয়ে কলব্যাক করা
                    if (json && json.location) {
                        cb(json.location, { alt: file.name });
                    } else {
                        throw new Error("Upload successful, but no URL received.");
                    }

                } catch (error) {
                    console.error("TinyMCE File Upload Error:", error);
                    alert("Error uploading file: " + error.message);
                }

            }
        };

        // ফাইল ইনপুটটি ক্লিক করা
        input.click();
    };

    // TinyMCE Configuration
    const editorConfig = {
        // --- 1. কোর সেটিংস ---
        apiKey: TINYMCE_API_KEY,
        skin: 'oxide-dark', // ডার্ক মোডের জন্য একটি সুন্দর স্কিন
        content_css: 'dark', // কন্টেন্টের জন্য ডার্ক মোড CSS
        placeholder: placeholder,
        height: 500,
        menubar: true,
        
        // 🚨 ফিক্স A: ডিরেকশন LTR নিশ্চিত করা
        directionality: 'ltr', 
        
        // 🚨 ফিক্স B: 'media' এবং 'forecolor' প্লাগইন যোগ করা হয়েছে
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 
            'print', 'preview', 'anchor', 'searchreplace', 'visualblocks', 
            'code', 'fullscreen', 'insertdatetime', 'media', 'table', // 'media' added
            'paste', 'wordcount', 'help', 'forecolor', 
        ],
        
        // 🚨 ফিক্স C: টুলবার অপশনে 'media' যোগ করা হলো
        toolbar: 
            'undo redo | formatselect | bold italic backcolor | \\\r\n            alignleft aligncenter alignright alignjustify | \\\r\n            bullist numlist outdent indent | removeformat | link image media | code | forecolor backcolor | help', 
        
        // --- 2. ইমেজ/মিডিয়া আপলোড করার জন্য ---
        // ✅ ফিক্স D: ফাইল পিকার যোগ করা হলো
        file_picker_callback: filePickerCallback,
        
        // ✅ ফিক্স E: ইমেজ এবং মিডিয়া উভয়ই ব্রাউজ করা যাবে
        file_picker_types: 'image media', 

    };

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
            init={editorConfig}
        />
    );
}

export default RichTextEditor;