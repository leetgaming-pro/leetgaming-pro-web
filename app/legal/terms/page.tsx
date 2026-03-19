import { Metadata } from "next";
import {
  formatLocalizedDate,
  getServerI18n,
  getTierOneLocale,
} from "@/lib/i18n/server";

const termsCopy = {
  "en-US": {
    titles: [
      "1. Acceptance of Terms",
      "2. Eligibility",
      "3. Account Registration",
      "4. Fair Play and Conduct",
      "5. Intellectual Property",
      "6. Premium Services and Payments",
      "7. Prize Pools, Winnings, and Cashouts",
      "8. Content Guidelines",
      "9. Disclaimers",
      "10. Limitation of Liability",
      "11. Indemnification",
      "12. Modifications to Terms",
      "13. Termination",
      "14. Governing Law",
      "15. Severability",
      "16. Contact Information",
    ],
    intro: [
      'Welcome to LeetGaming.PRO. By accessing or using our platform, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use our services.',
      "These Terms apply to all users, including players, team captains, tournament organizers, and spectators. Additional terms may apply to specific features or services.",
      "LeetGaming.PRO is an adults-only platform. Account creation, gameplay access, subscriptions, deposits, withdrawals, prize claims, cashouts, and other money-flow features are only available to users who satisfy the minimum legal age and eligibility rules described in these Terms.",
    ],
    eligibilityIntro: "To use LeetGaming.PRO, you must:",
    eligibilityItems: [
      "Be at least 18 years of age to create an account and use the platform",
      "Meet any higher minimum age, age of majority, or legal eligibility requirement that applies in your jurisdiction or to a specific feature, including 21+ requirements where applicable",
      "Have the legal capacity to enter into these Terms",
      "Not be prohibited from using our services under applicable laws",
      "Not have been previously banned from our platform",
    ],
    eligibilityBody:
      "We may request date-of-birth, identity, payment-method, residency, or other verification at any time to confirm your eligibility. If you do not pass verification, or if we reasonably believe you are underage or otherwise ineligible, we may deny access, limit features, freeze payouts, or suspend or terminate your account.",
    accountIntro: "When creating an account, you agree to:",
    accountItems: [
      "Provide accurate and complete information",
      "Provide truthful age, identity, residency, and payment information when requested",
      "Maintain the security of your account credentials",
      "Notify us immediately of any unauthorized access",
      "Accept responsibility for all activities under your account",
      "Not share your account with others",
      "Not create multiple accounts to circumvent restrictions",
    ],
    accountBody:
      "We reserve the right to suspend or terminate accounts that violate these Terms, including accounts created by or for persons under 18 or users who misrepresent their legal eligibility.",
    fairPlayIntro:
      "LeetGaming.PRO is committed to maintaining a fair and competitive environment. You agree to:",
    fairPlayItems: [
      "Play fairly and not use cheats, hacks, or exploits",
      "Not use unauthorized third-party software that provides unfair advantages",
      "Not manipulate matches or participate in match-fixing",
      "Not boost accounts or engage in skill manipulation",
      "Respect other players and maintain sportsmanlike conduct",
      "Not harass, threaten, or abuse other users",
      "Not use offensive or inappropriate usernames or content",
      "Comply with all tournament rules when participating in competitions",
    ],
    fairPlayBody:
      "Violations may result in warnings, temporary suspensions, permanent bans, or forfeiture of winnings and prizes.",
    intellectualIntro:
      "LeetGaming.PRO and its content are protected by intellectual property laws. You acknowledge that:",
    intellectualItems: [
      "We own or license all platform content, designs, and technology",
      "You may not copy, modify, or distribute our content without permission",
      "Game replays and statistics may be used by us for platform features",
      "User-generated content remains yours, but you grant us a license to use it",
    ],
    intellectualBody:
      "Third-party game content (CS2, Valorant, etc.) belongs to their respective owners and is used under their terms of service.",
    premiumIntro:
      "Some features require payment. By purchasing premium services:",
    premiumItems: [
      "You represent and warrant that you are at least 18 years old and legally permitted to complete the transaction",
      "You authorize us to charge your selected payment method",
      "Subscriptions auto-renew unless cancelled before the renewal date",
      "Prices may change with notice before your next billing cycle",
      "Refunds are handled according to our refund policy",
      "Virtual items and currency have no real-world value and cannot be exchanged",
    ],
    premiumBody:
      "All prices are displayed in the currency selected at checkout and include applicable taxes. Deposits, withdrawals, subscriptions, and other money-flow features may be subject to age, identity, AML, KYC, sanctions, and regional eligibility checks before they are completed.",
    prizeIntro: "For tournaments with prize pools:",
    prizeItems: [
      "Prize participation, cashouts, and other money-movement features are limited to eligible adult users and only where lawful",
      "Prizes are distributed according to tournament rules",
      "You must verify your identity to claim significant prizes",
      "You are responsible for any taxes on your winnings",
      "Prizes may be forfeited for rule violations",
      "We reserve the right to modify prize structures before tournaments begin",
    ],
    prizeBody:
      "Participation in prize competitions may have additional age, licensing, verification, and legal requirements based on your jurisdiction. Some jurisdictions or regulated features may require you to be at least 21 years old.",
    contentIntro:
      "When uploading content (profiles, replays, messages), you agree not to post:",
    contentItems: [
      "Illegal or harmful content",
      "Content that infringes intellectual property rights",
      "Hateful, discriminatory, or offensive material",
      "Spam, advertisements, or promotional content",
      "Personal information of others without consent",
      "Malware or malicious code",
    ],
    disclaimersIntro:
      'LeetGaming.PRO is provided "as is" without warranties of any kind. We do not guarantee:',
    disclaimersItems: [
      "Uninterrupted or error-free service",
      "Accuracy of statistics or rankings",
      "Compatibility with all games or game updates",
      "Availability of specific features or services",
    ],
    disclaimersBody:
      "We are not responsible for actions of other users or third-party services.",
    liabilityBody:
      "To the maximum extent permitted by law, LeetGaming.PRO shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of or inability to use our services, even if we have been advised of the possibility of such damages.",
    indemnificationBody:
      "You agree to indemnify and hold harmless LeetGaming.PRO and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your violation of these Terms or your use of our services.",
    modificationsBody:
      "We may modify these Terms at any time. Material changes will be communicated through our platform or via email. Your continued use after changes take effect constitutes acceptance of the modified Terms. If you do not agree to the changes, you must stop using our services.",
    terminationIntro:
      "We may suspend or terminate your access to LeetGaming.PRO at any time for violation of these Terms or for any other reason at our discretion. Upon termination:",
    terminationItems: [
      "Your right to use the platform ceases immediately",
      "We may delete your account and data",
      "You forfeit any unredeemed virtual items or currency",
      "We may withhold or reverse deposits, withdrawals, or prize claims pending eligibility review where permitted by law",
      "Provisions that should survive termination will remain in effect",
    ],
    governingLawBody:
      "These Terms are governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or your use of our services shall be resolved through binding arbitration or in the courts of the applicable jurisdiction.",
    severabilityBody:
      "If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.",
    contactIntro: "For questions about these Terms, please contact us:",
    emailLabel: "Email:",
    supportLabel: "Support:",
  },
  "pt-BR": {
    titles: [
      "1. Aceitação dos Termos",
      "2. Elegibilidade",
      "3. Cadastro de Conta",
      "4. Jogo Limpo e Conduta",
      "5. Propriedade Intelectual",
      "6. Serviços Premium e Pagamentos",
      "7. Premiações, Ganhos e Cashouts",
      "8. Diretrizes de Conteúdo",
      "9. Isenções de Responsabilidade",
      "10. Limitação de Responsabilidade",
      "11. Indenização",
      "12. Alterações dos Termos",
      "13. Encerramento",
      "14. Lei Aplicável",
      "15. Independência das Cláusulas",
      "16. Informações de Contato",
    ],
    intro: [
      'Bem-vindo à LeetGaming.PRO. Ao acessar ou usar nossa plataforma, você concorda em ficar vinculado a estes Termos de Serviço ("Termos"). Se não concordar com estes Termos, você não poderá usar nossos serviços.',
      "Estes Termos se aplicam a todos os usuários, incluindo jogadores, capitães de equipe, organizadores de torneios e espectadores. Termos adicionais podem se aplicar a funcionalidades ou serviços específicos.",
      "A LeetGaming.PRO é uma plataforma exclusiva para adultos. Criação de conta, acesso ao jogo, assinaturas, depósitos, saques, resgate de prêmios, cashouts e outros recursos com fluxo financeiro só estão disponíveis para usuários que cumpram a idade mínima legal e as regras de elegibilidade descritas nestes Termos.",
    ],
    eligibilityIntro: "Para usar a LeetGaming.PRO, você deve:",
    eligibilityItems: [
      "Ter pelo menos 18 anos para criar uma conta e usar a plataforma",
      "Cumprir qualquer idade mínima superior, maioridade civil ou exigência de elegibilidade legal aplicável à sua jurisdição ou a um recurso específico, incluindo requisitos 21+ quando aplicável",
      "Ter capacidade legal para celebrar estes Termos",
      "Não estar proibido de usar nossos serviços pelas leis aplicáveis",
      "Não ter sido previamente banido da plataforma",
    ],
    eligibilityBody:
      "Podemos solicitar data de nascimento, identidade, método de pagamento, residência ou outras verificações a qualquer momento para confirmar sua elegibilidade. Se você não passar na verificação, ou se acreditarmos razoavelmente que é menor de idade ou inelegível, poderemos negar acesso, limitar funcionalidades, congelar pagamentos ou suspender/encerrar sua conta.",
    accountIntro: "Ao criar uma conta, você concorda em:",
    accountItems: [
      "Fornecer informações precisas e completas",
      "Fornecer informações verdadeiras sobre idade, identidade, residência e pagamento quando solicitadas",
      "Manter a segurança das credenciais da sua conta",
      "Nos notificar imediatamente sobre qualquer acesso não autorizado",
      "Assumir responsabilidade por todas as atividades realizadas na sua conta",
      "Não compartilhar sua conta com terceiros",
      "Não criar múltiplas contas para contornar restrições",
    ],
    accountBody:
      "Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos, incluindo contas criadas por ou para menores de 18 anos ou usuários que falseiem sua elegibilidade legal.",
    fairPlayIntro:
      "A LeetGaming.PRO está comprometida em manter um ambiente justo e competitivo. Você concorda em:",
    fairPlayItems: [
      "Jogar de forma justa e não usar cheats, hacks ou exploits",
      "Não usar softwares não autorizados de terceiros que ofereçam vantagem injusta",
      "Não manipular partidas nem participar de match-fixing",
      "Não impulsionar contas nem manipular nível de habilidade",
      "Respeitar outros jogadores e manter conduta esportiva",
      "Não assediar, ameaçar ou abusar de outros usuários",
      "Não usar nomes de usuário ou conteúdo ofensivo ou inadequado",
      "Cumprir todas as regras de torneio ao participar de competições",
    ],
    fairPlayBody:
      "Violações podem resultar em advertências, suspensões temporárias, banimentos permanentes ou perda de ganhos e prêmios.",
    intellectualIntro:
      "A LeetGaming.PRO e seu conteúdo são protegidos por leis de propriedade intelectual. Você reconhece que:",
    intellectualItems: [
      "Somos proprietários ou licenciados de todo o conteúdo, design e tecnologia da plataforma",
      "Você não pode copiar, modificar ou distribuir nosso conteúdo sem permissão",
      "Replays e estatísticas de jogos podem ser usados por nós em funcionalidades da plataforma",
      "O conteúdo gerado pelo usuário continua sendo seu, mas você nos concede licença para utilizá-lo",
    ],
    intellectualBody:
      "Conteúdo de jogos de terceiros (CS2, Valorant etc.) pertence aos respectivos proprietários e é usado conforme seus termos de serviço.",
    premiumIntro:
      "Alguns recursos exigem pagamento. Ao adquirir serviços premium:",
    premiumItems: [
      "Você declara e garante ter pelo menos 18 anos e estar legalmente autorizado a concluir a transação",
      "Você nos autoriza a cobrar o método de pagamento selecionado",
      "As assinaturas são renovadas automaticamente, salvo cancelamento antes da renovação",
      "Os preços podem mudar mediante aviso antes do próximo ciclo de cobrança",
      "Reembolsos são tratados de acordo com nossa política de reembolso",
      "Itens virtuais e moedas não possuem valor no mundo real e não podem ser trocados",
    ],
    premiumBody:
      "Todos os preços são exibidos na moeda selecionada no checkout e incluem impostos aplicáveis. Depósitos, saques, assinaturas e outros recursos financeiros podem estar sujeitos a verificações de idade, identidade, AML, KYC, sanções e elegibilidade regional antes da conclusão.",
    prizeIntro: "Para torneios com premiação:",
    prizeItems: [
      "Participação em prêmios, cashouts e outros recursos de movimentação financeira é limitada a usuários adultos elegíveis e apenas onde for legal",
      "Os prêmios são distribuídos de acordo com as regras do torneio",
      "Você deve verificar sua identidade para reivindicar prêmios significativos",
      "Você é responsável por quaisquer impostos sobre seus ganhos",
      "Prêmios podem ser perdidos em caso de violação de regras",
      "Reservamo-nos o direito de alterar a estrutura de premiação antes do início dos torneios",
    ],
    prizeBody:
      "A participação em competições com prêmio pode ter exigências adicionais de idade, licenciamento, verificação e requisitos legais conforme sua jurisdição. Algumas jurisdições ou recursos regulados podem exigir idade mínima de 21 anos.",
    contentIntro:
      "Ao enviar conteúdo (perfis, replays, mensagens), você concorda em não publicar:",
    contentItems: [
      "Conteúdo ilegal ou prejudicial",
      "Conteúdo que infrinja direitos de propriedade intelectual",
      "Material odioso, discriminatório ou ofensivo",
      "Spam, anúncios ou conteúdo promocional",
      "Informações pessoais de terceiros sem consentimento",
      "Malware ou código malicioso",
    ],
    disclaimersIntro:
      'A LeetGaming.PRO é fornecida "no estado em que se encontra", sem garantias de qualquer tipo. Não garantimos:',
    disclaimersItems: [
      "Serviço ininterrupto ou sem erros",
      "Precisão de estatísticas ou rankings",
      "Compatibilidade com todos os jogos ou atualizações",
      "Disponibilidade de recursos ou serviços específicos",
    ],
    disclaimersBody:
      "Não somos responsáveis por atos de outros usuários ou de serviços de terceiros.",
    liabilityBody:
      "Na máxima extensão permitida por lei, a LeetGaming.PRO não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo perda de lucros, dados ou goodwill, decorrentes do uso ou da incapacidade de uso dos nossos serviços, mesmo se tivermos sido avisados da possibilidade desses danos.",
    indemnificationBody:
      "Você concorda em indenizar e isentar a LeetGaming.PRO, seus diretores, administradores, empregados e agentes de quaisquer reivindicações, danos, perdas ou despesas decorrentes da sua violação destes Termos ou do uso dos nossos serviços.",
    modificationsBody:
      "Podemos modificar estes Termos a qualquer momento. Mudanças materiais serão comunicadas na plataforma ou por e-mail. Seu uso contínuo após a vigência das mudanças constitui aceitação dos Termos modificados. Se você não concordar com as mudanças, deve interromper o uso dos serviços.",
    terminationIntro:
      "Podemos suspender ou encerrar seu acesso à LeetGaming.PRO a qualquer momento por violação destes Termos ou por qualquer outro motivo a nosso critério. Em caso de encerramento:",
    terminationItems: [
      "Seu direito de usar a plataforma cessa imediatamente",
      "Podemos excluir sua conta e dados",
      "Você perde quaisquer itens virtuais ou moedas não resgatados",
      "Podemos reter ou reverter depósitos, saques ou reivindicações de prêmios pendentes de revisão de elegibilidade, quando permitido por lei",
      "Disposições que devam sobreviver ao encerramento permanecerão em vigor",
    ],
    governingLawBody:
      "Estes Termos são regidos e interpretados de acordo com as leis aplicáveis. Quaisquer disputas decorrentes destes Termos ou do uso dos nossos serviços serão resolvidas por arbitragem vinculante ou perante os tribunais da jurisdição aplicável.",
    severabilityBody:
      "Se qualquer disposição destes Termos for considerada inexequível ou inválida, essa disposição será limitada ou eliminada na medida mínima necessária, e as demais disposições permanecerão em pleno vigor e efeito.",
    contactIntro: "Para dúvidas sobre estes Termos, entre em contato conosco:",
    emailLabel: "E-mail:",
    supportLabel: "Suporte:",
  },
  "es-ES": {
    titles: [
      "1. Aceptación de los Términos",
      "2. Requisitos de Elegibilidad",
      "3. Registro de Cuenta",
      "4. Juego Limpio y Conducta",
      "5. Propiedad Intelectual",
      "6. Servicios Premium y Pagos",
      "7. Premios, Ganancias y Retiros",
      "8. Normas de Contenido",
      "9. Exenciones de Responsabilidad",
      "10. Limitación de Responsabilidad",
      "11. Indemnización",
      "12. Modificaciones de los Términos",
      "13. Terminación",
      "14. Ley Aplicable",
      "15. Divisibilidad",
      "16. Información de Contacto",
    ],
    intro: [
      'Bienvenido a LeetGaming.PRO. Al acceder o utilizar nuestra plataforma, aceptas quedar vinculado por estos Términos de Servicio ("Términos"). Si no estás de acuerdo con ellos, no puedes utilizar nuestros servicios.',
      "Estos Términos se aplican a todos los usuarios, incluidos jugadores, capitanes de equipo, organizadores de torneos y espectadores. Pueden aplicarse condiciones adicionales a funciones o servicios específicos.",
      "LeetGaming.PRO es una plataforma exclusiva para adultos. La creación de cuentas, el acceso al juego, las suscripciones, los depósitos, las retiradas, las reclamaciones de premios, los cashouts y otras funciones con flujo de dinero solo están disponibles para usuarios que cumplan la edad mínima legal y las normas de elegibilidad descritas en estos Términos.",
    ],
    eligibilityIntro: "Para usar LeetGaming.PRO, debes:",
    eligibilityItems: [
      "Tener al menos 18 años para crear una cuenta y utilizar la plataforma",
      "Cumplir cualquier edad mínima superior, mayoría de edad o requisito de elegibilidad legal aplicable en tu jurisdicción o a una función concreta, incluidos los requisitos 21+ cuando proceda",
      "Tener capacidad legal para aceptar estos Términos",
      "No tener prohibido el uso de nuestros servicios conforme a la legislación aplicable",
      "No haber sido expulsado previamente de la plataforma",
    ],
    eligibilityBody:
      "Podemos solicitar fecha de nacimiento, identidad, método de pago, residencia u otra verificación en cualquier momento para confirmar tu elegibilidad. Si no superas la verificación, o si creemos razonablemente que eres menor de edad o no elegible, podremos denegar el acceso, limitar funciones, congelar pagos o suspender o cancelar tu cuenta.",
    accountIntro: "Al crear una cuenta, aceptas:",
    accountItems: [
      "Proporcionar información exacta y completa",
      "Facilitar información veraz sobre edad, identidad, residencia y pago cuando se solicite",
      "Mantener la seguridad de las credenciales de tu cuenta",
      "Notificarnos de inmediato cualquier acceso no autorizado",
      "Asumir la responsabilidad de toda actividad realizada desde tu cuenta",
      "No compartir tu cuenta con otras personas",
      "No crear varias cuentas para eludir restricciones",
    ],
    accountBody:
      "Nos reservamos el derecho de suspender o cancelar cuentas que infrinjan estos Términos, incluidas las creadas por o para menores de 18 años o usuarios que falseen su elegibilidad legal.",
    fairPlayIntro:
      "LeetGaming.PRO se compromete a mantener un entorno justo y competitivo. Aceptas:",
    fairPlayItems: [
      "Jugar limpiamente y no utilizar trampas, hacks ni exploits",
      "No usar software no autorizado de terceros que otorgue ventajas injustas",
      "No manipular partidas ni participar en amaños",
      "No alterar cuentas ni manipular el nivel de habilidad",
      "Respetar a otros jugadores y mantener una conducta deportiva",
      "No acosar, amenazar ni abusar de otros usuarios",
      "No utilizar nombres de usuario o contenidos ofensivos o inapropiados",
      "Cumplir todas las reglas de los torneos al participar en competiciones",
    ],
    fairPlayBody:
      "Las infracciones pueden dar lugar a advertencias, suspensiones temporales, expulsiones permanentes o pérdida de premios y ganancias.",
    intellectualIntro:
      "LeetGaming.PRO y su contenido están protegidos por las leyes de propiedad intelectual. Reconoces que:",
    intellectualItems: [
      "Somos propietarios o licenciatarios de todo el contenido, diseño y tecnología de la plataforma",
      "No puedes copiar, modificar ni distribuir nuestro contenido sin permiso",
      "Los replays y las estadísticas de juego pueden ser utilizados por nosotros para funcionalidades de la plataforma",
      "El contenido generado por el usuario sigue siendo tuyo, pero nos concedes una licencia para utilizarlo",
    ],
    intellectualBody:
      "El contenido de juegos de terceros (CS2, Valorant, etc.) pertenece a sus respectivos propietarios y se utiliza conforme a sus términos de servicio.",
    premiumIntro:
      "Algunas funciones requieren pago. Al adquirir servicios premium:",
    premiumItems: [
      "Declaras y garantizas que tienes al menos 18 años y que estás legalmente autorizado para completar la transacción",
      "Nos autorizas a cargar el método de pago seleccionado",
      "Las suscripciones se renuevan automáticamente salvo cancelación antes de la fecha de renovación",
      "Los precios pueden cambiar con aviso previo antes de tu siguiente ciclo de facturación",
      "Los reembolsos se gestionan conforme a nuestra política de reembolsos",
      "Los artículos virtuales y la moneda virtual no tienen valor en el mundo real y no pueden canjearse",
    ],
    premiumBody:
      "Todos los precios se muestran en la moneda seleccionada en el checkout e incluyen los impuestos aplicables. Los depósitos, retiradas, suscripciones y otras funciones de flujo de dinero pueden estar sujetos a controles de edad, identidad, AML, KYC, sanciones y elegibilidad regional antes de completarse.",
    prizeIntro: "Para los torneos con premios:",
    prizeItems: [
      "La participación en premios, cashouts y otras funciones de movimiento de dinero se limita a usuarios adultos elegibles y solo cuando sea legal",
      "Los premios se distribuyen según las reglas del torneo",
      "Debes verificar tu identidad para reclamar premios importantes",
      "Eres responsable de los impuestos aplicables a tus ganancias",
      "Los premios pueden perderse por infracción de las reglas",
      "Nos reservamos el derecho de modificar la estructura de premios antes del inicio de los torneos",
    ],
    prizeBody:
      "La participación en competiciones con premios puede implicar requisitos adicionales de edad, licencia, verificación y legalidad según tu jurisdicción. Algunas jurisdicciones o funciones reguladas pueden exigir que tengas al menos 21 años.",
    contentIntro:
      "Al subir contenido (perfiles, replays, mensajes), aceptas no publicar:",
    contentItems: [
      "Contenido ilegal o dañino",
      "Contenido que infrinja derechos de propiedad intelectual",
      "Material de odio, discriminatorio u ofensivo",
      "Spam, anuncios o contenido promocional",
      "Información personal de terceros sin consentimiento",
      "Malware o código malicioso",
    ],
    disclaimersIntro:
      'LeetGaming.PRO se proporciona "tal cual", sin garantías de ningún tipo. No garantizamos:',
    disclaimersItems: [
      "Un servicio ininterrumpido o libre de errores",
      "La exactitud de estadísticas o clasificaciones",
      "La compatibilidad con todos los juegos o sus actualizaciones",
      "La disponibilidad de funciones o servicios específicos",
    ],
    disclaimersBody:
      "No somos responsables de las acciones de otros usuarios ni de servicios de terceros.",
    liabilityBody:
      "En la máxima medida permitida por la ley, LeetGaming.PRO no será responsable de daños indirectos, incidentales, especiales, consecuenciales o punitivos, incluida la pérdida de beneficios, datos o reputación, derivados del uso o de la imposibilidad de usar nuestros servicios, incluso si hubiéramos sido advertidos de la posibilidad de tales daños.",
    indemnificationBody:
      "Aceptas indemnizar y mantener indemne a LeetGaming.PRO y a sus directivos, administradores, empleados y agentes frente a cualquier reclamación, daño, pérdida o gasto derivado de tu incumplimiento de estos Términos o del uso de nuestros servicios.",
    modificationsBody:
      "Podemos modificar estos Términos en cualquier momento. Los cambios sustanciales se comunicarán a través de la plataforma o por correo electrónico. El uso continuado tras la entrada en vigor de los cambios constituye aceptación de los Términos modificados. Si no estás de acuerdo con los cambios, debes dejar de utilizar nuestros servicios.",
    terminationIntro:
      "Podemos suspender o cancelar tu acceso a LeetGaming.PRO en cualquier momento por incumplimiento de estos Términos o por cualquier otra razón a nuestra discreción. En caso de terminación:",
    terminationItems: [
      "Tu derecho a usar la plataforma cesa inmediatamente",
      "Podemos eliminar tu cuenta y tus datos",
      "Pierdes cualquier artículo virtual o moneda no canjeada",
      "Podemos retener o revertir depósitos, retiradas o reclamaciones de premios pendientes de revisión de elegibilidad cuando la ley lo permita",
      "Las disposiciones que deban sobrevivir a la terminación seguirán vigentes",
    ],
    governingLawBody:
      "Estos Términos se rigen e interpretan conforme a la legislación aplicable. Cualquier disputa derivada de estos Términos o del uso de nuestros servicios se resolverá mediante arbitraje vinculante o ante los tribunales de la jurisdicción aplicable.",
    severabilityBody:
      "Si alguna disposición de estos Términos se considera inaplicable o inválida, dicha disposición se limitará o eliminará en la medida mínima necesaria, y el resto de disposiciones seguirá plenamente vigente.",
    contactIntro: "Si tienes preguntas sobre estos Términos, contáctanos:",
    emailLabel: "Correo electrónico:",
    supportLabel: "Soporte:",
  },
  "es-LA": {
    titles: [
      "1. Aceptación de los Términos",
      "2. Requisitos de Elegibilidad",
      "3. Registro de Cuenta",
      "4. Juego Limpio y Conducta",
      "5. Propiedad Intelectual",
      "6. Servicios Premium y Pagos",
      "7. Premios, Ganancias y Retiros",
      "8. Reglas de Contenido",
      "9. Descargos de Responsabilidad",
      "10. Limitación de Responsabilidad",
      "11. Indemnización",
      "12. Cambios en los Términos",
      "13. Terminación",
      "14. Ley Aplicable",
      "15. Separabilidad",
      "16. Información de Contacto",
    ],
    intro: [
      'Bienvenido a LeetGaming.PRO. Al acceder o usar nuestra plataforma, aceptas quedar sujeto a estos Términos de Servicio ("Términos"). Si no estás de acuerdo con ellos, no puedes usar nuestros servicios.',
      "Estos Términos aplican a todos los usuarios, incluidos jugadores, capitanes de equipo, organizadores de torneos y espectadores. Pueden aplicarse términos adicionales a funciones o servicios específicos.",
      "LeetGaming.PRO es una plataforma solo para adultos. La creación de cuentas, el acceso al juego, las suscripciones, los depósitos, los retiros, los reclamos de premios, los cashouts y otras funciones con flujo de dinero solo están disponibles para usuarios que cumplan la edad mínima legal y las reglas de elegibilidad descritas en estos Términos.",
    ],
    eligibilityIntro: "Para usar LeetGaming.PRO, debes:",
    eligibilityItems: [
      "Tener al menos 18 años para crear una cuenta y usar la plataforma",
      "Cumplir cualquier edad mínima superior, mayoría de edad o requisito legal aplicable en tu jurisdicción o a una función específica, incluidos requisitos 21+ cuando corresponda",
      "Tener capacidad legal para aceptar estos Términos",
      "No estar impedido de usar nuestros servicios según la ley aplicable",
      "No haber sido baneado previamente de la plataforma",
    ],
    eligibilityBody:
      "Podemos solicitar fecha de nacimiento, identidad, método de pago, residencia u otra verificación en cualquier momento para confirmar tu elegibilidad. Si no superas la verificación, o si creemos razonablemente que eres menor de edad o no elegible, podremos negar el acceso, limitar funciones, congelar pagos o suspender o terminar tu cuenta.",
    accountIntro: "Al crear una cuenta, aceptas:",
    accountItems: [
      "Proporcionar información precisa y completa",
      "Dar información veraz sobre edad, identidad, residencia y pago cuando se solicite",
      "Mantener la seguridad de las credenciales de tu cuenta",
      "Avisarnos inmediatamente sobre cualquier acceso no autorizado",
      "Asumir la responsabilidad por toda actividad realizada bajo tu cuenta",
      "No compartir tu cuenta con otras personas",
      "No crear múltiples cuentas para evadir restricciones",
    ],
    accountBody:
      "Nos reservamos el derecho de suspender o terminar cuentas que violen estos Términos, incluidas cuentas creadas por o para menores de 18 años o usuarios que tergiversen su elegibilidad legal.",
    fairPlayIntro:
      "LeetGaming.PRO está comprometida con mantener un entorno justo y competitivo. Aceptas:",
    fairPlayItems: [
      "Jugar limpiamente y no usar cheats, hacks o exploits",
      "No usar software no autorizado de terceros que otorgue ventajas injustas",
      "No manipular partidas ni participar en match-fixing",
      "No boostear cuentas ni manipular el nivel de habilidad",
      "Respetar a otros jugadores y mantener conducta deportiva",
      "No acosar, amenazar ni abusar de otros usuarios",
      "No usar nombres de usuario o contenido ofensivo o inapropiado",
      "Cumplir todas las reglas de los torneos al participar en competencias",
    ],
    fairPlayBody:
      "Las infracciones pueden resultar en advertencias, suspensiones temporales, baneos permanentes o pérdida de premios y ganancias.",
    intellectualIntro:
      "LeetGaming.PRO y su contenido están protegidos por leyes de propiedad intelectual. Reconoces que:",
    intellectualItems: [
      "Somos propietarios o licenciatarios de todo el contenido, diseño y tecnología de la plataforma",
      "No puedes copiar, modificar ni distribuir nuestro contenido sin permiso",
      "Los replays y estadísticas de juego pueden ser usados por nosotros para funciones de la plataforma",
      "El contenido generado por el usuario sigue siendo tuyo, pero nos otorgas una licencia para usarlo",
    ],
    intellectualBody:
      "El contenido de juegos de terceros (CS2, Valorant, etc.) pertenece a sus respectivos propietarios y se usa conforme a sus términos de servicio.",
    premiumIntro:
      "Algunas funciones requieren pago. Al comprar servicios premium:",
    premiumItems: [
      "Declaras y garantizas que tienes al menos 18 años y estás legalmente autorizado para completar la transacción",
      "Nos autorizas a cobrar el método de pago seleccionado",
      "Las suscripciones se renuevan automáticamente salvo cancelación antes de la fecha de renovación",
      "Los precios pueden cambiar con aviso antes de tu siguiente ciclo de facturación",
      "Los reembolsos se manejan conforme a nuestra política de reembolsos",
      "Los artículos virtuales y la moneda virtual no tienen valor en el mundo real y no pueden intercambiarse",
    ],
    premiumBody:
      "Todos los precios se muestran en la moneda seleccionada en el checkout e incluyen los impuestos aplicables. Los depósitos, retiros, suscripciones y otras funciones de flujo de dinero pueden estar sujetos a verificaciones de edad, identidad, AML, KYC, sanciones y elegibilidad regional antes de completarse.",
    prizeIntro: "Para torneos con bolsas de premios:",
    prizeItems: [
      "La participación en premios, cashouts y otras funciones de movimiento de dinero está limitada a usuarios adultos elegibles y solo donde sea legal",
      "Los premios se distribuyen según las reglas del torneo",
      "Debes verificar tu identidad para reclamar premios significativos",
      "Eres responsable de cualquier impuesto sobre tus ganancias",
      "Los premios pueden perderse por violaciones de reglas",
      "Nos reservamos el derecho de modificar la estructura de premios antes del inicio de los torneos",
    ],
    prizeBody:
      "La participación en competencias con premios puede tener requisitos adicionales de edad, licencia, verificación y legalidad según tu jurisdicción. Algunas jurisdicciones o funciones reguladas pueden exigir que tengas al menos 21 años.",
    contentIntro:
      "Al subir contenido (perfiles, replays, mensajes), aceptas no publicar:",
    contentItems: [
      "Contenido ilegal o dañino",
      "Contenido que infrinja derechos de propiedad intelectual",
      "Material de odio, discriminatorio u ofensivo",
      "Spam, anuncios o contenido promocional",
      "Información personal de otras personas sin consentimiento",
      "Malware o código malicioso",
    ],
    disclaimersIntro:
      'LeetGaming.PRO se proporciona "tal cual", sin garantías de ningún tipo. No garantizamos:',
    disclaimersItems: [
      "Servicio ininterrumpido o libre de errores",
      "Precisión de estadísticas o rankings",
      "Compatibilidad con todos los juegos o sus actualizaciones",
      "Disponibilidad de funciones o servicios específicos",
    ],
    disclaimersBody:
      "No somos responsables por las acciones de otros usuarios ni de servicios de terceros.",
    liabilityBody:
      "En la máxima medida permitida por la ley, LeetGaming.PRO no será responsable por daños indirectos, incidentales, especiales, consecuenciales o punitivos, incluida la pérdida de ganancias, datos o reputación, derivados de tu uso o imposibilidad de usar nuestros servicios, incluso si se nos hubiera advertido sobre la posibilidad de dichos daños.",
    indemnificationBody:
      "Aceptas indemnizar y mantener indemne a LeetGaming.PRO y a sus directivos, administradores, empleados y agentes frente a cualquier reclamo, daño, pérdida o gasto derivado de tu incumplimiento de estos Términos o del uso de nuestros servicios.",
    modificationsBody:
      "Podemos modificar estos Términos en cualquier momento. Los cambios materiales se comunicarán a través de la plataforma o por correo electrónico. El uso continuo después de que los cambios entren en vigor constituye aceptación de los Términos modificados. Si no estás de acuerdo con los cambios, debes dejar de usar nuestros servicios.",
    terminationIntro:
      "Podemos suspender o terminar tu acceso a LeetGaming.PRO en cualquier momento por violación de estos Términos o por cualquier otra razón a nuestra discreción. Al terminarse:",
    terminationItems: [
      "Tu derecho a usar la plataforma cesa inmediatamente",
      "Podemos eliminar tu cuenta y tus datos",
      "Pierdes cualquier artículo virtual o moneda no canjeada",
      "Podemos retener o revertir depósitos, retiros o reclamos de premios pendientes de revisión de elegibilidad cuando la ley lo permita",
      "Las disposiciones que deban sobrevivir a la terminación seguirán vigentes",
    ],
    governingLawBody:
      "Estos Términos se rigen e interpretan conforme a la legislación aplicable. Cualquier disputa derivada de estos Términos o del uso de nuestros servicios se resolverá mediante arbitraje vinculante o ante los tribunales de la jurisdicción aplicable.",
    severabilityBody:
      "Si alguna disposición de estos Términos se considera inaplicable o inválida, dicha disposición se limitará o eliminará en la medida mínima necesaria, y el resto de disposiciones seguirá plenamente vigente.",
    contactIntro: "Si tienes preguntas sobre estos Términos, contáctanos:",
    emailLabel: "Correo electrónico:",
    supportLabel: "Soporte:",
  },
  "zh-CN": {
    titles: [
      "1. 条款接受",
      "2. 资格要求",
      "3. 账户注册",
      "4. 公平竞技与行为规范",
      "5. 知识产权",
      "6. 高级服务与支付",
      "7. 奖池、奖金与提现",
      "8. 内容规范",
      "9. 免责声明",
      "10. 责任限制",
      "11. 赔偿责任",
      "12. 条款修改",
      "13. 终止",
      "14. 适用法律",
      "15. 可分割性",
      "16. 联系方式",
    ],
    intro: [
      "欢迎使用 LeetGaming.PRO。访问或使用我们的平台即表示你同意受本服务条款（“条款”）约束。如果你不同意这些条款，则不得使用我们的服务。",
      "本条款适用于所有用户，包括玩家、队长、赛事组织者和观众。某些特定功能或服务可能适用附加条款。",
      "LeetGaming.PRO 是仅限成人的平台。账户创建、游戏访问、订阅、充值、提现、奖金申领、cashout 及其他资金流动功能，仅向满足本条款所述最低法定年龄和资格要求的用户开放。",
    ],
    eligibilityIntro: "要使用 LeetGaming.PRO，你必须：",
    eligibilityItems: [
      "年满 18 周岁方可创建账户并使用平台",
      "满足你所在司法辖区或特定功能适用的更高最低年龄、成年年龄或法律资格要求，包括适用情况下的 21+ 要求",
      "具有签订本条款的法律能力",
      "不受适用法律禁止使用我们的服务",
      "此前未被平台封禁",
    ],
    eligibilityBody:
      "我们可能会在任何时候要求你提供出生日期、身份、支付方式、居住地或其他验证信息，以确认你的资格。如果你未通过验证，或我们有合理理由认为你未成年或不具备资格，我们可能拒绝访问、限制功能、冻结付款，或暂停、终止你的账户。",
    accountIntro: "创建账户时，你同意：",
    accountItems: [
      "提供准确、完整的信息",
      "在要求时提供真实的年龄、身份、居住地和支付信息",
      "维护账户凭证的安全",
      "如有未经授权的访问，立即通知我们",
      "对你账户下的所有活动承担责任",
      "不与他人共享账户",
      "不通过创建多个账户规避限制",
    ],
    accountBody:
      "我们保留暂停或终止违反本条款账户的权利，包括由 18 岁以下人员创建或代其创建的账户，以及虚报法律资格的用户账户。",
    fairPlayIntro: "LeetGaming.PRO 致力于维护公平且具有竞争性的环境。你同意：",
    fairPlayItems: [
      "公平游戏，不使用作弊、外挂或漏洞",
      "不使用提供不公平优势的未经授权第三方软件",
      "不操纵比赛或参与假赛",
      "不进行代打或技能操控",
      "尊重其他玩家并保持体育精神",
      "不骚扰、威胁或辱骂其他用户",
      "不使用冒犯性或不当的用户名或内容",
      "参加赛事时遵守所有赛事规则",
    ],
    fairPlayBody:
      "违规行为可能导致警告、临时封禁、永久封禁，或取消奖金和奖励资格。",
    intellectualIntro: "LeetGaming.PRO 及其内容受知识产权法律保护。你确认：",
    intellectualItems: [
      "我们拥有或已获许可使用平台的全部内容、设计和技术",
      "未经许可，你不得复制、修改或分发我们的内容",
      "游戏回放和统计数据可被我们用于平台功能",
      "用户生成内容仍归你所有，但你授予我们使用该内容的许可",
    ],
    intellectualBody:
      "第三方游戏内容（如 CS2、Valorant 等）归其各自权利人所有，并依据其服务条款使用。",
    premiumIntro: "某些功能需要付费。购买高级服务即表示你同意：",
    premiumItems: [
      "你声明并保证自己至少已满 18 岁，且在法律上被允许完成该交易",
      "你授权我们向你选择的支付方式收费",
      "除非在续费日前取消，否则订阅将自动续费",
      "价格可能会在下一个计费周期前通知后调整",
      "退款将依据我们的退款政策处理",
      "虚拟物品和虚拟货币不具有现实世界价值，也不可兑换",
    ],
    premiumBody:
      "所有价格均以结账时选择的货币显示，并包含适用税费。充值、提现、订阅及其他资金流动功能在完成前，可能需要通过年龄、身份、AML、KYC、制裁和地区资格审查。",
    prizeIntro: "对于设有奖池的赛事：",
    prizeItems: [
      "奖金参与、cashout 及其他资金移动功能仅限合资格成年用户，并且仅在合法地区开放",
      "奖金按照赛事规则发放",
      "领取重大奖金前，你必须完成身份验证",
      "你需自行承担奖金相关税务责任",
      "违反规则可能导致奖金被取消",
      "我们保留在赛事开始前修改奖金结构的权利",
    ],
    prizeBody:
      "参加奖金赛事可能根据你的司法辖区适用额外的年龄、许可、验证和法律要求。某些司法辖区或受监管功能可能要求你至少年满 21 岁。",
    contentIntro: "上传内容（个人资料、回放、消息）时，你同意不发布：",
    contentItems: [
      "非法或有害内容",
      "侵犯知识产权的内容",
      "仇恨、歧视或冒犯性材料",
      "垃圾信息、广告或推广内容",
      "未经同意披露他人个人信息",
      "恶意软件或恶意代码",
    ],
    disclaimersIntro:
      "LeetGaming.PRO 按“现状”提供，不附带任何形式的保证。我们不保证：",
    disclaimersItems: [
      "服务不中断或无错误",
      "统计数据或排名的准确性",
      "与所有游戏或游戏更新兼容",
      "特定功能或服务始终可用",
    ],
    disclaimersBody: "对于其他用户或第三方服务的行为，我们不承担责任。",
    liabilityBody:
      "在法律允许的最大范围内，LeetGaming.PRO 不对因你使用或无法使用我们的服务而产生的任何间接、附带、特殊、后果性或惩罚性损害承担责任，包括利润、数据或商誉损失，即使我们已被告知此类损害的可能性。",
    indemnificationBody:
      "你同意就因你违反本条款或使用我们的服务而引起的任何索赔、损害、损失或费用，对 LeetGaming.PRO 及其管理人员、董事、员工和代理人进行赔偿并使其免责。",
    modificationsBody:
      "我们可随时修改本条款。重大变更将通过平台或电子邮件通知。变更生效后继续使用服务，即表示你接受修改后的条款。如果你不同意变更，必须停止使用我们的服务。",
    terminationIntro:
      "若你违反本条款，或出于我们自行决定的其他原因，我们可随时暂停或终止你对 LeetGaming.PRO 的访问。终止后：",
    terminationItems: [
      "你使用平台的权利立即终止",
      "我们可能删除你的账户和数据",
      "你将失去任何未兑换的虚拟物品或虚拟货币",
      "在法律允许的范围内，我们可能在资格审查期间暂扣或撤销充值、提现或奖金申领",
      "应在终止后继续有效的条款仍将继续有效",
    ],
    governingLawBody:
      "本条款受适用法律管辖并依其解释。因本条款或你使用我们的服务而产生的任何争议，应通过具有约束力的仲裁或适用司法辖区法院解决。",
    severabilityBody:
      "如果本条款中的任何条款被认定为不可执行或无效，则该条款应在必要的最小范围内被限制或删除，其余条款仍保持完全有效。",
    contactIntro: "如对本条款有疑问，请联系我们：",
    emailLabel: "电子邮件：",
    supportLabel: "支持：",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();

  return {
    title: t("legal.termsMetaTitle"),
    description: t("legal.termsMetaDescription"),
  };
}

export default async function TermsOfServicePage() {
  const { locale, t } = await getServerI18n();
  const copy = termsCopy[getTierOneLocale(locale)];

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
            📜
          </span>
        </div>
        <div>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-0 text-[#34445C] dark:text-[#F5F0E1]">
            {t("legal.termsOfService")}
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
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[1]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.eligibilityIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 space-y-2 text-base lg:text-lg">
          {copy.eligibilityItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-default-600 mt-4 text-base lg:text-lg leading-relaxed">
          {copy.eligibilityBody}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[2]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.accountIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-2 text-base lg:text-lg">
          {copy.accountItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-default-600 text-base lg:text-lg">
          {copy.accountBody}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[3]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.fairPlayIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-2 text-base lg:text-lg">
          {copy.fairPlayItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-default-600 text-base lg:text-lg">
          {copy.fairPlayBody}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[4]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.intellectualIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-2 text-base lg:text-lg">
          {copy.intellectualItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-default-600 text-base lg:text-lg">
          {copy.intellectualBody}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[5]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.premiumIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-2 text-base lg:text-lg">
          {copy.premiumItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-default-600 text-base lg:text-lg">
          {copy.premiumBody}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[6]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.prizeIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-2 text-base lg:text-lg">
          {copy.prizeItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-default-600 text-base lg:text-lg">
          {copy.prizeBody}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[7]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.contentIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 space-y-2 text-base lg:text-lg">
          {copy.contentItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[8]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.disclaimersIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-2 text-base lg:text-lg">
          {copy.disclaimersItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-default-600 text-base lg:text-lg">
          {copy.disclaimersBody}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[9]}
        </h2>
        <p className="text-default-600 text-base lg:text-lg leading-relaxed">
          {copy.liabilityBody}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[10]}
        </h2>
        <p className="text-default-600 text-base lg:text-lg leading-relaxed">
          {copy.indemnificationBody}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[11]}
        </h2>
        <p className="text-default-600 text-base lg:text-lg leading-relaxed">
          {copy.modificationsBody}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[12]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.terminationIntro}
        </p>
        <ul className="list-disc pl-6 text-default-600 space-y-2 text-base lg:text-lg">
          {copy.terminationItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[13]}
        </h2>
        <p className="text-default-600 text-base lg:text-lg leading-relaxed">
          {copy.governingLawBody}
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[14]}
        </h2>
        <p className="text-default-600 text-base lg:text-lg leading-relaxed">
          {copy.severabilityBody}
        </p>
      </section>

      <section>
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          {copy.titles[15]}
        </h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          {copy.contactIntro}
        </p>
        <ul className="list-none text-default-600 space-y-2 text-base lg:text-lg">
          <li>
            {copy.emailLabel}{" "}
            <a
              href="mailto:legal@leetgaming.pro"
              className="text-[#FF4654] dark:text-[#DCFF37] hover:underline"
            >
              legal@leetgaming.pro
            </a>
          </li>
          <li>
            {copy.supportLabel}{" "}
            <a
              href="mailto:support@leetgaming.pro"
              className="text-[#FF4654] dark:text-[#DCFF37] hover:underline"
            >
              support@leetgaming.pro
            </a>
          </li>
        </ul>
      </section>
    </article>
  );
}
