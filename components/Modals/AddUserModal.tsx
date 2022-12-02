import React, { useState } from 'react'
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { NextPage } from 'next';
import { toast } from 'react-toastify';
import axios from 'axios';
import { User } from '../../Models';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Avatar, FormLabel, LinearProgress, Tooltip } from '@mui/material';
import { BiImageAdd } from 'react-icons/bi';
import { uploadBytesResumable, ref, getDownloadURL } from 'firebase/storage'
import { storage } from '../../firebase/config';
import CircularProgressWithLabel from '../ProgessCirle';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';


export interface PropsModal {
    setOpen: any
    open: boolean
}

interface State {
    email: string
    firstName: string
    lastName: string
    password: string
    role: string
    blobAvatar: string
    avatar: any
    avatarUrl: string
    isUploaded : boolean
    isLoading : boolean
}


const AddUserModal: NextPage<PropsModal> = ({ setOpen, open }) => {
    const [state, setState] = useState<State>({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        role: "",
        blobAvatar: "",
        avatar: {},
        avatarUrl: "",
        isUploaded: false,
        isLoading: false
    })
    const { email, firstName, lastName, password, role, blobAvatar, avatar , avatarUrl , isUploaded , isLoading } = state
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const handleAddUser = async () => {
        const { data }: any = await axios.get("/api/users")
        const { users }: any = data
        const checkEmail = users.some((user: User) => user.email === email)

        if (checkEmail) {
            toast.info("Email đã tồn tại", {
                autoClose: 3000,
                theme: "colored",
            });
        } else if (!email || !firstName || !lastName || !password || !role) {
            toast.info("Vui lòng điền đầy đủ thông tin", {
                autoClose: 3000,
                theme: "colored",
            });
        } else {
           if(isUploaded){
            axios.post("/api/users", { email, password, firstName, avatar: avatarUrl, lastName, role })
            toast.success("Thêm mới user thành công", {
                autoClose: 3000,
                theme: "colored",
            });
            setOpen(false)
            setState({ ...state, firstName: "", lastName: "", password: "", email: "", role: "" })
           }
        }
    }

    const handleUploadFiles = async () => {
        setState({...state, isLoading : true})
        const formData = new FormData()
        formData.append("file", avatar)
        formData.append('upload_preset', 'my-uploads');
        const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDNAME}/image/upload`, formData)
        setState({...state , avatarUrl : data.url , isUploaded : true , isLoading : false})
    }

    const onFileChange = (e: any) => {
        let file = e.target.files[0]
        setState({ ...state, blobAvatar: URL.createObjectURL(file), avatar: file })
    }
    return (
        <Dialog fullScreen={fullScreen} open={open} onClose={() => setOpen(false)} fullWidth={true}>
            <DialogTitle>{"Thêm người dùng"}</DialogTitle>
            <DialogContent>
                <TextField
                    value={email}
                    onChange={(e) => setState({ ...state, email: e.target.value })}
                    autoFocus
                    margin="dense"
                    label="Email Address"
                    type="email"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    value={firstName}
                    onChange={(e) => setState({ ...state, firstName: e.target.value })}
                    autoFocus
                    margin="dense"
                    label="First Name"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    value={lastName}
                    onChange={(e) => setState({ ...state, lastName: e.target.value })}
                    autoFocus
                    margin="dense"
                    label="Last Name"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    value={password}
                    onChange={(e) => setState({ ...state, password: e.target.value })}
                    autoFocus
                    margin="dense"
                    type="password"
                    label="Password"
                    fullWidth
                    variant="standard"
                />
                <FormControl variant="standard" className="w-full">
                    <InputLabel id="demo-simple-select-standard-label">Role</InputLabel>
                    <Select
                        value={role}
                        onChange={(e) => setState({ ...state, role: e.target.value })}
                        labelId="demo-simple-select-standard-label"
                        id="demo-simple-select-standard"
                        label="Age"
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        <MenuItem value={"customer"}>Customer</MenuItem>
                        <MenuItem value={"owner"}>Owner</MenuItem>
                        <MenuItem value={"admin"}>Admin</MenuItem>
                    </Select>
                </FormControl>

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
                                <BiImageAdd
                                    className="h-full cursor-pointer text-6xl text-[#1976d2] rounded-full"
                                />
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
            <DialogActions className="bg-gray-100">
                <div className="">
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={isUploaded  ? handleAddUser : handleUploadFiles}>{isUploaded ? "Submit" : "Upload"}</Button>
                </div>
            </DialogActions>
            {isLoading &&
                <div className="absolute top-0 left-0 right-0 ">
                    <LinearProgress />
                </div>
            }
        </Dialog>
    )
}

export default AddUserModal