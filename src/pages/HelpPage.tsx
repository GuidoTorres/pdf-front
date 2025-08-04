import React from 'react';
import { Card, CardHeader, CardBody, Accordion, AccordionItem, Button } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

const HelpPage: React.FC = () => {
  const { t } = useTranslation();
  const faqItems = [
    {
      question: t('helpPage.faq.q1'),
      answer: t('helpPage.faq.a1')
    },
    {
      question: t('helpPage.faq.q2'),
      answer: t('helpPage.faq.a2')
    },
    {
      question: t('helpPage.faq.q3'),
      answer: t('helpPage.faq.a3')
    },
    {
      question: t('helpPage.faq.q4'),
      answer: t('helpPage.faq.a4')
    },
    {
      question: t('helpPage.faq.q5'),
      answer: t('helpPage.faq.a5')
    },
    {
      question: t('helpPage.faq.q6'),
      answer: t('helpPage.faq.a6')
    },
    {
      question: t('helpPage.faq.q7'),
      answer: t('helpPage.faq.a7')
    },
    {
      question: t('helpPage.faq.q8'),
      answer: t('helpPage.faq.a8')
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardHeader>
          <h2 className="text-2xl font-semibold">{t('helpPage.title')}</h2>
        </CardHeader>
        <CardBody>
          <Accordion>
            {faqItems.map((item, index) => (
              <AccordionItem key={index} aria-label={item.question} title={item.question}>
                {item.answer}
              </AccordionItem>
            ))}
          </Accordion>
        </CardBody>
      </Card>

      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardHeader>
          <h2 className="text-2xl font-semibold">{t('helpPage.contact')}</h2>
        </CardHeader>
        <CardBody className="text-center">
          <p className="mb-4">If you need further assistance, please don't hesitate to contact us.</p>
          <Button as="a" href="mailto:support@statementai.com" color="primary">
            <Icon icon="lucide:mail" className="mr-2" />
            support@statementai.com
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default HelpPage;