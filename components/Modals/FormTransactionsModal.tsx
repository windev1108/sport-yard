import React, { useState, useEffect, useMemo } from 'react'
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { NextPage } from 'next';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenBackdropModal, setOpenFormTransaction } from '../../redux/features/isSlice';
import { RootState } from '../../redux/store';
import { FormControl, InputLabel, Select, MenuItem, Grid, Typography, Snackbar, IconButton } from '@mui/material';
import { toast } from 'react-toastify';
import FormHelperText from '@mui/material/FormHelperText';
import axios from 'axios';
import { setAction } from '../../redux/features/transactionSlice';
import { AiFillCopy, AiOutlineClose } from 'react-icons/ai';
import { Bank, User } from '../../Models';
import Currency from 'react-currency-formatter';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { RiErrorWarningLine } from 'react-icons/ri';



interface State {
    banks: Bank[]
    bank: Bank | any
    bankCode: string
    percent: number
    amount: string
    transactionId: number
    transferContent
    : string
}




const FormTransactionsModal: NextPage = () => {
    const dispatch = useDispatch()
    const { isOpenFormTransaction }: any = useSelector<RootState>(state => state.is)
    const { user }: any = useSelector<RootState>((state) => state.user)
    const { action }: any = useSelector<RootState>(state => state.transaction)
    const [state, setState] = useState<State>({
        banks: [],
        bank: {},
        bankCode: "",
        percent: 0,
        amount: "",
        transactionId: 0,
        transferContent: ""
    })
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const { banks, bankCode, bank, transferContent
        , amount, transactionId } = state
    const [openSnackbar, setOpenSnackbar] = useState(false);


    useEffect(() => {
        axios.get(`/api/users/${process.env.NEXT_PUBLIC_ADMIN_ID}`)
            .then(res => setState({ ...state, banks: res.data.banks }))
    }, [])

    const handleSubmit = async () => {
        if (!amount) {
            toast.info("Please enter your amount", { autoClose: 3000, theme: "colored" })
        } else if (action === "deposit" && +amount > 10000000) {
            toast.info("The maximum amount is 10,000,000 ₫", { autoClose: 3000, theme: "colored" })
        } else if (action === "withdraw" && +amount > user.balance) {
            toast.info("The amount has exceeded your balance", { autoClose: 3000, theme: "colored" })
        } else {
            const formData = {
                transactionId,
                action: action === "deposit" ? "deposit" : "withdraw",
                senderId: user.id,
                sender: `${user.firstName} ${user.lastName}`,
                receiverId: process.env.NEXT_PUBLIC_ADMIN_ID,
                receiver: action === "deposit" ? bank.name : "SPOT_YARD",
                amount: +amount,
                status: "pending",
                transferContent,
                bankCode: bank.bankCode,
                bankName: bank.bankName,
                bankAccountNumber: bank.accountNumber,
            }
            dispatch(setOpenBackdropModal(true))
            setTimeout(() => {
                dispatch(setOpenBackdropModal(false))
                dispatch(setOpenFormTransaction(false))
                axios.post('/api/transactions', formData)
                toast.success(action === "deposit" ? "Deposit request sent successfully" : "Withdraw request sent successfully", { autoClose: 3000, theme: "colored" })
            }, 3000)
        }
    }


    useMemo(() => {
        const bankFound = action === "deposit" ? banks?.find((bank: Bank) => bank.bankCode === bankCode) : user.banks?.find((bank: Bank) => bank.bankCode === bankCode)
        const randomId = Math.floor(Math.random() * 900000 + 10000)
        setState({
            ...state, bank: bankFound, transferContent
                : `${action === "deposit" ? "DEPOSIT" : "WITHDRAW"}_SPORTYARD_${randomId}`, transactionId: randomId
        })
    }, [bankCode])



    const handleClose = () => {
        dispatch(setOpenFormTransaction(false))
        dispatch(setAction(""))
    }


    const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    }


    const handleCoppyToClipboard = (value: string) => {
        navigator.clipboard.writeText(value)
        setOpenSnackbar(true)
    }

    const actionSnackbar = (
        <React.Fragment>
            <Button color="secondary" size="small" onClick={handleCloseSnackbar}>
                UNDO
            </Button>
            <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleCloseSnackbar}
            >
                <AiOutlineClose size={12} />
            </IconButton>
        </React.Fragment>
    );


    useEffect(() => {
        console.log("Bank :", bank)
    }, [bank])

    return (
        <>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                message="Coppy success"
                action={actionSnackbar}
            />
            <Dialog
                fullScreen={fullScreen}
                open={isOpenFormTransaction} onClose={handleClose} maxWidth="xl" >
                <DialogTitle>{action === "withdraw" ? "Rút tiền" : "Nạp tiền"}</DialogTitle>
                <DialogContent className="lg:w-[40rem] w-full flex-col space-y-2">
                    <FormControl className="w-full !my-3">
                        <InputLabel id="demo-simple-select-autowidth-label">Ngân hàng</InputLabel>
                        <Select
                            value={bankCode}
                            labelId="demo-simple-select-autowidth-label"
                            onChange={(e) => setState({ ...state, bankCode: e.target.value })}
                            label="Ngân hàng"
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {action === "deposit" ?
                                banks?.map(b => (
                                    <MenuItem key={b.id} value={b.bankCode}>
                                        <Typography variant="body1" component="h1">
                                            {`${b.bankCode} / ${b.bankName}`}
                                        </Typography>
                                    </MenuItem>
                                ))
                                :
                                user.banks?.map((b: Bank) => (
                                    <MenuItem key={b.id} value={b.bankCode}>
                                        <Typography variant="body1" component="h1">
                                            {` ${b.accountNumber} / ${b.bankCode} / Ngân hàng ${b.bankName}`}
                                        </Typography>
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>

                    {bank && action === "deposit" &&
                        <>
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Tên tài khoản : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {bank?.name}
                                    </Typography>
                                </div>
                                <AiFillCopy onClick={() => handleCoppyToClipboard(bank?.name)} className="cursor-pointer text-yellow-400" size={18} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Số tài khoản : `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {bank?.accountNumber}
                                    </Typography>
                                </div>
                                <AiFillCopy onClick={() => handleCoppyToClipboard(bank?.accountNumber)}
                                    className="cursor-pointer text-yellow-400" size={18} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-2">
                                    <Typography variant="body1" component="h1">
                                        {`Nội dung chuyển khoản: `}
                                    </Typography>
                                    <Typography fontWeight={700} variant="body1" component="h1">
                                        {transferContent
                                        }
                                    </Typography>
                                </div>
                                <AiFillCopy onClick={() => handleCoppyToClipboard(transferContent
                                )}
                                    className="cursor-pointer text-yellow-400" size={18} />
                            </div>
                            <div className="flex space-x-2 items-center">
                                <RiErrorWarningLine 
                                size={20}
                                className="text-yellow-600" />
                                <Typography variant="subtitle2" component="h1">
                                    {`Sai nội dung chuyển khoản trừ 10% số lượng giao dịch`}
                                </Typography>
                            </div>
                        </>
                    }
                    <FormControl fullWidth>
                        <TextField error={action === "deposit" ? +amount > 10000000 : +amount > user.balance}
                            value={amount}
                            onChange={e => action === "deposit" ? setState({ ...state, amount: +amount > 10000000 ? "10000000" : e.target.value }) : setState({ ...state, amount: +amount > user.balance ? user.balance : e.target.value })}
                            className="w-full"
                            autoFocus
                            margin="dense"
                            type="number"
                            label="Amount"
                            variant="standard"
                        />

                        <div className="flex justify-between">
                            {amount && action === "deposit" ?
                                + amount > 10000000 ?
                                    <FormHelperText className="translate-x-[-10px]" id="component-error-text">
                                        <Typography variant="body1" component="h1">
                                            The maximum amount is 10,000,000 ₫
                                        </Typography>
                                    </FormHelperText>
                                    :
                                    <FormHelperText className="translate-x-[-10px]" id="component-error-text">
                                        <Currency quantity={+amount} currency="VND" pattern="##,### !" />
                                    </FormHelperText>
                                :
                                + amount > user.balance ?
                                    <FormHelperText className="translate-x-[-10px]" id="component-error-text">Vượt quá số dư của bạn </FormHelperText>
                                    :
                                    <FormHelperText className="translate-x-[-10px]" id="component-error-text">
                                        <Currency quantity={+amount} currency="VND" pattern="##,### !" />
                                    </FormHelperText>
                            }
                            {action === "withdraw" &&
                                <FormHelperText className="flex items-center space-x-1" id="component-error-text">
                                    <Typography fontSize={13} variant="body2" component="h1">
                                        {"Balance : "}
                                    </Typography>
                                    <div>
                                        <Currency quantity={user.balance} currency="VND" pattern="##,### !" />
                                    </div>
                                </FormHelperText>
                            }
                        </div>
                    </FormControl>


                </DialogContent>
                <DialogActions className="flex items-center  bg-gray-100 w-full">
                    <div className="flex space-x-2">
                        <Button variant='outlined' className="!border-[1px] !border-primary !text-gray-500" onClick={() => dispatch(setOpenFormTransaction(false))}>Thoát</Button>
                        <Button variant='contained' className="!bg-primary !text-white" onClick={handleSubmit}>Xác nhận</Button>
                    </div>
                </DialogActions>
            </Dialog >
        </>
    )
}

export default FormTransactionsModal



