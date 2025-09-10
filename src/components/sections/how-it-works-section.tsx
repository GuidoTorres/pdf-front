import React from 'react';
import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from 'react-i18next';

const getStepIcons = () => [
  "lucide:upload",
  "lucide:cpu", 
  "lucide:check-circle",
  "lucide:download",
];

export const HowItWorksSection: React.FC = () => {
  const { t } = useTranslation();
  
  const icons = getStepIcons();
  const steps = t('landingPage.howItWorks.steps', { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;
  return (
    <div id="how-it-works" className="min-h-screen flex items-center py-20 bg-gradient-to-b from-content1 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('landingPage.howItWorks.title')}
          </h2>
          <p className="text-lg text-default-600 max-w-2xl mx-auto">
            {t('landingPage.howItWorks.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="relative p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-divider">
              <div className="flex flex-col items-center">
                <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">{index + 1}</span>
                </div>
                <div className="bg-primary/10 p-4 rounded-2xl mb-6">
                  <Icon icon={icons[index]} className="text-primary text-3xl" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-default-600 text-sm leading-relaxed">{step.description}</p>
              </div>
              
              {/* Arrow connector (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <Icon icon="lucide:arrow-right" className="text-primary text-2xl" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};