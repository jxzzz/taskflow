import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Typography,
  Input,
  Form,
  Switch,
  Table,
  Tag,
  Avatar,
  Select,
  Space,
  Popconfirm,
  Alert,
  Modal,
  App,
  DatePicker,
} from 'antd';
import {
  SettingOutlined,
  TeamOutlined,
  WarningOutlined,
  UserAddOutlined,
  CrownOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects';
import {
  useProjectMembers,
  useAddMember,
  useUpdateMemberRole,
  useRemoveMember,
} from '@/hooks/useMembers';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/api/users';
import type { UpdateProjectRequest, ProjectStatus } from '@/types/project';
import { PROJECT_STATUS_CONFIG } from '@/types/project';
import type { MemberInfo } from '@/types/member';
import type { UserInfo } from '@/types/auth';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: number;
}

type Section = 'general' | 'members' | 'danger';

const MENU_ITEMS: { key: Section; icon: React.ReactNode; label: string }[] = [
  { key: 'general', icon: <SettingOutlined />, label: '基本信息' },
  { key: 'members', icon: <TeamOutlined />, label: '成员管理' },
  { key: 'danger', icon: <WarningOutlined />, label: '危险区域' },
];

export default function ProjectSettingsModal({ open, onClose, projectId }: Props) {
  const { data: project, isLoading } = useProject(projectId);
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.id === project?.ownerId;
  const [section, setSection] = useState<Section>('general');

  // 关闭时重置到基本信息
  const handleClose = () => {
    setSection('general');
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={1040}
      style={{ top: 32 }}
      styles={{ body: { padding: 0, height: 'calc(100vh - 120px)', overflow: 'hidden' } }}
      closeIcon={<CloseOutlined style={{ fontSize: 15 }} />}
      destroyOnClose
    >
      {isLoading || !project ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Text type="secondary">加载中...</Text>
        </div>
      ) : (
        <div style={{ display: 'flex', height: '100%' }}>
          {/* 左侧菜单 */}
          <nav
            style={{
              width: 200,
              flexShrink: 0,
              padding: '20px 10px',
              borderRight: '1px solid var(--color-border-subtle)',
              background: 'var(--color-bg-deep)',
              alignSelf: 'stretch',
              borderRadius: '10px 0 0 10px',
            }}
          >
            <Text
              type="secondary"
              style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, padding: '0 12px', marginBottom: 8, display: 'block' }}
            >
              {project.name}
            </Text>
            {MENU_ITEMS.map((item) => (
              <div
                key={item.key}
                onClick={() => setSection(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13.5,
                  fontWeight: section === item.key ? 600 : 400,
                  color: section === item.key ? 'var(--color-ink-primary)' : 'var(--color-ink-secondary)',
                  background: section === item.key ? 'var(--color-bg-surface)' : 'transparent',
                  transition: 'all 120ms ease',
                  marginBottom: 2,
                }}
              >
                {item.icon}
                {item.label}
              </div>
            ))}
          </nav>

          {/* 右侧内容 */}
          <main style={{ flex: 1, minWidth: 0, padding: '24px 32px', overflow: 'auto' }}>
            {section === 'general' && (
              <GeneralSettings projectId={projectId} project={project} isOwner={isOwner} onClose={onClose} />
            )}
            {section === 'members' && (
              <MemberSettings projectId={projectId} project={project} isOwner={isOwner} />
            )}
            {section === 'danger' && (
              <DangerZone projectId={projectId} projectName={project.name} isOwner={isOwner} onClose={onClose} />
            )}
          </main>
        </div>
      )}
    </Modal>
  );
}

// ========================= 基本信息 =========================

