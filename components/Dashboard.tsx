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
    setOpen: (a: boolean) => void
    isOpenDashboard: boolean
    orders: Order[]
}




const Dashboard: NextPage<Props> = ({ isOpenDashboard, setOpen, orders }) => {
    const dispatch = useDispatch()
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const handleClose = () => {
        setOpen(false)
    }


    const data = orders?.map((order: Order) => {
        return {
            id: order.id,
            type: order.type,
            orderer: order.ordererName,
            owner: order.ownerName,
            status: order.status,
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
                                <TableCell align="center">Trạng thái</TableCell>
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
                                    <TableCell align="right">{item.type === "booking" ? "Sân bóng đá" : "Sản phẩm"}</TableCell>
                                    <TableCell align="right">{item.orderer}</TableCell>
                                    <TableCell align="right">{item.owner}</TableCell>
                                    {item.type === "booking" && item.status === 0 &&  <TableCell className="text-blue-500" align="right">{"Chưa thanh toán"}</TableCell>}
                                    {item.type === "booking" && item.status === 3 &&  <TableCell className="text-primary" align="right">{"Xác nhận đặt sân thành công"}</TableCell>}
                                    {item.type === "booking" && item.status === 4 &&  <TableCell className="text-red-500" align="right">{"Từ chối đặt sân"}</TableCell>}
                                    {item.status === 2 &&  <TableCell className="text-yellow-500" align="right">{"Chờ xác nhận"}</TableCell>}

                                    {item.type === "order" && item.status === 3 &&  <TableCell className="text-primary" align="right">{"Xác nhận đơn hàng thành công"}</TableCell>}
                                    {item.type === "order" && item.status === 4 &&  <TableCell className="text-red-500" align="right">{"Từ chối đơn hàng"}</TableCell>}
                                    {item.type === "order" && item.status === 5 &&  <TableCell className="text-yellow-500" align="right">{"Chờ lấy hàng"}</TableCell>}
                                    {item.type === "order" && item.status === 6 &&  <TableCell className="text-yellow-500" align="right">{"Đang giao"}</TableCell>}
                                    {item.type === "order" && item.status === 7 &&  <TableCell className="text-primary" align="right">{"Giao hàng thành công"}</TableCell>}
                                    {item.type === "order" && item.status === 8 &&  <TableCell className="text-red-500" align="right">{"Từ chối nhận hàng"}</TableCell>}
                                    {item.type === "order" && item.status === 9 &&  <TableCell className="text-primary" align="right">{"Đã hoàn tiền đặt hàng"}</TableCell>}


                                   
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