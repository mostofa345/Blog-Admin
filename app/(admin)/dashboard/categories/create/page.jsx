"use client";
import Link from "next/link";
import { List, Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// API Base URL (From .env.local)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blog-server-0exu.onrender.com/api';

// ✅ API Call function: Create Category
const createCategory = async (categoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    // Check if the response is OK, if not, throw an error
    if (!response.ok) {
      const errorData = await response.json();
      // Throw the backend error message if available, otherwise a generic one
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    return await response.json(); // returns { success: true, message: 'Category created successfully.', data: category }
  } catch (error) {
    console.error("Error creating category:", error.message);
    // Re-throw to be caught by handleSubmit
    throw error; 
  }
};

export default function AddCategoryPage() {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleNameChange = (e) => {
    const name = e.target.value;
    setCategoryName(name);
    // Slug generation logic (Same as before)
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    setCategorySlug(slug);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName || !categorySlug) return setMessage("⚠️ Please fill all fields.");

    setIsLoading(true);
    setMessage("Adding category...");
    try {
      // ✅ API Call
      const res = await createCategory({ name: categoryName, slug: categorySlug });
      
      if (res.success) {
        setMessage("✅ Category added successfully!");
        setCategoryName("");
        setCategorySlug("");
        // Redirecting to category list
        setTimeout(() => router.push("/dashboard/categories"), 1500); 
      } else {
         // Should not hit this block if backend throws non-2xx status, but kept for safety
        setMessage(`❌ Failed to add category: ${res.message || 'Unknown error'}`);
      }
    } catch (error) {
      // Catching the error thrown from createCategory (including backend error messages)
      setMessage(`❌ Failed to add category: ${error.message || 'Check server status.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <PlusCircle className="w-7 h-7 text-indigo-500" />
          Add New Category
        </h1>
        <Link
          href="/dashboard/categories" // ✅ Correct path for Category List
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-md hover:bg-indigo-700 transition duration-200 flex items-center gap-2"
        >
          <List className="w-4 h-4" />
          Category List
        </Link>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category Name
            </label>
            <input
              id="categoryName"
              type="text"
              value={categoryName}
              onChange={handleNameChange}
              required
              placeholder="e.g., Web Development"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div>
            <label htmlFor="categorySlug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category Slug
            </label>
            <input
              id="categorySlug"
              type="text"
              value={categorySlug}
              onChange={(e) => {setCategorySlug(e.target.value); setMessage("");}} // Added setMessage("")
              required
              placeholder="e.g., web-development"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">The slug is used in the URL.</p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.includes("✅")
                  ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                  : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-2 px-4 rounded-lg text-base font-medium text-white shadow-sm transition duration-200 ${
              isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Category
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}