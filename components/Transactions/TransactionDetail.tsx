import React, { useState, useEffect, useMemo } from 'react'
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { NextPage } from 'next';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenTransactionDetail } from '../../redux/features/isSlice';
import { RootState } from '../../redux/store';
import { Divider, Skeleton, Typography, IconButton, Tooltip } from '@mui/material';
import axios from 'axios';
import { Transaction, User } from '../../Models';
import Currency from 'react-currency-formatter';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { AiOutlineClose } from 'react-icons/ai';

interface State {
    transaction: Transaction | any
    isLoading: boolean
}


const TransactionDetail: NextPage = () => {
    const dispatch = useDispatch()
    const { isUpdated, isOpenTransactionDetail }: any = useSelector<RootState>(state => state.is)
    const { user }: any = useSelector<RootState>(state => state.user)
    const { action, idTransaction }: any = useSelector<RootState>(state => state.transaction)
    const [state, setState] = useState<State>({
        transaction: {},
        isLoading: true,
    })
    const { transaction, isLoading } = state
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));


    useEffect(() => {
        axios.get(`/api/transactions/${idTransaction}`)
            .then(res => setState({ ...state, transaction: res.data, isLoading: false }))

    }, [user])


    const handleAcceptRequest = async () => {
        const { data }: { data: User } = await axios.get(`/api/users/${transaction.senderId}`)

        if (data?.role === "owner" && !data.isOwner && transaction.amount >= 500000 && transaction.action === "deposit") {
            axios.put(`/api/users/${transaction.senderId}`, {
                balance: data.balance + transaction.amount,
                isOwner: true
            })
        } else {
            axios.put(`/api/users/${transaction.senderId}`, {
                balance: transaction.action === "deposit" ? data.balance + transaction.amount : data.balance - transaction.amount,
            })
        }

        axios.put(`/api/transactions/${idTransaction}`, {
            receiverId: transaction.senderId,
            senderId: transaction.receiverId,
            status: "fulfilled",
            sender: "SPORT-YARD",
            receiver: transaction.sender,
            amount: transaction.amount,
            transactionId: transaction.transactionId,
            balance: transaction.action === "deposit" ? data.balance + transaction.amount : data.balance - transaction.amount
        })
        dispatch(setOpenTransactionDetail(false))
    }

    const handleRejectRequest = () => {
        axios.put(`/api/transactions/${idTransaction}`, {
            receiverId: transaction.senderId,
            senderId: transaction.receiverId,
            status: "rejected",
            sender: "SPORT-YARD",
            receiver: transaction.sender,
            transactionId: transaction.transactionId,
        })
        dispatch(setOpenTransactionDetail(false))
    }

    const handleClose = () => {
        dispatch(setOpenTransactionDetail(false))
    }


    return (
        <>

            <Dialog fullScreen={fullScreen} open={isOpenTransactionDetail} onClose={handleClose} maxWidth="xl" >
                {isLoading ?
                    <Skeleton variant="text" className="py-[32px] mx-[24px]" width={180} height={50} />
                    :
                    <DialogTitle>
                        <Typography fontWeight={700} variant="body1" component="h1">Transaction detail</Typography>
                        <IconButton
                            className="absolute top-1 right-0"
                            onClick={handleClose}
                        >
                            <AiOutlineClose size={20} />
                        </IconButton>
                    </DialogTitle>

                }
                <Divider />
                <DialogContent className="lg:w-[40rem] w-full">
                    {isLoading ?
                        <Skeleton variant="text" className="!p-0" width={200} height={25} />
                        :
                        <div className="flex space-x-2">
                            <Typography variant="body1" component="h1">
                                {`Loại Giao dịch : `}
                            </Typography>
                            <Typography fontWeight={700} variant="body1" component="h1">
                                {`${transaction?.action?.charAt(0).toUpperCase() + transaction?.action?.slice(1)}`}
                            </Typography>
                        </div>
                    }
                    {isLoading ?
                        <Skeleton variant="text" className="!p-0" width={140} height={25} />
                        :
                        <div className="flex space-x-2">
                            <Typography variant="body1" component="h1">
                                {`Trạng thái : `}
                            </Typography>
                            <Typography className={`${transaction.status === "pending" && "text-yellow-500"} ${transaction.status === "fulfilled" && "text-primary"} ${transaction.status === "rejected" && "text-red-500"}`} fontWeight={700} variant="body1" component="h1">
                                {`${transaction?.status?.charAt(0).toUpperCase() + transaction?.status?.substring(1)}`}
                            </Typography>
                        </div>
                    }

                    {isLoading ?
                        <Skeleton variant="text" className="!p-0" width={180} height={25} />
                        :
                        <div className="flex space-x-2">
                            <Typography variant="body1" component="h1">
                                {`Người gửi : `}
                            </Typography>
                            <Typography fontWeight={700} variant="body1" component="h1">
                                {`${transaction?.sender}`}
                            </Typography>
                        </div>
                    }

                    {isLoading ?
                        <Skeleton variant="text" className="!p-0" width={180} height={25} />
                        :
                        <div className="flex space-x-2">
                            <Typography variant="body1" component="h1">
                                {`Người nhận : `}
                            </Typography>
                            <Typography fontWeight={700} variant="body1" component="h1">
                                {transaction?.receiver}
                            </Typography>
                        </div>
                    }
                    {user.role === 'admin' &&
                        <div className="flex space-x-2">
                            <Typography variant="body1" component="h1">
                                {`Tên ngân hàng : `}
                            </Typography>
                            <Typography fontWeight={700} variant="body1" component="h1">
                                {` ${transaction?.bankCode} / Ngân hàng ${transaction?.bankName}`}
                            </Typography>
                        </div>
                    }
                    {user.role === 'admin' &&
                        <div className="flex space-x-2">
                            <Typography variant="body1" component="h1">
                                {`Số tài khoản : `}
                            </Typography>
                            <Typography fontWeight={700} variant="body1" component="h1">
                                {` ${transaction.bankAccountNumber}`}
                            </Typography>
                        </div>
                    }

                    {isLoading ?
                        <Skeleton variant="text" className="!p-0" width={180} height={25} />
                        :
                        <div className="flex space-x-2">
                            <Typography variant="body1" component="h1">
                                {`Giao dịch :`}
                            </Typography>
                            {transaction.status === "pending" &&
                                <Typography fontWeight={700} variant="body1" component="h1">
                                    <Currency quantity={transaction.amount || 0} currency="VND" pattern="##,### !" />
                                </Typography>
                            }
                            {transaction.status === "rejected" &&
                                <Typography fontWeight={700} variant="body1" component="h1">
                                    <Currency quantity={transaction.amount || 0} currency="VND" pattern="##,### !" />
                                </Typography>
                            }
                            {transaction.status === "fulfilled" &&
                                <Typography fontWeight={700} variant="body1" component="h1">
                                    {
                                        transaction.action === "deposit" ? "+" : "-"
                                    }
                                    <Currency quantity={transaction.amount || 0} currency="VND" pattern="##,### !" />
                                </Typography>
                            }

                        </div>
                    }

                    {isLoading ?
                        <Skeleton variant="text" className="!p-0" width={220} height={25} />
                        :
                        transaction.status !== "pending" &&
                        <div className="flex space-x-2">
                            <Typography variant="body1" component="h1">
                                {`Số dư hiện tại : `}
                            </Typography>
                            <Typography fontWeight={700} variant="body1" component="h1">
                                <Currency quantity={transaction.balance || 0} currency="VND" pattern="##,### !" />
                            </Typography>
                        </div>
                    }

                    {transaction.action === "deposit" &&
                        <div className="flex space-x-2">
                            <Typography variant="body1" component="h1">
                                {`Nội dung chuyển khoản  : `}
                            </Typography>
                            <Typography fontWeight={700} variant="body1" component="h1">
                                {transaction.transferContent}
                            </Typography>
                        </div>
                    }

                    {isLoading ?
                        <Skeleton variant="text" className="!p-0" width={180} height={25} />
                        :
                        <div className="flex space-x-2">
                            <Typography variant="body1" component="h1">
                                {`Trading code  : `}
                            </Typography>
                            <Typography fontWeight={700} variant="body1" component="h1">
                                {transaction.transactionId}
                            </Typography>
                        </div>
                    }
                    {isLoading ?
                        <Skeleton variant="text" className="!p-0" width={200} height={25} />
                        :
                        <div className="flex space-x-2">
                            <Typography variant="body1" component="h1">
                                {`Thời gian : `}
                            </Typography>
                            <Typography fontWeight={700} variant="body1" component="h1">
                                {new Date(transaction.timestamp).toLocaleString()}
                            </Typography>
                        </div>
                    }
                </DialogContent>
                {user.role === "admin" && transaction.status === "pending" &&
                    <DialogActions className="flex items-center  bg-gray-100 w-full">
                        <div className="flex space-x-2">
                            <Button variant='outlined' className="!bg-red-600 !text-white" onClick={handleRejectRequest}>Reject</Button>
                            <Button className="!bg-primary !text-white" onClick={handleAcceptRequest}>Accept</Button>
                        </div>
                    </DialogActions>
                }
            </Dialog >
        </>
    )
}

export default TransactionDetail



