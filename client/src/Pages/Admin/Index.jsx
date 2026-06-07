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
    SearchOutlined,
    BellOutlined,
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
    const [showNotifications, setShowNotifications] = useState(false);

    const notifications = [
        {
            id: 1,
            title: 'Có bài viết mới',
            description: 'Một tin đăng mới vừa được đăng và chờ xét duyệt.',
            time: '2 phút trước',
        },
        {
            id: 2,
            title: 'Giao dịch mới',
            description: 'Một giao dịch nạp tiền đã được ghi nhận.',
            time: '10 phút trước',
        },
        {
            id: 3,
            title: 'Báo cáo vi phạm mới',
            description: 'Một báo cáo vi phạm mới cần bạn xử lý.',
            time: '1 giờ trước',
        },
    ];

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
                        <div className={cx('page-title')}>
                            <h2>{type === 'dashboard' ? 'Bảng điều khiển' : type === 'users' ? 'Quản lý người dùng' : type === 'posts' ? 'Quản lý bài viết' : type === 'transactions' ? 'Quản lý giao dịch' : 'Báo cáo vi phạm'}</h2>
                            <p>Thông tin tổng quan và hoạt động hệ thống</p>
                        </div>
                    </div>

                    <div className={cx('header-right')}>
                        <div className={cx('search-box')}>
                            <SearchOutlined />
                        </div>
                        <div className={cx('notification')} onClick={() => setShowNotifications(!showNotifications)}>
                            <BellOutlined />
                            <span className={cx('badge')}>{notifications.length}</span>
                        </div>
                        {showNotifications && (
                            <div className={cx('notification-panel')}>
                                <div className={cx('notification-header')}>
                                    <span>Thông báo mới</span>
                                    <small>{notifications.length} mục</small>
                                </div>
                                {notifications.map((item) => (
                                    <div key={item.id} className={cx('notification-item')}>
                                        <div className={cx('notification-icon')}>
                                            <BellOutlined />
                                        </div>
                                        <div className={cx('notification-content')}>
                                            <strong>{item.title}</strong>
                                            <p>{item.description}</p>
                                            <small>{item.time}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className={cx('profile')}>
                            <UserOutlined />
                            <span>Admin</span>
                        </div>
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
