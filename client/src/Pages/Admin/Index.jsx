import { useEffect, useState } from 'react';
import { Layout, Menu, Drawer } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    UserOutlined,
    HomeOutlined,
    DollarOutlined,
    GlobalOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { requestGetAdmin } from '../../config/request';
import Dashboard from './Components/Dashborad/Dashborad';
import classNames from 'classnames/bind';
import styles from './Index.module.scss';

import ManagerUser from './Components/ManagerUser/ManagerUser';
import ManagerPost from './Components/ManagerPost/ManagerPost';
import ManagerRechange from './Components/ManagerRechange/ManagerRechange';
import ManagerViolation from './Components/ManagerViolation/ManagerViolation';

const { Header, Sider, Content } = Layout;
const cx = classNames.bind(styles);

function Admin() {
    const [collapsed, setCollapsed] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    const navigate = useNavigate();

    const [type, setType] = useState('dashboard');

    useEffect(() => {
        const fetchData = async () => {
            try {
                await requestGetAdmin();
            } catch (error) {
                navigate('/');
            }
        };
        fetchData();
    }, [navigate]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMenuChange = (key) => {
        setType(key);
        if (isMobile) {
            setDrawerOpen(false);
        }
    };

    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Trang chủ',
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: 'Quản lý người dùng',
        },
        {
            key: 'posts',
            icon: <HomeOutlined />,
            label: 'Quản lý bài viết',
        },
        {
            key: 'transactions',
            icon: <DollarOutlined />,
            label: 'Quản lý giao dịch',
        },
        {
            key: 'violations',
            icon: <FileTextOutlined />,
            label: 'Báo cáo vi phạm',
        },
    ];

    return (
        <Layout className={cx('admin-layout')}>
            {!isMobile && (
                <Sider trigger={null} collapsible collapsed={collapsed} className={cx('sider')} width={280}>
                    <div className={cx('logo')}>
                        <div className={cx('logo-icon')}>
                            <GlobalOutlined />
                        </div>
                        {!collapsed && (
                            <div className={cx('logo-text')}>
                                <h1>PhongTro123</h1>
                                <span>Admin Portal</span>
                            </div>
                        )}
                    </div>
                    <Menu
                        theme="dark"
                        mode="inline"
                        defaultSelectedKeys={['dashboard']}
                        selectedKeys={[type]}
                        items={menuItems}
                        className={cx('menu')}
                        onClick={({ key }) => handleMenuChange(key)}
                    />
                </Sider>
            )}
            <Layout>
                <Header className={cx('header')}>
                    <div className={cx('header-left')}>
                    {isMobile ? (
                        <MenuUnfoldOutlined className={cx('trigger')} onClick={() => setDrawerOpen(true)} />
                    ) : collapsed ? (
                        <MenuUnfoldOutlined className={cx('trigger')} onClick={() => setCollapsed(!collapsed)} />
                    ) : (
                        <MenuFoldOutlined className={cx('trigger')} onClick={() => setCollapsed(!collapsed)} />
                    )}
                    {isMobile && <div className={cx('mobile-brand')}>Admin Portal</div>}
                </div>
                </Header>
                <Content className={cx('content')}>
                    {type === 'dashboard' && <Dashboard />}
                    {type === 'users' && <ManagerUser />}
                    {type === 'posts' && <ManagerPost />}
                    {type === 'transactions' && <ManagerRechange />}
                    {type === 'violations' && <ManagerViolation />}
                </Content>
            </Layout>

            <Drawer
                title="Menu Admin"
                placement="left"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                bodyStyle={{ padding: 0 }}
            >
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[type]}
                    items={menuItems}
                    onClick={({ key }) => handleMenuChange(key)}
                />
            </Drawer>
        </Layout>
    );
}

export default Admin;
