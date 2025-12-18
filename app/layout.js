"use client";
import "./globals.css";
import { ThemeProvider } from "@components/common/ThemeContext";
import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ['latin'], weight: ["400", "500", "600", "700"] })

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} transition-colors duration-500`}>
        <ThemeProvider>
          {children} {/* এখানে কোনো Sidebar/Header থাকবে না */}
        </ThemeProvider>
      </body>
    </html>
  );
}