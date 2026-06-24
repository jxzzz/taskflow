import { useState } from 'react';
import { Row, Col, Button, Modal, Typography, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import CreateProjectModal from '@/components/common/CreateProjectModal';
import { useProjects, useCreateProject, useDeleteProject, useUpdateProject } from '@/hooks/useProjects';
import type { Project, CreateProjectRequest } from '@/types/project';

const { Text } = Typography;

/** Soft gradient covers — pastel palette */
const covers = [
  'linear-gradient(135deg, #9b97d4 0%, #b8b5e0 100%)',
  'linear-gradient(135deg, #9bbc9e 0%, #b8d4c0 100%)',
  'linear-gradient(135deg, #e8a09c 0%, #f0c4c0 100%)',
  'linear-gradient(135deg, #e8cf8e 0%, #f2deaa 100%)',
  'linear-gradient(135deg, #99bcdb 0%, #b8d4e8 100%)',
  'linear-gradient(135deg, #c4a0d4 0%, #dcc8e8 100%)',
];
const getCover = (id: number) => covers[id % covers.length];

const tagStyles = [
  { bg: 'var(--tag-lavender)', color: 'var(--tag-lavender-text)' },
  { bg: 'var(--tag-sage)', color: 'var(--tag-sage-text)' },
  { bg: 'var(--tag-coral)', color: 'var(--tag-coral-text)' },
  { bg: 'var(--tag-butter)', color: 'var(--tag-butter-text)' },
];

export default function ProjectListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const { data, isFetching } = useProjects(1, 100);
  const createMutation = useCreateProject();
  const deleteMutation = useDeleteProject();
  const updateMutation = useUpdateProject();
  const navigate = useNavigate();

  const handleCreate = (values: CreateProjectRequest) => {
    createMutation.mutate(values, { onSuccess: () => setCreateOpen(false) });
  };
  const handleUpdate = (values: CreateProjectRequest) => {
    if (editProject) updateMutation.mutate({ id: editProject.id, data: values }, { onSuccess: () => setEditProject(null) });
  };
  const handleDelete = (p: Project) => {
    Modal.confirm({ title: '删除项目', content: `确定删除「${p.name}」？所有列表和任务将被级联删除。`, okText: '删除', okType: 'danger', cancelText: '取消', onOk: () => deleteMutation.mutate(p.id) });
  };

  return (
    <div>
      <PageHeader title="项目" subtitle="管理你的项目项目"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>创建项目</Button>} />

      <Row gutter={[20, 20]}>
        {data?.records.map((project) => {
          const cover = getCover(project.id);
          const tag = tagStyles[project.id % tagStyles.length];
          return (
            <Col xs={24} sm={12} md={8} lg={6} key={project.id}>
              <div onClick={() => navigate(`/projects/${project.id}`)}
                style={{ borderRadius: 16, overflow: 'hidden', background: '#ffffff', boxShadow: 'var(--shadow-card)',
                  cursor: 'pointer', border: '1px solid rgba(0,0,0,0.04)',
                  transition: 'all 280ms cubic-bezier(0.19, 1, 0.22, 1)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.transform = 'none'; }}>
                {/* Color cover */}
                <div style={{ height: 72, background: cover }} />
                {/* Body */}
                <div style={{ padding: '14px 16px 10px' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#2b2825', marginBottom: 4 }}>{project.name}</div>
                  {project.description && (
                    <Text style={{ fontSize: 12, color: 'rgba(43,40,37,0.48)', lineHeight: 1.4, display: 'block', marginBottom: 8 }}>
                      {project.description.slice(0, 55)}{project.description.length > 55 ? '…' : ''}
                    </Text>
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
                  <Space size={2}>
                    <Button type="text" size="small" icon={<EditOutlined />}
                      onClick={(e) => { e.stopPropagation(); setEditProject(project); }} style={{ color: 'rgba(43,40,37,0.4)' }} />
                    <Button type="text" size="small" icon={<DeleteOutlined />}
                      onClick={(e) => { e.stopPropagation(); handleDelete(project); }} style={{ color: 'rgba(43,40,37,0.4)' }} />
                  </Space>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>

      {data?.records?.length === 0 && !isFetching && (
        <div style={{ textAlign: 'center', padding: 72 }}>
          <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.35 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#2b2825', marginBottom: 6 }}>还没有项目</div>
          <Text style={{ color: 'rgba(43,40,37,0.4)', display: 'block', marginBottom: 22 }}>创建你的第一个项目，开始管理任务</Text>
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
        initialValues={editProject ? { name: editProject.name, description: editProject.description, projectUrl: editProject.projectUrl } : undefined}
      />
    </div>
  );
}
