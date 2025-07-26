import { useState, useEffect } from 'react';

export interface TranslationData {
  [key: string]: {
    [languageCode: string]: string;
  };
}

// Core translations for the platform
const TRANSLATIONS: TranslationData = {
  // Dashboard
  'dashboard_title': {
    'en': 'WebPayback Protocol Dashboard',
    'it': 'Dashboard Protocollo WebPayback',
    'es': 'Panel de Control WebPayback',
    'fr': 'Tableau de Bord WebPayback',
    'de': 'WebPayback Dashboard',
    'pt': 'Painel WebPayback',
    'ru': 'Панель WebPayback',
    'zh': 'WebPayback 仪表板',
    'ja': 'WebPayback ダッシュボード',
    'ko': 'WebPayback 대시보드',
    'ar': 'لوحة تحكم WebPayback',
    'hi': 'WebPayback डैशबोर्ड'
  },
  
  // Level 280 AI Agents
  'level_280_agents': {
    'en': 'Level 280 AI Agents',
    'it': 'Agenti AI Livello 280',
    'es': 'Agentes IA Nivel 280',
    'fr': 'Agents IA Niveau 280',
    'de': 'Level 280 KI-Agenten',
    'pt': 'Agentes IA Nível 280',
    'ru': 'ИИ-агенты уровня 280',
    'zh': '280级AI代理',
    'ja': 'レベル280 AIエージェント',
    'ko': '레벨 280 AI 에이전트',
    'ar': 'وكلاء الذكاء الاصطناعي مستوى 280',
    'hi': 'लेवल 280 AI एजेंट्स'
  },
  
  // Creator Portal
  'creator_portal': {
    'en': 'Creator Portal',
    'it': 'Portale Creatori',
    'es': 'Portal del Creador',
    'fr': 'Portail Créateur',
    'de': 'Ersteller-Portal',
    'pt': 'Portal do Criador',
    'ru': 'Портал создателя',
    'zh': '创作者门户',
    'ja': 'クリエイターポータル',
    'ko': '크리에이터 포털',
    'ar': 'بوابة المبدعين',
    'hi': 'रचनाकार पोर्टल'
  },
  
  // Register Now
  'register_now': {
    'en': 'Register Now',
    'it': 'Registrati Ora',
    'es': 'Regístrate Ahora',
    'fr': 'S\'inscrire Maintenant',
    'de': 'Jetzt Registrieren',
    'pt': 'Registre-se Agora',
    'ru': 'Зарегистрироваться сейчас',
    'zh': '立即注册',
    'ja': '今すぐ登録',
    'ko': '지금 등록',
    'ar': 'سجل الآن',
    'hi': 'अभी रजिस्टर करें'
  },
  
  // Anti-Fraud System
  'anti_fraud_system': {
    'en': 'Anti-Fraud System',
    'it': 'Sistema Anti-Frode',
    'es': 'Sistema Anti-Fraude',
    'fr': 'Système Anti-Fraude',
    'de': 'Anti-Betrug-System',
    'pt': 'Sistema Anti-Fraude',
    'ru': 'Система борьбы с мошенничеством',
    'zh': '反欺诈系统',
    'ja': '不正対策システム',
    'ko': '사기 방지 시스템',
    'ar': 'نظام مكافحة الاحتيال',
    'hi': 'धोखाधड़ी रोधी प्रणाली'
  },
  
  // Blockchain Networks
  'blockchain_networks': {
    'en': 'Blockchain Networks',
    'it': 'Reti Blockchain',
    'es': 'Redes Blockchain',
    'fr': 'Réseaux Blockchain',
    'de': 'Blockchain-Netzwerke',
    'pt': 'Redes Blockchain',
    'ru': 'Блокчейн-сети',
    'zh': '区块链网络',
    'ja': 'ブロックチェーンネットワーク',
    'ko': '블록체인 네트워크',
    'ar': 'شبكات البلوك تشين',
    'hi': 'ब्लॉकचेन नेटवर्क'
  },
  
  // Live Statistics
  'live_statistics': {
    'en': 'Live Statistics',
    'it': 'Statistiche Live',
    'es': 'Estadísticas en Vivo',
    'fr': 'Statistiques en Direct',
    'de': 'Live-Statistiken',
    'pt': 'Estatísticas ao Vivo',
    'ru': 'Живая статистика',
    'zh': '实时统计',
    'ja': 'ライブ統計',
    'ko': '실시간 통계',
    'ar': 'إحصائيات مباشرة',
    'hi': 'लाइव आंकड़े'
  },
  
  // Reward Distribution
  'reward_distribution': {
    'en': 'Reward Distribution',
    'it': 'Distribuzione Ricompense',
    'es': 'Distribución de Recompensas',
    'fr': 'Distribution des Récompenses',
    'de': 'Belohnungsverteilung',
    'pt': 'Distribuição de Recompensas',
    'ru': 'Распределение вознаграждений',
    'zh': '奖励分发',
    'ja': '報酬配分',
    'ko': '보상 배분',
    'ar': 'توزيع المكافآت',
    'hi': 'इनाम वितरण'
  },
  
  // Active Status
  'active': {
    'en': 'Active',
    'it': 'Attivo',
    'es': 'Activo',
    'fr': 'Actif',
    'de': 'Aktiv',
    'pt': 'Ativo',
    'ru': 'Активный',
    'zh': '活跃',
    'ja': 'アクティブ',
    'ko': '활성',
    'ar': 'نشط',
    'hi': 'सक्रिय'
  },
  
  // Connected Status
  'connected': {
    'en': 'Connected',
    'it': 'Connesso',
    'es': 'Conectado',
    'fr': 'Connecté',
    'de': 'Verbunden',
    'pt': 'Conectado',
    'ru': 'Подключен',
    'zh': '已连接',
    'ja': '接続済み',
    'ko': '연결됨',
    'ar': 'متصل',
    'hi': 'जुड़ा हुआ'
  },
  
  // Additional translations for comprehensive support
  'wpt_token_live': {
    'en': 'WPT Token Live',
    'it': 'Token WPT Live',
    'es': 'Token WPT En Vivo',
    'fr': 'Token WPT En Direct',
    'de': 'WPT Token Live',
    'pt': 'Token WPT Ao Vivo',
    'ru': 'Токен WPT Онлайн',
    'zh': 'WPT代币实时',
    'ja': 'WPTトークン ライブ',
    'ko': 'WPT 토큰 라이브',
    'ar': 'رمز WPT مباشر',
    'hi': 'WPT टोकन लाइव'
  },
  
  'recent_creator_rewards': {
    'en': 'Recent Creator Rewards',
    'it': 'Ricompense Recenti per Creatori',
    'es': 'Recompensas Recientes de Creadores',
    'fr': 'Récompenses Récentes des Créateurs',
    'de': 'Aktuelle Creator-Belohnungen',
    'pt': 'Recompensas Recentes de Criadores',
    'ru': 'Недавние Награды Создателей',
    'zh': '最近创作者奖励',
    'ja': '最近のクリエイター報酬',
    'ko': '최근 크리에이터 보상',
    'ar': 'مكافآت المبدعين الأخيرة',
    'hi': 'हाल के निर्माता पुरस्कार'
  },
  
  'multi_agent_orchestration': {
    'en': 'Multi-Agent Orchestration Command Center',
    'it': 'Centro di Comando Orchestrazione Multi-Agente',
    'es': 'Centro de Comando de Orquestación Multi-Agente',
    'fr': 'Centre de Commande d\'Orchestration Multi-Agent',
    'de': 'Multi-Agent-Orchestrierung Kommandozentrale',
    'pt': 'Centro de Comando de Orquestração Multi-Agente',
    'ru': 'Командный Центр Мульти-Агентной Оркестрации',
    'zh': '多代理编排指挥中心',
    'ja': 'マルチエージェントオーケストレーションコマンドセンター',
    'ko': '멀티 에이전트 오케스트레이션 명령 센터',
    'ar': 'مركز قيادة تنسيق الوكلاء المتعددين',
    'hi': 'मल्टी-एजेंट आर्केस्ट्रेशन कमांड सेंटर'
  },
  
  'syncing': {
    'en': 'Syncing...',
    'it': 'Sincronizzazione...',
    'es': 'Sincronizando...',
    'fr': 'Synchronisation...',
    'de': 'Synchronisierung...',
    'pt': 'Sincronizando...',
    'ru': 'Синхронизация...',
    'zh': '同步中...',
    'ja': '同期中...',
    'ko': '동기화 중...',
    'ar': 'المزامنة...',
    'hi': 'सिंक हो रहा है...'
  },
  
  'loading': {
    'en': 'Loading...',
    'it': 'Caricamento...',
    'es': 'Cargando...',
    'fr': 'Chargement...',
    'de': 'Laden...',
    'pt': 'Carregando...',
    'ru': 'Загрузка...',
    'zh': '加载中...',
    'ja': '読み込み中...',
    'ko': '로딩 중...',
    'ar': 'تحميل...',
    'hi': 'लोड हो रहा है...'
  }
};

