import React from "react";
import { NextPage } from "next";
import { Product as ProductModel } from "../Models";
import { Container, Grid, Skeleton } from "@mui/material";
import Product from "./Product";


interface Props {
    products: ProductModel[]
    isLoading: boolean
}

const ListProducts: NextPage<Props> = ({ products, isLoading }) => {

    return (
        <Container maxWidth={"xl"}>
            {isLoading ?
                <Grid maxWidth={"xl"} container spacing={2} >
                    {[...Array(products.length).keys()].map((index) => (
                        <Grid key={index} item xs={12} md={6} lg={3}>
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
                        </Grid>
                    ))}
                </Grid>
                :
                <Grid maxWidth={"xl"} container spacing={2} >
                    {products.map((p: ProductModel) => (
                        <Grid item key={p.id} xs={12} md={6} lg={3}>
                            <Product
                                key={p.id}
                                id={p.id}
                                name={p.name}
                                description={p.description}
                                price={p.price}
                                discount={p.discount}
                                size={p.size}
                                amount={p.amount!}
                                pictures={p.pictures}
                                mainPictures={p.mainPictures}
                            />
                        </Grid>
                    ))}

                </Grid>
            }
        </Container>
    );
};



export default React.memo(ListProducts);
