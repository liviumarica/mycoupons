'use client';

import { motion } from 'framer-motion';
import { Sparkles, Bell, Shield, Zap, Image, Filter } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Extraction',
    description: 'Simply paste text or upload an image. Our AI instantly extracts coupon codes, expiration dates, and merchant details.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Get timely push notifications before your coupons expire. Never lose money on forgotten discounts again.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is protected with bank-level security. Row-level security ensures only you can access your coupons.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built with modern tech for instant loading and smooth interactions. No lag, no waiting.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Image,
    title: 'Image Recognition',
    description: 'Take a photo of any coupon or loyalty card. Our AI vision technology reads and organizes it automatically.',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Filter,
    title: 'Smart Filtering',
    description: 'Find coupons instantly with powerful filters. Sort by merchant, type, expiration date, or discount amount.',
    gradient: 'from-pink-500 to-rose-500',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you save more and never miss a deal
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
        style={{
          backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
        }}
      />
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 h-full hover:border-gray-200 transition-all">
        <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
}
