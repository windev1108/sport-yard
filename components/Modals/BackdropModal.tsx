import React from 'react'
import { Backdrop, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Image from 'next/image';

const BackdropModal = () => {
    const { isOpenBackdropModal }: any = useSelector<RootState>(state => state.is)
    return (
        <Backdrop
            className="z-[10000]"
            open={isOpenBackdropModal}
        >
            <Image className=" animate-spin transition-all duration-700" width={80} height={80} src={require("../../assets/images/ball.png")} />
        </Backdrop>
    )
}

export default BackdropModal