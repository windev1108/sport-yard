import React, { useState, useEffect, useRef, useMemo } from 'react'
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { NextPage } from 'next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Avatar, Divider, IconButton, Select, Skeleton, Typography, Tooltip } from '@mui/material';
import { deepOrange } from '@mui/material/colors';
import Currency from 'react-currency-formatter';
import { setOpenBackdropModal, setOpenFormEditUser, setOpenOrderProduct, setOpenProfileModal, setOpenSnackBar } from '../../redux/features/isSlice'
import { Bank, Cart, Pitch, User } from '../../Models';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { ImLocation, ImLoop2 } from 'react-icons/im';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { MdPayment, MdPayments } from 'react-icons/md';
import { FaUserTie } from 'react-icons/fa';
import { setContentSnackBar, setIdEditing, setIdProfile } from '../../redux/features/userSlice';
import { GiSoccerBall } from 'react-icons/gi';
import { AiFillCopy, AiOutlineClose } from 'react-icons/ai';
import { GrFormAdd } from 'react-icons/gr';
import { SiBitcoincash } from 'react-icons/si';
const Map = dynamic(() => import("../Map"), { ssr: false })
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';


interface State {
    users: User[]
    methodPay: number
    isLoading: boolean
    bankCode: string
    bank: any,
    random: number
    transferContent: string
}



interface Order {
    owner: string
    cart: Cart[]
}

