"use client";
import { createContext, useContext, useEffect, useState } from "react";

// Theme Context তৈরি
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // state hook, localStorage থেকে থিম লোড করে
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  // থিম পরিবর্তন করার ফাংশন
  const toggleTheme = () => {
    setTheme(currentTheme => {
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // থিম পরিবর্তনের সাথে সাথে <html> ট্যাগ আপডেট করা
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]); // থিম চেঞ্জ হলেই useEffect রান করবে

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// কাস্টম হুক
export const useTheme = () => useContext(ThemeContext);