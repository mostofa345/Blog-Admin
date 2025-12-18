// next.config.mjs (Updated)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Next.js Image Component এর জন্য এক্সটার্নাল ডোমেইন কনফিগারেশন 
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // এই ডোমেইনটি এররের জন্য যোগ করা হলো
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // আপনার আপলোড করা ছবিগুলির জন্য (যদি Cloudinary ব্যবহার করেন)
        port: '',
        pathname: '/**',
      },
      // যদি অন্য কোনো ইমেজ হোস্টিং সার্ভিস ব্যবহার করেন, তবে সেই ডোমেইনটিও এখানে যোগ করতে হবে।
    ],
  },

  // আপনার অন্যান্য কনফিগারেশন এখানে থাকতে পারে
  // উদাহরণ: output: 'standalone',
};

export default nextConfig;