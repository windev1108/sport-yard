import { Container, Grid, Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { BiCurrentLocation } from "react-icons/bi";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Area from "./Area";

const AreaRow = () => {
  const { isLoading }: any = useSelector<RootState>(state => state.is)
  const [scrollY, setScrollY] = useState(0)

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
    <Container maxWidth="lg">
      <Grid className={`${scrollY > 1800 ? "translate-y-0 opacity-100-" : "translate-y-[100%] opacity-0"} transition-all duration-1000 ease-in-out delay-300`} container justifyContent={"center"}>
        <Grid item >
          {isLoading ?
            <Skeleton variant="text" className="mt-4 h-[4rem] w-[20rem]" />
            :
            <Grid container columnGap={1} marginTop={4}>
              <Grid item>
                <BiCurrentLocation className="text-3xl text-primary" />
              </Grid>
              <Grid item>
                <h1 className="uppercase text-3xl"> NEARBY AREAS</h1>
              </Grid>
              <Grid item>
                <BiCurrentLocation className="text-3xl text-primary" />
              </Grid>
            </Grid>
          }
        </Grid>
      </Grid>
      <Grid className={`${scrollY > 1800 ? "translate-y-0 opacity-100-" : "translate-y-[100%] opacity-0"} transition-all duration-1000 ease-in-out delay-300`} container spacing={2} >
        {isLoading ?
          <Grid item lg={3} marginTop={6}>
            <Grid container columnSpacing={8}>
              <Grid item lg={6}>
                <Skeleton variant="rounded" className="h-[100px] w-[10rem]" />
              </Grid>
              <Grid item lg={6}>
                <Skeleton variant="text" className="w-[4rem] h-[2rem]" />
                <Skeleton variant="text" className="w-[2rem] h-[2rem]" />
              </Grid>
            </Grid>
          </Grid>
          :
          <Area
            image="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/UBND_ph%C6%B0%E1%BB%9Dng_B%C3%ACnh_Thu%E1%BA%ADn%2C_H%E1%BA%A3i_Ch%C3%A2u%2C_%C4%90%C3%A0_N%E1%BA%B5ng.jpeg/420px-UBND_ph%C6%B0%E1%BB%9Dng_B%C3%ACnh_Thu%E1%BA%ADn%2C_H%E1%BA%A3i_Ch%C3%A2u%2C_%C4%90%C3%A0_N%E1%BA%B5ng.jpeg"
            name="Hải châu"
            amount={21}
          />
        }
        {isLoading ?
          <Grid item lg={3} marginTop={6}>
            <Grid container columnSpacing={8}>
              <Grid item lg={6}>
                <Skeleton variant="rounded" className="h-[100px] w-[10rem]" />
              </Grid>
              <Grid item lg={6}>
                <Skeleton variant="text" className="w-[4rem] h-[2rem]" />
                <Skeleton variant="text" className="w-[2rem] h-[2rem]" />
              </Grid>
            </Grid>
          </Grid>
          :
          <Area
            image="https://upload.wikimedia.org/wikipedia/commons/2/24/Trung_t%C3%A2m_H%C3%A0nh_ch%C3%ADnh_Li%C3%AAn_Chi%E1%BB%83u%2C_%C4%90%C3%A0_N%E1%BA%B5ng.jpeg"
            name="Liên Chiểu"
            amount={15}
          />
        }
        {isLoading ?
          <Grid item lg={3} marginTop={6}>
            <Grid container columnSpacing={8}>
              <Grid item lg={6}>
                <Skeleton variant="rounded" className="h-[100px] w-[10rem]" />
              </Grid>
              <Grid item lg={6}>
                <Skeleton variant="text" className="w-[4rem] h-[2rem]" />
                <Skeleton variant="text" className="w-[2rem] h-[2rem]" />
              </Grid>
            </Grid>
          </Grid> :
          <Area
            image="https://cdn.vntrip.vn/cam-nang/wp-content/uploads/2017/08/Ngu-Hanh-Son-e1502127139914.png"
            name="Ngũ Hành Sơn"
            amount={6}
          />
        }
        {isLoading ?
          <Grid item lg={3} marginTop={6}>
            <Grid container columnSpacing={8}>
              <Grid item lg={6}>
                <Skeleton variant="rounded" className="h-[100px] w-[10rem]" />
              </Grid>
              <Grid item lg={6}>
                <Skeleton variant="text" className="w-[4rem] h-[2rem]" />
                <Skeleton variant="text" className="w-[2rem] h-[2rem]" />
              </Grid>
            </Grid>
          </Grid> :
          <Area
            image="https://upload.wikimedia.org/wikipedia/commons/a/ab/UBND_qu%E1%BA%ADn_Thanh_Kh%C3%AA%2C_%C4%90%C3%A0_N%E1%BA%B5ng.jpeg"
            name="Thanh khê"
            amount={8}
          />
        }
      </Grid>
    </Container>
  );
};

export default AreaRow;
