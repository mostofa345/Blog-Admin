"use client";
import React from "react";
import { Editor } from "@tinymce/tinymce-react";

// NOTE: We assume TINYMCE_API_KEY is available or mocked in the environment.
const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;

// FIX: Renamed 'value' to 'initialValue' (more descriptive) and 'onChange' to 'onEditorChange'
// to match common React patterns and the name used in the consuming component.
const RichTextEditor = ({
  initialValue, // Changed from 'value'
  onEditorChange, // Changed from 'onChange'
  isDark = true, // Added isDark prop for dynamic skin/content_css, defaulting to dark
  placeholder = "Write your full article content here...",
}) => {
  const editorConfig = {
    apiKey: TINYMCE_API_KEY,
    
    // Dynamic skin/content_css based on isDark prop
    skin: isDark ? "oxide-dark" : "oxide",
    content_css: isDark ? "dark" : "default",

    placeholder: placeholder,
    height: 500,
    menubar: true,
    directionality: "ltr",
    
    // Added 'codesample' plugin for better code handling (optional but recommended)
    plugins: [
      "advlist", "autolink", "lists", "link", "image", "charmap",
      "print", "preview", "anchor", "searchreplace", "visualblocks",
      "code", "fullscreen", "insertdatetime", "media", "table", 
      "paste", "wordcount", "help", "forecolor", "backcolor", "codesample",
    ],
    toolbar:
      "undo redo | formatselect | bold italic backcolor | " +
      "alignleft aligncenter alignright alignjustify | " +
      "bullist numlist outdent indent | removeformat | " +
      "link image media | code codesample | forecolor backcolor | help", // Added codesample button

    file_picker_callback: (cb, value, meta) => {
      if (meta.filetype !== "image") return;
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");

      input.onchange = function () {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function () {
          const id = "blobid" + new Date().getTime();
          // Use window.tinymce for safety in Next.js environment
          const blobCache = window.tinymce.activeEditor.editorUpload.blobCache; 
          const base64 = reader.result.split(",")[1];
          const blobInfo = blobCache.create(id, file, base64);
          blobCache.add(blobInfo);
          cb(blobInfo.blobUri(), { title: file.name });
        };
        reader.readAsDataURL(file);
      };

      input.click();
    },
  };

  if (!TINYMCE_API_KEY) {
    return (
      <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded-lg dark:bg-red-900 dark:text-red-300 dark:border-red-700">
        🚨 <strong>TINYMCE API KEY MISSING!</strong> Please add
        <code> NEXT_PUBLIC_TINYMCE_API_KEY</code> to your .env.local file.
      </div>
    );
  }

  return (
    <Editor
      apiKey={TINYMCE_API_KEY}
      init={editorConfig}
      // Note: initialValue is generally preferred over 'value' for uncontrolled components
      initialValue={initialValue}
      // Direct pass-through of the onEditorChange prop
      onEditorChange={onEditorChange} 
    />
  );
};

export default RichTextEditor;
