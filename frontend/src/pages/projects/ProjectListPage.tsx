import { useState } from 'react';
import { Card, Row, Col, Button, Modal, Form, Input, Typography, Space, Tag } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ProjectOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/common/PageHeader';
import { useProjects, useCreateProject, useDeleteProject, useUpdateProject } from '@/hooks/useProjects';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types/project';

const { Text, Paragraph } = Typography;

export default function ProjectListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [createForm] = Form.useForm<CreateProjectRequest>();
  const [editForm] = Form.useForm<UpdateProjectRequest>();

  const { data, isFetching } = useProjects(1, 100); // 看板通常不多，取 100 条
  const createMutation = useCreateProject();
  const deleteMutation = useDeleteProject();
  const updateMutation = useUpdateProject();
  const navigate = useNavigate();

  const handleCreate = () => {
    createForm.validateFields().then((values) => {
      createMutation.mutate(values, {
        onSuccess: () => {
          setCreateOpen(false);
          createForm.resetFields();
        },
      });
    });
  };

  const handleEdit = (project: Project) => {
    setEditProject(project);
    editForm.setFieldsValue({
      name: project.name,
      description: project.description,
    });
  };

  const handleUpdate = () => {
    editForm.validateFields().then((values) => {
      if (editProject) {
        updateMutation.mutate(
          { id: editProject.id, data: values },
          { onSuccess: () => setEditProject(null) },
        );
      }
    });
  };

  const handleDelete = (project: Project) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除看板「${project.name}」吗？此操作将级联删除所有列表和任务，不可撤销。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => deleteMutation.mutate(project.id),
    });
  };

  return (
    <div>
      <PageHeader
        title="看板"
        breadcrumb={[{ title: '看板' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            创建看板
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        {data?.records.map((project) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
            <Card
              hoverable
              loading={isFetching}
              onClick={() => navigate(`/projects/${project.id}`)}
              actions={[
                <EditOutlined
                  key="edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(project);
                  }}
                />,
                <DeleteOutlined
                  key="delete"
                  style={{ color: '#ff4d4f' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project);
                  }}
                />,
              ]}
            >
              <Card.Meta
                avatar={<ProjectOutlined style={{ fontSize: 24, color: '#1677ff' }} />}
                title={project.name}
                description={
                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2 }}
                    style={{ minHeight: 44, marginBottom: 8 }}
                  >
                    {project.description || '暂无描述'}
                  </Paragraph>
                }
              />
              <Space size="middle" style={{ marginTop: 8 }}>
                <Tag icon={<TeamOutlined />}>{project.memberCount} 人</Tag>
                <Tag icon={<UnorderedListOutlined />}>{project.listCount} 列</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {project.createTime ? dayjs(project.createTime).format('MM-DD') : ''}
                </Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {data?.records?.length === 0 && !isFetching && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Text type="secondary">暂无看板，点击「创建看板」开始</Text>
        </div>
      )}

      {/* 创建看板 Modal */}
      <Modal
        title="创建看板"
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => setCreateOpen(false)}
        confirmLoading={createMutation.isPending}
        okText="创建"
        cancelText="取消"
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="name"
            label="看板名称"
            rules={[
              { required: true, message: '请输入看板名称' },
              { max: 100, message: '名称不超过 100 个字符' },
            ]}
          >
            <Input placeholder="例如：产品研发看板" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ max: 255, message: '描述不超过 255 个字符' }]}
          >
            <Input.TextArea rows={3} placeholder="看板用途说明（可选）" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑看板 Modal */}
      <Modal
        title={`编辑看板「${editProject?.name}」`}
        open={!!editProject}
        onOk={handleUpdate}
        onCancel={() => setEditProject(null)}
        confirmLoading={updateMutation.isPending}
        okText="保存"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="看板名称"
            rules={[
              { required: true, message: '请输入看板名称' },
              { max: 100, message: '名称不超过 100 个字符' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ max: 255, message: '描述不超过 255 个字符' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
