import { Badge, Divider, IconButton, Menu, Typography, Tooltip } from '@mui/material'
import React, { useEffect } from 'react'
import { GrTransaction } from 'react-icons/gr';
import { Transaction } from '../../Models';
import Currency from 'react-currency-formatter';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenTransactionDetail } from '../../redux/features/isSlice';
import TransactionImg from '../../assets/images/transaction.png'
import Image from 'next/image';
import { db } from '../../firebase/config';
import { RootState } from '../../redux/store';
import { query, collection, onSnapshot, orderBy } from 'firebase/firestore'
import axios from 'axios';
import { AiOutlineClear } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { setIdTransaction } from '../../redux/features/transactionSlice';
import moment from 'moment';
import { getCookie } from 'cookies-next';
import jwt from 'jsonwebtoken'
import { MdClose } from 'react-icons/md';

interface State {
    transactions: any[]
}
const Transactions = () => {
    const token: any = getCookie("token")
    const data = jwt.decode(token) as { [key: string]: string }
    const dispatch = useDispatch()
    const { user }: any = useSelector<RootState>(state => state.user)
    const [transactionsEl, setTransactionsEl] = React.useState<null | HTMLElement>(null);
    const [state, setState] = React.useState<State>({
        transactions: []
    })

    const { transactions } = state


    useEffect(() => {
        const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"))
        const unsub = onSnapshot(q, (snapshot: any) => {
            const results = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }))
            token && setState({ ...state, transactions: results.filter((t: Transaction) => t.receiverId === data.id || t.senderId === data.id) })
        })
        return unsub
    }, [])


    const handleOpenTransactions = (event: React.MouseEvent<HTMLElement>) => {
        setTransactionsEl(event.currentTarget);
    }
    const handleCloseTransactions = () => {
        setTransactionsEl(null);
    };

    const handleTransactionDetail = (id: string) => {
        dispatch(setOpenTransactionDetail(true))
        dispatch(setIdTransaction(id))
        handleCloseTransactions()
    }


    const handleClearTransactionHistory = () => {
        transactions.forEach(transaction => {
            axios.delete(`/api/transactions/${transaction.id}`)
        })
        toast.success("Clear Transaction history success", { autoClose: 3000, theme: "colored" })
    }


    return (
        <>
            <Tooltip title="Transactions">
                <IconButton
                    onClick={handleOpenTransactions}
                    size="medium"
                    color="inherit"
                >
                    <Badge badgeContent={transactions?.length} color="error">
                        <GrTransaction />
                    </Badge>
                </IconButton>
            </Tooltip>
            {transactions.length ?
                <Menu
                    className="mt-10 mr-6"
                    anchorEl={transactionsEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(transactionsEl)}
                    onClose={handleCloseTransactions}
                >
                    <div className="lg:relative fixed top-0 left-0 right-0 bottom-0 bg-white">
                        <div className="flex justify-between">
                        <div className="flex items-center justify-start px-4">
                            <Typography fontWeight={700} variant="body1" component="h1">
                                Clear
                            </Typography>
                            <IconButton
                                onClick={handleClearTransactionHistory}
                            >
                                <AiOutlineClear className="text-primary" />
                            </IconButton>
                        </div>
                        <IconButton
                            className="lg:!hidden block"
                            onClick={handleCloseTransactions}
                        >
                            <MdClose />
                        </IconButton>
                        </div>
                        <Divider />
                        <div className="relative lg:w-[25rem] w-full lg:max-h-[20rem] overflow-x-hidden !overflow-y-scroll">
                            {transactions.map(((item: Transaction, index: number) => (
                                <div
                                    onClick={() => handleTransactionDetail(item.id)}
                                    key={item.id}>
                                    {index >= 1 &&
                                        <Divider />
                                    }
                                    <div className="w-full hover:bg-gray-200 px-4 py-2 cursor-pointer">
                                        <div className="flex relative  space-x-2">
                                            <Typography fontWeight={700} variant="body1" component="h1">
                                                {item.action?.charAt(0).toUpperCase() + item.action?.slice(1)}
                                            </Typography>
                                            <Typography className={`${item.status === "pending" && "text-yellow-500"} ${item.status === "fulfilled" && "text-primary"} ${item.status === "rejected" && "text-red-500"} `} fontWeight={700} variant="body1" component="h1">
                                                {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                                            </Typography>
                                            <Typography className="absolute top-0 right-0" fontSize={12} variant="body1" component="h1">
                                                {moment(item.timestamp).fromNow()}
                                            </Typography>

                                        </div>
                                        <Typography variant="body1" component="h1">
                                            {`Người gửi : ${item.sender}`}
                                        </Typography>
                                        <Typography variant="body1" component="h1">
                                            {`Người nhận : ${item.receiver}`}
                                        </Typography>
                                        <div className="flex space-x-2">
                                            <Typography variant="body1" component="h1">
                                                {`Giao dịch :`}
                                            </Typography>
                                            {item.status === "pending" &&
                                                <Typography fontWeight={700} variant="body1" component="h1">
                                                    <Currency quantity={item.amount || 0} currency="VND" pattern="##,### !" />
                                                </Typography>
                                            }
                                            {item.status === "rejected" &&
                                                <Typography fontWeight={700} variant="body1" component="h1">
                                                    <Currency quantity={item.amount || 0} currency="VND" pattern="##,### !" />
                                                </Typography>
                                            }
                                            {item.status === "fulfilled" &&
                                                <Typography fontWeight={700} variant="body1" component="h1">
                                                    {
                                                        item.action === "deposit" ? "+" : "-"
                                                    }
                                                    <Currency quantity={item.amount || 0} currency="VND" pattern="##,### !" />
                                                </Typography>
                                            }

                                        </div>
                                        {item.status !== "pending" &&
                                            <div className="flex space-x-2">
                                                <Typography variant="body1" component="h1">
                                                    {`Số dư hiện tại : `}
                                                </Typography>
                                                <Typography fontWeight={700} variant="body1" component="h1">
                                                    <Currency quantity={item.balance} currency="VND" pattern="##,### !" />
                                                </Typography>

                                            </div>
                                        }
                                    </div>

                                </div>
                            )))}
                        </div>
                    </div>
                </Menu>
                :
                <Menu
                    className="mt-10 mr-6 max-h-[20rem] !overflow-y-hidden"
                    id="menu-appbar"
                    anchorEl={transactionsEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(transactionsEl)}
                    onClose={handleCloseTransactions}
                >
                    <div className="w-[20rem]">
                        <Image width="300" height="200" objectFit="contain" src={TransactionImg} />
                        <Typography fontWeight={700} className="text-center" variant="body1" component="h1">
                            No transactions yet
                        </Typography>
                    </div>
                </Menu>
            }
        </>
    )
}

export default Transactions