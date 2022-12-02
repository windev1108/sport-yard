import { Grid } from '@mui/material'
import { NextPage } from 'next'
import React from 'react'

interface Props {
    image: string,
    name: string,
    amount: number
}

const Area : NextPage<Props> = ({
    image,
    name,
    amount
}) => {
  return (
    <Grid item lg={3} marginTop={6}>
      <div className="rounded-3xl">
          <div className="flex gap-3 items-center">
            <img
              className="object-cover h-[100px] w-[100px] rounded-3xl"
              src={image}
              alt="green iguana"
            />
            <div>
              <p className="text-lg font-semibold">{name}</p>
              <p className="text-sm text-gray-500">{amount}</p>
            </div>
          </div>
      </div>
    </Grid>
  )
}

export default Area