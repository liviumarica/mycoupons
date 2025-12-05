'use client';

import { motion } from 'framer-motion';
import { Upload, Sparkles, Bell, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Add Your Coupons',
    description: 'Paste text, upload an image, or manually enter coupon details. It takes just seconds.',
    color: 'blue',
  },
  {
    icon: Sparkles,
    title: 'AI Does the Work',
    description: 'Our AI extracts all the important details: codes, expiration dates, merchants, and discount amounts.',
    color: 'purple',
  },
  {
    icon: Bell,
    title: 'Get Reminders',
    description: 'Receive smart notifications before your coupons expire. Choose when and how you want to be reminded.',
    color: 'pink',
  },
  {
    icon: TrendingUp,
    title: 'Save More Money',
    description: 'Track your savings over time and never miss a discount. Watch your savings grow month after month.',
    color: 'green',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start saving in minutes with our simple 4-step process
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 via-pink-200 to-green-200 -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <StepCard key={index} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const Icon = step.icon;
  const colorMap = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    pink: 'from-pink-500 to-rose-500',
    green: 'from-green-500 to-emerald-500',
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      className="relative"
    >
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 bg-gradient-to-r ${colorMap[step.color as keyof typeof colorMap]} rounded-2xl flex items-center justify-center mb-6 relative z-10`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div className="absolute top-4 left-4 text-6xl font-bold text-gray-100 -z-0">
            {index + 1}
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
          <p className="text-gray-600 leading-relaxed">{step.description}</p>
        </div>
      </div>
    </motion.div>
  );
}
