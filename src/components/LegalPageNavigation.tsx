import React from 'react';
import { Button } from "@heroui/react";
import { Icon } from '@iconify/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/useAuthStore';

/**
 * LegalPageNavigation - Contextual navigation for legal pages
 * Shows different navigation options based on user authentication status
 */
const LegalPageNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  const handleBack = () => {
    if (isAuthenticated) {
      // If user is authenticated, take them back to dashboard
      navigate('/dashboard');
    } else {
      // If user is not authenticated, take them to landing page
      navigate('/');
    }
  };

  const getBackButtonText = () => {
    if (isAuthenticated) {
      return t('common.backToDashboard', 'Back to Dashboard');
    }
    return t('common.backToHome', 'Back to Home');
  };

  const getBackButtonIcon = () => {
    if (isAuthenticated) {
      return 'lucide:layout-dashboard';
    }
    return 'lucide:home';
  };

  return (
    <div className="mb-6">
      <Button
        variant="flat"
        color="default"
        size="sm"
        startContent={<Icon icon={getBackButtonIcon()} />}
        onPress={handleBack}
        className="mb-4"
      >
        {getBackButtonText()}
      </Button>
      
      {/* Breadcrumb indicator */}
      <div className="flex items-center text-sm text-foreground/60 mb-2">
        <span>
          {isAuthenticated ? t('common.dashboard', 'Dashboard') : t('common.home', 'Home')}
        </span>
        <Icon icon="lucide:chevron-right" className="mx-2" />
        <span className="text-foreground">
          {location.pathname === '/terms' && t('common.termsOfService', 'Terms of Service')}
          {location.pathname === '/privacy' && t('common.privacyPolicy', 'Privacy Policy')}
          {location.pathname === '/refund' && t('common.refundPolicy', 'Refund Policy')}
        </span>
      </div>
    </div>
  );
};

export default LegalPageNavigation;