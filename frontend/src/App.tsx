import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp } from 'antd';
import { RouterProvider } from 'react-router-dom';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { router } from '@/router';
import { useAppStore, COLOR_SCHEMES } from '@/stores/appStore';
import { useAuthInit } from '@/hooks/useAuthInit';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 },
    mutations: { retry: 0 },
  },
});

/** Soft Pastel Atelier theme tokens by color scheme */
function buildThemeTokens(csRgb: string) {
  return {
    colorPrimary: '#9b97d4',
    colorPrimaryBg: '#f3f2fb',
    colorPrimaryBgHover: '#e8e6f8',
    colorPrimaryBorder: '#9b97d4',
    colorPrimaryHover: '#827ec4',
    colorPrimaryActive: '#6b67a8',

    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: `rgba(${csRgb}, 0.04)`,
    colorBgSpotlight: '#faf9f6',
    colorBgMask: 'rgba(0, 0, 0, 0.30)',

    colorText: '#2b2825',
    colorTextSecondary: 'rgba(43, 40, 37, 0.58)',
    colorTextTertiary: 'rgba(43, 40, 37, 0.36)',
    colorTextQuaternary: 'rgba(43, 40, 37, 0.18)',

    colorBorder: 'rgba(0, 0, 0, 0.07)',
    colorBorderSecondary: 'rgba(0, 0, 0, 0.04)',

    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 8,

    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 20,

    controlHeight: 38,
    controlHeightLG: 44,
    lineHeight: 1.6,

    colorSuccess: '#9bbc9e',
    colorWarning: '#e8cf8e',
    colorError: '#e8a09c',
    colorInfo: '#99bcdb',
    colorLink: '#9b97d4',
    colorLinkHover: '#827ec4',
  };
}

const locales: Record<string, typeof zhCN> = {
  'zh-CN': zhCN,
  en: enUS,
};

function AppInner() {
  const colorScheme = useAppStore((s) => s.colorScheme);
  const language = useAppStore((s) => s.language);
  const csRgb = COLOR_SCHEMES[colorScheme].accentRgb;

  // 页面刷新时恢复用户信息（有 token 但无 user → 调 /auth/me）
  useAuthInit();

  // Sync dayjs locale
  useMemo(() => {
    dayjs.locale(language === 'zh-CN' ? 'zh-cn' : 'en');
  }, [language]);

  const theme = useMemo(() => ({ token: buildThemeTokens(csRgb) }), [csRgb]);
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
