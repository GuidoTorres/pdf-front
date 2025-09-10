import React from 'react';
import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";

const features = [
  {
    title: "PDF Processing",
    description: "Upload bank statements in PDF format for quick and accurate data extraction.",
    icon: "lucide:file-text",
  },
  {
    title: "AI-Powered Analysis", 
    description: "Our advanced AI processes and categorizes your financial data with high precision.",
    icon: "lucide:brain",
  },
  {
    title: "Excel Export",
    description: "Download your processed data in Excel format for easy integration with your workflow.",
    icon: "lucide:file-spreadsheet",
  },
  {
    title: "Secure & Confidential",
    description: "Your financial data is encrypted and processed with the highest security standards.",
    icon: "lucide:shield",
  },
];

export const FeatureSection: React.FC = () => {
  return (
    <div id="features" className="min-h-screen flex items-center bg-content2">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Powerful Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6">
              <Icon icon={feature.icon} className="text-primary text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-default-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};