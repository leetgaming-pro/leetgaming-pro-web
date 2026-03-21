#!/usr/bin/env python3
"""
Update leetgaming-pro-web/lib/investors/overview-copy.ts with post-quantum content
across all 5 TierOneLocales: en-US, pt-BR, es-ES, es-LA, zh-CN.

Changes per locale:
1. moatBody — add PQ attestation sentence
2. scoreInfrastructurePillars[0].chips — add "Post-quantum signed" chip
3. scoreInfrastructureStats — add 4th FIPS 203/204/205 stat entry
4. whyNowReasons — add 5th PQ reason
5. ecosystemExpansionCards[2] (Regulated Expansion) — add PQ compliance mention
"""
import os, re, sys

FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                    "../lib/investors/overview-copy.ts")

with open(FILE, "r", encoding="utf-8") as f:
    src = f.read()

original = src

# ── Helper: do a single exact replacement, assert it happened ─────────────
def sub(old, new, src):
    if old not in src:
        print(f"ERROR: pattern not found:\n{old[:120]}", file=sys.stderr)
        sys.exit(1)
    count = src.count(old)
    if count > 1:
        print(f"WARNING: pattern found {count} times, replacing first only", file=sys.stderr)
    return src.replace(old, new, 1)

# ════════════════════════════════════════════════════════════════════════════
# 1. moatBody — append PQ sentence
# ════════════════════════════════════════════════════════════════════════════

# en-US
src = sub(
    'They are the trust layer that connects matchmaking, result verification, dispute handling, prize distribution, rankings, and future external ecosystems such as prediction markets and skill-based wagering infrastructure."',
    'They are the trust layer that connects matchmaking, result verification, dispute handling, prize distribution, rankings, and future external ecosystems such as prediction markets and skill-based wagering infrastructure. Every finalized score now carries a NIST FIPS 203/204 post-quantum cryptographic attestation — infrastructure that rivals and regulators cannot replicate overnight."',
    src
)

# pt-BR
src = sub(
    'Elas são a camada de confiança que conecta matchmaking, verificação de resultados, gestão de disputas, distribuição de prêmios, rankings e futuros ecossistemas externos, como mercados de previsão e infraestrutura de apostas baseadas em habilidade."',
    'Elas são a camada de confiança que conecta matchmaking, verificação de resultados, gestão de disputas, distribuição de prêmios, rankings e futuros ecossistemas externos, como mercados de previsão e infraestrutura de apostas baseadas em habilidade. Cada pontuação finalizada agora carrega uma atestação criptográfica pós-quântica com padrões NIST FIPS 203/204 — infraestrutura que concorrentes e reguladores não podem replicar da noite para o dia."',
    src
)

# es-ES
src = sub(
    'Son la capa de confianza que conecta matchmaking, verificación de resultados, gestión de disputas, distribución de premios, rankings y futuros ecosistemas externos como mercados de predicción e infraestructura de apuestas por habilidad.",',
    'Son la capa de confianza que conecta matchmaking, verificación de resultados, gestión de disputas, distribución de premios, rankings y futuros ecosistemas externos como mercados de predicción e infraestructura de apuestas por habilidad. Cada puntuación finalizada lleva ahora una attestation criptográfica post-cuántica conforme a NIST FIPS 203/204 — infraestructura que competidores y reguladores no pueden replicar de la noche a la mañana.",',
    src
)

# es-LA (has distinct wording: "manejo de disputas" not "gestión de disputas")
src = sub(
    'Son la capa de confianza que conecta matchmaking, verificación de resultados, manejo de disputas, distribución de premios, rankings y futuros ecosistemas externos como mercados de predicción e infraestructura de apuestas por habilidad.",',
    'Son la capa de confianza que conecta matchmaking, verificación de resultados, manejo de disputas, distribución de premios, rankings y futuros ecosistemas externos como mercados de predicción e infraestructura de apuestas por habilidad. Cada puntuación finalizada ahora lleva una attestation criptográfica post-cuántica bajo los estándares NIST FIPS 203/204 — infraestructura que competidores y reguladores no pueden replicar de un día para otro.",',
    src
)

