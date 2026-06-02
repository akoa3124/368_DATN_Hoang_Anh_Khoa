import { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Tag, Button, Select, Space, message } from 'antd';
import { requestGetViolations, requestResolveViolation, requestExportReport } from '../../../../config/request';
import moment from 'moment';

function ManagerViolation() {
    const [violations, setViolations] = useState([]);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [loading, setLoading] = useState(false);

    const fetchViolations = async () => {
        setLoading(true);
        try {
            const response = await requestGetViolations({ status: statusFilter });
            setViolations(response.metadata);
        } catch (error) {
            console.error(error);
            message.error('Lấy danh sách báo cáo thất bại');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchViolations();
    }, [statusFilter]);

    const handleResolve = async (violationId, status) => {
        try {
            await requestResolveViolation({ violationId, status });
            message.success('Cập nhật trạng thái thành công');
            fetchViolations();
        } catch (error) {
            console.error(error);
            message.error('Cập nhật trạng thái thất bại');
        }
    };

    const handleExport = async () => {
        try {
            const blob = await requestExportReport({ type: 'violations', status: statusFilter });
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'violations-report.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            message.error('Xuất báo cáo thất bại');
        }
    };

    const columns = [
        {
            title: 'Bài đăng',
            dataIndex: ['post', 'title'],
            key: 'postTitle',
            render: (_, record) => record.post?.title || 'Không xác định',
        },
        {
            title: 'Người báo cáo',
            dataIndex: ['reporter', 'fullName'],
            key: 'reporter',
            render: (_, record) => record.reporter?.fullName || 'Không xác định',
        },
        {
            title: 'Người bị báo cáo',
            dataIndex: ['reportedUser', 'fullName'],
            key: 'reportedUser',
            render: (_, record) => record.reportedUser?.fullName || 'Không xác định',
        },
        {
            title: 'Lý do',
            dataIndex: 'reason',
            key: 'reason',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const color = status === 'resolved' ? 'green' : status === 'rejected' ? 'red' : 'orange';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Ngày báo cáo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        type="primary"
                        disabled={record.status !== 'pending'}
                        onClick={() => handleResolve(record._id, 'resolved')}
                    >
                        Giải quyết
                    </Button>
                    <Button
                        size="small"
                        danger
                        disabled={record.status !== 'pending'}
                        onClick={() => handleResolve(record._id, 'rejected')}
                    >
                        Từ chối
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
                <Col xs={24} sm={16} md={12}>
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { label: 'Đang chờ', value: 'pending' },
                            { label: 'Đã giải quyết', value: 'resolved' },
                            { label: 'Đã từ chối', value: 'rejected' },
                        ]}
                        style={{ width: 240 }}
                    />
                </Col>
                <Col xs={24} sm={8} md={12} style={{ textAlign: 'right' }}>
                    <Button type="primary" onClick={handleExport}>
                        Xuất báo cáo vi phạm
                    </Button>
                </Col>
            </Row>
            <Card>
                <Table
                    columns={columns}
                    dataSource={violations}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
}

export default ManagerViolation;
