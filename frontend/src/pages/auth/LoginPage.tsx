import { Form, Input, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useLogin } from '@/hooks/useAuth';
import type { LoginRequest } from '@/types/auth';

const { Title, Text } = Typography;

export default function LoginPage() {
  const loginMutation = useLogin();
  const [form] = Form.useForm<LoginRequest>();

  return (
    <div>
      <Title level={4} style={{ marginBottom: 4, textAlign: 'center', fontFamily: "'Newsreader', Georgia, serif", fontWeight: 500, fontSize: 22 }}>
        欢迎回来
      </Title>
      <Text style={{ display: 'block', textAlign: 'center', marginBottom: 28, color: 'rgba(43,40,37,0.45)', fontSize: 13.5 }}>
        登录你的 TaskFlow 账号
      </Text>

      <Form form={form} onFinish={(v) => loginMutation.mutate(v)} layout="vertical" size="large" autoComplete="off">
        <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
          <Input placeholder="输入用户名" style={{ height: 46, borderRadius: 12 }} />
        </Form.Item>

        <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password placeholder="输入密码" style={{ height: 46, borderRadius: 12 }} />
        </Form.Item>

        <Form.Item style={{ marginTop: 8 }}>
          <Button type="primary" htmlType="submit" loading={loginMutation.isPending} block
            style={{ height: 46, borderRadius: 12, fontSize: 15, fontWeight: 600 }}>
            登录
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <Text style={{ fontSize: 13.5, color: 'rgba(43,40,37,0.45)' }}>
          还没有账号？<Link to="/auth/register" style={{ fontWeight: 500 }}>立即注册</Link>
        </Text>
      </div>
    </div>
  );
}
