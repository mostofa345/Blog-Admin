"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex">
      {/* Fixed Sidebar */}

      <div className="flex-1 flex flex-col ml-64">
        {/* Fixed Header */}
    

        {/* Main Content Area */}
        <main className="flex-1 p-6 mt-16 overflow-auto">
          {/* Page content goes here */}
          <div className="text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">Welcome to Blog Admin Panel</h1>
            <p className="mb-2">This is your main dashboard content area. Scroll inside this section without affecting sidebar or header.</p>
            <p>Add charts, tables, analytics, and widgets here.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
