import type { TierOneLocale } from "@/lib/i18n";

export const investorSubNavCopy = {
  "en-US": {
    overview: "Overview",
    deck: "Pitch Deck",
    updates: "Updates",
  },
  "pt-BR": {
    overview: "Visão Geral",
    deck: "Pitch Deck",
    updates: "Atualizações",
  },
  "es-ES": {
    overview: "Resumen",
    deck: "Pitch Deck",
    updates: "Actualizaciones",
  },
  "es-LA": {
    overview: "Resumen",
    deck: "Pitch Deck",
    updates: "Actualizaciones",
  },
  "zh-CN": {
    overview: "概览",
    deck: "演示文稿",
    updates: "更新",
  },
} satisfies Record<
  TierOneLocale,
  { overview: string; deck: string; updates: string }
>;

export const investorPdfButtonCopy = {
  "en-US": {
    downloadOnePager: "Download One-Pager",
    generatingPdf: "Generating PDF…",
  },
  "pt-BR": {
    downloadOnePager: "Baixar One-Pager",
    generatingPdf: "Gerando PDF…",
  },
  "es-ES": {
    downloadOnePager: "Descargar One-Pager",
    generatingPdf: "Generando PDF…",
  },
  "es-LA": {
    downloadOnePager: "Descargar One-Pager",
    generatingPdf: "Generando PDF…",
  },
  "zh-CN": {
    downloadOnePager: "下载单页简介",
    generatingPdf: "正在生成 PDF…",
  },
} satisfies Record<
  TierOneLocale,
  { downloadOnePager: string; generatingPdf: string }
>;

export const investorEmailModalCopy = {
  "en-US": {
    thankYou: "Thank you! Your download has started.",
    followUp: "We'll be in touch soon.",
    title: "Download Investor Brief",
    subtitle:
      "Get the one-pager covering market, projections, and verified score infrastructure",
    emailLabel: "Email",
    emailPlaceholder: "investor@example.com",
    nameLabel: "Name",
    namePlaceholder: "Your name (optional)",
    organizationLabel: "Organization",
    organizationPlaceholder: "Fund / Company (optional)",
    submit: "Submit & Download",
    skip: "Skip — download without providing info",
    fallbackError:
      "We could not submit your details right now. Your download will still continue.",
  },
  "pt-BR": {
    thankYou: "Obrigado! Seu download começou.",
    followUp: "Entraremos em contato em breve.",
    title: "Baixar Resumo para Investidores",
    subtitle:
      "Receba o one-pager com mercado, projeções e infraestrutura de pontuação verificada",
    emailLabel: "E-mail",
    emailPlaceholder: "investor@example.com",
    nameLabel: "Nome",
    namePlaceholder: "Seu nome (opcional)",
    organizationLabel: "Organização",
    organizationPlaceholder: "Fundo / Empresa (opcional)",
    submit: "Enviar e baixar",
    skip: "Pular — baixar sem informar dados",
    fallbackError:
      "Não foi possível enviar seus dados agora. O download continuará assim mesmo.",
  },
  "es-ES": {
    thankYou: "¡Gracias! Tu descarga ha comenzado.",
    followUp: "Nos pondremos en contacto pronto.",
    title: "Descargar resumen para inversores",
    subtitle:
      "Obtén el one-pager con mercado, proyecciones e infraestructura de puntuación verificada",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "investor@example.com",
    nameLabel: "Nombre",
    namePlaceholder: "Tu nombre (opcional)",
    organizationLabel: "Organización",
    organizationPlaceholder: "Fondo / Empresa (opcional)",
    submit: "Enviar y descargar",
    skip: "Omitir — descargar sin facilitar datos",
    fallbackError:
      "No pudimos enviar tus datos ahora mismo. La descarga continuará igualmente.",
  },
  "es-LA": {
    thankYou: "¡Gracias! Tu descarga ya comenzó.",
    followUp: "Nos pondremos en contacto pronto.",
    title: "Descargar resumen para inversionistas",
    subtitle:
      "Obtén el one-pager con mercado, proyecciones e infraestructura de puntuación verificada",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "investor@example.com",
    nameLabel: "Nombre",
    namePlaceholder: "Tu nombre (opcional)",
    organizationLabel: "Organización",
    organizationPlaceholder: "Fondo / Empresa (opcional)",
    submit: "Enviar y descargar",
    skip: "Omitir — descargar sin compartir datos",
    fallbackError:
      "No pudimos enviar tus datos en este momento. La descarga continuará de todos modos.",
  },
  "zh-CN": {
    thankYou: "感谢！下载已开始。",
    followUp: "我们会尽快与您联系。",
    title: "下载投资者简介",
    subtitle: "获取涵盖市场、预测和经验证比分基础设施的单页简介",
    emailLabel: "电子邮箱",
    emailPlaceholder: "investor@example.com",
    nameLabel: "姓名",
    namePlaceholder: "您的姓名（可选）",
    organizationLabel: "机构",
    organizationPlaceholder: "基金 / 公司（可选）",
    submit: "提交并下载",
    skip: "跳过——直接下载",
    fallbackError: "目前无法提交您的信息。下载仍会继续。",
  },
} satisfies Record<
  TierOneLocale,
  {
    thankYou: string;
    followUp: string;
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    organizationLabel: string;
    organizationPlaceholder: string;
    submit: string;
    skip: string;
    fallbackError: string;
  }
