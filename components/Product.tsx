import {
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Typography,
} from "@mui/material";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { Product, Reviews, User } from "../Models";
import LinesEllipsis from "react-lines-ellipsis";
import Currency from 'react-currency-formatter';
import Link from "next/link";
import { formatReviews } from "../utils/helper";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setIsLoading, setOpenSnackBar } from "../redux/features/isSlice";
import { Rating, IconButton } from '@mui/material';
import { RootState } from "../redux/store";
import { toast } from "react-toastify";
import { setContentSnackBar } from "../redux/features/userSlice";
import { getCookie } from "cookies-next";

export interface Props {
    id: string;
    name: string;
    description: string;
    discount: number;
    price: number;
    amount: number,
    size: string[]
    pictures: string[];
    mainPictures: string[];
}

interface State {
    reviews: Reviews[];
}


const Product: NextPage<Props> = ({
    id,
    name,
    description,
    discount,
    price,
    amount,
    size,
    pictures,
    mainPictures,
}) => {
    const token = getCookie("token")
    const dispatch = useDispatch()
    const { user }: any = useSelector<RootState>(state => state.user)
    const [state, setState] = useState<State>({
        reviews: [],
    });
    const { reviews } = state;

    useEffect(() => {
        axios.get(`/api/products/${id}/reviews`)
            .then(res => setState({ ...state, reviews: res.data.reviews }))
            .then(() => dispatch(setIsLoading(false)))
    }, [])



    const handleAddToCart = async (id: string) => {
        const productExists = user.cart?.find((cart: Product) => cart.id === id)
        if (!token) {
            toast.info("Vui lòng đăng nhập", { autoClose: 3000, theme: "colored" })
        } else if (productExists?.id) {
            const newProduct = user.cart?.filter((cart: Product) => cart.id !== productExists.id)
            axios.put(`/api/users/${user.id}`, { cart: user.cart?.length ? [...newProduct, { id, size: null, amount: productExists.amount + 1 }] : [{ id, amount: 1 }] })
            dispatch(setOpenSnackBar(true))
            dispatch(setContentSnackBar("+1 item"))
        } else {
            axios.put(`/api/users/${user.id}`, { cart: [...user?.cart, { id, size: null, amount: 1 }] })
            dispatch(setOpenSnackBar(true))
            dispatch(setContentSnackBar("+1 item"))
        }

    }


    return (
        <Card className="group relative cursor-pointer flex-col justify-between h-[28rem]">
            <div
                className="hover:bg-opacity-30 text-white rounded-l-lg z-10 absolute group-hover:translate-x-0 transition-transform duration-500 translate-x-20 right-0 top-2 bg-black bg-opacity-20 " title="Add to cart">
                <IconButton
                    onClick={() => handleAddToCart(id)}
                >
                    <AiOutlineShoppingCart color={"#111"} size={40} />
                </IconButton>
            </div>
            <Link href={`/product/${id}`}>
                <a>
                    <div className="relative group h-[80%] flex overflow-hidden">
                        {amount === 0 &&
                            <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black bg-opacity-60 z-10">
                                <h1 className="rotate-[-45deg] text-5xl font-bold text-red-500">Sell out</h1>
                            </div>
                        }
                        <div className="group-hover:translate-x-[-100%] transition-transform duration-700 flex">
                            <CardMedia
                                component="img"
                                className="!h-full"
                                image={mainPictures[0]}
                                alt="green iguana"
                            />
                            <CardMedia
                                component="img"
                                className="!h-full"
                                image={mainPictures[1]}
                                alt="green iguana"
                            />
                        </div>
                        <Typography className="absolute px-2 py-3 font-semibold !text-white left-0 top-2 bg-[#3d2e5c]">
                            {`-${discount}%`}
                        </Typography>

                        <CardActions className="absolute translate-y-10 group-hover:translate-y-0 transition-transform duration-500   flex left-[30%] right-[30%] bottom-2 p-2 ">
                            <Rating name="read-only" precision={0.5} value={formatReviews(reviews)} readOnly />
                        </CardActions>
                    </div>
                    <CardContent className="flex-col h-[20%] space-y-1">
                        <div className="flex  items-center">
                            <div className="flex-1">
                                <Typography
                                    title={name}
                                    gutterBottom
                                    variant="body2"
                                    component="div"
                                >
                                    <LinesEllipsis
                                        className="!font-semibold"
                                        text={name}
                                        maxLine={2}
                                    />
                                </Typography>
                            </div>
                        </div>
                        <div className="flex justify-center items-center gap-2">
                            <Typography className="line-through" variant="body2" color="text.secondary">
                                <Currency quantity={+price} currency="VND" pattern="##,### !" />
                            </Typography>
                            <Typography variant="body2" className="text-black !font-bold">
                                <Currency quantity={Number(+price - +price / 100 * +discount)} currency="VND" pattern="##,### !" />
                            </Typography>
                        </div>
                    </CardContent>
                </a>
            </Link>
        </Card >
    );
};

export default Product;
