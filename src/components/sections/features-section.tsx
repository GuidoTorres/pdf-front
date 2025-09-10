import React from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

const getFeatureIcons = () => [
  "lucide:zap",
  "lucide:brain", 
  "lucide:shield-check",
  "lucide:file-spreadsheet",
  "lucide:globe",
  "lucide:layers",
];

const getFeatureColors = () => [
  "primary" as const,
  "secondary" as const,
  "success" as const,
  "warning" as const,
  "danger" as const,
  "default" as const,
];

export const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();
  
  const icons = getFeatureIcons();
  const colors = getFeatureColors();
  const features = t('landingPage.features.list', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    stats: string;
  }>;
  return (
    <div id="features" className="min-h-screen flex items-center py-20 bg-gradient-to-b from-content1 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <Chip color="primary" variant="flat" className="mb-4">
            {t('landingPage.features.badge')}
          </Chip>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('landingPage.features.title')}
          </h2>
          <p className="text-lg text-default-600 max-w-3xl mx-auto">
            {t('landingPage.features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-divider"
            >
              <CardBody className="p-8">
                {/* Icon and Stats */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`p-4 rounded-2xl bg-${colors[index]}/10 group-hover:bg-${colors[index]}/20 transition-colors`}
                  >
                    <Icon
                      icon={icons[index]}
                      className={`text-2xl text-${colors[index]}`}
                    />
                  </div>
                  <Chip
                    size="sm"
                    color={colors[index]}
                    variant="flat"
                    className="font-mono text-xs"
                  >
                    {feature.stats}
                  </Chip>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-default-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect arrow */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon icon="lucide:arrow-right" className="text-primary" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 border border-divider">
            <h3 className="text-2xl font-bold mb-4">
              {t('landingPage.features.cta.title')}
            </h3>
            <p className="text-default-600 mb-6 max-w-2xl mx-auto">
              {t('landingPage.features.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {(t('landingPage.features.cta.benefits', { returnObjects: true }) as string[]).map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-default-600">
                  <Icon icon="lucide:check" className="text-success" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