# zh-CN
src = sub(
    '比分并非装饰性功能，而是连接匹配、结果验证、争议处理、奖金分发、排名以及预测市场和技能型竞猜等未来外部生态的信任层。",',
    '比分并非装饰性功能，而是连接匹配、结果验证、争议处理、奖金分发、排名以及预测市场和技能型竞猜等未来外部生态的信任层。每个最终确认的比分现在都携带符合 NIST FIPS 203/204 标准的后量子密码学证明——竞争对手和监管方无法在短期内复制这一基础设施。",',
    src
)

# ════════════════════════════════════════════════════════════════════════════
# 2. scoreInfrastructurePillars[0].chips — add "Post-quantum signed"
# ════════════════════════════════════════════════════════════════════════════

# en-US
src = sub(
    'chips: ["6 data providers", "Consensus verified", "Dispute resistant"],\n      },\n      {\n        title: "Core Product Engine"',
    'chips: ["6 data providers", "Consensus verified", "Dispute resistant", "Post-quantum signed"],\n      },\n      {\n        title: "Core Product Engine"',
    src
)

# pt-BR
src = sub(
    'chips: [\n          "6 provedores de dados",\n          "Consenso verificado",\n          "Resistente a disputas",\n        ],\n      },\n      {\n        title: "Motor central do produto"',
    'chips: [\n          "6 provedores de dados",\n          "Consenso verificado",\n          "Resistente a disputas",\n          "Assinado pós-quântico",\n        ],\n      },\n      {\n        title: "Motor central do produto"',
    src
)

# es-ES
src = sub(
    'chips: [\n          "6 proveedores de datos",\n          "Consenso verificado",\n          "Resistente a disputas",\n        ],\n      },\n      {\n        title: "Motor central del producto"',
    'chips: [\n          "6 proveedores de datos",\n          "Consenso verificado",\n          "Resistente a disputas",\n          "Firmado post-cuántico",\n        ],\n      },\n      {\n        title: "Motor central del producto"',
    src
)

# es-LA (same structure as es-ES for this section)
# We did the es-ES replacement above. Now do es-LA which has the same chips
# but follows a different moat section. Since the chips text is identical to es-ES
# and we replaced it already, let's check if there's a second occurrence.
# The file has es-ES at ~line 550 and es-LA at ~line 660.
# After the es-ES replacement, the es-LA one (same text) still needs replacing.
src = sub(
    'chips: [\n          "6 proveedores de datos",\n          "Consenso verificado",\n          "Resistente a disputas",\n        ],\n      },\n      {\n        title: "Motor central del producto"',
    'chips: [\n          "6 proveedores de datos",\n          "Consenso verificado",\n          "Resistente a disputas",\n          "Firmado post-cuántico",\n        ],\n      },\n      {\n        title: "Motor central del producto"',
    src
)

# zh-CN
src = sub(
    'chips: ["6 个数据提供方", "共识验证", "抗争议"],\n      },\n      {\n        title: "核心产品引擎"',
    'chips: ["6 个数据提供方", "共识验证", "抗争议", "后量子签名"],\n      },\n      {\n        title: "核心产品引擎"',
    src
)

# ════════════════════════════════════════════════════════════════════════════
# 3. scoreInfrastructureStats — add 4th PQ stat
# ════════════════════════════════════════════════════════════════════════════

