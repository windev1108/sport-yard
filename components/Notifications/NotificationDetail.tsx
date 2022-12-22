import React, { useState, useEffect, memo } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Divider, Skeleton, Stack, Step, StepIconProps, StepLabel, Stepper, Typography, Tooltip, TextField } from '@mui/material';
import axios from 'axios';
import { Cart, Order, Pitch, Product, User } from '../../Models';
import Currency from 'react-currency-formatter';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { ImLoop2 } from 'react-icons/im'
import { setIsUpdate, setOpenBackdropModal, setOpenNotificationDetail, setOpenPaymentModal } from '../../redux/features/isSlice';
import { setIdOrder } from '../../redux/features/ordersSlice'
import { TbSoccerField, TbBrandBooking, TbInboxOff } from 'react-icons/tb';
import { BiTime } from 'react-icons/bi';
import dynamic from 'next/dynamic'
import { ImLocation } from 'react-icons/im';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import { MdPayments, MdOutlineDoneOutline } from 'react-icons/md';
import { AiOutlineClose, AiOutlineInbox } from 'react-icons/ai';
import { BsTruck } from 'react-icons/bs';
import { GrDropbox, GrNext, GrNotes, GrPrevious } from 'react-icons/gr';
import IconButton from '@mui/material/IconButton';
const Map = dynamic(() => import("../Map"), { ssr: false })
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { RiRefund2Fill } from 'react-icons/ri';
import currencyFormatter from 'currency-formatter'
import io from 'socket.io-client';


interface State {
    order: Order | any
    pitch: Pitch | any
    reasonReject: string
    isLoading: boolean
}


let socket: any

