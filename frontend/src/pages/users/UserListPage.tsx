import { useState } from 'react';
import { Table, Button, Drawer, Form, Input, Space, Modal, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '@/components/common/PageHeader';
import { useUsers, useDeleteUser, useUpdateUser } from '@/hooks/useUsers';
import type { UserInfo } from '@/types/auth';
import type { ColumnsType } from 'antd/es/table';

const avatarPalette = ['#9b97d4', '#e8a09c', '#99bcdb', '#9bbc9e', '#e8cf8e', '#c4a0d4'];
const avatarColor = (name: string) => avatarPalette[name.charCodeAt(0) % avatarPalette.length];

export default function UserListPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [editUser, setEditUser] = useState<UserInfo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isFetching } = useUsers(page, pageSize);
  const deleteMutation = useDeleteUser();
  const updateMutation = useUpdateUser();
  const [form] = Form.useForm();

  const handleEdit = (user: UserInfo) => { setEditUser(user); form.setFieldsValue({ username: user.username }); setDrawerOpen(true); };
  const handleUpdate = () => { form.validateFields().then((v) => { if (editUser) updateMutation.mutate({ id: editUser.id, data: v }, { onSuccess: () => setDrawerOpen(false) }); }); };
  const handleDelete = (u: UserInfo) => { Modal.confirm({ title: '确认删除', content: `确定删除「${u.username}」吗？`, okText: '删除', okType: 'danger', cancelText: '取消', onOk: () => deleteMutation.mutate(u.id) }); };

  const columns: ColumnsType<UserInfo> = [
    {
      title: '用户', dataIndex: 'username', width: 280,
      render: (name: string, record: UserInfo) => (
        <Space>
          <Avatar size={36} icon={<UserOutlined />} src={record.avatar}
            style={{ backgroundColor: avatarColor(name), flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: 11, color: 'rgba(43,40,37,0.35)' }}>ID: {record.id}</div>
          </div>
        </Space>
      ),
    },
    { title: '创建时间', dataIndex: 'createTime', width: 170, render: (t: string) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '—' },
    { title: '更新时间', dataIndex: 'updateTime', width: 170, render: (t: string) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '—' },
    {
      title: '操作', key: 'actions', width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ color: 'var(--color-ink-secondary)' }}>编辑</Button>
          <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="用户管理" subtitle={`共 ${data?.total ?? 0} 位用户`} />

      {data?.records?.length === 0 && !isFetching ? (
        <div style={{ textAlign: 'center', padding: 72 }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>👥</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#2b2825', marginBottom: 4 }}>暂无用户</div>
          <span style={{ color: 'rgba(43,40,37,0.4)', fontSize: 13 }}>用户注册后将显示在这里</span>
        </div>
      ) : (
        <Table rowKey="id" columns={columns} dataSource={data?.records} loading={isFetching}
          pagination={{ current: page, pageSize, total: data?.total || 0, showSizeChanger: true, showTotal: (t) => `共 ${t} 条`, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }} />
      )}

      <Drawer title="编辑用户" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={400}
        extra={<Button type="primary" onClick={handleUpdate} loading={updateMutation.isPending}>保存</Button>}>
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }, { min: 3, max: 50 }]}><Input /></Form.Item>
          <Form.Item name="password" label="新密码（留空不修改）" rules={[{ min: 6, max: 100 }]}><Input.Password placeholder="输入新密码" /></Form.Item>
          <Form.Item name="avatar" label="头像 URL"><Input placeholder="https://example.com/avatar.png" /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