function GeneralSettings({
  projectId,
  project,
  isOwner,
  onClose,
}: {
  projectId: number;
  project: { name: string; description: string; projectUrl?: string; isPublic: boolean; status: ProjectStatus; startDate?: string; endDate?: string };
  isOwner: boolean;
  onClose: () => void;
}) {
  const [form] = Form.useForm<UpdateProjectRequest>();
  const updateMutation = useUpdateProject();
  const { message } = App.useApp();

  const handleSave = () => {
    form.validateFields().then((values) => {
      updateMutation.mutate(
        { id: projectId, data: {
          ...values,
          startDate: values.startDate ? dayjs(values.startDate).format('YYYY-MM-DD') : undefined,
          endDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : undefined,
        } },
        {
          onSuccess: () => {
            message.success('项目信息已更新');
            onClose();
          },
        },
      );
    });
  };

  const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
    { value: 'active', label: PROJECT_STATUS_CONFIG.active.label },
    { value: 'completed', label: PROJECT_STATUS_CONFIG.completed.label },
    { value: 'archived', label: PROJECT_STATUS_CONFIG.archived.label },
  ];

  return (
    <div>
      <Title level={5} style={{ marginBottom: 24, marginTop: 0 }}>基本信息</Title>

      {!isOwner && (
        <Alert type="warning" message="仅项目所有者可以修改设置" showIcon style={{ marginBottom: 20 }} />
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: project.name,
          description: project.description,
          projectUrl: project.projectUrl || '',
          isPublic: project.isPublic,
          status: project.status || 'active',
          startDate: project.startDate ? dayjs(project.startDate) : undefined,
          endDate: project.endDate ? dayjs(project.endDate) : undefined,
        }}
        disabled={!isOwner}
        style={{ maxWidth: 440 }}
      >
        <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
          <Input maxLength={100} />
        </Form.Item>

        <Form.Item name="description" label="描述">
          <Input.TextArea rows={3} maxLength={255} placeholder="项目用途说明" />
        </Form.Item>

        <Form.Item name="projectUrl" label="项目地址" rules={[{ type: 'url', message: '请输入有效的 URL' }]}>
          <Input maxLength={500} placeholder="https://github.com/..." />
        </Form.Item>

        <Form.Item name="status" label="项目状态">
          <Select options={STATUS_OPTIONS} />
        </Form.Item>

        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Item name="startDate" label="开始日期" style={{ flex: 1, marginBottom: 0 }}>
            <DatePicker style={{ width: '100%' }} placeholder="选择开始日期" />
          </Form.Item>
          <Form.Item name="endDate" label="截止日期" style={{ flex: 1, marginBottom: 0 }}>
            <DatePicker style={{ width: '100%' }} placeholder="选择截止日期" />
          </Form.Item>
        </div>

        <Form.Item name="isPublic" label="公开项目" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>

      {isOwner && (
        <Space style={{ marginTop: 4 }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSave} loading={updateMutation.isPending}>
            保存修改
          </Button>
        </Space>
      )}
    </div>
  );
}

// ========================= 成员管理 =========================

