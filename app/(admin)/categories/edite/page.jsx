"use client";
import Link from "next/link";
import { List, Loader2, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// API Base URL (From .env.local)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://blog-server-0exu.onrender.com/api";

// ✅ API Call function: Fetch Category By ID
const fetchCategoryById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch category. Status: ${response.status}`);
    }
    return await response.json(); // returns { success: true, data: category }
  } catch (error) {
    console.error("Error fetching category by ID:", error.message);
    throw error;
  }
};

// ✅ API Call function: Update Category
const updateCategory = async (id, categoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    return await response.json(); // returns { success: true, message: '...', data: category }
  } catch (error) {
    console.error("Error updating category:", error.message);
    throw error;
  }
};

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  // id is the category ID from the dynamic route, e.g., /dashboard/categories/edit/[id]
  const id = params.id; 

  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Skip if ID is not available yet (Next.js dynamic routing)
    if (!id) return; 

    const loadCategory = async () => {
      try {
        const res = await fetchCategoryById(id); // ✅ API Call
        if (res.success) {
          setCategoryName(res.data.name);
          setCategorySlug(res.data.slug);
        } else {
            // Should not hit this if fetchCategoryById throws on !response.ok
            setMessage("❌ Failed to load category data.");
        }
      } catch (error) {
        console.error(error);
        setMessage(`❌ Failed to load category: ${error.message || 'Check ID and server status.'}`);
      }
    };
    loadCategory();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName || !categorySlug) return setMessage("⚠️ Please fill all fields.");

    setIsLoading(true);
    setMessage("Updating category...");
    try {
      const res = await updateCategory(id, { name: categoryName, slug: categorySlug }); // ✅ API Call
      if (res.success) {
        setMessage("✅ Category updated successfully!");
        // Redirecting to category list
        setTimeout(() => router.push("/dashboard/categories"), 1500);
      } else {
        setMessage(`❌ Failed to update category: ${res.message || 'Unknown error'}`);
      }
    } catch (error) {
      setMessage(`❌ Failed to update category: ${error.message || 'Check server status.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Save className="w-7 h-7 text-indigo-500" />
          Edit Category
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
              onChange={(e) => {setCategoryName(e.target.value); setMessage("");}}
              required
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
              onChange={(e) => {setCategorySlug(e.target.value); setMessage("");}}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
            />
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
                Updating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Update Category
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}