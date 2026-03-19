import { Metadata } from "next";
import {
  formatLocalizedDate,
  getServerI18n,
  getTierOneLocale,
} from "@/lib/i18n/server";

const privacyCopy = {
  "en-US": {
    titles: [
      "1. Introduction",
      "2. Information We Collect",
      "3. How We Use Your Information",
      "4. Information Sharing",
      "5. Data Security",
      "6. Your Rights",
      "7. Data Retention",
      "8. International Transfers",
      "9. Adults-Only Service",
      "10. Changes to This Policy",
      "11. Contact Us",
    ],
    subtitles: [
      "Account Information",
      "Gaming Data",
      "Technical Information",
      "Payment Information",
    ],
    intro: [
      'LeetGaming.PRO ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our competitive gaming platform and related services.',
      "By using LeetGaming.PRO, you agree to the collection and use of information in accordance with this policy.",
      "LeetGaming.PRO is intended only for users who are 18 years of age or older. Some jurisdictions or regulated features may impose a higher age requirement, including 21+ eligibility for certain money-flow or prize-related activities.",
    ],
    accountIntro: "When you create an account, we collect:",
    accountItems: [
      "Email address",
      "Username and display name",
      "Password (stored securely using industry-standard hashing)",
      "Profile information (avatar, bio, region)",
      "Linked gaming accounts (Steam ID, Discord ID, etc.)",
      "Date of birth and age-verification records when needed to confirm eligibility",
      "Identity, residency, or compliance data submitted for KYC, AML, payout, fraud, or legal review",
    ],
    gamingIntro: "To provide our services, we collect:",
    gamingItems: [
      "Match history and statistics",
      "Replay files and gameplay data",
      "Skill ratings and rankings",
      "Tournament participation and results",
      "In-game performance metrics",
    ],
    technicalIntro: "We automatically collect:",
    technicalItems: [
      "IP address and approximate location",
      "Browser type and version",
      "Device information and operating system",
      "Usage patterns and feature interactions",
      "Error logs and performance data",
    ],
    paymentIntro:
      "For premium features and transactions, we collect payment information through our secure payment processors. We may also receive transaction, billing, refund, payout, and risk-screening data from payment, identity, and compliance providers. We do not store complete credit card numbers on our servers.",
    useIntro: "We use your information to:",
    useItems: [
      "Provide and maintain our gaming platform",
      "Process matchmaking and skill-based rankings",
      "Analyze gameplay for anti-cheat and fair play enforcement",
      "Generate statistics, leaderboards, and player analytics",
      "Process payments and manage subscriptions",
      "Verify age, identity, residency, and legal eligibility",
      "Send important service updates and notifications",
      "Provide customer support",
      "Improve our services through analytics",
      "Detect and prevent fraud, abuse, and security issues",
      "Review deposits, withdrawals, prize claims, and other money-flow activity for AML, sanctions, and compliance purposes",
      "Comply with legal obligations",
    ],
    sharingIntro:
      "We may share your information in the following circumstances:",
    sharingItems: [
      {
        label: "Public Profile:",
        text: "Your username, avatar, gaming statistics, and match history may be visible to other users as part of the competitive gaming experience.",
      },
      {
        label: "Team and Squad Members:",
        text: "Information relevant to team coordination may be shared with your teammates.",
      },
      {
        label: "Tournament Organizers:",
        text: "When you participate in tournaments, relevant information may be shared with organizers.",
      },
      {
        label: "Service Providers:",
        text: "We work with trusted third parties who help us operate our platform (hosting, analytics, payment processing).",
      },
      {
        label: "Verification and Compliance Providers:",
        text: "We may share information with identity, age-verification, fraud-prevention, sanctions-screening, and payment partners when needed to validate eligibility or process lawful money-flow transactions.",
      },
      {
        label: "Legal Requirements:",
        text: "We may disclose information when required by law or to protect our rights and users' safety.",
      },
    ],
    sharingNote: "We do not sell your personal information to third parties.",
    securityIntro:
      "We implement appropriate technical and organizational measures to protect your data, including:",
    securityItems: [
      "Encryption of data in transit (TLS/SSL) and at rest",
      "Secure password hashing algorithms",
      "Regular security audits and penetration testing",
      "Access controls and authentication requirements",
      "Monitoring for suspicious activities",
    ],
    rightsIntro:
      "Depending on your location, you may have the following rights:",
    rightsItems: [
      { label: "Access:", text: "Request a copy of your personal data" },
      {
        label: "Correction:",
        text: "Update or correct inaccurate information",
      },
      { label: "Deletion:", text: "Request deletion of your account and data" },
      { label: "Portability:", text: "Receive your data in a portable format" },
      { label: "Objection:", text: "Object to certain types of processing" },
      { label: "Restriction:", text: "Request limitation of processing" },
    ],
    rightsContact: "To exercise these rights, contact us at",
    retentionIntro:
      "We retain your data for as long as necessary to provide our services and fulfill the purposes described in this policy. Specifically:",
    retentionItems: [
      "Account data is retained while your account is active",
      "Gaming statistics may be retained for historical leaderboards",
      "Payment, payout, age-verification, and compliance records are retained as required by law or risk controls",
      "After account deletion, most data is removed within 30 days",
    ],
    internationalBody:
      "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.",
    adultsOnlyBody:
      "LeetGaming.PRO is not directed to anyone under 18 years of age, and we do not knowingly permit underage users to create or maintain accounts. If we learn that a person under 18 has provided personal information to us, we may suspend the account, restrict access, and delete or anonymize the data as required by law. If you believe an underage person has used the platform, please contact us immediately.",
    updatesBody:
      "We may update this Privacy Policy periodically. We will notify you of significant changes by posting a notice on our platform or sending you an email. Your continued use of our services after changes take effect constitutes acceptance of the updated policy.",
    contactIntro:
      "For questions or concerns about this Privacy Policy or our data practices, contact us:",
    dpoLabel: "Data Protection Officer:",
    emailLabel: "Email:",
  },
  "pt-BR": {
    titles: [
      "1. Introdução",
      "2. Informações que Coletamos",
      "3. Como Usamos suas Informações",
      "4. Compartilhamento de Informações",
      "5. Segurança de Dados",
      "6. Seus Direitos",
      "7. Retenção de Dados",
      "8. Transferências Internacionais",
      "9. Serviço Exclusivo para Adultos",
      "10. Alterações desta Política",
      "11. Fale Conosco",
    ],
    subtitles: [
      "Informações da Conta",
      "Dados de Jogo",
      "Informações Técnicas",
      "Informações de Pagamento",
    ],
    intro: [
      'A LeetGaming.PRO ("nós", "nosso" ou "nossos") está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você utiliza nossa plataforma competitiva de jogos e serviços relacionados.',
      "Ao usar a LeetGaming.PRO, você concorda com a coleta e o uso de informações de acordo com esta política.",
      "A LeetGaming.PRO é destinada apenas a usuários com 18 anos ou mais. Algumas jurisdições ou recursos regulados podem impor idade mínima maior, incluindo elegibilidade 21+ para determinadas atividades relacionadas a fluxo financeiro ou prêmios.",
    ],
    accountIntro: "Ao criar uma conta, coletamos:",
    accountItems: [
      "Endereço de e-mail",
      "Nome de usuário e nome de exibição",
      "Senha (armazenada com segurança usando hash em padrão de mercado)",
      "Informações de perfil (avatar, bio, região)",
      "Contas de jogos vinculadas (Steam ID, Discord ID etc.)",
      "Data de nascimento e registros de verificação de idade quando necessários para confirmar elegibilidade",
      "Dados de identidade, residência ou conformidade enviados para KYC, AML, pagamento, prevenção a fraude ou análise legal",
    ],
    gamingIntro: "Para fornecer nossos serviços, coletamos:",
    gamingItems: [
      "Histórico de partidas e estatísticas",
      "Arquivos de replay e dados de gameplay",
      "Ratings de habilidade e rankings",
      "Participação em torneios e resultados",
      "Métricas de desempenho dentro do jogo",
    ],
    technicalIntro: "Coletamos automaticamente:",
    technicalItems: [
      "Endereço IP e localização aproximada",
      "Tipo e versão do navegador",
      "Informações do dispositivo e sistema operacional",
      "Padrões de uso e interações com recursos",
      "Logs de erro e dados de desempenho",
    ],
    paymentIntro:
      "Para recursos premium e transações, coletamos informações de pagamento por meio de nossos processadores seguros. Também podemos receber dados de transações, cobrança, reembolso, pagamentos e triagem de risco de provedores de pagamento, identidade e conformidade. Não armazenamos números completos de cartão de crédito em nossos servidores.",
    useIntro: "Usamos suas informações para:",
    useItems: [
      "Fornecer e manter nossa plataforma de jogos",
      "Processar matchmaking e rankings baseados em habilidade",
      "Analisar gameplay para enforcement contra cheats e garantir fair play",
      "Gerar estatísticas, leaderboards e análises de jogadores",
      "Processar pagamentos e gerenciar assinaturas",
      "Verificar idade, identidade, residência e elegibilidade legal",
      "Enviar atualizações importantes do serviço e notificações",
      "Prestar suporte ao cliente",
      "Melhorar nossos serviços por meio de analytics",
      "Detectar e prevenir fraude, abuso e problemas de segurança",
      "Analisar depósitos, saques, resgates de prêmios e outras atividades financeiras para AML, sanções e conformidade",
      "Cumprir obrigações legais",
    ],
    sharingIntro:
      "Podemos compartilhar suas informações nas seguintes circunstâncias:",
    sharingItems: [
      {
        label: "Perfil Público:",
        text: "Seu nome de usuário, avatar, estatísticas de jogo e histórico de partidas podem ser visíveis para outros usuários como parte da experiência competitiva.",
      },
      {
        label: "Membros da Equipe e Squad:",
        text: "Informações relevantes para coordenação da equipe podem ser compartilhadas com seus companheiros.",
      },
      {
        label: "Organizadores de Torneios:",
        text: "Quando você participa de torneios, informações relevantes podem ser compartilhadas com os organizadores.",
      },
      {
        label: "Prestadores de Serviço:",
        text: "Trabalhamos com terceiros confiáveis que nos ajudam a operar a plataforma (hospedagem, analytics, processamento de pagamentos).",
      },
      {
        label: "Provedores de Verificação e Compliance:",
        text: "Podemos compartilhar informações com parceiros de identidade, verificação de idade, prevenção a fraude, triagem de sanções e pagamentos quando necessário para validar elegibilidade ou processar transações financeiras lícitas.",
      },
      {
        label: "Exigências Legais:",
        text: "Podemos divulgar informações quando exigido por lei ou para proteger nossos direitos e a segurança dos usuários.",
      },
    ],
    sharingNote: "Não vendemos suas informações pessoais a terceiros.",
    securityIntro:
      "Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados, incluindo:",
    securityItems: [
      "Criptografia de dados em trânsito (TLS/SSL) e em repouso",
      "Algoritmos seguros de hash de senha",
      "Auditorias regulares de segurança e testes de intrusão",
      "Controles de acesso e requisitos de autenticação",
      "Monitoramento de atividades suspeitas",
    ],
    rightsIntro:
      "Dependendo da sua localização, você pode ter os seguintes direitos:",
    rightsItems: [
      { label: "Acesso:", text: "Solicitar uma cópia dos seus dados pessoais" },
      {
        label: "Correção:",
        text: "Atualizar ou corrigir informações imprecisas",
      },
      { label: "Exclusão:", text: "Solicitar exclusão da sua conta e dados" },
      {
        label: "Portabilidade:",
        text: "Receber seus dados em formato portátil",
      },
      { label: "Oposição:", text: "Se opor a certos tipos de tratamento" },
      { label: "Restrição:", text: "Solicitar limitação do tratamento" },
    ],
    rightsContact: "Para exercer esses direitos, entre em contato pelo",
    retentionIntro:
      "Mantemos seus dados pelo tempo necessário para fornecer nossos serviços e cumprir as finalidades descritas nesta política. Especificamente:",
    retentionItems: [
      "Os dados da conta são mantidos enquanto sua conta estiver ativa",
      "Estatísticas de jogo podem ser mantidas para leaderboards históricos",
      "Registros de pagamento, saque, verificação de idade e compliance são mantidos conforme exigido por lei ou controles de risco",
      "Após a exclusão da conta, a maior parte dos dados é removida em até 30 dias",
    ],
    internationalBody:
      "Suas informações podem ser transferidas e processadas em países diferentes do seu. Garantimos que salvaguardas adequadas estejam em vigor para proteger suas informações conforme as leis aplicáveis de proteção de dados.",
    adultsOnlyBody:
      "A LeetGaming.PRO não é direcionada a menores de 18 anos, e não permitimos conscientemente que usuários menores de idade criem ou mantenham contas. Se descobrirmos que uma pessoa com menos de 18 anos nos forneceu informações pessoais, poderemos suspender a conta, restringir o acesso e excluir ou anonimizar os dados conforme exigido por lei. Se você acreditar que um menor utilizou a plataforma, entre em contato conosco imediatamente.",
    updatesBody:
      "Podemos atualizar esta Política de Privacidade periodicamente. Avisaremos sobre mudanças relevantes publicando um aviso na plataforma ou enviando um e-mail. Seu uso contínuo após a entrada em vigor das mudanças constitui aceitação da política atualizada.",
    contactIntro:
      "Para dúvidas ou preocupações sobre esta Política de Privacidade ou nossas práticas de dados, entre em contato:",
    dpoLabel: "Encarregado de Proteção de Dados:",
    emailLabel: "E-mail:",
  },
  "es-ES": {
    titles: [
      "1. Introducción",
      "2. Información que Recopilamos",
      "3. Cómo Usamos tu Información",
      "4. Compartición de Información",
      "5. Seguridad de los Datos",
      "6. Tus Derechos",
      "7. Conservación de Datos",
      "8. Transferencias Internacionales",
      "9. Servicio Solo para Adultos",
      "10. Cambios en esta Política",
      "11. Contáctanos",
    ],
    subtitles: [
      "Información de la Cuenta",
      "Datos de Juego",
      "Información Técnica",
      "Información de Pago",
    ],
    intro: [
      'LeetGaming.PRO ("nosotros", "nuestro" o "nos") se compromete a proteger tu privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos tu información cuando utilizas nuestra plataforma de juego competitivo y servicios relacionados.',
      "Al utilizar LeetGaming.PRO, aceptas la recopilación y el uso de información de acuerdo con esta política.",
      "LeetGaming.PRO está destinada únicamente a usuarios mayores de 18 años. Algunas jurisdicciones o funciones reguladas pueden exigir una edad mínima superior, incluida la elegibilidad 21+ para determinadas actividades relacionadas con flujos de dinero o premios.",
    ],
    accountIntro: "Cuando creas una cuenta, recopilamos:",
    accountItems: [
      "Dirección de correo electrónico",
      "Nombre de usuario y nombre visible",
      "Contraseña (almacenada de forma segura mediante hash estándar del sector)",
      "Información de perfil (avatar, biografía, región)",
      "Cuentas de juego vinculadas (Steam ID, Discord ID, etc.)",
      "Fecha de nacimiento y registros de verificación de edad cuando sea necesario para confirmar la elegibilidad",
      "Datos de identidad, residencia o cumplimiento enviados para KYC, AML, pagos, fraude o revisión legal",
    ],
    gamingIntro: "Para prestar nuestros servicios, recopilamos:",
    gamingItems: [
      "Historial de partidas y estadísticas",
      "Archivos de replay y datos de jugabilidad",
      "Clasificaciones y ratings de habilidad",
      "Participación en torneos y resultados",
      "Métricas de rendimiento dentro del juego",
    ],
    technicalIntro: "Recopilamos automáticamente:",
    technicalItems: [
      "Dirección IP y ubicación aproximada",
      "Tipo y versión del navegador",
      "Información del dispositivo y sistema operativo",
      "Patrones de uso e interacciones con funciones",
      "Registros de errores y datos de rendimiento",
    ],
    paymentIntro:
      "Para funciones premium y transacciones, recopilamos información de pago a través de nuestros procesadores seguros. También podemos recibir datos de transacciones, facturación, reembolsos, pagos y evaluación de riesgo de proveedores de pago, identidad y cumplimiento. No almacenamos números completos de tarjeta de crédito en nuestros servidores.",
    useIntro: "Usamos tu información para:",
    useItems: [
      "Proporcionar y mantener nuestra plataforma de juego",
      "Procesar emparejamientos y rankings basados en habilidad",
      "Analizar la jugabilidad para detectar trampas y aplicar normas de fair play",
      "Generar estadísticas, clasificaciones y analíticas de jugadores",
      "Procesar pagos y gestionar suscripciones",
      "Verificar edad, identidad, residencia y elegibilidad legal",
      "Enviar actualizaciones importantes del servicio y notificaciones",
      "Prestar atención al cliente",
      "Mejorar nuestros servicios mediante analítica",
      "Detectar y prevenir fraude, abusos y problemas de seguridad",
      "Revisar depósitos, retiradas, reclamaciones de premios y otras actividades de flujo de dinero para AML, sanciones y cumplimiento",
      "Cumplir obligaciones legales",
    ],
    sharingIntro:
      "Podemos compartir tu información en las siguientes circunstancias:",
    sharingItems: [
      {
        label: "Perfil Público:",
        text: "Tu nombre de usuario, avatar, estadísticas de juego e historial de partidas pueden ser visibles para otros usuarios como parte de la experiencia competitiva.",
      },
      {
        label: "Miembros del Equipo y Squad:",
        text: "La información relevante para la coordinación del equipo puede compartirse con tus compañeros.",
      },
      {
        label: "Organizadores de Torneos:",
        text: "Cuando participas en torneos, la información pertinente puede compartirse con los organizadores.",
      },
      {
        label: "Proveedores de Servicios:",
        text: "Trabajamos con terceros de confianza que nos ayudan a operar la plataforma (alojamiento, analítica, procesamiento de pagos).",
      },
      {
        label: "Proveedores de Verificación y Cumplimiento:",
        text: "Podemos compartir información con socios de identidad, verificación de edad, prevención del fraude, control de sanciones y pagos cuando sea necesario para validar la elegibilidad o procesar transacciones monetarias lícitas.",
      },
      {
        label: "Requisitos Legales:",
        text: "Podemos revelar información cuando la ley lo exija o para proteger nuestros derechos y la seguridad de los usuarios.",
      },
    ],
    sharingNote: "No vendemos tu información personal a terceros.",
    securityIntro:
      "Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos, entre ellas:",
    securityItems: [
      "Cifrado de datos en tránsito (TLS/SSL) y en reposo",
      "Algoritmos seguros de hash de contraseñas",
      "Auditorías de seguridad periódicas y pruebas de intrusión",
      "Controles de acceso y requisitos de autenticación",
      "Supervisión de actividades sospechosas",
    ],
    rightsIntro:
      "Dependiendo de tu ubicación, puedes tener los siguientes derechos:",
    rightsItems: [
      { label: "Acceso:", text: "Solicitar una copia de tus datos personales" },
      {
        label: "Rectificación:",
        text: "Actualizar o corregir información inexacta",
      },
      {
        label: "Supresión:",
        text: "Solicitar la eliminación de tu cuenta y tus datos",
      },
      {
        label: "Portabilidad:",
        text: "Recibir tus datos en un formato portable",
      },
      {
        label: "Oposición:",
        text: "Oponerte a determinados tipos de tratamiento",
      },
      { label: "Limitación:", text: "Solicitar la limitación del tratamiento" },
    ],
    rightsContact: "Para ejercer estos derechos, contáctanos en",
    retentionIntro:
      "Conservamos tus datos durante el tiempo necesario para prestar nuestros servicios y cumplir las finalidades descritas en esta política. En concreto:",
    retentionItems: [
      "Los datos de la cuenta se conservan mientras tu cuenta permanezca activa",
      "Las estadísticas de juego pueden conservarse para clasificaciones históricas",
      "Los registros de pago, retiro, verificación de edad y cumplimiento se conservan según lo exija la ley o los controles de riesgo",
      "Tras la eliminación de la cuenta, la mayoría de los datos se elimina en un plazo de 30 días",
    ],
    internationalBody:
      "Tu información puede transferirse y tratarse en países distintos del tuyo. Nos aseguramos de que existan garantías adecuadas para proteger tu información conforme a las leyes aplicables de protección de datos.",
    adultsOnlyBody:
      "LeetGaming.PRO no está dirigida a menores de 18 años y no permitimos conscientemente que usuarios menores creen o mantengan cuentas. Si descubrimos que una persona menor de 18 años nos ha proporcionado información personal, podremos suspender la cuenta, restringir el acceso y eliminar o anonimizar los datos según exija la ley. Si crees que una persona menor ha utilizado la plataforma, contáctanos de inmediato.",
    updatesBody:
      "Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos los cambios significativos mediante un aviso en la plataforma o por correo electrónico. El uso continuado de nuestros servicios tras la entrada en vigor de los cambios implica la aceptación de la política actualizada.",
    contactIntro:
      "Si tienes preguntas o inquietudes sobre esta Política de Privacidad o nuestras prácticas de datos, contáctanos:",
    dpoLabel: "Delegado de Protección de Datos:",
    emailLabel: "Correo electrónico:",
  },
  "es-LA": {
    titles: [
      "1. Introducción",
      "2. Información que Recopilamos",
      "3. Cómo Usamos tu Información",
      "4. Compartición de Información",
      "5. Seguridad de los Datos",
      "6. Tus Derechos",
      "7. Retención de Datos",
      "8. Transferencias Internacionales",
      "9. Servicio Solo para Adultos",
      "10. Cambios en esta Política",
      "11. Contáctanos",
    ],
    subtitles: [
      "Información de la Cuenta",
      "Datos de Juego",
      "Información Técnica",
      "Información de Pago",
    ],
    intro: [
      'LeetGaming.PRO ("nosotros", "nuestro" o "nos") está comprometida con proteger tu privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos tu información cuando utilizas nuestra plataforma competitiva de gaming y servicios relacionados.',
      "Al usar LeetGaming.PRO, aceptas la recopilación y el uso de información de acuerdo con esta política.",
      "LeetGaming.PRO está destinada solo a usuarios mayores de 18 años. Algunas jurisdicciones o funciones reguladas pueden imponer una edad mínima más alta, incluida la elegibilidad 21+ para ciertas actividades relacionadas con dinero o premios.",
    ],
    accountIntro: "Cuando creas una cuenta, recopilamos:",
    accountItems: [
      "Dirección de correo electrónico",
      "Nombre de usuario y nombre para mostrar",
      "Contraseña (almacenada de forma segura con hash estándar de la industria)",
      "Información de perfil (avatar, bio, región)",
      "Cuentas de juego vinculadas (Steam ID, Discord ID, etc.)",
      "Fecha de nacimiento y registros de verificación de edad cuando sean necesarios para confirmar elegibilidad",
      "Datos de identidad, residencia o cumplimiento enviados para KYC, AML, pagos, fraude o revisión legal",
    ],
    gamingIntro: "Para brindar nuestros servicios, recopilamos:",
    gamingItems: [
      "Historial de partidas y estadísticas",
      "Archivos de replay y datos de gameplay",
      "Ratings de habilidad y rankings",
      "Participación en torneos y resultados",
      "Métricas de rendimiento dentro del juego",
    ],
    technicalIntro: "Recopilamos automáticamente:",
    technicalItems: [
      "Dirección IP y ubicación aproximada",
      "Tipo y versión del navegador",
      "Información del dispositivo y sistema operativo",
      "Patrones de uso e interacciones con funciones",
      "Logs de errores y datos de rendimiento",
    ],
    paymentIntro:
      "Para funciones premium y transacciones, recopilamos información de pago a través de nuestros procesadores seguros. También podemos recibir datos de transacciones, facturación, reembolsos, pagos y evaluación de riesgo de proveedores de pago, identidad y cumplimiento. No almacenamos números completos de tarjeta de crédito en nuestros servidores.",
    useIntro: "Usamos tu información para:",
    useItems: [
      "Brindar y mantener nuestra plataforma de gaming",
      "Procesar matchmaking y rankings basados en habilidad",
      "Analizar gameplay para detectar cheats y aplicar fair play",
      "Generar estadísticas, leaderboards y analíticas de jugadores",
      "Procesar pagos y administrar suscripciones",
      "Verificar edad, identidad, residencia y elegibilidad legal",
      "Enviar actualizaciones importantes del servicio y notificaciones",
      "Brindar soporte al cliente",
      "Mejorar nuestros servicios mediante analítica",
      "Detectar y prevenir fraude, abuso y problemas de seguridad",
      "Revisar depósitos, retiros, reclamos de premios y otras actividades de dinero para AML, sanciones y cumplimiento",
      "Cumplir obligaciones legales",
    ],
    sharingIntro:
      "Podemos compartir tu información en las siguientes circunstancias:",
    sharingItems: [
      {
        label: "Perfil Público:",
        text: "Tu nombre de usuario, avatar, estadísticas de juego e historial de partidas pueden ser visibles para otros usuarios como parte de la experiencia competitiva.",
      },
      {
        label: "Miembros del Equipo y Squad:",
        text: "La información relevante para coordinar al equipo puede compartirse con tus compañeros.",
      },
      {
        label: "Organizadores de Torneos:",
        text: "Cuando participas en torneos, la información relevante puede compartirse con los organizadores.",
      },
      {
        label: "Proveedores de Servicios:",
        text: "Trabajamos con terceros confiables que nos ayudan a operar la plataforma (hosting, analítica, procesamiento de pagos).",
      },
      {
        label: "Proveedores de Verificación y Cumplimiento:",
        text: "Podemos compartir información con socios de identidad, verificación de edad, prevención de fraude, revisión de sanciones y pagos cuando sea necesario para validar elegibilidad o procesar transacciones monetarias lícitas.",
      },
      {
        label: "Requisitos Legales:",
        text: "Podemos divulgar información cuando la ley lo requiera o para proteger nuestros derechos y la seguridad de los usuarios.",
      },
    ],
    sharingNote: "No vendemos tu información personal a terceros.",
    securityIntro:
      "Implementamos medidas técnicas y organizativas adecuadas para proteger tus datos, incluyendo:",
    securityItems: [
      "Cifrado de datos en tránsito (TLS/SSL) y en reposo",
      "Algoritmos seguros de hash para contraseñas",
      "Auditorías de seguridad regulares y pruebas de penetración",
      "Controles de acceso y requisitos de autenticación",
      "Monitoreo de actividades sospechosas",
    ],
    rightsIntro:
      "Dependiendo de tu ubicación, puedes tener los siguientes derechos:",
    rightsItems: [
      { label: "Acceso:", text: "Solicitar una copia de tus datos personales" },
      {
        label: "Corrección:",
        text: "Actualizar o corregir información inexacta",
      },
      {
        label: "Eliminación:",
        text: "Solicitar la eliminación de tu cuenta y tus datos",
      },
      {
        label: "Portabilidad:",
        text: "Recibir tus datos en un formato portable",
      },
      { label: "Objeción:", text: "Oponerte a ciertos tipos de procesamiento" },
      {
        label: "Restricción:",
        text: "Solicitar la limitación del procesamiento",
      },
    ],
    rightsContact: "Para ejercer estos derechos, contáctanos en",
    retentionIntro:
      "Conservamos tus datos durante el tiempo necesario para brindar nuestros servicios y cumplir los fines descritos en esta política. En particular:",
    retentionItems: [
      "Los datos de la cuenta se conservan mientras tu cuenta esté activa",
      "Las estadísticas de juego pueden conservarse para leaderboards históricos",
      "Los registros de pago, retiro, verificación de edad y cumplimiento se conservan según lo exija la ley o los controles de riesgo",
      "Después de eliminar la cuenta, la mayoría de los datos se elimina en un plazo de 30 días",
    ],
    internationalBody:
      "Tu información puede transferirse y procesarse en países distintos al tuyo. Nos aseguramos de que existan salvaguardas adecuadas para proteger tu información de acuerdo con las leyes aplicables de protección de datos.",
    adultsOnlyBody:
      "LeetGaming.PRO no está dirigida a menores de 18 años y no permitimos conscientemente que usuarios menores de edad creen o mantengan cuentas. Si descubrimos que una persona menor de 18 años nos proporcionó información personal, podremos suspender la cuenta, restringir el acceso y eliminar o anonimizar los datos según lo exija la ley. Si crees que una persona menor ha usado la plataforma, contáctanos de inmediato.",
    updatesBody:
      "Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos sobre cambios importantes publicando un aviso en la plataforma o enviando un correo electrónico. El uso continuo de nuestros servicios después de que los cambios entren en vigor constituye aceptación de la política actualizada.",
    contactIntro:
      "Si tienes preguntas o inquietudes sobre esta Política de Privacidad o nuestras prácticas de datos, contáctanos:",
    dpoLabel: "Oficial de Protección de Datos:",
    emailLabel: "Correo electrónico:",
  },
  "zh-CN": {
    titles: [
      "1. 介绍",
      "2. 我们收集的信息",
      "3. 我们如何使用你的信息",
      "4. 信息共享",
      "5. 数据安全",
      "6. 你的权利",
      "7. 数据保留",
      "8. 国际传输",
      "9. 仅限成人服务",
      "10. 本政策的变更",
      "11. 联系我们",
    ],
    subtitles: ["账户信息", "游戏数据", "技术信息", "支付信息"],
    intro: [
      "LeetGaming.PRO（“我们”）致力于保护你的隐私。本隐私政策说明当你使用我们的竞技游戏平台及相关服务时，我们如何收集、使用、披露并保护你的信息。",
      "使用 LeetGaming.PRO 即表示你同意我们按照本政策收集和使用相关信息。",
      "LeetGaming.PRO 仅面向 18 岁及以上用户。某些司法辖区或受监管功能可能要求更高年龄门槛，包括部分资金流动或奖品相关活动需满足 21+ 资格。",
    ],
    accountIntro: "当你创建账户时，我们会收集：",
    accountItems: [
      "电子邮件地址",
      "用户名和显示名称",
      "密码（采用行业标准哈希方式安全存储）",
      "个人资料信息（头像、简介、地区）",
      "已绑定的游戏平台账户（Steam ID、Discord ID 等）",
      "在确认资格时所需的出生日期和年龄验证记录",
      "为 KYC、AML、付款、反欺诈或法律审查提交的身份、居住地或合规数据",
    ],
    gamingIntro: "为提供服务，我们会收集：",
    gamingItems: [
      "比赛历史和统计数据",
      "回放文件和游戏数据",
      "技能评分和排名",
      "赛事参与情况和结果",
      "游戏内表现指标",
    ],
    technicalIntro: "我们会自动收集：",
    technicalItems: [
      "IP 地址和大致位置",
      "浏览器类型和版本",
      "设备信息和操作系统",
      "使用模式和功能交互",
      "错误日志和性能数据",
    ],
    paymentIntro:
      "对于高级功能和交易，我们通过安全支付处理商收集支付信息。我们也可能从支付、身份和合规提供商接收交易、账单、退款、付款及风险筛查数据。我们不会在服务器上存储完整的信用卡号。",
    useIntro: "我们将你的信息用于：",
    useItems: [
      "提供并维护我们的游戏平台",
      "处理匹配和基于技能的排名",
      "分析游戏过程以执行反作弊和公平竞技规则",
      "生成统计数据、排行榜和玩家分析",
      "处理支付并管理订阅",
      "验证年龄、身份、居住地和法律资格",
      "发送重要服务更新和通知",
      "提供客户支持",
      "通过分析持续改进服务",
      "检测并防止欺诈、滥用和安全问题",
      "出于 AML、制裁和合规目的审查充值、提现、奖金申领及其他资金流动活动",
      "履行法律义务",
    ],
    sharingIntro: "在以下情况下，我们可能会共享你的信息：",
    sharingItems: [
      {
        label: "公开资料：",
        text: "作为竞技体验的一部分，你的用户名、头像、游戏统计和比赛历史可能对其他用户可见。",
      },
      {
        label: "战队和小队成员：",
        text: "与团队协作相关的信息可能会与你的队友共享。",
      },
      {
        label: "赛事组织者：",
        text: "当你参加赛事时，相关信息可能会与组织者共享。",
      },
      {
        label: "服务提供商：",
        text: "我们与帮助平台运营的可信第三方合作（如托管、分析、支付处理）。",
      },
      {
        label: "验证与合规提供商：",
        text: "在需要验证资格或处理合法资金交易时，我们可能会与身份、年龄验证、反欺诈、制裁筛查和支付合作伙伴共享信息。",
      },
      {
        label: "法律要求：",
        text: "在法律要求或为保护我们的权利及用户安全时，我们可能披露相关信息。",
      },
    ],
    sharingNote: "我们不会将你的个人信息出售给第三方。",
    securityIntro: "我们采取适当的技术和组织措施保护你的数据，包括：",
    securityItems: [
      "传输中（TLS/SSL）和静态存储中的数据加密",
      "安全的密码哈希算法",
      "定期安全审计和渗透测试",
      "访问控制和身份验证要求",
      "对可疑活动的监控",
    ],
    rightsIntro: "根据你所在地区，你可能享有以下权利：",
    rightsItems: [
      { label: "访问权：", text: "请求获取你的个人数据副本" },
      { label: "更正权：", text: "更新或更正不准确的信息" },
      { label: "删除权：", text: "请求删除你的账户和数据" },
      { label: "可携权：", text: "以可移植格式接收你的数据" },
      { label: "反对权：", text: "反对某些类型的数据处理" },
      { label: "限制权：", text: "请求限制数据处理" },
    ],
    rightsContact: "如需行使这些权利，请通过以下方式联系我们：",
    retentionIntro:
      "我们会在提供服务及实现本政策所述目的所必需的期限内保留你的数据。具体包括：",
    retentionItems: [
      "账户数据会在你的账户处于活跃状态期间保留",
      "游戏统计数据可能会为历史排行榜目的而继续保留",
      "支付、提现、年龄验证和合规记录会根据法律要求或风险控制需要保留",
      "账户删除后，大多数数据会在 30 天内移除",
    ],
    internationalBody:
      "你的信息可能会被传输到并在你所在国家/地区之外的国家处理。我们会确保采取适当保障措施，以根据适用的数据保护法律保护你的信息。",
    adultsOnlyBody:
      "LeetGaming.PRO 不面向 18 岁以下人士，我们也不会在明知的情况下允许未成年人创建或维持账户。如果我们发现未满 18 岁的人向我们提供了个人信息，我们可能会根据法律要求暂停账户、限制访问，并删除或匿名化相关数据。如果你认为有未成年人使用了本平台，请立即联系我们。",
    updatesBody:
      "我们可能会定期更新本隐私政策。对于重大变更，我们会通过平台公告或电子邮件通知你。变更生效后继续使用我们的服务，即表示你接受更新后的政策。",
    contactIntro:
      "如果你对本隐私政策或我们的数据处理实践有疑问或担忧，请联系我们：",
    dpoLabel: "数据保护官：",
    emailLabel: "电子邮件：",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();

  return {
    title: t("legal.privacyMetaTitle"),
    description: t("legal.privacyMetaDescription"),
  };
}

export default async function PrivacyPolicyPage() {
  const { locale, t } = await getServerI18n();
  const copy = privacyCopy[getTierOneLocale(locale)];

  return (
    <article className="prose prose-invert max-w-none prose-headings:text-[#34445C] dark:prose-headings:text-[#F5F0E1] prose-p:text-default-600 prose-li:text-default-600 prose-lg lg:prose-xl">
      <div className="flex items-center gap-4 lg:gap-6 mb-8 lg:mb-10">
        <div
          className="w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
          }}
        >
          <span className="text-2xl lg:text-3xl text-[#F5F0E1] dark:text-[#34445C]">
            🔒
          </span>
        </div>
        <div>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-0 text-[#34445C] dark:text-[#F5F0E1]">
            {t("legal.privacyPolicy")}
          </h1>
          <p className="text-[#FF4654] dark:text-[#DCFF37] text-sm lg:text-base mt-1">
            {t("legal.lastUpdated", {
              date: formatLocalizedDate("2026-03-18", locale),
            })}
          </p>
        </div>
      </div>

      <section className="mb-10 lg:mb-12 p-6 lg:p-8 rounded-none border-l-4 border-[#FF4654] dark:border-[#DCFF37] bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4 text-[#34445C] dark:text-[#F5F0E1]">
          {copy.titles[0]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg leading-relaxed">
          {copy.intro[0]}
        </p>
        <p className="text-default-600 text-base lg:text-lg leading-relaxed">
          {copy.intro[1]}
        </p>
        <p className="text-default-600 mt-4 text-base lg:text-lg leading-relaxed">
          {copy.intro[2]}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-6">
          {copy.titles[1]}
        </h2>

        <h3 className="text-lg lg:text-xl font-medium mb-3 text-[#34445C] dark:text-[#F5F0E1]">
          {copy.subtitles[0]}
        </h3>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.accountIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-6 space-y-2 text-base lg:text-lg">
          {copy.accountItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h3 className="text-lg lg:text-xl font-medium mb-3 text-[#34445C] dark:text-[#F5F0E1]">
          {copy.subtitles[1]}
        </h3>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.gamingIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-6 space-y-2 text-base lg:text-lg">
          {copy.gamingItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h3 className="text-lg lg:text-xl font-medium mb-3 text-[#34445C] dark:text-[#F5F0E1]">
          {copy.subtitles[2]}
        </h3>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.technicalIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-6 space-y-2 text-base lg:text-lg">
          {copy.technicalItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h3 className="text-lg lg:text-xl font-medium mb-3 text-[#34445C] dark:text-[#F5F0E1]">
          {copy.subtitles[3]}
        </h3>
        <p className="text-default-600 text-base lg:text-lg">
          {copy.paymentIntro}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[2]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.useIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 space-y-2 text-base lg:text-lg">
          {copy.useItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[3]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.sharingIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-3 text-base lg:text-lg">
          {copy.sharingItems.map((item) => (
            <li key={item.label}>
              <strong className="text-[#34445C] dark:text-[#F5F0E1]">
                {item.label}
              </strong>{" "}
              {item.text}
            </li>
          ))}
        </ul>
        <p className="text-default-600 text-base lg:text-lg font-medium">
          {copy.sharingNote}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[4]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.securityIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 space-y-2 text-base lg:text-lg">
          {copy.securityItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[5]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.rightsIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-2 text-base lg:text-lg">
          {copy.rightsItems.map((item) => (
            <li key={item.label}>
              <strong className="text-[#34445C] dark:text-[#F5F0E1]">
                {item.label}
              </strong>{" "}
              {item.text}
            </li>
          ))}
        </ul>
        <p className="text-default-600 text-base lg:text-lg">
          {copy.rightsContact}{" "}
          <a
            href="mailto:privacy@leetgaming.pro"
            className="text-[#FF4654] dark:text-[#DCFF37] hover:underline"
          >
            privacy@leetgaming.pro
          </a>
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[6]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.retentionIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 space-y-2 text-base lg:text-lg">
          {copy.retentionItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[7]}
        </h2>
        <p className="text-default-600 text-base lg:text-lg leading-relaxed">
          {copy.internationalBody}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[8]}
        </h2>
        <p className="text-default-600 text-base lg:text-lg leading-relaxed">
          {copy.adultsOnlyBody}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[9]}
        </h2>
        <p className="text-default-600 text-base lg:text-lg leading-relaxed">
          {copy.updatesBody}
        </p>
      </section>

      <section>
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[10]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.contactIntro}
        </p>
        <ul className="list-none text-default-600 space-y-2 text-base lg:text-lg">
          <li>
            {copy.emailLabel}{" "}
            <a
              href="mailto:privacy@leetgaming.pro"
              className="text-[#FF4654] dark:text-[#DCFF37] hover:underline"
            >
              privacy@leetgaming.pro
            </a>
          </li>
          <li>
            {copy.dpoLabel}{" "}
            <a
              href="mailto:dpo@leetgaming.pro"
              className="text-[#FF4654] dark:text-[#DCFF37] hover:underline"
            >
              dpo@leetgaming.pro
            </a>
          </li>
        </ul>
      </section>
    </article>
  );
}