function MemberSettings({
  projectId,
  project,
  isOwner,
}: {
  projectId: number;
  project: { ownerId: number; ownerName: string };
  isOwner: boolean;
}) {
  const { data: members, isLoading } = useProjectMembers(projectId);
  const addMutation = useAddMember(projectId);
  const updateRoleMutation = useUpdateMemberRole(projectId);
  const removeMutation = useRemoveMember(projectId);

  const [searchUsers, setSearchUsers] = useState<UserInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const canManage = isOwner;

  const handleSearch = (value: string) => {
    if (!value.trim()) { setSearchUsers([]); return; }
    setSearching(true);
    userApi.search(value.trim())
      .then((users) => {
        const memberIds = new Set((members || []).map((m) => m.userId));
        setSearchUsers(users.filter((u) => !memberIds.has(u.id)));
      })
      .catch(() => setSearchUsers([]))
      .finally(() => setSearching(false));
  };

  const handleAdd = () => {
    if (!selectedUserId) return;
    addMutation.mutate({ userId: selectedUserId }, {
      onSuccess: () => { setSelectedUserId(null); setSearchUsers([]); },
    });
  };

  const handleToggleAdmin = (member: MemberInfo) => {
    updateRoleMutation.mutate({ userId: member.userId, data: { role: member.role === 1 ? 0 : 1 } });
  };

  const handleRemove = (member: MemberInfo) => {
    removeMutation.mutate(member.userId);
  };

  const columns = [
    {
      title: '成员', dataIndex: 'username', key: 'username',
      render: (_: string, record: MemberInfo) => (
        <Space>
          <Avatar size={28} src={record.avatar || undefined} style={{ backgroundColor: 'var(--color-lavender-soft)', color: 'var(--color-lavender)' }}>
            {record.username.charAt(0).toUpperCase()}
          </Avatar>
          <span>
            {record.username}
            {record.userId === project.ownerId && (
              <Tag color="gold" style={{ marginLeft: 6, fontSize: 11, lineHeight: '18px' }}>
                <CrownOutlined style={{ marginRight: 2 }} />所有者
              </Tag>
            )}
          </span>
        </Space>
      ),
    },
    {
      title: '角色', dataIndex: 'role', key: 'role', width: 120,
      render: (role: number, record: MemberInfo) => {
        if (record.userId === project.ownerId) return <Tag>管理员</Tag>;
        return (
          <Select
            value={role} size="small" style={{ width: 90 }}
            disabled={!canManage}
            onChange={() => handleToggleAdmin(record)}
            options={[{ value: 0, label: '成员' }, { value: 1, label: '管理员' }]}
          />
        );
      },
    },
    {
      title: '加入时间', dataIndex: 'joinTime', key: 'joinTime', width: 120,
      render: (t: string) => <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(t).format('YYYY/MM/DD')}</Text>,
    },
    {
      title: '', key: 'actions', width: 70,
      render: (_: unknown, record: MemberInfo) => {
        if (record.userId === project.ownerId) return null;
        return (
          <Popconfirm title="确定移除此成员？" onConfirm={() => handleRemove(record)} okText="确定" cancelText="取消" okButtonProps={{ danger: true }}>
            <Button type="link" danger size="small" disabled={!canManage}>移除</Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <div>
      <Title level={5} style={{ marginBottom: 20, marginTop: 0 }}>
        成员管理
        <Text type="secondary" style={{ fontSize: 14, fontWeight: 400, marginLeft: 8 }}>
          {(members || []).length} 位成员
        </Text>
      </Title>

      {canManage && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, padding: 14, background: 'var(--color-bg-surface)', borderRadius: 10 }}>
          <Select
            showSearch filterOption={false} onSearch={handleSearch}
            onSelect={(val) => setSelectedUserId(val)}
            onClear={() => { setSelectedUserId(null); setSearchUsers([]); }}
            value={selectedUserId} allowClear
            placeholder="输入用户名搜索..." loading={searching}
            style={{ flex: 1 }}
            options={searchUsers.map((u) => ({
              value: u.id,
              label: (
                <Space>
                  <Avatar size={22} src={u.avatar || undefined} style={{ backgroundColor: 'var(--color-lavender-soft)' }}>
                    {u.username.charAt(0).toUpperCase()}
                  </Avatar>
                  {u.username}
                </Space>
              ),
            }))}
            notFoundContent={searching ? '搜索中...' : '输入关键字搜索'}
          />
          <Button type="primary" icon={<UserAddOutlined />} onClick={handleAdd} loading={addMutation.isPending} disabled={!selectedUserId}>添加</Button>
        </div>
      )}

      <Table dataSource={members || []} columns={columns} rowKey="userId" loading={isLoading} pagination={false} showHeader={false} size="middle" />
    </div>
  );
}

// ========================= 危险区域 =========================

function DangerZone({
  projectId,
  projectName,
  isOwner,
  onClose,
}: {
  projectId: number;
  projectName: string;
  isOwner: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const deleteMutation = useDeleteProject();
  const [confirmName, setConfirmName] = useState('');

  if (!isOwner) return null;

  const handleDelete = () => {
    deleteMutation.mutate(projectId, {
      onSuccess: () => {
        onClose();
        navigate('/projects', { replace: true });
      },
    });
  };

  return (
    <div>
      <Title level={5} style={{ marginBottom: 16, marginTop: 0 }}>危险区域</Title>

      <div style={{ border: '1px solid var(--color-coral)', borderRadius: 12, padding: 20, background: 'var(--color-coral-soft)' }}>
        <Text strong style={{ color: 'var(--color-coral)', fontSize: 14 }}>删除项目</Text>
        <p style={{ color: 'var(--color-ink-secondary)', fontSize: 13, margin: '8px 0 16px' }}>
          删除后，所有列表和任务将被<strong>级联永久删除</strong>，不可恢复。请输入项目名称确认。
        </p>
        <Input
          placeholder={`输入「${projectName}」确认删除`}
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          style={{ marginBottom: 12, maxWidth: 320 }}
        />
        <Button danger type="primary" disabled={confirmName !== projectName} loading={deleteMutation.isPending} onClick={handleDelete}>
          确认删除项目
        </Button>
      </div>
    </div>
  );
}
