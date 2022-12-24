import { Badge, Divider, IconButton, Menu, Typography, Tooltip } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Order } from '../../Models';
import Currency from 'react-currency-formatter';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenNotificationDetail } from '../../redux/features/isSlice';
import NotificationImg from '../../assets/images/notification.png'
import Image from 'next/image';
import { db } from '../../firebase/config';
import { RootState } from '../../redux/store';
import { AiFillDashboard } from 'react-icons/ai';
import { query, collection, onSnapshot, orderBy } from 'firebase/firestore'
import NotificationsIcon from '@mui/icons-material/Notifications';
import { setIdOrder } from '../../redux/features/ordersSlice';
import { toast } from 'react-toastify';
import { MdClose } from 'react-icons/md';
import moment from 'moment';
import { getCookie } from 'cookies-next';
import 'moment/locale/vi';
import NotificationDetail from './NotificationDetail'
import OrderProductModal from '../Modals/OrderProductModal';
import jwt from 'jsonwebtoken'
import Dashboard from '../Dashboard'
import PaymentModal from '../Modals/PaymentModal';
import instance from '../../server/db/instance';



const Notifications = () => {
    const dispatch = useDispatch()
    const { user }: any = useSelector<RootState>(state => state.user)
    const { isOpenNotificationDetail, isOpenOrderProduct, isOpenPaymentModal }: any = useSelector<RootState>(state => state.is)
    const [isOpenDashboard, setIsOpenDashboard] = useState(false)
    const [notifications, setNotifications] = useState<Order[]>([])
    const [notificationsEl, setNotificationsEl] = useState<null | HTMLElement>(null);

    useEffect(() => {
        moment().locale('vi')
        const token: any = getCookie("token")
        const { id, role }: any = jwt.decode(token)
        const q = query(collection(db, "orders"), orderBy("timestamp", "desc"))
        const unsub = onSnapshot(q, (snapshot: any) => {
            const results = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }))
            setNotifications(role !== "admin" ? results.filter((order: Order) => id === order.senderId || id === order.receiverId) : results)
        })
        return unsub
    }, [])



    const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
        setNotificationsEl(event.currentTarget);
    }
    const handleCloseNotifications = () => {
        setNotificationsEl(null);
    };



    const handleOpenOrderDetail = (id: string) => {
        dispatch(setOpenNotificationDetail(true))
        dispatch(setIdOrder(id))
        handleCloseNotifications()
    }






    const handleClearNotification = () => {
        notifications.forEach((order: Order) => {
            if (order.senderId === "" || order.receiverId === "") {
                instance.delete(`/orders/${order.id}`)
            } else {
                instance.put(`/orders/${order.id}`, {
                    receiverId: order.receiverId === user?.id ? "" : order.receiverId,
                    senderId: order.senderId === user?.id ? "" : order.senderId
                })
            }
        })
        toast.success("Clear notifications successfully", { autoClose: 3000, theme: "colored" })
    }

    const handleOpenDashboard = () => {
        handleCloseNotifications()
        setIsOpenDashboard(true)
    }

    return (
        <>
            {isOpenNotificationDetail && <NotificationDetail notifications={notifications} />}
            {isOpenOrderProduct && <OrderProductModal />}
            {isOpenPaymentModal && <PaymentModal />}
            {isOpenDashboard && <Dashboard setOpen={setIsOpenDashboard} isOpenDashboard={isOpenDashboard} orders={notifications} />}

            <Tooltip title="Notifications">
                <IconButton
                    onClick={handleOpenNotifications}
                    size="large"
                    color="inherit"
                >
                    <Badge badgeContent={notifications?.length} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
            {notifications?.length ?
                <Menu
                    className="mt-10 !p-0 mr-6"
                    anchorEl={notificationsEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(notificationsEl)}
                    onClose={handleCloseNotifications}
                >
                    <div className="lg:relative fixed top-0 left-0 right-0 bottom-0 bg-white">
                        <div className="flex justify-between">
                            <div className="flex items-center px-4">
                                <Typography fontWeight={700} variant="body1" component="h1">
                                    Thống kê
                                </Typography>
                                <IconButton
                                    onClick={handleOpenDashboard}
                                >
                                    <AiFillDashboard className="text-primary" />
                                </IconButton>
                                <div className="lg:hidden block">
                                </div>
                            </div>
                            {/* <div className="flex items-center px-4">
                                <Typography fontWeight={700} variant="body1" component="h1">
                                    Xóa thông báo
                                </Typography>
                                <IconButton
                                    onClick={handleClearNotification}
                                >
                                    <AiOutlineClear className="text-primary" />
                                </IconButton>
                                <div className="lg:hidden block">
                                </div>
                            </div> */}
                            <IconButton
                                className="lg:!hidden block"
                                onClick={handleCloseNotifications}
                            >
                                <MdClose />
                            </IconButton>
                        </div>

                        <Divider />

                        <div className="relative lg:w-[30rem] w-full lg:max-h-[15rem] !overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {notifications.map(((item: Order, index: number) => (
                                item.type === "booking" ?
                                    <div
                                        onClick={() => handleOpenOrderDetail(item.id!)}
                                        key={item.id}>
                                        {index >= 1 &&
                                            <Divider />
                                        }
                                        <div className="relative flex items-center  p-2 w-full hover:bg-gray-200 cursor-pointer">
                                            <Typography className="absolute right-2 top-1 lg:text-xs text-xs" variant="body2" component="h1">
                                                {moment(item.timestamp).fromNow()}
                                            </Typography>
                                            <div className="flex space-x-2 items-center">
                                                <div className="w-full relative">

                                                    <div className="flex   space-x-2">
                                                        <Typography fontSize={14} variant="body1" component="h1">
                                                            {`Đơn hàng :`}
                                                        </Typography>
                                                        <Typography fontWeight={700} fontSize={14} variant="body1" component="h1">
                                                            {"Sân bóng đá"}
                                                        </Typography>

                                                    </div>
                                                    <div className="flex   space-x-2">
                                                        <Typography fontSize={14} variant="body1" component="h1">
                                                            {`Trạng thái :`}
                                                        </Typography>
                                                        <Typography className={`${item.status === 0 && "text-blue-500"} ${item.status === 2 && "text-yellow-500"} ${item.status === 3 && "text-primary"} ${item.status === 4 && "text-red-500"} ${item.status === 10 && "text-red-500"} `} fontWeight={700} fontSize={14} variant="body1" component="h1">
                                                            {item.status === 0 && "Chưa thanh toán"}
                                                            {item.status === 2 && "Chờ xác nhận"}
                                                            {item.status === 3 && "Xác nhận đặt sân thành công"}
                                                            {item.status === 4 && "Từ chối đặt sân"}
                                                            {item.status === 10 && "Đơn hàng đã hết hạn"}
                                                        </Typography>

                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <Typography fontSize={14} variant="body1" component="h1">
                                                            Tên sân:
                                                        </Typography>
                                                        <Typography fontWeight={700} fontSize={14} variant="body1" component="h1">
                                                            {item.nameProduct}
                                                        </Typography>
                                                    </div>
                                                    {item.status === 4 && item.ownerId !== user?.id && item.methodPay === 2 ?
                                                        <div className="flex space-x-2 items-center">
                                                            <Typography fontSize={14} variant="body1" component="h1">
                                                                Số dư hiện tại :
                                                            </Typography>
                                                            <Typography fontWeight={700} fontSize={14} variant="body1" component="h1">
                                                                +<Currency quantity={item.total} currency="VND" pattern="##,### !" />
                                                            </Typography>
                                                            <Typography fontSize={14} variant="body1" component="h1">
                                                                {`(Hoàn tiền)`}
                                                            </Typography>
                                                        </div>
                                                        :
                                                        <div className="flex space-x-2 items-center">
                                                            <Typography fontSize={14} variant="body1" component="h1">
                                                                Tổng hóa đơn :
                                                            </Typography>
                                                            <Typography fontWeight={700} fontSize={14} variant="body1" component="h1">
                                                                <Currency quantity={item.total} currency="VND" pattern="##,### !" />
                                                            </Typography>
                                                        </div>
                                                    }
                                                    {item.status === 4 && item.ownerId !== user?.id && item.methodPay === 2 ?

                                                        <div className="flex space-x-2 items-center">
                                                            <Typography fontSize={14} variant="body1" component="h1">
                                                                Lời nhắn :
                                                            </Typography>
                                                            <Typography fontWeight={700} fontSize={14} variant="body1" component="h1">
                                                                {`Hoàn tiền đặt sân của bạn`}
                                                            </Typography>
                                                        </div>
                                                        :
                                                        <div className="flex space-x-2 items-center">
                                                            <div className="flex space-x-2">
                                                                <Typography fontSize={14} variant="body1" component="h1">
                                                                    Slot :
                                                                </Typography>
                                                                <Typography fontWeight={700} fontSize={14} variant="body1" component="h1">
                                                                    {`${item.slot} (${item.time}) - `}
                                                                </Typography>
                                                                <Typography fontWeight={700} fontSize={14} variant="body1" component="h1">
                                                                    {moment(item.date).format("dddd DD/MM/YYYY").charAt(0).toUpperCase() + moment(item.date).format("dddd DD/MM/YYYY").slice(1)}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div
                                        onClick={() => handleOpenOrderDetail(item.id!)}
                                        key={item.id}>
                                        {index >= 1 &&
                                            <Divider />
                                        }
                                        <div className="relative p-4">
                                            <Typography className="absolute right-2 top-1 lg:text-xs text-xs" variant="body2" component="h1">
                                                {moment(item.timestamp).fromNow()}
                                            </Typography>

                                            <div className="flex space-x-2">
                                                <Typography fontSize={14} variant="body1" component="h1">
                                                    {`Đơn hàng :`}
                                                </Typography>
                                                <Typography fontWeight={700} fontSize={14} variant="body1" component="h1">
                                                    {"Sản phẩm"}
                                                </Typography>
                                            </div>
                                            <div className="flex   space-x-2">
                                                <Typography fontSize={14} variant="body1" component="h1">
                                                    {`Trạng thái :`}
                                                </Typography>
                                                <Typography className={`${item.status === 0 && "text-blue-500"}  ${item.status === 5 && "text-yellow-500"} ${item.status === 6 && "text-yellow-500"} ${item.status === 1 && "text-yellow-500"} ${item.status === 2 && "text-yellow-500"} ${item.status === 3 && "text-primary"}  ${item.status === 7 && "text-primary"}  ${item.status === 9 && "text-primary"}   ${item.status === 4 && "text-red-500"}  ${item.status === 8 && "text-red-500"}  ${item.status === 10 && "text-red-500"} `} fontWeight={700} fontSize={14} variant="body1" component="h1">
                                                    {item.status === 0 && "Chưa thanh toán"}
                                                    {item.status === 2 && "Chờ xác nhận"}
                                                    {item.status === 3 && "Xác nhận thành công"}
                                                    {item.status === 4 && "Từ chối"}
                                                    {item.status === 5 && "Chờ lấy hàng"}
                                                    {item.status === 6 && "Đang giao"}
                                                    {item.status === 7 && "Giao hàng thành công"}
                                                    {item.status === 8 && "Từ chối nhận hàng"}
                                                    {item.status === 9 && "Đã hoàn tiền đặt hàng"}
                                                    {item.status === 10 && "Đơn hàng đã hết hạn"}
                                                </Typography>

                                            </div>
                                            <div className="flex   space-x-2">
                                                <Typography fontSize={14} variant="body1" component="h1">
                                                    {`Tổng tiền :`}
                                                </Typography>
                                                <Typography fontSize={14} variant="body1" component="h1">
                                                    <Currency quantity={item.total} currency="VND" pattern="##,### !" />
                                                </Typography>
                                            </div>
                                            <div className="flex   space-x-2">
                                                <Typography fontSize={14} variant="body1" component="h1">
                                                    {`Số lượng sản phẩm :`}
                                                </Typography>
                                                <Typography fontSize={14} variant="body1" component="h1">
                                                    {item.products?.length}
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>
                            )))}
                        </div>
                    </div>
                </Menu>
                :
                <Menu
                    className="mt-10 mr-6 p-4 max-h-[20rem] !overflow-y-hidden"
                    id="menu-appbar"
                    anchorEl={notificationsEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(notificationsEl)}
                    onClose={handleCloseNotifications}
                >
                    <div className="w-[20rem]">
                        <Image width="300" height="200" objectFit="contain" src={NotificationImg} />
                        <Typography fontWeight={700} className="text-center" variant="body1" component="h1">
                            No notifications yet
                        </Typography>
                    </div>
                </Menu>
            }
        </>
    )
}


export default Notifications