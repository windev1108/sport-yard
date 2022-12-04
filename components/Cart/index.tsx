import { IconButton, Tooltip, Typography } from '@mui/material'
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import React, { useState, useEffect } from 'react'
import Currency from 'react-currency-formatter'
import { ImCart } from 'react-icons/im';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Image from 'next/image';
import { Cart, Product } from '../../Models';
import axios from 'axios';
import { AiFillMinusCircle, AiFillPlusCircle, AiOutlineClear, AiOutlineClose } from 'react-icons/ai';
import { TiShoppingCart } from 'react-icons/ti'
import Divider from '@mui/material/Divider';
import { toast } from 'react-toastify';
import { setOpenCartDetail, setOpenSnackBar } from '../../redux/features/isSlice';
import { setContentSnackBar } from '../../redux/features/userSlice';
import CartDetail from './CartDetail'
import { MdClose } from 'react-icons/md';



interface State {
    cart: Cart[]
    products: Product[]
}


interface CartInUser {
    amount: number
    id: string
}

const CartComponent = () => {
    const dispatch = useDispatch()
    const { user }: any = useSelector<RootState>(state => state.user)
    const { isOpenCartDetail }: any = useSelector<RootState>(state => state.is)
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [state, setState] = useState<State>({
        cart: [],
        products: [],
    })
    const { cart } = state


    useEffect(() => {
        axios.get(`/api/products`)
            .then(res => {
                let results: Cart[] = []
                user?.cart?.forEach((c: CartInUser) => {
                    results.push({ amount: c.amount, product: res.data.products.find((p: Product) => p.id === c.id) })
                })
                setState({ ...state, cart: results })
            })

    }, [user?.cart])

    const handleOpenYourCart = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleOpenCartDetail = () => {
        dispatch(setOpenCartDetail(true))
        handleCloseCart()
    }

    const handleClearCart = () => {
        axios.put(`/api/users/${user.id}`, {
            cart: []
        })
        dispatch(setOpenSnackBar(true))
        dispatch(setContentSnackBar("Clear cart success!"))
    }


    const handleCloseCart = () => {
        setAnchorEl(null);
    };



    const handleReduceProduct = (index: number) => {
        let newArr: { amount: number, id: string }[] = []
        if (cart[index].amount <= 1) {
            cart.splice(index, 1)
            console.log("delete");
        } else {
            cart[index].amount = cart[index].amount - 1
            console.log("reduce");
        }
        cart.forEach((c: Cart) => {
            newArr.push({
                amount: c.amount,
                id: c.product.id
            })
        })
        axios.put(`/api/users/${user.id}`, {
            cart: newArr
        })
    }

    const handlePlusProduct = (index: number) => {
        let newArr: { amount: number, id: string }[] = []
        if (cart[index].amount >= 100) {
            toast.info("Can't order more than 100 product", { autoClose: 3000, theme: "colored" })
        } else {
            cart[index].amount = cart[index].amount + 1
        }
        cart.forEach((c: Cart) => {
            newArr.push({
                amount: c.amount,
                id: c.product.id
            })
        })
        axios.put(`/api/users/${user.id}`, {
            cart: newArr
        })
    }

    return (
        <>
            {isOpenCartDetail && <CartDetail cart={cart} />}
            <Tooltip title="Your cart">
                <IconButton
                    onClick={handleOpenYourCart}
                    size="large" aria-label="show 4 new mails" color="inherit">
                    <Badge badgeContent={user?.cart?.length ? user?.cart?.length : 0} color="error">
                        <ImCart size={22} />
                    </Badge>
                </IconButton>
            </Tooltip>
            {user?.cart?.length > 0 ?
                <Menu
                    className="mt-10 mr-6 "
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseCart}
                >
                    <div className="lg:relative fixed top-0 left-0 right-0 bottom-0 !bg-white max-h-full lg:!max-h-[25rem] !overflow-hidden">
                        <div className="absolute top-0 left-0 right-1 h-10 z-10 bg-white shadow-md w-full flex items-center justify-around lg:justify-between pl-4 lg:pr-4 pr-12">
                            <div className="cursor-pointer flex items-center">
                                <Typography fontWeight={700} variant="body1" component="h1">
                                    View cart
                                </Typography>
                                <IconButton
                                    onClick={handleOpenCartDetail}
                                >
                                    <TiShoppingCart className="text-primary" />
                                </IconButton>
                            </div>
                            <div className="flex items-center">
                                <Typography fontWeight={700} variant="body1" component="h1">
                                    Clear
                                </Typography>
                                <IconButton
                                    className="p-1"
                                    onClick={handleClearCart}
                                >
                                    <AiOutlineClear className="text-primary" />
                                </IconButton>
                            </div>
                            <IconButton
                                className="lg:!hidden block "
                                onClick={handleCloseCart}
                            >
                                <MdClose />
                            </IconButton>
                        </div>
                        <div className="lg:w-[30rem] w-full lg:max-h-[25rem] !overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pt-10">
                            {cart?.map((c: Cart, index: number) => (
                                <div key={index}>
                                    {index >= 1 && <Divider />}
                                    <div className="relative lg:w-full  flex space-y-2 space-x-3 items-center overflow-hidden">
                                        <div className="w-[20%]">
                                            <img className="w-full object-fith-28" src={c.product?.mainPictures[0]} alt={c.product?.name} />
                                        </div>
                                        <div className="w-[60%]">
                                            <span className="font-semibold lg:text-base text-sm">
                                                {c.product?.name}
                                            </span>
                                        </div>
                                        <div className="w-[20%] space-y-2">
                                            <h1 className="lg:text-base text-[13px] text-center whitespace-nowrap">
                                                <Currency quantity={Math.floor(c.product?.price * c.amount - c.product?.price / 100 * c.product?.discount * c.amount)} currency="VND" pattern="##,### !" />
                                            </h1>
                                            <div className="flex justify-between px-1 py-1 items-center border-[1px] border-gray-300 rounded-full ">
                                                <IconButton
                                                    className="!p-0"
                                                    onClick={() => handleReduceProduct(index)}
                                                >
                                                    <AiFillMinusCircle className="lg:text-[30px] text-[24px] text-primary" />
                                                </IconButton>
                                                <Typography className="lg:text-base text-xs text-center" variant="body1" component="h1">
                                                    {c.amount}
                                                </Typography>
                                                <IconButton
                                                    className="!p-0"
                                                    onClick={() => handlePlusProduct(index)}
                                                >
                                                    <AiFillPlusCircle className="lg:text-[30px] text-[24px] text-primary" />
                                                </IconButton>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Menu>
                :
                <Menu
                    className="mt-10 mr-6"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseCart}
                >
                    <div className=" w-[20rem] !overflow-hidden">
                        <div className="flex justify-center items-center">
                            <Image src={require("../../assets/images/cart.png")} />
                        </div>
                        <Typography className="text-center" fontWeight={700} variant="body1" component="h1">
                            No product
                        </Typography>
                    </div>
                </Menu>
            }
        </>
    )
}

export default CartComponent