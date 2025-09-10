import React from "react";
import { Button, Image, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../stores/useAuthStore";

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleStartProcessing = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };


  return (
    <div id="hero" className="relative py-16 md:py-24 min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-background to-secondary-50 opacity-50" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <Chip
              color="primary"
              variant="flat"
              className="mb-6"
              startContent={<Icon icon="lucide:sparkles" className="text-sm" />}
            >
              {t('landingPage.hero.badge')}
            </Chip>

            {/* Main heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t('landingPage.hero.title')}
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                {" "}
                {t('landingPage.hero.titleHighlight')}
              </span>
            </h1>

            {/* Subtitle with SEO keywords */}
            <p className="text-lg md:text-xl text-default-600 mb-8 max-w-2xl">
              {t('landingPage.hero.subtitle')}
            </p>

            {/* SEO Content Block */}
            <div className="hidden">
              <h2>Conversor PDF a Excel con Inteligencia Artificial</h2>
              <p>El mejor conversor PDF a Excel con IA para extraer datos bancarios y estados de cuenta automáticamente. Utiliza inteligencia artificial avanzada para convertir PDFs complejos a hojas de cálculo Excel de forma precisa y rápida.</p>
              <h3>Características del conversor PDF Excel con IA:</h3>
              <ul>
                <li>Conversión PDF a Excel con inteligencia artificial</li>
                <li>AI-powered data extraction automática</li>
                <li>Extracción de datos bancarios con IA</li>
                <li>Smart table detection y procesamiento</li>
                <li>Automated PDF to spreadsheet conversion</li>
                <li>Bank statement processing con AI</li>
                <li>Detección inteligente de transacciones</li>
                <li>Procesamiento 100% seguro y privado</li>
                <li>Conversión rápida con machine learning</li>
              </ul>
              <h4>¿Por qué usar un conversor PDF con IA?</h4>
              <p>Los conversores PDF tradicionales fallan con documentos complejos. Nuestra herramienta con inteligencia artificial entiende el contexto, identifica patrones y extrae datos con precisión superior. Perfecto para estados de cuenta bancarios, facturas y documentos financieros que requieren análisis inteligente.</p>
              <h4>Ventajas del PDF to Excel AI:</h4>
              <p>La inteligencia artificial permite procesar PDFs que otros conversores no pueden manejar. Reconoce automáticamente tablas, categoriza datos y mantiene la estructura original. Ideal para contadores, analistas financieros y empresas que procesan gran volumen de documentos PDF.</p>
            </div>

            {/* Features list */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-sm text-default-600">
                <Icon icon="lucide:zap" className="text-primary" />
                <span>{t('landingPage.hero.features.lightningFast')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-default-600">
                <Icon icon="lucide:shield-check" className="text-success" />
                <span>{t('landingPage.hero.features.secureProcessing')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-default-600">
                <Icon icon="lucide:download" className="text-secondary" />
                <span>{t('landingPage.hero.features.instantDownload')}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex justify-center lg:justify-start">
              <Button
                color="primary"
                size="lg"
                className="font-semibold px-8"
                startContent={<Icon icon="lucide:upload" />}
                onClick={handleStartProcessing}
              >
                {t('landingPage.hero.ctaButton')}
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-default-500">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:users" />
                <span>{t('landingPage.hero.socialProof.users')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:file-text" />
                <span>{t('landingPage.hero.socialProof.documents')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:star" />
                <span>{t('landingPage.hero.socialProof.rating')}</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div className="flex-1 relative">
            <div className="relative">
              {/* Main dashboard mockup */}
              <div className="bg-content1 rounded-2xl shadow-2xl border border-divider p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-danger rounded-full" />
                  <div className="w-3 h-3 bg-warning rounded-full" />
                  <div className="w-3 h-3 bg-success rounded-full" />
                </div>

                {/* Mock upload area */}
                <div className="border-2 border-dashed border-primary rounded-lg p-8 text-center mb-4">
                  <Icon
                    icon="lucide:upload-cloud"
                    className="text-4xl text-primary mx-auto mb-2"
                  />
                  <p className="text-sm text-default-600">{t('landingPage.hero.mockup.dropText')}</p>
                </div>

                {/* Mock results */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-success/10 rounded">
                    <span className="text-xs">Bank Statement - Jan 2024</span>
                    <Chip size="sm" color="success" variant="flat">
                      {t('landingPage.hero.mockup.completed')}
                    </Chip>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
                    <span className="text-xs">Credit Card - Dec 2023</span>
                    <Chip size="sm" color="primary" variant="flat">
                      {t('landingPage.hero.mockup.processing')}
                    </Chip>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-success rounded-full p-3 shadow-lg animate-bounce">
                <Icon icon="lucide:check" className="text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-primary rounded-full p-3 shadow-lg animate-pulse">
                <Icon icon="lucide:zap" className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
