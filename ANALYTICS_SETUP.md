# 📊 ANALYTICS SETUP GUIDE - AI PDF CONVERTER

## 🚀 IMPLEMENTACIÓN COMPLETA DE ANALYTICS

### ✅ Lo que ya está configurado:

**1. Google Analytics 4 (GA4)**
- ✅ Script implementado en `index.html`
- ✅ Enhanced measurements habilitado
- ✅ Hook personalizado `useAnalytics.ts`
- ✅ Tracking de eventos personalizados

**2. Meta Pixel (Facebook/Instagram Ads)**
- ✅ Pixel code implementado
- ✅ PageView tracking automático
- ✅ Eventos de conversión configurados

**3. Hotjar (User Behavior)**
- ✅ Heatmaps y session recordings
- ✅ User feedback widgets
- ✅ Conversion funnels

---

## 🔧 CONFIGURACIÓN REQUERIDA

### **PASO 1: Google Analytics 4**
1. Ve a [Google Analytics](https://analytics.google.com/)
2. Crea una cuenta nueva
3. Configura una propiedad GA4
4. Copia tu `MEASUREMENT_ID` (formato: G-XXXXXXXXXX)
5. Reemplaza `GA_MEASUREMENT_ID` en `index.html` línea 39 y 44

### **PASO 2: Google Search Console**
1. Ve a [Search Console](https://search.google.com/search-console/)
2. Agrega tu dominio como propiedad
3. Copia el código de verificación
4. Reemplaza `GOOGLE_SEARCH_CONSOLE_CODE` en el archivo creado
5. O agrega la meta tag al `<head>`:
```html
<meta name="google-site-verification" content="TU_CODIGO" />
```

### **PASO 3: Meta Pixel (Facebook)**
1. Ve a [Facebook Business Manager](https://business.facebook.com/)
2. Crea un Pixel en Events Manager
3. Copia tu `PIXEL_ID`
4. Reemplaza `YOUR_PIXEL_ID` en `index.html` línea 70

### **PASO 4: Hotjar**
1. Ve a [Hotjar](https://www.hotjar.com/)
2. Crea una cuenta gratuita
3. Copia tu `SITE_ID`
4. Reemplaza `YOUR_HOTJAR_ID` en `index.html` línea 78

---

## 📈 EVENTOS TRACKEADOS AUTOMÁTICAMENTE

### **Eventos de Conversión:**
- ✅ `pdf_upload` - Usuario sube PDF
- ✅ `pdf_conversion_success` - Conversión exitosa
- ✅ `pdf_conversion_error` - Errores de conversión
- ✅ `sign_up` - Registro de usuario
- ✅ `login` - Inicio de sesión
- ✅ `subscription_upgrade` - Upgrade de plan

### **Métricas Automáticas (GA4):**
- ✅ Page views y sessions
- ✅ Scroll tracking
- ✅ File downloads
- ✅ Outbound clicks
- ✅ Site search
- ✅ Video engagement

### **Facebook Pixel Events:**
- ✅ `PageView` - Página visitada
- ✅ `InitiateCheckout` - PDF subido
- ✅ `CompleteRegistration` - Signup
- ✅ `Purchase` - Conversión/Upgrade

---

## 🎯 CÓMO USAR EL HOOK useAnalytics

```typescript
import { useAnalytics } from '../hooks/useAnalytics';

const MyComponent = () => {
  const { trackPDFUpload, trackPDFConversion, trackSignUp } = useAnalytics();

  const handleFileUpload = (file: File) => {
    trackPDFUpload(file.size, file.name);
  };

  const handleConversionSuccess = (time: number, pages: number) => {
    trackPDFConversion(time, pages);
  };

  const handleUserSignup = (method: string) => {
    trackSignUp(method); // 'google', 'email', etc.
  };
};
```

---

## 📊 DASHBOARDS RECOMENDADOS

### **Google Analytics - Métricas Clave:**
1. **Adquisición**: ¿De dónde vienen los usuarios?
2. **Comportamiento**: ¿Qué hacen en tu sitio?
3. **Conversiones**: ¿Cuántos convierten PDFs?
4. **Retención**: ¿Regresan los usuarios?

### **Métricas SEO importantes:**
- Organic search traffic
- Bounce rate de landing page
- Time on site
- Pages per session
- Goal conversions (PDF uploads)

### **Facebook Ads métricas:**
- Cost per acquisition (CPA)
- Return on ad spend (ROAS)
- Click-through rates (CTR)
- Conversion rates

---

## 🚨 GDPR & PRIVACY COMPLIANCE

**IMPORTANTE**: Debes agregar:

1. **Cookie Banner** - Consentimiento para analytics
2. **Privacy Policy** - Mencionar uso de cookies
3. **Data Processing** - Explicar qué datos recoges

### Ejemplo de cookie banner:
```html
<div id="cookie-banner">
  Este sitio usa cookies para mejorar tu experiencia y analytics.
  <button onclick="acceptCookies()">Aceptar</button>
</div>
```

---

## 💡 PRÓXIMOS PASOS

1. ✅ **Configurar IDs** en los scripts
2. ✅ **Testear eventos** en desarrollo
3. ✅ **Verificar Google Search Console**
4. ✅ **Configurar Google Ads** si vas a usar ads
5. ✅ **Implementar cookie consent**
6. ✅ **Crear dashboards personalizados**

---

## 🔍 TESTING & DEBUGGING

### Google Analytics:
- Usa GA4 DebugView en tiempo real
- Chrome DevTools → Network → buscar "google-analytics"

### Facebook Pixel:
- Instala Facebook Pixel Helper extension
- Events Manager → Test Events

### Hotjar:
- Ve a tu dashboard Hotjar
- Verifica que aparezcan recordings

---

**¡ANALYTICS IMPLEMENTADO! 🎉**

Ahora podrás ver:
- Cuántas personas llegan de Google
- Qué keywords funcionan mejor  
- Cuántos convierten PDFs
- Dónde se quedan los usuarios
- ROI de tus campañas de marketing