import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Avatar,
  Switch,
  Select,
  SelectItem,
  Divider,
  Chip,
  Progress,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../stores/useAuthStore";

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Icon icon="lucide:settings" className="text-primary" />
          {t("settingsPage.title") || "Settings"}
        </h1>
        <p className="text-default-600">{t("settingsPage.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <Card className="bg-content1/60 backdrop-blur-md border border-divider">
            <CardHeader className="flex gap-3 pb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon icon="lucide:user" className="text-xl text-primary" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold">
                  {t("settingsPage.profile.title")}
                </h2>
                <p className="text-sm text-default-500">
                  {t("settingsPage.profile.subtitle")}
                </p>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar
                  name={user?.name || user?.email || "User"}
                  size="lg"
                  className="ring-4 ring-primary/20"
                />
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-default-600">
                    {t("settingsPage.profile.profilePictureManaged")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t("settingsPage.profile.name")}
                  placeholder={t("settingsPage.profile.yourName")}
                  defaultValue={user?.name || "Jane Doe"}
                  startContent={
                    <Icon icon="lucide:user" className="text-default-400" />
                  }
                />
                <Input
                  label={t("settingsPage.profile.email")}
                  placeholder={t("settingsPage.profile.email")}
                  defaultValue={user?.email || "jane@example.com"}
                  startContent={
                    <Icon icon="lucide:mail" className="text-default-400" />
                  }
                  isDisabled
                />
              </div>

              <Divider />

              <div className="flex justify-end gap-3">
                <Button variant="flat">
                  {t("settingsPage.profile.cancel")}
                </Button>
                <Button
                  color="primary"
                  startContent={<Icon icon="lucide:save" />}
                >
                  {t("settingsPage.profile.saveChanges")}
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Security Section - Only show for email/password users */}
          {!user?.email?.includes("google") && (
            <Card className="bg-content1/60 backdrop-blur-md border border-divider">
              <CardHeader className="flex gap-3 pb-4">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Icon icon="lucide:shield" className="text-xl text-warning" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl font-semibold">
                    {t("settingsPage.password.title")}
                  </h2>
                  <p className="text-sm text-default-500">
                    {t("settingsPage.password.subtitle")}
                  </p>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  label={t("settingsPage.password.current")}
                  type="password"
                  placeholder={t("settingsPage.password.enterCurrent")}
                  startContent={
                    <Icon icon="lucide:lock" className="text-default-400" />
                  }
                />
                <Input
                  label={t("settingsPage.password.new")}
                  type="password"
                  placeholder={t("settingsPage.password.enterNew")}
                  startContent={
                    <Icon icon="lucide:key" className="text-default-400" />
                  }
                />
                <Input
                  label={t("settingsPage.password.confirmNew")}
                  type="password"
                  placeholder={t("settingsPage.password.confirmNewPlaceholder")}
                  startContent={
                    <Icon icon="lucide:key" className="text-default-400" />
                  }
                />

                <div className="bg-default-50 p-4 rounded-lg">
                  <p className="text-sm text-default-600 mb-2">
                    {t("settingsPage.password.requirements")}
                  </p>
                  <ul className="text-xs text-default-500 space-y-1">
                    <li>• {t("settingsPage.password.req1")}</li>
                    <li>• {t("settingsPage.password.req2")}</li>
                    <li>• {t("settingsPage.password.req3")}</li>
                    <li>• {t("settingsPage.password.req4")}</li>
                  </ul>
                </div>

                <Divider />

                <Button
                  color="primary"
                  startContent={<Icon icon="lucide:shield-check" />}
                >
                  {t("settingsPage.password.update")}
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="bg-danger-50/50 backdrop-blur-md border border-danger-200">
            <CardHeader className="flex gap-3 pb-4">
              <div className="p-2 bg-danger/10 rounded-lg">
                <Icon
                  icon="lucide:alert-triangle"
                  className="text-xl text-danger"
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold text-danger">
                  {t("settingsPage.dangerZone.title")}
                </h2>
                <p className="text-sm text-danger-600">
                  {t("settingsPage.dangerZone.subtitle")}
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex items-center justify-between p-4 bg-danger-100 rounded-lg">
                <div>
                  <h3 className="font-medium text-danger">{t("settingsPage.dangerZone.deleteAccount")}</h3>
                  <p className="text-sm text-danger-600">
                    {t("settingsPage.dangerZone.deleteAccountDesc")}
                  </p>
                </div>
                <Button
                  color="danger"
                  variant="flat"
                  startContent={<Icon icon="lucide:trash-2" />}
                >
                  {t("settingsPage.dangerZone.deleteAccount")}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Quick Settings */}
        <div className="space-y-6">
          {/* Account Overview */}
          <Card className="bg-content1/60 backdrop-blur-md border border-divider">
            <CardHeader className="pb-4">
              <h3 className="text-lg font-semibold">{t("settingsPage.account.title")}</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t("settingsPage.account.plan")}</span>
                <Chip color="primary" size="sm">
                  {user?.plan || t("settingsPage.account.freePlan")}
                </Chip>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t("settingsPage.account.pagesRemaining")}</span>
                <span className="font-semibold">
                  {(user?.pages_remaining || 0) >= 999999
                    ? "∞ " + t("settingsPage.account.unlimited")
                    : user?.pages_remaining || 0}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t("settingsPage.account.usageThisMonth")}</span>
                  <span>75%</span>
                </div>
                <Progress value={75} color="primary" size="sm" />
              </div>
              <Button
                size="sm"
                color="primary"
                variant="flat"
                className="w-full"
              >
                {t("settingsPage.account.upgradePlan")}
              </Button>
            </CardBody>
          </Card>

          {/* Preferences */}
          <Card className="bg-content1/60 backdrop-blur-md border border-divider">
            <CardHeader className="pb-4">
              <h3 className="text-lg font-semibold">{t("settingsPage.preferences.title")}</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{t("settingsPage.preferences.notifications")}</span>
                  <span className="text-xs text-default-500">
                    {t("settingsPage.preferences.notificationsDesc")}
                  </span>
                </div>
                <Switch
                  isSelected={notifications}
                  onValueChange={setNotifications}
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{t("settingsPage.preferences.emailUpdates")}</span>
                  <span className="text-xs text-default-500">
                    {t("settingsPage.preferences.emailUpdatesDesc")}
                  </span>
                </div>
                <Switch
                  isSelected={emailNotifications}
                  onValueChange={setEmailNotifications}
                  size="sm"
                />
              </div>

              <Divider />

              <Select
                label={t("settingsPage.preferences.language")}
                placeholder={t("settingsPage.preferences.selectLanguage")}
                defaultSelectedKeys={["en"]}
                size="sm"
              >
                <SelectItem key="en">English</SelectItem>
                <SelectItem key="es">Español</SelectItem>
              </Select>

              <Select
                label={t("settingsPage.preferences.timezone")}
                placeholder={t("settingsPage.preferences.selectTimezone")}
                defaultSelectedKeys={["utc"]}
                size="sm"
              >
                <SelectItem key="utc">UTC</SelectItem>
                <SelectItem key="est">EST</SelectItem>
                <SelectItem key="pst">PST</SelectItem>
              </Select>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
