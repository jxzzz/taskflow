import {
  ProjectOutlined,
  TranslationOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import type { QuickActionItem } from '@/components/common/QuickActionFab';

/** Build the default quick-action menu items for the FAB */
export function useQuickActionItems(
  onCreateProject: () => void,
  onToggleLanguage: () => void,
): QuickActionItem[] {
  const navigate = useNavigate();

  return [
    {
      key: 'new-project',
      icon: <ProjectOutlined />,
      label: '新建项目',
      color: '#0075de',
      onClick: onCreateProject,
    },
    {
      key: 'quick-task',
      icon: <ThunderboltOutlined />,
      label: '快速任务',
      color: '#dd5b00',
      onClick: () => navigate(ROUTES.PROJECTS),
    },
    {
      key: 'language',
      icon: <TranslationOutlined />,
      label: '语言',
      color: '#62aef0',
      onClick: onToggleLanguage,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      color: '#93939f',
      onClick: () => navigate(ROUTES.SETTINGS),
    },
  ];
}
