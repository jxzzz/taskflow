import { useEffect } from 'react';
import { Modal, Form, Input, Switch, Select, DatePicker } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import type { CreateProjectRequest, ProjectStatus } from '@/types/project';
import { PROJECT_STATUS_CONFIG } from '@/types/project';
import dayjs from 'dayjs';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateProjectRequest) => void;
  loading?: boolean;
  /** When set, switches to edit mode with initial values */
  initialValues?: {
    name: string;
    description?: string;
    projectUrl?: string;
    isPublic?: boolean;
    status?: ProjectStatus;
    startDate?: string;
    endDate?: string;
  };
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: PROJECT_STATUS_CONFIG.active.label },
  { value: 'completed', label: PROJECT_STATUS_CONFIG.completed.label },
  { value: 'archived', label: PROJECT_STATUS_CONFIG.archived.label },
];

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
        form.setFieldsValue({
          ...initialValues,
          startDate: initialValues.startDate ? dayjs(initialValues.startDate) : undefined,
          endDate: initialValues.endDate ? dayjs(initialValues.endDate) : undefined,
        } as any);
      } else {
        form.resetFields();
        form.setFieldsValue({ isPublic: false, status: 'active' });
      }
    }
  }, [open, initialValues, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit({
        ...values,
        startDate: values.startDate ? dayjs(values.startDate).format('YYYY-MM-DD') : undefined,
        endDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : undefined,
      } as CreateProjectRequest);
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
        <Form.Item name="isPublic" label="公开项目" valuePropName="checked" extra="公开后所有人可见，私有仅自己可见">
          <Switch checkedChildren={<><GlobalOutlined /> 公开</>} unCheckedChildren="私有" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
