import React, { useEffect, useState } from "react";
import { Navigation, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import {  Product } from "../../Models";
import { AiFillStar } from "react-icons/ai";
import axios from "axios";
import { Container, Grid, Skeleton, Typography } from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setIsLoading } from "../../redux/features/isSlice";
import ProductComponent from "../Product";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';



interface State {
    products: Product[];
    isLoading: boolean;
}

const SneakersRow = () => {
    const dispatch = useDispatch()
    const [state, setState] = useState<State>({
        products: [],
        isLoading : true
    });
    const { products , isLoading } = state;
    const theme = useTheme();
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  


    useEffect(() => {
        axios
            .get("/api/products")
            .then((res) => {
                setState({ ...state, products: res.data.products.filter((product: Product) => product.type === "sneakers") , isLoading: false})
            });
    }, []);

    return (
        <>
            <Container>
                <Grid container justifyContent={"center"}>
                    <Grid item >
                        {isLoading ?
                            <Skeleton variant="text" className="!mt-4 !h-[4rem] w-[22rem]" />
                            :
                            <Grid container columnGap={1} marginTop={4}>
                                <Grid item>
                                    <AiFillStar className="text-3xl text-primary" />
                                </Grid>
                                <Grid item>
                                <Typography className="lg:text-2xl text-base" variant="body1" component="h1"> RECOMMENDED SNEAKERS</Typography>
                                </Grid>
                                <Grid item>
                                    <AiFillStar className="text-3xl text-primary" />
                                </Grid>
                            </Grid>
                        }
                    </Grid>
                </Grid>
            </Container>

            {isLoading ?
                <Swiper
                    className="flex-row w-full my-10 p-2"
                    spaceBetween={30}
                    slidesPerView={isTablet ? 1 : 4}
                    navigation={true}
                    pagination={{
                        clickable: true,
                    }}
                    modules={[Navigation, Pagination]}
                >
                    <SwiperSlide
                        className="w-[25%] h-[400px] shadow-md">
                        <div className="relative h-[28rem]">
                                <Skeleton variant="rectangular" className="!w-full !h-[80%]" />
                                <div className="h-[20%] shadow-md pb-[24px] pl-[16px] pr-[16px] pt-[16px]">
                                    <Skeleton className="!w-full" variant="text" />
                                    <Skeleton width={100} variant="text" />
                                    <div className="flex justify-center items-center gap-2">
                                        <Skeleton width={80} variant="text" />
                                        <Skeleton width={80} variant="text" />
                                    </div>
                                </div>
                            </div>
                    </SwiperSlide>
                    <SwiperSlide
                        className="w-[25%] h-[400px] shadow-md">
                        <div className="relative h-[28rem]">
                                <Skeleton variant="rectangular" className="!w-full !h-[80%]" />
                                <div className="h-[20%] shadow-md pb-[24px] pl-[16px] pr-[16px] pt-[16px]">
                                    <Skeleton className="!w-full" variant="text" />
                                    <Skeleton width={100} variant="text" />
                                    <div className="flex justify-center items-center gap-2">
                                        <Skeleton width={80} variant="text" />
                                        <Skeleton width={80} variant="text" />
                                    </div>
                                </div>
                            </div>
                    </SwiperSlide>
                    <SwiperSlide
                        className="w-[25%] h-[400px] shadow-md">
                        <div className="relative h-[28rem]">
                                <Skeleton variant="rectangular" className="!w-full !h-[80%]" />
                                <div className="h-[20%] shadow-md pb-[24px] pl-[16px] pr-[16px] pt-[16px]">
                                    <Skeleton className="!w-full" variant="text" />
                                    <Skeleton width={100} variant="text" />
                                    <div className="flex justify-center items-center gap-2">
                                        <Skeleton width={80} variant="text" />
                                        <Skeleton width={80} variant="text" />
                                    </div>
                                </div>
                            </div>
                    </SwiperSlide>
                    <SwiperSlide
                        className="w-[25%] h-[400px] shadow-md">
                        <div className="relative h-[28rem]">
                                <Skeleton variant="rectangular" className="!w-full !h-[80%]" />
                                <div className="h-[20%] shadow-md pb-[24px] pl-[16px] pr-[16px] pt-[16px]">
                                    <Skeleton className="!w-full" variant="text" />
                                    <Skeleton width={100} variant="text" />
                                    <div className="flex justify-center items-center gap-2">
                                        <Skeleton width={80} variant="text" />
                                        <Skeleton width={80} variant="text" />
                                    </div>
                                </div>
                            </div>
                    </SwiperSlide>
                </Swiper>
                :
                <Swiper
                    className="flex-row w-full my-10 p-2"
                    spaceBetween={20}
                    slidesPerView={isTablet ? 1 : 4}
                    navigation={true}
                    pagination={{
                        clickable: true,
                    }}
                    modules={[Navigation, Pagination]}
                >
                    {products?.map((p) => (
                        <SwiperSlide
                            key={p.id}
                            className="w-[25%] h-[400px] rounded-2xl overflow-hidden border-[1px] border-gray-300"
                        >
                            <ProductComponent
                                id={p.id}
                                name={p.name}
                                description={p.description}
                                price={p.price}
                                discount={p.discount}
                                size={p.size}
                                pictures={p.pictures}
                                mainPictures={p.mainPictures}
                            />

                        </SwiperSlide>
                    ))}
                </Swiper>
            }
        </>
    );
};

export default React.memo(SneakersRow);
