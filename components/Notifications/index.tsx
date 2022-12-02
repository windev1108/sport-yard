import { Badge, Divider, IconButton, Menu, Typography, Tooltip } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Order, User } from '../../Models';
import Currency from 'react-currency-formatter';
import { useDispatch, useSelector } from 'react-redux';
import { setIsUpdate, setOpenDashboard, setOpenNotificationDetail } from '../../redux/features/isSlice';
import NotificationImg from '../../assets/images/notification.png'
import Image from 'next/image';
import { db } from '../../firebase/config';
import { RootState } from '../../redux/store';
import dynamic from 'next/dynamic'
import axios from 'axios';
import { AiFillDashboard, AiOutlineClear } from 'react-icons/ai';
import { query, collection, onSnapshot, orderBy } from 'firebase/firestore'
import dayjs from 'dayjs';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { setIdOrder } from '../../redux/features/ordersSlice';
import { toast } from 'react-toastify';
import { MdClose } from 'react-icons/md';
import moment from 'moment';
import { getCookie } from 'cookies-next';
const Dashboard = dynamic(() => import("../Dashboard"), { ssr: false })


interface State {
    notifications: Order[]
}
const Notifications = () => {
    const dispatch = useDispatch()
    const token: any = getCookie("token")
    const { user }: any = useSelector<RootState>(state => state.user)
    const { isUpdated }: any = useSelector<RootState>(state => state.is)
    const [notificationsEl, setNotificationsEl] = useState<null | HTMLElement>(null);
    const [state, setState] = useState<State>({
        notifications: [],
    })

    const { notifications } = state


    useEffect(() => {
        const q = query(collection(db, "orders"), orderBy("timestamp", "desc"))
        const unsub = onSnapshot(q, (snapshot: any) => {
            const results = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }))
            setState({ ...state, notifications: results?.filter((order: Order) => user?.id === order.senderId || user?.id === order.receiverId) });
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
                axios.delete(`/api/orders/${order.id}`)
            } else {
                axios.put(`/api/orders/${order.id}`, {
                    receiverId: order.receiverId === user?.id ? "" : order.receiverId,
                    senderId: order.senderId === user?.id ? "" : order.senderId
                })
            }
        })
        toast.success("Clear notifications successfully", { autoClose: 3000, theme: "colored" })
    }

    const handleOpenDashboard = () => {
        handleCloseNotifications()
        dispatch(setOpenDashboard(true))
    }

    return (
        <>
            <Dashboard orders={notifications} />

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
                            {user.role === "owner" &&
                                <div className="flex items-center px-4">
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        Dashboard
                                    </Typography>
                                    <IconButton
                                        onClick={handleOpenDashboard}
                                    >
                                        <AiFillDashboard className="text-primary" />
                                    </IconButton>
                                    <div className="lg:hidden block">
                                    </div>
                                </div>
                            }
                            <div className="flex items-center px-4">
                                <Typography fontWeight={700} variant="body1" component="h1">
                                    Clear
                                </Typography>
                                <IconButton
                                    onClick={handleClearNotification}
                                >
                                    <AiOutlineClear className="text-primary" />
                                </IconButton>
                                <div className="lg:hidden block">
                                </div>
                            </div>
                            <IconButton
                                className="lg:!hidden block"
                                onClick={handleCloseNotifications}
                            >
                                <MdClose />
                            </IconButton>
                        </div>

                        <Divider />

                        <div className="relative lg:w-[30rem] w-full lg:max-h-[15rem] !overflow-y-scroll">
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
                                                    {item.status === 2 ?
                                                        <div className="flex space-x-2">
                                                            <Typography fontSize={14} fontWeight={item.senderId === user?.id ? 500 : 700} variant="body1" component="h1">
                                                                {`${item.senderId === user?.id ? "Bạn đã gửi một yêu cầu đến" : item.ordererName}`}
                                                            </Typography>
                                                            <Typography fontSize={14} fontWeight={item.senderId === user?.id ? 700 : 500} variant="body1" component="h1">
                                                                {item.senderId === user?.id ? `${item.ownerName}` : "đã gửi bạn một yêu cầu"}
                                                            </Typography>
                                                        </div>
                                                        :
                                                        <div className="flex space-x-2">
                                                            <Typography fontSize={14} fontWeight={item.senderId === user?.id ? 500 : 700} variant="body1" component="h1">
                                                                {`${item.senderId === user?.id ? "Bạn đã gửi một yêu cầu đến" : item.ownerName}`}
                                                            </Typography>
                                                            <Typography fontSize={14} fontWeight={item.senderId === user?.id ? 700 : 500} variant="body1" component="h1">
                                                                {item.senderId === user?.id ? `${item.ordererName}` : "đã gửi bạn một yêu cầu"}
                                                            </Typography>
                                                        </div>
                                                    }

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
                                                        <Typography className={`${item.status === 0 && "text-blue-500"} ${item.status === 2 && "text-yellow-500"} ${item.status === 3 && "text-primary"} ${item.status === 4 && "text-red-500"} `} fontWeight={700} fontSize={14} variant="body1" component="h1">
                                                            {item.status === 0 && "Chưa thanh toán"}
                                                            {item.status === 2 && "Chờ xác nhận"}
                                                            {item.status === 3 && "Xác nhận đặt sân thành công"}
                                                            {item.status === 4 && "Từ chối đặt sân"}
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
                                                                    {dayjs(item.date).format("dddd DD/MM/YYYY")}
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
                                            {item.status === 2 ?
                                                <div className="flex space-x-2">
                                                    <Typography fontSize={14} fontWeight={item.senderId === user?.id ? 500 : 700} variant="body1" component="h1">
                                                        {`${item.senderId === user?.id ? "Bạn đã gửi một yêu cầu đến " : item.ownerName}`}
                                                    </Typography>
                                                    <Typography fontSize={14} fontWeight={item.senderId === user?.id ? 700 : 500} variant="body1" component="h1">
                                                        {item.senderId === user?.id ? `${item.ownerName}` : "đã gửi bạn một yêu cầu"}
                                                    </Typography>
                                                </div>
                                                :
                                                <div className="flex space-x-2">
                                                    <Typography fontSize={14} fontWeight={item.senderId === user?.id ? 500 : 700} variant="body1" component="h1">
                                                        {`${item.senderId === user?.id ? "Bạn đã gửi một yêu cầu đến" : item.ownerName}`}
                                                    </Typography>
                                                    <Typography fontSize={14} fontWeight={item.senderId === user?.id ? 700 : 500} variant="body1" component="h1">
                                                        {item.senderId === user?.id ? `${item.ordererName}` : "đã gửi bạn một yêu cầu"}
                                                    </Typography>
                                                </div>
                                            }
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
                                                <Typography className={`${item.status === 0 && "text-blue-500"}  ${item.status === 5 && "text-yellow-500"} ${item.status === 6 && "text-yellow-500"} ${item.status === 1 && "text-yellow-500"} ${item.status === 2 && "text-yellow-500"} ${item.status === 3 && "text-primary"}  ${item.status === 7 && "text-primary"}  ${item.status === 9 && "text-primary"}   ${item.status === 4 && "text-red-500"}  ${item.status === 8 && "text-red-500"} `} fontWeight={700} fontSize={14} variant="body1" component="h1">
                                                    {item.status === 0 && "Chưa thanh toán"}
                                                    {item.status === 2 && "Chờ xác nhận"}
                                                    {item.status === 3 && "Xác nhận thành công"}
                                                    {item.status === 4 && "Từ chối"}
                                                    {item.status === 5 && "Chờ lấy hàng"}
                                                    {item.status === 6 && "Đang giao"}
                                                    {item.status === 7 && "Giao hàng thành công"}
                                                    {item.status === 8 && "Từ chối nhận hàng"}
                                                    {item.status === 9 && "Đã hoàn tiền đặt hàng"}
                                                </Typography>

                                            </div>
                                            <div className="flex   space-x-2">
                                                <Typography fontSize={14} variant="body1" component="h1">
                                                    {`Total :`}
                                                </Typography>
                                                <Typography fontSize={14} variant="body1" component="h1">
                                                    <Currency quantity={item.total} currency="VND" pattern="##,### !" />
                                                </Typography>
                                            </div>
                                            <div className="flex   space-x-2">
                                                <Typography fontSize={14} variant="body1" component="h1">
                                                    {`Amount product :`}
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