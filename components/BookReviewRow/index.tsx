import React, { useEffect, useState } from "react";
import { GoPrimitiveDot } from "react-icons/go";
import Position from "../../assets/images/Position.png";
import Creditcard from "../../assets/images/Creditcard.png";
import Calendar from "../../assets/images/calendar.png";
import Image from "next/image";
import { Container, Grid, Skeleton, Typography } from '@mui/material';
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const BookReviewRow = () => {
  const [scrollY, setScrollY] = useState(0)
  const { isLoading }: any = useSelector<RootState>(state => state.is)
  const images = [{ name: "Find", desc: "Find nearby", img: Position }, { name: "Select", desc: "Select duration,date,pitch size", img: Calendar }, { name: "Pay", desc: "Payment online", img: Creditcard }]


  useEffect(() => {
    const handleScrollY = () => {
      setScrollY(Math.floor(window.scrollY))
    }
    window.addEventListener('scroll', handleScrollY)
    return () => {
      window.removeEventListener('scroll', handleScrollY)
    }
  }, [])


  return (
    <Container className="my-[5rem]">
      <Grid className={`${scrollY > 1800 ? "translate-y-0 opacity-100-" : "translate-y-[100%] opacity-0"} transition-all duration-1000 ease-in-out delay-300`} container marginTop={3} marginBottom={3} justifyContent={"center"}>
        <Grid item >
          {isLoading ?
            <Skeleton variant="text" className="mt-4 h-[4rem] w-[20rem]" />
            :
            <Grid container columnGap={1} marginTop={4}>
              <Grid item>
                <GoPrimitiveDot className="text-3xl text-primary" />
              </Grid>
              <Grid item>
                <h1 className="uppercase text-3xl">OUR FEATURES</h1>
              </Grid>
              <Grid item>
                <GoPrimitiveDot className="text-3xl text-primary" />
              </Grid>
            </Grid>
          }
        </Grid>
      </Grid>
      {isLoading ?
        <Grid container spacing={2} marginTop={4} alignItems={"center"} justifyContent={"center"}>
          {images?.map((item, index) => (
            <Grid
              key={index}
              item xs={4}
              className="flex-col items-center justify-center"
            >
              <Grid container justifyContent={"center"}>
                <Grid item>
                  <Skeleton variant="rounded" className="w-[6rem] text-center flex justify-center h-[6rem]" />
                </Grid>
              </Grid>
              <Grid container justifyContent={"center"}>
                <Grid item>
                  <Skeleton variant="text" className="w-[3rem]" />
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
        :
        <Grid className={`${scrollY > 2000 ? "translate-y-0 opacity-100-" : "translate-y-[100%] opacity-0"} transition-all duration-1000 ease-in-out delay-300`} container spacing={2} marginTop={4} alignItems={"center"}>
          {images?.map((item, index) => (
            <Grid
              key={index}
              item xs={4}
              className="text-center"
            >
              <Image
                alt="img"
                src={item.img}
                width={50}
                height={50}
                layout="intrinsic"
                objectFit="contain"
              />
              <Typography className="lg:text-2xl text-lg" fontWeight={600} variant="h5" component="h5">
                {item.name}
              </Typography>
              <Typography fontSize={14} variant="body1" component="h1">
                {item.desc}
              </Typography>
            </Grid>
          ))}
        </Grid>
      }

    </Container>
  );
};

export default BookReviewRow;