# en-US
src = sub(
    '      {\n        value: "2",\n        label: "Blockchain targets",\n        caption:\n          "Designed for verified settlement and portable score attestations.",\n      },\n    ],\n    ecosystemExpansionCards: [\n      {\n        title: "Internal Moat"',
    '      {\n        value: "2",\n        label: "Blockchain targets",\n        caption:\n          "Designed for verified settlement and portable score attestations.",\n      },\n      {\n        value: "FIPS 203/204/205",\n        label: "Post-quantum standards",\n        caption:\n          "NIST-standardised ML-KEM, ML-DSA, and SLH-DSA protect every score attestation against quantum adversaries.",\n      },\n    ],\n    ecosystemExpansionCards: [\n      {\n        title: "Internal Moat"',
    src
)

# pt-BR
src = sub(
    '      {\n        value: "2",\n        label: "Alvos em blockchain",\n        caption:\n          "Projetado para liquidação verificada e atestações portáteis de pontuação.",\n      },\n    ],\n    ecosystemExpansionCards: [\n      {\n        title: "Moat interno"',
    '      {\n        value: "2",\n        label: "Alvos em blockchain",\n        caption:\n          "Projetado para liquidação verificada e atestações portáteis de pontuação.",\n      },\n      {\n        value: "FIPS 203/204/205",\n        label: "Padrões pós-quânticos",\n        caption:\n          "ML-KEM, ML-DSA e SLH-DSA certificados pelo NIST protegem cada atestação de pontuação contra adversários quânticos.",\n      },\n    ],\n    ecosystemExpansionCards: [\n      {\n        title: "Moat interno"',
    src
)

# es-ES
src = sub(
    '      {\n        value: "2",\n        label: "Objetivos blockchain",\n        caption:\n          "Diseñado para liquidación verificada y attestations portátiles de puntuación.",\n      },\n    ],\n    ecosystemExpansionCards: [\n      {\n        title: "Moat interno"',
    '      {\n        value: "2",\n        label: "Objetivos blockchain",\n        caption:\n          "Diseñado para liquidación verificada y attestations portátiles de puntuación.",\n      },\n      {\n        value: "FIPS 203/204/205",\n        label: "Estándares post-cuánticos",\n        caption:\n          "ML-KEM, ML-DSA y SLH-DSA estandarizados por NIST protegen cada attestation de puntuación frente a adversarios cuánticos.",\n      },\n    ],\n    ecosystemExpansionCards: [\n      {\n        title: "Moat interno"',
    src
)

# es-LA (same "Objetivos blockchain" / "Moat interno" pattern)
src = sub(
    '      {\n        value: "2",\n        label: "Objetivos blockchain",\n        caption:\n          "Diseñado para liquidación verificada y attestations portables de puntuación.",\n      },\n    ],\n    ecosystemExpansionCards: [\n      {\n        title: "Moat interno"',
    '      {\n        value: "2",\n        label: "Objetivos blockchain",\n        caption:\n          "Diseñado para liquidación verificada y attestations portables de puntuación.",\n      },\n      {\n        value: "FIPS 203/204/205",\n        label: "Estándares post-cuánticos",\n        caption:\n          "ML-KEM, ML-DSA y SLH-DSA normalizados por NIST protegen cada attestation de puntuación ante adversarios cuánticos.",\n      },\n    ],\n    ecosystemExpansionCards: [\n      {\n        title: "Moat interno"',
    src
)

# zh-CN
src = sub(
    '      {\n        value: "2",\n        label: "区块链目标",\n        caption: "为经验证结算和可移植比分证明而设计。",\n      },\n    ],\n    ecosystemExpansionCards: [\n      {\n        title: "内部护城河"',
    '      {\n        value: "2",\n        label: "区块链目标",\n        caption: "为经验证结算和可移植比分证明而设计。",\n      },\n      {\n        value: "FIPS 203/204/205",\n        label: "后量子标准",\n        caption: "NIST 标准化的 ML-KEM、ML-DSA 和 SLH-DSA 保护每条比分证明，抵御量子攻击者的威胁。",\n      },\n    ],\n    ecosystemExpansionCards: [\n      {\n        title: "内部护城河"',
    src
)