const OrderDetail = ({ mutate }: any) => {
    const dispatch = useDispatch()
    const { isUpdated, isOpenNotificationDetail }: any = useSelector<RootState>(state => state.is)
    const { user }: any = useSelector<RootState>(state => state.user)
    const { idOrder }: any = useSelector<RootState>(state => state.orders)
    const [state, setState] = useState<State>({
        order: {},
        reasonReject: "",
        pitch: {},
        isLoading: true,
    })
    const { order, reasonReject, isLoading } = state
    const [formReasonRejectTakeGood, setFormReasonRejectTakeGood] = useState(false)
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));


    useEffect(() => {
        if (order.type === "booking") {
            axios.get(`/api/orders/${idOrder}`)
                .then(res => {
                    axios.get(`/api/pitch/${res.data.productId}`)
                        .then(resPitch => setState({ ...state, pitch: resPitch.data, order: res.data, isLoading: false }))
                })
        } else {
            axios.get(`/api/orders/${idOrder}`)
                .then(res => {
                    setState({ ...state, order: res.data, isLoading: false })
                })

        }

    }, [isUpdated])



    useEffect(() => {
        socketInitializer()
    }, [])


    const socketInitializer = async () => {
        socket = io(process.env.NEXT_PUBLIC_SERVER || "http://localhost:5000")
        socket.on('connect', () => {
            console.log('Socket connected')
        })
    }

    const handleClose = () => {
        dispatch(setOpenNotificationDetail(false))
    }


    const handleAcceptRequest = async () => {
        const { data } = await axios.get(`/api/users/${order.orderId}`)
        if (order.methodPay === 1 && user?.balance < (order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!)) {
            toast.info(`Số dư của bạn không đủ ${currencyFormatter.format(order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!, { code: 'VND' })} phí dịch vụ , vui lòng nạp thêm `, { autoClose: 3000, theme: "colored" })
        } else if (order.methodPay === 2 && data?.balance < order.total) {
            toast.info("Số dư của khách hàng không đủ để hoàn thành thanh toán này", { autoClose: 3000, theme: "colored" })
        } else {
            dispatch(setOpenBackdropModal(true))
            setTimeout(async () => {
                // if order === booking thi tru tien va + phi van chuyen
                if (order.methodPay === 2 && order.type === "order") {
                    const { data } = await axios.get(`/api/users/${order.orderId}`)
                    axios.put(`/api/users/${order.orderId}`, {
                        balance: data.balance - (order.total + +process.env.NEXT_PUBLIC_TRANSPORT_FEE!)
                    })
                    axios.put(`/api/users/${user.id}`, {
                        balance: user.balance + order.total - (order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!) + +process.env.NEXT_PUBLIC_TRANSPORT_FEE!
                    })
                } else {
                    const { data } = await axios.get(`/api/users/${order.orderId}`)
                    axios.put(`/api/users/${data.orderId}`, {
                        balance: data.balance - (order.total)
                    })
                    order.methodPay === 2 ?
                        axios.put(`/api/users/${user.id}`, {
                            balance: user.balance + order.total - (order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!)
                        })
                        : axios.put(`/api/users/${user.id}`, {
                            balance: user.balance - (order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!)
                        })
                }

                order.methodPay === 2 && axios.put(`/api/users/${process.env.NEXT_PUBLIC_ADMIN_ID}`, {
                    balance: data.balance + (order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!)
                })

                // Clear remove order in orders pending
                socket.emit("delete_order", {
                    orderId: idOrder,
                })

                // Change status order to accept
                axios.put(`/api/orders/${idOrder}`, {
                    status: 3,
                    senderId: order.receiverId,
                    receiverId: order.senderId,
                })
                mutate()
                dispatch(setOpenBackdropModal(false))
            }, 2000)

        }
    }


    const handleRejectRequest = async () => {
        axios.put(`/api/orders/${idOrder}`, {
            status: 4,
            senderId: order.receiverId,
            receiverId: order.senderId,
        })
        socket.emit("delete_order", {
            orderId: idOrder,
        })
        mutate()
        dispatch(setOpenNotificationDetail(false))
    }

    const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
        [`&.${stepConnectorClasses.alternativeLabel}`]: {
            top: 22,
        },
        [`&.${stepConnectorClasses.active}`]: {
            [`& .${stepConnectorClasses.line}`]: {
                backgroundImage:
                    'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
            },
        },
        [`&.${stepConnectorClasses.completed}`]: {
            [`& .${stepConnectorClasses.line}`]: {
                backgroundImage:
                    'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
            },
        },
        [`& .${stepConnectorClasses.line}`]: {
            height: 3,
            border: 0,
            backgroundColor:
                theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
            borderRadius: 1,
        },
    }));

    const ColorlibStepIconRoot = styled('div')<{
        ownerState: { completed?: boolean; active?: boolean };
    }>(({ theme, ownerState }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
        zIndex: 1,
        color: '#fff',
        width: 50,
        height: 50,
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        ...(ownerState.active && {
            backgroundImage:
                'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
            boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
        }),
        ...(ownerState.completed && {
            backgroundImage:
                'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
        }),
    }));


    function ColorlibStepIconOrder(props: StepIconProps) {
        const { active, completed, className } = props;

        const icons: { [index: string]: React.ReactElement } = {
            1: <TbBrandBooking />,
            2: <MdPayments />,
            3: <ImLoop2 />,
            4: order.status === 4 || order.status === 10 ? <AiOutlineClose /> : <MdOutlineDoneOutline />,
            5: <AiOutlineInbox />,
            6: <BsTruck />,
            7: order.status === 8 || order.status === 9 ? order.status === 9 ? <RiRefund2Fill /> : <TbInboxOff /> : <GrDropbox />,
        };


        return (
            <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
                {icons[String(props.icon)]}
            </ColorlibStepIconRoot>
        );
    }


    function ColorlibStepIconBooking(props: StepIconProps) {
        const { active, completed, className } = props;

        const icons: { [index: string]: React.ReactElement } = {
            1: <TbBrandBooking />,
            2: <MdPayments />,
            3: <ImLoop2 />,
            4: order.status === 4 || order.status === 10 ? <AiOutlineClose /> : <MdOutlineDoneOutline />
        }


        return (
            <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
                {icons[String(props.icon)]}
            </ColorlibStepIconRoot>
        );
    }
    const stepsOrder =
        ["Đặt hàng",
            'Thanh toán',
            "Chờ xác nhận",
            order.status === 4 ? "Từ chối đơn hàng" : `${order.status === 10 ? "Đơn hàng đã hết hiệu lực" : "Xác nhận đơn hàng"}`,
            "Chờ lấy hàng",
            "Đang giao",
            order.status === 8 || order.status === 9 ? `${order.status === 9 ? "Đã hoàn tiền đặt hàng" : "Từ chối nhận hàng"}` : "Giao hàng thành công",
        ]




    const stepsBooking =
        ["Đặt trước",
            'Thanh toán',
            "Chờ xác nhận",
            order.status === 4 ? "Từ chối đặt sân" : `${order.status === 10 ? 'Đơn hàng đã hết hiệu lực' : 'Đặt sân thành công'}`
            ,
        ]



    const handleOpenPayment = () => {
        dispatch(setIdOrder(idOrder))
        dispatch(setOpenBackdropModal(true))
        setTimeout(() => {
            dispatch(setOpenNotificationDetail(false))
            dispatch(setOpenBackdropModal(false))
            dispatch(setOpenPaymentModal(true))
        }, 1500)
    }

    const handleNextStep = () => {
        if (order.status >= 6) {
            toast.info("Max step", { autoClose: 3000, theme: "colored" })
        } else if (order.status === 3) {
            axios.put(`/api/orders/${idOrder}`, {
                status: order.status + 2
            })
        } else {
            axios.put(`/api/orders/${idOrder}`, {
                status: order.status + 1
            })
        }
        dispatch(setIsUpdate(Math.floor(Math.random() * 900000 + 10000)))
    }

    const handlePrevStep = () => {
        if (order.status <= 5) {
            toast.info("Không thể quay lại step trước đó", { autoClose: 3000, theme: "colored" })
        } else {
            axios.put(`/api/orders/${idOrder}`, {
                status: order.status - 1
            })
        }
    }

    const handleConfirmTakeGoodSuccess = () => {
        axios.put(`/api/orders/${idOrder}`, {
            status: 7
        })
        mutate()
    }


    const handleRejectTakeGoods = () => {
        if (!reasonReject) {
            toast.info("Vui lòng nhập lý do từ nhận hàng", { autoClose: 3000, theme: "colored" })
        } {
            axios.put(`/api/orders/${idOrder}`, {
                status: 8,
                message: reasonReject
            })
        }
        setFormReasonRejectTakeGood(false)
        mutate()
    }

    const handleRefundOrder = async () => {
        const { data } = await axios.get(`/api/users/${order.orderId}`)

        dispatch(setOpenBackdropModal(true))
        setTimeout(() => {
            axios.put(`/api/users/${order.orderId}`, {
                balance: data.balance + order.total
            })
            axios.put(`/api/users/${user?.id}`, {
                balance: user.balance - order.total
            })
            axios.put(`/api/orders/${idOrder}`, {
                status: 9
            })
            dispatch(setOpenBackdropModal(false))
            handleClose()
            toast.success("Hoàn tiền đặt hàng thành công ", { autoClose: 3000, theme: "colored" })
        }, 1500)
    }

    return (
        <>
            <Dialog fullScreen={fullScreen} open={formReasonRejectTakeGood} onClose={() => setFormReasonRejectTakeGood(false)}>
                <DialogTitle>
                    <Typography variant="body1" component="h1">
                        Lý do chối nhận hàng
                    </Typography>
                </DialogTitle>
                <DialogContent className="w-[30rem]">
                    <TextField
                        value={reasonReject}
                        onChange={(e) => setState({ ...state, reasonReject: e.target.value })}
                        autoFocus
                        margin="dense"
                        label="Phản hồi"
                        type="email"
                        fullWidth
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button className="border-primary text-primary" variant="outlined" onClick={() => setFormReasonRejectTakeGood(false)}>Hủy</Button>
                    <Button className="!bg-primary text-white" variant="contained" onClick={handleRejectTakeGoods}>Xác nhận</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                fullScreen={fullScreen}
                open={isOpenNotificationDetail} onClose={handleClose} maxWidth="xl" >
                <DialogTitle className="lg:py-6">
                    {isLoading ?
                        <div className="flex justify-center mb-4 ">
                            <Skeleton className="" variant="text" width={120} height={40} />
                        </div>
                        :
                        <Typography className="pb-4" align='center' alignItems={"center"} fontWeight={700} fontSize={20} variant="body1" component="h1">
                            Chi tiết đơn hàng
                        </Typography>
                    }
                    <IconButton
                        className="absolute top-1 right-0"
                        onClick={handleClose}
                    >
                        <AiOutlineClose size={20} />
                    </IconButton>
                    <Divider />
                    {isLoading ?
                        <Skeleton variant="text" className="py-[32px] mx-[24px]" width={180} height={50} />
                        :
                        <>
                            <Stack className="py-2 shadow-md  w-full" sx={{ width: '100%' }} spacing={4}>
                                {order.status === 10 && order.type === "order" ?
                                    <Stepper alternativeLabel activeStep={3} connector={<ColorlibConnector />}>
                                        {stepsOrder.map((label, index) => (
                                            <Step key={index}>
                                                <StepLabel StepIconComponent={ColorlibStepIconOrder}>{label}</StepLabel>
                                            </Step>
                                        ))
                                        }
                                    </Stepper>
                                    :
                                    <Stepper alternativeLabel activeStep={order.status === 4 || order.status === 8 || order.status === 5 || order.status === 6 ? order.status - 1 : order.status} connector={<ColorlibConnector />}>
                                        {order.type === "order" ?
                                            stepsOrder.map((label, index) => (
                                                <Step key={index}>
                                                    <StepLabel StepIconComponent={ColorlibStepIconOrder}>{label}</StepLabel>
                                                </Step>
                                            ))
                                            :
                                            stepsBooking.map((label, index) => (
                                                <Step key={index}>
                                                    <StepLabel StepIconComponent={ColorlibStepIconBooking}>{label}</StepLabel>
                                                </Step>
                                            ))
                                        }
                                    </Stepper>
                                }
                            </Stack>
                            {user.id === order.ownerId && order.status !== 6 && order.status !== 2 && order.status !== 4 && order.status !== 8 && order.status !== 10 && order.type === "order" &&
                                <div className="flex justify-center space-x-5">
                                    <IconButton
                                        onClick={handlePrevStep}
                                    >
                                        <GrPrevious size={25} />
                                    </IconButton>
                                    <IconButton
                                        onClick={handleNextStep}
                                    >
                                        <GrNext size={25} />
                                    </IconButton>
                                </div>
                            }

                        </>

                    }
                </DialogTitle>

                {order.type === "booking" ?
                    <DialogContent className="lg:flex space-y-2  w-full lg:w-[60rem]">
                        <div className="flex-col space-y-2 w-full lg:w-[60%]">
                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={200} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Đơn hàng : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {`Sân bóng đá`}
                                    </Typography>
                                </div>
                            }


                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={140} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Trạng thái : `}
                                    </Typography>
                                    <Typography className={`${order.status === 0 && "text-blue-500"} ${order.status === 2 && "text-yellow-500"} ${order.status === 3 && "text-primary"} ${order.status === 4 || order.status === 10 && "text-red-500"}`} fontWeight={700} variant="body1" component="h1">
                                        {order.status === 0 && "Chưa thanh toán"}
                                        {order.status === 2 && "Chờ xác nhận"}
                                        {order.status === 3 && "Xác nhận đặt sân thành công"}
                                        {order.status === 4 && "Từ chối đặt sân"}
                                        {order.status === 10 && "Đơn hàng đã hết hạn"}
                                    </Typography>
                                </div>
                            }

                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={200} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Tên : `}
                                    </Typography>
                                    <Link href={`/pitch/${order.productId}`}>
                                        <Typography className="hover:underline" fontWeight={700} variant="body1" component="h1">
                                            {order.nameProduct}
                                        </Typography>
                                    </Link>
                                </div>
                            }

                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={200} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <ImLocation size={20} className="text-gray-400" />
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {order.location}
                                    </Typography>
                                </div>
                            }

                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={180} height={25} />
                                :
                                <div className="flex space-x-6 pr-3">
                                    <div className="flex space-x-2 items-center">
                                        <TimelapseIcon className="rotate-[-15deg] text-primary" />
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            {`${order.duration} mins`}
                                        </Typography>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <TbSoccerField size={25} className="text-primary" />
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            {`${order.size} V ${order.size}`}
                                        </Typography>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <BiTime size={25} className="text-primary" />
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            {`Slot ${order.slot} (${order.time})`}
                                        </Typography>
                                    </div>
                                </div>
                            }

                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={180} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Ngày đặt sân : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {dayjs(order.date).format("dddd DD/MM/YYYY")}
                                    </Typography>
                                </div>
                            }

                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={180} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Người đặt  : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {`${order?.ordererName}`}
                                    </Typography>
                                </div>
                            }


                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={180} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Chủ sân : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {order?.ownerName}
                                    </Typography>
                                </div>
                            }


                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={220} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Tổng tiền : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        <Currency quantity={order.total || 0} currency="VND" pattern="##,### !" />
                                    </Typography>
                                </div>
                            }


                            {user.id === order.ownerId &&
                                <div className="flex space-x-2 items-center">
                                    <Typography variant="body1" component="h1">
                                        {`Phí dịch vụ : `}
                                    </Typography>
                                    <div className="flex space-x-2 items-center">
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            -
                                            <Currency quantity={+order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!} currency="VND" pattern="##,### !" />
                                        </Typography>
                                        <Typography fontWeight={500} variant="body1" component="h1">
                                            {"(10%)"}
                                        </Typography>
                                        <Tooltip title="Owner chịu phí dịch vụ trên 10% giá trị đơn hàng">
                                            <IconButton>
                                                <GrNotes className="!text-yellow-500" size={12} />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </div>
                            }

                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={220} height={25} />
                                :
                                order.status !== 0 &&
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Phương thức thanh toán : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {order.methodPay === 1 && "Chuyển khoản"}
                                        {order.methodPay === 2 && "Ví Sport Pay"}
                                        {order.methodPay === 3 && "Thanh toán khi nhận hàng"}
                                    </Typography>
                                </div>
                            }

                            {order.methodPay === 1 &&
                                <>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-2">
                                            <Typography variant="body1" component="h1">
                                                {`Tên tài khoản : `}
                                            </Typography>
                                            <Typography fontWeight={700} variant="body1" component="h1">
                                                {order.bank?.name}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-2">
                                            <Typography variant="body1" component="h1">
                                                {`Số tài khoản : `}
                                            </Typography>
                                            <Typography fontWeight={700} variant="body1" component="h1">
                                                {order.bank?.accountNumber}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-2">
                                            <Typography variant="body1" component="h1">
                                                {`Nội dung chuyển khoản : `}
                                            </Typography>
                                            <Typography fontWeight={700} variant="body1" component="h1">
                                                {order.transferContent}
                                            </Typography>
                                        </div>
                                    </div>
                                </>
                            }


                            {order.status === 4 && order.ownerId !== user.id &&
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Tin nhắn : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {`Đã Hoàn tiền đặt hàng`}
                                    </Typography>
                                </div>
                            }




                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={180} height={25} />
                                :
                                order.bookingId &&
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Trace code  : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {order.bookingId}
                                    </Typography>
                                </div>
                            }

                        </div>
                        <div className="w-full lg:w-[40%]">
                            {isLoading ?
                                <Skeleton variant="rectangular" className="w-full" height={350} />
                                :
                                order.productId && <Map pitchId={order.productId} />
                            }
                        </div>
                    </DialogContent> :
                    <DialogContent className="block space-y-2 w-full lg:w-[60rem]">
                        <div className="flex-col space-y-2 w-full]">
                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={200} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Đơn hàng : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {`Sản phẩm`}
                                    </Typography>
                                </div>
                            }


                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={140} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Trạng thái : `}
                                    </Typography>
                                    <Typography className={`${order.status === 0 && "text-blue-500"} ${order.status === 5 && "text-yellow-500"} ${order.status === 6 && "text-yellow-500"}  ${order.status === 1 && "text-yellow-500"}   ${order.status === 2 && "text-yellow-500"} ${order.status === 3 && "text-primary"}  ${order.status === 7 && "text-primary"}  ${order.status === 9 && "text-primary"}   ${order.status === 4 && "text-red-500"}  ${order.status === 8 || order.status === 10 && "text-red-500"}`} fontWeight={700} variant="body1" component="h1">
                                        {order.status === 2 && "Chờ xác nhận"}
                                        {order.status === 3 && "Xác nhận đơn hàng thành công"}
                                        {order.status === 4 && "Từ chối đơn hàng"}
                                        {order.status === 5 && "Chờ lấy hàng"}
                                        {order.status === 6 && "Đang giao"}
                                        {order.status === 7 && "Giao hàng thành công"}
                                        {order.status === 8 && "Từ chối nhận hàng"}
                                        {order.status === 9 && "Đã hoàn tiền đặt hàng"}
                                        {order.status === 10 && "Đơn hàng đã hết hiệu lực"}
                                    </Typography>
                                </div>
                            }


                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={200} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {"Địa chỉ nhận hàng :"}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {order.address}
                                    </Typography>
                                </div>
                            }


                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={180} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Người đặt : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {`${order?.ordererName}`}
                                    </Typography>
                                </div>
                            }


                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={180} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Chủ shop : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {order?.ownerName}
                                    </Typography>
                                </div>
                            }


                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={220} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Thành tiền : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        <Currency quantity={order.total || 0} currency="VND" pattern="##,### !" />
                                    </Typography>
                                </div>
                            }

                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={220} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Phí dịch vụ : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        <Currency quantity={order.total / 100 * 10} currency="VND" pattern="##,### !" />
                                    </Typography>
                                    <Typography variant="body1" component="h1">
                                        (10%)
                                    </Typography>
                                </div>
                            }

                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={220} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Phí vận chuyển : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        <Currency quantity={+process.env.NEXT_PUBLIC_TRANSPORT_FEE!} currency="VND" pattern="##,### !" />
                                    </Typography>
                                </div>
                            }

                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={220} height={25} />
                                :
                                order.status === 8 &&
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Phản hồi : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {order.message}
                                    </Typography>
                                </div>
                            }
                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={220} height={25} />
                                :
                                order.status === 9 &&
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Phản hồi : `}
                                    </Typography>
                                    <div className="flex space-x-2">
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            {"Hoàn tiền đặt hàng"}
                                        </Typography>
                                        <Typography variant="body1" component="h1">
                                            (+<Currency quantity={order.total - order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!} currency="VND" pattern="##,###!" />)
                                        </Typography>
                                    </div>
                                </div>
                            }


                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={220} height={25} />
                                :
                                order.status !== 0 &&
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Phương thức thanh toán : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {order.methodPay === 1 && "Chuyển khoản"}
                                        {order.methodPay === 2 && "Sport Pay Wallet"}
                                        {order.methodPay === 3 && "Thanh toán khi nhận hàng"}
                                    </Typography>
                                </div>
                            }

                            {order.methodPay === 1 &&
                                <>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-2">
                                            <Typography variant="body1" component="h1">
                                                {`Tên tài khoản : `}
                                            </Typography>
                                            <Typography fontWeight={700} variant="body1" component="h1">
                                                {order.bank?.name}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-2">
                                            <Typography variant="body1" component="h1">
                                                {`Số tài khoản : `}
                                            </Typography>
                                            <Typography fontWeight={700} variant="body1" component="h1">
                                                {order.bank?.accountNumber}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-2">
                                            <Typography variant="body1" component="h1">
                                                {`Nội dung chuyển khoản : `}
                                            </Typography>
                                            <Typography fontWeight={700} variant="body1" component="h1">
                                                {order.transferContent}
                                            </Typography>
                                        </div>
                                    </div>
                                </>
                            }


                            {order.status === 4 && order.ownerId !== user.id &&
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Tin nhắn : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {`Hoàn tiền đặt hàng`}
                                    </Typography>
                                </div>
                            }



                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={180} height={25} />
                                :
                                order.bookingId &&
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Trace code  : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {order.bookingId}
                                    </Typography>
                                </div>
                            }

                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={180} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Ngày đặt hàng : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {dayjs(order.date).format("DD/MM/YYYY")}
                                    </Typography>
                                </div>
                            }
                        </div>
                        <Divider />
                        <div className="flex-col space-y-2 w-full">
                            {isLoading
                                ?
                                <Skeleton variant="rectangular" className="w-full h-[30rem]" />
                                :
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" className="py-3 px-6">
                                                Hình ảnh
                                            </th>
                                            <th scope="col" className="py-3 px-6">
                                                Tên
                                            </th>
                                            <th scope="col" className="py-3 px-6">
                                                Size
                                            </th>
                                            <th scope="col" className="py-3 px-6">
                                                Số lượng
                                            </th>
                                            <th scope="col" className="py-3 px-6">
                                                Giá
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.products?.map((p: Cart, index: number) => (
                                            <tr key={index} className=" bg-white dark:bg-gray-800">
                                                <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    <img className="object-cover w-20 h-20" src={p.product?.mainPictures[0]} alt="" />
                                                </th>
                                                <td className="py-4 px-6">
                                                    {p.product.name}
                                                </td>
                                                <td className="py-4 px-6">
                                                    {p.size}
                                                </td>
                                                <td className="pl-12 py-4">
                                                    {p.amount}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <Currency quantity={(p.product.price - p.product.price / 100 * p.product.discount) * p.amount} currency="VND" pattern="##,###!" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            }
                        </div>
                    </DialogContent>
                }
                {user.id === order.ownerId && order.status === 2 &&
                    <DialogActions className="flex items-center  bg-gray-100 w-full">
                        <div className="flex space-x-2">
                            <Button
                                onClick={handleRejectRequest}
                                variant='outlined' className="!bg-red-600 !text-white">Từ chối</Button>
                            <Button
                                onClick={handleAcceptRequest}
                                className="!bg-primary !text-white">Chấp nhận</Button>
                        </div>
                    </DialogActions>
                }
                {user.id === order.senderId && order.status === 0 &&
                    <DialogActions className="flex items-center  bg-gray-100 w-full">
                        <div className="flex space-x-2">
                            <Button
                                onClick={() => dispatch(setOpenNotificationDetail(false))}
                                variant='outlined'
                                className="!border-primary text-primary bg-white"
                            >Thoát</Button>
                            <Button
                                onClick={handleOpenPayment}
                                className="!bg-primary !text-white">Thanh toán</Button>
                        </div>
                    </DialogActions>
                }

                {order.status === 6 && user.id === order.orderId &&
                    <DialogActions className="flex items-center  bg-gray-100 w-full">
                        <div className="flex justify-end my-3">
                            <div className="flex space-x-2">
                                <Button
                                    onClick={() => setFormReasonRejectTakeGood(true)}
                                    className="!bg-red-500 text-white" variant="contained">
                                    Từ chối nhận hàng
                                </Button>
                                <Button
                                    onClick={handleConfirmTakeGoodSuccess}
                                    className="!bg-primary text-white" variant="contained">
                                    Tôi đã nhận được hàng
                                </Button>
                            </div>
                        </div>
                    </DialogActions>
                }

                {order.status === 8 && order.methodPay === 2 && user.id === order.ownerId &&
                    <DialogActions className="flex items-center  bg-gray-100 w-full">
                        <div className="flex justify-end my-3">
                            <div className="flex space-x-2">
                                <Button
                                    onClick={handleRefundOrder}
                                    className="!bg-primary text-white" variant="contained">
                                    Hoàn tiền đặt hàng
                                </Button>
                            </div>
                        </div>
                    </DialogActions>
                }
            </Dialog >
        </>
    )
}




export default memo(OrderDetail)