>;

export const competitiveMatrixCopy = {
  "en-US": {
    feature: "Feature",
    featureCountSuffix: "supported",
    features: [
      "Replay Analysis",
      "Skill Matchmaking",
      "Prize Distribution",
      "Multi-Game",
      "Freemium Model",
      "Blockchain Verified",
    ],
  },
  "pt-BR": {
    feature: "Recurso",
    featureCountSuffix: "com suporte",
    features: [
      "Análise de Replay",
      "Matchmaking por habilidade",
      "Distribuição de prêmios",
      "Multijogo",
      "Modelo freemium",
      "Verificação em blockchain",
    ],
  },
  "es-ES": {
    feature: "Función",
    featureCountSuffix: "compatibles",
    features: [
      "Análisis de replay",
      "Matchmaking por habilidad",
      "Distribución de premios",
      "Multijuego",
      "Modelo freemium",
      "Verificación en blockchain",
    ],
  },
  "es-LA": {
    feature: "Función",
    featureCountSuffix: "compatibles",
    features: [
      "Análisis de replay",
      "Matchmaking por habilidad",
      "Distribución de premios",
      "Multijuego",
      "Modelo freemium",
      "Verificación en blockchain",
    ],
  },
  "zh-CN": {
    feature: "功能",
    featureCountSuffix: "项支持",
    features: [
      "回放分析",
      "技能匹配",
      "奖金分发",
      "多游戏",
      "免费增值模式",
      "区块链验证",
    ],
  },
} satisfies Record<
  TierOneLocale,
  { feature: string; featureCountSuffix: string; features: string[] }
>;

