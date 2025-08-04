import React from 'react';
import { Card, CardHeader, CardBody } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();

  const sections = [

    { 
      icon: 'lucide:database', 
      title: t('privacyPage.infoCollection.title'), 
      content: [
        {
          subtitle: t('privacyPage.infoCollection.registrationData.subtitle'),
          items: t('privacyPage.infoCollection.registrationData.items', { returnObjects: true }) as string[]
        },
        {
          subtitle: t('privacyPage.infoCollection.technicalData.subtitle'),
          items: t('privacyPage.infoCollection.technicalData.items', { returnObjects: true }) as string[]
        },
        {
          subtitle: t('privacyPage.infoCollection.optionalData.subtitle'),
          items: t('privacyPage.infoCollection.optionalData.items', { returnObjects: true }) as string[]
        }
      ]
    },
    { 
      icon: 'lucide:target', 
      title: t('privacyPage.purposes.title'), 
      content: 'table',
      tableData: {
        headers: t('privacyPage.purposes.tableHeaders', { returnObjects: true }) as any,
        items: t('privacyPage.purposes.items', { returnObjects: true }) as any[]
      }
    },
    { 
      icon: 'lucide:clock', 
      title: t('privacyPage.dataRetention.title'), 
      content: t('privacyPage.dataRetention.items', { returnObjects: true }) as string[]
    },
    { 
      icon: 'lucide:globe', 
      title: t('privacyPage.recipients.title'), 
      content: t('privacyPage.recipients.text') 
    },
    { 
      icon: 'lucide:cookie', 
      title: t('privacyPage.cookies.title'), 
      content: t('privacyPage.cookies.items', { returnObjects: true }) as string[]
    },
    { 
      icon: 'lucide:user-check', 
      title: t('privacyPage.userRights.title'), 
      content: [
        t('privacyPage.userRights.intro'),
        ...(t('privacyPage.userRights.items', { returnObjects: true }) as string[]).map((item: string) => `  • ${item}`),
        '',
        t('privacyPage.userRights.exercise')
      ]
    },
    { 
      icon: 'lucide:shield', 
      title: t('privacyPage.security.title'), 
      content: t('privacyPage.security.text') 
    },
    { 
      icon: 'lucide:baby', 
      title: t('privacyPage.minors.title'), 
      content: t('privacyPage.minors.text') 
    },
    { 
      icon: 'lucide:file-pen-line', 
      title: t('privacyPage.changes.title'), 
      content: t('privacyPage.changes.text') 
    },
    { 
      icon: 'lucide:mail', 
      title: t('privacyPage.contact.title'), 
      content: [
        t('privacyPage.contact.intro'),
        t('privacyPage.contact.email'),
      ]
    }
  ];

  const renderContent = (section: any) => {
    if (section.content === 'table') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-divider">
            <thead>
              <tr className="bg-content2">
                <th className="border border-divider p-3 text-left font-semibold">{section.tableData.headers.purpose}</th>
                <th className="border border-divider p-3 text-left font-semibold">{section.tableData.headers.data}</th>
                <th className="border border-divider p-3 text-left font-semibold">{section.tableData.headers.legalBasis}</th>
              </tr>
            </thead>
            <tbody>
              {section.tableData.items.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-content2/50">
                  <td className="border border-divider p-3">{item.purpose}</td>
                  <td className="border border-divider p-3">{item.data}</td>
                  <td className="border border-divider p-3">{item.legalBasis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (Array.isArray(section.content)) {
      return (
        <div className="space-y-3">
          {section.content.map((item: any, i: number) => {
            if (typeof item === 'object' && item.subtitle) {
              return (
                <div key={i} className="space-y-2">
                  <h4 className="text-lg font-semibold text-primary">{item.subtitle}</h4>
                  <ul className="space-y-1 ml-4">
                    {item.items.map((subItem: string, j: number) => (
                      <li key={j} className="text-foreground/70 leading-loose">• {subItem}</li>
                    ))}
                  </ul>
                </div>
              );
            }
            return (
              <p key={i} className="text-foreground/70 leading-loose whitespace-pre-line">{item}</p>
            );
          })}
        </div>
      );
    }

    return <p className="text-foreground/70 leading-loose whitespace-pre-line">{section.content}</p>;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="bg-content1/60 backdrop-blur-md border border-divider shadow-lg">
        <CardHeader className="border-b border-divider p-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <Icon icon="lucide:shield" className="text-3xl text-primary mr-4" />
              <h1 className="text-3xl font-bold tracking-tight">{t('privacyPage.title')}</h1>
            </div>
            <p className="text-sm text-foreground/60">{t('privacyPage.lastUpdated')}</p>
          </div>
        </CardHeader>
        <CardBody className="p-6 md:p-8 space-y-8">
          <p className="text-lg text-foreground/80 leading-relaxed">
            {t('privacyPage.intro')}
          </p>
          
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Icon icon={section.icon} className="text-2xl text-primary/80 mt-1" />
                </div>
                <div className="w-full">
                  <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                  {renderContent(section)}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default PrivacyPage;