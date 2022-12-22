import React, { useEffect, useRef, useState } from 'react'
import { Grid, Typography, ListItemAvatar, Avatar, Rating, List, ListItem, Skeleton } from '@mui/material'
import { Order, Reviews, User } from '../../Models';
import { formatReviews } from '../../utils/helper';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Link from 'next/link';
import { FaTelegramPlane } from 'react-icons/fa';
import { deepOrange } from '@mui/material/colors';
import axios from 'axios';
import Review from './Review';
import { getCookie } from 'cookies-next';
import Router from 'next/router';
import { setIsUpdate } from '../../redux/features/isSlice';


interface State {
    review: string
    rating: number | null
    reviews: Reviews[]
    limit: number
    isLoading: boolean
    myOrders: number
}

const ListReviews = ({ pitchId, productId, type }: any) => {
    const token = getCookie("token")
    const dispatch = useDispatch()
    const { user }: User | any = useSelector<RootState>(state => state.user)
    const { isUpdated }: User | any = useSelector<RootState>(state => state.is)
    const limitPitch = useRef();



    const [state, setState] = useState<State>({
        review: "",
        rating: 0,
        reviews: [],
        myOrders: 0,
        limit: 5,
        isLoading: true
    })
    const { reviews, review, rating, myOrders, isLoading } = state


    const handleAddReview = (e: any) => {
        e.preventDefault()
        if (!review || !rating) {
            toast.info("Vui lòng nhập đánh giá", { autoClose: 3000, theme: "colored" })
        } else if (myOrders === 0) {
            toast.info("Vui lòng đặt sân để đánh giá", { autoClose: 3000, theme: "colored" })
        } else {
            const formData = {
                star: rating,
                userId: user.id,
                comment: review,
            }
            toast.success("Thêm đánh giá thành công", { autoClose: 3000, theme: "colored" })
            dispatch(setIsUpdate(!isUpdated))
            setState({ ...state, review: "", rating: 0 })
            type === "product" ? axios.post(`/api/products/${productId}/reviews`, formData) : axios.post(`/api/pitch/${pitchId}/reviews`, formData)
        }
    }


    // const handleLimit = () => {
    //     if (limitPitch?.current && limit < limitPitch?.current) {
    //         setState({ ...state, limit: limit + 1 });
    //     } else {
    //         setState({ ...state, limit: 5 });
    //     }
    // };


    useEffect(() => {
        axios.get(`/api/${type === "product" ? "products" : "pitch"}/${type === "product" ? productId : pitchId}/reviews`)
            .then(resReviews => {
                axios.get('/api/orders')
                    .then(resOrders => setState({ ...state, reviews: resReviews.data.reviews, myOrders: resOrders.data.orders.filter((order: Order) => order.ordererId === user.id && order.productId === pitchId).length, isLoading: false }))
            })
        // .then(data => {
        //     // limitPitch.current = data.length
        //     setState({ ...state, reviews: data })
        // })
    }, [isUpdated])



    return (
        <>
            <Grid item container columnSpacing={2}>
                <Grid
                    marginTop={1}
                    item
                >
                    {isLoading ?
                        <Skeleton className="!translate-y-0 w-[8rem] !h-full" animation="wave" />
                        :
                        <div className="flex items-center space-x-1">
                            <Typography variant="body2" fontSize={20} component="h1">{formatReviews(reviews)}</Typography>
                            <Rating name="read-only" precision={0.5} value={formatReviews(reviews)} readOnly />
                        </div>
                    }
                </Grid>
                <Grid item>
                    <Grid container >
                        <Grid item>
                            {isLoading ?
                                <Skeleton variant="text" width={300} />
                                :
                                <Typography className="!font-semibold" variant="body1" component="h1">
                                    {type === "product" ?
                                        reviews.length ? `${reviews.length} người dùng đã đánh giá sảm phẩm này` : "Sản phẩm này chưa có đánh giá"
                                        :
                                        reviews.length ? `${reviews.length} người chơi đã đánh giá sân bóng này` : "Sân bóng này chưa có đánh giá"
                                    }

                                </Typography>
                            }
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item>
                            {isLoading ?
                                <Skeleton variant="text" width={200} />
                                :
                                <Typography className="!font-semibold !text-sm text-gray-400" variant="body1" component="h1">
                                    {`Dựa trên ${reviews.length} đánh giá`}
                                </Typography>
                            }
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container>
                <Grid item xs={12} md={12} lg={12}>
                    {isLoading ?
                        <Skeleton className="w-full !h-[7.5rem]" animation="wave" />
                        :
                        <form
                            onSubmit={handleAddReview}
                            className="border h-[5rem] flex items-center border-primary rounded-md p-2 px-4 mt-3 w-full"
                        >
                            <div className="flex w-full space-x-4 items-center">
                                <div>
                                    {token ?
                                        <Avatar src={user.avatar ? user.avatar : user.firstName} sx={{ bgcolor: deepOrange[500] }} alt={user.firstName} />
                                        :
                                        <Avatar />
                                    }
                                </div>
                                <div className="flex-1">
                                    {token ?
                                        <div>
                                            <Rating
                                                name="simple-controlled"
                                                value={rating}
                                                onChange={(event, newValue) => {
                                                    setState({ ...state, rating: newValue });
                                                }}
                                            />
                                            <input
                                                value={review}
                                                onChange={e => setState({ ...state, review: e.target.value })}
                                                className="text-secondary font-medium placeholder-gray-400  outline-none text-sm w-full py-1"
                                                type="text"
                                                placeholder="Bạn có thể để lại đánh giá ở đây
                  "
                                            />

                                        </div>
                                        :
                                        <div className="text-secondary text-sm lg:text-base py-2 px-4 w-full">
                                            Bạn cần
                                            <Link className="text-[#0D90F3] hover:opacity-60" href="/signin">
                                                <a className="pl-2 text-[#0D90F3]">Đăng nhập</a>
                                            </Link> để đánh giá
                                        </div>
                                    }
                                </div>
                                <div>
                                    {token &&
                                        <button type="submit">
                                            <FaTelegramPlane className="fas fa-search text-3xl cursor-pointer text-primary w-[3rem] mr-2 !hover:text-opacity-50"></FaTelegramPlane>
                                        </button>
                                    }
                                </div>
                            </div>
                        </form>
                    }
                </Grid>
                <Grid item lg={12} className="!w-full">
                    <List className="relative flex-col w-full  !pb-20 space-y-2" sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {isLoading ?
                            reviews.map((review: Reviews) => (
                                <Skeleton key={review.id} className="w-full !translate-y-0 !h-[7rem]" animation="wave" />
                            ))
                            :
                            reviews?.map((review: Reviews) => (
                                <ListItem
                                    key={review.id}
                                    className=" border-[1px] border-gray-300 rounded-md" alignItems="flex-start">
                                    <Review review={review} />
                                </ListItem>
                            ))
                        }
                        {/* <div className="pt-10 mx-auto w-[50%]">
                            {isLoading ?
                                <Skeleton variant="rounded" className="!h-[2.5rem]" />
                                :
                                <Button
                                    onClick={handleLimit}
                                    className="w-full  !bg-primary hover:!bg-primary !hover:bg-opacity-50"
                                    variant="contained"
                                >
                                    {limitPitch?.current && limit < limitPitch?.current
                                        ? "See more"
                                        : "See less"}
                                </Button>
                            }
                        </div> */}

                    </List>

                </Grid>
            </Grid>
        </>
    )
}

export default ListReviews