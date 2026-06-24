import { Form, Input, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useRegister } from '@/hooks/useAuth';
import type { RegisterRequest } from '@/types/auth';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const registerMutation = useRegister();
  const [form] = Form.useForm<RegisterRequest & { confirmPassword: string }>();

  return (
    <div>
      <Title level={4} style={{ marginBottom: 4, textAlign: 'center', fontFamily: "'Newsreader', Georgia, serif", fontWeight: 500, fontSize: 22 }}>
        创建账号
      </Title>
      <Text style={{ display: 'block', textAlign: 'center', marginBottom: 28, color: 'rgba(43,40,37,0.45)', fontSize: 13.5 }}>
        注册 TaskFlow 开始团队协作
      </Text>

      <Form form={form} onFinish={(v) => registerMutation.mutate({ username: v.username, password: v.password })} layout="vertical" size="large" autoComplete="off">
        <Form.Item name="username" label="用户名" rules={[{ required: true }, { min: 3, max: 50, message: '3-50 个字符' }]}>
          <Input placeholder="3-50 个字符" style={{ height: 46, borderRadius: 12 }} />
        </Form.Item>

        <Form.Item name="password" label="密码" rules={[{ required: true }, { min: 6, max: 100, message: '6-100 个字符' }]}>
          <Input.Password placeholder="至少 6 个字符" style={{ height: 46, borderRadius: 12 }} />
        </Form.Item>

        <Form.Item name="confirmPassword" label="确认密码" dependencies={['password']}
          rules={[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}>
          <Input.Password placeholder="再次输入密码" style={{ height: 46, borderRadius: 12 }} />
        </Form.Item>

        <Form.Item style={{ marginTop: 8 }}>
          <Button type="primary" htmlType="submit" loading={registerMutation.isPending} block
            style={{ height: 46, borderRadius: 12, fontSize: 15, fontWeight: 600 }}>
            注册
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <Text style={{ fontSize: 13.5, color: 'rgba(43,40,37,0.45)' }}>
          已有账号？<Link to="/auth/register" style={{ fontWeight: 500 }}>立即登录</Link>
        </Text>
      </div>
    </div>
  );
}
