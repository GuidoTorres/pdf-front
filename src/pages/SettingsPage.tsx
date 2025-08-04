import React from 'react';
import { Card, CardHeader, CardBody, Input, Button, Avatar } from "@heroui/react";
import { useTranslation } from 'react-i18next';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardHeader>
          <h2 className="text-xl font-semibold">{t('settingsPage.profile.title')}</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar src="https://img.heroui.chat/image/avatar?w=200&h=200&u=1" size="lg" />
            <Button color="primary" variant="light">{t('settingsPage.profile.changeAvatar')}</Button>
          </div>
          <Input label={t('settingsPage.profile.name')} placeholder={t('settingsPage.profile.yourName')} defaultValue="Jane Doe" />
          <Input label={t('settingsPage.profile.email')} placeholder={t('enterEmail')} defaultValue="jane@example.com" />
          <Button color="primary">{t('settingsPage.profile.saveChanges')}</Button>
        </CardBody>
      </Card>

      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardHeader>
          <h2 className="text-xl font-semibold">{t('settingsPage.password.title')}</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input label={t('settingsPage.password.current')} type="password" placeholder={t('settingsPage.password.enterCurrent')} />
          <Input label={t('settingsPage.password.new')} type="password" placeholder={t('settingsPage.password.enterNew')} />
          <Input label={t('settingsPage.password.confirmNew')} type="password" placeholder={t('settingsPage.password.confirmNewPlaceholder')} />
          <Button color="primary">{t('settingsPage.password.update')}</Button>
        </CardBody>
      </Card>

      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardHeader>
          <h2 className="text-xl font-semibold">{t('settingsPage.dangerZone.title')}</h2>
        </CardHeader>
        <CardBody>
          <Button color="danger" variant="flat">{t('settingsPage.dangerZone.deleteAccount')}</Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default SettingsPage;