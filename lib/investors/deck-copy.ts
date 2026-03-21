import type { TierOneLocale } from "@/lib/i18n";

type DeckSlideCopy = {
  slides: {
    cover: {
      title: string;
      subtitle: string;
      stats: Array<{ value: string; label: string }>;
    };
    problem: {
      badge: string;
      title: string;
      body: string;
      items: Array<{ title: string; desc: string }>;
    };
    solution: {
      badge: string;
      title: string;
      body: string;
      items: Array<{ label: string; desc: string }>;
    };
    moat: {
      badge: string;
      title: string;
      body: string;
      items: Array<{ title: string; desc: string }>;
      stats: Array<{ value: string; label: string }>;
    };
    leverage: {
      badge: string;
      title: string;
      body: string;
      items: Array<{ title: string; desc: string }>;
      takeawayLabel: string;
      takeaway: string;
    };
    market: {
      badge: string;
      titlePrefix: string;
      titleSuffix: string;
      body: string;
      segments: Array<{ label: string; value: string; growth: string }>;
    };
    revenue: {
      badge: string;
      title: string;
      expansionLabel: string;
      expansionBody: string;
      split: string[];
      streams: Array<{ title: string; desc: string }>;
    };
    competitive: {
      badge: string;
      title: string;
      body: string;
      featureLabel: string;
      features: string[];
    };
    traction: {
      badge: string;
      title: string;
      body: string;
      items: Array<{ label: string; pct: number }>;
    };
    financials: {
      badge: string;
      title: string;
      scenarios: Array<{ scenario: string; mrr: string }>;
      mrrTarget: string;
      stats: Array<{ value: string; label: string }>;
    };
    roadmap: {
      badge: string;
      title: string;
      phases: Array<{
        label: string;
        title: string;
        period: string;
        status: string;
        items: string;
      }>;
    };
    team: {
      badge: string;
      title: string;
      founderRole: string;
      founderBody: string;
      advisorRoles: string[];
      openPosition: string;
      growth: string;
    };
    timing: {
      badge: string;
      titlePrefix: string;
      titleAccent: string;
      reasons: string[];
    };
    cta: { title: string; accent: string; body: string; meeting: string };
  };
  nav: {
    prev: string;
    next: string;
    enterPresentation: string;
    exitPresentation: string;
    goToSlide: string;
  };
};

