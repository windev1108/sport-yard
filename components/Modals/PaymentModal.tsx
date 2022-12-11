import React, { useState, useEffect, useMemo } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { NextPage } from 'next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Divider, IconButton, Stack, Step, StepIconProps, StepLabel, Stepper, Skeleton, Snackbar, Typography, Tooltip } from '@mui/material';
import { AiFillCopy, AiOutlineClose } from 'react-icons/ai';
import Currency from 'react-currency-formatter';
import { SiBitcoincash } from 'react-icons/si';
import { TbBrandBooking, TbSoccerField } from 'react-icons/tb'
import { setOpenBackdropModal, setOpenNotificationDetail, setOpenPaymentModal } from '../../redux/features/isSlice'
import { Bank, Order, Pitch } from '../../Models';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import dynamic from 'next/dynamic';
import { ImLocation, ImLoop2 } from 'react-icons/im';
import { BiTime } from 'react-icons/bi';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import dayjs from 'dayjs';
import { BsCalendarDate, BsFillTelephoneFill } from 'react-icons/bs';
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';
import { MdOutlineDoneOutline, MdPayments } from 'react-icons/md';
import { RiErrorWarningLine } from 'react-icons/ri';
const Map = dynamic(() => import("../Map"), { ssr: false })



interface State {
    isLoading: boolean
    pitch?: Pitch | any
    owner: any
    methodPay: number
    bank: any
    bankCode: string
    transferContent: string
    random: number
    order: Order | any
}

interface Props {
    mutate: () => void
}

