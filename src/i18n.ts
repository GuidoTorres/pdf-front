import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      dashboard: {
        welcomeBack: "Welcome back",
        user: "User",
        subtitle: "Process your bank statements with AI-powered precision",
        pagesRemaining: "Pages Remaining",
        documentsProcessed: "Documents Processed",
        documents: "Documents",
        transactions: "Transactions",
        currentDoc: "Current Document",
        plan: "Plan",
        currentPlan: "Current Plan",
        stats: {
          processing: "Processing",
          inQueue: "In queue",
          thisMonth: "This month",
          autoCategorized: "Auto-Categorized",
          classified: "classified",
          smartCategorization: "Smart categorization",
          freePlan: "Free",
        },
        export: {
          exportFormat: "Export format:",
          withCategories: "With Categories",
          basicFormat: "Basic Format",
          categoriesIncluded: "Categories Included",
          unknown: "Unknown",
          discardChanges: "Discard Changes",
          downloadAll: "Download All",
          downloadAs: "Download as",
          download: "Download",
          save: "Save",
          all: "All",
          qifCompatible: "Works with QuickBooks, Quicken, GnuCash",
          ofxCompatible:
            "Direct bank import format, Microsoft Money compatible",
          jsonCompatible:
            "Perfect for APIs, includes category summaries and metadata",
          xlsxCompatible:
            "Rich Excel format with category summaries and charts",
          // New Excel export functionality
          flexibleExcelExport: "Enhanced Excel Export",
          preserveOriginalStructure: "Preserves original document structure",
          excelExport: "Export to Excel",
          excelExportTooltip: "Export with original column structure preserved",
          excelExportStarted: "Excel export started...",
          excelExportSuccess:
            "Excel file downloaded successfully: {{filename}}",
          excelExportError: "Excel export failed: {{error}}",
          documentNotReady: "Document not ready for export",
        },
        processDocument: {
          title: "Process Document",
          pagesRemainingChip: "pages remaining",
          remove: "Remove",
          process: "Process",
          processing: "Processing...",
          dragAndDrop: "Click to select or drag & drop",
          pdfOnlyError: "Please select a PDF file.",
          someFilesIgnored:
            "Some files were ignored. Only PDF files are supported.",
          singleModeWarning:
            "Single mode: Only the first PDF was selected. Switch to batch mode for multiple files.",
          singleFile: "Single File",
          batchUpload: "Batch Upload",
          processingFiles: "Processing Files",
          current: "Current",
          starting: "Starting...",
          filesSelected: "files selected",
          clearAll: "Clear All",
          processMultiple: "Process",
          files: "Files",
          selectMultiplePDFs: "Select Multiple PDFs or Drag & Drop",
          uploadMultiple: "Upload multiple bank statements at once",
          uploadOne: "Upload one PDF file",
        },
        recentConversions: {
          title: "Recent Conversions",
          viewAll: "View All",
          filename: "Filename",
          status: "Status",
          date: "Date",
        },
        excelPreview: {
          title: "Excel Preview",
          download: "Download",
          tableAriaLabel: "Excel preview table",
          date: "Date",
          description: "Description",
          amount: "Amount",
          balance: "Balance",
          category: "Category",
          actions: "Actions",
          noPreview: "No preview available",
          selectCompleted: "Select a completed document to see the preview",
          filterByCategory: "Filter by category:",
          allCategories: "All Categories",
          transactionsCount: "of",
          transactionsLabel: "transactions",
          editPage: "Edit Page",
          finishAll: "Finish All",
          unsavedChanges: "You have unsaved changes",
          discard: "Discard",
          saveChanges: "Save Changes",
          transactionDescription: "Transaction description",
          lowConfidenceCategory: "Low confidence categorization",
          subcategory: "Subcategory",
          income: "Income",
          expense: "Expense",
        },
        jobs: {
          title: "Jobs",
          processing: "Processing",
          completed: "Completed",
          failed: "Failed",
          processedDocument: "Processed Document",
          noJobs: "No jobs yet",
          viewHistory: "View History",
          showingRecent: "Showing recent {{count}} jobs",
          status: {
            completed: "Completed",
            processing: "Processing",
            failed: "Failed",
            queued: "Queued",
          },
          history: {
            title: "Document History",
            subtitle: "{{total}} documents processed",
            search: "Search documents...",
            filterByStatus: "Filter by status",
            allStatuses: "All Statuses",
            noResultsFound: "No results found",
            transactionCount: "{{count}} transactions",
          },
        },
        originalData: {
          title: "Original Data Structure",
          subtitle: "{{columns}} columns, {{rows}} rows from original PDF",
          noData: "No Original Data",
          selectCompleted: "Select a completed document to view original data structure",
          noOriginalData: "Original Data Not Available", 
          originalDataNotAvailable: "This document doesn't have preserved original data structure",
          noTableData: "No Table Data Found",
          noTableDataDesc: "Could not reconstruct original table from available data",
          tableAriaLabel: "Original PDF data table",
          columnMappings: "Column Mappings",
        },
        dataViews: {
          processed: "Processed",
          original: "Original",
        },
      },
      layout: {
        nav: {
          home: "Home",
          features: "Features",
          howItWorks: "How it works",
          pricing: "Pricing",
          login: "Login",
        },
        sidebar: {
          dashboard: "Dashboard",
          history: "History",
          pricing: "Pricing",
          settings: "Settings",
        },
        profileMenu: {
          signedInAs: "Signed in as",
          settings: "Settings",
          helpAndFeedback: "Help & Feedback",
          logout: "Logout",
        },
        footer: {
          terms: "Terms of Service",
          privacy: "Privacy Policy",
          refund: "Refund Policy",
        },
      },
      common: {
        backToDashboard: "Back to Dashboard",
        backToHome: "Back to Home",
        dashboard: "Dashboard",
        home: "Home",
        termsOfService: "Terms of Service",
        privacyPolicy: "Privacy Policy",
        refundPolicy: "Refund Policy",
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
          a7: "Simply drag and drop your PDF file into the upload area on the dashboard, or click to select a file from your computer. Then, select a processing method and click 'Process'. Your processed document will appear in the 'Excel Preview' section.",
        },
        contact: "Contact Us",
      },
      historyPage: {
        title: "Document History",
        subtitle:
          "We only keep lightweight metadata so you know what was processed.",
        documentsCount: "documents",
        totalDocuments: "Total Documents",
        completed: "Completed",
        processing: "Processing",
        failed: "Failed",
        searchPlaceholder: "Search documents...",
        filterByStatus: "Filter by status",
        allStatuses: "All Statuses",
        noDocumentsFound: "No documents found",
        tryAdjustingFilters: "Try adjusting your search or filters",
        uploadFirstDocument: "Upload your first document to get started",
        reuploadHint: "Need the data again? Upload the file once more to generate a fresh spreadsheet.",
        columnDocument: "Document",
        columnStatus: "Status",
        columnUploaded: "Uploaded",
        columnPages: "Pages",
        columnTransactions: "Transactions",
        statusCompleted: "Completed",
        statusProcessing: "Processing",
        statusFailed: "Failed",
        privacyNotice:
          "For your security we only retain basic metadata (file name, status, upload date). Re-upload the original file whenever you need a new conversion.",
        sizeLabel: "{{size}} MB (original file)",
        sizeUnknown: "File size unavailable",
        pagesSingle: "1 page processed",
        pagesPlural: "{{count}} pages processed",
        transactionsSingle: "1 transaction",
        transactionsPlural: "{{count}} transactions",
        unknown: "Unknown",
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
        invalidCredentials:
          "Invalid credentials. Please check your email and password.",
        loginError: "Error logging in. Please try again.",
        googleLoginError: "Error logging in with Google. Please try again.",
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
          basic: [
            "10 conversions/month",
            "Email support",
            "Standard processing",
          ],
          pro: [
            "50 conversions/month",
            "Priority support",
            "Faster processing",
            "Data analytics",
          ],
          enterprise: [
            "Unlimited conversions",
            "24/7 support",
            "Fastest processing",
            "Advanced analytics",
            "API access",
          ],
        },
      },
      privacyPage: {
        title: "Privacy Policy",
        intro:
          "At StatementAI S.A.C., we take your privacy seriously. This policy outlines how we collect, use, and protect your personal information.",
        lastUpdated: "Last updated: August 4, 2025",
        dataController: {
          title: "Data Controller",
          company: "Company: StatementAI S.A.C.",
          address: "Address: Av. Ejemplo 123, Miraflores, Lima, Peru",
          contact: "Contact email: soporte@fluentlabs.cloud",
        },
        infoCollection: {
          title: "Information We Collect",
          registrationData: {
            subtitle: "Registration Data",
            items: [
              "Full name",
              "Email address",
              "Password (stored encrypted)",
            ],
          },
          technicalData: {
            subtitle: "Technical and Usage Data",
            items: [
              "IP address",
              "Device type and operating system",
              "Pages visited, date and time of access",
              "Cookies and similar technologies",
            ],
          },
          optionalData: {
            subtitle: "Optional Data",
            items: [
              "Location information (if authorized)",
              "Data shared in feedback forms, surveys, or support chat",
            ],
          },
        },
        purposes: {
          title: "Purposes and Legal Bases",
          tableHeaders: {
            purpose: "Purpose",
            data: "Data",
            legalBasis: "Legal Basis",
          },
          items: [
            {
              purpose: "Service provision",
              data: "Registration, Technical",
              legalBasis: "Contract execution",
            },
            {
              purpose: "Improvement and development of new features",
              data: "Usage, Cookies",
              legalBasis: "Legitimate interest",
            },
            {
              purpose: "Commercial communications and offers",
              data: "Registration",
              legalBasis: "User consent",
            },
            {
              purpose: "Customer service and support",
              data: "Registration, Usage",
              legalBasis: "Contract execution / Consent",
            },
          ],
        },
        dataRetention: {
          title: "Data Retention",
          items: [
            "Registration and profile data: while you maintain your account active and up to 2 years after deletion.",
            "Technical and usage data: up to 1 year for security and statistical analysis purposes.",
            "Commercial data (marketing): until you withdraw your consent.",
          ],
        },
        recipients: {
          title: "Recipients and International Transfers",
          text: "We share data with hosting and analytics providers (e.g., AWS servers – USA – with approved standard contractual clauses). We may use other third-party tools (Google Analytics, social networks) whose terms and policies apply additionally.",
        },
        cookies: {
          title: "Use of Cookies",
          items: [
            "Strictly necessary cookies: enable basic functionality (login, security).",
            "Performance and analytics cookies: collect anonymous information about usage to improve the platform.",
            "Advertising cookies: use browsing data to show relevant ads (you can disable them in your browser settings).",
          ],
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
            "Limit processing in specific cases.",
          ],
          exercise:
            "To exercise them, send your request to soporte@fluentlabs.cloud with the subject 'Data Protection' and indicate which right you want to exercise. We will respond within a maximum of 30 days.",
        },
        security: {
          title: "Information Security",
          text: "We implement appropriate technical and organizational measures (SSL/TLS encryption, access controls, backup copies) to protect your data against unauthorized access, alteration, or loss.",
        },
        minors: {
          title: "Minors",
          text: "Our services are intended for individuals over 16 years old. If you are a minor, do not send personal data without consent from your parents or guardians. We reserve the right to cancel accounts of detected minors.",
        },
        changes: {
          title: "Policy Changes",
          text: "We may update this Policy to adapt to regulatory or technical changes. We will publish the updated version with the 'Last updated' date at the top, and if changes are significant, we will notify you by email at least 15 days in advance.",
        },
        contact: {
          title: "Contact",
          intro: "For any questions, complaints, or suggestions:",
          email: "Email: soporte@fluentlabs.cloud",
          address: "Address: Av. Ejemplo 123, Miraflores, Lima, Peru",
        },
      },
      refundPage: {
        title: "Refund Policy",
        intro:
          "We want you to be satisfied with your purchase. If you're not, we're here to help.",
        eligibility: "Eligibility for Refunds",
        eligibilityText:
          "Refunds are available for purchases made within the last 30 days, provided the service has not been used extensively.",
        howToRequest: "How to Request a Refund",
        howToRequestText:
          "To request a refund, please contact our support team with your order details and the reason for the refund.",
        processingTime: "Processing Time",
        processingTimeText:
          "Refunds are typically processed within 5-10 business days after approval.",
      },
      settingsPage: {
        title: "Settings",
        subtitle: "Review your account details and security information",
        profile: {
          title: "Profile",
          subtitle: "Your information at a glance",
          profilePictureManaged:
            "Profile picture is managed by your authentication provider",
          googleManaged: "Your personal information is kept in sync with Google.",
          googleManagedHint:
            "To update your name or profile picture, make the changes from your Google account.",
          manualUpdateHint:
            "If you need to update your information, contact our support team.",
          name: "Name",
          email: "Email",
        },
        security: {
          title: "Security",
          googleDescription: "Your authentication is handled by Google.",
          passwordDescription:
            "You can request a password reset from the login screen.",
          googleTitle: "Account connected with Google",
          googleHint:
            "Any password changes or verification must be done from accounts.google.com.",
          passwordSupportTitle: "Need to reset your password?",
          passwordSupportHint:
            "Log in and use the 'Forgot password?' option to receive a reset link.",
          manageGoogle: "Open Google security settings",
          goToLogin: "Go to login",
        },
        account: {
          title: "Subscription overview",
          plan: "Current plan",
          freePlan: "Free",
          pagesRemaining: "Pages remaining",
          unlimited: "Unlimited",
          renewedAt: "Last renewal",
          nextReset: "Next reset",
          helpText:
            "Need to change plans or have billing questions? Contact us and we'll be happy to help.",
          contactSupport: "Contact support",
        },
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
        googleSignUpError: "Error signing up with Google. Please try again.",
      },
      termsPage: {
        title: "Terms of Service",
        intro:
          "Welcome to StatementAI. By using our services, you agree to these terms. Please read them carefully.",
        definitions: {
          title: "Definitions",
          service:
            "'Service': the StatementAI platform and any of its features, applications, and associated websites.",
          user: "'User': any natural or legal person who accesses or uses the Service.",
          userContent:
            "'User Content': any text, image, video, or other material that the User uploads, publishes, or transmits through the Service.",
        },
        acceptance: {
          title: "Acceptance of Terms",
          text: "By registering or using the Service, you accept these Terms and our Privacy Policy. If you do not agree, do not use the Service.",
        },
        useOfService: {
          title: "Use of the Service",
          license:
            "License: we grant you a limited, non-exclusive, and non-transferable license to use the Service in accordance with these Terms.",
          prohibitedConduct: "Prohibited conduct:",
          prohibitedConductList: [
            "Do not interfere with the operation of the Service or circumvent its security mechanisms.",
            "Do not send spam, illegal, defamatory content, or content that infringes the rights of third parties.",
            "Do not use robots, scrapers, or automated tools without prior authorization.",
          ],
        },
        privacy: {
          title: "Privacy and Data Protection",
          text: "For more information, see our [Privacy Policy].",
        },
        ip: {
          title: "Intellectual Property",
          platformContent:
            "Platform Content: all copyrights, trademarks, and designs of the Service belong to StatementAI or its licensors.",
          userContent:
            "User Content: you retain ownership, but you grant us a worldwide, royalty-free license to use, reproduce, and display your User Content in connection with the Service.",
        },
        disclaimer: {
          title: "Responsibilities and Warranties",
          text: "Disclaimer of warranties: the Service is provided 'as is' and 'as available', without warranties of any kind (express or implied).",
          limitation:
            "Limitation of liability: in no event shall StatementAI be liable for indirect damages, loss of profits, or loss of data, even if we were informed of the possibility of such damages.",
        },
        duration: {
          title: "Duration and Termination",
          term: "Term: these Terms will be in effect as long as you use the Service.",
          terminationByUser:
            "Cancelation del usuario: puedes cancelar tu suscripción en cualquier momento desde tu cuenta, eliminando la mayoría de tus datos en un tiempo razonable.",
          terminationByBreach:
            "Terminación por incumplimiento: podemos suspender o terminar tu acceso si incumples estos Términos, con previo aviso.",
        },
        modifications: {
          title: "Modifications to the Terms",
          text: "Podemos actualizar estos Términos para adaptarlos a cambios legales o mejoras en el Servicio. Te notificaremos al menos 15 días por adelantado por correo electrónico o aviso en la plataforma.",
          acceptance:
            "Si continúas usando el Servicio después de la fecha de entrada en vigor, entenderemos que aceptas los cambios.",
        },
        law: {
          title: "Ley Aplicable y Jurisdicción",
          text: "Estos Términos se rigen por las leyes de la República del Perú. Para cualquier disputa, las partes se someten a la jurisdicción exclusiva de los tribunales de la ciudad de Lima.",
        },
        contact: {
          title: "Contacto",
          text: "Si tienes preguntas o reclamaciones, escríbenos a:",
          email: "Email: soporte@fluentlabs.cloud",
        },
      },
      uploadPage: {
        title: "Upload Bank Statement",
        intro: "Upload your bank statement in PDF to extract transaction data",
        pagesRemaining: "pages remaining",
        removeFile: "Remove File",
        dragAndDrop: "Drag and drop your bank statement here",
        orClickToSelect: "or click to select a file",
        selectPDF: "Select PDF File",
        processing: "Processing document...",
        analyzing: "Analyzing document structure...",
        extracting: "Extracting transaction data...",
        processingAI: "Processing with AI...",
        finalizing: "Finalizing results...",
        process: "Process Document",
      },
      landingPage: {
        hero: {
          badge: "AI-Powered Document Processing",
          title: "Transform Bank Statements into",
          titleHighlight: "Excel Magic",
          subtitle:
            "Upload your PDF bank statements and get organized Excel reports in seconds. No more manual data entry. No more errors. Just pure efficiency.",
          features: {
            lightningFast: "Lightning Fast",
            secureProcessing: "Secure Processing",
            instantDownload: "Instant Download",
          },
          ctaButton: "Start Processing Now",
          socialProof: {
            users: "1,000+ users",
            documents: "50,000+ documents processed",
            rating: "4.9/5 rating",
          },
          mockup: {
            dropText: "Drop your PDF here",
            completed: "Completed",
            processing: "Processing",
          },
        },
        features: {
          badge: "Features",
          title: "Everything You Need to Process Bank Statements",
          subtitle:
            "Our AI-powered platform handles the complexity so you can focus on what matters most - analyzing your financial data.",
          list: [
            {
              title: "Lightning Fast Processing",
              description:
                "Upload your PDF and get results in under 30 seconds. Our AI processes documents 10x faster than manual entry.",
              stats: "< 30 seconds",
            },
            {
              title: "Advanced AI Recognition",
              description:
                "State-of-the-art machine learning models trained on millions of bank statements for 99.9% accuracy.",
              stats: "99.9% accuracy",
            },
            {
              title: "Secure Processing",
              description:
                "Your documents are processed securely and automatically deleted after conversion. We prioritize your privacy.",
              stats: "Auto-delete",
            },
            {
              title: "Multiple Export Formats",
              description:
                "Download as Excel, CSV, JSON, or QIF. Compatible with QuickBooks, Xero, and all major accounting software.",
              stats: "4+ formats",
            },
            {
              title: "Multi-Bank Support",
              description:
                "Works with statements from 500+ banks worldwide. Automatically detects bank format and currency.",
              stats: "500+ banks",
            },
            {
              title: "Batch Processing",
              description:
                "Upload multiple statements at once. Process entire years of data in minutes, not hours.",
              stats: "Unlimited files",
            },
          ],
          cta: {
            title: "Ready to Transform Your Workflow?",
            subtitle:
              "Join thousands of businesses who have already streamlined their financial data processing with StamentAI.",
            benefits: [
              "Free 10 documents",
              "No credit card required",
              "Setup in 30 seconds",
            ],
          },
        },
        howItWorks: {
          title: "How StatementAI Works",
          subtitle:
            "Transform your bank statements into organized data in just 4 simple steps.",
          steps: [
            {
              title: "Upload PDF",
              description:
                "Simply upload your bank statement in PDF format to our secure platform.",
            },
            {
              title: "AI Processing",
              description:
                "Our AI analyzes and extracts relevant financial data from your statement.",
            },
            {
              title: "Review & Refine",
              description:
                "Verify the extracted data and make any necessary adjustments.",
            },
            {
              title: "Download Excel",
              description:
                "Export your processed financial data in a well-organized Excel format.",
            },
          ],
        },
        pricing: {
          badge: "Pricing Plans",
          title: "Simple, Transparent Pricing",
          subtitle:
            "Choose the perfect plan for your needs. All plans include our core AI processing features.",
          plans: [
            {
              name: "Free",
              description: "Perfect for trying out StatementAI",
              features: [
                "10 documents/month",
                "AI extraction",
                "Excel & CSV export",
                "Email support",
                "Standard processing speed",
              ],
            },
            {
              name: "Starter",
              description: "Perfect for individuals and small businesses",
              features: [
                "50 documents/month",
                "AI extraction",
                "Excel & CSV export",
                "Email support",
                "Standard processing speed",
              ],
            },
            {
              name: "Professional",
              description: "Ideal for growing businesses and accountants",
              features: [
                "200 documents/month",
                "AI extraction",
                "All export formats",
                "Priority support",
                "API access",
                "Batch processing",
                "Custom categories",
              ],
            },
          ],
          mostPopular: "Most Popular",
          getStarted: "Get Started",
          perMonth: "/month",
          save: "Save",
          additionalInfo: "No setup fees • Cancel anytime",
        },
        footer: {
          tagline: "Transforming bank statements into actionable insights",
          privacyPolicy: "Privacy Policy",
          termsOfService: "Terms of Service",
          contactUs: "Contact Us",
          copyright: "All rights reserved.",
        },
      },
    },
  },
  es: {
    translation: {
      dashboard: {
        welcomeBack: "Bienvenido de nuevo",
        user: "Usuario",
        subtitle:
          "Procesa tus estados de cuenta bancarios con precisión impulsada por IA",
        pagesRemaining: "Páginas Restantes",
        documentsProcessed: "Documentos Procesados",
        documents: "Documentos",
        transactions: "Transacciones",
        currentDoc: "Documento Actual",
        plan: "Plan",
        currentPlan: "Plan Actual",
        stats: {
          processing: "Procesando",
          inQueue: "En cola",
          thisMonth: "Este mes",
          autoCategorized: "Auto-Categorizadas",
          classified: "clasificadas",
          smartCategorization: "Categorización inteligente",
          freePlan: "Gratuito",
        },
        export: {
          exportFormat: "Formato de exportación:",
          withCategories: "Con Categorías",
          basicFormat: "Formato Básico",
          categoriesIncluded: "Categorías Incluidas",
          unknown: "Desconocido",
          discardChanges: "Descartar Cambios",
          downloadAll: "Descargar Todo",
          downloadAs: "Descargar como",
          download: "Descargar",
          save: "Guardar",
          all: "Todos",
          qifCompatible: "Funciona con QuickBooks, Quicken, GnuCash",
          ofxCompatible:
            "Formato de importación bancaria directa, compatible con Microsoft Money",
          jsonCompatible:
            "Perfecto para APIs, incluye resúmenes de categorías y metadatos",
          xlsxCompatible:
            "Formato Excel rico con resúmenes de categorías y gráficos",
        },
        processDocument: {
          title: "Procesar Documento",
          pagesRemainingChip: "páginas restantes",
          remove: "Eliminar",
          process: "Procesar",
          processing: "Procesando...",
          dragAndDrop: "Haz clic para seleccionar o arrastrar y soltar",
          pdfOnlyError: "Por favor, selecciona un archivo PDF.",
          someFilesIgnored:
            "Algunos archivos fueron ignorados. Solo se admiten archivos PDF.",
          singleModeWarning:
            "Modo único: Solo se seleccionó el primer PDF. Cambia al modo lote para múltiples archivos.",
          singleFile: "Archivo Único",
          batchUpload: "Subida por Lotes",
          processingFiles: "Procesando Archivos",
          current: "Actual",
          starting: "Iniciando...",
          filesSelected: "archivos seleccionados",
          clearAll: "Limpiar Todo",
          processMultiple: "Procesar",
          files: "Archivos",
          selectMultiplePDFs: "Selecciona Múltiples PDFs o Arrastra y Suelta",
          uploadMultiple: "Sube múltiples estados de cuenta a la vez",
          uploadOne: "Sube un archivo PDF",
        },
        recentConversions: {
          title: "Conversiones Recientes",
          viewAll: "Ver Todas",
          filename: "Nombre de Archivo",
          status: "Estado",
          date: "Fecha",
        },
        excelPreview: {
          title: "Vista Previa de Excel",
          download: "Descargar",
          tableAriaLabel: "Tabla de vista previa de Excel",
          date: "Fecha",
          description: "Descripción",
          amount: "Monto",
          balance: "Saldo",
          category: "Categoría",
          actions: "Acciones",
          noPreview: "No hay vista previa disponible",
          selectCompleted:
            "Selecciona un documento completado para ver la vista previa",
          filterByCategory: "Filtrar por categoría:",
          allCategories: "Todas las Categorías",
          transactionsCount: "de",
          transactionsLabel: "transacciones",
          editPage: "Editar Página",
          finishAll: "Terminar Todo",
          unsavedChanges: "Tienes cambios sin guardar",
          discard: "Descartar",
          saveChanges: "Guardar Cambios",
          transactionDescription: "Descripción de la transacción",
          lowConfidenceCategory: "Categorización de baja confianza",
          subcategory: "Subcategoría",
          income: "Ingreso",
          expense: "Gasto",
        },
        jobs: {
          title: "Trabajos",
          processing: "Procesando",
          completed: "Completado",
          failed: "Fallido",
          processedDocument: "Documento Procesado",
          noJobs: "Aún no hay trabajos",
          viewHistory: "Ver Historial",
          showingRecent: "Mostrando los últimos {{count}} trabajos",
          status: {
            completed: "Completado",
            processing: "Procesando",
            failed: "Fallido",
            queued: "En Cola",
          },
          history: {
            title: "Historial de Documentos",
            subtitle: "{{total}} documentos procesados",
            search: "Buscar documentos...",
            filterByStatus: "Filtrar por estado",
            allStatuses: "Todos los Estados",
            noResultsFound: "No se encontraron resultados",
            transactionCount: "{{count}} transacciones",
          },
        },
        originalData: {
          title: "Estructura de Datos Original",
          subtitle: "{{columns}} columnas, {{rows}} filas del PDF original",
          noData: "Sin Datos Originales",
          selectCompleted: "Selecciona un documento completado para ver la estructura de datos original",
          noOriginalData: "Datos Originales No Disponibles",
          originalDataNotAvailable: "Este documento no tiene preservada la estructura de datos original",
          noTableData: "No se Encontraron Datos de Tabla",
          noTableDataDesc: "No se pudo reconstruir la tabla original con los datos disponibles",
          tableAriaLabel: "Tabla de datos original del PDF",
          columnMappings: "Mapeo de Columnas",
        },
        dataViews: {
          processed: "Procesado",
          original: "Original",
        },
      },
      layout: {
        nav: {
          home: "Inicio",
          features: "Características",
          howItWorks: "Cómo funciona",
          pricing: "Precios",
          login: "Iniciar Sesión",
        },
        sidebar: {
          dashboard: "Tablero",
          history: "Historial",
          pricing: "Precios",
          settings: "Configuración",
        },
        profileMenu: {
          signedInAs: "Sesión iniciada como",
          settings: "Configuración",
          helpAndFeedback: "Ayuda y Comentarios",
          logout: "Cerrar Sesión",
        },
        footer: {
          terms: "Términos de Servicio",
          privacy: "Política de Privacidad",
          refund: "Política de Reembolso",
        },
      },
      common: {
        backToDashboard: "Volver al Tablero",
        backToHome: "Volver al Inicio",
        dashboard: "Tablero",
        home: "Inicio",
        termsOfService: "Términos de Servicio",
        privacyPolicy: "Política de Privacidad",
        refundPolicy: "Política de Reembolso",
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
          a7: "Simplemente arrastra y suelta tu archivo PDF en el área de carga en el tablero, o haz clic para seleccionar un archivo de tu computadora. Luego, selecciona un método de procesamiento y haz clic en 'Procesar'. Tu documento procesado aparecerá en la sección 'Vista Previa de Excel'.",
        },
        contact: "Contáctanos",
      },
      historyPage: {
        title: "Historial de Documentos",
        subtitle:
          "Solo conservamos metadatos básicos para que sepas qué se procesó.",
        documentsCount: "documentos",
        totalDocuments: "Documentos Totales",
        completed: "Completado",
        processing: "Procesando",
        failed: "Fallido",
        searchPlaceholder: "Buscar documentos...",
        filterByStatus: "Filtrar por estado",
        allStatuses: "Todos los Estados",
        noDocumentsFound: "No se encontraron documentos",
        tryAdjustingFilters: "Intenta ajustar tu búsqueda o filtros",
        uploadFirstDocument: "Sube tu primer documento para comenzar",
        reuploadHint:
          "¿Necesitas la información de nuevo? Sube el archivo otra vez para generar una nueva planilla.",
        columnDocument: "Documento",
        columnStatus: "Estado",
        columnUploaded: "Fecha de subida",
        columnPages: "Páginas",
        columnTransactions: "Transacciones",
        statusCompleted: "Completado",
        statusProcessing: "Procesando",
        statusFailed: "Fallido",
        privacyNotice:
          "Por seguridad solo guardamos metadatos ligeros (nombre, estado y fecha de subida). Vuelve a cargar el archivo cuando necesites una conversión nueva.",
        sizeLabel: "{{size}} MB (archivo original)",
        sizeUnknown: "Tamaño no disponible",
        pagesSingle: "1 página procesada",
        pagesPlural: "{{count}} páginas procesadas",
        transactionsSingle: "1 transacción",
        transactionsPlural: "{{count}} transacciones",
        unknown: "Desconocido",
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
        invalidCredentials:
          "Credenciales inválidas. Por favor, verifica tu correo electrónico y contraseña.",
        loginError: "Error al iniciar sesión. Por favor, intenta de nuevo.",
        googleLoginError:
          "Error al iniciar sesión con Google. Por favor, intenta de nuevo.",
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
          basic: [
            "10 conversiones/mes",
            "Soporte por correo electrónico",
            "Procesamiento estándar",
          ],
          pro: [
            "50 conversiones/mes",
            "Soporte prioritario",
            "Procesamiento más rápido",
            "Análisis de datos",
          ],
          enterprise: [
            "Conversiones ilimitadas",
            "Soporte 24/7",
            "Procesamiento más rápido",
            "Análisis avanzado",
            "Acceso a API",
          ],
        },
      },
      privacyPage: {
        title: "Política de Privacidad",
        lastUpdated: "Última actualización: 4 de agosto de 2025",
        intro:
          "En StatementAI, tu privacidad es importante para nosotros. Esta política explica qué información recopilamos y cómo la usamos.",
        infoCollection: {
          title: "Información que Recopilamos",
          text: "Para poder utilizar nuestros servicios, solo recopilamos la siguiente información:",
          items: [
            "Correo electrónico: para la creación y gestión de tu cuenta.",
            "Nombre de los archivos PDF: para identificar tus documentos procesados en tu historial.",
          ],
        },
        useOfInfo: {
          title: "Uso de la Información",
          text: "Utilizamos esta información exclusivamente para:",
          items: [
            "Proporcionarte acceso a nuestros servicios.",
            "Permitirte ver tu historial de conversiones.",
            "Contactarte sobre tu cuenta si es necesario.",
          ],
        },
        dataSecurity: {
          title: "Seguridad de los Datos",
          text: "No almacenamos los documentos que procesas. Los archivos se eliminan de nuestros servidores inmediatamente después de la conversión. La información de tu cuenta se almacena de forma segura y no se comparte con terceros.",
        },
        changes: {
          title: "Cambios en la Política",
          text: "Podemos actualizar esta política ocasionalmente. Te notificaremos sobre cualquier cambio importante.",
        },
        contact: {
          title: "Contacto",
          text: "Si tienes alguna pregunta sobre esta política de privacidad, puedes contactarnos en: soporte@fluentlabs.cloud",
        },
      },
      refundPage: {
        title: "Política de Reembolso",
        intro:
          "Queremos que estés satisfecho con tu compra. Si no lo estás, estamos aquí para ayudarte.",
        eligibility: "Elegibilidad para Reembolsos",
        eligibilityText:
          "Los reembolsos están disponibles para compras realizadas en los últimos 30 días, siempre que el servicio no haya sido utilizado extensivamente.",
        howToRequest: "Cómo Solicitar un Reembolso",
        howToRequestText:
          "Para solicitar un reembolso, por favor contacta a nuestro equipo de soporte con los detalles de tu pedido y la razón del reembolso.",
        processingTime: "Tiempo de Procesamiento",
        processingTimeText:
          "Los reembolsos generalmente se procesan dentro de 5-10 días hábiles después de la aprobación.",
      },
      settingsPage: {
        title: "Configuración",
        subtitle: "Revisa los datos de tu cuenta y la información de seguridad",
        profile: {
          title: "Perfil",
          subtitle: "Tu información de un vistazo",
          profilePictureManaged:
            "La imagen de perfil se administra desde tu proveedor de autenticación",
          googleManaged: "Tu información personal se sincroniza automáticamente con Google.",
          googleManagedHint:
            "Para actualizar tu nombre o foto, realiza los cambios desde tu cuenta de Google.",
          manualUpdateHint:
            "Si necesitas actualizar tus datos, ponte en contacto con nuestro equipo de soporte.",
          name: "Nombre",
          email: "Correo electrónico",
        },
        security: {
          title: "Seguridad",
          googleDescription: "Tu autenticación se gestiona desde Google.",
          passwordDescription:
            "Puedes solicitar un cambio de contraseña desde la pantalla de inicio de sesión.",
          googleTitle: "Cuenta conectada con Google",
          googleHint:
            "Cualquier cambio de contraseña o verificación debe realizarse en accounts.google.com.",
          passwordSupportTitle: "¿Necesitas restablecer tu contraseña?",
          passwordSupportHint:
            "Inicia sesión y utiliza la opción '¿Olvidaste tu contraseña?' para recibir un enlace de restablecimiento.",
          manageGoogle: "Abrir configuración de Google",
          goToLogin: "Ir a inicio de sesión",
        },
        account: {
          title: "Resumen de suscripción",
          plan: "Plan actual",
          freePlan: "Gratuito",
          pagesRemaining: "Páginas restantes",
          unlimited: "Ilimitado",
          renewedAt: "Última renovación",
          nextReset: "Próximo reinicio",
          helpText:
            "¿Necesitas cambiar de plan o tienes dudas de facturación? Escríbenos y con gusto te ayudamos.",
          contactSupport: "Contactar soporte",
        },
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
        googleSignUpError:
          "Error al registrarse con Google. Por favor, intenta de nuevo.",
      },
      termsPage: {
        title: "Términos de Servicio",
        intro:
          "Bienvenido a StatementAI. Al utilizar nuestros servicios, aceptas estos términos. Por favor, léelos cuidadosamente.",
        definitions: {
          title: "Definiciones",
          service:
            "'Servicio': la plataforma StatementAI y cualquiera de sus características, aplicaciones y sitios web asociados.",
          user: "'Usuario': cualquier persona natural o jurídica que acceda o utilice el Servicio.",
          userContent:
            "'Contenido del Usuario': cualquier texto, imagen, video u otro material que el Usuario cargue, publique o transmita a través del Servicio.",
        },
        acceptance: {
          title: "Aceptación de los Términos",
          text: "Al registrarte o utilizar el Servicio, aceptas estos Términos y nuestra Política de Privacidad. Si no estás de acuerdo, no uses el Servicio.",
        },
        useOfService: {
          title: "Uso del Servicio",
          license:
            "Licencia: te concedemos una licencia limitada, no exclusiva y no transferible para usar el Servicio de acuerdo con estos Términos.",
          prohibitedConduct: "Conducta prohibida:",
          prohibitedConductList: [
            "No interfieras con el funcionamiento del Servicio o eludas sus mecanismos de seguridad.",
            "No envíes spam, contenido ilegal, difamatorio o que infrinja los derechos de terceros.",
            "No uses robots, scrapers o herramientas automatizadas sin autorización previa.",
          ],
        },
        privacy: {
          title: "Privacidad y Protección de Datos",
          text: "Para más información, consulta nuestra [Política de Privacidad].",
        },
        ip: {
          title: "Propiedad Intelectual",
          platformContent:
            "Contenido de la Plataforma: todos los derechos de autor, marcas registradas y diseños del Servicio pertenecen a StatementAI o a sus licenciantes.",
          userContent:
            "Contenido del Usuario: conservas la propiedad, pero nos otorgas una licencia mundial, libre de regalías para usar, reproducir y mostrar tu Contenido de Usuario en relación con el Servicio.",
        },
        disclaimer: {
          title: "Responsabilidades y Garantías",
          text: "Exención de garantías: el Servicio se proporciona 'tal cual' y 'según disponibilidad', sin garantías de ningún tipo (expresas o implícitas).",
          limitation:
            "Limitación de responsabilidad: en ningún caso StatementAI será responsable por daños indirectos, pérdida de beneficios o pérdida de datos, incluso si se nos informó de la posibilidad de tales daños.",
        },
        duration: {
          title: "Duración y Terminación",
          term: "Plazo: estos Términos estarán en vigor mientras utilices el Servicio.",
          terminationByUser:
            "Cancelación del usuario: puedes cancelar tu suscripción en cualquier momento desde tu cuenta, eliminando la mayoría de tus datos en un tiempo razonable.",
          terminationByBreach:
            "Terminación por incumplimiento: podemos suspender o terminar tu acceso si incumples estos Términos, con previo aviso.",
        },
        modifications: {
          title: "Modificaciones a los Términos",
          text: "Podemos actualizar estos Términos para adaptarlos a cambios legales o mejoras en el Servicio. Te notificaremos al menos 15 días por adelantado por correo electrónico o aviso en la plataforma.",
          acceptance:
            "Si continúas usando el Servicio después de la fecha de entrada en vigor, entenderemos que aceptas los cambios.",
        },
        law: {
          title: "Ley Aplicable y Jurisdicción",
          text: "Estos Términos se rigen por las leyes de la República del Perú. Para cualquier disputa, las partes se someten a la jurisdicción exclusiva de los tribunales de la ciudad de Lima.",
        },
        contact: {
          title: "Contacto",
          text: "Si tienes preguntas o reclamaciones, escríbenos a:",
          email: "Email: soporte@fluentlabs.cloud",
        },
      },
      uploadPage: {
        title: "Subir Extracto Bancario",
        intro:
          "Sube tu extracto bancario en PDF para extraer datos de transacciones",
        pagesRemaining: "páginas restantes",
        removeFile: "Quitar Archivo",
        dragAndDrop: "Arrastra y suelta tu extracto bancario aquí",
        orClickToSelect: "o haz clic para seleccionar un archivo",
        selectPDF: "Seleccionar Archivo PDF",
        processing: "Procesando documento...",
        analyzing: "Analizando estructura del documento...",
        extracting: "Extrayendo datos de transacciones...",
        processingAI: "Procesando con IA...",
        finalizing: "Finalizando resultados...",
        process: "Procesar Documento",
      },
      landingPage: {
        hero: {
          badge: "Procesamiento de Documentos con IA",
          title: "Transforma Estados de Cuenta en",
          titleHighlight: "Magia de Excel",
          subtitle:
            "Sube tus estados de cuenta en PDF y obtén reportes organizados de Excel en segundos. Sin más entrada manual de datos. Sin más errores. Solo pura eficiencia.",
          features: {
            lightningFast: "Súper Rápido",
            secureProcessing: "Procesamiento Seguro",
            instantDownload: "Descarga Instantánea",
          },
          ctaButton: "Empezar a Procesar Ahora",
          socialProof: {
            users: "1,000+ usuarios",
            documents: "50,000+ documentos procesados",
            rating: "4.9/5 calificación",
          },
          mockup: {
            dropText: "Suelta tu PDF aquí",
            completed: "Completado",
            processing: "Procesando",
          },
        },
        features: {
          badge: "Características",
          title: "Todo lo que Necesitas para Procesar Estados de Cuenta",
          subtitle:
            "Nuestra plataforma impulsada por IA maneja la complejidad para que puedas enfocarte en lo que más importa: analizar tus datos financieros.",
          list: [
            {
              title: "Procesamiento Súper Rápido",
              description:
                "Sube tu PDF y obtén resultados en menos de 30 segundos. Nuestra IA procesa documentos 10 veces más rápido que la entrada manual.",
              stats: "< 30 segundos",
            },
            {
              title: "Reconocimiento de IA Avanzado",
              description:
                "Modelos de aprendizaje automático de vanguardia entrenados en millones de estados de cuenta bancarios con 99.9% de precisión.",
              stats: "99.9% precisión",
            },
            {
              title: "Procesamiento Seguro",
              description:
                "Tus documentos se procesan de forma segura y se eliminan automáticamente después de la conversión. Priorizamos tu privacidad.",
              stats: "Auto-eliminación",
            },
            {
              title: "Múltiples Formatos de Exportación",
              description:
                "Descarga como Excel, CSV, JSON o QIF. Compatible con QuickBooks, Xero y todos los principales software de contabilidad.",
              stats: "4+ formatos",
            },
            {
              title: "Soporte Multi-Banco",
              description:
                "Funciona con estados de cuenta de más de 500 bancos en todo el mundo. Detecta automáticamente el formato del banco y la moneda.",
              stats: "500+ bancos",
            },
            {
              title: "Procesamiento por Lotes",
              description:
                "Sube múltiples estados de cuenta a la vez. Procesa años completos de datos en minutos, no en horas.",
              stats: "Archivos ilimitados",
            },
          ],
          cta: {
            title: "¿Listo para Transformar tu Flujo de Trabajo?",
            subtitle:
              "Únete a miles de empresas que ya han optimizado su procesamiento de datos financieros con StatementAI.",
            benefits: [
              "10 documentos gratis",
              "Sin tarjeta de crédito requerida",
              "Configuración en 30 segundos",
            ],
          },
        },
        howItWorks: {
          title: "Cómo Funciona StatementAI",
          subtitle:
            "Transforma tus estados de cuenta en datos organizados en solo 4 simples pasos.",
          steps: [
            {
              title: "Subir PDF",
              description:
                "Simplemente sube tu estado de cuenta en formato PDF a nuestra plataforma segura.",
            },
            {
              title: "Procesamiento con IA",
              description:
                "Nuestra IA analiza y extrae datos financieros relevantes de tu estado de cuenta.",
            },
            {
              title: "Revisar y Refinar",
              description:
                "Verifica los datos extraídos y realiza cualquier ajuste necesario.",
            },
            {
              title: "Descargar Excel",
              description:
                "Exporta tus datos financieros procesados en un formato Excel bien organizado.",
            },
          ],
        },
        pricing: {
          badge: "Planes de Precios",
          title: "Precios Simples y Transparentes",
          subtitle:
            "Elige el plan perfecto para tus necesidades. Todos los planes incluyen nuestras funcionalidades principales de procesamiento con IA.",
          plans: [
            {
              name: "Gratuito",
              description: "Perfecto para probar StatementAI",
              features: [
                "10 documentos/mes",
                "Extracción con IA",
                "Exportación Excel y CSV",
                "Soporte por email",
                "Velocidad de procesamiento estándar",
              ],
            },
            {
              name: "Inicial",
              description: "Perfecto para individuos y pequeñas empresas",
              features: [
                "50 documentos/mes",
                "Extracción con IA",
                "Exportación Excel y CSV",
                "Soporte por email",
                "Velocidad de procesamiento estándar",
              ],
            },
            {
              name: "Profesional",
              description: "Ideal para empresas en crecimiento y contadores",
              features: [
                "200 documentos/mes",
                "Extracción con IA",
                "Todos los formatos de exportación",
                "Soporte prioritario",
                "Acceso a API",
                "Procesamiento por lotes",
                "Categorías personalizadas",
              ],
            },
          ],
          mostPopular: "Más Popular",
          getStarted: "Comenzar",
          perMonth: "/mes",
          save: "Ahorro",
          additionalInfo:
            "Sin tarifas de configuración • Cancela en cualquier momento",
        },
        footer: {
          tagline: "Transformando estados de cuenta en información útil",
          privacyPolicy: "Política de Privacidad",
          termsOfService: "Términos de Servicio",
          contactUs: "Contáctanos",
          copyright: "Todos los derechos reservados.",
        },
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
