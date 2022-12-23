import React, { useEffect, useState } from "react";
import { Navigation, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Pitch from "../Pitch";
import { Pitch as PitchModel } from "../../Models";
import { AiFillStar } from "react-icons/ai";
import { Card, CardContent, CardMedia, Container, Grid, Skeleton, Typography } from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setIsLoading } from "../../redux/features/isSlice";
import CardActions from "@mui/material/CardActions/CardActions";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import instance from "../../server/db/instance";


interface State {
  pitch: PitchModel[];
  isLoading: boolean
}

const PitchRow = () => {
  const dispatch = useDispatch()
  const [state, setState] = useState<State>({
    pitch: [],
    isLoading: true
  });
  const { pitch, isLoading } = state;
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));


  useEffect(() => {
    instance
      .get("/pitch")
      .then((res) => {
        setState({ ...state, pitch: res.data.pitch, isLoading: false })
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
              <Grid container columnSpacing={1} marginTop={4}>
                <Grid item>
                  <AiFillStar className="text-3xl text-primary" />
                </Grid>
                <Grid item>
                  <Typography className="lg:text-2xl text-base" variant="body1" component="h1"> Sân bóng được đề xuất</Typography>
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
            <Card className="flex-col justify-between !lg:h-[25rem]">
              <Skeleton variant="rectangular" className="w-full" height={200} />
              <CardContent className="flex-col space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="w-[50%]" animation="wave" />
                  <Skeleton animation="wave" className="w-[15%]" />
                </div>
                <Skeleton animation="wave" />
                <Skeleton animation="wave" width={100} />
              </CardContent>
              <CardActions>
                <Skeleton animation="wave" className="w-full" height={100} />
              </CardActions>
            </Card>
          </SwiperSlide>
          <SwiperSlide
            className="w-[25%] h-[400px] shadow-md">
            <Card className="flex-col justify-between !lg:h-[25rem]">
              <Skeleton variant="rectangular" className="w-full" height={200} />
              <CardContent className="flex-col space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="w-[50%]" animation="wave" />
                  <Skeleton animation="wave" className="w-[15%]" />
                </div>
                <Skeleton animation="wave" />
                <Skeleton animation="wave" width={100} />
              </CardContent>
              <CardActions>
                <Skeleton animation="wave" className="w-full" height={100} />
              </CardActions>
            </Card>
          </SwiperSlide>
          <SwiperSlide
            className="w-[25%] h-[400px] shadow-md">
            <Card className="flex-col justify-between !lg:h-[25rem]">
              <Skeleton variant="rectangular" className="w-full" height={200} />
              <CardContent className="flex-col space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="w-[50%]" animation="wave" />
                  <Skeleton animation="wave" className="w-[15%]" />
                </div>
                <Skeleton animation="wave" />
                <Skeleton animation="wave" width={100} />
              </CardContent>
              <CardActions>
                <Skeleton animation="wave" className="w-full" height={100} />
              </CardActions>
            </Card>
          </SwiperSlide>
          <SwiperSlide
            className="w-[25%] h-[400px] shadow-md">
            <Card className="flex-col justify-between !lg:h-[25rem]">
              <Skeleton variant="rectangular" className="w-full" height={200} />
              <CardContent className="flex-col space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="w-[50%]" animation="wave" />
                  <Skeleton animation="wave" className="w-[15%]" />
                </div>
                <Skeleton animation="wave" />
                <Skeleton animation="wave" width={100} />
              </CardContent>
              <CardActions>
                <Skeleton animation="wave" className="w-full" height={100} />
              </CardActions>
            </Card>
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
          {pitch?.map((p) => (
            <SwiperSlide
              key={p.id}
              className="w-[25%] h-[400px] rounded-lg overflow-hidden border-[1px] border-gray-300"
            >
              <Pitch
                id={p.id}
                name={p.name}
                pictures={p.pictures}
                mainPicture={p.mainPicture}
                location={p.location}
                slots={p.slots}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      }
    </>
  );
};

export default React.memo(PitchRow);