const PaymentModal: NextPage<Props> = ({ mutate }) => {
    const dispatch = useDispatch()
    const { isOpenPaymentModal }: any = useSelector<RootState>(state => state.is)
    const { idOrder }: any = useSelector<RootState>(state => state.orders)
    const { user }: any = useSelector<RootState>(state => state.user)
    const [state, setState] = useState<State>({
        isLoading: true,
        pitch: {},
        owner: {},
        methodPay: 0,
        bankCode: "",
        bank: {},
        order: {},
        random: 0,
        transferContent: ""
    })
    const { isLoading, pitch, owner, methodPay, bank, transferContent, bankCode, random, order } = state
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const SERVICE_ID: string | any = process.env.NEXT_PUBLIC_SERVICE_ID
    const TEMPLATE_ID: string | any = process.env.NEXT_PUBLIC_TEMPLATE_ID
    const PUBLIC_KEY: string | any = process.env.NEXT_PUBLIC_PUBLIC_KEY



    useEffect(() => {
        axios.get(`/api/orders/${idOrder}`)
            .then(resOrder => {
                axios.get(`/api/users/${resOrder.data.ownerId}`)
                    .then(resUsers => {
                        axios.get(`/api/pitch/${resOrder.data.productId}`)
                            .then(resPitch => {
                                setState({ ...state, pitch: resPitch.data, owner: resUsers.data, order: resOrder.data, isLoading: false })
                            })
                    })
            })

    }, [])



    useMemo(() => {
        const bankFound = owner.banks?.find((bank: Bank) => bank.bankCode === bankCode)
        const randomId = Math.floor(Math.random() * 900000 + 10000)
        setState({
            ...state, bank: bankFound, transferContent: `BOOKING_SPORTYARD_${randomId}`, random: randomId
        })
    }, [bankCode])

    const handleCoppyToClipboard = (value: string) => {
        navigator.clipboard.writeText(value)
        setOpenSnackbar(true)
    }

    const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    }

    const handleClose = () => {
        dispatch(setOpenPaymentModal(false))
    }


    const actionSnackbar = (
        <React.Fragment>
            <Button color="secondary" size="small" onClick={handleCloseSnackbar}>
                UNDO
            </Button>
            <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleCloseSnackbar}
            >
                <AiOutlineClose size={12} />
            </IconButton>
        </React.Fragment>
    );


    const handleSubmitPayment = async () => {
        if (methodPay === 0) {
            toast.info("Vui lòng chọn phương thức thanh toán", { autoClose: 3000, theme: "colored" })
        } else if (methodPay === 1 && !bank) {
            toast.info("Vui lòng chọn ngân hàng để thanh toán", { autoClose: 3000, theme: "colored" })
        } else if (methodPay === 2 && user.balance < order.total) {
            toast.info("Số dư của bạn không đủ", { autoClose: 3000, theme: "colored" })
        } else {
            dispatch(setOpenBackdropModal(true))
            mutate()
            setTimeout(() => {
                const traceCode = Math.floor(Math.random() * 900000 + 10000)
                axios.put(`/api/orders/${idOrder}`, {
                    methodPay: methodPay,
                    receiverId: owner.id,
                    ownerId: owner.id,
                    status: 2,
                    bank: methodPay === 1 ? bank : {},
                    bookingId: methodPay === 1 ? random : traceCode,
                    transferContent: methodPay === 1 ? transferContent : "",
                })
                const templateParams = {
                    to_name: `${owner.firstName} ${owner.lastName}`,
                    to_email: owner.email,
                    from_name: `${user.firstName} ${user.lastName}`,
                    from_email: user.email,
                    name_product: order.nameProduct,
                    total_price: `${order.total}đ`,
                    method_pay: methodPay === 1 ? "Chuyển khoản" : "Ví Sport Pay",
                    trace_code: methodPay === 1 ? random : traceCode,
                    order_date: dayjs(order.date).format("dddd DD-MM-YYYY")
                }
                emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
                dispatch(setOpenPaymentModal(false))
                dispatch(setOpenNotificationDetail(false))
                dispatch(setOpenBackdropModal(false))
                toast.success("Đặt sân thành công", { autoClose: 3000, theme: "colored" })
                handleClose()
            }, 3000)
        }
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


    function ColorlibStepIcon(props: StepIconProps) {
        const { active, completed, className } = props;

        const icons: { [index: string]: React.ReactElement } = {
            1: <TbBrandBooking />,
            2: <MdPayments />,
            3: <ImLoop2 />,
            4: order.status === "rejected" ? <AiOutlineClose /> : <MdOutlineDoneOutline />,
        };

        return (
            <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
                {icons[String(props.icon)]}
            </ColorlibStepIconRoot>
        );
    }

    const steps = ['Đặt trước', 'Thanh toán', "Chờ xác nhận", order.status === 4 ? "Từ chối đặt sân" : 'Xác nhận đặt sân thành công'];


    return (
        <>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                message="Coppy success"
                action={actionSnackbar}
            />
            <Dialog scroll={"paper"} open={isOpenPaymentModal} onClose={handleClose} maxWidth="md">
                {isLoading ?
                    <DialogTitle className="flex justify-center" >
                        <Skeleton className="w-full" variant="rounded" height={100} />
                    </DialogTitle>
                    :
                    <DialogTitle fontWeight={700}>
                        <Stack sx={{ width: '100%' }} spacing={4}>
                            <Stepper alternativeLabel activeStep={1} connector={<ColorlibConnector />}>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </Stack>

                    </DialogTitle>
                }
                <Divider />
                <DialogContent dividers className="grid grid-cols-12  space-x-2 h-[50rem]  w-[50rem]">
                    <div className="col-span-7 space-y-3 ">
                        {isLoading ?
                            <Skeleton variant="text" width={250} height={25} />
                            :
                            <div className="flex space-x-2">
                                <Typography variant="body1" component="h1">
                                    Tên sân :
                                </Typography>
                                <Typography fontWeight={700} variant="body1" component="h1">
                                    {pitch?.name}
                                </Typography>
                            </div>
                        }
                        {isLoading ?
                            <Skeleton variant="text" width={300} height={25} />
                            :
                            <div className="flex space-x-2" >
                                <ImLocation size={20} className="text-gray-400" />
                                <Typography fontWeight={700} fontSize={14} variant="body1" component="h1">
                                    {`${pitch.location}`}
                                </Typography>
                            </div>
                        }


                        {isLoading ?
                            <Skeleton variant="text" className="!p-0" width={380} height={25} />
                            :
                            <div className="flex space-x-6 pr-3">
                                <div className="flex space-x-1 items-center">
                                    <TimelapseIcon className="rotate-[-15deg] text-primary" />
                                    <Typography className="whitespace-nowrap" fontWeight={700} variant="body1" component="h1">
                                        {`${order.duration} míns`}
                                    </Typography>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <TbSoccerField size={25} className="text-primary" />
                                    <Typography className="whitespace-nowrap" fontWeight={700} variant="body1" component="h1">
                                        {`${order.size} V ${order.size}`}
                                    </Typography>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <BiTime size={25} className="text-primary" />
                                    <Typography className="whitespace-nowrap" fontWeight={700} variant="body1" component="h1">
                                        {`Slot ${order.slot} (${order.time})`}
                                    </Typography>
                                </div>
                            </div>
                        }

                        {isLoading ?
                            <Skeleton variant="text" width={150} height={25} />
                            :
                            <div className="flex space-x-2">
                                <Typography variant="body1" component="h1">
                                    Tổng tiền :
                                </Typography>
                                <Typography fontWeight={700} variant="body1" component="h1">
                                    <Currency quantity={order.total} currency="VND" pattern="##,### !" />
                                </Typography>
                            </div>
                        }

                        {isLoading ?
                            <Skeleton variant="text" width={320} height={25} />
                            :
                            <div className="flex space-x-5">
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        Người đặt :
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {`${user.firstName} ${user.lastName}`}
                                    </Typography>
                                </div>
                                {user.phone &&
                                    <div className="flex space-x-2">
                                        <BsFillTelephoneFill size={20} className="text-primary" />
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            {`+84${user.phone}`}
                                        </Typography>
                                    </div>
                                }
                            </div>
                        }

                        {isLoading ?
                            <Skeleton variant="text" width={320} height={25} />
                            :
                            <div className="flex space-x-5">
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        Chủ sân :
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {`${owner.firstName} ${owner.lastName}`}
                                    </Typography>
                                </div>
                                {owner.phone &&
                                    <div className="flex space-x-2">
                                        <BsFillTelephoneFill size={20} className="text-primary" />
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            {`+84${owner.phone}`}
                                        </Typography>
                                    </div>
                                }
                            </div>
                        }

                        {isLoading ?
                            <Skeleton variant="text" width={200} height={25} />
                            :
                            <div className="flex space-x-5">
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        Ngày đặt sân :
                                    </Typography>
                                    <div className="flex space-x-2 items-center ">
                                        <BsCalendarDate size={20} className="text-primary" />
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            {dayjs(order.date).format("dddd DD-MM-YYYY")}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        }

                        {isLoading ?
                            <Skeleton variant="text" className="w-full" height={60} />
                            :
                            <select
                                value={methodPay}
                                defaultValue={methodPay || 0}
                                onChange={e => setState({ ...state, methodPay: +e.target.value })}
                                className="mt-6 outline-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option selected value={0}>Chọn phương thức thanh toán</option>
                                <option value={1}>Chuyển khoản</option>
                                <option value={2}>Ví Sport Pay</option>
                            </select>
                        }



                        {methodPay === 2 &&
                            <div className="flex items-center space-x-3">
                                <SiBitcoincash size={24} className="rotate-[20deg] text-[#ef8e19]" />
                                <Typography fontWeight={700} variant="body1" component="h1">
                                    <Currency quantity={user.balance} currency="VND" pattern="##,### !" />
                                </Typography>
                            </div>
                        }
                        {methodPay === 1 &&
                            <select
                                value={bankCode}
                                defaultValue={bankCode || 0}
                                onChange={e => setState({ ...state, bankCode: e.target.value })}
                                className="outline-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option selected value={0} >Chọn ngân hàng</option>
                                {owner.banks?.map((b: Bank) => (
                                    <option key={b.id} value={b.bankCode}>{`${b.bankCode} / ${b.bankName}`}</option>
                                ))}
                            </select>
                        }
                        {bank && methodPay === 1 &&
                            <>
                                <div className="flex items-center space-x-2">
                                    <div className="flex space-x-2">
                                        <Typography variant="body1" component="h1">
                                            {`Tên tài khoản : `}
                                        </Typography>
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            {bank?.name}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="flex space-x-2">
                                        <Typography variant="body1" component="h1">
                                            {`Số tài khoản : `}
                                        </Typography>
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            {bank?.accountNumber}
                                        </Typography>
                                    </div>
                                    <AiFillCopy onClick={() => handleCoppyToClipboard(bank?.accountNumber)}
                                        className="cursor-pointer text-yellow-400" size={18} />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="flex space-x-2 items-center">
                                        <Typography variant="body1" component="h1">
                                            {`Nội dung CK : `}
                                        </Typography>
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            {transferContent
                                            }
                                        </Typography>
                                    </div>
                                    <AiFillCopy onClick={() => handleCoppyToClipboard(transferContent
                                    )}
                                        className="cursor-pointer text-yellow-400" size={18} />
                                </div>
                                <div className="flex space-x-2 items-center">
                                    <RiErrorWarningLine
                                        size={20}
                                        className="text-yellow-600" />
                                    <Typography variant="subtitle2" component="h1">
                                        {`Vui lòng nhập đúng nội dung chuyển khoản`}
                                    </Typography>
                                </div>
                            </>
                        }
                    </div>
                    <div className="col-span-5">
                        <div className="h-[30rem]">
                            {isLoading ?
                                <Skeleton variant="rectangular" className="w-full h-full" />

                                :
                                pitch.id && <Map pitchId={pitch.id} />
                            }
                        </div>
                    </div>
                </DialogContent>
                <DialogActions className="flex w-full items-center  bg-gray-100">
                    <div className="flex space-x-2">
                        {isLoading
                            ?
                            <Skeleton variant="rounded" width={80} height={35} />
                            :
                            <Button
                                variant="outlined"
                                onClick={handleClose}
                                className="bg-white !border-primary !text-primary">Thoát</Button>
                        }
                        {isLoading ?
                            <Skeleton variant="rounded" width={90} height={35} />
                            :
                            <Button
                                variant="contained"
                                onClick={handleSubmitPayment}
                                className="!bg-primary !text-white">Thanh toán</Button>
                        }
                    </div>
                </DialogActions>
            </Dialog >
        </>
    )
}

export default PaymentModal


