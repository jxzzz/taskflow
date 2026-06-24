import { Form, Input, Button, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useLogin } from '@/hooks/useAuth';
import type { LoginRequest } from '@/types/auth';

const { Title } = Typography;

export default function LoginPage() {
  const loginMutation = useLogin();
  const [form] = Form.useForm<LoginRequest>();

  const handleSubmit = (values: LoginRequest) => {
    loginMutation.mutate(values);
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24, textAlign: 'center' }}>
        登录
      </Title>

      <Form form={form} onFinish={handleSubmit} size="large" autoComplete="off">
        <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="密码" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loginMutation.isPending} block>
            登录
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center' }}>
        <Space>
          <span>还没有账号？</span>
          <Link to="/auth/register">立即注册</Link>
        </Space>
      </div>
    </div>
  );
}
