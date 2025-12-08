'use client';

import dynamic from 'next/dynamic';

const LandingHeader = dynamic(() => import('@/components/landing/landing-header').then(mod => ({ default: mod.LandingHeader })), { ssr: false });
const HeroSection = dynamic(() => import('@/components/landing/hero-section').then(mod => ({ default: mod.HeroSection })), { ssr: false });
const FeaturesSection = dynamic(() => import('@/components/landing/features-section').then(mod => ({ default: mod.FeaturesSection })), { ssr: false });
const HowItWorksSection = dynamic(() => import('@/components/landing/how-it-works-section').then(mod => ({ default: mod.HowItWorksSection })), { ssr: false });
const CTASection = dynamic(() => import('@/components/landing/cta-section').then(mod => ({ default: mod.CTASection })), { ssr: false });
const LandingFooter = dynamic(() => import('@/components/landing/landing-footer').then(mod => ({ default: mod.LandingFooter })), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