export const investorDeckCopy = {
  "en-US": {
    slides: {
      cover: {
        title:
          "The all-in-one esports competition platform powered by verified score intelligence",
        subtitle: "Compete · Analyze · Earn",
        stats: [
          { value: "$21.9B", label: "TAM" },
          { value: "63M+", label: "Players" },
          { value: "5:1–15:1", label: "LTV:CAC" },
        ],
      },
      problem: {
        badge: "THE PROBLEM",
        title: "Competitive Gamers Deserve Better",
        body: "63 million players. No single platform serves them end-to-end.",
        items: [
          {
            title: "Fragmented Tools",
            desc: "Players juggle 4-5 separate apps for analytics, matchmaking, tournaments, and earnings.",
          },
          {
            title: "No Trust in Prizes",
            desc: "Prize distribution is opaque — late payments, disputes, and no verification.",
          },
          {
            title: "Regional Exclusion",
            desc: "LATAM, SEA, MENA — massive player bases, zero local platforms with fair payouts.",
          },
          {
            title: "Skill Gap",
            desc: "No affordable path from casual play to professional competition.",
          },
        ],
      },
      solution: {
        badge: "THE SOLUTION",
        title: "One Platform. Full Stack.",
        body: "The first platform integrating analytics, competition, and earning into a single ecosystem.",
        items: [
          {
            label: "AI Replay Analysis",
            desc: "Deep performance insights from every match",
          },
          {
            label: "Skill-Based Matchmaking",
            desc: "Fair, competitive matches via Elo/Glicko",
          },
          {
            label: "Verified Scores",
            desc: "Trusted result verification for payouts, rankings, and disputes",
          },
          {
            label: "Transparent Prizes",
            desc: "Escrow and payout flows triggered by trusted outcomes",
          },
        ],
      },
      moat: {
        badge: "CORE MOAT",
        title: "Verified Scores Are the Trust Engine",
        body: "In esports, the hardest problem is not displaying a score. It is proving a result strongly enough that money, rankings, and external ecosystems can rely on it.",
        items: [
          {
            title: "Multi-Source Ingestion",
            desc: "Scores aggregate from 6 external providers instead of relying on a single opaque source.",
          },
          {
            title: "Consensus Verification",
            desc: "Weighted validation and dispute windows create a financial-grade result lifecycle.",
          },
          {
            title: "Outcome Settlement",
            desc: "Verified results can safely trigger prize distribution, ranking changes, and reward logic.",
          },
        ],
        stats: [
          { value: "6", label: "Providers" },
          { value: "72h", label: "Dispute Window" },
          { value: "2", label: "Chain Targets" },
        ],
      },
      leverage: {
        badge: "PLATFORM LEVERAGE",
        title: "One Score Layer. Multiple Markets.",
        body: "The same score infrastructure that powers our own product can become a reusable B2B surface for external ecosystems.",
        items: [
          {
            title: "LeetGaming Core Product",
            desc: "Matchmaking, rankings, disputes, and payouts all become more trusted when results are verified.",
          },
          {
            title: "Prediction & Wager Rails",
            desc: "Verified outcomes can resolve prediction markets and skill-based wagering products with less manual adjudication.",
          },
          {
            title: "Partner Infrastructure",
            desc: "External tournaments, publishers, and community operators can embed score intelligence instead of rebuilding it.",
          },
        ],
        takeawayLabel: "Investor takeaway",
        takeaway:
          "Scores are both a product moat and a future infrastructure business.",
      },
      market: {
        badge: "MARKET OPPORTUNITY",
        titlePrefix: "$21.9B",
        titleSuffix: "Total Addressable Market",
        body: "Across five converging market segments",
        segments: [
          { label: "Esports", value: "$1.86B", growth: "8.1%" },
          { label: "Analytics", value: "$2.1B", growth: "23.7%" },
          { label: "Prediction & Wagering", value: "$16B", growth: "15%" },
          { label: "Coaching", value: "$1.5B", growth: "12%" },
          { label: "Tournaments", value: "$450M", growth: "18%" },
        ],
      },
      revenue: {
        badge: "REVENUE",
        title: "Four Revenue Streams",
        expansionLabel: "Expansion line",
        expansionBody:
          "Verified score intelligence also creates a future infrastructure surface for partner tournaments, prediction products, and external competition ecosystems.",
        split: ["Subs 40%", "Tx / Escrow 30%", "Value-Add 20%", "Ads 10%"],
        streams: [
          {
            title: "Subscriptions",
            desc: "Free / Pro / Team tiers — analytics, matchmaking, team management",
          },
          {
            title: "Wager Rake (5–10%)",
            desc: "Platform fee on skill-based wager matches with verified scores and transparent escrow",
          },
          {
            title: "Tournament Fees",
            desc: "Hosting fees & entry commissions with automated bracket management",
          },
          {
            title: "Coaching Marketplace",
            desc: "Commission connecting players with verified pro coaches",
          },
        ],
      },
      competitive: {
        badge: "COMPETITIVE EDGE",
        title: "Only Full-Stack + Verified Score Solution",
        body: "Competitors can own pieces of the workflow. None combine analytics, competition, monetization, and score verification into a single system.",
        featureLabel: "Feature",
        features: [
          "Replay Analysis",
          "Skill Matchmaking",
          "Verified Scores",
          "Prize Distribution",
          "Multi-Game",
          "Partner APIs",
        ],
      },
      traction: {
        badge: "TRACTION",
        title: "Built & Shipping",
        body: "Not a concept deck — a production-oriented platform with real product, payout, and score-verification infrastructure.",
        items: [
          { label: "Infrastructure", pct: 95 },
          { label: "Frontend", pct: 93 },
          { label: "Auth & Billing", pct: 90 },
          { label: "Backend Services", pct: 85 },
          { label: "Wallet System", pct: 85 },
          { label: "Payments", pct: 80 },
          { label: "Testing", pct: 50 },
          { label: "Blockchain", pct: 30 },
        ],
      },
      financials: {
        badge: "FINANCIALS",
        title: "Revenue Projections",
        scenarios: [
          { scenario: "Conservative", mrr: "$90K" },
          { scenario: "Moderate", mrr: "$400K" },
          { scenario: "Aggressive", mrr: "$1.8M" },
        ],
        mrrTarget: "MRR Target",
        stats: [
          { value: "$5–15", label: "CAC" },
          { value: "$50–200", label: "LTV" },
          { value: "2–4 mo", label: "Payback" },
          { value: "5:1–15:1", label: "LTV:CAC" },
        ],
      },
      roadmap: {
        badge: "ROADMAP",
        title: "Path to Scale",
        phases: [
          {
            label: "Phase 1",
            title: "Production Stabilization",
            period: "Q4 2025",
            status: "✅ Complete",
            items: "Infra, auth, billing, replay engine",
          },
          {
            label: "Phase 2",
            title: "Core Feature Completion",
            period: "Q1 2026",
            status: "🔄 In Progress",
            items: "Tournaments, advanced analytics, verified score surfaces",
          },
          {
            label: "Phase 3",
            title: "Infrastructure Expansion",
            period: "Q1–Q2 2026",
            status: "⏳ Upcoming",
            items:
              "Partner APIs, external score rails, settlement integrations",
          },
          {
            label: "Phase 4",
            title: "Scale & Expansion",
            period: "Q2–Q3 2026",
            status: "⏳ Upcoming",
            items: "Multi-region, 500K users, $2.5M monthly volume",
          },
        ],
      },
      team: {
        badge: "TEAM",
        title: "Leadership",
        founderRole: "CTO & Founder",
        founderBody:
          "Former competitive FPS player. 15+ yrs software engineering. Enterprise distributed systems, blockchain, gaming infrastructure.",
        advisorRoles: [
          "Esports Advisor",
          "Technical Advisor",
          "Growth Advisor",
        ],
        openPosition: "Open Position",
        growth: "Growing from 4 → 20+ team members in 2026",
      },
      timing: {
        badge: "TIMING",
        titlePrefix: "Why",
        titleAccent: "Now",
        reasons: [
          "Esports viewership surpassing traditional sports demographics",
          "Underserved regions (LATAM, SEA, MENA) — massive player bases, zero local platforms",
          "Verified score infrastructure enables transparent payout, prediction, and partner integrations",
          "No platform integrates analytics + competition + verified scoring + earning — first mover advantage",
        ],
      },
      cta: {
        title: "Let's Build the Future of Esports",
        accent: "Together",
        body: "We're raising to accelerate platform completion, scale to 100K competitors, and turn verified scores into both a category-defining moat and a platform layer for the wider esports ecosystem.",
        meeting: "Schedule a Meeting",
      },
    },
    nav: {
      prev: "Prev",
      next: "Next",
      enterPresentation: "Enter presentation mode (F)",
      exitPresentation: "Exit presentation (Esc)",
      goToSlide: "Go to slide",
    },
  },
  "pt-BR": {
    slides: {
      cover: {
        title:
          "A plataforma completa de competições esports impulsionada por inteligência de pontuação verificada",
        subtitle: "Competir · Analisar · Ganhar",
        stats: [
          { value: "$21,9B", label: "TAM" },
          { value: "63M+", label: "Jogadores" },
          { value: "5:1–15:1", label: "LTV:CAC" },
        ],
      },
      problem: {
        badge: "O PROBLEMA",
        title: "Jogadores competitivos merecem mais",
        body: "63 milhões de jogadores. Nenhuma plataforma atende toda a jornada.",
        items: [
          {
            title: "Ferramentas fragmentadas",
            desc: "Jogadores precisam alternar entre 4 ou 5 apps para analytics, matchmaking, torneios e ganhos.",
          },
          {
            title: "Falta de confiança nos prêmios",
            desc: "A distribuição de prêmios é opaca — atrasos, disputas e falta de verificação.",
          },
          {
            title: "Exclusão regional",
            desc: "LATAM, SEA e MENA têm enormes bases de jogadores e nenhuma plataforma local com pagamentos justos.",
          },
          {
            title: "Gap de habilidade",
            desc: "Não existe um caminho acessível do casual ao profissional.",
          },
        ],
      },
      solution: {
        badge: "A SOLUÇÃO",
        title: "Uma plataforma. Stack completa.",
        body: "A primeira plataforma que integra analytics, competição e ganhos em um único ecossistema.",
        items: [
          {
            label: "Análise de replay com IA",
            desc: "Insights profundos de performance em cada partida",
          },
          {
            label: "Matchmaking por habilidade",
            desc: "Partidas justas e competitivas via Elo/Glicko",
          },
          {
            label: "Pontuações verificadas",
            desc: "Verificação confiável para pagamentos, rankings e disputas",
          },
          {
            label: "Prêmios transparentes",
            desc: "Escrow e pagamentos acionados por resultados confiáveis",
          },
        ],
      },
      moat: {
        badge: "MOAT CENTRAL",
        title: "Pontuações verificadas são o motor de confiança",
        body: "Nos esports, o problema mais difícil não é exibir um placar, mas provar um resultado com força suficiente para que dinheiro, rankings e ecossistemas externos possam confiar nele.",
        items: [
          {
            title: "Ingestão multi-origem",
            desc: "As pontuações agregam dados de 6 provedores externos em vez de depender de uma única fonte opaca.",
          },
          {
            title: "Verificação por consenso",
            desc: "Validação ponderada e janelas de disputa criam um ciclo de resultado com grau financeiro.",
          },
          {
            title: "Liquidação por resultado",
            desc: "Resultados verificados podem acionar com segurança distribuição de prêmios, mudanças de ranking e lógica de recompensas.",
          },
        ],
        stats: [
          { value: "6", label: "Provedores" },
          { value: "72h", label: "Janela de disputa" },
          { value: "2", label: "Alvos chain" },
        ],
      },
      leverage: {
        badge: "ALAVANCAGEM DA PLATAFORMA",
        title: "Uma camada de pontuação. Múltiplos mercados.",
        body: "A mesma infraestrutura de pontuação que alimenta nosso produto pode se tornar uma superfície B2B reutilizável para ecossistemas externos.",
        items: [
          {
            title: "Produto central da LeetGaming",
            desc: "Matchmaking, rankings, disputas e pagamentos ficam mais confiáveis quando os resultados são verificados.",
          },
          {
            title: "Trilhos para previsão e wagers",
            desc: "Resultados verificados podem resolver mercados de previsão e produtos de aposta por habilidade com menos adjudicação manual.",
          },
          {
            title: "Infraestrutura para parceiros",
            desc: "Torneios externos, publishers e operadores de comunidade podem embutir inteligência de pontuação sem reconstruí-la.",
          },
        ],
        takeawayLabel: "Leitura para investidores",
        takeaway:
          "As pontuações são ao mesmo tempo um moat de produto e um futuro negócio de infraestrutura.",
      },
      market: {
        badge: "OPORTUNIDADE DE MERCADO",
        titlePrefix: "$21,9B",
        titleSuffix: "de mercado endereçável total",
        body: "Em cinco segmentos de mercado convergentes",
        segments: [
          { label: "Esports", value: "$1,86B", growth: "8,1%" },
          { label: "Analytics", value: "$2,1B", growth: "23,7%" },
          { label: "Previsão e wagers", value: "$16B", growth: "15%" },
          { label: "Coaching", value: "$1,5B", growth: "12%" },
          { label: "Torneios", value: "$450M", growth: "18%" },
        ],
      },
      revenue: {
        badge: "RECEITA",
        title: "Quatro fontes de receita",
        expansionLabel: "Linha de expansão",
        expansionBody:
          "A inteligência de pontuação verificada também cria uma futura superfície de infraestrutura para torneios parceiros, produtos de previsão e ecossistemas competitivos externos.",
        split: [
          "Assinaturas 40%",
          "Tx / Escrow 30%",
          "Valor agregado 20%",
          "Ads 10%",
        ],
        streams: [
          {
            title: "Assinaturas",
            desc: "Free / Pro / Team — analytics, matchmaking e gestão de times",
          },
          {
            title: "Taxa sobre wagers (5–10%)",
            desc: "Taxa da plataforma em partidas com wagers por habilidade com pontuações verificadas e escrow transparente",
          },
          {
            title: "Taxas de torneio",
            desc: "Taxas de hospedagem e comissões de entrada com gestão automatizada de brackets",
          },
          {
            title: "Marketplace de coaching",
            desc: "Comissão conectando jogadores a coaches profissionais verificados",
          },
        ],
      },
      competitive: {
        badge: "VANTAGEM COMPETITIVA",
        title: "Única solução full-stack + pontuação verificada",
        body: "Concorrentes podem dominar partes do fluxo. Nenhum combina analytics, competição, monetização e verificação de pontuação em um único sistema.",
        featureLabel: "Recurso",
        features: [
          "Análise de replay",
          "Matchmaking por habilidade",
          "Pontuações verificadas",
          "Distribuição de prêmios",
          "Multijogo",
          "APIs para parceiros",
        ],
      },
      traction: {
        badge: "TRAÇÃO",
        title: "Construído e entregando",
        body: "Não é um deck conceitual — é uma plataforma orientada à produção com produto real, pagamentos e infraestrutura de verificação de pontuações.",
        items: [
          { label: "Infraestrutura", pct: 95 },
          { label: "Frontend", pct: 93 },
          { label: "Auth e billing", pct: 90 },
          { label: "Serviços backend", pct: 85 },
          { label: "Sistema de carteira", pct: 85 },
          { label: "Pagamentos", pct: 80 },
          { label: "Testes", pct: 50 },
          { label: "Blockchain", pct: 30 },
        ],
      },
      financials: {
        badge: "FINANCEIRO",
        title: "Projeções de receita",
        scenarios: [
          { scenario: "Conservador", mrr: "$90K" },
          { scenario: "Moderado", mrr: "$400K" },
          { scenario: "Agressivo", mrr: "$1,8M" },
        ],
        mrrTarget: "Meta de MRR",
        stats: [
          { value: "$5–15", label: "CAC" },
          { value: "$50–200", label: "LTV" },
          { value: "2–4 meses", label: "Payback" },
          { value: "5:1–15:1", label: "LTV:CAC" },
        ],
      },
      roadmap: {
        badge: "ROADMAP",
        title: "Caminho para escala",
        phases: [
          {
            label: "Fase 1",
            title: "Estabilização de produção",
            period: "Q4 2025",
            status: "✅ Concluído",
            items: "Infra, auth, billing e replay engine",
          },
          {
            label: "Fase 2",
            title: "Conclusão dos recursos centrais",
            period: "Q1 2026",
            status: "🔄 Em andamento",
            items:
              "Torneios, analytics avançado e superfícies de pontuação verificada",
          },
          {
            label: "Fase 3",
            title: "Expansão de infraestrutura",
            period: "Q1–Q2 2026",
            status: "⏳ Em breve",
            items:
              "APIs para parceiros, trilhos externos de pontuação e integrações de liquidação",
          },
          {
            label: "Fase 4",
            title: "Escala e expansão",
            period: "Q2–Q3 2026",
            status: "⏳ Em breve",
            items: "Multirregião, 500 mil usuários, US$ 2,5M de volume mensal",
          },
        ],
      },
      team: {
        badge: "TIME",
        title: "Liderança",
        founderRole: "CTO e Founder",
        founderBody:
          "Ex-jogador competitivo de FPS. 15+ anos em engenharia de software. Sistemas distribuídos enterprise, blockchain e infraestrutura gamer.",
        advisorRoles: [
          "Advisor de esports",
          "Advisor técnico",
          "Advisor de crescimento",
        ],
        openPosition: "Posição aberta",
        growth: "Crescendo de 4 → 20+ membros em 2026",
      },
      timing: {
        badge: "TIMING",
        titlePrefix: "Por que",
        titleAccent: "agora",
        reasons: [
          "A audiência de esports supera a demografia de muitos esportes tradicionais",
          "Regiões subatendidas (LATAM, SEA, MENA) — enormes bases de jogadores e nenhuma plataforma local",
          "A infraestrutura de pontuação verificada habilita pagamentos transparentes, previsão e integrações com parceiros",
          "Nenhuma plataforma integra analytics + competição + pontuação verificada + ganhos — vantagem de first mover",
        ],
      },
      cta: {
        title: "Vamos construir o futuro dos esports",
        accent: "juntos",
        body: "Estamos captando para acelerar a conclusão da plataforma, escalar para 100 mil competidores e transformar pontuações verificadas em um moat definidor de categoria e em uma camada de plataforma para o ecossistema global de esports.",
        meeting: "Agendar reunião",
      },
    },
    nav: {
      prev: "Anterior",
      next: "Próximo",
      enterPresentation: "Entrar no modo apresentação (F)",
      exitPresentation: "Sair da apresentação (Esc)",
      goToSlide: "Ir para o slide",
    },
  },
  "es-ES": {
    slides: {
      cover: {
        title:
          "La plataforma integral de competición esports impulsada por inteligencia de puntuación verificada",
        subtitle: "Competir · Analizar · Ganar",
        stats: [
          { value: "$21,9B", label: "TAM" },
          { value: "63M+", label: "Jugadores" },
          { value: "5:1–15:1", label: "LTV:CAC" },
        ],
      },
      problem: {
        badge: "EL PROBLEMA",
        title: "Los jugadores competitivos merecen algo mejor",
        body: "63 millones de jugadores. Ninguna plataforma cubre todo el recorrido.",
        items: [
          {
            title: "Herramientas fragmentadas",
            desc: "Los jugadores alternan entre 4 o 5 apps para analítica, matchmaking, torneos e ingresos.",
          },
          {
            title: "Sin confianza en los premios",
            desc: "La distribución de premios es opaca: pagos tardíos, disputas y falta de verificación.",
          },
          {
            title: "Exclusión regional",
            desc: "LATAM, SEA y MENA tienen enormes bases de jugadores y cero plataformas locales con pagos justos.",
          },
          {
            title: "Brecha de habilidad",
            desc: "No existe una ruta asequible del juego casual a la competición profesional.",
          },
        ],
      },
      solution: {
        badge: "LA SOLUCIÓN",
        title: "Una plataforma. Stack completo.",
        body: "La primera plataforma que integra analítica, competición e ingresos en un único ecosistema.",
        items: [
          {
            label: "Análisis de replay con IA",
            desc: "Insights profundos de rendimiento en cada partida",
          },
          {
            label: "Matchmaking por habilidad",
            desc: "Partidas justas y competitivas vía Elo/Glicko",
          },
          {
            label: "Puntuaciones verificadas",
            desc: "Verificación fiable para pagos, rankings y disputas",
          },
          {
            label: "Premios transparentes",
            desc: "Escrow y payouts activados por resultados fiables",
          },
        ],
      },
      moat: {
        badge: "MOAT CENTRAL",
        title: "Las puntuaciones verificadas son el motor de confianza",
        body: "En esports, el problema más difícil no es mostrar una puntuación, sino probar un resultado con suficiente fuerza como para que dinero, rankings y ecosistemas externos puedan confiar en él.",
        items: [
          {
            title: "Ingesta multifuente",
            desc: "Las puntuaciones agregan datos de 6 proveedores externos en lugar de depender de una única fuente opaca.",
          },
          {
            title: "Verificación por consenso",
            desc: "La validación ponderada y las ventanas de disputa crean un ciclo de resultados de grado financiero.",
          },
          {
            title: "Liquidación por resultado",
            desc: "Los resultados verificados pueden activar con seguridad la distribución de premios, cambios de ranking y lógica de recompensas.",
          },
        ],
        stats: [
          { value: "6", label: "Proveedores" },
          { value: "72h", label: "Ventana de disputa" },
          { value: "2", label: "Objetivos chain" },
        ],
      },
      leverage: {
        badge: "APALANCAMIENTO DE PLATAFORMA",
        title: "Una capa de puntuación. Múltiples mercados.",
        body: "La misma infraestructura de puntuación que impulsa nuestro producto puede convertirse en una superficie B2B reutilizable para ecosistemas externos.",
        items: [
          {
            title: "Producto core de LeetGaming",
            desc: "El matchmaking, los rankings, las disputas y los pagos ganan confianza cuando los resultados están verificados.",
          },
          {
            title: "Raíles de predicción y wager",
            desc: "Los resultados verificados pueden resolver mercados de predicción y productos de apuesta por habilidad con menos adjudicación manual.",
          },
          {
            title: "Infraestructura para partners",
            desc: "Torneos externos, publishers y operadores de comunidades pueden integrar inteligencia de puntuación sin reconstruirla.",
          },
        ],
        takeawayLabel: "Lectura para inversores",
        takeaway:
          "Las puntuaciones son a la vez un moat de producto y un futuro negocio de infraestructura.",
      },
      market: {
        badge: "OPORTUNIDAD DE MERCADO",
        titlePrefix: "$21,9B",
        titleSuffix: "de mercado total direccionable",
        body: "En cinco segmentos de mercado convergentes",
        segments: [
          { label: "Esports", value: "$1,86B", growth: "8,1%" },
          { label: "Analítica", value: "$2,1B", growth: "23,7%" },
          { label: "Predicción y wagering", value: "$16B", growth: "15%" },
          { label: "Coaching", value: "$1,5B", growth: "12%" },
          { label: "Torneos", value: "$450M", growth: "18%" },
        ],
      },
      revenue: {
        badge: "INGRESOS",
        title: "Cuatro fuentes de ingresos",
        expansionLabel: "Línea de expansión",
        expansionBody:
          "La inteligencia de puntuación verificada también crea una futura superficie de infraestructura para torneos asociados, productos de predicción y ecosistemas competitivos externos.",
        split: [
          "Suscripciones 40%",
          "Tx / Escrow 30%",
          "Valor añadido 20%",
          "Ads 10%",
        ],
        streams: [
          {
            title: "Suscripciones",
            desc: "Free / Pro / Team — analítica, matchmaking y gestión de equipos",
          },
          {
            title: "Comisión sobre wager (5–10%)",
            desc: "Comisión de plataforma en partidas con wager por habilidad con puntuaciones verificadas y escrow transparente",
          },
          {
            title: "Tarifas de torneos",
            desc: "Tarifas de hosting y comisiones de entrada con gestión automatizada de brackets",
          },
          {
            title: "Marketplace de coaching",
            desc: "Comisión conectando a jugadores con coaches profesionales verificados",
          },
        ],
      },
      competitive: {
        badge: "VENTAJA COMPETITIVA",
        title: "Única solución full-stack + puntuación verificada",
        body: "Los competidores pueden dominar partes del flujo. Ninguno combina analítica, competición, monetización y verificación de puntuaciones en un solo sistema.",
        featureLabel: "Función",
        features: [
          "Análisis de replay",
          "Matchmaking por habilidad",
          "Puntuaciones verificadas",
          "Distribución de premios",
          "Multijuego",
          "APIs para partners",
        ],
      },
      traction: {
        badge: "TRACCIÓN",
        title: "Construido y entregando",
        body: "No es un deck conceptual: es una plataforma orientada a producción con producto real, pagos e infraestructura de verificación de puntuaciones.",
        items: [
          { label: "Infraestructura", pct: 95 },
          { label: "Frontend", pct: 93 },
          { label: "Auth y billing", pct: 90 },
          { label: "Servicios backend", pct: 85 },
          { label: "Sistema de wallet", pct: 85 },
          { label: "Pagos", pct: 80 },
          { label: "Testing", pct: 50 },
          { label: "Blockchain", pct: 30 },
        ],
      },
      financials: {
        badge: "FINANZAS",
        title: "Proyecciones de ingresos",
        scenarios: [
          { scenario: "Conservador", mrr: "$90K" },
          { scenario: "Moderado", mrr: "$400K" },
          { scenario: "Agresivo", mrr: "$1,8M" },
        ],
        mrrTarget: "Objetivo de MRR",
        stats: [
          { value: "$5–15", label: "CAC" },
          { value: "$50–200", label: "LTV" },
          { value: "2–4 meses", label: "Payback" },
          { value: "5:1–15:1", label: "LTV:CAC" },
        ],
      },
      roadmap: {
        badge: "ROADMAP",
        title: "Camino hacia la escala",
        phases: [
          {
            label: "Fase 1",
            title: "Estabilización de producción",
            period: "Q4 2025",
            status: "✅ Completado",
            items: "Infra, auth, billing y replay engine",
          },
          {
            label: "Fase 2",
            title: "Cierre de funciones core",
            period: "Q1 2026",
            status: "🔄 En progreso",
            items:
              "Torneos, analítica avanzada y superficies de puntuación verificada",
          },
          {
            label: "Fase 3",
            title: "Expansión de infraestructura",
            period: "Q1–Q2 2026",
            status: "⏳ Próximamente",
            items:
              "APIs para partners, raíles externos de puntuación e integraciones de liquidación",
          },
          {
            label: "Fase 4",
            title: "Escala y expansión",
            period: "Q2–Q3 2026",
            status: "⏳ Próximamente",
            items: "Multirregión, 500 mil usuarios, 2,5 M$ de volumen mensual",
          },
        ],
      },
      team: {
        badge: "EQUIPO",
        title: "Liderazgo",
        founderRole: "CTO y Founder",
        founderBody:
          "Exjugador competitivo de FPS. Más de 15 años en ingeniería de software. Sistemas distribuidos enterprise, blockchain e infraestructura gaming.",
        advisorRoles: [
          "Advisor de esports",
          "Advisor técnico",
          "Advisor de crecimiento",
        ],
        openPosition: "Posición abierta",
        growth: "Creciendo de 4 → 20+ miembros en 2026",
      },
      timing: {
        badge: "TIMING",
        titlePrefix: "Por qué",
        titleAccent: "ahora",
        reasons: [
          "La audiencia de esports supera la demografía de muchos deportes tradicionales",
          "Regiones desatendidas (LATAM, SEA, MENA) con enormes bases de jugadores y ninguna plataforma local",
          "La infraestructura de puntuación verificada habilita payouts transparentes, predicción e integraciones con partners",
          "Ninguna plataforma integra analítica + competición + puntuación verificada + earning — ventaja de first mover",
        ],
      },
      cta: {
        title: "Construyamos el futuro de los esports",
        accent: "juntos",
        body: "Estamos levantando capital para acelerar la finalización de la plataforma, escalar hasta 100 mil competidores y convertir las puntuaciones verificadas tanto en un moat definitorio de categoría como en una capa de plataforma para el ecosistema global de esports.",
        meeting: "Programar reunión",
      },
    },
    nav: {
      prev: "Anterior",
      next: "Siguiente",
      enterPresentation: "Entrar en modo presentación (F)",
      exitPresentation: "Salir de la presentación (Esc)",
      goToSlide: "Ir a la diapositiva",
    },
  },
  "es-LA": {
    slides: {
      cover: {
        title:
          "La plataforma integral de competencias esports impulsada por inteligencia de puntuación verificada",
        subtitle: "Competir · Analizar · Ganar",
        stats: [
          { value: "$21.9B", label: "TAM" },
          { value: "63M+", label: "Jugadores" },
          { value: "5:1–15:1", label: "LTV:CAC" },
        ],
      },
      problem: {
        badge: "EL PROBLEMA",
        title: "Los jugadores competitivos merecen algo mejor",
        body: "63 millones de jugadores. Ninguna plataforma cubre toda la experiencia.",
        items: [
          {
            title: "Herramientas fragmentadas",
            desc: "Los jugadores saltan entre 4 o 5 apps para analítica, matchmaking, torneos e ingresos.",
          },
          {
            title: "Falta de confianza en los premios",
            desc: "La distribución de premios es opaca: pagos tardíos, disputas y sin verificación.",
          },
          {
            title: "Exclusión regional",
            desc: "LATAM, SEA y MENA tienen enormes bases de jugadores y cero plataformas locales con pagos justos.",
          },
          {
            title: "Brecha de habilidad",
            desc: "No existe un camino accesible del juego casual a la competencia profesional.",
          },
        ],
      },
      solution: {
        badge: "LA SOLUCIÓN",
        title: "Una plataforma. Stack completo.",
        body: "La primera plataforma que integra analítica, competencia e ingresos en un solo ecosistema.",
        items: [
          {
            label: "Análisis de replay con IA",
            desc: "Insights profundos de rendimiento en cada partida",
          },
          {
            label: "Matchmaking por habilidad",
            desc: "Partidas justas y competitivas vía Elo/Glicko",
          },
          {
            label: "Puntuaciones verificadas",
            desc: "Verificación confiable para pagos, rankings y disputas",
          },
          {
            label: "Premios transparentes",
            desc: "Escrow y payouts activados por resultados confiables",
          },
        ],
      },
      moat: {
        badge: "MOAT CENTRAL",
        title: "Las puntuaciones verificadas son el motor de confianza",
        body: "En esports, el problema más difícil no es mostrar una puntuación, sino probar un resultado con fuerza suficiente para que dinero, rankings y ecosistemas externos puedan confiar en él.",
        items: [
          {
            title: "Ingesta multi-fuente",
            desc: "Las puntuaciones agregan datos de 6 proveedores externos en lugar de depender de una sola fuente opaca.",
          },
          {
            title: "Verificación por consenso",
            desc: "La validación ponderada y las ventanas de disputa crean un ciclo de resultados con estándar financiero.",
          },
          {
            title: "Liquidación por resultado",
            desc: "Los resultados verificados pueden activar con seguridad la distribución de premios, cambios de ranking y lógica de recompensas.",
          },
        ],
        stats: [
          { value: "6", label: "Proveedores" },
          { value: "72h", label: "Ventana de disputa" },
          { value: "2", label: "Objetivos chain" },
        ],
      },
      leverage: {
        badge: "APALANCAMIENTO DE PLATAFORMA",
        title: "Una capa de puntuación. Múltiples mercados.",
        body: "La misma infraestructura de puntuación que impulsa nuestro producto puede convertirse en una superficie B2B reutilizable para ecosistemas externos.",
        items: [
          {
            title: "Producto core de LeetGaming",
            desc: "El matchmaking, los rankings, las disputas y los pagos ganan confianza cuando los resultados están verificados.",
          },
          {
            title: "Rieles para predicción y wager",
            desc: "Los resultados verificados pueden resolver mercados de predicción y productos de apuesta por habilidad con menos adjudicación manual.",
          },
          {
            title: "Infraestructura para partners",
            desc: "Torneos externos, publishers y operadores de comunidades pueden integrar inteligencia de puntuación sin reconstruirla.",
          },
        ],
        takeawayLabel: "Lectura para inversionistas",
        takeaway:
          "Las puntuaciones son al mismo tiempo un moat de producto y un futuro negocio de infraestructura.",
      },
      market: {
        badge: "OPORTUNIDAD DE MERCADO",
        titlePrefix: "$21.9B",
        titleSuffix: "de mercado total direccionable",
        body: "En cinco segmentos de mercado convergentes",
        segments: [
          { label: "Esports", value: "$1.86B", growth: "8.1%" },
          { label: "Analítica", value: "$2.1B", growth: "23.7%" },
          { label: "Predicción y wagering", value: "$16B", growth: "15%" },
          { label: "Coaching", value: "$1.5B", growth: "12%" },
          { label: "Torneos", value: "$450M", growth: "18%" },
        ],
      },
      revenue: {
        badge: "INGRESOS",
        title: "Cuatro fuentes de ingresos",
        expansionLabel: "Línea de expansión",
        expansionBody:
          "La inteligencia de puntuación verificada también crea una futura superficie de infraestructura para torneos aliados, productos de predicción y ecosistemas competitivos externos.",
        split: [
          "Suscripciones 40%",
          "Tx / Escrow 30%",
          "Valor agregado 20%",
          "Ads 10%",
        ],
        streams: [
          {
            title: "Suscripciones",
            desc: "Free / Pro / Team — analítica, matchmaking y gestión de equipos",
          },
          {
            title: "Comisión sobre wager (5–10%)",
            desc: "Comisión de la plataforma en partidas con wager por habilidad con puntuaciones verificadas y escrow transparente",
          },
          {
            title: "Tarifas de torneos",
            desc: "Tarifas de hosting y comisiones de entrada con gestión automatizada de brackets",
          },
          {
            title: "Marketplace de coaching",
            desc: "Comisión conectando jugadores con coaches profesionales verificados",
          },
        ],
      },
      competitive: {
        badge: "VENTAJA COMPETITIVA",
        title: "Única solución full-stack + puntuación verificada",
        body: "Los competidores pueden dominar partes del flujo. Ninguno combina analítica, competencia, monetización y verificación de puntuaciones en un solo sistema.",
        featureLabel: "Función",
        features: [
          "Análisis de replay",
          "Matchmaking por habilidad",
          "Puntuaciones verificadas",
          "Distribución de premios",
          "Multijuego",
          "APIs para partners",
        ],
      },
      traction: {
        badge: "TRACCIÓN",
        title: "Construido y entregando",
        body: "No es un deck conceptual: es una plataforma orientada a producción con producto real, pagos e infraestructura de verificación de puntuaciones.",
        items: [
          { label: "Infraestructura", pct: 95 },
          { label: "Frontend", pct: 93 },
          { label: "Auth y billing", pct: 90 },
          { label: "Servicios backend", pct: 85 },
          { label: "Sistema de wallet", pct: 85 },
          { label: "Pagos", pct: 80 },
          { label: "Testing", pct: 50 },
          { label: "Blockchain", pct: 30 },
        ],
      },
      financials: {
        badge: "FINANZAS",
        title: "Proyecciones de ingresos",
        scenarios: [
          { scenario: "Conservador", mrr: "$90K" },
          { scenario: "Moderado", mrr: "$400K" },
          { scenario: "Agresivo", mrr: "$1.8M" },
        ],
        mrrTarget: "Meta de MRR",
        stats: [
          { value: "$5–15", label: "CAC" },
          { value: "$50–200", label: "LTV" },
          { value: "2–4 meses", label: "Payback" },
          { value: "5:1–15:1", label: "LTV:CAC" },
        ],
      },
      roadmap: {
        badge: "ROADMAP",
        title: "Camino hacia la escala",
        phases: [
          {
            label: "Fase 1",
            title: "Estabilización de producción",
            period: "Q4 2025",
            status: "✅ Completado",
            items: "Infra, auth, billing y replay engine",
          },
          {
            label: "Fase 2",
            title: "Cierre de funciones core",
            period: "Q1 2026",
            status: "🔄 En progreso",
            items:
              "Torneos, analítica avanzada y superficies de puntuación verificada",
          },
          {
            label: "Fase 3",
            title: "Expansión de infraestructura",
            period: "Q1–Q2 2026",
            status: "⏳ Próximamente",
            items:
              "APIs para partners, rieles externos de puntuación e integraciones de liquidación",
          },
          {
            label: "Fase 4",
            title: "Escala y expansión",
            period: "Q2–Q3 2026",
            status: "⏳ Próximamente",
            items:
              "Multirregión, 500 mil usuarios, US$ 2.5M de volumen mensual",
          },
        ],
      },
      team: {
        badge: "EQUIPO",
        title: "Liderazgo",
        founderRole: "CTO y Founder",
        founderBody:
          "Exjugador competitivo de FPS. Más de 15 años en ingeniería de software. Sistemas distribuidos enterprise, blockchain e infraestructura gaming.",
        advisorRoles: [
          "Advisor de esports",
          "Advisor técnico",
          "Advisor de crecimiento",
        ],
        openPosition: "Posición abierta",
        growth: "Creciendo de 4 → 20+ integrantes en 2026",
      },
      timing: {
        badge: "TIMING",
        titlePrefix: "Por qué",
        titleAccent: "ahora",
        reasons: [
          "La audiencia de esports supera la demografía de muchos deportes tradicionales",
          "Regiones desatendidas (LATAM, SEA, MENA) con enormes bases de jugadores y ninguna plataforma local",
          "La infraestructura de puntuación verificada habilita payouts transparentes, predicción e integraciones con partners",
          "Ninguna plataforma integra analítica + competencia + puntuación verificada + earning — ventaja de first mover",
        ],
      },
      cta: {
        title: "Construyamos el futuro de los esports",
        accent: "juntos",
        body: "Estamos levantando capital para acelerar la finalización de la plataforma, escalar hasta 100 mil competidores y convertir las puntuaciones verificadas tanto en un moat definitorio de categoría como en una capa de plataforma para el ecosistema global de esports.",
        meeting: "Agendar reunión",
      },
    },
    nav: {
      prev: "Anterior",
      next: "Siguiente",
      enterPresentation: "Entrar en modo presentación (F)",
      exitPresentation: "Salir de la presentación (Esc)",
      goToSlide: "Ir al slide",
    },
  },
  "zh-CN": {
    slides: {
      cover: {
        title: "由经验证比分智能驱动的一体化电竞竞技平台",
        subtitle: "竞争 · 分析 · 收益",
        stats: [
          { value: "$21.9B", label: "总市场" },
          { value: "63M+", label: "玩家" },
          { value: "5:1–15:1", label: "LTV:CAC" },
        ],
      },
      problem: {
        badge: "核心问题",
        title: "竞技玩家值得更好的平台",
        body: "6300 多万玩家，但没有一个平台能完整覆盖他们的全流程需求。",
        items: [
          {
            title: "工具碎片化",
            desc: "玩家需要在 4 到 5 个应用之间切换，分别处理分析、匹配、赛事和收益。",
          },
          {
            title: "奖金缺乏信任",
            desc: "奖金分发流程不透明——付款延迟、争议频发，而且缺少验证。",
          },
          {
            title: "区域被忽视",
            desc: "LATAM、SEA 和 MENA 拥有庞大玩家群体，却缺少提供公平支付的本地平台。",
          },
          {
            title: "能力跃迁断层",
            desc: "从休闲玩家走向职业竞技，缺少可负担的成长路径。",
          },
        ],
      },
      solution: {
        badge: "解决方案",
        title: "一个平台，完整栈能力。",
        body: "首个将分析、竞技与收益整合到同一生态中的平台。",
        items: [
          { label: "AI 回放分析", desc: "从每一场比赛中提取深度表现洞察" },
          {
            label: "基于技能的匹配",
            desc: "通过 Elo/Glicko 提供公平且有竞争力的对局",
          },
          {
            label: "经验证比分",
            desc: "为支付、排名与争议处理提供可信结果验证",
          },
          { label: "透明奖金", desc: "由可信结果触发托管与奖金支付流程" },
        ],
      },
      moat: {
        badge: "核心护城河",
        title: "经验证比分就是信任引擎",
        body: "在电竞领域，最难的问题不是展示比分，而是把结果证明到足以让资金、排名和外部生态都可以依赖它的程度。",
        items: [
          {
            title: "多源采集",
            desc: "比分聚合自 6 个外部数据源，而不是依赖单一不透明来源。",
          },
          {
            title: "共识验证",
            desc: "加权验证与争议窗口共同构建金融级结果生命周期。",
          },
          {
            title: "结果结算",
            desc: "经验证结果可以安全触发奖金分发、排名变化与奖励逻辑。",
          },
        ],
        stats: [
          { value: "6", label: "数据源" },
          { value: "72h", label: "争议窗口" },
          { value: "2", label: "链上目标" },
        ],
      },
      leverage: {
        badge: "平台杠杆",
        title: "一层比分，多重市场。",
        body: "同一套支撑我们自有产品的比分基础设施，也可以成为面向外部生态可复用的 B2B 能力层。",
        items: [
          {
            title: "LeetGaming 核心产品",
            desc: "当结果经过验证时，匹配、排名、争议与支付都会更可信。",
          },
          {
            title: "预测与 wager 轨道",
            desc: "经验证结果可以帮助预测市场与技能型 wager 产品降低人工裁决成本。",
          },
          {
            title: "合作伙伴基础设施",
            desc: "外部赛事、发行商与社区运营方可以直接嵌入比分智能，而无需重复建设。",
          },
        ],
        takeawayLabel: "投资者要点",
        takeaway: "比分既是产品护城河，也是未来的基础设施业务。",
      },
      market: {
        badge: "市场机会",
        titlePrefix: "$21.9B",
        titleSuffix: "总可服务市场",
        body: "覆盖五个正在汇合的市场板块",
        segments: [
          { label: "电竞", value: "$1.86B", growth: "8.1%" },
          { label: "分析", value: "$2.1B", growth: "23.7%" },
          { label: "预测与 wagering", value: "$16B", growth: "15%" },
          { label: "教练服务", value: "$1.5B", growth: "12%" },
          { label: "赛事平台", value: "$450M", growth: "18%" },
        ],
      },
      revenue: {
        badge: "收入模式",
        title: "四条收入来源",
        expansionLabel: "扩展线",
        expansionBody:
          "经验证比分智能也为合作赛事、预测产品和外部竞技生态创造了未来的基础设施能力面。",
        split: ["订阅 40%", "交易 / 托管 30%", "增值服务 20%", "广告 10%"],
        streams: [
          {
            title: "订阅",
            desc: "Free / Pro / Team——提供分析、匹配和团队管理功能",
          },
          {
            title: "Wager 抽成（5–10%）",
            desc: "针对带有经验证比分和透明托管的技能型 wager 对局收取平台费用",
          },
          {
            title: "赛事费用",
            desc: "通过自动化 bracket 管理收取赛事托管费和报名佣金",
          },
          { title: "教练市场", desc: "连接玩家与认证职业教练并收取佣金" },
        ],
      },
      competitive: {
        badge: "竞争优势",
        title: "唯一的全栈 + 经验证比分方案",
        body: "竞争对手可能只占据流程中的某一环，没有任何一家能在同一系统中整合分析、竞技、变现和比分验证。",
        featureLabel: "功能",
        features: [
          "回放分析",
          "技能匹配",
          "经验证比分",
          "奖金分发",
          "多游戏",
          "合作 API",
        ],
      },
      traction: {
        badge: "产品进展",
        title: "已经构建并持续交付",
        body: "这不是概念型 deck，而是具备真实产品、支付与比分验证基础设施的生产级平台。",
        items: [
          { label: "基础设施", pct: 95 },
          { label: "前端", pct: 93 },
          { label: "认证与计费", pct: 90 },
          { label: "后端服务", pct: 85 },
          { label: "钱包系统", pct: 85 },
          { label: "支付", pct: 80 },
          { label: "测试", pct: 50 },
          { label: "区块链", pct: 30 },
        ],
      },
      financials: {
        badge: "财务预测",
        title: "收入预测",
        scenarios: [
          { scenario: "保守", mrr: "$90K" },
          { scenario: "中性", mrr: "$400K" },
          { scenario: "激进", mrr: "$1.8M" },
        ],
        mrrTarget: "MRR 目标",
        stats: [
          { value: "$5–15", label: "CAC" },
          { value: "$50–200", label: "LTV" },
          { value: "2–4 个月", label: "回本周期" },
          { value: "5:1–15:1", label: "LTV:CAC" },
        ],
      },
      roadmap: {
        badge: "路线图",
        title: "规模化路径",
        phases: [
          {
            label: "阶段 1",
            title: "生产稳定化",
            period: "2025 Q4",
            status: "✅ 已完成",
            items: "基础设施、认证、计费与回放引擎",
          },
          {
            label: "阶段 2",
            title: "核心功能完成",
            period: "2026 Q1",
            status: "🔄 进行中",
            items: "赛事、进阶分析与经验证比分能力",
          },
          {
            label: "阶段 3",
            title: "基础设施扩展",
            period: "2026 Q1–Q2",
            status: "⏳ 即将开始",
            items: "合作 API、外部比分轨道与结算集成",
          },
          {
            label: "阶段 4",
            title: "扩张与规模化",
            period: "2026 Q2–Q3",
            status: "⏳ 即将开始",
            items: "多区域部署、50 万用户、每月 250 万美元交易量",
          },
        ],
      },
      team: {
        badge: "团队",
        title: "核心领导层",
        founderRole: "CTO 与 Founder",
        founderBody:
          "前竞技 FPS 玩家。15+ 年软件工程经验。具备企业级分布式系统、区块链和游戏基础设施背景。",
        advisorRoles: ["电竞顾问", "技术顾问", "增长顾问"],
        openPosition: "开放职位",
        growth: "团队将在 2026 年从 4 人扩展到 20+ 人",
      },
      timing: {
        badge: "时机",
        titlePrefix: "为什么是",
        titleAccent: "现在",
        reasons: [
          "电竞观众规模已超过许多传统体育的受众结构",
          "LATAM、SEA、MENA 等欠服务区域拥有庞大玩家群体却缺少本地平台",
          "经验证比分基础设施可以支撑透明支付、预测产品与合作集成",
          "目前没有平台同时整合分析 + 竞技 + 经验证比分 + 收益——我们具备先发优势",
        ],
      },
      cta: {
        title: "一起打造电竞的未来",
        accent: "携手同行",
        body: "我们正在融资，以加速平台完善、扩展到 10 万竞争者规模，并把经验证比分打造为品类级护城河和整个电竞生态的平台层。",
        meeting: "预约会议",
      },
    },
    nav: {
      prev: "上一页",
      next: "下一页",
      enterPresentation: "进入演示模式 (F)",
      exitPresentation: "退出演示 (Esc)",
      goToSlide: "前往幻灯片",
    },
  },
} satisfies Record<TierOneLocale, DeckSlideCopy>;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (!isObject(base) || !isObject(override)) {
    return (override ?? base) as T;
  }

  const merged: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const current = merged[key];
    if (isObject(current) && isObject(value)) {
      merged[key] = deepMerge(current, value);
    } else {
      merged[key] = value;
    }
  }

  return merged as T;
}

export function getInvestorDeckCopy(locale: TierOneLocale) {
  return deepMerge(investorDeckCopy["en-US"], investorDeckCopy[locale]);
}
