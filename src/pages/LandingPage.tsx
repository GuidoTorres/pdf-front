import React from "react";
import { HeroSection } from "../components/sections/hero-section";
import { FeaturesSection } from "../components/sections/features-section";
import { HowItWorksSection } from "../components/sections/how-it-works-section";
import { PricingSection } from "../components/sections/pricing-section";

const LandingPage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
    </>
  );
};

export default LandingPage;
