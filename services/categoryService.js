import axios from "axios";

// services/categoryService.js

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/categories";

// সব ক্যাটেগরি আনা
export const fetchCategories = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data; // backend থেকে success, data, count আসবে
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// নতুন ক্যাটেগরি তৈরি
export const createCategory = async (categoryData) => {
  try {
    const response = await axios.post(API_URL, categoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// ক্যাটেগরি আপডেট
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

// ক্যাটেগরি ডিলিট
export const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// ক্যাটেগরি ID দিয়ে fetch
export const fetchCategoryById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error;
  }
};
