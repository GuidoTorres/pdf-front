import React from "react";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

const getPricingData = () => [
  {
    price: "$0",
    originalPrice: null,
    icon: "lucide:gift",
    color: "success" as const,
    popular: false,
  },
  {
    price: "$19",
    originalPrice: "$29",
    icon: "lucide:zap",
    color: "default" as const,
    popular: false,
  },
  {
    price: "$49",
    originalPrice: "$79",
    icon: "lucide:rocket",
    color: "primary" as const,
    popular: true,
  },
];

export const PricingSection: React.FC = () => {
  const { t } = useTranslation();
  
  const pricingData = getPricingData();
  const plans = t('landingPage.pricing.plans', { returnObjects: true }) as Array<{
    name: string;
    description: string;
    features: string[];
  }>;
  return (
    <div
      id="pricing"
      className="min-h-screen flex items-center py-20 bg-gradient-to-b from-background to-content1"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <Chip color="primary" variant="flat" className="mb-4">
            {t('landingPage.pricing.badge')}
          </Chip>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('landingPage.pricing.title')}
          </h2>
          <p className="text-lg text-default-600 max-w-2xl mx-auto">
            {t('landingPage.pricing.subtitle')}
          </p>

        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative p-8 ${
                pricingData[index].popular
                  ? "border-2 border-primary shadow-2xl scale-105 bg-gradient-to-b from-primary-50 to-background"
                  : "border border-divider hover:shadow-lg transition-shadow"
              }`}
            >
              {pricingData[index].popular && (
                <Chip
                  color="primary"
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10"
                >
                  {t('landingPage.pricing.mostPopular')}
                </Chip>
              )}

              <CardBody className="p-0">
                {/* Plan header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className={`p-3 rounded-full ${
                        pricingData[index].popular
                          ? "bg-primary text-white"
                          : "bg-default-100"
                      }`}
                    >
                      <Icon icon={pricingData[index].icon} className="text-2xl" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-default-600 mb-4">
                    {plan.description}
                  </p>

                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold">{pricingData[index].price}</span>
                    {pricingData[index].originalPrice && (
                      <span className="text-lg text-default-400 line-through">
                        {pricingData[index].originalPrice}
                      </span>
                    )}
                    {pricingData[index].price !== "Custom" && (
                      <span className="text-sm text-default-500">{t('landingPage.pricing.perMonth')}</span>
                    )}
                  </div>

                  {pricingData[index].originalPrice && (
                    <Chip size="sm" color="success" variant="flat">
                      {t('landingPage.pricing.save')} $
                      {parseInt(pricingData[index].originalPrice!.slice(1)) -
                        parseInt(pricingData[index].price.slice(1))}
                    </Chip>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <Icon
                        icon="lucide:check"
                        className={`text-lg mt-0.5 ${
                          pricingData[index].popular ? "text-primary" : "text-success"
                        }`}
                      />
                      <span className="text-sm text-default-700">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  color={pricingData[index].popular ? "primary" : "default"}
                  variant={pricingData[index].popular ? "solid" : "bordered"}
                  size="lg"
                  fullWidth
                  className="font-semibold"
                  startContent={<Icon icon="lucide:credit-card" />}
                >
                  {t('landingPage.pricing.getStarted')}
                </Button>

                {/* Additional info */}
                <p className="text-xs text-center text-default-500 mt-4">
                  {t('landingPage.pricing.additionalInfo')}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
};
