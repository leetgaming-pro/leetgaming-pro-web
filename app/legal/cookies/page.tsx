import { Metadata } from "next";
import {
  formatLocalizedDate,
  getServerI18n,
  getTierOneLocale,
} from "@/lib/i18n/server";

const cookieCopy = {
  "en-US": {
    titles: [
      "1. What Are Cookies",
      "2. Types of Cookies We Use",
      "3. Third-Party Cookies",
      "4. Managing Your Cookie Preferences",
      "5. Cookie Retention",
      "6. Updates to This Policy",
      "7. Contact Us",
    ],
    subtitles: [
      "Essential Cookies",
      "Functional Cookies",
      "Analytics Cookies",
      "Marketing Cookies",
    ],
    intro: [
      "Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.",
      "LeetGaming.PRO uses cookies and similar technologies to enhance your gaming experience, remember your preferences, and provide personalized content and services.",
    ],
    essentialDescription:
      "These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, account authentication, and accessibility. You cannot opt out of these cookies.",
    essentialItems: [
      "Session management and authentication",
      "Security tokens and CSRF protection",
      "Load balancing and server routing",
      "Cookie consent preferences",
    ],
    functionalDescription:
      "These cookies enable enhanced functionality and personalization, such as remembering your language preferences, region settings, and display preferences.",
    functionalItems: [
      "Language and region preferences",
      "Theme and display settings (dark/light mode)",
      "Game preferences and filter settings",
      "Recently viewed content",
    ],
    analyticsDescription:
      "These cookies help us understand how visitors interact with our platform by collecting and reporting information anonymously. This helps us improve our services.",
    analyticsItems: [
      "Page views and navigation patterns",
      "Feature usage statistics",
      "Performance monitoring",
      "Error tracking and debugging",
    ],
    marketingDescription:
      "These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant advertisements on other sites.",
    marketingItems: [
      "Cross-site tracking for ad personalization",
      "Campaign effectiveness measurement",
      "Social media integration",
    ],
    thirdPartyIntro:
      "We use services from third parties that may set their own cookies on your device. These include:",
    thirdPartyItems: [
      {
        label: "Authentication providers:",
        text: "Steam, Discord, Google for account linking",
      },
      {
        label: "Payment processors:",
        text: "For secure transaction processing",
      },
      {
        label: "Analytics services:",
        text: "To help us understand platform usage",
      },
      {
        label: "Content delivery networks:",
        text: "To optimize content delivery",
      },
    ],
    managingIntro: "You can control and manage cookies in several ways:",
    managingItems: [
      {
        label: "Cookie Settings:",
        text: "Use our cookie consent banner to accept or reject non-essential cookies when you first visit our site.",
      },
      {
        label: "Browser Settings:",
        text: "Most browsers allow you to refuse cookies or delete specific cookies. Check your browser's help documentation for instructions.",
      },
      {
        label: "Device Settings:",
        text: "On mobile devices, you can typically manage cookie preferences through your device settings.",
      },
    ],
    managingNote:
      "Please note that blocking some cookies may impact your experience on our platform and limit the functionality available to you.",
    retentionIntro:
      "Cookies have different retention periods depending on their purpose:",
    retentionItems: [
      {
        label: "Session cookies:",
        text: "Deleted when you close your browser",
      },
      {
        label: "Persistent cookies:",
        text: "Remain on your device for a set period (typically 30 days to 2 years)",
      },
      {
        label: "Authentication cookies:",
        text: "Typically expire after 30 days of inactivity",
      },
    ],
    updatesBody:
      'We may update this Cookie Policy from time to time to reflect changes in our practices or for operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on this page with a new "Last updated" date.',
    contactIntro:
      "If you have questions about our use of cookies or this Cookie Policy, please contact us at",
  },
  "pt-BR": {
    titles: [
      "1. O que são Cookies",
      "2. Tipos de Cookies que Utilizamos",
      "3. Cookies de Terceiros",
      "4. Como Gerenciar suas Preferências de Cookies",
      "5. Retenção de Cookies",
      "6. Atualizações desta Política",
      "7. Fale Conosco",
    ],
    subtitles: [
      "Cookies Essenciais",
      "Cookies Funcionais",
      "Cookies Analíticos",
      "Cookies de Marketing",
    ],
    intro: [
      "Cookies são pequenos arquivos de texto armazenados no seu computador ou dispositivo móvel quando você visita um site. Eles são amplamente usados para fazer os sites funcionarem de forma mais eficiente e para fornecer informações aos proprietários do site.",
      "A LeetGaming.PRO usa cookies e tecnologias semelhantes para melhorar sua experiência de jogo, lembrar suas preferências e oferecer conteúdo e serviços personalizados.",
    ],
    essentialDescription:
      "Esses cookies são necessários para que o site funcione corretamente. Eles permitem funcionalidades centrais como segurança, gerenciamento de rede, autenticação da conta e acessibilidade. Você não pode desativar esses cookies.",
    essentialItems: [
      "Gerenciamento de sessão e autenticação",
      "Tokens de segurança e proteção CSRF",
      "Balanceamento de carga e roteamento de servidores",
      "Preferências de consentimento de cookies",
    ],
    functionalDescription:
      "Esses cookies permitem funcionalidades aprimoradas e personalização, como lembrar seu idioma, configurações de região e preferências de exibição.",
    functionalItems: [
      "Preferências de idioma e região",
      "Tema e configurações de exibição (modo escuro/claro)",
      "Preferências de jogos e filtros",
      "Conteúdo visualizado recentemente",
    ],
    analyticsDescription:
      "Esses cookies nos ajudam a entender como os visitantes interagem com nossa plataforma ao coletar e relatar informações de forma anônima. Isso nos ajuda a melhorar nossos serviços.",
    analyticsItems: [
      "Visualizações de páginas e padrões de navegação",
      "Estatísticas de uso de recursos",
      "Monitoramento de desempenho",
      "Rastreamento de erros e depuração",
    ],
    marketingDescription:
      "Esses cookies podem ser definidos por nossos parceiros de publicidade para criar um perfil dos seus interesses e exibir anúncios relevantes em outros sites.",
    marketingItems: [
      "Rastreamento entre sites para personalização de anúncios",
      "Medição da eficácia de campanhas",
      "Integração com redes sociais",
    ],
    thirdPartyIntro:
      "Usamos serviços de terceiros que podem definir seus próprios cookies no seu dispositivo. Isso inclui:",
    thirdPartyItems: [
      {
        label: "Provedores de autenticação:",
        text: "Steam, Discord e Google para vinculação de conta",
      },
      {
        label: "Processadores de pagamento:",
        text: "Para processamento seguro de transações",
      },
      {
        label: "Serviços de analytics:",
        text: "Para nos ajudar a entender o uso da plataforma",
      },
      {
        label: "Redes de distribuição de conteúdo:",
        text: "Para otimizar a entrega de conteúdo",
      },
    ],
    managingIntro:
      "Você pode controlar e gerenciar cookies de várias maneiras:",
    managingItems: [
      {
        label: "Configurações de Cookies:",
        text: "Use nosso banner de consentimento para aceitar ou recusar cookies não essenciais quando visitar o site pela primeira vez.",
      },
      {
        label: "Configurações do Navegador:",
        text: "A maioria dos navegadores permite recusar cookies ou excluir cookies específicos. Consulte a documentação de ajuda do seu navegador.",
      },
      {
        label: "Configurações do Dispositivo:",
        text: "Em dispositivos móveis, normalmente você pode gerenciar preferências de cookies nas configurações do aparelho.",
      },
    ],
    managingNote:
      "Observe que bloquear alguns cookies pode afetar sua experiência na plataforma e limitar funcionalidades disponíveis.",
    retentionIntro:
      "Os cookies têm períodos de retenção diferentes conforme sua finalidade:",
    retentionItems: [
      {
        label: "Cookies de sessão:",
        text: "Excluídos quando você fecha o navegador",
      },
      {
        label: "Cookies persistentes:",
        text: "Permanecem no seu dispositivo por um período definido (geralmente de 30 dias a 2 anos)",
      },
      {
        label: "Cookies de autenticação:",
        text: "Normalmente expiram após 30 dias de inatividade",
      },
    ],
    updatesBody:
      'Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças em nossas práticas ou por razões operacionais, legais ou regulatórias. Avisaremos sobre alterações materiais publicando a política atualizada nesta página com uma nova data de "Última atualização".',
    contactIntro:
      "Se você tiver dúvidas sobre nosso uso de cookies ou sobre esta Política de Cookies, entre em contato pelo",
  },
  "es-ES": {
    titles: [
      "1. Qué son las Cookies",
      "2. Tipos de Cookies que Utilizamos",
      "3. Cookies de Terceros",
      "4. Cómo Gestionar tus Preferencias de Cookies",
      "5. Conservación de Cookies",
      "6. Actualizaciones de esta Política",
      "7. Contáctanos",
    ],
    subtitles: [
      "Cookies Esenciales",
      "Cookies Funcionales",
      "Cookies Analíticas",
      "Cookies de Marketing",
    ],
    intro: [
      "Las cookies son pequeños archivos de texto que se almacenan en tu ordenador o dispositivo móvil cuando visitas un sitio web. Se utilizan ampliamente para que los sitios funcionen de forma más eficiente y para proporcionar información a los propietarios del sitio.",
      "LeetGaming.PRO usa cookies y tecnologías similares para mejorar tu experiencia de juego, recordar tus preferencias y ofrecer contenido y servicios personalizados.",
    ],
    essentialDescription:
      "Estas cookies son necesarias para que el sitio web funcione correctamente. Permiten funcionalidades básicas como seguridad, gestión de red, autenticación de la cuenta y accesibilidad. No puedes rechazarlas.",
    essentialItems: [
      "Gestión de sesión y autenticación",
      "Tokens de seguridad y protección CSRF",
      "Balanceo de carga y enrutamiento del servidor",
      "Preferencias de consentimiento de cookies",
    ],
    functionalDescription:
      "Estas cookies permiten una funcionalidad mejorada y personalización, como recordar tu idioma, la región y las preferencias de visualización.",
    functionalItems: [
      "Preferencias de idioma y región",
      "Tema y ajustes de visualización (modo claro/oscuro)",
      "Preferencias de juego y filtros",
      "Contenido visto recientemente",
    ],
    analyticsDescription:
      "Estas cookies nos ayudan a entender cómo interactúan los visitantes con nuestra plataforma recopilando y reportando información de forma anónima. Esto nos ayuda a mejorar nuestros servicios.",
    analyticsItems: [
      "Vistas de página y patrones de navegación",
      "Estadísticas de uso de funciones",
      "Monitorización del rendimiento",
      "Seguimiento de errores y depuración",
    ],
    marketingDescription:
      "Estas cookies pueden ser establecidas por nuestros socios publicitarios para crear un perfil de tus intereses y mostrarte anuncios relevantes en otros sitios.",
    marketingItems: [
      "Seguimiento entre sitios para personalización publicitaria",
      "Medición de la eficacia de campañas",
      "Integración con redes sociales",
    ],
    thirdPartyIntro:
      "Usamos servicios de terceros que pueden establecer sus propias cookies en tu dispositivo. Entre ellos se incluyen:",
    thirdPartyItems: [
      {
        label: "Proveedores de autenticación:",
        text: "Steam, Discord y Google para la vinculación de cuentas",
      },
      {
        label: "Procesadores de pago:",
        text: "Para el procesamiento seguro de transacciones",
      },
      {
        label: "Servicios de analítica:",
        text: "Para ayudarnos a entender el uso de la plataforma",
      },
      {
        label: "Redes de distribución de contenido:",
        text: "Para optimizar la entrega de contenido",
      },
    ],
    managingIntro: "Puedes controlar y gestionar las cookies de varias formas:",
    managingItems: [
      {
        label: "Configuración de Cookies:",
        text: "Usa nuestro banner de consentimiento para aceptar o rechazar cookies no esenciales cuando visites el sitio por primera vez.",
      },
      {
        label: "Configuración del Navegador:",
        text: "La mayoría de los navegadores permiten rechazar cookies o eliminar cookies concretas. Consulta la ayuda de tu navegador para obtener instrucciones.",
      },
      {
        label: "Configuración del Dispositivo:",
        text: "En dispositivos móviles, normalmente puedes gestionar las preferencias de cookies desde la configuración del dispositivo.",
      },
    ],
    managingNote:
      "Ten en cuenta que bloquear algunas cookies puede afectar tu experiencia en la plataforma y limitar funcionalidades disponibles.",
    retentionIntro:
      "Las cookies tienen distintos periodos de conservación según su finalidad:",
    retentionItems: [
      {
        label: "Cookies de sesión:",
        text: "Se eliminan cuando cierras el navegador",
      },
      {
        label: "Cookies persistentes:",
        text: "Permanecen en tu dispositivo durante un periodo determinado (normalmente entre 30 días y 2 años)",
      },
      {
        label: "Cookies de autenticación:",
        text: "Normalmente caducan tras 30 días de inactividad",
      },
    ],
    updatesBody:
      'Podemos actualizar esta Política de Cookies periódicamente para reflejar cambios en nuestras prácticas o por motivos operativos, legales o regulatorios. Te notificaremos cualquier cambio material publicando la política actualizada en esta página con una nueva fecha de "Última actualización".',
    contactIntro:
      "Si tienes preguntas sobre nuestro uso de cookies o sobre esta Política de Cookies, contáctanos en",
  },
  "es-LA": {
    titles: [
      "1. Qué son las Cookies",
      "2. Tipos de Cookies que Usamos",
      "3. Cookies de Terceros",
      "4. Cómo Administrar tus Preferencias de Cookies",
      "5. Retención de Cookies",
      "6. Actualizaciones de esta Política",
      "7. Contáctanos",
    ],
    subtitles: [
      "Cookies Esenciales",
      "Cookies Funcionales",
      "Cookies Analíticas",
      "Cookies de Marketing",
    ],
    intro: [
      "Las cookies son pequeños archivos de texto que se guardan en tu computadora o dispositivo móvil cuando visitas un sitio web. Se usan ampliamente para que los sitios funcionen de forma más eficiente y para dar información a los propietarios del sitio.",
      "LeetGaming.PRO usa cookies y tecnologías similares para mejorar tu experiencia de juego, recordar tus preferencias y ofrecer contenido y servicios personalizados.",
    ],
    essentialDescription:
      "Estas cookies son necesarias para que el sitio funcione correctamente. Permiten funciones clave como seguridad, gestión de red, autenticación de la cuenta y accesibilidad. No puedes desactivarlas.",
    essentialItems: [
      "Gestión de sesión y autenticación",
      "Tokens de seguridad y protección CSRF",
      "Balanceo de carga y enrutamiento del servidor",
      "Preferencias de consentimiento de cookies",
    ],
    functionalDescription:
      "Estas cookies permiten funcionalidad mejorada y personalización, como recordar tu idioma, región y preferencias de visualización.",
    functionalItems: [
      "Preferencias de idioma y región",
      "Tema y ajustes de visualización (modo oscuro/claro)",
      "Preferencias de juego y filtros",
      "Contenido visto recientemente",
    ],
    analyticsDescription:
      "Estas cookies nos ayudan a entender cómo interactúan los visitantes con nuestra plataforma al recopilar y reportar información de forma anónima. Esto nos ayuda a mejorar nuestros servicios.",
    analyticsItems: [
      "Vistas de página y patrones de navegación",
      "Estadísticas de uso de funciones",
      "Monitoreo del rendimiento",
      "Seguimiento de errores y depuración",
    ],
    marketingDescription:
      "Estas cookies pueden ser configuradas por nuestros socios publicitarios para crear un perfil de tus intereses y mostrarte anuncios relevantes en otros sitios.",
    marketingItems: [
      "Rastreo entre sitios para personalización de anuncios",
      "Medición de efectividad de campañas",
      "Integración con redes sociales",
    ],
    thirdPartyIntro:
      "Usamos servicios de terceros que pueden configurar sus propias cookies en tu dispositivo. Esto incluye:",
    thirdPartyItems: [
      {
        label: "Proveedores de autenticación:",
        text: "Steam, Discord y Google para vincular cuentas",
      },
      {
        label: "Procesadores de pago:",
        text: "Para procesar transacciones de forma segura",
      },
      {
        label: "Servicios de analítica:",
        text: "Para ayudarnos a entender el uso de la plataforma",
      },
      {
        label: "Redes de entrega de contenido:",
        text: "Para optimizar la entrega de contenido",
      },
    ],
    managingIntro:
      "Puedes controlar y administrar las cookies de varias formas:",
    managingItems: [
      {
        label: "Configuración de Cookies:",
        text: "Usa nuestro banner de consentimiento para aceptar o rechazar cookies no esenciales cuando visites el sitio por primera vez.",
      },
      {
        label: "Configuración del Navegador:",
        text: "La mayoría de los navegadores permiten rechazar cookies o eliminar cookies específicas. Revisa la ayuda de tu navegador para ver instrucciones.",
      },
      {
        label: "Configuración del Dispositivo:",
        text: "En dispositivos móviles, normalmente puedes administrar las preferencias de cookies desde la configuración del dispositivo.",
      },
    ],
    managingNote:
      "Ten en cuenta que bloquear algunas cookies puede afectar tu experiencia en la plataforma y limitar la funcionalidad disponible.",
    retentionIntro:
      "Las cookies tienen distintos periodos de retención según su propósito:",
    retentionItems: [
      {
        label: "Cookies de sesión:",
        text: "Se eliminan cuando cierras el navegador",
      },
      {
        label: "Cookies persistentes:",
        text: "Permanecen en tu dispositivo por un periodo determinado (generalmente entre 30 días y 2 años)",
      },
      {
        label: "Cookies de autenticación:",
        text: "Normalmente vencen después de 30 días de inactividad",
      },
    ],
    updatesBody:
      'Podemos actualizar esta Política de Cookies periódicamente para reflejar cambios en nuestras prácticas o por razones operativas, legales o regulatorias. Te informaremos sobre cambios materiales publicando la política actualizada en esta página con una nueva fecha de "Última actualización".',
    contactIntro:
      "Si tienes preguntas sobre nuestro uso de cookies o sobre esta Política de Cookies, contáctanos en",
  },
  "zh-CN": {
    titles: [
      "1. 什么是 Cookie",
      "2. 我们使用的 Cookie 类型",
      "3. 第三方 Cookie",
      "4. 管理你的 Cookie 偏好",
      "5. Cookie 保留期限",
      "6. 本政策的更新",
      "7. 联系我们",
    ],
    subtitles: ["必要 Cookie", "功能性 Cookie", "分析 Cookie", "营销 Cookie"],
    intro: [
      "Cookie 是当你访问网站时存储在计算机或移动设备上的小型文本文件。它们被广泛用于让网站更高效地运行，并向网站所有者提供信息。",
      "LeetGaming.PRO 使用 Cookie 和类似技术来提升你的游戏体验、记住你的偏好，并提供个性化内容和服务。",
    ],
    essentialDescription:
      "这些 Cookie 是网站正常运行所必需的。它们支持安全、网络管理、账户认证和无障碍访问等核心功能。你无法选择停用这些 Cookie。",
    essentialItems: [
      "会话管理与身份验证",
      "安全令牌与 CSRF 保护",
      "负载均衡与服务器路由",
      "Cookie 同意偏好设置",
    ],
    functionalDescription:
      "这些 Cookie 提供增强功能和个性化体验，例如记住你的语言偏好、地区设置和显示偏好。",
    functionalItems: [
      "语言和地区偏好",
      "主题和显示设置（深色/浅色模式）",
      "游戏偏好和筛选设置",
      "最近查看的内容",
    ],
    analyticsDescription:
      "这些 Cookie 通过匿名收集和报告信息，帮助我们了解访问者如何与平台互动，从而改进服务。",
    analyticsItems: [
      "页面浏览和导航模式",
      "功能使用统计",
      "性能监控",
      "错误跟踪与调试",
    ],
    marketingDescription:
      "这些 Cookie 可能由我们的广告合作伙伴设置，用于建立你的兴趣画像，并在其他网站上展示相关广告。",
    marketingItems: [
      "跨站跟踪以实现广告个性化",
      "营销活动效果衡量",
      "社交媒体集成",
    ],
    thirdPartyIntro:
      "我们使用的第三方服务可能会在你的设备上设置自己的 Cookie，包括：",
    thirdPartyItems: [
      {
        label: "身份验证提供商：",
        text: "用于账户绑定的 Steam、Discord 和 Google",
      },
      { label: "支付处理商：", text: "用于安全处理交易" },
      { label: "分析服务：", text: "帮助我们了解平台使用情况" },
      { label: "内容分发网络：", text: "用于优化内容传输" },
    ],
    managingIntro: "你可以通过多种方式控制和管理 Cookie：",
    managingItems: [
      {
        label: "Cookie 设置：",
        text: "首次访问网站时，你可以通过 Cookie 同意横幅接受或拒绝非必要 Cookie。",
      },
      {
        label: "浏览器设置：",
        text: "大多数浏览器允许你拒绝 Cookie 或删除特定 Cookie。请查看浏览器帮助文档获取说明。",
      },
      {
        label: "设备设置：",
        text: "在移动设备上，你通常可以通过设备设置管理 Cookie 偏好。",
      },
    ],
    managingNote:
      "请注意，阻止某些 Cookie 可能会影响你在平台上的体验，并限制可用功能。",
    retentionIntro: "不同 Cookie 根据用途具有不同的保留期限：",
    retentionItems: [
      { label: "会话 Cookie：", text: "关闭浏览器后删除" },
      {
        label: "持久 Cookie：",
        text: "在你的设备上保留一段设定时间（通常为 30 天至 2 年）",
      },
      { label: "认证 Cookie：", text: "通常会在 30 天无活动后过期" },
    ],
    updatesBody:
      "我们可能会不时更新本 Cookie 政策，以反映实践变化或出于运营、法律或监管原因。若有重大变更，我们会在本页发布更新后的政策，并附上新的“最后更新”日期。",
    contactIntro:
      "如果你对我们使用 Cookie 的方式或本 Cookie 政策有疑问，请通过以下方式联系我们：",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();

  return {
    title: t("legal.cookieMetaTitle"),
    description: t("legal.cookieMetaDescription"),
  };
}

export default async function CookiePolicyPage() {
  const { locale, t } = await getServerI18n();
  const copy = cookieCopy[getTierOneLocale(locale)];

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
            🍪
          </span>
        </div>
        <div>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-0 text-[#34445C] dark:text-[#F5F0E1]">
            {t("legal.cookiePolicy")}
          </h1>
          <p className="text-[#FF4654] dark:text-[#DCFF37] text-sm lg:text-base mt-1">
            {t("legal.lastUpdated", {
              date: formatLocalizedDate("2024-12-06", locale),
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
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-6">
          {copy.titles[1]}
        </h2>

        <h3 className="text-lg lg:text-xl font-medium mb-3 text-[#34445C] dark:text-[#F5F0E1]">
          {copy.subtitles[0]}
        </h3>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.essentialDescription}
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-6 space-y-2 text-base lg:text-lg">
          {copy.essentialItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h3 className="text-lg lg:text-xl font-medium mb-3 text-[#34445C] dark:text-[#F5F0E1]">
          {copy.subtitles[1]}
        </h3>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.functionalDescription}
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-6 space-y-2 text-base lg:text-lg">
          {copy.functionalItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h3 className="text-lg lg:text-xl font-medium mb-3 text-[#34445C] dark:text-[#F5F0E1]">
          {copy.subtitles[2]}
        </h3>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.analyticsDescription}
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-6 space-y-2 text-base lg:text-lg">
          {copy.analyticsItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h3 className="text-lg lg:text-xl font-medium mb-3 text-[#34445C] dark:text-[#F5F0E1]">
          {copy.subtitles[3]}
        </h3>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.marketingDescription}
        </p>
        <ul className="list-disc pl-6 text-default-600 space-y-2 text-base lg:text-lg">
          {copy.marketingItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[2]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.thirdPartyIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 space-y-2 text-base lg:text-lg">
          {copy.thirdPartyItems.map((item) => (
            <li key={item.label}>
              <strong className="text-[#34445C] dark:text-[#F5F0E1]">
                {item.label}
              </strong>{" "}
              {item.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[3]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.managingIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-3 text-base lg:text-lg">
          {copy.managingItems.map((item) => (
            <li key={item.label}>
              <strong className="text-[#34445C] dark:text-[#F5F0E1]">
                {item.label}
              </strong>{" "}
              {item.text}
            </li>
          ))}
        </ul>
        <p className="text-default-600 text-base lg:text-lg">
          {copy.managingNote}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[4]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.retentionIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 space-y-2 text-base lg:text-lg">
          {copy.retentionItems.map((item) => (
            <li key={item.label}>
              <strong className="text-[#34445C] dark:text-[#F5F0E1]">
                {item.label}
              </strong>{" "}
              {item.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[5]}
        </h2>
        <p className="text-default-600 text-base lg:text-lg leading-relaxed">
          {copy.updatesBody}
        </p>
      </section>

      <section>
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[6]}
        </h2>
        <p className="text-default-600 text-base lg:text-lg">
          {copy.contactIntro}{" "}
          <a
            href="mailto:privacy@leetgaming.pro"
            className="text-[#FF4654] dark:text-[#DCFF37] hover:underline"
          >
            privacy@leetgaming.pro
          </a>
        </p>
      </section>
    </article>
  );
}