export const roadmapTimelineCopy = {
  "en-US": {
    completed: "Completed",
    inProgress: "In Progress",
    upcoming: "Upcoming",
    phases: [
      {
        phase: "Phase 1",
        title: "Production Stabilization",
        period: "Q4 2025",
        items: [
          "Infrastructure & CI/CD pipelines",
          "Authentication (Steam & Google OAuth)",
          "Core API architecture & MongoDB",
          "Monitoring with Prometheus & Grafana",
        ],
        kpis: ["95% Infrastructure completion", "90% Auth completion"],
      },
      {
        phase: "Phase 2",
        title: "Core Feature Completion",
        period: "Q1 2026",
        items: [
          "Skill-based matchmaking live",
          "Tournament system with brackets",
          "Stripe payment integration",
          "Wallet & escrow system",
        ],
        kpis: ["10,000 registered users", "$50K monthly transaction volume"],
      },
      {
        phase: "Phase 3",
        title: "Blockchain Integration",
        period: "Q1–Q2 2026",
        items: [
          "On-chain prize pool verification",
          "Transparent prize distribution (Polygon/Base)",
          "Wallet connect & crypto payments",
          "Smart contract audit & deployment",
        ],
        kpis: ["100 prize pools created", "Blockchain verification live"],
      },
      {
        phase: "Phase 4",
        title: "Scale & Expansion",
        period: "Q2–Q3 2026",
        items: [
          "Multi-region deployment (LATAM, SEA, MENA)",
          "Mobile companion app",
          "Coaching marketplace launch",
          "Multi-game expansion (Valorant, PUBG)",
        ],
        kpis: [
          "500,000 registered users",
          "$2.5M monthly transaction volume",
          "100K Monthly Active Competitors",
        ],
      },
    ],
  },
  "pt-BR": {
    completed: "Concluído",
    inProgress: "Em andamento",
    upcoming: "Em breve",
    phases: [
      {
        phase: "Fase 1",
        title: "Estabilização de produção",
        period: "Q4 2025",
        items: [
          "Infraestrutura e pipelines de CI/CD",
          "Autenticação (Steam e Google OAuth)",
          "Arquitetura principal de API e MongoDB",
          "Monitoramento com Prometheus e Grafana",
        ],
        kpis: [
          "95% da infraestrutura concluída",
          "90% da autenticação concluída",
        ],
      },
      {
        phase: "Fase 2",
        title: "Conclusão dos recursos principais",
        period: "Q1 2026",
        items: [
          "Matchmaking por habilidade ao vivo",
          "Sistema de torneios com brackets",
          "Integração de pagamentos com Stripe",
          "Carteira e sistema de escrow",
        ],
        kpis: ["10.000 usuários registrados", "US$ 50 mil em volume mensal"],
      },
      {
        phase: "Fase 3",
        title: "Integração blockchain",
        period: "Q1–Q2 2026",
        items: [
          "Verificação on-chain de prize pools",
          "Distribuição transparente de prêmios (Polygon/Base)",
          "Conexão de carteira e pagamentos em cripto",
          "Auditoria e deploy de smart contracts",
        ],
        kpis: ["100 prize pools criados", "Verificação em blockchain ativa"],
      },
      {
        phase: "Fase 4",
        title: "Escala e expansão",
        period: "Q2–Q3 2026",
        items: [
          "Deploy multirregional (LATAM, SEA, MENA)",
          "Aplicativo móvel complementar",
          "Lançamento do marketplace de coaching",
          "Expansão multijogo (Valorant, PUBG)",
        ],
        kpis: [
          "500.000 usuários registrados",
          "US$ 2,5 milhões em volume mensal",
          "100 mil competidores ativos mensais",
        ],
      },
    ],
  },
  "es-ES": {
    completed: "Completado",
    inProgress: "En progreso",
    upcoming: "Próximamente",
    phases: [
      {
        phase: "Fase 1",
        title: "Estabilización de producción",
        period: "Q4 2025",
        items: [
          "Infraestructura y pipelines de CI/CD",
          "Autenticación (Steam y Google OAuth)",
          "Arquitectura central de API y MongoDB",
          "Monitorización con Prometheus y Grafana",
        ],
        kpis: [
          "95% de infraestructura completada",
          "90% de autenticación completada",
        ],
      },
      {
        phase: "Fase 2",
        title: "Finalización de funciones principales",
        period: "Q1 2026",
        items: [
          "Matchmaking por habilidad en vivo",
          "Sistema de torneos con brackets",
          "Integración de pagos con Stripe",
          "Billetera y sistema de escrow",
        ],
        kpis: ["10.000 usuarios registrados", "50.000 $ de volumen mensual"],
      },
      {
        phase: "Fase 3",
        title: "Integración blockchain",
        period: "Q1–Q2 2026",
        items: [
          "Verificación on-chain de prize pools",
          "Distribución transparente de premios (Polygon/Base)",
          "Conexión de wallet y pagos cripto",
          "Auditoría y despliegue de smart contracts",
        ],
        kpis: ["100 prize pools creados", "Verificación blockchain activa"],
      },
      {
        phase: "Fase 4",
        title: "Escala y expansión",
        period: "Q2–Q3 2026",
        items: [
          "Despliegue multirregión (LATAM, SEA, MENA)",
          "Aplicación móvil complementaria",
          "Lanzamiento del marketplace de coaching",
          "Expansión multijuego (Valorant, PUBG)",
        ],
        kpis: [
          "500.000 usuarios registrados",
          "2,5 M$ de volumen mensual",
          "100.000 competidores activos mensuales",
        ],
      },
    ],
  },
  "es-LA": {
    completed: "Completado",
    inProgress: "En progreso",
    upcoming: "Próximamente",
    phases: [
      {
        phase: "Fase 1",
        title: "Estabilización de producción",
        period: "Q4 2025",
        items: [
          "Infraestructura y pipelines de CI/CD",
          "Autenticación (Steam y Google OAuth)",
          "Arquitectura central de API y MongoDB",
          "Monitoreo con Prometheus y Grafana",
        ],
        kpis: [
          "95% de infraestructura completada",
          "90% de autenticación completada",
        ],
      },
      {
        phase: "Fase 2",
        title: "Cierre de funciones principales",
        period: "Q1 2026",
        items: [
          "Matchmaking por habilidad en vivo",
          "Sistema de torneos con brackets",
          "Integración de pagos con Stripe",
          "Wallet y sistema de escrow",
        ],
        kpis: ["10,000 usuarios registrados", "US$ 50 mil de volumen mensual"],
      },
      {
        phase: "Fase 3",
        title: "Integración blockchain",
        period: "Q1–Q2 2026",
        items: [
          "Verificación on-chain de prize pools",
          "Distribución transparente de premios (Polygon/Base)",
          "Conexión de wallet y pagos cripto",
          "Auditoría y despliegue de smart contracts",
        ],
        kpis: ["100 prize pools creados", "Verificación blockchain activa"],
      },
      {
        phase: "Fase 4",
        title: "Escala y expansión",
        period: "Q2–Q3 2026",
        items: [
          "Despliegue multirregión (LATAM, SEA, MENA)",
          "App móvil complementaria",
          "Lanzamiento del marketplace de coaching",
          "Expansión multijuego (Valorant, PUBG)",
        ],
        kpis: [
          "500,000 usuarios registrados",
          "US$ 2.5 M de volumen mensual",
          "100 mil competidores activos mensuales",
        ],
      },
    ],
  },
  "zh-CN": {
    completed: "已完成",
    inProgress: "进行中",
    upcoming: "即将到来",
    phases: [
      {
        phase: "阶段 1",
        title: "生产稳定化",
        period: "2025 年 Q4",
        items: [
          "基础设施与 CI/CD 流水线",
          "身份验证（Steam 与 Google OAuth）",
          "核心 API 架构与 MongoDB",
          "Prometheus 与 Grafana 监控",
        ],
        kpis: ["基础设施完成度 95%", "认证完成度 90%"],
      },
      {
        phase: "阶段 2",
        title: "核心功能完成",
        period: "2026 年 Q1",
        items: [
          "基于技能的匹配已上线",
          "带 brackets 的赛事系统",
          "Stripe 支付集成",
          "钱包与托管系统",
        ],
        kpis: ["注册用户 10,000", "月交易量 5 万美元"],
      },
      {
        phase: "阶段 3",
        title: "区块链集成",
        period: "2026 年 Q1–Q2",
        items: [
          "链上奖金池验证",
          "透明奖金分发（Polygon/Base）",
          "钱包连接与加密支付",
          "智能合约审计与部署",
        ],
        kpis: ["创建 100 个奖金池", "区块链验证上线"],
      },
      {
        phase: "阶段 4",
        title: "规模化与扩张",
        period: "2026 年 Q2–Q3",
        items: [
          "多区域部署（LATAM、SEA、MENA）",
          "移动伴侣应用",
          "教练市场上线",
          "多游戏扩展（Valorant、PUBG）",
        ],
        kpis: [
          "注册用户 500,000",
          "月交易量 250 万美元",
          "月活竞技用户 100,000",
        ],
      },
    ],
  },
} satisfies Record<
  TierOneLocale,
  {
    completed: string;
    inProgress: string;
    upcoming: string;
    phases: Array<{
      phase: string;
      title: string;
      period: string;
      items: string[];
      kpis: string[];
    }>;
  }
