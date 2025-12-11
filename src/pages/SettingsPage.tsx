import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Avatar,
  Divider,
  Chip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../stores/useAuthStore";

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isGoogleAccount = Boolean(user?.google_id);
  const planLabel = user?.plan || t("settingsPage.account.freePlan");
  const pagesRemaining =
    user?.pages_remaining && user.pages_remaining >= 999999
      ? "∞ " + t("settingsPage.account.unlimited")
      : user?.pages_remaining ?? 0;

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

      <div className="space-y-6">
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
                {isGoogleAccount
                  ? t("settingsPage.profile.googleManaged") ||
                    "Tu información personal se sincroniza con Google."
                  : t("settingsPage.profile.subtitle")}
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
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-default-800">
                  {user?.name || "—"}
                </span>
                <span className="text-sm text-default-500">{user?.email}</span>
                {isGoogleAccount && (
                  <Chip size="sm" color="secondary" variant="flat">
                    Google Sign-In
                  </Chip>
                )}
              </div>
            </div>

            <Divider />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase text-default-400">
                  {t("settingsPage.profile.name")}
                </p>
                <p className="font-medium text-default-800">
                  {user?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-default-400">
                  {t("settingsPage.profile.email")}
                </p>
                <p className="font-medium text-default-800 break-all">
                  {user?.email}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-default-400">
                  {t("settingsPage.account.plan")}
                </p>
                <p className="font-medium text-default-800">{planLabel}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-default-400">
                  {t("settingsPage.account.pagesRemaining")}
                </p>
                <p className="font-medium text-default-800">{pagesRemaining}</p>
              </div>
            </div>

            <Divider />

            <p className="text-xs text-default-500 leading-relaxed">
              {isGoogleAccount
                ? t("settingsPage.profile.googleManagedHint") ||
                  "Para actualizar tu nombre o imagen, realiza los cambios desde tu cuenta de Google."
                : t("settingsPage.profile.manualUpdateHint") ||
                  "Si necesitas actualizar tus datos, ponte en contacto con el equipo de soporte."}
            </p>
          </CardBody>
        </Card>

        {/* Security Guidance */}
        <Card className="bg-content1/60 backdrop-blur-md border border-divider">
          <CardHeader className="flex gap-3 pb-4">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Icon icon="lucide:shield" className="text-xl text-warning" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold">
                {t("settingsPage.security.title") || "Seguridad"}
              </h2>
              <p className="text-sm text-default-500">
                {isGoogleAccount
                  ? t("settingsPage.security.googleDescription") ||
                    "La autenticación se gestiona desde tu cuenta de Google."
                  : t("settingsPage.security.passwordDescription") ||
                    "Puedes solicitar un cambio de contraseña desde la pantalla de inicio de sesión."}
              </p>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {isGoogleAccount ? (
              <div className="rounded-lg border border-warning-200 bg-warning-50 p-4 text-sm text-warning-700">
                <p className="font-medium mb-1">
                  {t("settingsPage.security.googleTitle") ||
                    "Cuenta conectada con Google"}
                </p>
                <p>
                  {t("settingsPage.security.googleHint") ||
                    "Cualquier cambio de contraseña o verificación debe realizarse desde accounts.google.com."}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-default-200 bg-default-50 p-4 text-sm text-default-600">
                <p className="font-medium text-default-800 mb-1">
                  {t("settingsPage.security.passwordSupportTitle") ||
                    "¿Necesitas restablecer tu contraseña?"}
                </p>
                <p>
                  {t("settingsPage.security.passwordSupportHint") ||
                    "Inicia sesión y utiliza la opción \"¿Olvidaste tu contraseña?\" para recibir un enlace de restablecimiento."}
                </p>
              </div>
            )}
            <Button
              as="a"
              href={isGoogleAccount ? "https://myaccount.google.com/security" : "/login"}
              target={isGoogleAccount ? "_blank" : undefined}
              rel={isGoogleAccount ? "noopener noreferrer" : undefined}
              color="primary"
              variant="flat"
              startContent={<Icon icon="lucide:external-link" />}
            >
              {isGoogleAccount
                ? t("settingsPage.security.manageGoogle") || "Abrir configuración de Google"
                : t("settingsPage.security.goToLogin") || "Ir a inicio de sesión"}
            </Button>
          </CardBody>
        </Card>

        {/* Plan overview */}
        <Card className="bg-content1/60 backdrop-blur-md border border-divider">
          <CardHeader className="pb-4">
            <h3 className="text-lg font-semibold">
              {t("settingsPage.account.title")}
            </h3>
          </CardHeader>
          <CardBody className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-default-500">
                {t("settingsPage.account.plan")}
              </span>
              <Chip color="primary" size="sm">
                {planLabel}
              </Chip>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-default-500">
                {t("settingsPage.account.pagesRemaining")}
              </span>
              <span className="font-semibold text-default-800">
                {pagesRemaining}
              </span>
            </div>
            {user?.subscription?.renewed_at && (
              <div className="flex items-center justify-between">
                <span className="text-default-500">
                  {t("settingsPage.account.renewedAt") || "Última renovación"}
                </span>
                <span className="font-semibold text-default-800">
                  {new Date(user.subscription.renewed_at).toLocaleDateString()}
                </span>
              </div>
            )}
            {user?.subscription?.next_reset && (
              <div className="flex items-center justify-between">
                <span className="text-default-500">
                  {t("settingsPage.account.nextReset") || "Próximo reinicio"}
                </span>
                <span className="font-semibold text-default-800">
                  {new Date(user.subscription.next_reset).toLocaleDateString()}
                </span>
              </div>
            )}

            <Divider />

            <p className="text-xs text-default-500 leading-relaxed">
              {t("settingsPage.account.helpText") ||
                "Si necesitas cambiar de plan o tienes dudas sobre tu facturación, escríbenos y con gusto te ayudamos."}
            </p>
            <Button
              as="a"
              href="mailto:soporte@pdfconverter.com"
              color="primary"
              variant="flat"
              startContent={<Icon icon="lucide:mail" />}
            >
              {t("settingsPage.account.contactSupport") || "Contactar soporte"}
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
