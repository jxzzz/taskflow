import { Form, Input, Button, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useRegister } from '@/hooks/useAuth';
import type { RegisterRequest } from '@/types/auth';

const { Title } = Typography;

export default function RegisterPage() {
  const registerMutation = useRegister();
  const [form] = Form.useForm<RegisterRequest & { confirmPassword: string }>();

  const handleSubmit = (values: RegisterRequest & { confirmPassword: string }) => {
    registerMutation.mutate({
      username: values.username,
      password: values.password,
    });
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24, textAlign: 'center' }}>
        注册
      </Title>

      <Form form={form} onFinish={handleSubmit} size="large" autoComplete="off">
        <Form.Item
          name="username"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 3, max: 50, message: '用户名长度 3-50 个字符' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="用户名（3-50 个字符）" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, max: 100, message: '密码长度 6-100 个字符' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="密码（6-100 个字符）" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={registerMutation.isPending} block>
            注册
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center' }}>
        <Space>
          <span>已有账号？</span>
          <Link to="/auth/login">立即登录</Link>
        </Space>
      </div>
    </div>
  );
}
