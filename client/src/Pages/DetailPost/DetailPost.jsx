import classNames from 'classnames/bind';
import styles from './DetailPost.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhoneAlt, faShareAlt, faFlag, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import userDefault from '../../assets/images/user-default.svg';

import dayjs from 'dayjs';

import {
    requestCreateFavourite,
    requestDeleteFavourite,
    requestGetPostById,
    requestGetPostVip,
    requestCreateReview,
    requestGetReviews,
    requestReportViolation,
    requestDeleteReview,
} from '../../config/request';
import { useStore } from '../../hooks/useStore';
import { useSocket } from '../../hooks/useSocket';
import Messager from '../../utils/Messager/Messager';
import ChatButton from '../../utils/ChatButton/ChatButton';
import { message, Rate, Input, Button, Modal } from 'antd';

const cx = classNames.bind(styles);

function DetailPost() {
    const [selectedImg, setSelectedImg] = useState('');

    const [user, setUser] = useState({});

    const [post, setPost] = useState({});

    const { id } = useParams();

    const [userHeart, setUserHeart] = useState([]);

    const [postVip, setPostVip] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [reportReason, setReportReason] = useState('');

    const fetchPost = async () => {
        const res = await requestGetPostById(id);
        setPost(res.metadata.data);
        setSelectedImg(res?.metadata?.data?.images[0]);
        setUser(res?.metadata?.dataUser);
        setUserHeart(res?.metadata?.userFavourite);
        document.title = `${res.metadata.data.title} - PhongTro123`;
    };

    const fetchReviews = async () => {
        try {
            const res = await requestGetReviews(id);
            setReviews(res.metadata);
        } catch (error) {
            console.error('Lỗi lấy đánh giá:', error);
        }
    };

    useEffect(() => {
        fetchPost();
        fetchReviews();
    }, [id]);

    useEffect(() => {
        const fetchPostVip = async () => {
            const res = await requestGetPostVip();
            setPostVip(res.metadata);
        };
        fetchPostVip();
    }, []);

    const { dataUser, setDataMessages } = useStore();
    const { usersMessage, setUsersMessage } = useSocket();

    const handleCreateFavourite = async () => {
        try {
            const data = {
                postId: post._id,
            };
            const res = await requestCreateFavourite(data);
            fetchPost();
            message.success(res.message);
        } catch (error) {
            message.error(error.response.data.message);
        }
    };

    const handleDeleteFavourite = async () => {
        try {
            const data = {
                postId: post._id,
            };
            const res = await requestDeleteFavourite(data);
            fetchPost();
            message.error(res.message);
        } catch (error) {
            message.error(error.response.data.message);
        }
    };

    const handleSubmitReview = async () => {
        try {
            if (!rating) {
                return message.error('Vui lòng chọn số sao');
            }
            const data = {
                postId: post._id,
                rating,
                comment,
            };
            const res = await requestCreateReview(data);
            message.success(res.message);
            setComment('');
            fetchPost();
            fetchReviews();
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể gửi đánh giá');
        }
    };

    const handleReportViolation = async () => {
        try {
            if (!reportReason) {
                return message.error('Vui lòng nhập lý do báo cáo');
            }
            const data = {
                postId: post._id,
                reason: reportReason,
            };
            const res = await requestReportViolation(data);
            message.success(res.message);
            setReportReason('');
            setIsReportModalVisible(false);
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể gửi báo cáo');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            const res = await requestDeleteReview({ reviewId });
            message.success(res.message);
            fetchReviews();
            fetchPost();
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể xóa đánh giá');
        }
    };

    return (
        <div className={cx('wrapper')}>
            <main className={cx('container')}>
                <div className={cx('content')}>
                    <div className={cx('left')}>
                        <div className={cx('slider-container')}>
                            <div className={cx('slide-item')}>
                                <img src={selectedImg} alt="" />
                            </div>
                            <div className={cx('select-img')}>
                                {post?.images?.map((image, index) => (
                                    <img key={index} src={image} alt="" onClick={() => setSelectedImg(image)} />
                                ))}
                            </div>
                        </div>

                        <div className={cx('property-details')}>
                            <div className={cx('property-header')}>
                                {post?.typeNews === 'vip' && <span className={cx('vip-tag')}>TIN VIP NỔI BẬT</span>}
                                <h1 className={cx('property-title')}> {post?.title}</h1>
                                <div className={cx('property-location')}>
                                    <span>{post?.location}</span>
                                </div>
                                <div className={cx('property-meta')}>
                                    <div className={cx('price')}>{post?.price?.toLocaleString()} VNĐ/tháng</div>
                                    <div className={cx('area')}>{post?.area} m²</div>
                                </div>
                                <div className={cx('rating-summary')}>
                                    <div className={cx('rating-value')}>
                                        <Rate disabled value={post?.averageRating || 0} />
                                        <span>{post?.averageRating ? `${post.averageRating}/5` : 'Chưa có đánh giá'}</span>
                                    </div>
                                    <div className={cx('rating-count')}>
                                        {post?.reviewCount ? `${post.reviewCount} đánh giá` : '0 đánh giá'}
                                    </div>
                                </div>
                            </div>

                            <div className={cx('property-description')}>
                                <h2>Thông tin mô tả</h2>
                                <p dangerouslySetInnerHTML={{ __html: post?.description }} />
                            </div>

                            <div className={cx('property-features')}>
                                <h2>Nổi bật</h2>
                                <div className={cx('features-grid')}>
                                    {post?.options?.map((option, index) => (
                                        <div className={cx('feature-item')} key={index}>
                                            <span className={cx('feature-icon', 'check')}></span>
                                            <span>{option}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={cx('review-section')}>
                                <h2>Đánh giá & nhận xét</h2>
                                <div className={cx('review-box')}>
                                    <Rate value={rating} onChange={setRating} />
                                    <Input.TextArea
                                        rows={4}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Viết nhận xét của bạn..."
                                        style={{ marginTop: 12 }}
                                    />
                                    <Button type="primary" onClick={handleSubmitReview} style={{ marginTop: 12 }}>
                                        Gửi đánh giá
                                    </Button>
                                </div>
                                <div className={cx('review-list')}>
                                    {reviews.length === 0 ? (
                                        <p>Chưa có đánh giá nào.</p>
                                    ) : (
                                        reviews.map((review) => (
                                            <div className={cx('review-item')} key={review._id}>
                                                <div className={cx('review-user')}>
                                                    <img
                                                        src={review.user.avatar || userDefault}
                                                        alt="avatar"
                                                        className={cx('review-avatar')}
                                                    />
                                                    <div>
                                                        <strong>{review.user.fullName}</strong>
                                                        <div>{new Date(review.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <Rate disabled value={review.rating} />
                                                <p>{review.comment}</p>
                                                {review.user._id === dataUser._id && (
                                                    <Button type="link" danger onClick={() => handleDeleteReview(review._id)}>
                                                        Xóa đánh giá
                                                    </Button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={cx('map-section')}>
                            <h3 className={cx('section-title')}>Vị trí & bản đồ</h3>
                            <div className={cx('map-container')}>
                                <div className={cx('address-bar')}>
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className={cx('location-icon')} />
                                    <span className={cx('address-text')}>{post?.location}</span>
                                </div>
                                <div className={cx('map-frame')}>
                                    <iframe
                                        src={`https://www.google.com/maps?q=${post?.location}&output=embed`}
                                        width="600"
                                        height="450"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Property Location"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={cx('right')}>
                        <div className={cx('contact-card')}>
                            <div className={cx('user-info')}>
                                <div className={cx('avatar')}>
                                    <img src={user?.avatar || userDefault} alt="Avatar" />
                                </div>
                                <div className={cx('user-details')}>
                                    <h3 className={cx('user-name')}>{user?.username || user?.fullName}</h3>
                                    <div
                                        className={cx('user-status', {
                                            online: user?.status === 'Đang hoạt động',
                                            offline: user?.status !== 'Đang hoạt động',
                                        })}
                                    >
                                        <span className={cx('status-dot')}></span>
                                        <span className={cx('status-text')}>
                                            {user?.status || 'Đang offline'}
                                        </span>
                                    </div>
                                    <div className={cx('user-stats')}>
                                        <span>{user?.lengthPost} tin đăng</span>
                                        <span className={cx('dot-separator')}></span>
                                        <span>Tham gia từ: {dayjs(user?.createdAt).format('DD/MM/YYYY')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={cx('contact-buttons')}>
                                <a href={`tel:${user?.phone}`} className={cx('btn', 'btn-phone')}>
                                    <FontAwesomeIcon icon={faPhoneAlt} />
                                    {user?.phone || 'chưa cập nhật'}
                                </a>
                                <ChatButton
                                    userId={user._id}
                                    username={user.username || user.fullName}
                                    avatar={user.avatar}
                                    status={user.status}
                                    className={cx('btn', 'btn-zalo')}
                                    icon={false}
                                />
                            </div>

                            <div className={cx('action-buttons')}>
                                <button
                                    onClick={
                                        userHeart.find((item) => item === dataUser._id)
                                            ? handleDeleteFavourite
                                            : handleCreateFavourite
                                    }
                                    className={cx('action-btn')}
                                >
                                    <FontAwesomeIcon icon={faHeart} />
                                    {userHeart.find((item) => item === dataUser._id) ? 'Đã lưu' : 'Lưu tin'}
                                </button>
                                <button className={cx('action-btn')}
                                    onClick={() => setIsReportModalVisible(true)}
                                >
                                    <FontAwesomeIcon icon={faFlag} />
                                    Báo cáo tin
                                </button>
                                <button className={cx('action-btn')}>
                                    <FontAwesomeIcon icon={faShareAlt} />
                                    Chia sẻ
                                </button>
                            </div>
                        </div>

                        <div className={cx('featured-listings')}>
                            <h3 className={cx('featured-title')}>Tin đăng nổi bật</h3>
                            {postVip.map((item, index) => (
                                <div className={cx('listing-item')} key={index}>
                                    <div className={cx('listing-image')}>
                                        <img src={item.images[0]} alt="Phòng trọ cao cấp" />
                                    </div>
                                    <div className={cx('listing-content')}>
                                        <h4 className={cx('listing-name')}>{item.title}</h4>
                                        <div className={cx('listing-price')}>
                                            {item.price.toLocaleString()} VNĐ/tháng
                                        </div>
                                        <div className={cx('listing-time')}>
                                            {dayjs(item.createdAt).format('DD/MM/YYYY')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Modal
                title="Báo cáo tin đăng"
                open={isReportModalVisible}
                onCancel={() => setIsReportModalVisible(false)}
                onOk={handleReportViolation}
                okText="Gửi báo cáo"
            >
                <Input.TextArea
                    rows={4}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Nhập lý do báo cáo vi phạm"
                />
            </Modal>
        </div>
    );
}

export default DetailPost;
