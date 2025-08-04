import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      dashboard: {
        pagesRemaining: "Pages Remaining",
        documentsProcessed: "Documents Processed",
        currentPlan: "Current Plan",
        processDocument: {
          title: "Process Document",
          pagesRemainingChip: "pages remaining",
          processingMethod: "Processing Method",
          docling: "Docling (AI-Powered)",
          traditional: "Traditional (Text Extraction)",
          remove: "Remove",
          process: "Process",
          processing: "Processing...",
          dragAndDrop: "Click to select or drag & drop",
          pdfOnlyError: "Please select a PDF file."
        },
        recentConversions: {
          title: "Recent Conversions",
          viewAll: "View All",
          filename: "Filename",
          status: "Status",
          date: "Date"
        },
        excelPreview: {
          title: "Excel Preview",
          download: "Download",
          tableAriaLabel: "Excel preview table",
          date: "Date",
          description: "Description",
          amount: "Amount",
          balance: "Balance",
          noPreview: "No preview available",
          selectCompleted: "Select a completed document to see the preview"
        },
        jobs: {
          title: "Jobs",
          processing: "Processing",
          completed: "Completed",
          failed: "Failed",
          processedDocument: "Processed Document",
          noJobs: "No jobs yet"
        }
      },
      layout: {
        sidebar: {
          dashboard: "Dashboard",
          history: "History",
          pricing: "Pricing",
          settings: "Settings"
        },
        profileMenu: {
          signedInAs: "Signed in as",
          settings: "Settings",
          helpAndFeedback: "Help & Feedback",
          logout: "Logout"
        },
        footer: {
          terms: "Terms of Service",
          privacy: "Privacy Policy",
          refund: "Refund Policy"
        }
      },
      helpPage: {
        title: "Help & FAQ",
        faq: {
          q1: "How do I upload a bank statement?",
          a1: "You can upload your bank statement by navigating to the Upload page and either dragging and dropping your file or clicking the 'Select File' button.",
          q2: "What file formats are supported?",
          a2: "We currently support PDF and CSV file formats for bank statements.",
          q3: "How long does the conversion process take?",
          a3: "The conversion process typically takes less than a minute, depending on the size and complexity of your bank statement.",
          q4: "Is my data secure?",
          a4: "Yes, we take data security very seriously. All uploads are encrypted, and we do not store your bank statements after conversion. The files are deleted from our servers immediately after processing is complete.",
          q5: "What should I do if I encounter an error?",
          a5: "If you encounter an error, please try uploading your file again. If the problem persists, contact our support team with details about the error.",
          q6: "What are the differences between the processing methods?",
          a6: "The 'Docling' method uses a powerful AI model to extract data from your documents, which is more accurate but may take longer. The 'Traditional' method uses a faster, more conventional approach that is suitable for simpler documents.",
          q7: "How do I use the application?",
          a7: "Simply drag and drop your PDF file into the upload area on the dashboard, or click to select a file from your computer. Then, select a processing method and click 'Process'. Your processed document will appear in the 'Excel Preview' section."
        },
        contact: "Contact Us"
      },
      historyPage: {
        title: "Conversion History",
        date: "Date",
        filename: "Filename",
        status: "Status",
        action: "Action"
      },
      loginPage: {
        welcome: "Welcome to StatementAI",
        loginToAccount: "Log in to your account",
        email: "Email",
        enterEmail: "Enter your email",
        password: "Password",
        enterPassword: "Enter your password",
        rememberMe: "Remember me",
        forgotPassword: "Forgot password?",
        login: "Log In",
        loggingIn: "Logging in...",
        orContinueWith: "Or continue with",
        signInWithGoogle: "Sign in with Google",
        signingIn: "Signing in...",
        noAccount: "Don't have an account?",
        signUp: "Sign up",
        invalidCredentials: "Invalid credentials. Please check your email and password.",
        loginError: "Error logging in. Please try again.",
        googleLoginError: "Error logging in with Google. Please try again."
      },
      pricingPage: {
        title: "Choose Your Plan",
        basicPlan: "Basic",
        proPlan: "Pro",
        enterprisePlan: "Enterprise",
        mostPopular: "Most Popular",
        contactSales: "Contact Sales",
        choosePlan: "Choose Plan",
        features: {
          basic: ["10 conversions/month", "Email support", "Standard processing"],
          pro: ["50 conversions/month", "Priority support", "Faster processing", "Data analytics"],
          enterprise: ["Unlimited conversions", "24/7 support", "Fastest processing", "Advanced analytics", "API access"]
        }
      },
      privacyPage: {
        title: "Privacy Policy",
        intro: "At StatementAI S.A.C., we take your privacy seriously. This policy outlines how we collect, use, and protect your personal information.",
        lastUpdated: "Last updated: August 4, 2025",
        dataController: {
          title: "Data Controller",
          company: "Company: StatementAI S.A.C.",
          address: "Address: Av. Ejemplo 123, Miraflores, Lima, Peru",
          contact: "Contact email: soporte@fluentlabs.cloud"
        },
        infoCollection: {
          title: "Information We Collect",
          registrationData: {
            subtitle: "Registration Data",
            items: [
              "Full name",
              "Email address",
              "Password (stored encrypted)"
            ]
          },
          technicalData: {
            subtitle: "Technical and Usage Data",
            items: [
              "IP address",
              "Device type and operating system",
              "Pages visited, date and time of access",
              "Cookies and similar technologies"
            ]
          },
          optionalData: {
            subtitle: "Optional Data",
            items: [
              "Location information (if authorized)",
              "Data shared in feedback forms, surveys, or support chat"
            ]
          }
        },
        purposes: {
          title: "Purposes and Legal Bases",
          tableHeaders: {
            purpose: "Purpose",
            data: "Data",
            legalBasis: "Legal Basis"
          },
          items: [
            {
              purpose: "Service provision",
              data: "Registration, Technical",
              legalBasis: "Contract execution"
            },
            {
              purpose: "Improvement and development of new features",
              data: "Usage, Cookies",
              legalBasis: "Legitimate interest"
            },
            {
              purpose: "Commercial communications and offers",
              data: "Registration",
              legalBasis: "User consent"
            },
            {
              purpose: "Customer service and support",
              data: "Registration, Usage",
              legalBasis: "Contract execution / Consent"
            }
          ]
        },
        dataRetention: {
          title: "Data Retention",
          items: [
            "Registration and profile data: while you maintain your account active and up to 2 years after deletion.",
            "Technical and usage data: up to 1 year for security and statistical analysis purposes.",
            "Commercial data (marketing): until you withdraw your consent."
          ]
        },
        recipients: {
          title: "Recipients and International Transfers",
          text: "We share data with hosting and analytics providers (e.g., AWS servers – USA – with approved standard contractual clauses). We may use other third-party tools (Google Analytics, social networks) whose terms and policies apply additionally."
        },
        cookies: {
          title: "Use of Cookies",
          items: [
            "Strictly necessary cookies: enable basic functionality (login, security).",
            "Performance and analytics cookies: collect anonymous information about usage to improve the platform.",
            "Advertising cookies: use browsing data to show relevant ads (you can disable them in your browser settings)."
          ]
        },
        userRights: {
          title: "User Rights",
          intro: "You have the right to:",
          items: [
            "Access your personal data.",
            "Rectify inaccurate or incomplete information.",
            "Delete data when no longer necessary.",
            "Object to processing for legitimate reasons.",
            "Port your data in structured format (JSON, CSV).",
            "Limit processing in specific cases."
          ],
          exercise: "To exercise them, send your request to soporte@fluentlabs.cloud with the subject 'Data Protection' and indicate which right you want to exercise. We will respond within a maximum of 30 days."
        },
        security: {
          title: "Information Security",
          text: "We implement appropriate technical and organizational measures (SSL/TLS encryption, access controls, backup copies) to protect your data against unauthorized access, alteration, or loss."
        },
        minors: {
          title: "Minors",
          text: "Our services are intended for individuals over 16 years old. If you are a minor, do not send personal data without consent from your parents or guardians. We reserve the right to cancel accounts of detected minors."
        },
        changes: {
          title: "Policy Changes",
          text: "We may update this Policy to adapt to regulatory or technical changes. We will publish the updated version with the 'Last updated' date at the top, and if changes are significant, we will notify you by email at least 15 days in advance."
        },
        contact: {
          title: "Contact",
          intro: "For any questions, complaints, or suggestions:",
          email: "Email: soporte@fluentlabs.cloud",
          address: "Address: Av. Ejemplo 123, Miraflores, Lima, Peru"
        }
      },
      refundPage: {
        title: "Refund Policy",
        intro: "We want you to be satisfied with your purchase. If you're not, we're here to help.",
        eligibility: "Eligibility for Refunds",
        eligibilityText: "Refunds are available for purchases made within the last 30 days, provided the service has not been used extensively.",
        howToRequest: "How to Request a Refund",
        howToRequestText: "To request a refund, please contact our support team with your order details and the reason for the refund.",
        processingTime: "Processing Time",
        processingTimeText: "Refunds are typically processed within 5-10 business days after approval."
      },
      settingsPage: {
        profile: {
          title: "Profile Settings",
          changeAvatar: "Change Avatar",
          name: "Name",
          yourName: "Your name",
          email: "Email",
          saveChanges: "Save Changes"
        },
        password: {
          title: "Change Password",
          current: "Current Password",
          enterCurrent: "Enter your current password",
          new: "New Password",
          enterNew: "Enter a new password",
          confirmNew: "Confirm New Password",
          confirmNewPlaceholder: "Confirm new password",
          update: "Update Password"
        },
        dangerZone: {
          title: "Danger Zone",
          deleteAccount: "Delete Account"
        }
      },
      signUpPage: {
        createAccount: "Create an Account",
        getStarted: "Sign up to get started with StatementAI",
        name: "Name",
        enterName: "Enter your full name",
        email: "Email",
        enterEmail: "Enter your email",
        password: "Password",
        createPassword: "Create a password",
        confirmPassword: "Confirm Password",
        agreeTo: "I agree to the",
        terms: "Terms of Service",
        and: "and",
        privacy: "Privacy Policy",
        signUp: "Sign Up",
        creatingAccount: "Creating Account...",
        orContinueWith: "Or continue with",
        signUpWithGoogle: "Sign up with Google",
        signingUp: "Signing up...",
        haveAccount: "Already have an account?",
        login: "Log in",
        passwordsMismatch: "Passwords do not match",
        passwordTooShort: "Password must be at least 6 characters",
        mustAcceptTerms: "You must accept the terms and conditions",
        errorCreatingAccount: "Error creating account",
        googleSignUpError: "Error signing up with Google. Please try again."
      },
      termsPage: {
        title: "Terms of Service",
        intro: "Welcome to StatementAI. By using our services, you agree to these terms. Please read them carefully.",
        definitions: {
          title: "Definitions",
          service: "'Service': the StatementAI platform and any of its features, applications, and associated websites.",
          user: "'User': any natural or legal person who accesses or uses the Service.",
          userContent: "'User Content': any text, image, video, or other material that the User uploads, publishes, or transmits through the Service."
        },
        acceptance: {
          title: "Acceptance of Terms",
          text: "By registering or using the Service, you accept these Terms and our Privacy Policy. If you do not agree, do not use the Service."
        },
        useOfService: {
          title: "Use of the Service",
          license: "License: we grant you a limited, non-exclusive, and non-transferable license to use the Service in accordance with these Terms.",
          prohibitedConduct: "Prohibited conduct:",
          prohibitedConductList: [
            "Do not interfere with the operation of the Service or circumvent its security mechanisms.",
            "Do not send spam, illegal, defamatory content, or content that infringes the rights of third parties.",
            "Do not use robots, scrapers, or automated tools without prior authorization."
          ]
        },
        privacy: {
          title: "Privacy and Data Protection",
          text: "For more information, see our [Privacy Policy]."
        },
        ip: {
          title: "Intellectual Property",
          platformContent: "Platform Content: all copyrights, trademarks, and designs of the Service belong to StatementAI or its licensors.",
          userContent: "User Content: you retain ownership, but you grant us a worldwide, royalty-free license to use, reproduce, and display your User Content in connection with the Service."
        },
        disclaimer: {
          title: "Responsibilities and Warranties",
          text: "Disclaimer of warranties: the Service is provided 'as is' and 'as available', without warranties of any kind (express or implied).",
          limitation: "Limitation of liability: in no event shall StatementAI be liable for indirect damages, loss of profits, or loss of data, even if we were informed of the possibility of such damages."
        },
        duration: {
          title: "Duration and Termination",
          term: "Term: these Terms will be in effect as long as you use the Service.",
          terminationByUser: "Cancelation del usuario: puedes cancelar tu suscripción en cualquier momento desde tu cuenta, eliminando la mayoría de tus datos en un tiempo razonable.",
          terminationByBreach: "Terminación por incumplimiento: podemos suspender o terminar tu acceso si incumples estos Términos, con previo aviso."
        },
        modifications: {
          title: "Modifications to the Terms",
          text: "Podemos actualizar estos Términos para adaptarlos a cambios legales o mejoras en el Servicio. Te notificaremos al menos 15 días por adelantado por correo electrónico o aviso en la plataforma.",
          acceptance: "Si continúas usando el Servicio después de la fecha de entrada en vigor, entenderemos que aceptas los cambios."
        },
        law: {
          title: "Ley Aplicable y Jurisdicción",
          text: "Estos Términos se rigen por las leyes de la República del Perú. Para cualquier disputa, las partes se someten a la jurisdicción exclusiva de los tribunales de la ciudad de Lima."
        },
        contact: {
          title: "Contacto",
          text: "Si tienes preguntas o reclamaciones, escríbenos a:",
          email: "Email: soporte@fluentlabs.cloud"
        }
      },
      uploadPage: {
        title: "Upload Bank Statement",
        intro: "Upload your bank statement in PDF to extract transaction data",
        pagesRemaining: "pages remaining",
        processingMethod: "Processing Method",
        aiPowered: "Docling (AI-Powered) - Recommended",
        textExtraction: "Traditional (Text Extraction)",
        removeFile: "Remove File",
        dragAndDrop: "Drag and drop your bank statement here",
        orClickToSelect: "or click to select a file",
        selectPDF: "Select PDF File",
        processing: "Processing document...",
        analyzing: "Analyzing document structure...",
        extracting: "Extracting transaction data...",
        processingAI: "Processing with AI...",
        finalizing: "Finalizing results...",
        process: "Process Document"
      }
    }
  },
  es: {
    translation: {
      dashboard: {
        pagesRemaining: "Páginas Restantes",
        documentsProcessed: "Documentos Procesados",
        currentPlan: "Plan Actual",
        processDocument: {
          title: "Procesar Documento",
          pagesRemainingChip: "páginas restantes",
          processingMethod: "Método de Procesamiento",
          docling: "Docling (Impulsado por IA)",
          traditional: "Tradicional (Extracción de Texto)",
          remove: "Eliminar",
          process: "Procesar",
          processing: "Procesando...",
          dragAndDrop: "Haz clic para seleccionar o arrastrar y soltar",
          pdfOnlyError: "Por favor, selecciona un archivo PDF."
        },
        recentConversions: {
          title: "Conversiones Recientes",
          viewAll: "Ver Todas",
          filename: "Nombre de Archivo",
          status: "Estado",
          date: "Fecha"
        },
        excelPreview: {
          title: "Vista Previa de Excel",
          download: "Descargar",
          tableAriaLabel: "Tabla de vista previa de Excel",
          date: "Fecha",
          description: "Descripción",
          amount: "Monto",
          balance: "Saldo",
          noPreview: "No hay vista previa disponible",
          selectCompleted: "Selecciona un documento completado para ver la vista previa"
        },
        jobs: {
          title: "Trabajos",
          processing: "Procesando",
          completed: "Completado",
          failed: "Fallido",
          processedDocument: "Documento Procesado",
          noJobs: "Aún no hay trabajos"
        }
      },
      layout: {
        sidebar: {
          dashboard: "Tablero",
          history: "Historial",
          pricing: "Precios",
          settings: "Configuración"
        },
        profileMenu: {
          signedInAs: "Sesión iniciada como",
          settings: "Configuración",
          helpAndFeedback: "Ayuda y Comentarios",
          logout: "Cerrar Sesión"
        },
        footer: {
          terms: "Términos de Servicio",
          privacy: "Política de Privacidad",
          refund: "Política de Reembolso"
        }
      },
      helpPage: {
        title: "Ayuda y Preguntas Frecuentes",
        faq: {
          q1: "¿Cómo subo un extracto bancario?",
          a1: "Puedes subir tu extracto bancario navegando a la página de Subir y arrastrando y soltando tu archivo o haciendo clic en el botón 'Seleccionar Archivo'.",
          q2: "¿Qué formatos de archivo son compatibles?",
          a2: "Actualmente admitimos formatos de archivo PDF y CSV para extractos bancarios.",
          q3: "¿Cuánto tiempo tarda el proceso de conversión?",
          a3: "El proceso de conversión generalmente toma menos de un minuto, dependiendo del tamaño y la complejidad de tu extracto bancario.",
          q4: "¿Están seguros mis datos?",
          a4: "Sí, nos tomamos la seguridad de los datos muy en serio. Todas las subidas están encriptadas y no almacenamos tus extractos bancarios después de la conversión. Los archivos se eliminan de nuestros servidores inmediatamente después de que se completa el procesamiento.",
          q5: "¿Qué debo hacer si encuentro un error?",
          a5: "Si encuentras un error, intenta subir tu archivo nuevamente. Si el problema persiste, contacta a nuestro equipo de soporte con detalles sobre el error.",
          q6: "¿Cuáles son las diferencias entre los métodos de procesamiento?",
          a6: "El método 'Docling' utiliza un potente modelo de IA para extraer datos de tus documentos, lo cual es más preciso pero puede llevar más tiempo. El método 'Tradicional' utiliza un enfoque más rápido y convencional que es adecuado para documentos más simples.",
          q7: "¿Cómo uso la aplicación?",
          a7: "Simplemente arrastra y suelta tu archivo PDF en el área de carga en el tablero, o haz clic para seleccionar un archivo de tu computadora. Luego, selecciona un método de procesamiento y haz clic en 'Procesar'. Tu documento procesado aparecerá en la sección 'Vista Previa de Excel'."
        },
        contact: "Contáctanos"
      },
      historyPage: {
        title: "Historial de Conversiones",
        date: "Fecha",
        filename: "Nombre de Archivo",
        status: "Estado",
        action: "Acción"
      },
      loginPage: {
        welcome: "Bienvenido a StatementAI",
        loginToAccount: "Inicia sesión en tu cuenta",
        email: "Correo Electrónico",
        enterEmail: "Ingresa tu correo electrónico",
        password: "Contraseña",
        enterPassword: "Ingresa tu contraseña",
        rememberMe: "Recuérdame",
        forgotPassword: "¿Olvidaste tu contraseña?",
        login: "Iniciar Sesión",
        loggingIn: "Iniciando sesión...",
        orContinueWith: "O continuar con",
        signInWithGoogle: "Iniciar sesión con Google",
        signingIn: "Iniciando sesión...",
        noAccount: "¿No tienes una cuenta?",
        signUp: "Regístrate",
        invalidCredentials: "Credenciales inválidas. Por favor, verifica tu correo electrónico y contraseña.",
        loginError: "Error al iniciar sesión. Por favor, intenta de nuevo.",
        googleLoginError: "Error al iniciar sesión con Google. Por favor, intenta de nuevo."
      },
      pricingPage: {
        title: "Elige Tu Plan",
        basicPlan: "Básico",
        proPlan: "Pro",
        enterprisePlan: "Empresarial",
        mostPopular: "Más Popular",
        contactSales: "Contactar a Ventas",
        choosePlan: "Elegir Plan",
        features: {
          basic: ["10 conversiones/mes", "Soporte por correo electrónico", "Procesamiento estándar"],
          pro: ["50 conversiones/mes", "Soporte prioritario", "Procesamiento más rápido", "Análisis de datos"],
          enterprise: ["Conversiones ilimitadas", "Soporte 24/7", "Procesamiento más rápido", "Análisis avanzado", "Acceso a API"]
        }
      },
      privacyPage: {
        title: "Política de Privacidad",
        lastUpdated: "Última actualización: 4 de agosto de 2025",
        intro: "En StatementAI, tu privacidad es importante para nosotros. Esta política explica qué información recopilamos y cómo la usamos.",
        infoCollection: {
          title: "Información que Recopilamos",
          text: "Para poder utilizar nuestros servicios, solo recopilamos la siguiente información:",
          items: [
            "Correo electrónico: para la creación y gestión de tu cuenta.",
            "Nombre de los archivos PDF: para identificar tus documentos procesados en tu historial."
          ]
        },
        useOfInfo: {
          title: "Uso de la Información",
          text: "Utilizamos esta información exclusivamente para:",
          items: [
            "Proporcionarte acceso a nuestros servicios.",
            "Permitirte ver tu historial de conversiones.",
            "Contactarte sobre tu cuenta si es necesario."
          ]
        },
        dataSecurity: {
          title: "Seguridad de los Datos",
          text: "No almacenamos los documentos que procesas. Los archivos se eliminan de nuestros servidores inmediatamente después de la conversión. La información de tu cuenta se almacena de forma segura y no se comparte con terceros."
        },
        changes: {
          title: "Cambios en la Política",
          text: "Podemos actualizar esta política ocasionalmente. Te notificaremos sobre cualquier cambio importante."
        },
        contact: {
          title: "Contacto",
          text: "Si tienes alguna pregunta sobre esta política de privacidad, puedes contactarnos en: soporte@fluentlabs.cloud"
        }
      },
      refundPage: {
        title: "Política de Reembolso",
        intro: "Queremos que estés satisfecho con tu compra. Si no lo estás, estamos aquí para ayudarte.",
        eligibility: "Elegibilidad para Reembolsos",
        eligibilityText: "Los reembolsos están disponibles para compras realizadas en los últimos 30 días, siempre que el servicio no haya sido utilizado extensivamente.",
        howToRequest: "Cómo Solicitar un Reembolso",
        howToRequestText: "Para solicitar un reembolso, por favor contacta a nuestro equipo de soporte con los detalles de tu pedido y la razón del reembolso.",
        processingTime: "Tiempo de Procesamiento",
        processingTimeText: "Los reembolsos generalmente se procesan dentro de 5-10 días hábiles después de la aprobación."
      },
      settingsPage: {
        profile: {
          title: "Configuración de Perfil",
          changeAvatar: "Cambiar Avatar",
          name: "Nombre",
          yourName: "Tu nombre",
          email: "Correo Electrónico",
          saveChanges: "Guardar Cambios"
        },
        password: {
          title: "Cambiar Contraseña",
          current: "Contraseña Actual",
          enterCurrent: "Ingresa tu contraseña actual",
          new: "Nueva Contraseña",
          enterNew: "Ingresa una nueva contraseña",
          confirmNew: "Confirmar Nueva Contraseña",
          confirmNewPlaceholder: "Confirmar nueva contraseña",
          update: "Actualizar Contraseña"
        },
        dangerZone: {
          title: "Zona de Peligro",
          deleteAccount: "Eliminar Cuenta"
        }
      },
      signUpPage: {
        createAccount: "Crear una Cuenta",
        getStarted: "Regístrate para comenzar con StatementAI",
        name: "Nombre",
        enterName: "Ingresa tu nombre completo",
        email: "Correo Electrónico",
        enterEmail: "Ingresa tu correo electrónico",
        password: "Contraseña",
        createPassword: "Crea una contraseña",
        confirmPassword: "Confirmar Contraseña",
        agreeTo: "Acepto los",
        terms: "Términos de Servicio",
        and: "y",
        privacy: "Política de Privacidad",
        signUp: "Registrarse",
        creatingAccount: "Creando Cuenta...",
        orContinueWith: "O continuar con",
        signUpWithGoogle: "Registrarse con Google",
        signingUp: "Registrándose...",
        haveAccount: "¿Ya tienes una cuenta?",
        login: "Iniciar sesión",
        passwordsMismatch: "Las contraseñas no coinciden",
        passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
        mustAcceptTerms: "Debes aceptar los términos y condiciones",
        errorCreatingAccount: "Error al crear la cuenta",
        googleSignUpError: "Error al registrarse con Google. Por favor, intenta de nuevo."
      },
      termsPage: {
        title: "Términos de Servicio",
        intro: "Bienvenido a StatementAI. Al utilizar nuestros servicios, aceptas estos términos. Por favor, léelos cuidadosamente.",
        definitions: {
          title: "Definiciones",
          service: "'Servicio': la plataforma StatementAI y cualquiera de sus características, aplicaciones y sitios web asociados.",
          user: "'Usuario': cualquier persona natural o jurídica que acceda o utilice el Servicio.",
          userContent: "'Contenido del Usuario': cualquier texto, imagen, video u otro material que el Usuario cargue, publique o transmita a través del Servicio."
        },
        acceptance: {
          title: "Aceptación de los Términos",
          text: "Al registrarte o utilizar el Servicio, aceptas estos Términos y nuestra Política de Privacidad. Si no estás de acuerdo, no uses el Servicio."
        },
        useOfService: {
          title: "Uso del Servicio",
          license: "Licencia: te concedemos una licencia limitada, no exclusiva y no transferible para usar el Servicio de acuerdo con estos Términos.",
          prohibitedConduct: "Conducta prohibida:",
          prohibitedConductList: [
            "No interfieras con el funcionamiento del Servicio o eludas sus mecanismos de seguridad.",
            "No envíes spam, contenido ilegal, difamatorio o que infrinja los derechos de terceros.",
            "No uses robots, scrapers o herramientas automatizadas sin autorización previa."
          ]
        },
        privacy: {
          title: "Privacidad y Protección de Datos",
          text: "Para más información, consulta nuestra [Política de Privacidad]."
        },
        ip: {
          title: "Propiedad Intelectual",
          platformContent: "Contenido de la Plataforma: todos los derechos de autor, marcas registradas y diseños del Servicio pertenecen a StatementAI o a sus licenciantes.",
          userContent: "Contenido del Usuario: conservas la propiedad, pero nos otorgas una licencia mundial, libre de regalías para usar, reproducir y mostrar tu Contenido de Usuario en relación con el Servicio."
        },
        disclaimer: {
          title: "Responsabilidades y Garantías",
          text: "Exención de garantías: el Servicio se proporciona 'tal cual' y 'según disponibilidad', sin garantías de ningún tipo (expresas o implícitas).",
          limitation: "Limitación de responsabilidad: en ningún caso StatementAI será responsable por daños indirectos, pérdida de beneficios o pérdida de datos, incluso si se nos informó de la posibilidad de tales daños."
        },
        duration: {
          title: "Duración y Terminación",
          term: "Plazo: estos Términos estarán en vigor mientras utilices el Servicio.",
          terminationByUser: "Cancelación del usuario: puedes cancelar tu suscripción en cualquier momento desde tu cuenta, eliminando la mayoría de tus datos en un tiempo razonable.",
          terminationByBreach: "Terminación por incumplimiento: podemos suspender o terminar tu acceso si incumples estos Términos, con previo aviso."
        },
        modifications: {
          title: "Modificaciones a los Términos",
          text: "Podemos actualizar estos Términos para adaptarlos a cambios legales o mejoras en el Servicio. Te notificaremos al menos 15 días por adelantado por correo electrónico o aviso en la plataforma.",
          acceptance: "Si continúas usando el Servicio después de la fecha de entrada en vigor, entenderemos que aceptas los cambios."
        },
        law: {
          title: "Ley Aplicable y Jurisdicción",
          text: "Estos Términos se rigen por las leyes de la República del Perú. Para cualquier disputa, las partes se someten a la jurisdicción exclusiva de los tribunales de la ciudad de Lima."
        },
        contact: {
          title: "Contacto",
          text: "Si tienes preguntas o reclamaciones, escríbenos a:",
          email: "Email: soporte@fluentlabs.cloud"
        }
      },
      uploadPage: {
        title: "Subir Extracto Bancario",
        intro: "Sube tu extracto bancario en PDF para extraer datos de transacciones",
        pagesRemaining: "páginas restantes",
        processingMethod: "Método de Procesamiento",
        aiPowered: "Docling (Impulsado por IA) - Recomendado",
        textExtraction: "Tradicional (Extracción de Texto)",
        removeFile: "Quitar Archivo",
        dragAndDrop: "Arrastra y suelta tu extracto bancario aquí",
        orClickToSelect: "o haz clic para seleccionar un archivo",
        selectPDF: "Seleccionar Archivo PDF",
        processing: "Procesando documento...",
        analyzing: "Analizando estructura del documento...",
        extracting: "Extrayendo datos de transacciones...",
        processingAI: "Procesando con IA...",
        finalizing: "Finalizando resultados...",
        process: "Procesar Documento"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;