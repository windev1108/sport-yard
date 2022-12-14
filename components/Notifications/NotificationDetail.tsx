import React, { useState, useEffect, memo } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Divider, Skeleton, Stack, Step, StepIconProps, StepLabel, Stepper, Typography, Tooltip, TextField } from '@mui/material';
import { Cart, Order, Pitch, Product, User } from '../../Models';
import Currency from 'react-currency-formatter';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import { toast } from 'react-toastify';
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
import 'moment/locale/vi';
import io from 'socket.io-client';
import { NextPage } from 'next';
import moment from 'moment';
import instance from '../../server/db/instance';


interface State {
    order: Order | any
    pitch: Pitch | any
    reasonReject: string
    isLoading: boolean
}

interface Props {
    notifications: Order[]
}


let socket: any

const OrderDetail: NextPage<Props> = ({ notifications }) => {
    const dispatch = useDispatch()
    const { isOpenNotificationDetail }: any = useSelector<RootState>(state => state.is)
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
            instance.get(`/orders/${idOrder}`)
                .then(res => {
                    instance.get(`/pitch/${res.data.productId}`)
                        .then(resPitch => setState({ ...state, pitch: resPitch.data, order: res.data, isLoading: false }))
                })
        } else {
            instance.get(`/orders/${idOrder}`)
                .then(res => {
                    setState({ ...state, order: res.data, isLoading: false })
                })

        }

    }, [notifications])



    useEffect(() => {
        moment.locale("vi")
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
        const { data } = await instance.get(`/users/${order.ordererId}`)
        if (order.methodPay === 3 && user?.balance < (order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!)) {
            toast.info(`S??? d?? c???a b???n kh??ng ????? ${currencyFormatter.format(order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!, { code: 'VND' })} ph?? d???ch v??? , vui l??ng n???p th??m `, { autoClose: 3000, theme: "colored" })
        } else if (order.methodPay === 2 && data?.balance < order.total) {
            toast.info("S??? d?? c???a kh??ch h??ng kh??ng ????? ????? ho??n th??nh thanh to??n n??y", { autoClose: 3000, theme: "colored" })
        } else {
            dispatch(setOpenBackdropModal(true))
            setTimeout(async () => {
                // if order === booking thi tru tien va + phi van chuyen
                if (order.type === "order") {
                    const { data } = await instance.get(`/users/${order?.ordererId}`)
                    order.methodPay === 2 && instance.put(`/users/${order.ordererId}`, {
                        balance: data.balance - (order.total + +process.env.NEXT_PUBLIC_TRANSPORT_FEE!)
                    })
                    order.methodPay === 2 && instance.put(`/users/${user?.id}`, {
                        balance: user.balance + order.total - (order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!) + +process.env.NEXT_PUBLIC_TRANSPORT_FEE!
                    })
                    order.methodPay === 3 && instance.put(`/users/${user.id}`, {
                        balance: user.balance - (order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!)
                    })
                } else {
                    const { data } = await instance.get(`/users/${order.ordererId}`)
                    order.methodPay === 2 && instance.put(`/users/${order.ordererId}`, {
                        balance: data.balance - (order.total)
                    })
                    order.methodPay === 2 && instance.put(`/users/${user?.id}`, {
                        balance: user.balance + order.total - (order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!)
                    })
                }

                order.methodPay === 2 && instance.put(`/users/${process.env.NEXT_PUBLIC_ADMIN_ID}`, {
                    balance: data.balance + (order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!)
                })

                // Clear remove order in orders pending
                socket.emit("delete_order", {
                    ordererId: idOrder,
                })

                // Change status order to accept
                instance.put(`/orders/${idOrder}`, {
                    status: 3,
                    senderId: order.receiverId,
                    receiverId: order.senderId,
                })
                dispatch(setOpenBackdropModal(false))
            }, 2000)

        }
    }


    const handleRejectRequest = async () => {
        instance.put(`/orders/${idOrder}`, {
            status: 4,
            senderId: order.receiverId,
            receiverId: order.senderId,
        })
        socket.emit("delete_order", {
            ordererId: idOrder,
        })
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
        ["?????t h??ng",
            'Thanh to??n',
            "Ch??? x??c nh???n",
            order.status === 4 ? "T??? ch???i ????n h??ng" : `${order.status === 10 ? "????n h??ng ???? h???t h???n" : "X??c nh???n ????n h??ng"}`,
            "Ch??? l???y h??ng",
            "??ang giao",
            order.status === 8 || order.status === 9 ? `${order.status === 9 ? "???? ho??n ti???n ?????t h??ng" : "T??? ch???i nh???n h??ng"}` : "Giao h??ng th??nh c??ng",
        ]




    const stepsBooking =
        ["?????t tr?????c",
            'Thanh to??n',
            "Ch??? x??c nh???n",
            order.status === 4 ? "T??? ch???i ?????t s??n" : `${order.status === 10 ? '????n h??ng ???? h???t h???n' : '?????t s??n th??nh c??ng'}`
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
            instance.put(`/orders/${idOrder}`, {
                status: order.status + 2
            })
        } else {
            instance.put(`/orders/${idOrder}`, {
                status: order.status + 1
            })
        }
        dispatch(setIsUpdate(Math.floor(Math.random() * 900000 + 10000)))
    }

    const handlePrevStep = () => {
        if (order.status <= 5) {
            toast.info("Kh??ng th??? quay l???i step tr?????c ????", { autoClose: 3000, theme: "colored" })
        } else {
            instance.put(`/orders/${idOrder}`, {
                status: order.status - 1
            })
        }
    }

    const handleConfirmTakeGoodSuccess = async () => {
        instance.put(`/orders/${idOrder}`, {
            status: 7
        })
        order.products?.forEach(async (o: any) => {
            const res: { data: Product } = await instance.get(`/products/${o.product.id}`)
            instance.put(`/products/${o.product.id}`, {
                amount: res.data?.amount! - o.amount,
            })
        })
    }


    const handleRejectTakeGoods = async () => {
        if (!reasonReject) {
            toast.info("Vui l??ng nh???p l?? do t??? nh???n h??ng", { autoClose: 3000, theme: "colored" })
        } else {
            instance.put(`/orders/${idOrder}`, {
                status: 8,
                message: reasonReject
            })
            if (order?.methodPay === 3) {
                const { data }: any = instance.get(`/users/${order.ownerId}`)
                instance.put(`/orders/${order?.ownerId}`, {
                    balance: data.balance + +order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!
                })
            }
        }
        setFormReasonRejectTakeGood(false)
    }

    const handleRefundOrder = async () => {
        const { data } = await instance.get(`/users/${order.ordererId}`)

        dispatch(setOpenBackdropModal(true))
        setTimeout(() => {
            instance.put(`/users/${order.ordererId}`, {
                balance: data.balance + order.total
            })
            instance.put(`/users/${user?.id}`, {
                balance: user.balance - order.total
            })
            instance.put(`/orders/${idOrder}`, {
                status: 9
            })
            dispatch(setOpenBackdropModal(false))
            handleClose()
            toast.success("Ho??n ti???n ?????t h??ng th??nh c??ng ", { autoClose: 3000, theme: "colored" })
        }, 1500)
    }

    return (
        <>
            <Dialog fullScreen={fullScreen} open={formReasonRejectTakeGood} onClose={() => setFormReasonRejectTakeGood(false)}>
                <DialogTitle>
                    <Typography variant="body1" component="h1">
                        L?? do ch???i nh???n h??ng
                    </Typography>
                </DialogTitle>
                <DialogContent className="w-[30rem]">
                    <TextField
                        value={reasonReject}
                        onChange={(e) => setState({ ...state, reasonReject: e.target.value })}
                        autoFocus
                        margin="dense"
                        label="Ph???n h???i"
                        type="email"
                        fullWidth
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button className="border-primary text-primary" variant="outlined" onClick={() => setFormReasonRejectTakeGood(false)}>H???y</Button>
                    <Button className="!bg-primary text-white" variant="contained" onClick={handleRejectTakeGoods}>X??c nh???n</Button>
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
                            Chi ti???t ????n h??ng
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
                                        {`????n h??ng : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {`S??n b??ng ????`}
                                    </Typography>
                                </div>
                            }


                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={140} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Tr???ng th??i : `}
                                    </Typography>
                                    <Typography className={`${order.status === 0 && "text-blue-500"} ${order.status === 2 && "text-yellow-500"} ${order.status === 3 && "text-primary"} ${order.status === 4 || order.status === 10 && "text-red-500"}`} fontWeight={700} variant="body1" component="h1">
                                        {order.status === 0 && "Ch??a thanh to??n"}
                                        {order.status === 2 && "Ch??? x??c nh???n"}
                                        {order.status === 3 && "X??c nh???n ?????t s??n th??nh c??ng"}
                                        {order.status === 4 && "T??? ch???i ?????t s??n"}
                                        {order.status === 10 && "????n h??ng ???? h???t h???n"}
                                    </Typography>
                                </div>
                            }

                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={200} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`T??n : `}
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
                                        {`Ng??y ?????t s??n : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {moment(order.date).format("dddd DD/MM/YYYY").charAt(0).toUpperCase() + moment(order.date).format("dddd DD/MM/YYYY").slice(1)}
                                    </Typography>
                                </div>
                            }

                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={180} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Ng?????i ?????t  : `}
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
                                        {`Ch??? s??n : `}
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
                                        {`T???ng ti???n : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        <Currency quantity={order.total || 0} currency="VND" pattern="##,### !" />
                                    </Typography>
                                </div>
                            }


                            {user.id === order.ownerId &&
                                <div className="flex space-x-2 items-center">
                                    <Typography variant="body1" component="h1">
                                        {`Ph?? d???ch v??? : `}
                                    </Typography>
                                    <div className="flex space-x-2 items-center">
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            -
                                            <Currency quantity={+order.total / 100 * +process.env.NEXT_PUBLIC_SERVICE_FEE!} currency="VND" pattern="##,### !" />
                                        </Typography>
                                        <Typography fontWeight={500} variant="body1" component="h1">
                                            {"(10%)"}
                                        </Typography>
                                        <Tooltip title="Owner ch???u ph?? d???ch v??? tr??n 10% gi?? tr??? ????n h??ng">
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
                                        {`Ph????ng th???c thanh to??n : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {order.methodPay === 1 && "Chuy???n kho???n"}
                                        {order.methodPay === 2 && "V?? Sport Pay"}
                                        {order.methodPay === 3 && "Thanh to??n khi nh???n h??ng"}
                                    </Typography>
                                </div>
                            }

                            {order.methodPay === 1 &&
                                <>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-2">
                                            <Typography variant="body1" component="h1">
                                                {`T??n t??i kho???n : `}
                                            </Typography>
                                            <Typography fontWeight={700} variant="body1" component="h1">
                                                {order.bank?.name}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-2">
                                            <Typography variant="body1" component="h1">
                                                {`S??? t??i kho???n : `}
                                            </Typography>
                                            <Typography fontWeight={700} variant="body1" component="h1">
                                                {order.bank?.accountNumber}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-2">
                                            <Typography variant="body1" component="h1">
                                                {`N???i dung chuy???n kho???n : `}
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
                                        {`Tin nh???n : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {`???? Ho??n ti???n ?????t h??ng`}
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
                                        {`????n h??ng : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {`S???n ph???m`}
                                    </Typography>
                                </div>
                            }


                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={140} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Tr???ng th??i : `}
                                    </Typography>
                                    <Typography className={`${order.status === 0 && "text-blue-500"} ${order.status === 5 && "text-yellow-500"} ${order.status === 6 && "text-yellow-500"}  ${order.status === 1 && "text-yellow-500"}   ${order.status === 2 && "text-yellow-500"} ${order.status === 3 && "text-primary"}  ${order.status === 7 && "text-primary"}  ${order.status === 9 && "text-primary"}   ${order.status === 4 && "text-red-500"}  ${order.status === 8 || order.status === 10 && "text-red-500"}`} fontWeight={700} variant="body1" component="h1">
                                        {order.status === 2 && "Ch??? x??c nh???n"}
                                        {order.status === 3 && "X??c nh???n ????n h??ng th??nh c??ng"}
                                        {order.status === 4 && "T??? ch???i ????n h??ng"}
                                        {order.status === 5 && "Ch??? l???y h??ng"}
                                        {order.status === 6 && "??ang giao"}
                                        {order.status === 7 && "Giao h??ng th??nh c??ng"}
                                        {order.status === 8 && "T??? ch???i nh???n h??ng"}
                                        {order.status === 9 && "???? ho??n ti???n ?????t h??ng"}
                                        {order.status === 10 && "????n h??ng ???? h???t h???n"}
                                    </Typography>
                                </div>
                            }


                            {isLoading ?
                                <Skeleton variant="text" className="!p-0" width={200} height={25} />
                                :
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {"?????a ch??? nh???n h??ng :"}
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
                                        {`Ng?????i ?????t : `}
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
                                        {`Ch??? shop : `}
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
                                        {`Th??nh ti???n : `}
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
                                        {`Ph?? d???ch v??? : `}
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
                                        {`Ph?? v???n chuy???n : `}
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
                                        {`Ph???n h???i : `}
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
                                        {`Ph???n h???i : `}
                                    </Typography>
                                    <div className="flex space-x-2">
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            {"Ho??n ti???n ?????t h??ng"}
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
                                        {`Ph????ng th???c thanh to??n : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {order.methodPay === 1 && "Chuy???n kho???n"}
                                        {order.methodPay === 2 && "Sport Pay Wallet"}
                                        {order.methodPay === 3 && "Thanh to??n khi nh???n h??ng"}
                                    </Typography>
                                </div>
                            }

                            {order.methodPay === 1 &&
                                <>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-2">
                                            <Typography variant="body1" component="h1">
                                                {`T??n t??i kho???n : `}
                                            </Typography>
                                            <Typography fontWeight={700} variant="body1" component="h1">
                                                {order.bank?.name}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-2">
                                            <Typography variant="body1" component="h1">
                                                {`S??? t??i kho???n : `}
                                            </Typography>
                                            <Typography fontWeight={700} variant="body1" component="h1">
                                                {order.bank?.accountNumber}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-2">
                                            <Typography variant="body1" component="h1">
                                                {`N???i dung chuy???n kho???n : `}
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
                                        {`Tin nh???n : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {`Ho??n ti???n ?????t h??ng`}
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
                                        {`Ng??y ?????t h??ng : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {moment(order.date).format("DD/MM/YYYY")}
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
                                                H??nh ???nh
                                            </th>
                                            <th scope="col" className="py-3 px-6">
                                                T??n
                                            </th>
                                            <th scope="col" className="py-3 px-6">
                                                Size
                                            </th>
                                            <th scope="col" className="py-3 px-6">
                                                S??? l?????ng
                                            </th>
                                            <th scope="col" className="py-3 px-6">
                                                Gi??
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
                                variant='outlined' className="!bg-red-600 !text-white">T??? ch???i</Button>
                            <Button
                                onClick={handleAcceptRequest}
                                className="!bg-primary !text-white">Ch???p nh???n</Button>
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
                            >Tho??t</Button>
                            <Button
                                onClick={handleOpenPayment}
                                className="!bg-primary !text-white">Thanh to??n</Button>
                        </div>
                    </DialogActions>
                }

                {order.status === 6 && user.id === order.ordererId &&
                    <DialogActions className="flex items-center  bg-gray-100 w-full">
                        <div className="flex justify-end my-3">
                            <div className="flex space-x-2">
                                <Button
                                    onClick={() => setFormReasonRejectTakeGood(true)}
                                    className="!bg-red-500 text-white" variant="contained">
                                    T??? ch???i nh???n h??ng
                                </Button>
                                <Button
                                    onClick={handleConfirmTakeGoodSuccess}
                                    className="!bg-primary text-white" variant="contained">
                                    T??i ???? nh???n ???????c h??ng
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
                                    Ho??n ti???n ?????t h??ng
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