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
import { ImageList, Tooltip, ImageListItem, FormControl, InputLabel, Select, MenuItem, Grid, FormHelperText } from '@mui/material';
import { GeoPoint } from "firebase/firestore";
import { toast } from 'react-toastify';
import Checkbox from '@mui/material/Checkbox/Checkbox';
import FormGroup from '@mui/material/FormGroup/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import FormLabel from '@mui/material/FormLabel/FormLabel';
import axios from 'axios';
import { RiImageAddFill } from 'react-icons/ri';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import LinearProgress from '@mui/material/LinearProgress';
import { setIsUpdate } from '../../redux/features/isSlice';
import instance from '../../server/db/instance';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';


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

        if (!name || !location || !longitude || !latitude || !size.length) {
            toast.info("Vui l??ng ??i???n ?????y ????? th??ng tin", {
                autoClose: 3000,
                theme: "colored",
            });
        } else if (Math.round(+latitude) > 90 || Math.round(+latitude) < -90) {
            toast.info(`Latitude ph???i l?? m???t s??? gi???a -90 v?? 90, nh??ng nh???n ???????c l?? : ${+latitude}`, {
                autoClose: 3000,
                theme: "colored",
            });
        } else if (Math.round(+longitude) > 180 || Math.round(+longitude) < -180) {
            toast.info(`Longitude ph???i l?? m???t s??? gi???a -180 v?? 180, nh??ng nh???n ???????c l??: ${+longitude}`, {
                autoClose: 3000,
                theme: "colored",
            });
        } else if (!isValidStartTime || !isValidEndTime || !isValidPrice) {
            toast.info("Vui l??ng nh???p ?????y ????? th??ng tin slots", { autoClose: 3000, theme: "colored" })
        } else {
            if (isUploaded && urls.length === pictures.length) {
                instance.post("/pitch", {
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
                toast.success("Th??m s??n th??nh c??ng ", { autoClose: 3000, theme: "colored" })
            } else {
                toast.info("Vui l??ng th??? l???i sau ", { autoClose: 3000, theme: "colored" })
            }

        }

    }



    const handleUploadFiles = async () => {
        if (!pictures.length || !mainPicture.name) {
            toast.info("Vui l??ng ch???n nh???ng b???c ???nh", { autoClose: 3000, theme: "colored" })
        } else {
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
    }


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
            <DialogTitle>{"Th??m s??n b??ng"}</DialogTitle>
            <DialogContent className="flex-col space-y-2">

                <FormControl
                    fullWidth
                    error variant="standard">
                    <TextField
                        value={name}
                        onChange={(e) => setState({ ...state, name: e.target.value })}
                        autoFocus
                        margin="dense"
                        label="T??n s??n"
                        fullWidth
                        variant="standard"
                    />
                    {!name &&
                        <FormHelperText id="component-error-text">Vui l??ng nh???p t??n s??n b??ng</FormHelperText>
                    }
                </FormControl>


                <FormControl
                    fullWidth
                    error variant="standard">
                    <TextField
                        value={location}
                        onChange={(e) => setState({ ...state, location: e.target.value })}
                        autoFocus
                        margin="dense"
                        label="?????a ??i???m"
                        fullWidth
                        variant="standard"
                    />
                    {!location &&
                        <FormHelperText id="component-error-text">Vui l??ng nh???p ?????a ??i???m</FormHelperText>
                    }
                </FormControl>


                <FormControl
                    fullWidth
                    error variant="standard">
                    <TextField
                        value={longitude}
                        onChange={(e) => setState({ ...state, longitude: +e.target.value })}
                        autoFocus
                        margin="dense"
                        type="number"
                        label="Kinh ?????"
                        fullWidth
                        variant="standard"
                    />
                    {!longitude &&
                        <FormHelperText id="component-error-text">Vui l??ng nh???p kinh ?????</FormHelperText>
                    }
                </FormControl>

                <FormControl
                    fullWidth
                    error variant="standard">
                    <TextField
                        value={latitude}
                        onChange={(e) => setState({ ...state, latitude: +e.target.value })}
                        autoFocus
                        margin="dense"
                        type="number"
                        label="V?? ?????"
                        fullWidth
                        variant="standard"
                    />
                    {!latitude &&
                        <FormHelperText id="component-error-text">Vui l??ng nh???p v?? ?????</FormHelperText>
                    }
                </FormControl>



                <FormLabel className="mt-4" component="legend">Size</FormLabel>
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
                <FormLabel className="my-3" component="legend">H??nh ???nh ch??nh</FormLabel>
                <div className="flex !w-full !h-64" title="Main picture">

                    <Tooltip title="Th??m h??nh ???nh">
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
                    <FormLabel className="mt-4" component="legend">H??nh ???nh ph???</FormLabel>

                    <Tooltip title="Th??m h??nh ???nh">
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
                    <Button className="!border-[1px] !border-primary text-primary" variant="outlined" onClick={() => setOpen(false)}>H???y</Button>
                    {isUploaded ?
                        <Button className="!bg-primary flex justify-center items-center space-x-2" variant="contained" onClick={handleSubmit}>
                            <span> Ho??n t???t</span>
                        </Button>
                        :
                        <Button disabled={isLoading} className="!bg-primary flex justify-center items-center space-x-2" variant="contained" onClick={handleUploadFiles}>
                            {isLoading &&
                                <AiOutlineLoading3Quarters className="animate-spin duration-700 ease-linear" />
                            }
                            <span>T???i ???nh</span>
                        </Button>
                    }
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