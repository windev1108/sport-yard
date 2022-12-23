import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import { NextPage } from "next";
import React, { useEffect, useState, useMemo } from "react";
import { AiFillStar } from "react-icons/ai";
import { GiPriceTag } from "react-icons/gi";
import { ImLocation } from "react-icons/im";
import { Reviews, Slot } from "../Models";
import LinesEllipsis from "react-lines-ellipsis";
import Currency from 'react-currency-formatter';
import Link from "next/link";
import { formatReviews } from "../utils/helper";
import { useDispatch } from "react-redux";
import { setIsLoading } from "../redux/features/isSlice";
import instance from "../server/db/instance";

export interface PitchProps {
  id: string;
  name: string;
  location: string;
  pictures: string[];
  mainPicture: string
  slots: Slot[]
}

interface State {
  reviews: Reviews[];
  price: number
  defaultPrice: number
}

const Pitch: NextPage<PitchProps> = ({
  id,
  name,
  location,
  slots,
  mainPicture
}) => {
  const dispatch = useDispatch()
  const [state, setState] = useState<State>({
    reviews: [],
    price: 0,
    defaultPrice: 0,
  });
  const { reviews, price, defaultPrice } = state;

  useEffect(() => {
    const results: Slot | undefined = slots?.find(slot => new Date().getHours() > +slot.start.substring(0, 2) && new Date().getHours() < +slot.end.substring(0, 2))  // Get slot now time
    const resultsDefault: Slot | undefined = slots?.find(slot => new Date().getHours() < +slot.start.substring(0, 2) || new Date().getHours() > +slot.start.substring(0, 2))  //Get slot after now Time
    instance.get(`/pitch/${id}/reviews`)
      .then(res => setState({ ...state, reviews: res.data.reviews, price: +results?.price!, defaultPrice: +resultsDefault?.price! }))
      .then(() => dispatch(setIsLoading(false)))
  }, [])

  return (
    <Card className="relative flex-col justify-between h-[24rem]">
      <div className="relative">
        <CardMedia
          component="img"
          className="h-[13rem]"
          image={mainPicture}
          alt="green iguana"
        />
        <CardContent className="flex-col space-y-1">
          <div className="flex  items-center">
            <div className="flex-1">
              <Typography
                title={name}
                gutterBottom
                variant="body2"
                component="div"
              >
                <LinesEllipsis
                  className="font-semibold text-base"
                  text={name}
                  maxLine={1}
                />
              </Typography>
            </div>
            <div>
              <div className="flex items-center">
                <Typography
                  className="text-[#f0803c]"
                  gutterBottom
                  variant="h5"
                  component="div"
                >
                  <AiFillStar />
                </Typography>
                <Typography
                  className="text-[#f0803c]"
                  gutterBottom
                  variant="body2"
                  component="div"
                >
                  {reviews ? `${formatReviews(reviews)}/5` : 0}
                </Typography>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ImLocation className="text-xl text-gray-400" />
            <Typography className="flex-1" component="div" variant="body2" color="text.secondary">
              <LinesEllipsis
                text={location}
                maxLine="2"
                ellipsis="..."
                trimRight
                basedOn="letters"
              />
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <GiPriceTag className="text-xl text-yellow-500" />
            <Typography className="flex-1" variant="body2" color="text.secondary">
              <Currency quantity={price || defaultPrice} currency="VND" pattern="##,### !" />/h
            </Typography>
          </div>
        </CardContent>
      </div>
      <CardActions className="absolute bottom-0 w-full">
        <Link href={`/pitch/${id}`}>
          <a className="w-full">
            <Button className="w-full !bg-primary !text-white" size="small">
              Xem chi tiết
            </Button>
          </a>
        </Link>
      </CardActions>
    </Card >
  );
};

export default Pitch;