export const useTranslations = (initialLanguage: string = 'en') => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Use saved language if available, otherwise use initial
    const savedLang = localStorage.getItem('webpayback-language');
    return savedLang || initialLanguage;
  });
  
  // Listen for language changes from HTML dropdown
  useEffect(() => {
    const checkLanguageChange = () => {
      const savedLang = localStorage.getItem('webpayback-language');
      if (savedLang && savedLang !== currentLanguage) {
        setCurrentLanguage(savedLang);
      }
    };
    
    // Listen for custom language change events
    const handleLanguageEvent = (event: CustomEvent) => {
      const { code } = event.detail;
      if (code !== currentLanguage) {
        setCurrentLanguage(code);
      }
    };
    
    // Add event listener for language changes
    window.addEventListener('languageChange', handleLanguageEvent as EventListener);
    
    // Check for language changes more frequently
    const interval = setInterval(checkLanguageChange, 100);
    
    // Initial check
    checkLanguageChange();
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageEvent as EventListener);
      clearInterval(interval);
    };
  }, [currentLanguage]);
  
  const t = (key: string, fallback?: string): string => {
    const translation = TRANSLATIONS[key]?.[currentLanguage] || 
                       TRANSLATIONS[key]?.['en'] || 
                       fallback || 
                       key;
    return translation;
  };
  
  const changeLanguage = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('webpayback-language', languageCode);
    // Immediate reload for instant translation change
    window.location.reload();
  };
  
  return {
    t,
    currentLanguage,
    changeLanguage,
    supportedLanguages: Object.keys(TRANSLATIONS.dashboard_title || {})
  };
};

export default useTranslations;