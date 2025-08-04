import React from 'react';
import { Card, CardHeader, CardBody } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

const TermsPage: React.FC = () => {
  const { t } = useTranslation();

  const sections = [
    { 
      icon: 'lucide:book-open', 
      title: t('termsPage.definitions.title'), 
      content: [
        t('termsPage.definitions.service'),
        t('termsPage.definitions.user'),
        t('termsPage.definitions.userContent'),
      ]
    },
    { 
      icon: 'lucide:check-square', 
      title: t('termsPage.acceptance.title'), 
      content: t('termsPage.acceptance.text') 
    },
    { 
      icon: 'lucide:book-open-check', 
      title: t('termsPage.useOfService.title'), 
      content: [
        t('termsPage.useOfService.license'),
        t('termsPage.useOfService.prohibitedConduct'),
        ...(t('termsPage.useOfService.prohibitedConductList', { returnObjects: true } as any) || []),
      ]
    },
    { 
      icon: 'lucide:shield-check', 
      title: t('termsPage.privacy.title'), 
      content: t('termsPage.privacy.text')
    },
    { 
      icon: 'lucide:gem', 
      title: t('termsPage.ip.title'), 
      content: [
        t('termsPage.ip.platformContent'),
        t('termsPage.ip.userContent'),
      ]
    },
    { 
      icon: 'lucide:alert-triangle', 
      title: t('termsPage.disclaimer.title'), 
      content: [
        t('termsPage.disclaimer.text'),
        t('termsPage.disclaimer.limitation'),
      ]
    },
    { 
      icon: 'lucide:clock', 
      title: t('termsPage.duration.title'), 
      content: [
        t('termsPage.duration.term'),
        t('termsPage.duration.terminationByUser'),
        t('termsPage.duration.terminationByBreach'),
      ]
    },
    { 
      icon: 'lucide:file-pen-line', 
      title: t('termsPage.modifications.title'), 
      content: [
        t('termsPage.modifications.text'),
        t('termsPage.modifications.acceptance'),
      ]
    },
    { 
      icon: 'lucide:gavel', 
      title: t('termsPage.law.title'), 
      content: t('termsPage.law.text') 
    },
    { 
      icon: 'lucide:mail', 
      title: t('termsPage.contact.title'), 
      content: [
        t('termsPage.contact.text'),
        t('termsPage.contact.email'),
      ]
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="bg-content1/60 backdrop-blur-md border border-divider shadow-lg">
        <CardHeader className="border-b border-divider p-6">
          <div className="flex items-center">
            <Icon icon="lucide:file-text" className="text-3xl text-primary mr-4" />
            <h1 className="text-3xl font-bold tracking-tight">{t('termsPage.title')}</h1>
          </div>
        </CardHeader>
        <CardBody className="p-6 md:p-8 space-y-8">
          <p className="text-lg text-foreground/80 leading-relaxed">
            {t('termsPage.intro')}
          </p>
          
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Icon icon={section.icon} className="text-2xl text-primary/80 mt-1" />
                </div>
                <div className="w-full">
                  <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
                  {Array.isArray(section.content) ? (
                    <div className="space-y-2">
                      {section.content.map((line, i) => (
                        <p key={i} className="text-foreground/70 leading-loose whitespace-pre-line">{line}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-foreground/70 leading-loose">{section.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TermsPage;