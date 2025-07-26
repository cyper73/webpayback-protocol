export interface Translation {
  // Navigation
  webpaybackProtocol: string;
  level280Agents: string;
  syncing: string;
  tokenLive: string;
  
  // Creator Portal
  creatorRegistration: string;
  websiteUrl: string;
  websiteUrlPlaceholder: string;
  contentCategory: string;
  selectCategory: string;
  walletAddress: string;
  walletPlaceholder: string;
  agreeToTerms: string;
  registerForWebpayback: string;
  
  // Recent Rewards
  recentCreatorRewards: string;
  creator: string;
  status: string;
  completed: string;
  pending: string;
  totalRewardsToday: string;
  
  // AI Agents
  multiAgentOrchestration: string;
  live: string;
  
  // Categories
  technology: string;
  finance: string;
  entertainment: string;
  education: string;
  news: string;
  
  // Status
  active: string;
  inactive: string;
  
  // Common
  loading: string;
  error: string;
  success: string;
}

export const translations: Record<string, Translation> = {
  en: {
    webpaybackProtocol: "WebPayback Protocol",
    level280Agents: "Level 280 AI Agents Active",
    syncing: "Syncing...",
    tokenLive: "WPT Token Live",
    
    creatorRegistration: "Creator Registration Portal",
    websiteUrl: "Website URL",
    websiteUrlPlaceholder: "https://your-website.com",
    contentCategory: "Content Category",
    selectCategory: "Select category",
    walletAddress: "Wallet Address",
    walletPlaceholder: "0x...",
    agreeToTerms: "I agree to the WebPayback Protocol Terms",
    registerForWebpayback: "Register for WebPayback",
    
    recentCreatorRewards: "Recent Creator Rewards",
    creator: "Creator",
    status: "Status",
    completed: "completed",
    pending: "pending",
    totalRewardsToday: "Total Rewards Today",
    
    multiAgentOrchestration: "Multi-Agent Orchestration Command Center",
    live: "Live",
    
    technology: "Technology",
    finance: "Finance", 
    entertainment: "Entertainment",
    education: "Education",
    news: "News",
    
    active: "Active",
    inactive: "Inactive",
    
    loading: "Loading...",
    error: "Error",
    success: "Success",
    
    fraudWarning: "SMART GUYS WARNING:",
    fraudWarningText: "WebPayback system implements advanced anti-fraud controls. Attempts at sybil attacks, auto-farming or system manipulation will result in:",
    fraudWarning1: "Immediate reward blocking",
    fraudWarning2: "Permanent reputation score reduction",
    fraudWarning3: "Possible account suspension or ban",
    fraudWarning4: "Intensive monitoring of future activities",
    activeFraudRules: "Active Anti-Fraud Rules",
    activeFraudAlerts: "Active Fraud Alerts",
    fraudAlertsHistory: "Fraud Alerts History",
    activeAlerts: "Active Alerts",
    resolvedAlerts: "Resolved Alerts",
    reasons: "Reasons",
    recommendedAction: "Recommended Action",
    maxDailyAccessesDomain: "Max daily accesses per domain",
    maxDailyAccessesIP: "Max daily accesses per IP",
    maxDomainConcentration: "Max domain concentration",
    maxIPConcentration: "Max IP concentration",
    minAIModelDiversity: "Min AI model diversity",
    minEntropyScore: "Min entropy score",
    maxIdenticalRequests: "Max identical requests",
    minTimeSpread: "Min time distribution"
  },
  
  it: {
    webpaybackProtocol: "Protocollo WebPayback",
    level280Agents: "Agenti IA Livello 280 Attivi",
    syncing: "Sincronizzazione...",
    tokenLive: "Token WPT Live",
    
    creatorRegistration: "Portale di Registrazione Creatori",
    websiteUrl: "URL del Sito Web",
    websiteUrlPlaceholder: "https://tuo-sito.com",
    contentCategory: "Categoria Contenuti",
    selectCategory: "Seleziona categoria",
    walletAddress: "Indirizzo Wallet",
    walletPlaceholder: "0x...",
    agreeToTerms: "Accetto i Termini del Protocollo WebPayback",
    registerForWebpayback: "Registrati per WebPayback",
    
    recentCreatorRewards: "Ricompense Recenti per Creatori",
    creator: "Creatore",
    status: "Stato",
    completed: "completato",
    pending: "in sospeso",
    totalRewardsToday: "Ricompense Totali Oggi",
    
    multiAgentOrchestration: "Centro di Comando Orchestrazione Multi-Agente",
    live: "Live",
    
    technology: "Tecnologia",
    finance: "Finanza",
    entertainment: "Intrattenimento", 
    education: "Educazione",
    news: "Notizie",
    
    active: "Attivo",
    inactive: "Inattivo",
    
    loading: "Caricamento...",
    error: "Errore",
    success: "Successo",
    
    antiFraudSystem: "Sistema Anti-Frode",
    fraudAlerts: "Allerte Frode",
    networkSwitcher: "Cambia Rete",
    
    fraudWarning: "AVVISO AI FURBI:",
    fraudWarningText: "Il sistema WebPayback implementa controlli anti-frode avanzati. Tentativi di sybil attack, auto-farming o manipolazione del sistema risulteranno in:",
    fraudWarning1: "Blocco immediato delle ricompense",
    fraudWarning2: "Riduzione permanente del punteggio reputazione",
    fraudWarning3: "Possibile sospensione o ban dell'account",
    fraudWarning4: "Monitoraggio intensivo delle attività future",
    activeFraudRules: "Regole Anti-Frode Attive",
    activeFraudAlerts: "Allerte Frode Attive",
    fraudAlertsHistory: "Storico Allerte Frode",
    activeAlerts: "Allerte Attive",
    resolvedAlerts: "Allerte Risolte",
    reasons: "Motivi",
    recommendedAction: "Azione Consigliata",
    maxDailyAccessesDomain: "Max accessi giornalieri per dominio",
    maxDailyAccessesIP: "Max accessi giornalieri per IP",
    maxDomainConcentration: "Concentrazione massima dominio",
    maxIPConcentration: "Concentrazione massima IP",
    minAIModelDiversity: "Min diversità modelli AI",
    minEntropyScore: "Entropy score minimo",
    maxIdenticalRequests: "Max richieste identiche",
    minTimeSpread: "Min distribuzione temporale"
  },
  
  es: {
    webpaybackProtocol: "Protocolo WebPayback",
    level280Agents: "Agentes IA Nivel 280 Activos",
    syncing: "Sincronizando...",
    tokenLive: "Token WPT En Vivo",
    
    creatorRegistration: "Portal de Registro de Creadores",
    websiteUrl: "URL del Sitio Web",
    websiteUrlPlaceholder: "https://tu-sitio.com",
    contentCategory: "Categoría de Contenido",
    selectCategory: "Seleccionar categoría",
    walletAddress: "Dirección de Wallet",
    walletPlaceholder: "0x...",
    agreeToTerms: "Acepto los Términos del Protocolo WebPayback",
    registerForWebpayback: "Registrarse para WebPayback",
    
    recentCreatorRewards: "Recompensas Recientes de Creadores",
    creator: "Creador",
    status: "Estado",
    completed: "completado",
    pending: "pendiente",
    totalRewardsToday: "Recompensas Totales Hoy",
    
    multiAgentOrchestration: "Centro de Comando de Orquestación Multi-Agente",
    live: "En Vivo",
    
    technology: "Tecnología",
    finance: "Finanzas",
    entertainment: "Entretenimiento",
    education: "Educación", 
    news: "Noticias",
    
    active: "Activo",
    inactive: "Inactivo",
    
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    
    antiFraudSystem: "Sistema Anti-Fraude",
    fraudAlerts: "Alertas de Fraude",
    networkSwitcher: "Cambio de Red",
    
    fraudWarning: "AVISO A LOS LISTOS:",
    fraudWarningText: "El sistema WebPayback implementa controles anti-fraude avanzados. Intentos de ataques sybil, auto-farming o manipulación del sistema resultarán en:",
    fraudWarning1: "Bloqueo inmediato de recompensas",
    fraudWarning2: "Reducción permanente del puntaje de reputación",
    fraudWarning3: "Posible suspensión o prohibición de cuenta",
    fraudWarning4: "Monitoreo intensivo de actividades futuras",
    activeFraudRules: "Reglas Anti-Fraude Activas",
    activeFraudAlerts: "Alertas de Fraude Activas",
    fraudAlertsHistory: "Historial de Alertas de Fraude",
    activeAlerts: "Alertas Activas",
    resolvedAlerts: "Alertas Resueltas",
    reasons: "Razones",
    recommendedAction: "Acción Recomendada",
    maxDailyAccessesDomain: "Máx accesos diarios por dominio",
    maxDailyAccessesIP: "Máx accesos diarios por IP",
    maxDomainConcentration: "Concentración máxima dominio",
    maxIPConcentration: "Concentración máxima IP",
    minAIModelDiversity: "Min diversidad modelos AI",
    minEntropyScore: "Puntuación entropía mínima",
    maxIdenticalRequests: "Máx solicitudes idénticas",
    minTimeSpread: "Min distribución temporal"
  },
  
  fr: {
    webpaybackProtocol: "Protocole WebPayback",
    level280Agents: "Agents IA Niveau 280 Actifs",
    syncing: "Synchronisation...",
    tokenLive: "Token WPT En Direct",
    
    creatorRegistration: "Portail d'Enregistrement des Créateurs",
    websiteUrl: "URL du Site Web",
    websiteUrlPlaceholder: "https://votre-site.com",
    contentCategory: "Catégorie de Contenu",
    selectCategory: "Sélectionner une catégorie",
    walletAddress: "Adresse du Portefeuille",
    walletPlaceholder: "0x...",
    agreeToTerms: "J'accepte les Termes du Protocole WebPayback",
    registerForWebpayback: "S'inscrire pour WebPayback",
    
    recentCreatorRewards: "Récompenses Récentes des Créateurs",
    creator: "Créateur",
    status: "Statut",
    completed: "terminé",
    pending: "en attente",
    totalRewardsToday: "Récompenses Totales Aujourd'hui",
    
    multiAgentOrchestration: "Centre de Commande d'Orchestration Multi-Agent",
    live: "En Direct",
    
    technology: "Technologie",
    finance: "Finance",
    entertainment: "Divertissement",
    education: "Éducation",
    news: "Actualités",
    
    active: "Actif",
    inactive: "Inactif",
    
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    
    antiFraudSystem: "Système Anti-Fraude",
    fraudAlerts: "Alertes de Fraude",
    networkSwitcher: "Changeur de Réseau",
    
    fraudWarning: "AVERTISSEMENT AUX MALINS:",
    fraudWarningText: "Le système WebPayback implémente des contrôles anti-fraude avancés. Les tentatives d'attaques sybil, d'auto-farming ou de manipulation du système entraîneront:",
    fraudWarning1: "Blocage immédiat des récompenses",
    fraudWarning2: "Réduction permanente du score de réputation",
    fraudWarning3: "Suspension ou interdiction possible du compte",
    fraudWarning4: "Surveillance intensive des activités futures",
    activeFraudRules: "Règles Anti-Fraude Actives",
    activeFraudAlerts: "Alertes de Fraude Actives"
  },
  
  de: {
    webpaybackProtocol: "WebPayback-Protokoll",
    level280Agents: "Level 280 KI-Agenten Aktiv",
    syncing: "Synchronisierung...",
    tokenLive: "WPT Token Live",
    
    creatorRegistration: "Creator-Registrierungsportal",
    websiteUrl: "Website-URL",
    websiteUrlPlaceholder: "https://ihre-website.com",
    contentCategory: "Inhaltskategorie",
    selectCategory: "Kategorie auswählen",
    walletAddress: "Wallet-Adresse",
    walletPlaceholder: "0x...",
    agreeToTerms: "Ich stimme den WebPayback-Protokoll-Bedingungen zu",
    registerForWebpayback: "Für WebPayback registrieren",
    
    recentCreatorRewards: "Aktuelle Creator-Belohnungen",
    creator: "Creator",
    status: "Status",
    completed: "abgeschlossen",
    pending: "ausstehend",
    totalRewardsToday: "Gesamtbelohnungen Heute",
    
    multiAgentOrchestration: "Multi-Agent-Orchestrierung Kommandozentrale",
    live: "Live",
    
    technology: "Technologie",
    finance: "Finanzen",
    entertainment: "Unterhaltung",
    education: "Bildung",
    news: "Nachrichten",
    
    active: "Aktiv",
    inactive: "Inaktiv",
    
    loading: "Laden...",
    error: "Fehler",
    success: "Erfolg",
    
    antiFraudSystem: "Anti-Betrugssystem",
    fraudAlerts: "Betrugsalarme",
    networkSwitcher: "Netzwerk-Umschalter",
    
    fraudWarning: "WARNUNG AN SCHLAUE LEUTE:",
    fraudWarningText: "Das WebPayback-System implementiert fortschrittliche Anti-Betrugs-Kontrollen. Versuche von Sybil-Angriffen, Auto-Farming oder Systemmanipulation führen zu:",
    fraudWarning1: "Sofortiges Blockieren von Belohnungen",
    fraudWarning2: "Permanente Reduzierung des Reputations-Scores",
    fraudWarning3: "Mögliche Kontosperrung oder -verbot",
    fraudWarning4: "Intensive Überwachung zukünftiger Aktivitäten",
    activeFraudRules: "Aktive Anti-Betrugs-Regeln",
    activeFraudAlerts: "Aktive Betrugsalarme"
  },
  
  pt: {
    webpaybackProtocol: "Protocolo WebPayback",
    level280Agents: "Agentes IA Nível 280 Ativos",
    syncing: "Sincronizando...",
    tokenLive: "Token WPT Ao Vivo",
    
    creatorRegistration: "Portal de Registro de Criadores",
    websiteUrl: "URL do Site",
    websiteUrlPlaceholder: "https://seu-site.com",
    contentCategory: "Categoria de Conteúdo",
    selectCategory: "Selecionar categoria",
    walletAddress: "Endereço da Carteira",
    walletPlaceholder: "0x...",
    agreeToTerms: "Concordo com os Termos do Protocolo WebPayback",
    registerForWebpayback: "Registrar para WebPayback",
    
    recentCreatorRewards: "Recompensas Recentes de Criadores",
    creator: "Criador",
    status: "Status",
    completed: "concluído",
    pending: "pendente",
    totalRewardsToday: "Recompensas Totais Hoje",
    
    multiAgentOrchestration: "Centro de Comando de Orquestração Multi-Agente",
    live: "Ao Vivo",
    
    technology: "Tecnologia",
    finance: "Finanças",
    entertainment: "Entretenimento",
    education: "Educação",
    news: "Notícias",
    
    active: "Ativo",
    inactive: "Inativo",
    
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    
    antiFraudSystem: "Sistema Anti-Fraude",
    fraudAlerts: "Alertas de Fraude",
    networkSwitcher: "Alternador de Rede",
    
    fraudWarning: "AVISO AOS ESPERTOS:",
    fraudWarningText: "O sistema WebPayback implementa controles anti-fraude avançados. Tentativas de ataques sybil, auto-farming ou manipulação do sistema resultarão em:",
    fraudWarning1: "Bloqueio imediato de recompensas",
    fraudWarning2: "Redução permanente do score de reputação",
    fraudWarning3: "Possível suspensão ou banimento da conta",
    fraudWarning4: "Monitoramento intensivo de atividades futuras",
    activeFraudRules: "Regras Anti-Fraude Ativas",
    activeFraudAlerts: "Alertas de Fraude Ativos"
  },
  
  ru: {
    webpaybackProtocol: "Протокол WebPayback",
    level280Agents: "ИИ-Агенты Уровня 280 Активны",
    syncing: "Синхронизация...",
    tokenLive: "Токен WPT Онлайн",
    
    creatorRegistration: "Портал Регистрации Создателей",
    websiteUrl: "URL Сайта",
    websiteUrlPlaceholder: "https://ваш-сайт.com",
    contentCategory: "Категория Контента",
    selectCategory: "Выберите категорию",
    walletAddress: "Адрес Кошелька",
    walletPlaceholder: "0x...",
    agreeToTerms: "Я согласен с Условиями Протокола WebPayback",
    registerForWebpayback: "Зарегистрироваться для WebPayback",
    
    recentCreatorRewards: "Недавние Награды Создателей",
    creator: "Создатель",
    status: "Статус",
    completed: "завершено",
    pending: "в ожидании",
    totalRewardsToday: "Общие Награды Сегодня",
    
    multiAgentOrchestration: "Командный Центр Мульти-Агентной Оркестрации",
    live: "Онлайн",
    
    technology: "Технологии",
    finance: "Финансы",
    entertainment: "Развлечения",
    education: "Образование",
    news: "Новости",
    
    active: "Активный",
    inactive: "Неактивный",
    
    loading: "Загрузка...",
    error: "Ошибка",
    success: "Успех",
    
    antiFraudSystem: "Система против мошенничества",
    fraudAlerts: "Предупреждения о мошенничестве",
    networkSwitcher: "Переключатель сети",
    
    fraudWarning: "ПРЕДУПРЕЖДЕНИЕ УМНИКАМ:",
    fraudWarningText: "Система WebPayback внедряет передовые средства борьбы с мошенничеством. Попытки сибил-атак, авто-фарминга или манипуляции системой приведут к:",
    fraudWarning1: "Немедленной блокировке наград",
    fraudWarning2: "Постоянному снижению рейтинга репутации",
    fraudWarning3: "Возможной приостановке или запрету аккаунта",
    fraudWarning4: "Интенсивному мониторингу будущих действий",
    activeFraudRules: "Активные Правила Борьбы с Мошенничеством",
    activeFraudAlerts: "Активные Предупреждения о Мошенничестве"
  },
  
  zh: {
    webpaybackProtocol: "WebPayback 协议",
    level280Agents: "280级AI代理活跃",
    syncing: "同步中...",
    tokenLive: "WPT代币实时",
    
    creatorRegistration: "创作者注册门户",
    websiteUrl: "网站URL",
    websiteUrlPlaceholder: "https://您的网站.com",
    contentCategory: "内容类别",
    selectCategory: "选择类别",
    walletAddress: "钱包地址",
    walletPlaceholder: "0x...",
    agreeToTerms: "我同意WebPayback协议条款",
    registerForWebpayback: "注册WebPayback",
    
    recentCreatorRewards: "最近创作者奖励",
    creator: "创作者",
    status: "状态",
    completed: "已完成",
    pending: "待处理",
    totalRewardsToday: "今日总奖励",
    
    multiAgentOrchestration: "多代理编排指挥中心",
    live: "实时",
    
    technology: "技术",
    finance: "金融",
    entertainment: "娱乐",
    education: "教育",
    news: "新闻",
    
    active: "活跃",
    inactive: "非活跃",
    
    loading: "加载中...",
    error: "错误",
    success: "成功",
    
    antiFraudSystem: "防欺诈系统",
    fraudAlerts: "欺诈警报",
    networkSwitcher: "网络切换器",
    
    fraudWarning: "聪明人警告:",
    fraudWarningText: "WebPayback系统实施先进的反欺诈控制。尝试女巫攻击、自动刷取或系统操纵将导致：",
    fraudWarning1: "立即阻止奖励",
    fraudWarning2: "永久降低声誉分数",
    fraudWarning3: "可能暂停或禁止账户",
    fraudWarning4: "密集监控未来活动",
    activeFraudRules: "活跃反欺诈规则",
    activeFraudAlerts: "活跃欺诈警报"
  }
};

export function getTranslation(language: string): Translation {
  return translations[language] || translations.en;
}