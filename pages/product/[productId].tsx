import { Avatar, Button, Container, FormControl, Grid, IconButton, ImageList, ImageListItem, InputLabel, ListItemAvatar, ListItemText, MenuItem, OutlinedInput, Select, TextField, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { AiFillStar, AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import Layout from "../../components/Layout";
import { setIsLoading, setOpenOrderProduct, setOpenProfileModal, setOpenSnackBar } from "../../redux/features/isSlice";
import { Product, Reviews, User } from "../../Models";
import Currency from 'react-currency-formatter';
import { Navigation, Thumbs, FreeMode } from "swiper";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useSession } from "next-auth/react";
import { RootState } from "../../redux/store";
import { toast } from "react-toastify";
import moment from "moment";
import dynamic from "next/dynamic";
import { setContentSnackBar, setIdProfile } from "../../redux/features/userSlice";
import { setOrder, setTotalPrice } from "../../redux/features/ordersSlice";
const ListReviews = dynamic(() => import("../../components/ListReviews"), { ssr: false })
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getCookie } from "cookies-next";
import { FaUserTie } from "react-icons/fa";
import Link from "next/link";
import { BsFillTelephoneFill } from "react-icons/bs";




// Import Swiper styles
interface State {
    product: Product | any
    reviews: Reviews[]
    sliders: any[]
    users: User[]
    sizeInput: string
    amount: number
    rating: number | null
    review: string
    tab: number
}



function srcset(image: string, size: number, rows = 1, cols = 1) {
    return {
        src: `${image}?w=${size * cols}&h=${size * rows}`,
        srcSet: `${image}?w=${size * cols}&h=${size * rows
            }`,
    };
}

