import React, { useState, useEffect, useRef } from 'react'
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { NextPage } from 'next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { ImageList, Tooltip, ImageListItem, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { GeoPoint } from "firebase/firestore";
import { storage } from "../../firebase/config"
import { toast } from 'react-toastify';
import CircularProgressWithLabel from '../ProgessCirle';
import Checkbox from '@mui/material/Checkbox/Checkbox';
import FormGroup from '@mui/material/FormGroup/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import FormLabel from '@mui/material/FormLabel/FormLabel';
import axios from 'axios';
import { RiImageAddFill } from 'react-icons/ri';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Router from 'next/router';
import LinearProgress from '@mui/material/LinearProgress';
import { setIsUpdate } from '../../redux/features/isSlice';


export interface PropsModal {
    setOpen: any
    open: boolean
}

interface State {
    name: string
    location: string
    longitude: number | string
    latitude: number | string
    slot: number
    size: number[]
    pictures: any[]
    blobPicture: any[]
    blobMainPicture: any
    mainPicture: any
    isUploaded: boolean
    isLoading: boolean
}


interface Slot {
    id: number
    start: string
    end: string
    price: string
}




const AddUserModal: NextPage<PropsModal> = ({ setOpen, open }) => {
    const dispatch = useDispatch()
    const { isUpdated }: any = useSelector<RootState>(state => state.is)
    const { user }: any = useSelector<RootState>(state => state.user)
    const [state, setState] = useState<State>({
        name: "",
        location: "",
        longitude: "",
        latitude: "",
        slot: 0,
        size: [],
        pictures: [],
        blobPicture: [],
        blobMainPicture: "",
        mainPicture: {},
        isUploaded: false,
        isLoading: false
    })
    const formSlotRef = useRef<any>(null)
    const { name, location, longitude, latitude, size, slot, pictures, mainPicture, blobPicture, blobMainPicture, isLoading, isUploaded } = state
    const [urls, setUrls] = useState<any>([])
    const [url, setUrl] = useState<string>("")
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        setState({
            name: "",
            location: "",
            longitude: "",
            latitude: "",
            size: [],
            slot: 0,
            pictures: [],
            blobPicture: [],
            blobMainPicture: "",
            mainPicture: {},
            isLoading: false,
            isUploaded: false
        })
        setUrls([])
    }, [])

    const onFileChange = (e: any) => {
        let files = e.target.files
        let blobs: any = []
        for (let i = 0; i < files.length; i++) {
            blobs.push(URL.createObjectURL(files[i]))
        }
        setState({ ...state, blobPicture: blobs, pictures: files })
    }

    const onFileMainChange = (e: any) => {
        let file = e.target.files[0]
        setState({
            ...state, blobMainPicture: file ? URL.createObjectURL(file) : "", mainPicture: file
        })
    }


    const handleSubmit = async () => {
        let slots: Slot[] = []
        for (let i = 1; i <= slot; i++) {
            slots.push({
                id: i,
                start: formSlotRef.current[`start-${i}`].value,
                end: formSlotRef.current[`end-${i}`].value,
                price: formSlotRef.current[`price-${i}`].value
            })
        }
        const isValidStartTime = slots.every(s => s.start !== "")
        const isValidEndTime = slots.every(s => s.end !== "")
        const isValidPrice = slots.every(s => s.price !== "")

        if (!pictures.length || !blobMainPicture) {
            toast.info("Vui lòng chọn những bức ảnh", { autoClose: 3000, theme: "colored" })
        } else if (!name || !location || !longitude || !latitude || !size.length) {
            toast.info("Vui lòng điền đầy đủ thông tin", {
                autoClose: 3000,
                theme: "colored",
            });
        } else if (Math.round(+latitude) > 90 || Math.round(+latitude) < -90) {
            toast.info(`Latitude phải là một số giữa -90 và 90, nhưng nhận được là : ${+latitude}`, {
                autoClose: 3000,
                theme: "colored",
            });
        } else if (Math.round(+longitude) > 180 || Math.round(+longitude) < -180) {
            toast.info(`Longitude phải là một số giữa -180 và 180, nhưng nhận được là: ${+longitude}`, {
                autoClose: 3000,
                theme: "colored",
            });
        } else if (!isValidStartTime || !isValidEndTime || !isValidPrice) {
            toast.info("Vui lòng nhập đầy đủ thông tin slots", { autoClose: 3000, theme: "colored" })
        } else {
            if (isUploaded && urls.length === pictures.length) {
                axios.post("/api/pitch", {
                    name,
                    location,
                    size,
                    slots,
                    pictures: urls,
                    mainPicture: url,
                    owner: user.id,
                    coordinates: new GeoPoint(+latitude, +longitude),
                })
                setOpen(false)
                dispatch(setIsUpdate(!isUpdated))
                toast.success("Thêm sân thành công ", { autoClose: 3000, theme: "colored" })
            }else{
                toast.info("Vui lòng thử lại sau ", { autoClose: 3000, theme: "colored" })
            }

        }

    }



    const handleUploadFiles = async () => {
        setState({ ...state, isLoading: true })
        Array.from(pictures).map(async (picture) => {
            const formData = new FormData()
            formData.append("file", picture)
            formData.append('upload_preset', 'my-uploads');
            const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDNAME}/image/upload`, formData)
            setUrls((prev: string[]) => [...prev, data.url])
        });
        const formData = new FormData()
        formData.append("file", mainPicture)
        formData.append('upload_preset', 'my-uploads');
        const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDNAME}/image/upload`, formData)
        setUrl(data.url)
        setState({ ...state, isLoading: false, isUploaded: true })
    }

    console.log("Urls :",urls)
    console.log("Url :",url)


    const handleSelect = (e: any) => {
        const checkIsExist = size.some((s: number) => s === +e.target.value)
        if (!checkIsExist) {
            setState({ ...state, size: [...size, +e.target.value] })
        } else {
            const newArr = size.filter(s => s !== +e.target.value)
            setState({ ...state, size: newArr })
        }
    }


    return (
        <Dialog fullScreen={fullScreen} open={open} onClose={() => setOpen(false)} maxWidth="md">
            <DialogTitle>{"Thêm sân bóng"}</DialogTitle>
            <DialogContent className="flex-col space-y-2">

                <TextField
                    value={name}
                    onChange={(e) => setState({ ...state, name: e.target.value })}
                    autoFocus
                    margin="dense"
                    label="Tên sân"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    value={location}
                    onChange={(e) => setState({ ...state, location: e.target.value })}
                    autoFocus
                    margin="dense"
                    label="Địa điểm"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    value={longitude}
                    onChange={(e) => setState({ ...state, longitude: +e.target.value })}
                    autoFocus
                    margin="dense"
                    type="number"
                    label="Longitude"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    value={latitude}
                    onChange={(e) => setState({ ...state, latitude: +e.target.value })}
                    autoFocus
                    margin="dense"
                    type="number"
                    label="Latitude"
                    fullWidth
                    variant="standard"
                />
                <FormLabel className="mt-4" component="legend">Size Sân bóng</FormLabel>
                <FormGroup onChange={handleSelect} className="!flex-row">
                    <FormControlLabel
                        control={
                            <Checkbox value="5" />
                        }
                        label="5"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox value="7" />
                        }
                        label="7"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox value="11" />
                        }
                        label="11"
                    />
                </FormGroup>

                <FormControl className="w-full">
                    <InputLabel id="demo-simple-select-autowidth-label">Slots</InputLabel>
                    <Select
                        labelId="demo-simple-select-autowidth-label"
                        value={slot}
                        onChange={(e) => setState({ ...state, slot: +e.target.value })}
                        label="Slots"
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {[...Array(6).keys()].map((item: number) => (
                            <MenuItem key={item} value={item + 1}>{item + 1}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {slot > 0 &&
                    <form ref={formSlotRef} >
                        <Grid container spacing={2}>
                            {[...Array(slot).keys()].map(item => (
                                <Grid key={item} item xs={6} md={4} lg={4} >
                                    <Button className="!bg-primary w-full" variant="contained">{`Slot ${item + 1}`}</Button>
                                    <Grid container>
                                        <Grid item lg={6}>
                                            <input name={`start-${item + 1}`} className="border-[1px] outline-none border-[#1976d2] text-center !text-sm h-10 w-full cursor-pointer" type="time" min="07:00" max="19:00" required placeholder="Please enter text" />
                                        </Grid>
                                        <Grid item lg={6}>
                                            <input name={`end-${item + 1}`} className="border-[1px] outline-none border-[#1976d2]  text-center  !text-sm h-10 w-full cursor-pointer" type="time" min="07:00" max="19:00" required placeholder="Please enter text" />
                                        </Grid>
                                        <Grid lg={12}>
                                            <input name={`price-${item + 1}`} className="border-[1px] outline-none border-[#1976d2] text-center !text-sm h-10 w-full cursor-pointer" type="number" // the change is here
                                                required placeholder="Enter your price" />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            ))}
                        </Grid>
                    </form>
                }
                <FormLabel className="my-3" component="legend">Hình ảnh chính</FormLabel>
                <div className="flex !w-full !h-64" title="Main picture">

                    <Tooltip title="Thêm hình ảnh">
                        <label
                            onChange={onFileMainChange}
                            htmlFor="mainPicture"
                            className={`cursor-pointer w-full flex justify-center !h-full  border-dashed ${!blobMainPicture && "border-[2px]"} border-black`}
                        >
                            {blobMainPicture ?
                                <img className="!w-full h-full object-cover" src={blobMainPicture} alt="" />
                                :
                                <RiImageAddFill
                                    className="h-full cursor-pointer  w-[4rem]  p-4 text-[#000] rounded-full"
                                />
                            }
                            <input
                                accept="image/*"
                                hidden
                                id="mainPicture"
                                name="img"
                                type="file"
                            />
                        </label>
                    </Tooltip>
                </div>
                <div className="flex justify-between">
                    <FormLabel className="mt-4" component="legend">Hình ảnh phụ</FormLabel>

                    <Tooltip title="Thêm hình ảnh">
                        <label
                            onChange={onFileChange}
                            htmlFor="upload"
                            className="cursor-pointer  rounded-full"
                        >
                            <RiImageAddFill
                                className="h-full cursor-pointer  w-[4rem]  p-4 text-[#000] rounded-full"
                            />
                            <input
                                accept="image/*"
                                hidden
                                multiple
                                id="upload"
                                name="img"
                                type="file"
                            />
                        </label>
                    </Tooltip>
                </div>
                <div className="flex items-center">
                    <div className="flex-1" title="Main picture">
                        <ImageList cols={blobPicture.length >= 3 ? 3 : 2}>
                            {blobPicture?.map((item) => (
                                <ImageListItem key={item}>
                                    <img
                                        src={item}
                                        alt={item}
                                        className="object-cover !h-32"
                                        loading="lazy"
                                    />
                                </ImageListItem>
                            ))}
                        </ImageList>
                    </div>

                </div>

            </DialogContent>
            <DialogActions className="flex items-center  bg-gray-100 w-full">
                <div className="flex space-x-2">
                    <Button className="!bg-[#1976d2] !text-white" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button className="!bg-[#1976d2] !text-white" variant="contained" onClick={isUploaded ? handleSubmit : handleUploadFiles}>{isUploaded ? "Submit" : "Upload"}</Button>
                </div>
            </DialogActions>
            {isLoading &&
                <div className="absolute top-0 left-0 right-0 ">
                    <LinearProgress />
                </div>
            }
        </Dialog >
    )
}

export default AddUserModal