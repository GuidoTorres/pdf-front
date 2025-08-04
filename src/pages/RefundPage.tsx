import React from 'react';
import { Card, CardHeader, CardBody } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

const RefundPage: React.FC = () => {
  const { t } = useTranslation();

  const sections = [
    { icon: 'lucide:file-check-2', title: t('refundPage.eligibility'), text: t('refundPage.eligibilityText') },
    { icon: 'lucide:mail-question', title: t('refundPage.howToRequest'), text: t('refundPage.howToRequestText') },
    { icon: 'lucide:clock', title: t('refundPage.processingTime'), text: t('refundPage.processingTimeText') },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="bg-content1/60 backdrop-blur-md border border-divider shadow-lg">
        <CardHeader className="border-b border-divider p-6">
          <div className="flex items-center">
            <Icon icon="lucide:circle-dollar-sign" className="text-3xl text-primary mr-4" />
            <h1 className="text-3xl font-bold tracking-tight">{t('refundPage.title')}</h1>
          </div>
        </CardHeader>
        <CardBody className="p-6 md:p-8 space-y-8">
          <p className="text-lg text-foreground/80 leading-relaxed">
            {t('refundPage.intro')}
          </p>
          
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Icon icon={section.icon} className="text-2xl text-primary/80 mt-1" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
                  <p className="text-foreground/70 leading-loose">{section.text}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default RefundPage;