const ProductDetail = ({ productId }: any) => {
    const token = getCookie("token")
    const { user }: User | any = useSelector<RootState>(state => state.user)
    const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
    const dispatch = useDispatch()
    const [state, setState] = useState<State>({
        product: {},
        reviews: [],
        users: [],
        sliders: [],
        sizeInput: "",
        review: "",
        rating: 0,
        amount: 1,
        tab: 0
    })
    const { users, product, reviews, sliders, sizeInput, amount, tab } = state
    const {
        name,
        discount,
        price,
        size,
        owner
    }: Product = product
    const theme = useTheme();
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));


    useEffect(() => {
        axios
            .get(`/api/products/${productId}`)
            .then(res => {
                axios.get('/api/users')
                    .then(resUsers => {
                        const sliders = [...res.data.mainPictures, ...res.data.pictures].map((item, index) => {
                            return {
                                img: item,
                                rows: index % 3 === 0 ? 2 : 0,
                                cols: index % 3 === 0 ? 2 : 0,
                            }

                        })
                        setState({ ...state, users: resUsers.data.users, product: res.data, sliders: sliders.slice(0, 6) })
                        dispatch(setIsLoading(false))
                    })
            })

        return () => {
            dispatch(setIsLoading(true))
        }
    }, [])


    const handleAddToCart = () => {
        const productExists = user.cart?.find((cart: Product) => cart.id === productId)
        if (!token) {
            toast.info("Vui lòng nhập đăng nhập", { autoClose: 3000, theme: "colored" })
        } else if (!amount) {
            toast.info("Vui lòng nhập số lượng sản phẩm", { autoClose: 3000, theme: "colored" })
        } else {
            if (productExists?.id) {
                const newProduct = user.cart?.filter((cart: Product) => cart.id !== productExists.id)
                axios.put(`/api/users/${user.id}`, { cart: user.cart?.length ? [...newProduct, { id: productId, size: null, amount: productExists.amount + amount }] : [{ id: productId, amount }] })
            } else {
                axios.put(`/api/users/${user.id}`, { cart: [...user?.cart, { id: productId, size: null, amount }] })
            }
        }
        dispatch(setOpenSnackBar(true))
        dispatch(setContentSnackBar(`+${amount} item`))
    }


    const handleBuyProduct = () => {
        if (!token) {
            toast.info("Vui lòng nhập đăng nhập", { autoClose: 3000, theme: "colored" })
        } else if (!sizeInput) {
            toast.info("Vui lòng chọn size sản phẩm", { autoClose: 3000, theme: "colored" })
        } else {
            const formOrder: any = [
                {
                    owner: product?.owner,
                    cart: [{ amount, product: product, size: sizeInput }]
                }
            ]
            dispatch(setTotalPrice((product?.price! - (product?.price / 100 * product?.discount)) * amount))
            dispatch(setOpenOrderProduct(true))
            dispatch(setOrder(formOrder))
        }
    }

    const getUser = (id: string) => {
        return users.find((u: User) => u.id === id)
    }
    const handleShowProfile = (id: string) => {
        dispatch(setOpenProfileModal(true))
        dispatch(setIdProfile(id))
    }


    return (
        <Layout>
            <Container className="!p-0 !w-full overflow-hidden" maxWidth="xl">
                <div className="lg:flex block lg:px-20 p-4 pt-24 space-y-6 space-x-6">
                    <div className="lg:w-[50%] w-full !p-0 flex-col space-y-2 space-x-6 border-gray-200 border-[1px]">
                        <>
                            <Swiper
                                spaceBetween={1}
                                navigation={true}
                                thumbs={{ swiper: thumbsSwiper }}
                                modules={[Navigation, FreeMode, Thumbs]}
                                className="lg:!w-full w-full  !h-[32rem]"
                            >
                                {sliders?.map((slider, index) => (
                                    <SwiperSlide key={index}>
                                        <img className="cursor-pointer h-full !w-full !object-contain" src={slider.img} alt="pictures" />
                                    </SwiperSlide>
                                )
                                )}
                            </Swiper>
                            <Swiper
                                onSwiper={setThumbsSwiper}
                                spaceBetween={10}
                                slidesPerView={4}
                                freeMode={true}
                                watchSlidesProgress={true}
                                modules={[Navigation, FreeMode, Thumbs]}
                                className="lg:!w-full w-full !h-28"
                            >
                                {sliders?.map((slider, index) => (
                                    <SwiperSlide key={index}>
                                        <img className=" cursor-pointer h-full !w-full !object-cover" src={slider.img} alt="pictures" />
                                    </SwiperSlide>
                                )
                                )}
                            </Swiper>
                        </>
                    </div>
                    <div className="lg:w-[50%] w-full !m-0 lg:!ml-6 flex-col space-y-4">
                        <Grid item>
                            <Typography fontSize={20} variant="body1" component="h1">
                                {name}
                            </Typography>
                        </Grid>

                        <Grid container className="flex items-center gap-2">
                            <Typography fontSize={16} className="line-through" variant="body2" color="text.secondary">
                                <Currency quantity={+price} currency="VND" pattern="##,### !" />
                            </Typography>
                            <Typography variant="body2" fontSize={20} className="text-red-600 !font-bold">
                                <Currency quantity={+price - +price / 100 * discount} currency="VND" pattern="##,### !" />
                            </Typography>
                        </Grid>
                        <Grid item>
                            <div className="flex items-center space-x-5">
                                <div onClick={() => handleShowProfile(product.owner)} className="flex cursor-pointer  items-center">
                                    <Tooltip title="Chủ sản phẩm">
                                        <IconButton>
                                            <FaUserTie size={16} className="text-primary" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Chủ sản phẩm">
                                        <span className="text-base font-semibold">{`${getUser(product.owner)?.firstName} ${getUser(product.owner)?.lastName}`}</span>
                                    </Tooltip>
                                </div>

                                {getUser(product.owner)?.phone &&
                                    <div className="flex cursor-pointer items-center">
                                        <Tooltip title="Gọi">
                                            <IconButton>
                                                <Link href={`tel:${getUser(product.owner)?.phone}`} >
                                                    <a>
                                                        <BsFillTelephoneFill size={16} className="text-primary" />
                                                    </a>
                                                </Link>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Số điện thoại">
                                            <span className="text-base font-semibold">{`+84${getUser(product.owner)?.phone}`}</span>
                                        </Tooltip>
                                    </div>
                                }


                            </div>
                        </Grid>
                        <Grid container alignItems={"center"}>
                            <Grid item xs={6} md={6} lg={9}>
                                <Typography fontSize={18} variant="body1" component="h1">
                                    Size
                                </Typography>
                            </Grid>
                            <Grid item xs={6} md={6} lg={3}>
                                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                                    <InputLabel id="demo-select-small">Size</InputLabel>
                                    <Select
                                        labelId="demo-select-small"
                                        id="demo-select-small"
                                        value={sizeInput}
                                        label="Age"
                                        onChange={(e) => setState({ ...state, sizeInput: e.target.value })}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {size?.map(s => (
                                            <MenuItem key={s} value={s}>
                                                {s}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container alignItems={"center"}>
                            <Grid item xs={6} md={8} lg={8}>
                                <Typography fontSize={18} variant="body1" component="h1">
                                    Amount
                                </Typography>
                            </Grid>
                            <Grid item xs={6} md={4} lg={4}>
                                <FormControl className="flex-row" size="small">
                                    <Button
                                        onClick={() => setState({ ...state, amount: amount <= 1 ? 1 : amount - 1 })}
                                        className="w-[25%]" variant="outlined">
                                        <AiOutlineMinus size={20} />
                                    </Button>
                                    <OutlinedInput
                                        value={amount}
                                        onChange={(e) => setState({ ...state, amount: +e.target.value })}
                                        className="w-[50%]"
                                        inputProps={{ min: 0, style: { textAlign: 'center' } }} // the change is here
                                        placeholder="1" />
                                    <Button
                                        onClick={() => setState({ ...state, amount: amount + 1 })}
                                        className="w-[25%]" variant="outlined">
                                        <AiOutlinePlus size={20} />
                                    </Button>
                                </FormControl>

                            </Grid>
                        </Grid>
                        <Grid container columnSpacing={2}>
                            <Grid item lg={6}>
                                <Button
                                    onClick={handleBuyProduct}
                                    className="!bg-primary w-full" variant="contained">Mua ngay
                                </Button>
                            </Grid>
                            <Grid item lg={6}>
                                <Button
                                    className="!border-primary !text-secondary w-full" variant="outlined"
                                    onClick={handleAddToCart}
                                >Thêm vào giỏ hàng
                                </Button>
                            </Grid>
                        </Grid>
                    </div>
                </div>
                <Grid container py={12} px={isTablet ? 2 : 10} >
                    <Grid item lg={12}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tab} onChange={(event: React.SyntheticEvent, newValue: number) => setState({ ...state, tab: newValue })}>
                                <Tab label="Mô tả sản phẩm" />
                                <Tab label="Đánh giá" />
                            </Tabs>
                        </Box>
                    </Grid>
                    {tab === 0 ?
                        <Grid item lg={12} marginTop={2} className="border-primary border-[1px] rounded-md px-4 flex-col space-y-3 py-6">
                            <div className="flex space-x-2">
                                <Typography fontWeight={700} variant="body1" component="h1">
                                    {name}
                                </Typography>
                                <Typography variant="body1" component="h1">
                                    {"chính hãng với 3 yếu tố tạo nên giá trị thương hiệu"}
                                </Typography>
                            </div>
                            <Typography variant="body2" component="h1">
                                - Thiết kế: Độc quyền
                            </Typography>
                            <Typography variant="body2" component="h1">
                                - Vật liệu: Cao cấp
                            </Typography>
                            <Typography variant="body2" component="h1">
                                - Gia công: Tỉ mỉ
                            </Typography>
                            <Typography variant="body2" component="h1">
                                *Khẳng định giá trị của bạn khi sử dụng các sản phẩm chính hãng được cũng cấp bởi Sport Yard
                            </Typography>
                            <Typography fontWeight={600} variant="body2" component="h1">
                                Các hình ảnh nổi bật:
                            </Typography>
                            <Grid item lg={12}>
                                <ImageList
                                    className="w-full"
                                    variant="quilted"
                                    cols={4}
                                    rowHeight={121}
                                >
                                    {sliders?.map((item) => (
                                        <ImageListItem key={item.img} cols={item.cols || 1} rows={item.rows || 1}>
                                            <img
                                                {...srcset(item.img, 121, item.rows, item.cols)}
                                                alt={item.title}
                                                className="!object-cover !h-full"
                                                loading="lazy"
                                            />
                                        </ImageListItem>
                                    ))}
                                </ImageList>
                            </Grid>
                        </Grid>
                        :
                        <Grid item lg={12} marginTop={2} className="rounded-md px-4 flex-col space-y-2 py-6">
                            <ListReviews productId={productId} type="product" />
                        </Grid>
                    }

                    <Grid container>
                        {reviews?.map((review, index) => (
                            <Grid key={index} lg={12}>
                                <Grid container rowSpacing={4} >
                                    <Grid item>
                                        <ListItemAvatar>
                                            <Avatar alt={review.name} src="/static/images/avatar/1.jpg" />
                                        </ListItemAvatar>
                                    </Grid>
                                    <Grid item className="flex-1">
                                        <ListItemText
                                            primary={review.name}
                                            secondary={
                                                <div className="flex items-center">
                                                    <AiFillStar className="text-xl text-[#f0803c]" />
                                                    <Typography
                                                        className="!font-bold !text-lg"
                                                        component="div"
                                                        variant="body2"
                                                        color="text.primary"
                                                    >
                                                        {review.star}
                                                    </Typography>
                                                </div>
                                            }
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Typography className="!font-semibold !text-sm text-gray-400" component="h1">
                                            {moment(review.timestamp).format("DD/MM/YY")}
                                        </Typography>
                                    </Grid>
                                    <Grid container>
                                        <Grid item>
                                            <Typography className="!font-mono !text-lg" variant="body1" component="h1">
                                                {review.comment}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>


            </Container>
        </Layout >
    );
};

export async function getServerSideProps(context: any) {
    // The query params are set on `context.query`
    const { productId } = context.query;
    return {
        props: { productId },
    };
}

export default ProductDetail;