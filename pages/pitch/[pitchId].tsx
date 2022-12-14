import React, { useState, useEffect } from "react";
import { AiFillStar } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../components/Layout";
import { Pitch, Reviews, User } from "../../Models";
import { RootState } from "../../redux/store";
import { ImLocation } from "react-icons/im";
import { Swiper, SwiperSlide } from "swiper/react";
import { Avatar, Button, Grid, Tooltip, Skeleton, Typography, IconButton } from '@mui/material';
import { Navigation } from "swiper";
import { Calendar } from "react-calendar";
import axios from "axios";
import { formatReviews } from "../../utils/helper";
import DividerImg from '../../assets/images/divider.png'
import PitchImg from '../../assets/images/pitch.png'
import Ball from '../../assets/images/ball.png'
import Shirt from '../../assets/images/shirt.png'
import Shower from '../../assets/images/shower.png'
import Toilet from '../../assets/images/toilet.png'
import Water from '../../assets/images/water.png'
import { setIsLoading, setOpenProfileModal } from "../../redux/features/isSlice";
import dynamic from 'next/dynamic'
import Image from "next/image";
import { useSession } from "next-auth/react";
import BookingPitchModal from "../../components/Modals/BookingPitchModal";
import ListReviews from "../../components/ListReviews";
import { FaUserTie } from "react-icons/fa";
import { BsFillTelephoneFill } from "react-icons/bs";
import { setIdProfile } from "../../redux/features/userSlice";
import Link from "next/link";
const Map = dynamic(() => import("../../components/Map"), { ssr: false })

interface State {
  reviews: Reviews[];
  pitch: Pitch | any
  pictures: string[]
  users: User[]
  isLoading: boolean
}

