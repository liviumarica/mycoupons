'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';
import { Mail, MessageSquare, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Our team will respond within 24 hours',
    contact: 'support@couponai.com',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Available Monday to Friday, 9am-5pm',
    contact: 'Start a conversation',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Phone,
    title: 'Phone',
    description: 'Mon-Fri from 8am to 6pm',
    contact: '+1 (555) 123-4567',
    gradient: 'from-green-500 to-emerald-500',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitStatus('success');
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitStatus('idle'), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Get in Touch</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
            >
              We'd Love to Hear From You
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-600 mb-12"
            >
              Have a question, feedback, or need help? Our team is here to assist you.
            </motion.p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ y: 40, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-gray-200 transition-all hover:shadow-xl text-center"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-r ${method.gradient} rounded-xl flex items-center justify-center mb-6 mx-auto`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{method.title}</h3>
                    <p className="text-gray-600 mb-3 text-sm">{method.description}</p>
                    <p className="text-blue-600 font-semibold">{method.contact}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Form */}
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  {submitStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
                    >
                      Thank you! Your message has been sent successfully. We'll get back to you soon.
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ x: 40, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-gray-900">Contact Information</h2>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Fill out the form and our team will get back to you within 24 hours. 
                    For urgent matters, please use our live chat or call us directly.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">support@couponai.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Office</h3>
                      <p className="text-gray-600">
                        123 Tech Street<br />
                        San Francisco, CA 94105<br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
                  <div className="space-y-1 text-gray-600">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4 text-gray-900">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Quick answers to common questions
              </p>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  question: 'How quickly will I receive a response?',
                  answer: 'We typically respond to all inquiries within 24 hours during business days. For urgent matters, please use our live chat feature.',
                },
                {
                  question: 'Do you offer phone support?',
                  answer: 'Yes! Our phone support is available Monday through Friday, 8am to 6pm PST. Call us at +1 (555) 123-4567.',
                },
                {
                  question: 'Can I schedule a demo?',
                  answer: 'Absolutely! Mention in your message that you\'d like a demo, and we\'ll arrange a convenient time to show you around the platform.',
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-gray-50 rounded-xl p-6 border border-gray-100"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
