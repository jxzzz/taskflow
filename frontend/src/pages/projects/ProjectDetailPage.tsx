import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Descriptions, Button, Space, Tag, Spin, Typography, Avatar, Progress, Tooltip } from 'antd';
import { ArrowLeftOutlined, EditOutlined, TeamOutlined, UnorderedListOutlined, PlusOutlined, PaperClipOutlined, MessageOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '@/components/common/PageHeader';
import { useProject } from '@/hooks/useProjects';

const { Text, Title } = Typography;

/* ── Mock Kanban Data ── */
const mockColumns = [
  {
    id: 1, title: '待办', count: 3, color: '#9b97d4',
    cards: [
      { id: 1, title: '设计首页布局', labels: [{ text: '设计', color: 'var(--tag-lavender)', bg: 'var(--tag-lavender)' }], comments: 2, attachments: 3, progress: 30, assignees: ['SL', 'JD'] },
      { id: 2, title: '编写 API 文档', labels: [{ text: '文档', color: 'var(--tag-sky)', bg: 'var(--tag-sky)' }], comments: 0, attachments: 1, progress: 0, assignees: ['AK'] },
      { id: 3, title: '技术选型评审', labels: [{ text: '高优', color: 'var(--tag-coral)', bg: 'var(--tag-coral)' }], comments: 5, attachments: 2, progress: 60, assignees: ['SL', 'AK', 'JD'] },
    ],
  },
  {
    id: 2, title: '进行中', count: 2, color: '#e8cf8e',
    cards: [
      { id: 4, title: '用户认证模块开发', labels: [{ text: '开发', color: 'var(--tag-sky)', bg: 'var(--tag-sky)' }, { text: '核心', color: 'var(--tag-coral)', bg: 'var(--tag-coral)' }], comments: 8, attachments: 4, progress: 75, assignees: ['AK', 'SL'] },
      { id: 5, title: '数据库迁移脚本', labels: [{ text: '后端', color: 'var(--tag-sage)', bg: 'var(--tag-sage)' }], comments: 1, attachments: 0, progress: 45, assignees: ['SL'] },
    ],
  },
  {
    id: 3, title: '已完成', count: 4, color: '#9bbc9e',
    cards: [
      { id: 6, title: '项目脚手架搭建', labels: [], comments: 3, attachments: 1, progress: 100, assignees: ['AK'] },
      { id: 7, title: 'CI/CD 流水线配置', labels: [{ text: 'DevOps', color: 'var(--tag-butter)', bg: 'var(--tag-butter)' }], comments: 4, attachments: 2, progress: 100, assignees: ['SL', 'AK'] },
      { id: 8, title: '代码规范配置', labels: [], comments: 0, attachments: 0, progress: 100, assignees: ['JD'] },
      { id: 9, title: 'Docker Compose 部署', labels: [{ text: '部署', color: 'var(--tag-sky)', bg: 'var(--tag-sky)' }], comments: 6, attachments: 3, progress: 100, assignees: ['SL'] },
    ],
  },
];

const avatarColors = ['#9b97d4', '#e8a09c', '#99bcdb', '#9bbc9e', '#e8cf8e'];
const getAvatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(Number(id));

  if (isLoading) return <div style={{ textAlign: 'center', padding: 120 }}><Spin /></div>;
  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: 72 }}>
        <Title level={4}>看板不存在</Title>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')} style={{ marginTop: 16 }}>返回</Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={project.name}
        subtitle={project.description || undefined}
        breadcrumb={[{ title: '看板', path: '/projects' }, { title: project.name }]}
      />

      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>返回</Button>
        <Button type="primary" icon={<EditOutlined />}>编辑</Button>
      </Space>

      {/* Info bar */}
      <Row gutter={16} style={{ marginBottom: 28 }}>
        <Col xs={24} lg={16}>
          <Card size="small" style={{ border: 'none' }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="创建者"><Tag style={{ background: 'var(--tag-lavender)', color: 'var(--tag-lavender-text)', border: 'none' }}>{project.ownerName || `#${project.ownerId}`}</Tag></Descriptions.Item>
              <Descriptions.Item label="创建时间">{project.createTime ? dayjs(project.createTime).format('YYYY-MM-DD') : '—'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card size="small" style={{ border: 'none', textAlign: 'center' }}>
            <TeamOutlined style={{ fontSize: 20, color: 'var(--color-lavender)', marginBottom: 4 }} />
            <div style={{ fontSize: 20, fontWeight: 700 }}>{project.memberCount}</div>
            <Text style={{ fontSize: 11, color: 'rgba(43,40,37,0.4)' }}>成员</Text>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card size="small" style={{ border: 'none', textAlign: 'center' }}>
            <UnorderedListOutlined style={{ fontSize: 20, color: 'var(--color-sage)', marginBottom: 4 }} />
            <div style={{ fontSize: 20, fontWeight: 700 }}>{project.listCount || mockColumns.length}</div>
            <Text style={{ fontSize: 11, color: 'rgba(43,40,37,0.4)' }}>列表</Text>
          </Card>
        </Col>
      </Row>

      {/* ═══ KANBAN BOARD ═══ */}
      <div style={{
        display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 24,
        minHeight: 500, alignItems: 'flex-start',
      }}>
        {mockColumns.map((col) => (
          <div key={col.id} style={{
            minWidth: 300, maxWidth: 320, flex: '0 0 auto',
            background: 'var(--color-bg-surface)',
            borderRadius: 16, padding: 16,
            boxShadow: 'var(--shadow-xs)',
            border: '1px solid var(--color-border-subtle)',
          }}>
            {/* Column header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Space size={8}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: col.color }} />
                <Text strong style={{ fontSize: 13.5, color: '#2b2825' }}>{col.title}</Text>
                <Tag style={{ background: 'rgba(0,0,0,0.04)', color: 'rgba(43,40,37,0.45)', border: 'none', fontSize: 11, borderRadius: 20, padding: '0 8px' }}>
                  {col.count}
                </Tag>
              </Space>
              <Button type="text" size="small" icon={<PlusOutlined />} style={{ color: 'rgba(43,40,37,0.3)', fontSize: 12 }} />
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.cards.map((card, idx) => (
                <div key={card.id} style={{
                  background: '#ffffff', borderRadius: 12, padding: 14,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  transition: 'all 200ms cubic-bezier(0.19,1,0.22,1)',
                  animation: `fadeInUp 350ms ${idx * 80}ms both`,
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'; }}
                >
                  {/* Labels */}
                  {card.labels.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                      {card.labels.map((lbl, i) => (
                        <span key={i} style={{
                          display: 'inline-block', height: 7, minWidth: 32, borderRadius: 20,
                          background: lbl.bg, border: `1px solid ${lbl.color}`,
                        }} />
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: '#2b2825', marginBottom: card.progress > 0 ? 8 : 6, lineHeight: 1.4 }}>
                    {card.title}
                  </div>

                  {/* Progress bar */}
                  {card.progress > 0 && (
                    <Progress percent={card.progress} size="small" showInfo={false}
                      strokeColor={col.color} trailColor="rgba(0,0,0,0.04)"
                      style={{ marginBottom: 10 }} />
                  )}

                  {/* Footer: assignees + meta */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Avatar.Group size={24} maxCount={3}
                      maxStyle={{ color: 'rgba(43,40,37,0.5)', backgroundColor: 'rgba(0,0,0,0.04)', fontSize: 10 }}>
                      {card.assignees.map((name) => (
                        <Tooltip title={name} key={name}>
                          <Avatar size={24} style={{ backgroundColor: getAvatarColor(name), fontSize: 10, fontWeight: 600 }}>{name}</Avatar>
                        </Tooltip>
                      ))}
                    </Avatar.Group>
                    <Space size={10} style={{ color: 'rgba(43,40,37,0.28)', fontSize: 12 }}>
                      {card.attachments > 0 && (
                        <span><PaperClipOutlined style={{ fontSize: 11 }} /> {card.attachments}</span>
                      )}
                      {card.comments > 0 && (
                        <span><MessageOutlined style={{ fontSize: 11 }} /> {card.comments}</span>
                      )}
                    </Space>
                  </div>
                </div>
              ))}
            </div>

            {/* Add card button */}
            <Button type="text" block icon={<PlusOutlined />}
              style={{ marginTop: 10, color: 'rgba(43,40,37,0.3)', borderRadius: 10 }}>
              添加卡片
            </Button>
          </div>
        ))}

        {/* Add column */}
        <div style={{
          minWidth: 300, maxWidth: 320, flex: '0 0 auto',
          borderRadius: 16, background: 'rgba(43,40,37,0.02)',
          border: '2px dashed rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 120, cursor: 'pointer',
          transition: 'all 200ms cubic-bezier(0.19,1,0.22,1)',
        }}>
          <Button type="text" icon={<PlusOutlined />} style={{ color: 'rgba(43,40,37,0.3)', fontSize: 14 }}>
            添加列表
          </Button>
        </div>
      </div>

      {/* Inline fade-in animation */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