const PitchDetail = ({ pitchId }: any) => {
  const dispatch = useDispatch()
  const { isUpdated }: User | any = useSelector<RootState>(state => state.is)
  const [state, setState] = useState<State>({
    reviews: [],
    pitch: {},
    pictures: [],
    users: [],
    isLoading: true
  });
  const { pitch, reviews, pictures, users, isLoading } = state;
  const [date, changeDate] = useState(new Date());
  const [openModalBooking, setOpenModalBooking] = useState<boolean>(false)

  const tileDisabled = ({ date }: any) => {
    const nowDate = new Date()
    return date < new Date().setDate(nowDate.getDate() - 1)
  }


  useEffect(() => {
    dispatch(setIsLoading(true))
    axios
      .get(`/api/pitch/${pitchId}`)
      .then(resPitch => {
        axios.get(`/api/pitch/${pitchId}/reviews`)
          .then(resReviews => {
            axios.get('/api/users')
              .then(resUsers => {
                setState({ ...state, users: resUsers.data.users, pitch: resPitch.data, pictures: [resPitch.data.mainPicture, ...resPitch.data.pictures], reviews: resReviews.data.reviews, isLoading: false })
                dispatch(setIsLoading(false))
              })
          })
      })
  }, [isUpdated])


  const getUser = (id: string) => {
    return users.find((u: User) => u.id === id)
  }

  const handleShowProfile = (id: string) => {
    dispatch(setOpenProfileModal(true))
    dispatch(setIdProfile(id))
  }


  return (
    <Layout>
      {openModalBooking && <BookingPitchModal changeDate={changeDate} date={date} pitch={{ ...pitch, id: pitchId }} open={openModalBooking} setOpen={setOpenModalBooking} />}
      <div className="py-20 flex-col space-y-4 gap-6  mx-4  lg:mx-20">
        <div className="w-full flex justify-between">
          <div>
            {isLoading ?
              <Skeleton width={300} animation="wave" />
              :
              <span className="text-xl font-semibold">{`Sân ${pitch.name}`}</span>
            }

            {isLoading ?
              <Skeleton width={300} animation="wave" />
              :
              <div className="flex items-center space-x-5">
                <div onClick={() => handleShowProfile(pitch.owner)} className="flex cursor-pointer  items-center">
                  <Tooltip title="Chủ sân">
                    <IconButton>
                      <FaUserTie size={16} className="text-primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Chủ sân">
                    <span className="text-base font-semibold">{`${getUser(pitch.owner)?.firstName} ${getUser(pitch.owner)?.lastName}`}</span>
                  </Tooltip>
                </div>

                {getUser(pitch.owner)?.phone &&
                  <div className="flex cursor-pointer items-center">
                    <Tooltip title="Gọi">
                      <IconButton>
                        <Link href={`tel:${getUser(pitch.owner)?.phone}`} >
                          <a>
                            <BsFillTelephoneFill size={16} className="text-primary" />
                          </a>
                        </Link>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Số điện thoại">
                      <span className="text-base font-semibold">{`+84${getUser(pitch.owner)?.phone}`}</span>
                    </Tooltip>
                  </div>
                }


              </div>
            }


            {isLoading ?
              <Skeleton width={500} animation="wave" />
              :
              <div className="lg:flex block gap-4 items-center">
                <div className="flex gap-1 items-center">
                  <div className="flex gap-1 items-center">
                    <AiFillStar className="text-xl text-[#f0803c]" />
                    <span className="font-semibold text-[#f0803c]">
                      {reviews.length ? `${formatReviews(reviews)}/5` : "0/5"}
                    </span>
                    <span className="text-xs font-semibold text-black"></span>
                    {`(${reviews.length} Reviews)`}
                  </div>
                </div>
                <div className="flex gap-1 items-center">
                  <ImLocation className="text-gray-400" />
                  <span>{pitch.location}</span>
                </div>
              </div>
            }
          </div>
        </div>
        <div className="lg:flex block gap-6">
          <div className="flex-col space-y-2 w-full lg:w-[70%] ">
            {isLoading ?
              <Skeleton variant="rounded" className="!w-full lg:!h-[30rem] h-[13rem] rounded-2xl" />
              :
              <Swiper
                className="flex-row w-full h-[13rem] lg:h-[30rem] shadow-md rounded-2xl "
                slidesPerView={1}
                navigation={true}
                pagination={{
                  clickable: true,
                }}
                modules={[Navigation]}
              >
                {pictures?.map((p: string, index: number) => (
                  <SwiperSlide
                    key={index}
                    className="w-[25%] !h-full"
                  >
                    <img className="object-cover h-full w-full" src={p} alt="" />
                  </SwiperSlide>
                ))}
              </Swiper>
            }
            <div className="lg:hidden block">
              {isLoading ?
                <Skeleton variant="rectangular" className="rounded-lg w-full !h-[2.5rem]" />
                :
                <Button
                  onClick={() => setOpenModalBooking(true)}
                  className="w-full !bg-primary" variant="contained">
                  Đặt sân{" "}
                </Button>
              }
            </div>
            <Grid container>
              <Grid item lg={12} marginTop={2}>
                {isLoading ?
                  <Skeleton className="!translate-y-[15px] !mb-1" width={200} animation="wave" />
                  :
                  <Typography className="translate-y-[15px]" fontSize={20} variant="body2" component="h1">
                    Stadium Location
                  </Typography>
                }
                <Image
                  alt=""
                  src={DividerImg}
                />
              </Grid>
              <Grid item lg={12} className="w-full h-[15rem]  lg:h-[20rem] !rounded-lg">
                {isLoading ?
                  <Skeleton variant="rectangular" className="w-full !h-full" />
                  :
                  <Map
                    pitchId={pitch.id}
                  />
                }

              </Grid>
            </Grid>
          </div>
          <div className="lg:block hidden w-[30%] flex-col space-y-6">
            {isLoading ?
              <Skeleton variant="rounded" className="rounded-lg w-full !h-[19rem]" />
              :
              <Calendar tileDisabled={tileDisabled} className="!rounded-lg !border-primary !p-2  !border-[3px] !w-full h-auto" onChange={changeDate} value={date} />
            }
            {isLoading ?
              <Skeleton variant="rectangular" className="rounded-lg w-full !h-[2.5rem]" />
              :
              <Button
                onClick={() => setOpenModalBooking(true)}
                className="w-full !bg-primary" variant="contained">
                Đặt sân{" "}
              </Button>
            }

          </div>
        </div>
        <div className="mt-2">
          {isLoading ?
            <Skeleton className="!translate-y-[15px] !mb-1" width={200} animation="wave" />
            :
            <Typography className="translate-y-[15px]" fontSize={20} variant="body2" component="h1">
              Available Pitches
            </Typography>
          }
          <Image
            alt=""
            src={DividerImg}
          />
        </div>
        <Grid container className="w-full" spacing={2} marginTop={1}>
          {isLoading ?
            pitch.size?.map((item: number, index: number) => (
              <Grid
                item
                paddingLeft={1}
                paddingRight={1}
                lg={4}
                key={item}
              >
                <Skeleton variant="rectangular" height={75} className="w-full rounded-lg" />
              </Grid>
            ))
            :
            pitch.size?.map((item: number, index: number) => (
              <Grid
                item
                paddingLeft={1}
                paddingRight={1}
                lg={4}
                key={item}
              >
                <Button
                  className="w-full !border-primary !text-primary"
                  variant="outlined">
                  <div className="flex gap-2 items-center">
                    <Image
                      alt="Pitch size"
                      src={PitchImg}
                      width={60}
                      height={60}
                    />
                    <Typography color={"#111"} variant="body1" component={"h1"}>
                      {`Pitch ${index + 1} - ${item} v ${item}`}
                    </Typography>
                  </div>
                </Button>
              </Grid>
            ))
          }

        </Grid>
        <Grid container>
          <Grid item lg={12} marginTop={2}>
            {isLoading ?
              <Skeleton className="!translate-y-[15px] !mb-1" width={200} animation="wave" />
              :
              <Typography className="translate-y-[15px]" fontSize={20} variant="body2" component="h1">
                We Offer
              </Typography>
            }
            <Image
              alt=""
              src={DividerImg}
            />
          </Grid>
        </Grid>
        <Grid container className="w-full" spacing={2} marginTop={1}>
          {isLoading ?
            <>
              <Grid
                className="px-2"
                lg={2.4}
                item
              >
                <Skeleton variant="rectangular" height={70} className="w-full rounded-lg" />
              </Grid>
              <Grid
                className="px-2"
                lg={2.4}
                item
              >
                <Skeleton variant="rectangular" height={70} className="w-full rounded-lg" />
              </Grid>
              <Grid
                className="px-2"
                lg={2.4}
                item
              >
                <Skeleton variant="rectangular" height={70} className="w-full rounded-lg" />
              </Grid>
              <Grid
                className="px-2"
                lg={2.4}
                item
              >
                <Skeleton variant="rectangular" height={70} className="w-full rounded-lg" />
              </Grid>
              <Grid
                className="px-2"
                lg={2.4}
                item
              >
                <Skeleton variant="rectangular" height={70} className="w-full rounded-lg" />
              </Grid>
            </>
            :
            <>
              <Grid
                lg={2.4}
                item>
                <Button
                  className="w-full !border-primary !text-primary"
                  variant="outlined">
                  <div className="flex p-2 gap-2 items-center">
                    <Image
                      alt="Pitch size"
                      src={Ball}
                      width={40}
                      height={40}
                    />
                    <Typography color={"#111"} variant="body1" component={"h1"}>
                      Ball
                    </Typography>
                  </div>
                </Button>
              </Grid>
              <Grid
                lg={2.4}
                item>
                <Button
                  className="w-full !border-primary !text-primary"
                  variant="outlined">
                  <div className="flex p-2 gap-2 items-center">
                    <Image
                      alt="Pitch size"
                      src={Shirt}
                      width={40}
                      height={40}
                    />
                    <Typography color={"#111"} variant="body1" component={"h1"}>
                      Shirts
                    </Typography>
                  </div>
                </Button>
              </Grid>
              <Grid
                lg={2.4}
                item>
                <Button
                  className="w-full !border-primary !text-primary"
                  variant="outlined">
                  <div className="flex p-2 gap-2 items-center">
                    <Image
                      alt="Pitch size"
                      src={Shower}
                      width={40}
                      height={40}
                    />
                    <Typography color={"#111"} variant="body1" component={"h1"}>
                      Showers
                    </Typography>
                  </div>
                </Button>
              </Grid>
              <Grid
                lg={2.4}
                item>
                <Button
                  className="w-full !border-primary !text-primary"
                  variant="outlined">
                  <div className="flex p-2 gap-2 items-center">
                    <Image
                      alt="Pitch size"
                      src={Toilet}
                      width={40}
                      height={40}
                    />
                    <Typography color={"#111"} variant="body1" component={"h1"}>
                      Toilets
                    </Typography>
                  </div>
                </Button>
              </Grid>
              <Grid
                lg={2.4}
                item>
                <Button
                  className="w-full !border-primary !text-primary"
                  variant="outlined">
                  <div className="flex p-2 gap-2 items-center">
                    <Image
                      alt="Pitch size"
                      src={Water}
                      width={40}
                      height={40}
                    />
                    <Typography color={"#111"} variant="body1" component={"h1"}>
                      Water
                    </Typography>
                  </div>
                </Button>
              </Grid>
            </>
          }
        </Grid>
        <Grid container>
          <Grid item marginTop={2}>
            {isLoading
              ?
              <Skeleton className="!translate-y-[15px] !mb-1" width={200} animation="wave" />
              :
              <Typography className="translate-y-[15px]" fontSize={20} variant="body2" component="h1">
                Reviews
              </Typography>
            }
            <Image
              alt=""
              src={DividerImg}
            />
          </Grid>
        </Grid>

        <ListReviews pitchId={pitchId} reviews={reviews} />
      </div>
    </Layout >
  );
};

export async function getServerSideProps(res: any) {
  // The query params are set on `res.query`
  const { pitchId } = res.query;
  return {
    props: { pitchId },
  };
}

export default PitchDetail;
