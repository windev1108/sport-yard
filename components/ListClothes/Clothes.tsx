import React, { useEffect, useState } from "react";
import {
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Grid,
    Typography,
} from "@mui/material";
import { NextPage } from "next";
import { GiPriceTag } from "react-icons/gi";
import { ImLocation } from "react-icons/im";
import Currency from "react-currency-formatter";
import Link from "next/link";
import LinesEllipsis from "react-lines-ellipsis";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { formatReviews } from "../../utils/helper";
import { Product, Reviews } from "../../Models";
import axios from "axios";
import Rating from "@mui/material/Rating/Rating";

interface State {
    reviews: Reviews[];
}

const Clothes: NextPage<Product> = ({
    id,
    name,
    pictures,
    amount,
    mainPictures,
    price,
    discount,
    description,
    size,
    type,
}) => {
    const [state, setState] = useState<State>({
        reviews: [],
    });
    const { reviews } = state;


    useEffect(() => {
        axios.get(`/api/pitch/${id}/reviews`)
            .then(res => setState({ ...state, reviews: res.data.reviews }))
    }, [])

    return (
        <Grid item xs={12} md={6} lg={3}>
            <Link href={`/products/clothes/${id}`}>
                <Card className="relative cursor-pointer flex-col justify-between h-[28rem]">
                    <div className="relative group h-[80%] flex overflow-hidden">
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
                        <CardActions className="absolute group-hover:translate-x-0 transition-transform duration-500 translate-x-16 right-0 top-2 p-2 bg-black bg-opacity-20 ">
                            <AiOutlineShoppingCart color={"#111"} size={32} />
                        </CardActions>
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
                                <Currency quantity={price} currency="VND" pattern="##,### !" />
                            </Typography>
                            <Typography variant="body2" className="text-black !font-bold">
                                <Currency quantity={price - price / 100 * discount} currency="VND" pattern="##,### !" />
                            </Typography>
                        </div>
                    </CardContent>
                </Card >
            </Link>
        </Grid>
    );
};

export default Clothes;
