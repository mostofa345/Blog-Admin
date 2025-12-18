"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Grid3X3,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";

// API Base URL (From .env.local)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://blog-server-0exu.onrender.com/api";

// ✅ API Call function: Fetch All Categories
const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories. Status: ${response.status}`);
    }
    return await response.json(); // returns { success: true, data: categories, count: categories.length }
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    throw error;
  }
};

// ✅ API Call function: Delete Category
const deleteCategory = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }
    return await response.json(); // returns { success: true, message: '...' }
  } catch (error) {
    console.error("Error deleting category:", error.message);
    throw error;
  }
};

const CategoryListPage = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 5;

  // ✅ ডেটা ফেচ করা হচ্ছে
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        // নিশ্চিত করুন যে আপনি data.data ব্যবহার করছেন, কারণ আপনার backend structure-এ data একটি property
        if (data?.success && Array.isArray(data.data)) { 
          setCategories(data.data);
        } else {
          console.error("Unexpected data format:", data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    loadCategories();
  }, []);

  // সর্ট লজিক (Same as before)
  const sortedCategories = [...categories].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return sortOrder === "asc" ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // সার্চ (Same as before)
  const filteredCategories = sortedCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // পেজিনেশন (Same as before)
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
  const indexOfLast = currentPage * categoriesPerPage;
  const indexOfFirst = indexOfLast - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirst, indexOfLast);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id); // ✅ API Call
        // Successfully deleted, remove from state
        setCategories((prev) => prev.filter((cat) => cat._id !== id));
      } catch (error) {
        alert(`Delete failed: ${error.message}`);
        console.error("Delete failed:", error);
      }
    }
  };

  // SortButton component (Same as before)
  const SortButton = ({ column, label }) => (
    <button
      className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300"
      onClick={() => handleSort(column)}
    >
      {label}
      {sortBy === column ? (
        <ArrowUpDown
          className={`w-4 h-4 transition-transform ${
            sortOrder === "desc" ? "rotate-180" : ""
          }`}
        />
      ) : (
        <ArrowUpDown className="w-4 h-4 opacity-30" />
      )}
    </button>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3 mb-4 sm:mb-0">
          <Grid3X3 className="w-7 h-7 text-indigo-500" />
          Category List
        </h1>
        <Link
          href="/dashboard/categories/create" // ✅ Added /create path
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-md hover:bg-indigo-700 transition duration-200 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Category
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 sm:mt-0">
          Total Categories: {filteredCategories.length}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <SortButton column="name" label="Category Name" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                <SortButton column="slug" label="Slug" />
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentCategories.length > 0 ? (
              currentCategories.map((cat) => (
                <tr
                  key={cat._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                    /{cat.slug}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/dashboard/categories/edit/${cat._id}`} // ✅ Correct Edit path
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(cat._id)} // ✅ Delete action
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-gray-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                >
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (Same as before) */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {indexOfFirst + 1} to{" "}
            {Math.min(indexOfLast, filteredCategories.length)} of{" "}
            {filteredCategories.length}
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryListPage;
