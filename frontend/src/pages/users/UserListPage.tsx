import { useState } from 'react';
import {
  Table,
  Button,
  Drawer,
  Form,
  Input,
  Space,
  Modal,
  Tag,
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '@/components/common/PageHeader';
import { useUsers, useDeleteUser, useUpdateUser } from '@/hooks/useUsers';
import type { UserInfo } from '@/types/auth';
import type { ColumnsType } from 'antd/es/table';

export default function UserListPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [editUser, setEditUser] = useState<UserInfo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isFetching } = useUsers(page, pageSize);
  const deleteMutation = useDeleteUser();
  const updateMutation = useUpdateUser();
  const [form] = Form.useForm();

  const handleEdit = (user: UserInfo) => {
    setEditUser(user);
    form.setFieldsValue({ username: user.username });
    setDrawerOpen(true);
  };

  const handleUpdate = () => {
    form.validateFields().then((values) => {
      if (editUser) {
        updateMutation.mutate(
          { id: editUser.id, data: values },
          { onSuccess: () => setDrawerOpen(false) },
        );
      }
    });
  };

  const handleDelete = (user: UserInfo) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户「${user.username}」吗？此操作不可撤销。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => deleteMutation.mutate(user.id),
    });
  };

  const columns: ColumnsType<UserInfo> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      width: 100,
      render: (avatar) =>
        avatar ? (
          <img src={avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
        ) : (
          <Tag>未设置</Tag>
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      render: (t) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      width: 180,
      render: (t) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="用户管理" />

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.records}
        loading={isFetching}
        pagination={{
          current: page,
          pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />

      {/* 编辑用户 Drawer */}
      <Drawer
        title="编辑用户"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={400}
        extra={
          <Button type="primary" onClick={handleUpdate} loading={updateMutation.isPending}>
            保存
          </Button>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 50, message: '3-50 个字符' },
            ]}
          >
            <Input placeholder="输入新用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="新密码（留空不修改）"
            rules={[{ min: 6, max: 100, message: '6-100 个字符' }]}
          >
            <Input.Password placeholder="输入新密码" />
          </Form.Item>
          <Form.Item name="avatar" label="头像 URL">
            <Input placeholder="https://example.com/avatar.png" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