>;

export const productStatusCopy = {
  "en-US": {
    platformReadiness: "Platform Readiness",
    liveProgress: "Live progress across all systems",
    overall: "Overall",
    complete: "Complete",
    statuses: { live: "Live", beta: "Beta", active: "Active", dev: "In Dev" },
  },
  "pt-BR": {
    platformReadiness: "Prontidão da plataforma",
    liveProgress: "Progresso ao vivo em todos os sistemas",
    overall: "Geral",
    complete: "Concluído",
    statuses: {
      live: "Ao vivo",
      beta: "Beta",
      active: "Ativo",
      dev: "Em desenvolvimento",
    },
  },
  "es-ES": {
    platformReadiness: "Estado de la plataforma",
    liveProgress: "Progreso en vivo en todos los sistemas",
    overall: "General",
    complete: "Completado",
    statuses: {
      live: "En vivo",
      beta: "Beta",
      active: "Activo",
      dev: "En desarrollo",
    },
  },
  "es-LA": {
    platformReadiness: "Estado de la plataforma",
    liveProgress: "Progreso en vivo en todos los sistemas",
    overall: "General",
    complete: "Completado",
    statuses: {
      live: "En vivo",
      beta: "Beta",
      active: "Activo",
      dev: "En desarrollo",
    },
  },
  "zh-CN": {
    platformReadiness: "平台就绪度",
    liveProgress: "所有系统的实时进展",
    overall: "总体",
    complete: "完成",
    statuses: {
      live: "已上线",
      beta: "测试版",
      active: "进行中",
      dev: "开发中",
    },
  },
} satisfies Record<
  TierOneLocale,
  {
    platformReadiness: string;
    liveProgress: string;
    overall: string;
    complete: string;
    statuses: Record<"live" | "beta" | "active" | "dev", string>;
  }