# ════════════════════════════════════════════════════════════════════════════
# 4. whyNowReasons — add 5th PQ reason
# ════════════════════════════════════════════════════════════════════════════

# en-US
src = sub(
    '      "No single platform integrates analytics + competition + earning — we are the first full-stack solution",\n    ],\n    scoreInfrastructurePillars: [',
    '      "No single platform integrates analytics + competition + earning — we are the first full-stack solution",\n      "NIST finalised post-quantum cryptography standards (FIPS 203/204/205) in August 2024 — LeetGaming Pro is the first esports platform to adopt them for competitive result integrity, staying ahead of harvest-now-decrypt-later threats to prize records",\n    ],\n    scoreInfrastructurePillars: [',
    src
)

# pt-BR
src = sub(
    '      "Nenhuma plataforma integra analytics + competição + ganhos — somos a primeira solução full-stack",\n    ],\n    scoreInfrastructurePillars: [',
    '      "Nenhuma plataforma integra analytics + competição + ganhos — somos a primeira solução full-stack",\n      "O NIST finalizou os padrões de criptografia pós-quântica (FIPS 203/204/205) em agosto de 2024 — a LeetGaming Pro é a primeira plataforma de esports a adotá-los para integridade de resultados competitivos, antecipando-se às ameaças de \'harvest-now-decrypt-later\' a registros de prêmios",\n    ],\n    scoreInfrastructurePillars: [',
    src
)

# es-ES
src = sub(
    '      "Ninguna plataforma integra analítica + competición + monetización: somos la primera solución full-stack",\n    ],\n    scoreInfrastructurePillars: [',
    '      "Ninguna plataforma integra analítica + competición + monetización: somos la primera solución full-stack",\n      "El NIST finalizó los estándares de criptografía post-cuántica (FIPS 203/204/205) en agosto de 2024 — LeetGaming Pro es la primera plataforma de esports que los adopta para la integridad de resultados competitivos, anticipándose a las amenazas de \'recolectar ahora, descifrar después\' sobre registros de premios",\n    ],\n    scoreInfrastructurePillars: [',
    src
)

# es-LA
src = sub(
    '      "Ninguna plataforma integra analítica + competencia + monetización: somos la primera solución full-stack",\n    ],\n    scoreInfrastructurePillars: [',
    '      "Ninguna plataforma integra analítica + competencia + monetización: somos la primera solución full-stack",\n      "El NIST finalizó los estándares de criptografía post-cuántica (FIPS 203/204/205) en agosto de 2024 — LeetGaming Pro es la primera plataforma de esports en adoptarlos para la integridad de resultados competitivos, anticipando las amenazas de \'recolectar ahora, descifrar después\' sobre registros de premios",\n    ],\n    scoreInfrastructurePillars: [',
    src
)

# zh-CN
src = sub(
    '      "目前没有任何平台同时整合分析 + 竞技 + 收益——我们是首个全栈解决方案",\n    ],\n    scoreInfrastructurePillars: [',
    '      "目前没有任何平台同时整合分析 + 竞技 + 收益——我们是首个全栈解决方案",\n      "NIST 于 2024 年 8 月正式发布后量子密码学标准（FIPS 203/204/205）——LeetGaming Pro 是首个将其应用于竞技结果integrity的电竞平台，提前应对针对奖金记录的"立即采集、未来解密"量子威胁",\n    ],\n    scoreInfrastructurePillars: [',
    src
)

# ════════════════════════════════════════════════════════════════════════════
# 5. ecosystemExpansionCards[2] — Regulated Expansion — add PQ mention
# ════════════════════════════════════════════════════════════════════════════

