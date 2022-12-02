import React, { useState, useEffect, useMemo } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { NextPage } from 'next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import {  Divider, Skeleton, Typography } from '@mui/material';
import axios from 'axios';
import { Cart } from '../../Models';
import Currency from 'react-currency-formatter';
import { setOpenCartDetail, setOpenOrderProduct } from '../../redux/features/isSlice';
import {  setOrder, setTotalPrice } from '../../redux/features/ordersSlice'
import { AiFillMinusCircle, AiFillPlusCircle, AiOutlineClose } from 'react-icons/ai';
import IconButton from '@mui/material/IconButton/IconButton';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { BsCart4 } from 'react-icons/bs';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';



interface State {
    isLoading: boolean
    total: number
    checked: number[]
    cartOrder: Cart[]
    initCart: Cart[]
}

interface Props {
    cart: Cart[]
}


export interface OrderCart {
    owner: string
    cart: Cart[]
}

const CartDetail: NextPage<Props> = ({ cart }) => {
    const dispatch = useDispatch()
    const { isOpenCartDetail }: any = useSelector<RootState>(state => state.is)
    const { user }: any = useSelector<RootState>(state => state.user)
    const [state, setState] = useState<State>({
        isLoading: true,
        total: 0,
        checked: [],
        cartOrder: [],
        initCart: []
    })
    const { isLoading, total, checked, cartOrder, initCart } = state
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));


    useEffect(() => {
        const initCart = cart?.map((c: Cart, index: number) => {
            return {
                amount: c.amount,
                product: c.product,
                size: c.product?.size[0]
            }
        })
        setState({ ...state, initCart: initCart })

    }, [])


    useMemo(() => {
        let sum: number = 0
        let cartChecked: Cart[] = []
        checked.forEach((i: number) => {
            cartChecked.push(initCart[i])
            const discounted = initCart[i]?.product.price - initCart[i]?.product.price / 100 * initCart[i]?.product.discount
            sum += initCart[i]?.amount * discounted
        })
        setState({
            ...state, total: sum, cartOrder: cartChecked, isLoading: false
        })
    }, [user.cart, checked])


    const handleChecked = (index: number) => {
        const checkIsExist = checked.some((check: number) => check === index)
        if (checkIsExist) {
            setState({ ...state, checked: checked.filter((check: number) => check !== index).sort((a: number, b: number) => a - b) })
        } else {
            setState({ ...state, checked: [...checked, index].sort((a: number, b: number) => a - b) })
        }
    }

    const handleReduceProduct = (index: number) => {
        let newArr: { amount: number, id: string, size: number | string }[] = []
        if (initCart[index].amount <= 1) {
            initCart.splice(index, 1)
        } else {
            initCart[index].amount = initCart[index].amount - 1
        }
        initCart.forEach((c: Cart) => {
            newArr.push({
                amount: c.amount,
                id: c.product.id,
                size: c.size!
            })
        })
        axios.put(`/api/users/${user.id}`, {
            cart: newArr
        })
    }

    const handlePlusProduct = (index: number) => {
        let newArr: { amount: number, id: string, size: number | string }[] = []
        if (initCart[index].amount >= 100) {
            toast.info("Can't order more than 100 product", { autoClose: 3000, theme: "colored" })
        } else {
            initCart[index].amount = initCart[index].amount + 1
        }
        initCart.forEach((c: Cart) => {
            newArr.push({
                amount: c.amount,
                id: c.product?.id,
                size: c?.size!
            })
        })
        axios.put(`/api/users/${user.id}`, {
            cart: newArr
        })
    }

    const handleClose = () => {
        setState({ ...state, checked: [] })
        dispatch(setOpenCartDetail(false))
    }


    const handleOpenOrderProduct = () => {
        let ownerProduct: any[] = []
        let presentCart: any[] = []
        let cartIsNotPresent
        const objectFilterByCart = cartOrder.filter((c: Cart) => {
            cartIsNotPresent = presentCart.indexOf(c.product.owner)
            presentCart.push(c.product.owner)
            return cartIsNotPresent
        })
        objectFilterByCart.forEach((o: Cart) => {
            ownerProduct.push({ owner: o.product?.owner! })
        })


        ownerProduct.forEach((o: OrderCart, index: number) => {
            const orderSameOwner = cartOrder.filter((c: Cart) => o.owner === c.product.owner)
            ownerProduct[index] = { owner: o.owner, cart: orderSameOwner }
        })

        if (cartOrder.length) {
            dispatch(setTotalPrice(total))
            dispatch(setOpenOrderProduct(true))
            dispatch(setOrder(ownerProduct))
            dispatch(setOpenCartDetail(false))
        } else {
            toast.info("Please choose a product to order", { autoClose: 3000, theme: "colored" })
        }
    }

    const handleChangeSize = (e: any, index: number) => {
        if (e && index) {
            initCart[index].size = e.target.value
        }
    }



    return (
        <>
            <Dialog
                fullScreen={fullScreen}
                open={isOpenCartDetail} onClose={handleClose} maxWidth="xl" >
                {isLoading ?
                    <Skeleton variant="text" className="py-[32px] mx-[24px]" width={180} height={50} />
                    :
                    <DialogTitle>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <BsCart4 className="text-primary" size={30} />
                                <h1 className="text-xl font-semibold ">
                                    Giỏ hàng
                                </h1>
                            </div>
                            <IconButton
                                onClick={handleClose}
                            >
                                <AiOutlineClose size={20} />
                            </IconButton>
                        </div>
                    </DialogTitle>
                }
                <Divider />
                <DialogContent className="!p-2 h-[50rem] lg:w-[80rem] ">
                    {initCart.length ?
                        initCart?.map((c: Cart, index: number) => (
                            <>
                                {index >= 1 && <Divider />}
                                <div key={index} className="relative flex space-y-2 space-x-10 items-center overflow-hidden">

                                    <div className="w-[4%]">
                                        <div className="flex justify-center items-center">
                                            <input type="checkbox"
                                                className="w-5 h-5 "
                                                value={index}
                                                onChange={() => handleChecked(index)}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-[25%] !mx-2 !my-0">
                                        <img className="lg:w-40 w-24  !h-full object-fill" src={c.product?.mainPictures[0]} alt={c.product?.name} />
                                    </div>
                                    <div className="lg:w-[50%] w-[35%] !m-2">
                                        <span className="break-words lg:text-base text-xs font-semibold">
                                            {c.product?.name}
                                        </span>
                                    </div>
                                    <div className="lg:w-[10%] w-[15%] lg:!mr-16 !m-0">
                                        <select
                                            onChange={(e) => handleChangeSize(e, index)} id="countries" className="lg:text-xs text-[10px] h-10 w-14 lg:w-full outline-none bg-gray-50 border border-gray-300 mt-8 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block  h-ơ p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                            <option selected value={c.size}>{c.size}</option>
                                            {c.product?.size?.map((s: number | string) => (
                                                <option key={s} value={s} >{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="lg:w-[10%] w-[20%] !m-2  space-y-2 ">
                                        <div className="flex justify-center">
                                            <span className="lg:text-base text-sm text-center">
                                                <Currency quantity={Math.floor(c.product?.price * c.amount - c.product?.price / 100 * c.product?.discount * c.amount)} currency="VND" pattern="##,### !" />
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-[1px] border-gray-300 rounded-full ">
                                            <IconButton
                                                className="!p-0"
                                                onClick={() => handleReduceProduct(index)}
                                            >
                                                <AiFillMinusCircle className="lg:text-[30px] text-[20px] text-primary" />
                                            </IconButton>
                                            <span
                                                className="lg:text-base text-xs outline-none text-center">
                                                {c.amount}
                                            </span>
                                            <IconButton
                                                className="!p-0"
                                                onClick={() => handlePlusProduct(index)}
                                            >
                                                <AiFillPlusCircle className="lg:text-[30px] text-[20px] text-primary" />
                                            </IconButton>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ))
                        :
                        <div className="h-[15rem] !w-[50rem] flex justify-center items-center">
                            <div>
                                <div className="flex justify-center items-center">
                                    <Image src={require('../../assets/images/cart.png')} width="200" height="200" objectFit="cover" layout='intrinsic' />
                                </div>
                                <Typography className="text-center" fontWeight={700} variant="body1" component="h1">
                                    No product
                                </Typography>
                            </div>
                        </div>
                    }
                </DialogContent>

                <DialogActions className="bg-gray-100 w-full">
                    <div className="flex justify-between w-full px-2 items-center">
                        <span className="lg:text-lg text-sm font-semibold">
                            {"Thành tiền : "}
                            <Currency quantity={+total || 0} currency="VND" pattern="##,### !" />
                        </span>
                        <Button
                            onClick={() => dispatch(setOpenCartDetail(false))}
                            variant='outlined'>Cancel</Button>
                        <Button
                            onClick={handleOpenOrderProduct}
                            className="!bg-primary !text-white">Order</Button>
                    </div>
                </DialogActions>
            </Dialog >
        </>
    )
}

export default CartDetail



