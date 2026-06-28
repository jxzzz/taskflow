import { useState } from 'react';
import { Row, Col, Button, Typography, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, TeamOutlined, UnorderedListOutlined, CalendarOutlined, GlobalOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import CreateProjectModal from '@/components/common/CreateProjectModal';
import { useProjects, useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import type { Project, CreateProjectRequest } from '@/types/project';
import { PROJECT_STATUS_CONFIG } from '@/types/project';
import dayjs from 'dayjs';

const { Text } = Typography;

/** Soft gradient covers — pastel palette */
const covers = [
  'linear-gradient(135deg, #0075de 0%, #62aef0 100%)',
  'linear-gradient(135deg, #1aae39 0%, #4cc96a 100%)',
  'linear-gradient(135deg, #dd5b00 0%, #ff8c42 100%)',
  'linear-gradient(135deg, #d6b6f6 0%, #e8d4fa 100%)',
  'linear-gradient(135deg, #2a9d99 0%, #5cc4bf 100%)',
  'linear-gradient(135deg, #ff64c8 0%, #ff8fd9 100%)',
];
const getCover = (id: number) => covers[id % covers.length];

const tagStyles = [
  { bg: 'rgba(23,23,28,0.06)', color: 'var(--color-ink-primary)' },
  { bg: 'var(--color-sage-soft)', color: 'var(--color-sage)' },
  { bg: 'var(--color-coral-soft)', color: 'var(--color-coral)' },
  { bg: 'var(--color-butter-soft)', color: 'var(--color-butter)' },
];

export default function ProjectListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const { data, isFetching } = useProjects(1, 100, 'my');
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const navigate = useNavigate();

  const handleCreate = (values: CreateProjectRequest) => {
    createMutation.mutate(values, { onSuccess: () => setCreateOpen(false) });
  };
  const handleUpdate = (values: CreateProjectRequest) => {
    if (editProject) updateMutation.mutate({ id: editProject.id, data: values }, { onSuccess: () => setEditProject(null) });
  };

  /** 格式化日期范围 */
  const formatDateRange = (start?: string, end?: string) => {
    if (!start && !end) return null;
    const fmt = (d?: string) => (d ? dayjs(d).format('YYYY/MM/DD') : '?');
    return `${fmt(start)} — ${fmt(end)}`;
  };

  return (
    <div>
      <PageHeader title="我的项目" subtitle="我创建或加入的项目"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>创建项目</Button>} />

      <Row gutter={[20, 20]}>
        {data?.records.map((project) => {
          const cover = getCover(project.id);
          const tag = tagStyles[project.id % tagStyles.length];
          const statusCfg = PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG.active;
          const dateRange = formatDateRange(project.startDate, project.endDate);

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={project.id}>
              <div
                className="project-card"
                onClick={() => navigate(`/projects/${project.id}`)}
                style={{ borderRadius: 16, overflow: 'hidden', background: '#ffffff', boxShadow: 'var(--shadow-card)',
                  cursor: 'pointer', border: '1px solid rgba(0,0,0,0.04)',
                  transition: 'all 280ms cubic-bezier(0.19, 1, 0.22, 1)' }}
              >
                {/* Color cover */}
                <div style={{ height: 72, background: cover, position: 'relative' }}>
                  <Tag style={{ position: 'absolute', top: 10, left: 10, margin: 0, border: 'none', background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    {project.isPublic ? <GlobalOutlined style={{ fontSize: 10 }} /> : <LockOutlined style={{ fontSize: 10 }} />}
                    {project.isPublic ? '公开' : '私有'}
                  </Tag>
                  <Tag color={statusCfg.color} style={{ position: 'absolute', top: 10, right: 10, margin: 0, border: 'none' }}>
                    {statusCfg.label}
                  </Tag>
                </div>
                {/* Body */}
                <div style={{ padding: '14px 16px 10px' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-ink-primary)', marginBottom: 4 }}>{project.name}</div>
                  {project.description && (
                    <Text style={{ fontSize: 12, color: 'var(--color-ink-secondary)', lineHeight: 1.4, display: 'block', marginBottom: 8 }}>
                      {project.description.slice(0, 55)}{project.description.length > 55 ? '…' : ''}
                    </Text>
                  )}
                  {dateRange && (
                    <div style={{ fontSize: 11, color: 'var(--color-ink-tertiary)', marginBottom: 4 }}>
                      <CalendarOutlined style={{ marginRight: 4 }} />{dateRange}
                    </div>
                  )}
                </div>
                {/* Footer tags */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 16px 12px' }}>
                  <Space size={6}>
                    <Tag style={{ background: tag.bg, color: tag.color, margin: 0, border: 'none' }}>
                      <TeamOutlined style={{ fontSize: 10 }} /> {project.memberCount}
                    </Tag>
                    <Tag style={{ background: tag.bg, color: tag.color, margin: 0, border: 'none' }}>
                      <UnorderedListOutlined style={{ fontSize: 10 }} /> {project.listCount}
                    </Tag>
                  </Space>
                  <Button type="text" size="small" icon={<EditOutlined />}
                    onClick={(e) => { e.stopPropagation(); setEditProject(project); }} style={{ color: 'var(--color-ink-tertiary)' }} />
                </div>
              </div>
            </Col>
          );
        })}
      </Row>

      {data?.records?.length === 0 && !isFetching && (
        <div style={{ textAlign: 'center', padding: 72 }}>
          <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.35 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink-primary)', marginBottom: 6 }}>还没有项目</div>
          <Text style={{ color: 'var(--color-ink-secondary)', display: 'block', marginBottom: 22 }}>创建一个项目，或让团队成员邀请你加入</Text>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>创建项目</Button>
        </div>
      )}

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        loading={createMutation.isPending}
      />

      <CreateProjectModal
        open={!!editProject}
        onClose={() => setEditProject(null)}
        onSubmit={handleUpdate}
        loading={updateMutation.isPending}
        initialValues={editProject ? {
          name: editProject.name,
          description: editProject.description,
          projectUrl: editProject.projectUrl,
          isPublic: editProject.isPublic,
          status: editProject.status,
          startDate: editProject.startDate,
          endDate: editProject.endDate,
        } : undefined}
      />
      <style>{`
        .project-card:hover { border-color: var(--color-border-default) !important; }
      `}</style>
    </div>
  );
}
