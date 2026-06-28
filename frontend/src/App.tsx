import { useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp } from 'antd';
import { RouterProvider } from 'react-router-dom';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { router } from '@/router';
import { useAppStore } from '@/stores/appStore';
import { useAuthInit } from '@/hooks/useAuthInit';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 },
    mutations: { retry: 0 },
  },
});

/** Notion Design theme tokens */
function buildThemeTokens() {
  return {
    colorPrimary: '#0075de',
    colorPrimaryBg: 'rgba(0, 117, 222, 0.06)',
    colorPrimaryBgHover: 'rgba(0, 117, 222, 0.10)',
    colorPrimaryBorder: '#0075de',
    colorPrimaryHover: '#005bab',
    colorPrimaryActive: '#005bab',

    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f6f5f4',
    colorBgSpotlight: '#f6f5f4',
    colorBgMask: 'rgba(0, 0, 0, 0.30)',

    colorText: '#000000',
    colorTextSecondary: '#31302e',
    colorTextTertiary: '#615d59',
    colorTextQuaternary: '#a39e98',

    colorBorder: '#e6e6e6',
    colorBorderSecondary: '#e6e6e6',

    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 5,

    fontFamily: "'Inter', -apple-system, 'system-ui', 'Segoe UI', Helvetica, Arial, sans-serif",
    fontSize: 16,
    fontSizeLG: 18,
    fontSizeXL: 24,

    controlHeight: 40,
    controlHeightLG: 48,
    lineHeight: 1.5,

    colorSuccess: '#1aae39',
    colorWarning: '#dd5b00',
    colorError: '#b30000',
    colorInfo: '#62aef0',
    colorLink: '#0075de',
    colorLinkHover: '#005bab',
  };
}

const locales: Record<string, typeof zhCN> = {
  'zh-CN': zhCN,
  en: enUS,
};

function AppInner() {
  const language = useAppStore((s) => s.language);

  // Disable browser right-click menu
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handler);
    return () => document.removeEventListener('contextmenu', handler);
  }, []);

  // Restore user session on refresh
  useAuthInit();

  useEffect(() => {
    dayjs.locale(language === 'zh-CN' ? 'zh-cn' : 'en');
  }, [language]);

  const theme = useMemo(() => ({ token: buildThemeTokens() }), []);
  const locale = locales[language] || zhCN;

  return (
    <ConfigProvider locale={locale} theme={theme}>
      <AntApp>
        <RouterProvider router={router} />
      </AntApp>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
