import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-content2 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <span className="text-2xl font-bold flex items-center">
              <Icon icon="lucide:database" className="text-primary mr-2" />
              StamentAI
            </span>
            <p className="text-default-600 mt-2">
              {t('landingPage.footer.tagline')}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link to="/privacy" className="text-foreground/80 hover:text-foreground">{t('landingPage.footer.privacyPolicy')}</Link>
            <Link to="/terms" className="text-foreground/80 hover:text-foreground">{t('landingPage.footer.termsOfService')}</Link>
            <Link to="/help" className="text-foreground/80 hover:text-foreground">{t('landingPage.footer.contactUs')}</Link>
          </div>
        </div>
        <p className="text-center text-default-600 mt-8">
          © {new Date().getFullYear()} StatementAI. {t('landingPage.footer.copyright')}
        </p>
      </div>
    </footer>
  );
};