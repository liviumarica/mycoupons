'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';

const LandingHeader = dynamic(() => import('@/components/landing/landing-header').then(mod => ({ default: mod.LandingHeader })), { ssr: false });
const LandingFooter = dynamic(() => import('@/components/landing/landing-footer').then(mod => ({ default: mod.LandingFooter })), { ssr: false });

const sections = [
  {
    icon: Database,
    title: 'Information We Collect',
    content: [
      {
        subtitle: 'Account Information',
        text: 'When you create an account, we collect your email address and any profile information you choose to provide.',
      },
      {
        subtitle: 'Coupon Data',
        text: 'We store the coupon information you add to our platform, including merchant names, discount codes, expiration dates, and any images you upload.',
      },
      {
        subtitle: 'Usage Information',
        text: 'We collect information about how you interact with our service, including pages visited, features used, and time spent on the platform.',
      },
    ],
  },
  {
    icon: Lock,
    title: 'How We Use Your Information',
    content: [
      {
        subtitle: 'Service Delivery',
        text: 'We use your information to provide, maintain, and improve our coupon management services, including AI-powered extraction and smart notifications.',
      },
      {
        subtitle: 'Communication',
        text: 'We may send you service-related emails, such as expiration reminders, account updates, and important security notifications.',
      },
      {
        subtitle: 'Analytics',
        text: 'We analyze usage patterns to improve our service, fix bugs, and develop new features that benefit our users.',
      },
    ],
  },
  {
    icon: Shield,
    title: 'Data Security',
    content: [
      {
        subtitle: 'Encryption',
        text: 'All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols.',
      },
      {
        subtitle: 'Access Control',
        text: 'We implement row-level security policies to ensure that only you can access your coupon data. Our team cannot view your personal coupons.',
      },
      {
        subtitle: 'Regular Audits',
        text: 'We conduct regular security audits and updates to protect your information from unauthorized access, disclosure, or destruction.',
      },
    ],
  },
  {
    icon: Eye,
    title: 'Data Sharing',
    content: [
      {
        subtitle: 'Third-Party Services',
        text: 'We use trusted third-party services (Supabase for database, OpenAI for AI features) that are bound by strict confidentiality agreements.',
      },
      {
        subtitle: 'No Selling',
        text: 'We never sell, rent, or trade your personal information to third parties for marketing purposes.',
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose information if required by law, such as in response to a valid court order or government request.',
      },
    ],
  },
  {
    icon: UserCheck,
    title: 'Your Rights',
    content: [
      {
        subtitle: 'Access & Export',
        text: 'You can access and export all your data at any time through your account settings.',
      },
      {
        subtitle: 'Deletion',
        text: 'You have the right to delete your account and all associated data. This action is permanent and cannot be undone.',
      },
      {
        subtitle: 'Opt-Out',
        text: 'You can opt out of non-essential communications and notifications at any time through your settings.',
      },
    ],
  },
  {
    icon: FileText,
    title: 'Data Retention',
    content: [
      {
        subtitle: 'Active Accounts',
        text: 'We retain your data for as long as your account is active and you continue to use our services.',
      },
      {
        subtitle: 'Deleted Accounts',
        text: 'When you delete your account, we permanently remove all your personal data within 30 days, except where required by law.',
      },
      {
        subtitle: 'Backups',
        text: 'Backup copies may persist for up to 90 days but are not accessible and will be automatically purged.',
      },
    ],
  },
];

export default function PrivacyPage() {
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
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Privacy Policy</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
            >
              Your Privacy Matters
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-600 mb-8"
            >
              We&apos;re committed to protecting your personal information and being transparent about how we use it.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-sm text-gray-500"
            >
              Last updated: December 5, 2025
            </motion.div>
          </div>
        </section>

        {/* Quick Summary */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Summary</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>We only collect information necessary to provide our services</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Your data is encrypted and protected with bank-level security</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>We never sell your personal information to third parties</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>You can delete your account and data at any time</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Detailed Sections */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl space-y-12">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ y: 40, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.title}</h2>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.subtitle}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Cookies Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookies & Tracking</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  We use cookies and similar tracking technologies to improve your experience on our platform. 
                  These include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our service</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
                <p>
                  You can control cookie preferences through your browser settings. Note that disabling 
                  essential cookies may affect the functionality of our service.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Children&apos;s Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13. If you are a parent or guardian 
                and believe your child has provided us with personal information, please contact us 
                immediately, and we will delete such information from our systems.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Changes to Policy */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices 
                or for legal, operational, or regulatory reasons. When we make changes, we will:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-600">
                <li>Update the &quot;Last updated&quot; date at the top of this page</li>
                <li>Notify you via email if the changes are significant</li>
                <li>Post a notice on our website for 30 days</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                We encourage you to review this Privacy Policy periodically to stay informed about 
                how we protect your information.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
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
                <h2 className="text-3xl font-bold mb-4">Questions About Privacy?</h2>
                <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
                  If you have any questions or concerns about our Privacy Policy, we&apos;re here to help.
                </p>
                <Link
                  href="/contact"
                  className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-2xl transition-all text-lg"
                >
                  Contact Us
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
