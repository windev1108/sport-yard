import React, { useEffect } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setOpenDashboard, setOpenNotificationDetail } from '../redux/features/isSlice';
import Currency from 'react-currency-formatter';
import { Order } from '../Models';
import { NextPage } from 'next';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import dayjs from 'dayjs';
import currencyFormatter from 'currency-formatter'
import { setIdOrder } from '../redux/features/ordersSlice';




interface Props {
    orders: Order[]
}


interface Data {
    type: string
    total: number;
    tradeCode: number
    orderer: string
    owner: string
    createdAt: string;
}


const Dashboard: NextPage<Props> = ({ orders }) => {
    const dispatch = useDispatch()
    const { isOpenDashboard }: any = useSelector<RootState>(state => state.is)
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const handleClose = () => {
        dispatch(setOpenDashboard(false))
    }


    const data = orders?.map((order: Order) => {
        return {
            id: order.id,
            type: order.type === "booking" ? "Sân bóng đá" : "Sản phẩm",
            orderer: order.ordererName,
            owner: order.ownerName,
            total: currencyFormatter.format(order.total, { code: 'VND' }),
            createdAt: dayjs(order.date).format("DD-MM-YYYY")
        }
    })


    const handleOpenOrderDetail = (id: string) => {
        dispatch(setOpenNotificationDetail(true))
        dispatch(setIdOrder(id))
    }




    return (
        <Dialog
            fullScreen={fullScreen}
            maxWidth={"xl"}
            open={isOpenDashboard}
            onClose={handleClose}
        >
            <DialogTitle textAlign={"center"}>Dashboard</DialogTitle>
            <Divider />
            <DialogContent className="lg:w-[60rem] w-full h-full">
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>STT</TableCell>
                                <TableCell align="right">Loại đơn hàng</TableCell>
                                <TableCell align="right">Người đặt hàng</TableCell>
                                <TableCell align="right">Chủ sản phẩm</TableCell>
                                <TableCell align="right">Đơn giá</TableCell>
                                <TableCell align="right">Ngày đặt hàng</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((item: any, index) => (
                                <TableRow
                                    onClick={() => handleOpenOrderDetail(item.id)}
                                    key={index}
                                    className="hover:bg-gray-200 cursor-pointer"
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="item">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell align="right">{item.type}</TableCell>
                                    <TableCell align="right">{item.orderer}</TableCell>
                                    <TableCell align="right">{item.owner}</TableCell>
                                    <TableCell align="right">{item.total}</TableCell>
                                    <TableCell align="right">{item.createdAt}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>

            <Divider />
            <DialogActions>
                <DialogContentText className="flex py-3 justify-end space-x-2 px-3">
                    <Typography variant="body1" component="span"  >
                        {"Tổng doanh thu :"}
                    </Typography>
                    <Typography variant="body1" component="span" fontWeight={700}>
                        <Currency quantity={+orders.filter((order: Order) => order.status === 3 || order.status === 7).reduce(
                            (previousValue, currentValue) => previousValue + currentValue.total,
                            0
                        )} currency="VND" pattern="##,### !" />
                    </Typography>
                </DialogContentText>
            </DialogActions>
        </Dialog>
    )
}

export default Dashboard