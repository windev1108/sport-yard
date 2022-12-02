import React from "react";
import Pitch from "./Pitch";
import { Container, Grid, Skeleton } from "@mui/material";
import { NextPage } from "next";
import { Pitch as PitchModel } from "../Models";


interface State {
  limit: number;
  pitch: PitchModel[];
  namePitch: string,
  nameDistrict: string,
  nameWard: string
  loading: boolean
}

interface Props {
  pitch: PitchModel[]
  isLoading: boolean
}

const ListPitch: NextPage<Props> = ({ pitch, isLoading }) => {

  return (
    <Container maxWidth={"xl"} className="relative w-full">
      {isLoading ?
        <Grid maxWidth={"xl"} container spacing={2} >
          <Grid item xs={12} md={6} lg={4} >
            <Skeleton variant="rectangular" className="!w-full !h-[20rem]" />
            <div className="flex justify-between">
              <Skeleton className="!w-[50%]" variant="text" />
              <Skeleton className="!w-[20%]" variant="text" />
            </div>
            <Skeleton className="w-full" variant="text" />
            <Skeleton className="w-[30%]" variant="text" />
            <Skeleton className="w-full h-[4rem]" variant="text" />
          </Grid>
          <Grid item xs={12} md={6} lg={4} >
            <Skeleton variant="rectangular" className="!w-full !h-[20rem]" />
            <div className="flex justify-between">
              <Skeleton className="!w-[50%]" variant="text" />
              <Skeleton className="!w-[20%]" variant="text" />
            </div>
            <Skeleton className="w-full" variant="text" />
            <Skeleton className="w-[30%]" variant="text" />
            <Skeleton className="w-full h-[4rem]" variant="text" />
          </Grid>
          <Grid item xs={12} md={6} lg={4} >
            <Skeleton variant="rectangular" className="!w-full !h-[20rem]" />
            <div className="flex justify-between">
              <Skeleton className="!w-[50%]" variant="text" />
              <Skeleton className="!w-[20%]" variant="text" />
            </div>
            <Skeleton className="w-full" variant="text" />
            <Skeleton className="w-[30%]" variant="text" />
            <Skeleton className="w-full h-[4rem]" variant="text" />
          </Grid>
        </Grid>
        :
        <Grid maxWidth={"xl"} container spacing={2} >
          {pitch.map(item => (
            <Grid
              key={item.id}
              item xs={12} md={6} lg={3}>
              <Pitch
                id={item.id}
                name={item.name}
                slots={item.slots}
                location={item.location}
                pictures={item.pictures}
                mainPicture={item.mainPicture}
              />
            </Grid>
          ))}
        </Grid>
      }
      {/* <div className="absolute left-[35%]  bottom-0 w-[30rem]">
        {isLoading ?
          <Skeleton variant="rounded" className="!h-[2.5rem]" />
          :
          <Button
            onClick={handleLimit}
            className="lg:w-full bg-primary hover:!bg-primary"
            variant="contained"
          >
            {limitPitch?.current && limit < limitPitch?.current
              ? "See more"
              : "See less"}
          </Button>
        }
      </div> */}
    </Container>
  );
};



export default ListPitch;
