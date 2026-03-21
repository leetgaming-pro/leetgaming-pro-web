#!/usr/bin/env python3
"""Update all translation files with missing footer and landing section keys."""
import json, os

def deep_merge(base, extra):
    for k, v in extra.items():
        if k not in base:
            base[k] = v
        elif isinstance(base[k], dict) and isinstance(v, dict):
            deep_merge(base[k], v)

NEW_KEYS = {
    "en-US": {
        "footer": {
            "uploadFiles": "Upload Files",
            "aboutUs": "About Us",
            "support": "Support",
            "contact": "Contact",
            "cookiePolicy": "Cookie Policy",
            "tagline": "The all-in-one competitive gaming platform for players who want to go pro.",
            "allRightsReserved": "All rights reserved."
        },
        "landing": {
            "hero": {
                "badge": "Join the next generation of esports",
                "word1": "COMPETE.",
                "word2": "ANALYZE.",
                "word3": "EARN.",
                "subtitle": "AI-powered replay analysis, skill-based matchmaking, and transparent prize pools. The all-in-one competitive gaming platform for players who want to go pro.",
                "cta": {"play": "Start Playing Free", "plans": "See Plans"},
                "feature": {
                    "replay": "AI Replay Analysis",
                    "matchmaking": "Skill-Based Matchmaking",
                    "payouts": "Instant Payouts"
                },
                "scroll": "Scroll"
            },
            "lobbies": {
                "liveBadge": "Live Matches",
                "headingPrefix": "Join The",
                "headingHighlight": "Battle",
                "subtitle": "Jump into competitive matches with players worldwide. Create your lobby or join an existing game.",
                "playersOnline": "Players Online",
                "activeLobbies": "Active Lobbies",
                "gamesToday": "Games Today",
                "emptyHeading": "No active lobbies right now",
                "emptyMessage": "Be the first — create a lobby and start playing!",
                "createLobby": "Create Lobby",
                "browseAll": "Browse All",
                "featured": "Featured",
                "lobbyFull": "Lobby Full",
                "joinNow": "Join Now",
                "competitive": "Competitive",
                "custom": "Custom"
            },
            "matches": {
                "badge": "Recent Battles",
                "heading": "Match History",
                "subtitle": "Relive the most intense battles. Analyze strategies. Improve your game.",
                "matchesPlayed": "Matches Played",
                "totalRounds": "Total Rounds",
                "avgDuration": "Avg Duration",
                "vs": "VS",
                "rounds": "Rounds",
                "players": "Players",
                "unknownMap": "Unknown Map",
                "recent": "Recent",
                "viewMatch": "View Match",
                "viewAll": "View All Matches",
                "uploadReplay": "Upload Your Replay"
            },
            "replayAnalysis": {
                "eyebrow": "CORE FEATURE",
                "headingPrefix": "AI-POWERED",
                "headingHighlight": "REPLAY ANALYSIS",
                "description": "Upload your CS2 or Valorant demos and receive instant, professional-grade analysis powered by machine learning. Understand your strengths, identify weaknesses, and track your improvement over time.",
                "feature": {
                    "hltvRating": "HLTV 2.0 Rating, ADR, KAST% analysis",
                    "economy": "Round-by-round economy & utility breakdown",
                    "ai": "AI-powered improvement suggestions",
                    "parsing": "CS2 & Valorant demo parsing",
                    "team": "Team performance insights & coaching cues",
                    "tracking": "Historical progress tracking & trends"
                },
                "analyzing": "ANALYZING",
                "stat": {"hltvRating": "HLTV Rating", "adr": "ADR", "kast": "KAST"},
                "cta": "Upload Your First Replay"
            },
            "games": {
                "eyebrow": "GAMES",
                "headingNumber": "11",
                "headingText": "GAMES. ONE PLATFORM.",
                "subtitle": "From tactical shooters to MOBAs and battle royales. Your competitive journey, across every title.",
                "moreGames": "+ Overwatch 2, Free Fire, Tibia, and more coming soon",
                "viewAll": "View All Games",
                "players": "Players",
                "capability": {
                    "aiAnalysis": "AI Analysis",
                    "matchmaking": "Matchmaking",
                    "tournaments": "Tournaments"
                }
            },
            "socialProof": {
                "eyebrow": "WHY LEETGAMING",
                "headingPrefix": "BUILT FOR",
                "headingHighlight": "COMPETITORS",
                "subtitle": "Every feature is designed to give you an edge — from AI-driven analysis to trustless prize distribution.",
                "capability": {
                    "aiAnalysis": {
                        "title": "AI REPLAY ANALYSIS",
                        "description": "Frame-by-frame analysis powered by computer vision. Get actionable insights on aim, positioning, and utility usage."
                    },
                    "matchmaking": {
                        "title": "FAIR MATCHMAKING",
                        "description": "Elo-based skill matching across multiple game modes. Every match is balanced for a truly competitive experience."
                    },
                    "payouts": {
                        "title": "INSTANT PAYOUTS",
                        "description": "On-chain prize distribution via smart contracts. Winnings hit your wallet the moment the match is verified."
                    },
                    "multiRegion": {
                        "title": "MULTI-REGION SUPPORT",
                        "description": "Low-latency infrastructure across global regions. Play competitive matches with minimal ping, wherever you are."
                    }
                },
                "trust": {
                    "smartContracts": "Transparent Smart Contracts",
                    "antiCheat": "Anti-Cheat Integrated",
                    "uptime": "99.9% Uptime Target"
                }
            },
            "tournaments": {
                "eyebrow": "COMPETE",
                "headingPrefix": "TOURNAMENTS &",
                "headingHighlight": "PRIZE POOLS",
                "subtitle": "From grassroots competitions to elite tournaments. Create, join, and compete with guaranteed payouts.",
                "bracketHeading": "AUTOMATED BRACKETS",
                "semiFinals": "SEMI-FINALS",
                "grandFinal": "\U0001f3c6 GRAND FINAL",
                "feature": {
                    "brackets": {"title": "Automated Brackets", "description": "Single/double elimination, Swiss, round-robin formats with automated seeding"},
                    "prizes": {"title": "Verified Prize Pools", "description": "Blockchain-verified escrow ensures every dollar reaches the winners"},
                    "antiCheat": {"title": "Anti-Cheat Protection", "description": "Built-in anti-cheat with VAC, FACEIT AC, and proprietary detection"},
                    "payouts": {"title": "Instant Payouts", "description": "Winners receive prizes within minutes via Stripe, crypto, or wallet"}
                },
                "cta": "Browse Tournaments"
            }
        }
    },
    "pt-BR": {
        "footer": {
            "uploadFiles": "Upload de Arquivos",
            "aboutUs": "Sobre N\u00f3s",
            "support": "Suporte",
            "contact": "Contato",
            "cookiePolicy": "Pol\u00edtica de Cookies",
            "tagline": "A plataforma all-in-one de jogos competitivos para jogadores que querem ser pro.",
            "allRightsReserved": "Todos os direitos reservados."
        },
        "landing": {
            "hero": {
                "badge": "Junte-se \u00e0 pr\u00f3xima gera\u00e7\u00e3o de esports",
                "word1": "COMPITA.",
                "word2": "ANALISE.",
                "word3": "GANHE.",
                "subtitle": "An\u00e1lise de replays com IA, matchmaking baseado em habilidade e prize pools transparentes. A plataforma all-in-one de jogos competitivos para jogadores que querem ser pro.",
                "cta": {"play": "Come\u00e7ar Gr\u00e1tis", "plans": "Ver Planos"},
                "feature": {
                    "replay": "An\u00e1lise de Replay com IA",
                    "matchmaking": "Matchmaking por Habilidade",
                    "payouts": "Pagamentos Instant\u00e2neos"
                },
                "scroll": "Rolar"
            },
            "lobbies": {
                "liveBadge": "Partidas ao Vivo",
                "headingPrefix": "Entre na",
                "headingHighlight": "Batalha",
                "subtitle": "Entre em partidas competitivas com jogadores do mundo todo. Crie seu lobby ou participe de um jogo existente.",
                "playersOnline": "Jogadores Online",
                "activeLobbies": "Lobbies Ativos",
                "gamesToday": "Jogos Hoje",
                "emptyHeading": "Nenhum lobby ativo no momento",
                "emptyMessage": "Seja o primeiro \u2014 crie um lobby e comece a jogar!",
                "createLobby": "Criar Lobby",
                "browseAll": "Ver Todos",
                "featured": "Destaque",
                "lobbyFull": "Lobby Cheio",
                "joinNow": "Entrar Agora",
                "competitive": "Competitivo",
                "custom": "Personalizado"
            },
            "matches": {
                "badge": "Batalhas Recentes",
                "heading": "Hist\u00f3rico de Partidas",
                "subtitle": "Reviva as batalhas mais intensas. Analise estrat\u00e9gias. Melhore seu jogo.",
                "matchesPlayed": "Partidas Jogadas",
                "totalRounds": "Total de Rounds",
                "avgDuration": "Dura\u00e7\u00e3o M\u00e9dia",
                "vs": "VS",
                "rounds": "Rounds",
                "players": "Jogadores",
                "unknownMap": "Mapa Desconhecido",
                "recent": "Recente",
                "viewMatch": "Ver Partida",
                "viewAll": "Ver Todas as Partidas",
                "uploadReplay": "Enviar Seu Replay"
            },
            "replayAnalysis": {
                "eyebrow": "FUNCIONALIDADE PRINCIPAL",
                "headingPrefix": "AN\u00c1LISE DE REPLAY",
                "headingHighlight": "COM INTELIG\u00caNCIA ARTIFICIAL",
                "description": "Envie seus demos de CS2 ou Valorant e receba an\u00e1lises instant\u00e2neas e profissionais com machine learning. Entenda seus pontos fortes, identifique fraquezas e acompanhe sua evolu\u00e7\u00e3o.",
                "feature": {
                    "hltvRating": "An\u00e1lise de HLTV 2.0 Rating, ADR, KAST%",
                    "economy": "An\u00e1lise de economia e utilit\u00e1rios rodada a rodada",
                    "ai": "Sugest\u00f5es de melhoria por IA",
                    "parsing": "Parsing de demos CS2 & Valorant",
                    "team": "Insights de performance de equipe e coaching",
                    "tracking": "Acompanhamento hist\u00f3rico e tend\u00eancias"
                },
                "analyzing": "ANALISANDO",
                "stat": {"hltvRating": "HLTV Rating", "adr": "ADR", "kast": "KAST"},
                "cta": "Enviar Seu Primeiro Replay"
            },
            "games": {
                "eyebrow": "JOGOS",
                "headingNumber": "11",
                "headingText": "JOGOS. UMA PLATAFORMA.",
                "subtitle": "De shooters t\u00e1ticos a MOBAs e battle royales. Sua jornada competitiva, em todos os t\u00edtulos.",
                "moreGames": "+ Overwatch 2, Free Fire, Tibia e mais em breve",
                "viewAll": "Ver Todos os Jogos",
                "players": "Jogadores",
                "capability": {
                    "aiAnalysis": "An\u00e1lise por IA",
                    "matchmaking": "Matchmaking",
                    "tournaments": "Torneios"
                }
            },
            "socialProof": {
                "eyebrow": "POR QUE LEETGAMING",
                "headingPrefix": "FEITO PARA",
                "headingHighlight": "COMPETIDORES",
                "subtitle": "Cada funcionalidade foi desenvolvida para te dar vantagem \u2014 de an\u00e1lises com IA \u00e0 distribui\u00e7\u00e3o de pr\u00eamios sem intermedi\u00e1rios.",
                "capability": {
                    "aiAnalysis": {
                        "title": "AN\u00c1LISE DE REPLAY COM IA",
                        "description": "An\u00e1lise quadro a quadro com vis\u00e3o computacional. Obtenha insights acion\u00e1veis sobre mira, posicionamento e uso de utilit\u00e1rios."
                    },
                    "matchmaking": {
                        "title": "MATCHMAKING JUSTO",
                        "description": "Emparelhamento baseado em Elo para m\u00faltiplos modos de jogo. Cada partida \u00e9 equilibrada para uma experi\u00eancia verdadeiramente competitiva."
                    },
                    "payouts": {
                        "title": "PAGAMENTOS INSTANT\u00c2NEOS",
                        "description": "Distribui\u00e7\u00e3o de pr\u00eamios on-chain via contratos inteligentes. Os ganhos chegam \u00e0 sua carteira no momento em que a partida \u00e9 verificada."
                    },
                    "multiRegion": {
                        "title": "SUPORTE MULTIRREGIONAL",
                        "description": "Infraestrutura de baixa lat\u00eancia em regi\u00f5es globais. Jogue partidas competitivas com ping m\u00ednimo, onde quer que voc\u00ea esteja."
                    }
                },
                "trust": {
                    "smartContracts": "Contratos Inteligentes Transparentes",
                    "antiCheat": "Anti-Cheat Integrado",
                    "uptime": "Meta de 99,9% de Disponibilidade"
                }
            },
            "tournaments": {
                "eyebrow": "COMPITA",
                "headingPrefix": "TORNEIOS E",
                "headingHighlight": "PRIZE POOLS",
                "subtitle": "De competi\u00e7\u00f5es regionais a torneios de elite. Crie, participe e compita com premia\u00e7\u00f5es garantidas.",
                "bracketHeading": "CHAVES AUTOMATIZADAS",
                "semiFinals": "SEMIFINAIS",
                "grandFinal": "\U0001f3c6 GRANDE FINAL",
                "feature": {
                    "brackets": {"title": "Chaves Automatizadas", "description": "Formatos de elimina\u00e7\u00e3o simples/dupla, su\u00ed\u00e7o e round-robin com seeding autom\u00e1tico"},
                    "prizes": {"title": "Prize Pools Verificados", "description": "Cust\u00f3dia verificada em blockchain garante que cada centavo chegue aos vencedores"},
                    "antiCheat": {"title": "Prote\u00e7\u00e3o Anti-Cheat", "description": "Anti-cheat integrado com VAC, FACEIT AC e detec\u00e7\u00e3o propriet\u00e1ria"},
                    "payouts": {"title": "Pagamentos Instant\u00e2neos", "description": "Os vencedores recebem pr\u00eamios em minutos via Stripe, cripto ou carteira"}
                },
                "cta": "Ver Torneios"
            }
        }
    },
    "es-ES": {
        "footer": {
            "uploadFiles": "Subir Archivos",
            "aboutUs": "Qui\u00e9nes Somos",
            "support": "Soporte",
            "contact": "Contacto",
            "cookiePolicy": "Pol\u00edtica de Cookies",
            "tagline": "La plataforma todo en uno de gaming competitivo para jugadores que quieren ser pro.",
            "allRightsReserved": "Todos los derechos reservados."
        },
        "landing": {
            "hero": {
                "badge": "\u00danete a la pr\u00f3xima generaci\u00f3n de esports",
                "word1": "COMPITE.",
                "word2": "ANALIZA.",
                "word3": "GANA.",
                "subtitle": "An\u00e1lisis de replays con IA, matchmaking basado en habilidad y prize pools transparentes. La plataforma todo en uno de gaming competitivo para jugadores que quieren ser pro.",
                "cta": {"play": "Empezar Gratis", "plans": "Ver Planes"},
                "feature": {
                    "replay": "An\u00e1lisis de Replay con IA",
                    "matchmaking": "Matchmaking por Habilidad",
                    "payouts": "Pagos Instant\u00e1neos"
                },
                "scroll": "Desplazar"
            },
            "lobbies": {
                "liveBadge": "Partidas en Vivo",
                "headingPrefix": "\u00danete a la",
                "headingHighlight": "Batalla",
                "subtitle": "Entra en partidas competitivas con jugadores de todo el mundo. Crea tu lobby o \u00fanete a un juego existente.",
                "playersOnline": "Jugadores en L\u00ednea",
                "activeLobbies": "Lobbies Activos",
                "gamesToday": "Partidas Hoy",
                "emptyHeading": "No hay lobbies activos ahora mismo",
                "emptyMessage": "\u00a1S\u00e9 el primero \u2014 crea un lobby y empieza a jugar!",
                "createLobby": "Crear Lobby",
                "browseAll": "Ver Todo",
                "featured": "Destacado",
                "lobbyFull": "Lobby Lleno",
                "joinNow": "Unirse Ahora",
                "competitive": "Competitivo",
                "custom": "Personalizado"
            },
            "matches": {
                "badge": "Batallas Recientes",
                "heading": "Historial de Partidas",
                "subtitle": "Revive las batallas m\u00e1s intensas. Analiza estrategias. Mejora tu juego.",
                "matchesPlayed": "Partidas Jugadas",
                "totalRounds": "Total de Rondas",
                "avgDuration": "Duraci\u00f3n Media",
                "vs": "VS",
                "rounds": "Rondas",
                "players": "Jugadores",
                "unknownMap": "Mapa Desconocido",
                "recent": "Reciente",
                "viewMatch": "Ver Partida",
                "viewAll": "Ver Todas las Partidas",
                "uploadReplay": "Subir Tu Replay"
            },
            "replayAnalysis": {
                "eyebrow": "FUNCIONALIDAD PRINCIPAL",
                "headingPrefix": "AN\u00c1LISIS DE REPLAY",
                "headingHighlight": "CON INTELIGENCIA ARTIFICIAL",
                "description": "Sube tus demos de CS2 o Valorant y recibe an\u00e1lisis instant\u00e1neos y profesionales con machine learning. Comprende tus fortalezas, identifica debilidades y rastrea tu mejora.",
                "feature": {
                    "hltvRating": "An\u00e1lisis de HLTV 2.0 Rating, ADR, KAST%",
                    "economy": "An\u00e1lisis de econom\u00eda y utilidades ronda a ronda",
                    "ai": "Sugerencias de mejora con IA",
                    "parsing": "An\u00e1lisis de demos CS2 & Valorant",
                    "team": "Insights de rendimiento de equipo y coaching",
                    "tracking": "Seguimiento hist\u00f3rico y tendencias"
                },
                "analyzing": "ANALIZANDO",
                "stat": {"hltvRating": "HLTV Rating", "adr": "ADR", "kast": "KAST"},
                "cta": "Subir Tu Primer Replay"
            },
            "games": {
                "eyebrow": "JUEGOS",
                "headingNumber": "11",
                "headingText": "JUEGOS. UNA PLATAFORMA.",
                "subtitle": "De shooters t\u00e1cticos a MOBAs y battle royales. Tu camino competitivo, en todos los t\u00edtulos.",
                "moreGames": "+ Overwatch 2, Free Fire, Tibia y m\u00e1s pr\u00f3ximamente",
                "viewAll": "Ver Todos los Juegos",
                "players": "Jugadores",
                "capability": {
                    "aiAnalysis": "An\u00e1lisis IA",
                    "matchmaking": "Matchmaking",
                    "tournaments": "Torneos"
                }
            },
            "socialProof": {
                "eyebrow": "POR QU\u00c9 LEETGAMING",
                "headingPrefix": "HECHO PARA",
                "headingHighlight": "COMPETIDORES",
                "subtitle": "Cada funcionalidad est\u00e1 dise\u00f1ada para darte ventaja \u2014 desde an\u00e1lisis con IA hasta distribuci\u00f3n de premios sin confianza.",
                "capability": {
                    "aiAnalysis": {
                        "title": "AN\u00c1LISIS DE REPLAY CON IA",
                        "description": "An\u00e1lisis cuadro a cuadro con visi\u00f3n por computadora. Obt\u00e9n insights accionables sobre punter\u00eda, posicionamiento y uso de utilidades."
                    },
                    "matchmaking": {
                        "title": "MATCHMAKING JUSTO",
                        "description": "Emparejamiento basado en Elo para m\u00faltiples modos de juego. Cada partida est\u00e1 equilibrada para una experiencia verdaderamente competitiva."
                    },
                    "payouts": {
                        "title": "PAGOS INSTANT\u00c1NEOS",
                        "description": "Distribuci\u00f3n de premios on-chain mediante contratos inteligentes. Las ganancias llegan a tu cartera en el momento en que se verifica la partida."
                    },
                    "multiRegion": {
                        "title": "SOPORTE MULTIRREGIONAL",
                        "description": "Infraestructura de baja latencia en regiones globales. Juega partidas competitivas con ping m\u00ednimo, est\u00e9s donde est\u00e9s."
                    }
                },
                "trust": {
                    "smartContracts": "Contratos Inteligentes Transparentes",
                    "antiCheat": "Anti-Cheat Integrado",
                    "uptime": "Objetivo de 99,9% de Disponibilidad"
                }
            },
            "tournaments": {
                "eyebrow": "COMPITE",
                "headingPrefix": "TORNEOS Y",
                "headingHighlight": "PRIZE POOLS",
                "subtitle": "Desde competiciones locales hasta torneos de \u00e9lite. Crea, \u00fanete y compite con pagos garantizados.",
                "bracketHeading": "LLAVES AUTOMATIZADAS",
                "semiFinals": "SEMIFINALES",
                "grandFinal": "\U0001f3c6 GRAN FINAL",
                "feature": {
                    "brackets": {"title": "Llaves Automatizadas", "description": "Formatos de eliminaci\u00f3n simple/doble, suizo y round-robin con seeding autom\u00e1tico"},
                    "prizes": {"title": "Prize Pools Verificados", "description": "Custodia verificada en blockchain garantiza que cada euro llegue a los ganadores"},
                    "antiCheat": {"title": "Protecci\u00f3n Anti-Cheat", "description": "Anti-cheat integrado con VAC, FACEIT AC y detecci\u00f3n propia"},
                    "payouts": {"title": "Pagos Instant\u00e1neos", "description": "Los ganadores reciben premios en minutos v\u00eda Stripe, cripto o cartera"}
                },
                "cta": "Ver Torneos"
            }
        }
    },
    "es-LA": {
        "footer": {
            "uploadFiles": "Subir Archivos",
            "aboutUs": "Qui\u00e9nes Somos",
            "support": "Soporte",
            "contact": "Contacto",
            "cookiePolicy": "Pol\u00edtica de Cookies",
            "tagline": "La plataforma todo en uno de gaming competitivo para jugadores que quieren ser pro.",
            "allRightsReserved": "Todos los derechos reservados."
        },
        "landing": {
            "hero": {
                "badge": "\u00danete a la pr\u00f3xima generaci\u00f3n de esports",
                "word1": "COMPITE.",
                "word2": "ANALIZA.",
                "word3": "GANA.",
                "subtitle": "An\u00e1lisis de replays con IA, matchmaking basado en habilidad y prize pools transparentes. La plataforma todo en uno de gaming competitivo para jugadores que quieren ser pro.",
                "cta": {"play": "Empezar Gratis", "plans": "Ver Planes"},
                "feature": {
                    "replay": "An\u00e1lisis de Replay con IA",
                    "matchmaking": "Matchmaking por Habilidad",
                    "payouts": "Pagos Instant\u00e1neos"
                },
                "scroll": "Desplazar"
            },
            "lobbies": {
                "liveBadge": "Partidas en Vivo",
                "headingPrefix": "\u00danete a la",
                "headingHighlight": "Batalla",
                "subtitle": "Entra en partidas competitivas con jugadores de todo el mundo. Crea tu lobby o \u00fanete a un juego existente.",
                "playersOnline": "Jugadores en L\u00ednea",
                "activeLobbies": "Lobbies Activos",
                "gamesToday": "Partidas Hoy",
                "emptyHeading": "No hay lobbies activos ahora mismo",
                "emptyMessage": "\u00a1S\u00e9 el primero \u2014 crea un lobby y empieza a jugar!",
                "createLobby": "Crear Lobby",
                "browseAll": "Ver Todo",
                "featured": "Destacado",
                "lobbyFull": "Lobby Lleno",
                "joinNow": "Unirse Ahora",
                "competitive": "Competitivo",
                "custom": "Personalizado"
            },
            "matches": {
                "badge": "Batallas Recientes",
                "heading": "Historial de Partidas",
                "subtitle": "Revive las batallas m\u00e1s intensas. Analiza estrategias. Mejora tu juego.",
                "matchesPlayed": "Partidas Jugadas",
                "totalRounds": "Total de Rondas",
                "avgDuration": "Duraci\u00f3n Promedio",
                "vs": "VS",
                "rounds": "Rondas",
                "players": "Jugadores",
                "unknownMap": "Mapa Desconocido",
                "recent": "Reciente",
                "viewMatch": "Ver Partida",
                "viewAll": "Ver Todas las Partidas",
                "uploadReplay": "Subir Tu Replay"
            },
            "replayAnalysis": {
                "eyebrow": "FUNCI\u00d3N PRINCIPAL",
                "headingPrefix": "AN\u00c1LISIS DE REPLAY",
                "headingHighlight": "CON INTELIGENCIA ARTIFICIAL",
                "description": "Sube tus demos de CS2 o Valorant y recibe an\u00e1lisis instant\u00e1neos y profesionales con machine learning. Comprende tus fortalezas, identifica debilidades y rastrea tu mejora.",
                "feature": {
                    "hltvRating": "An\u00e1lisis de HLTV 2.0 Rating, ADR, KAST%",
                    "economy": "An\u00e1lisis de econom\u00eda y utilidades ronda a ronda",
                    "ai": "Sugerencias de mejora con IA",
                    "parsing": "An\u00e1lisis de demos CS2 & Valorant",
                    "team": "Insights de rendimiento de equipo y coaching",
                    "tracking": "Seguimiento hist\u00f3rico y tendencias"
                },
                "analyzing": "ANALIZANDO",
                "stat": {"hltvRating": "HLTV Rating", "adr": "ADR", "kast": "KAST"},
                "cta": "Subir Tu Primer Replay"
            },
            "games": {
                "eyebrow": "JUEGOS",
                "headingNumber": "11",
                "headingText": "JUEGOS. UNA PLATAFORMA.",
                "subtitle": "De shooters t\u00e1cticos a MOBAs y battle royales. Tu camino competitivo, en todos los t\u00edtulos.",
                "moreGames": "+ Overwatch 2, Free Fire, Tibia y m\u00e1s pr\u00f3ximamente",
                "viewAll": "Ver Todos los Juegos",
                "players": "Jugadores",
                "capability": {
                    "aiAnalysis": "An\u00e1lisis IA",
                    "matchmaking": "Matchmaking",
                    "tournaments": "Torneos"
                }
            },
            "socialProof": {
                "eyebrow": "POR QU\u00c9 LEETGAMING",
                "headingPrefix": "HECHO PARA",
                "headingHighlight": "COMPETIDORES",
                "subtitle": "Cada funcionalidad est\u00e1 dise\u00f1ada para darte ventaja \u2014 desde an\u00e1lisis con IA hasta distribuci\u00f3n de premios transparente.",
                "capability": {
                    "aiAnalysis": {
                        "title": "AN\u00c1LISIS DE REPLAY CON IA",
                        "description": "An\u00e1lisis cuadro a cuadro con visi\u00f3n por computadora. Obt\u00e9n insights accionables sobre punter\u00eda, posicionamiento y uso de utilidades."
                    },
                    "matchmaking": {
                        "title": "MATCHMAKING JUSTO",
                        "description": "Emparejamiento basado en Elo para m\u00faltiples modos de juego. Cada partida est\u00e1 equilibrada para una experiencia verdaderamente competitiva."
                    },
                    "payouts": {
                        "title": "PAGOS INSTANT\u00c1NEOS",
                        "description": "Distribuci\u00f3n de premios on-chain mediante contratos inteligentes. Las ganancias llegan a tu cartera cuando se verifica la partida."
                    },
                    "multiRegion": {
                        "title": "SOPORTE MULTIRREGIONAL",
                        "description": "Infraestructura de baja latencia en regiones globales. Juega partidas competitivas con ping m\u00ednimo, donde sea que est\u00e9s."
                    }
                },
                "trust": {
                    "smartContracts": "Contratos Inteligentes Transparentes",
                    "antiCheat": "Anti-Cheat Integrado",
                    "uptime": "Objetivo de 99.9% de Disponibilidad"
                }
            },
            "tournaments": {
                "eyebrow": "COMPITE",
                "headingPrefix": "TORNEOS Y",
                "headingHighlight": "PRIZE POOLS",
                "subtitle": "Desde competencias locales hasta torneos de \u00e9lite. Crea, \u00fanete y compite con pagos garantizados.",
                "bracketHeading": "LLAVES AUTOMATIZADAS",
                "semiFinals": "SEMIFINALES",
                "grandFinal": "\U0001f3c6 GRAN FINAL",
                "feature": {
                    "brackets": {"title": "Llaves Automatizadas", "description": "Formatos de eliminaci\u00f3n simple/doble, suizo y round-robin con seeding autom\u00e1tico"},
                    "prizes": {"title": "Prize Pools Verificados", "description": "Custodia verificada en blockchain garantiza que cada centavo llegue a los ganadores"},
                    "antiCheat": {"title": "Protecci\u00f3n Anti-Cheat", "description": "Anti-cheat integrado con VAC, FACEIT AC y detecci\u00f3n propia"},
                    "payouts": {"title": "Pagos Instant\u00e1neos", "description": "Los ganadores reciben premios en minutos v\u00eda Stripe, cripto o billetera"}
                },
                "cta": "Ver Torneos"
            }
        }
    },
    "zh-CN": {
        "footer": {
            "uploadFiles": "\u4e0a\u4f20\u6587\u4ef6",
            "aboutUs": "\u5173\u4e8e\u6211\u4eec",
            "support": "\u652f\u6301",
            "contact": "\u8054\u7cfb\u6211\u4eec",
            "cookiePolicy": "Cookie \u653f\u7b56",
            "tagline": "\u4e3a\u8ffd\u6c42\u804c\u4e1a\u7ade\u6280\u7684\u73a9\u5bb6\u6253\u9020\u7684\u4e00\u7ad9\u5f0f\u7ade\u6280\u6e38\u620f\u5e73\u53f0\u3002",
            "allRightsReserved": "\u7248\u6743\u6240\u6709\u3002"
        },
        "landing": {
            "hero": {
                "badge": "\u52a0\u5165\u65b0\u4e00\u4ee3\u7535\u5b50\u7ade\u6280",
                "word1": "\u7ade\u6280\u3002",
                "word2": "\u5206\u6790\u3002",
                "word3": "\u76c8\u5229\u3002",
                "subtitle": "AI\u9a71\u52a8\u7684\u5f55\u50cf\u5206\u6790\u3001\u57fa\u4e8e\u6280\u80fd\u7684\u5339\u914d\u7cfb\u7edf\u548c\u900f\u660e\u7684\u5956\u91d1\u6c60\u3002\u4e3a\u60f3\u8981\u8d70\u5411\u804c\u4e1a\u5316\u7684\u73a9\u5bb6\u6253\u9020\u7684\u4e00\u7ad9\u5f0f\u7ade\u6280\u6e38\u620f\u5e73\u53f0\u3002",
                "cta": {"play": "\u514d\u8d39\u5f00\u59cb\u6e38\u620f", "plans": "\u67e5\u770b\u65b9\u6848"},
                "feature": {
                    "replay": "AI \u5f55\u50cf\u5206\u6790",
                    "matchmaking": "\u6280\u80fd\u5339\u914d",
                    "payouts": "\u5373\u65f6\u5230\u8d26"
                },
                "scroll": "\u6eda\u52a8"
            },
            "lobbies": {
                "liveBadge": "\u5b9e\u65f6\u5bf9\u6218",
                "headingPrefix": "\u52a0\u5165",
                "headingHighlight": "\u6218\u573a",
                "subtitle": "\u4e0e\u5168\u7403\u73a9\u5bb6\u4e00\u8d77\u53c2\u52a0\u7ade\u6280\u5bf9\u6218\u3002\u521b\u5efa\u4f60\u7684\u623f\u95f4\u6216\u52a0\u5165\u73b0\u6709\u6e38\u620f\u3002",
                "playersOnline": "\u5728\u7ebf\u73a9\u5bb6",
                "activeLobbies": "\u6d3b\u8dc3\u623f\u95f4",
                "gamesToday": "\u4eca\u65e5\u5bf9\u5c40",
                "emptyHeading": "\u6682\u65e0\u6d3b\u8dc3\u623f\u95f4",
                "emptyMessage": "\u6210\u4e3a\u7b2c\u4e00\u4e2a\u2014\u2014\u521b\u5efa\u623f\u95f4\u5f00\u59cb\u6e38\u620f\uff01",
                "createLobby": "\u521b\u5efa\u623f\u95f4",
                "browseAll": "\u6d4f\u89c8\u5168\u90e8",
                "featured": "\u7cbe\u9009",
                "lobbyFull": "\u623f\u95f4\u5df2\u6ee1",
                "joinNow": "\u7acb\u5373\u52a0\u5165",
                "competitive": "\u7ade\u6280",
                "custom": "\u81ea\u5b9a\u4e49"
            },
            "matches": {
                "badge": "\u8fd1\u671f\u5bf9\u6218",
                "heading": "\u5bf9\u6218\u8bb0\u5f55",
                "subtitle": "\u56de\u987e\u6700\u6fc0\u70c8\u7684\u5bf9\u6218\u3002\u5206\u6790\u7b56\u7565\u3002\u63d0\u5347\u5b9e\u529b\u3002",
                "matchesPlayed": "\u5df2\u5b8c\u6210\u5bf9\u5c40",
                "totalRounds": "\u603b\u56de\u5408\u6570",
                "avgDuration": "\u5e73\u5747\u65f6\u957f",
                "vs": "VS",
                "rounds": "\u56de\u5408",
                "players": "\u73a9\u5bb6",
                "unknownMap": "\u672a\u77e5\u5730\u56fe",
                "recent": "\u6700\u8fd1",
                "viewMatch": "\u67e5\u770b\u6bd4\u8d5b",
                "viewAll": "\u67e5\u770b\u6240\u6709\u6bd4\u8d5b",
                "uploadReplay": "\u4e0a\u4f20\u5f55\u50cf"
            },
            "replayAnalysis": {
                "eyebrow": "\u6838\u5fc3\u529f\u80fd",
                "headingPrefix": "AI \u9a71\u52a8",
                "headingHighlight": "\u5f55\u50cf\u5206\u6790",
                "description": "\u4e0a\u4f20您的 CS2 \u6216 Valorant Demo \u6587\u4ef6\uff0c\u5373\u53ef\u83b7\u5f97\u7531\u673a\u5668\u5b66\u4e60\u9a71\u52a8\u7684\u5373\u65f6\u4e13\u4e1a\u5206\u6790\u3002\u4e86\u89e3\u60a8\u7684\u4f18\u52bf\u3001\u53d1\u73b0\u5f31\u70b9\uff0c\u5e76\u8ffd\u8e2a\u60a8\u7684\u8fdb\u6b65\u3002",
                "feature": {
                    "hltvRating": "HLTV 2.0 Rating\u3001ADR\u3001KAST% \u5206\u6790",
                    "economy": "\u9010\u56de\u5408\u7ecf\u6d4e\u4e0e\u9053\u5177\u4f7f\u7528\u5206\u6790",
                    "ai": "AI \u9a71\u52a8\u7684\u6539\u8fdb\u5efa\u8bae",
                    "parsing": "CS2 & Valorant Demo \u89e3\u6790",
                    "team": "\u56e2\u961f\u8868\u73b0\u5206\u6790\u4e0e\u6559\u7ec3\u63d0\u793a",
                    "tracking": "\u5386\u53f2\u8fdb\u5ea6\u8ffd\u8e2a\u4e0e\u8d8b\u52bf\u5206\u6790"
                },
                "analyzing": "\u5206\u6790\u4e2d",
                "stat": {"hltvRating": "HLTV \u8bc4\u5206", "adr": "ADR", "kast": "KAST"},
                "cta": "\u4e0a\u4f20\u60a8\u7684\u7b2c\u4e00\u4e2a\u5f55\u50cf"
            },
            "games": {
                "eyebrow": "\u6e38\u620f",
                "headingNumber": "11",
                "headingText": "\u6b3e\u6e38\u620f\u3002\u4e00\u4e2a\u5e73\u53f0\u3002",
                "subtitle": "\u4ece\u6218\u672f\u5c04\u51fb\u5230 MOBA \u548c\u5927\u9003\u6740\u3002\u60a8\u7684\u7ade\u6280\u4e4b\u65c5\uff0c\u8de8\u8d8a\u6bcf\u4e2a\u6e38\u620f\u3002",
                "moreGames": "+ Overwatch 2\u3001Free Fire\u3001Tibia \u7b49\u5373\u5c06\u63a8\u51fa",
                "viewAll": "\u67e5\u770b\u6240\u6709\u6e38\u620f",
                "players": "\u73a9\u5bb6",
                "capability": {
                    "aiAnalysis": "AI \u5206\u6790",
                    "matchmaking": "\u5339\u914d\u7cfb\u7edf",
                    "tournaments": "\u9526\u6807\u8d5b"
                }
            },
            "socialProof": {
                "eyebrow": "\u4e3a\u4f55\u9009\u62e9 LEETGAMING",
                "headingPrefix": "\u4e13\u4e3a",
                "headingHighlight": "\u7ade\u6280\u73a9\u5bb6\u6253\u9020",
                "subtitle": "\u6bcf\u9879\u529f\u80fd\u90fd\u65e8\u5728\u7ed9\u60a8\u5e26\u6765\u4f18\u52bf\u2014\u2014\u4ece AI \u9a71\u52a8\u7684\u5206\u6790\u5230\u53bb\u4fe1\u4efb\u5316\u7684\u5956\u91d1\u5206\u914d\u3002",
                "capability": {
                    "aiAnalysis": {
                        "title": "AI \u5f55\u50cf\u5206\u6790",
                        "description": "\u7531\u8ba1\u7b97\u673a\u89c6\u89c9\u9a71\u52a8\u7684\u9010\u5e27\u5206\u6790\u3002\u83b7\u53d6\u5173\u4e8e\u77ac\u51c6\u3001\u8d70\u4f4d\u548c\u9053\u5177\u4f7f\u7528\u7684\u53ef\u64cd\u4f5c\u6d1e\u5bdf\u3002"
                    },
                    "matchmaking": {
                        "title": "\u516c\u5e73\u5339\u914d",
                        "description": "\u57fa\u4e8e Elo \u7684\u591a\u6a21\u5f0f\u6280\u80fd\u5339\u914d\u3002\u6bcf\u573a\u6bd4\u8d5b\u90fd\u7ecf\u8fc7\u5e73\u8861\uff0c\u5e26\u6765\u771f\u6b63\u7684\u7ade\u6280\u4f53\u9a8c\u3002"
                    },
                    "payouts": {
                        "title": "\u5373\u65f6\u652f\u4ed8",
                        "description": "\u901a\u8fc7\u667a\u80fd\u5408\u7ea6\u8fdb\u884c\u94fe\u4e0a\u5956\u91d1\u5206\u914d\u3002\u6bd4\u8d5b\u9a8c\u8bc1\u540e\uff0c\u5956\u52b1\u7acb\u5373\u5230\u8d26\u60a8\u7684\u9322\u5305\u3002"
                    },
                    "multiRegion": {
                        "title": "\u591a\u5730\u533a\u652f\u6301",
                        "description": "\u8986\u76d6\u5168\u7403\u5404\u5730\u533a\u7684\u4f4e\u5ef6\u8fdf\u57fa\u7840\u8bbe\u65bd\u3002\u65e0\u8bba\u8eab\u5904\u4f55\u5904\uff0c\u5747\u53ef\u4ee5\u6781\u4f4e\u5ef6\u8fdf\u53c2\u4e0e\u7ade\u6280\u5bf9\u6218\u3002"
                    }
                },
                "trust": {
                    "smartContracts": "\u900f\u660e\u667a\u80fd\u5408\u7ea6",
                    "antiCheat": "\u5185\u7f6e\u53cd\u4f5c\u5f04\u7cfb\u7edf",
                    "uptime": "99.9% \u53ef\u7528\u6027\u76ee\u6807"
                }
            },
            "tournaments": {
                "eyebrow": "\u7ade\u6280",
                "headingPrefix": "\u9526\u6807\u8d5b\u4e0e",
                "headingHighlight": "\u5956\u91d1\u6c60",
                "subtitle": "\u4ece\u672c\u5730\u8d5b\u4e8b\u5230\u7cbe\u82f1\u9526\u6807\u8d5b\u3002\u521b\u5efa\u3001\u52a0\u5165\u5e76\u53c2\u4e0e\u6709\u4fdd\u8bc1\u5956\u91d1\u7684\u7ade\u6280\u3002",
                "bracketHeading": "\u81ea\u52a8\u664b\u7ea7\u8868",
                "semiFinals": "\u534a\u51b3\u8d5b",
                "grandFinal": "\U0001f3c6 \u603b\u51b3\u8d5b",
                "feature": {
                    "brackets": {"title": "\u81ea\u52a8\u664b\u7ea7\u8868", "description": "\u652f\u6301\u5355\u8d25\u3001\u53cc\u8d25\u3001\u745e\u58eb\u8f6e\u548c\u5faa\u73af\u8d5b\u683c\u5f0f\uff0c\u81ea\u52a8\u79cd\u5b50\u6392\u5217"},
                    "prizes": {"title": "\u5df2\u9a8c\u8bc1\u5956\u91d1\u6c60", "description": "\u533a\u5757\u94fe\u9a8c\u8bc1\u7684\u6258\u7ba1\u786e\u4fdd\u6bcf\u4e00\u5206\u5956\u91d1\u90fd\u5230\u8fbe\u83b7\u80dc\u8005\u624b\u4e2d"},
                    "antiCheat": {"title": "\u53cd\u4f5c\u5f04\u4fdd\u62a4", "description": "\u5185\u7f6e VAC\u3001FACEIT AC \u53ca\u4e13\u6709\u68c0\u6d4b\u53cd\u4f5c\u5f04\u7cfb\u7edf"},
                    "payouts": {"title": "\u5373\u65f6\u652f\u4ed8", "description": "\u83b7\u80dc\u8005\u53ef\u5728\u6570\u5206\u949f\u5185\u901a\u8fc7 Stripe\u3001\u52a0\u5bc6\u8d27\u5e01\u6216\u5e73\u53f0\u9322\u5305\u83b7\u5f97\u5956\u91d1"}
                },
                "cta": "\u6d4f\u89c8\u9526\u6807\u8d5b"
            }
        }
    }
}

translation_dir = "lib/i18n/translations"
for locale, new_data in NEW_KEYS.items():
    filepath = os.path.join(translation_dir, f"{locale}.json")
    with open(filepath) as f:
        existing = json.load(f)
    deep_merge(existing, new_data)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)
    print(f"Updated {filepath}")

print("Done!")