# en-US
src = sub(
    '      {\n        title: "Regulated Expansion",\n        description:\n          "Use cases extend beyond our app into prediction and skill-based ecosystems without relying on opaque manual adjudication.",\n      },\n    ],\n    revenueStreams: [',
    '      {\n        title: "Regulated Expansion",\n        description:\n          "Use cases extend beyond our app into prediction and skill-based ecosystems without relying on opaque manual adjudication. Post-quantum cryptographic compliance (NIST FIPS 203/204/205) positions LeetGaming Pro for the financial-grade requirements emerging in regulated wagering jurisdictions globally.",\n      },\n    ],\n    revenueStreams: [',
    src
)

# pt-BR
src = sub(
    '      {\n        title: "Expansão regulada",\n        description:\n          "Os casos de uso vão além do nosso app para ecossistemas de previsão e habilidade sem depender de adjudicação manual opaca.",\n      },\n    ],\n    revenueStreams: [',
    '      {\n        title: "Expansão regulada",\n        description:\n          "Os casos de uso vão além do nosso app para ecossistemas de previsão e habilidade sem depender de adjudicação manual opaca. A conformidade com criptografia pós-quântica (NIST FIPS 203/204/205) posiciona a LeetGaming Pro para os requisitos financeiros emergentes em jurisdições reguladas de apostas em todo o mundo.",\n      },\n    ],\n    revenueStreams: [',
    src
)

# es-ES
src = sub(
    '      {\n        title: "Expansión regulada",\n        description:\n          "Los casos de uso se extienden más allá de nuestra app a ecosistemas de predicción y habilidad sin depender de adjudicación manual opaca.",\n      },\n    ],\n    revenueStreams: [',
    '      {\n        title: "Expansión regulada",\n        description:\n          "Los casos de uso se extienden más allá de nuestra app a ecosistemas de predicción y habilidad sin depender de adjudicación manual opaca. El cumplimiento de criptografía post-cuántica (NIST FIPS 203/204/205) posiciona a LeetGaming Pro para los requisitos financieros que emergen en las jurisdicciones reguladas de apuestas de todo el mundo.",\n      },\n    ],\n    revenueStreams: [',
    src
)

# es-LA
src = sub(
    '      {\n        title: "Expansión regulada",\n        description:\n          "Los casos de uso van más allá de nuestra app hacia ecosistemas de predicción y habilidad sin depender de adjudicación manual opaca.",\n      },\n    ],\n    revenueStreams: [',
    '      {\n        title: "Expansión regulada",\n        description:\n          "Los casos de uso van más allá de nuestra app hacia ecosistemas de predicción y habilidad sin depender de adjudicación manual opaca. El cumplimiento de criptografía post-cuántica (NIST FIPS 203/204/205) posiciona a LeetGaming Pro para los requisitos financieros que emergen en las jurisdicciones reguladas de apuestas a nivel global.",\n      },\n    ],\n    revenueStreams: [',
    src
)

# zh-CN
src = sub(
    '      {\n        title: "合规扩张",\n        description:\n          "应用场景可延伸至我们的应用之外，进入预测和技能型生态，而不依赖不透明的人工裁定。",\n      },\n    ],\n    revenueStreams: [',
    '      {\n        title: "合规扩张",\n        description:\n          "应用场景可延伸至我们的应用之外，进入预测和技能型生态，而不依赖不透明的人工裁定。后量子密码学合规性（NIST FIPS 203/204/205）使 LeetGaming Pro 满足全球受监管博彩司法管辖区日益严格的金融级要求。",\n      },\n    ],\n    revenueStreams: [',
    src
)

# ════════════════════════════════════════════════════════════════════════════
# Write the file
# ════════════════════════════════════════════════════════════════════════════
if src == original:
    print("ERROR: No changes were made!", file=sys.stderr)
    sys.exit(1)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(src)

# Count changes
changes = sum(1 for a, b in zip(original.split("\n"), src.split("\n")) if a != b)
print(f"OK — updated {FILE}")
print(f"Lines changed: approx {abs(len(src.split(chr(10))) - len(original.split(chr(10))))} net new lines")
