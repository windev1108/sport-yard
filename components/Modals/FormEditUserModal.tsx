import React, { useEffect, useRef, useState } from 'react'
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { NextPage } from 'next';
import { Avatar, FormControl, Grid, IconButton, InputLabel, MenuItem, Select } from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenFormEditUser } from '../../redux/features/isSlice';
import { RootState } from '../../redux/store';
import { FormLabel, Tooltip } from '@mui/material';
import { deepOrange } from '@mui/material/colors';
import { banking } from '../../utils/helper';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa'
import { AiOutlineMinusCircle, AiOutlinePlusCircle } from 'react-icons/ai';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import LinearProgress from '@mui/material/LinearProgress';
import instance from '../../server/db/instance';



interface State {
    firstName: string
    lastName: string
    email: string
    password: string
    address: string
    bankSlot: number,
    role: string
    blobAvatar: string
    avatarUrl: string
    avatar: any
    phone: string
    banks: any[]
    isShowPassword: boolean
    isLoading: boolean
    isUploaded: boolean
}


const FormEditUserModal: NextPage = () => {
    const dispatch = useDispatch()
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const { isOpenFormEditUser }: any = useSelector<RootState>(state => state.is)
    const { user, idEditing }: any = useSelector<RootState>(state => state.user)
    const formSlotRef = useRef<any>(null)
    const [state, setState] = useState<State>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        address: "",
        bankSlot: 0,
        banks: [],
        role: "",
        phone: "",
        blobAvatar: "",
        avatarUrl: "",
        avatar: {},
        isShowPassword: false,
        isLoading: false,
        isUploaded: false
    })
    const { email, firstName, lastName, password, role, blobAvatar, avatar, avatarUrl, bankSlot, banks, phone, address, isLoading, isUploaded, isShowPassword } = state

    useEffect(() => {
        instance.get(`/users/${idEditing}`)
            .then(res => setState({
                ...state,
                firstName: res.data.firstName,
                lastName: res.data.lastName,
                email: res.data.email,
                address: res.data?.address,
                banks: res.data?.banks,
                phone: res.data.phone ? res.data.phone : "",
                bankSlot: res.data.banks ? res.data.banks?.length : 0,
                password: res.data.password,
                avatar: res.data.avatar,
                role: res.data.role
            }))
    }, [idEditing])




    const handleIncreaseBankSlot = () => {
        if (bankSlot < 6) {
            setState({ ...state, bankSlot: bankSlot + 1 })
        } else {
            setState({ ...state, bankSlot: 6 })
            toast.info("Can't add more than 6 banks", { autoClose: 3000, theme: "colored" })
        }

    }

    const handleReduceBankSlot = () => {
        setState({ ...state, bankSlot: bankSlot <= 0 ? 0 : bankSlot - 1 })
    }


    const handleSubmit = () => {
        let banks: any[] = []
        for (let i = 1; i <= bankSlot; i++) {
            const bankName = banking.find(bank => bank.bankCode === formSlotRef.current[`bank-code-${i}`].value)?.nameVN
            banks.push({
                id: i,
                name: formSlotRef.current[`name-account-${i}`].value,
                bankCode: formSlotRef.current[`bank-code-${i}`].value,
                accountNumber: formSlotRef.current[`account-number-${i}`].value,
                bankName
            })
        }
        const isValidNameAccount = banks.every(s => s.name !== "")
        const isValidBankCode = banks.every(s => s.bankCode !== "")
        const isValidAccountNumber = banks.every(s => s.accountNumber !== "")


        if (!firstName || !lastName || !email || !password || !role) {
            toast.info("Please complete all information", { autoClose: 3000, theme: "colored" })
        } else if (!isValidNameAccount || !isValidBankCode || !isValidAccountNumber) {
            toast.info("Please complete all information bank account", { autoClose: 3000, theme: "colored" })
        } else if (phone && phone.length > 12 || phone.length < 9) {
            toast.info("Phone number invalid", { autoClose: 3000, theme: "colored" })
        } else if (!blobAvatar) {
            instance.put(`/users/${idEditing}`, {
                email, password, firstName, banks, lastName, role, phone: +phone, address
            })
            toast.success("Cập nhật thông tin thành công", {
                autoClose: 3000,
                theme: "colored",
            });
            dispatch(setOpenFormEditUser(false))
            setState({ ...state, firstName: "", lastName: "", blobAvatar: "", avatar: "", password: "", email: "", role: "", phone: "", address: "" })
        }
        else {
            if (isUploaded) {
                instance.put(`/users/${idEditing}`, { email, password, firstName, banks, phone: +phone, avatar: avatarUrl, lastName, role, address })
                toast.success("Cập nhật thông tin thành công", {
                    autoClose: 3000,
                    theme: "colored",
                });
                dispatch(setOpenFormEditUser(false))
                setState({ ...state, firstName: "", lastName: "", blobAvatar: "", avatar: {}, phone: "", password: "", email: "", role: "", address: "" })
            } else {
                toast.info("Vui lòng thử lại sau", {
                    autoClose: 3000,
                    theme: "colored",
                });
            }
        }
    }


    const handleUploadFiles = async () => {
        setState({ ...state, isLoading: true })
        const formData = new FormData()
        formData.append("file", avatar)
        formData.append('upload_preset', 'my-uploads');
        const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDNAME}/image/upload`, formData)
        setState({ ...state, avatarUrl: data.url, isUploaded: true, isLoading: false })
    }

    const onFileChange = (e: any) => {
        let file = e.target.files[0]
        setState({ ...state, blobAvatar: file ? URL.createObjectURL(file) : "", avatar: file })
    }

    return (
        <Dialog fullScreen={fullScreen} open={isOpenFormEditUser} onClose={() => dispatch(setOpenFormEditUser(false))} fullWidth={true}>
            <DialogTitle>{"Sửa thông tin"}</DialogTitle>
            <DialogContent className="flex-col space-y-2">
                <TextField
                    value={email}
                    onChange={(e) => setState({ ...state, email: e.target.value })}
                    focused={email ? true : false}
                    autoFocus
                    margin="dense"
                    type="email"
                    disabled={user.role !== "admin"}
                    label="Email"
                    fullWidth
                    variant="standard"
                />

                <TextField
                    value={firstName}
                    onChange={(e) => setState({ ...state, firstName: e.target.value })}
                    focused={firstName ? true : false}
                    margin="dense"
                    label="First Name"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    value={lastName}
                    onChange={(e) => setState({ ...state, lastName: e.target.value })}
                    focused={lastName ? true : false}
                    autoFocus
                    margin="dense"
                    label="Last Name"
                    fullWidth
                    variant="standard"
                />
                <div className="relative flex w-full items-center">
                    <TextField
                        value={password}
                        onChange={(e) => setState({ ...state, password: e.target.value })}
                        focused={password ? true : false}
                        autoFocus
                        type={isShowPassword ? "text" : "password"}
                        margin="dense"
                        label="Password"
                        fullWidth
                        variant="standard"
                    />
                    <IconButton
                        onClick={() => setState({ ...state, isShowPassword: !isShowPassword })}
                        className="absolute right-0" >
                        {isShowPassword ?
                            <FaRegEye size={22} className="text-gray-700" />
                            :
                            <FaRegEyeSlash size={22} className="text-gray-700" />
                        }
                    </IconButton>
                </div>
                <TextField
                    value={address}
                    onChange={(e) => setState({ ...state, address: e.target.value })}
                    focused={address ? true : false}
                    autoFocus
                    margin="dense"
                    label="Address"
                    fullWidth
                    variant="standard"
                />

                <div className="flex space-x-3 border-b-[2px] border-gray-400  p-2">
                    <span className="border-r-[1px] border-gray-200">+84</span>
                    <input value={phone} onChange={e => setState({ ...state, phone: e.target.value })} className="w-full outline-none bg-transparent" placeholder="Enter your phone number" type="number" />
                </div>

                {user.role === 'admin' &&
                    <FormControl fullWidth className="!mt-6">
                        <InputLabel id="demo-simple-select-label">Role</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={role}
                            label="Age"
                            onChange={(e: any) => setState({ ...state, role: e.target.value })}
                        >
                            <MenuItem value={"customer"}>Customer</MenuItem>
                            <MenuItem value={"owner"}>Owner</MenuItem>
                            <MenuItem value={"admin"}>Admin</MenuItem>
                        </Select>
                    </FormControl>
                }
                <div className="flex justify-between items-center pt-3">
                    <FormLabel className="" component="legend">Method Payment</FormLabel>
                    <div className="flex">
                        <IconButton
                            onClick={handleReduceBankSlot}
                        >
                            <AiOutlineMinusCircle size={30} />
                        </IconButton>
                        <IconButton
                            onClick={handleIncreaseBankSlot}
                        >
                            <AiOutlinePlusCircle size={30} />
                        </IconButton>
                    </div>
                </div>

                {bankSlot > 0 &&
                    <form ref={formSlotRef} >
                        <Grid container spacing={2}>
                            {!banks?.length || banks.length < bankSlot ?
                                [...Array(bankSlot).keys()].map((item: any, index: number) => (
                                    <Grid key={index} item xs={6} md={4} lg={6} >
                                        <Grid container>
                                            <FormControl fullWidth className="h-12">
                                                <InputLabel className="">Choose a bank</InputLabel>
                                                <Select
                                                    name={`bank-code-${index + 1}`}
                                                    defaultValue={item.bankCode}
                                                    className="h-full !p-0"
                                                    label="Choose a bank"
                                                >
                                                    <MenuItem value="">None</MenuItem>
                                                    {banking.map((bank, index) => (
                                                        <MenuItem key={index} value={bank.bankCode}>{`${bank.bankCode} / ${bank.nameVN}`}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <Grid lg={12}>
                                                <input defaultValue={item.name} name={`name-account-${index + 1}`} className="border-[1px] border-gray-300 outline-none  text-center !text-sm h-10 w-full cursor-pointer placeholder:text-secondary text-secondary !font-semibold"  // the change is here
                                                    required placeholder="Account name" />
                                                <input defaultValue={item.accountNumber} name={`account-number-${index + 1}`} className="border-[1px] border-gray-300 outline-none  text-center !text-sm h-10 w-full cursor-pointer placeholder:text-secondary text-secondary !font-semibold" type="number" // the change is here
                                                    required placeholder="Account number" />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                ))
                                :
                                banks.slice(0, bankSlot).map((item: any, index: number) => (
                                    <Grid key={index} item xs={6} md={4} lg={6} >
                                        <Grid container>
                                            <FormControl fullWidth className="h-12">
                                                <InputLabel className="">Choose a bank</InputLabel>
                                                <Select
                                                    name={`bank-code-${index + 1}`}
                                                    defaultValue={item.bankCode}
                                                    className="h-full !p-0"
                                                    label="Choose a bank"
                                                >
                                                    <MenuItem value="">None</MenuItem>
                                                    {banking.map((bank, index) => (
                                                        <MenuItem key={index} value={bank.bankCode}>{`${bank.bankCode} / ${bank.nameVN}`}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <Grid lg={12}>
                                                <input defaultValue={item.name} name={`name-account-${index + 1}`} className="border-[1px] placeholder:text-secondary border-gray-300 outline-none  text-center !text-sm h-10 w-full cursor-pointer"  // the change is here
                                                    required placeholder="Name account" />
                                                <input defaultValue={item.accountNumber} name={`account-number-${index + 1}`} className="border-[1px] placeholder:text-secondary border-gray-300 outline-none  text-center !text-sm h-10 w-full cursor-pointer" type="number" // the change is here
                                                    required placeholder="Account number" />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                ))
                            }
                        </Grid>
                    </form>
                }




                <FormLabel className="translate-y-4" component="legend">Avatar</FormLabel>
                <div className="flex justify-center items-center">
                    <Tooltip title="Add Avatar">
                        <label
                            onChange={onFileChange}
                            htmlFor="avatar"
                            className="w-56 rounded-full cursor-pointer flex justify-center !h-56  border-dashed border-[1px] border-black"
                        >
                            {blobAvatar ?
                                <Avatar alt="Avatar" className="!w-full !h-full" src={blobAvatar} />
                                :
                                <Avatar
                                    src={avatar ?? ""} className="!w-full !h-full !text-6xl" sx={{ bgcolor: deepOrange[500] }}>{firstName.substring(0, 1)}</Avatar>
                            }
                            <input
                                accept="image/*"
                                hidden
                                id="avatar"
                                name="img"
                                type="file"
                            />
                        </label>
                    </Tooltip>
                </div>
            </DialogContent>
            <DialogActions className="flex  items-center  bg-gray-100 w-full">
                <Button variant="outlined" className="hover:border-primary border-primary text-primary" onClick={() => dispatch(setOpenFormEditUser(false))}>Cancel</Button>
                <Button className="!bg-primary !text-white" variant="contained" onClick={isUploaded || !blobAvatar ? handleSubmit : handleUploadFiles}>{isUploaded || !blobAvatar ? "Submit" : "Upload"}</Button>
            </DialogActions>
            {isLoading &&
                <div className="absolute top-0 left-0 right-0 ">
                    <LinearProgress />
                </div>
            }
        </Dialog >
    )
}

export default FormEditUserModal