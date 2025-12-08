'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Target, Users, Zap, Heart, Shield } from 'lucide-react';

const LandingHeader = dynamic(() => import('@/components/landing/landing-header').then(mod => ({ default: mod.LandingHeader })), { ssr: false });
const LandingFooter = dynamic(() => import('@/components/landing/landing-footer').then(mod => ({ default: mod.LandingFooter })), { ssr: false });

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'To help people save money by never missing a discount or letting a coupon expire.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'User First',
    description: 'Every feature we build is designed with our users needs and privacy in mind.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'We leverage cutting-edge AI technology to make coupon management effortless.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Heart,
    title: 'Simplicity',
    description: 'Complex technology, simple experience. We handle the hard parts so you don\'t have to.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Your data is protected with bank-level security and never shared with third parties.',
    gradient: 'from-green-500 to-emerald-500',
  },
];

const stats = [
  { number: '10,000+', label: 'Active Users' },
  { number: '$500K+', label: 'Total Savings' },
  { number: '98%', label: 'Success Rate' },
  { number: '24/7', label: 'Support' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <LandingHeader />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-8"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">About CouponAI</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
            >
              Saving Money Made Simple
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-600 mb-12 leading-relaxed"
            >
              We believe everyone deserves to save money without the hassle of managing countless coupons. 
              That's why we built CouponAI - an intelligent platform that uses artificial intelligence to 
              help you organize, track, and never miss a discount again.
            </motion.p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="text-center"
                  >
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Our Story
              </h2>
            </motion.div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="prose prose-lg max-w-none"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 space-y-6 text-gray-700">
                <p className="text-lg leading-relaxed">
                  CouponAI was born from a simple frustration: losing money on expired coupons. 
                  We've all been there - finding a great discount code, saving it somewhere, and 
                  then forgetting about it until it's too late.
                </p>
                <p className="text-lg leading-relaxed">
                  We realized that managing coupons shouldn't be a chore. With advances in AI and 
                  machine learning, we saw an opportunity to build something that would make saving 
                  money effortless and automatic.
                </p>
                <p className="text-lg leading-relaxed">
                  Today, CouponAI helps thousands of users save money every day. Our AI-powered 
                  platform extracts coupon details from images and text, sends smart reminders 
                  before expiration, and keeps everything organized in one beautiful interface.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Our Values
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ y: 40, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-gray-200 transition-all hover:shadow-xl"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-r ${value.gradient} rounded-xl flex items-center justify-center mb-6`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20" />
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
                <h2 className="text-4xl font-bold mb-6">
                  Join Our Community
                </h2>
                <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
                  Start saving money today with the smartest coupon management platform.
                </p>
                <Link
                  href="/signup"
                  className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-2xl transition-all text-lg"
                >
                  Get Started Free
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
