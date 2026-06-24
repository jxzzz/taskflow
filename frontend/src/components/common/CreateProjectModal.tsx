import { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import type { CreateProjectRequest } from '@/types/project';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateProjectRequest) => void;
  loading?: boolean;
  /** When set, switches to edit mode with initial values */
  initialValues?: { name: string; description?: string; projectUrl?: string };
}

export default function CreateProjectModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  initialValues,
}: CreateProjectModalProps) {
  const [form] = Form.useForm<CreateProjectRequest>();
  const isEdit = !!initialValues;

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
    });
  };

  return (
    <Modal
      title={isEdit ? `编辑「${initialValues?.name}」` : '创建项目'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText={isEdit ? '保存' : '创建'}
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }, { max: 100 }]}>
          <Input placeholder="例如：产品研发" />
        </Form.Item>
        <Form.Item name="description" label="描述" rules={[{ max: 255 }]}>
          <Input.TextArea rows={3} placeholder="项目用途说明（可选）" />
        </Form.Item>
        <Form.Item name="projectUrl" label="项目地址" rules={[{ max: 500 }, { type: 'url', message: '请输入有效的 URL 地址' }]}>
          <Input placeholder="https://github.com/org/repo（可选）" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
