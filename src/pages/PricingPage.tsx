import React from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button } from "@heroui/react";
import { useTranslation } from 'react-i18next';

const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const plans = [
    { name: t('pricingPage.basicPlan'), price: "$9.99", features: t('pricingPage.features.basic', { returnObjects: true }) as string[] },
    { name: t('pricingPage.proPlan'), price: "$19.99", features: t('pricingPage.features.pro', { returnObjects: true }) as string[] },
    { name: t('pricingPage.enterprisePlan'), price: t('pricingPage.contactSales'), features: t('pricingPage.features.enterprise', { returnObjects: true }) as string[] }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">{t('pricingPage.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <Card key={index} className="bg-content1/60 backdrop-blur-md border border-divider">
            <CardHeader className="text-center">
              <h2 className="text-2xl font-semibold">{plan.name}</h2>
              <p className="text-3xl font-bold mt-2">{plan.price}</p>
              {plan.name === t('pricingPage.proPlan') && <p className="text-sm text-primary mt-1">{t('pricingPage.mostPopular')}</p>}
            </CardHeader>
            <CardBody>
              <ul className="space-y-2">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <span className="mr-2 text-primary">✓</span> {feature}
                  </li>
                ))}
              </ul>
            </CardBody>
            <CardFooter>
              <Button color="primary" className="w-full">
                {plan.name === t('pricingPage.enterprisePlan') ? t('pricingPage.contactSales') : t('pricingPage.choosePlan')}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;