const OrderProductModal: NextPage = () => {
    const dispatch = useDispatch()
    const { isOpenOrderProduct }: any = useSelector<RootState>(state => state.is)
    const { order, totalPrice }: any = useSelector<RootState>(state => state.orders)
    const { user }: any = useSelector<RootState>(state => state.user)
    const [state, setState] = useState<State>({
        users: [],
        methodPay: 0,
        bankCode: "",
        bank: {},
        random: 0,
        transferContent: "",
        isLoading: true,
    })
    const { isLoading, users, methodPay, bank, transferContent, bankCode, random } = state
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));


    useEffect(() => {
        axios.get("/api/users")
            .then(res => setState({ ...state, users: res.data.users, isLoading: false }))
    }, [])



    useMemo(() => {
        const bankFound = user.banks?.find((bank: Bank) => bank.bankCode === bankCode)
        const randomId = Math.floor(Math.random() * 900000 + 10000)
        setState({
            ...state, bank: bankFound, transferContent: `ORDER_SPORTYARD_${randomId}`, random: randomId
        })
    }, [bankCode])


    const handleCopyToClipboard = (value: string) => {
        navigator.clipboard.writeText(value)
        dispatch(setContentSnackBar("Coppy success"))
        dispatch(setOpenSnackBar(true))
    }

    const getUser = (id: string) => {
        const foundUser: any = users.find((u: User) => u.id === id)
        return foundUser
    }

    const handleClose = () => {
        dispatch(setOpenOrderProduct(false))
    }

    const handleShowProfile = (id: string) => {
        dispatch(setOpenProfileModal(true))
        dispatch(setIdProfile(id))
    }


    const handleShowFormEditUer = () => {
        dispatch(setIdEditing(user.id))
        dispatch(setOpenFormEditUser(true))
    }


    const handleSubmitOrder = () => {
        if (!methodPay) {
            toast.info("Vui lòng chọn phương thức thanh toán", { autoClose: 3000, theme: "colored" })
        } else if (methodPay === 1 && !bank?.id) {
            toast.info("Vui lòng chọn ngân hàng", { autoClose: 3000, theme: "colored" })
        } else if (!user.address) {
            toast.info("Vui lòng thêm địa chỉ nhận hàng", { autoClose: 3000, theme: "colored" })
        } else if (methodPay === 2 && user.balance < totalPrice + totalPrice / 100 * 5 + 38000) {
            toast.info("Số dư của bạn không đủ", { autoClose: 3000, theme: "colored" })
        } else {
            dispatch(setOpenBackdropModal(true))

            order.forEach((o: Order) => {
                let sum = 0
                o.cart.forEach((c: Cart) => {
                    const total = c.product.price - c.product.price / 100 * c.product.discount
                    const amount = c.amount
                    const sumLoop = amount * total
                    sum += sumLoop
                })

                const formData = {
                    type: "order",
                    senderId: user.id,
                    receiverId: o.owner,
                    ownerId: o.owner,
                    orderId: user.id,
                    address: user.address,
                    methodPay,
                    bank,
                    transferContent,
                    bookingId: methodPay === 1 ? random : Math.floor(Math.random() * 900000 + 10000),
                    products: o.cart,
                    total: sum,
                    ownerName: `${getUser(o.owner).firstName} ${getUser(o.owner).lastName} `,
                    ordererName: `${user.firstName} ${user.lastName}`,
                    status: 2,
                }
                axios.post('/api/orders', formData)
            })
            setTimeout(async () => {
                const totalPay = totalPrice + order.length * +process.env.NEXT_PUBLIC_TRANSPORT_FEE!
                methodPay === 2 && axios.put(`/api/users/${user.id}`, {
                    balance: user.balance - totalPay
                })
                dispatch(setOpenBackdropModal(false))
                dispatch(setOpenOrderProduct(false))
                toast.success("Đơn hàng đã tạo thành công", { autoClose: 3000, theme: "colored" })
            }, 3000)
        }
    }

    return (
        <>
            <Dialog
                fullScreen={fullScreen}
                scroll={fullScreen ? "body" : "paper"} open={isOpenOrderProduct} onClose={handleClose} maxWidth="xl">
                {isLoading ?
                    <DialogTitle className="flex justify-center" >
                        <Skeleton className="" variant="rounded" width={90} height={30} />
                    </DialogTitle>
                    :
                    <DialogTitle fontWeight={700}>
                        <div className="flex items-center justify-between">
                            {isLoading ?
                                <Skeleton variant="rectangular" width={120} height={30} />
                                :
                                <div className="flex items-center space-x-2">
                                    <MdPayments className="text-primary" size={25} />
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        Thanh toán
                                    </Typography>
                                </div>
                            }
                            {isLoading ?
                                <Skeleton variant="circular" width={35} height={35} />
                                :
                                <IconButton
                                    onClick={handleClose}
                                >
                                    <AiOutlineClose size={20} />
                                </IconButton>
                            }
                        </div>
                    </DialogTitle>
                }
                <Divider />
                <DialogContent dividers className="space-x-2 space-y-8  lg:w-[80vw] !p-2 h-[60rem] overflow-x-hidden">

                    {order.map((o: Order, index: number) => (
                        <div key={index} className="shadow-lg overflow-hidden space-y-4 w-full items-center">
                            {isLoading ?
                                <div className="flex px-6  py-2 items-center space-x-2">
                                    <Skeleton variant="circular" width={45} height={45} />
                                    <Skeleton variant="rectangular" width={100} height={30} />
                                </div>
                                :
                                <Tooltip
                                    onClick={() => handleShowProfile(o.owner)}
                                    className="flex justify-center w-40 cursor-pointer" title={"Owner"}>
                                    <div className="flex items-center">
                                        <IconButton
                                        >
                                            <Avatar src={getUser(o.owner)?.avatar} sx={{ bgcolor: deepOrange[500] }}>{getUser(o.owner)?.firstName.substring(0, 1).toUpperCase()}</Avatar>
                                        </IconButton>
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            {`${getUser(o.owner)?.firstName} ${getUser(o.owner)?.lastName}`}
                                        </Typography>
                                    </div>
                                </Tooltip>
                            }
                            <div className="flex overflow-x-auto relative">
                                {isLoading
                                    ?
                                    <Skeleton variant="rectangular" className="w-full" height={220} />
                                    :
                                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs  text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr className="!w-full">
                                                <th scope="col" className="lg:py-3 p-2 lg:px-6 lg:text-xs text-[10px]">
                                                    Hình ảnh
                                                </th>
                                                <th scope="col" className="py-3 p-2 lg:py-3 lg:px-6 lg:text-xs text-[10px]">
                                                    Tên
                                                </th>
                                                <th scope="col" className="py-3 p-2 lg:py-3 lg:px-6 lg:text-xs text-[10px] text-center">
                                                    Size
                                                </th>
                                                <th scope="col" className="py-3 p-2 lg:py-3 lg:px-6 lg:text-xs text-[10px]">
                                                    Số lượng
                                                </th>
                                                <th scope="col" className="py-3 p-2 lg:py-3 lg:px-6 lg:text-xs text-[10px] text-center">
                                                    Giá
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {o.cart?.map((c: Cart, index: number) => (
                                                <tr key={index} className="w-full bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                    <td className="w-[30%] lg:py-4 p-0 lg:px-6">
                                                        <img className="lg:object-cover object-contain h-32  lg:h-40  " src={c.product.mainPictures[0]} alt="" />
                                                    </td>
                                                    <td className="w-[40%] lg:py-4 p-2 lg:px-6">
                                                        {c.product.name}
                                                    </td>
                                                    <td className="w-[10%] lg:py-4 p-2 lg:px-6 text-center">
                                                        {c.size}
                                                    </td>
                                                    <td className="w-[10%] lg:py-4 p-2 lg:px-12 text-center">
                                                        {c.amount}
                                                    </td>
                                                    <td className="w-[10%] py-4">
                                                        <Typography className="lg:!text-base !text-[12px] whitespace-nowrap !text-center" variant="body1" component="h1">
                                                            <Currency quantity={Math.floor(c.product?.price * c.amount - c.product?.price / 100 * c.product?.discount * c.amount)} currency="VND" pattern="##,### !" />
                                                        </Typography>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                }
                            </div>
                        </div>
                    ))}

                    {isLoading
                        ?
                        <Skeleton variant="rounded" className="shadow-md px-4  w-full" height={80} />
                        :
                        <div className="shadow-md p-4 space-y-2 ">
                            <div className="flex space-x-2 items-center">
                                <ImLocation color="#888" size={22} />
                                <Typography fontWeight={700} variant="body1" component="h1">
                                    Địa chỉ nhận hàng
                                </Typography>
                            </div>

                            {user.address ?
                                <Typography fontSize={14} variant="body1" component="h1">
                                    {user.address}
                                </Typography>
                                :
                                <div className="flex items-center">
                                    <Typography variant="body1" component="h1">
                                        Chưa có địa chỉ nhận hàng
                                    </Typography>
                                    <Tooltip title="Thêm địa chỉ nhận hàng">
                                        <IconButton
                                            onClick={handleShowFormEditUer}
                                        >
                                            <GrFormAdd className="text-primary" size={24} />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            }
                        </div>
                    }

                    <div className="shadow-md lg:p-4  p-2 pl-l pr-2  space-y-6">
                        {isLoading ?
                            <Skeleton variant="rectangular" width={220} height={30} />
                            :
                            <div className="flex space-x-2">
                                <MdPayment color="#888" size={22} />
                                <Typography fontWeight={700} variant="body1" component="h1">
                                    Phương thức thanh toán
                                </Typography>
                            </div>
                        }
                        {isLoading ?
                            <Skeleton variant="rounded" className="w-[50%]" height={40} />
                            :
                            <div className="w-full space-y-2">
                                <select
                                    value={methodPay}
                                    defaultValue={0}
                                    onChange={e => setState({ ...state, methodPay: +e.target.value })}
                                    className="lg:w-[50%] w-full mt-6 outline-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    <option selected value={0}>Chọn phương thức thanh toán</option>
                                    <option value={1}>Chuyển khoản</option>
                                    <option value={2}>Ví Sport Pay</option>
                                    <option value={3}>Thanh toán khi nhận hàng</option>
                                </select>
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
                                        defaultValue={0}
                                        onChange={e => setState({ ...state, bankCode: e.target.value })}
                                        className="w-[50%]  outline-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                        <option selected value={0}>Chọn ngân hàng</option>
                                        {user.banks?.map((b: Bank) => (
                                            <option key={b.id} value={b.bankCode}>{`${b.bankCode} / ${b.bankName}`}</option>
                                        ))}
                                    </select>
                                }
                                {bank && methodPay === 1 &&
                                    <>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex space-x-2">
                                                <Typography variant="body1" component="h1">
                                                    {`Chủ tài khoản : `}
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
                                            <AiFillCopy onClick={() => handleCopyToClipboard(bank?.accountNumber)}
                                                className="cursor-pointer text-yellow-400" size={18} />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex space-x-2">
                                                <Typography variant="body1" component="h1">
                                                    {`Nội dung chuyển khoản : `}
                                                </Typography>
                                                <Typography fontWeight={700} variant="body1" component="h1">
                                                    {transferContent}
                                                </Typography>
                                            </div>
                                            <AiFillCopy onClick={() => handleCopyToClipboard(transferContent
                                            )}
                                                className="cursor-pointer text-yellow-400" size={18} />
                                        </div>
                                    </>
                                }
                            </div>
                        }
                        <Divider />
                        <div className="justify-end w-full">
                            <div className="space-y-3 w-full">
                                {isLoading ?
                                    <Skeleton variant="rounded" width={200} height={25} />
                                    :
                                    <div className="flex space-x-2">
                                        <Typography fontSize={14} variant="body1" component="h1">
                                            Tổng tiền hàng :
                                        </Typography>
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            <Currency quantity={totalPrice} currency="VND" pattern="##,### !" />
                                        </Typography>
                                    </div>
                                }
                                {isLoading ?
                                    <Skeleton variant="rounded" width={180} height={25} />
                                    :
                                    <div className="flex space-x-2">
                                        <Typography fontSize={14} variant="body1" component="h1">
                                            Phí vận chuyển :
                                        </Typography>
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            <Currency quantity={order.length * +process.env.NEXT_PUBLIC_TRANSPORT_FEE!} currency="VND" pattern="##,### !" />
                                        </Typography>
                                    </div>
                                }

                                {isLoading ?
                                    <Skeleton variant="rounded" width={200} height={25} />
                                    :
                                    <div className="flex space-x-2">
                                        <Typography fontSize={14} variant="body1" component="h1">
                                            Tổng thanh toán :
                                        </Typography>
                                        <Typography fontWeight={700} variant="body1" component="h1">
                                            <Currency quantity={totalPrice + order.length * +process.env.NEXT_PUBLIC_TRANSPORT_FEE!} currency="VND" pattern="##,### !" />
                                        </Typography>
                                    </div>
                                }

                                {isLoading ?
                                    <div className="flex justify-center">
                                        <Skeleton variant="rounded" className="w-[50%]" height={40} />
                                    </div>
                                    :
                                    <div className="flex justify-center">
                                        <Button
                                            onClick={handleSubmitOrder}
                                            className="lg:w-[50%] w-full !bg-primary" variant='contained'>
                                            Đặt hàng
                                        </Button>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default OrderProductModal

