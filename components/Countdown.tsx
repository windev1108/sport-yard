import { Typography } from '@mui/material'
import { NextPage } from 'next'
import React, { useEffect, memo, useRef, useMemo } from 'react'


interface Props {
    setOtp: (a: number) => void
    setCountdown: (a: number) => void
    countdown: number
}

const Countdown: NextPage<Props> = ({ countdown, setCountdown }) => {

    useEffect(() => {
        let timerId = setTimeout(() => {
            setCountdown(countdown - 1)
        }, 1000)

        return () => {
            clearTimeout(timerId)
        }
    }, [countdown])





    return (
        <Typography textAlign={"center"} variant="body1" component="h1">
            {`Mã OTP của bạn sẽ hết hạn sau ${countdown} giây`}
        </Typography>
    )
}

export default memo(Countdown)