>;

export const successMetricsCopy = {
  "en-US": {
    northStar: "NORTH STAR",
    year1: "Year 1",
    successMetric: "Success Metric",
    month6: "Month 6",
    month12: "Month 12",
    month6Short: "6mo:",
    month12Short: "12mo:",
  },
  "pt-BR": {
    northStar: "NORTE",
    year1: "Ano 1",
    successMetric: "Métrica de sucesso",
    month6: "Mês 6",
    month12: "Mês 12",
    month6Short: "6m:",
    month12Short: "12m:",
  },
  "es-ES": {
    northStar: "MÉTRICA NORTE",
    year1: "Año 1",
    successMetric: "Métrica de éxito",
    month6: "Mes 6",
    month12: "Mes 12",
    month6Short: "6m:",
    month12Short: "12m:",
  },
  "es-LA": {
    northStar: "MÉTRICA NORTE",
    year1: "Año 1",
    successMetric: "Métrica de éxito",
    month6: "Mes 6",
    month12: "Mes 12",
    month6Short: "6m:",
    month12Short: "12m:",
  },
  "zh-CN": {
    northStar: "北极星指标",
    year1: "第 1 年",
    successMetric: "成功指标",
    month6: "第 6 个月",
    month12: "第 12 个月",
    month6Short: "6 月:",
    month12Short: "12 月:",
  },
} satisfies Record<
  TierOneLocale,
  {
    northStar: string;
    year1: string;
    successMetric: string;
    month6: string;
    month12: string;
    month6Short: string;
    month12Short: string;
  }
>;

export const useOfFundsCopy = {
  "en-US": { title: "Use of Funds" },
  "pt-BR": { title: "Uso dos recursos" },
  "es-ES": { title: "Uso de fondos" },
  "es-LA": { title: "Uso de fondos" },
  "zh-CN": { title: "资金用途" },
} satisfies Record<TierOneLocale, { title: string }>;
