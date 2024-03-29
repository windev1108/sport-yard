import React, { useEffect, useRef, useState } from 'react'
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { NextPage } from 'next';
import { GeoPoint } from 'firebase/firestore';
import { ImageList, ImageListItem, InputLabel, FormControl, Select, MenuItem, Grid, LinearProgress } from '@mui/material';
import { RiImageAddFill } from 'react-icons/ri'
import { toast } from 'react-toastify';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setIsUpdate } from '../../redux/features/isSlice';
import { RootState } from '../../redux/store';
import { Checkbox, FormControlLabel, FormGroup, FormLabel, Tooltip } from '@mui/material';
import { pitchSize } from '../../utils/helper';
import { Slot } from '../../Models'
import instance from '../../server/db/instance';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export interface PropsModal {
    setOpen: any
    open: boolean
    id: string
}

interface State {
    name: string
    location: string
    size: string[]
    slot: number
    slots: Slot[]
    pictures: any[]
    mainPicture: any
    blobPicture: string[]
    blobMainPicture: string
    longitude: number | string
    latitude: number | string
    isLoading: boolean
    isUploadedPictures: boolean
    isUploadedMainPicture: boolean
}

interface CloudinaryUrls {
    mainPicture: string
    subPictures: string[]
}

const FormEditPitchModal: NextPage<PropsModal> = ({ id, setOpen, open }) => {
    const dispatch = useDispatch()
    const { isUpdated }: any = useSelector<RootState>(state => state.is)
    const { user }: any = useSelector<RootState>(state => state.user)
    const [state, setState] = useState<State>({
        name: "",
        location: "",
        size: [],
        slot: 0,
        slots: [],
        pictures: [],
        mainPicture: {},
        blobPicture: [],
        blobMainPicture: "",
        longitude: "",
        latitude: "",
        isLoading: false,
        isUploadedPictures: false,
        isUploadedMainPicture: false
    })
    const formSlotRef = useRef<any>(null)
    const { name, size, slot, slots, pictures, mainPicture, blobPicture, blobMainPicture, location, longitude, latitude, isUploadedPictures, isUploadedMainPicture, isLoading } = state


    useEffect(() => {
        instance.get(`/pitch/${id}`)
            .then(res => {
                setState({
                    ...state,
                    name: res.data.name,
                    location: res.data.location,
                    blobPicture: res.data?.pictures,
                    blobMainPicture: res.data.mainPicture,
                    size: [],
                    slot: res.data.slots?.length,
                    slots: res.data.slots,
                    longitude: res.data.coordinates?.longitude,
                    latitude: res.data.coordinates?.latitude,
                })
            })
    }, [id])





    const handleSelect = (e: any) => {
        const checkIsExist = size.some((s: string | number) => s === e.target.value)
        if (!checkIsExist) {
            setState({ ...state, size: [...size, e.target.value] })
        } else {
            const newArr = size.filter(s => s !== e.target.value)
            setState({ ...state, size: newArr })
        }
    }


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
            ...state, blobMainPicture: URL.createObjectURL(file), mainPicture: file
        })
    }


    const handleSubmit = () => {
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
        if (!name || !size.length || !location || !longitude || !latitude) {
            toast.info("Vui lòng điền đầy đủ thông tin", {
                autoClose: 3000,
                theme: "colored",
            });
        } else if (!isValidStartTime && !isValidEndTime && !isValidPrice) {
            toast.info("Vui lòng điền đầy đủ thông tin các slot", { autoClose: 3000, theme: "colored" })
        } else if (!isUploadedPictures && !isUploadedMainPicture) {
            instance.put(`/pitch/${id}`, {
                name,
                location,
                size,
                slots,
                coordinates: new GeoPoint(+latitude, +longitude),
            },)
            dispatch(setIsUpdate(!isUpdated))
            setOpen(false)
            toast.success("Cập nhật sân bóng thành công", { autoClose: 3000, theme: "colored" })
        } else {
            setState({ ...state, isLoading: true })
            handleUploadFiles()
                .then((res: CloudinaryUrls) => {
                    instance.put(`/pitch/${id}`, {
                        name,
                        location,
                        size,
                        slots,
                        pictures: res.subPictures.length > 0 ? res.subPictures : blobPicture,
                        mainPicture: res.mainPicture ? res.mainPicture : blobMainPicture,
                        coordinates: new GeoPoint(+latitude, +longitude),
                    },)
                    setOpen(false)
                    dispatch(setIsUpdate(!isUpdated))
                    toast.success("Cập nhật sân bóng thành công", { autoClose: 3000, theme: "colored" })
                })
        }
    }


    const handleUploadFiles = async () => {
        const cloudinaryUrls: CloudinaryUrls = {
            mainPicture: "",
            subPictures: [],
        }
        if (mainPicture.name) {
            const formData = new FormData()
            formData.append("file", mainPicture)
            formData.append('upload_preset', 'my-uploads');
            const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDNAME}/image/upload`, formData)
            cloudinaryUrls.mainPicture = data.url
        }
        if (pictures.length) {
            Array.from(pictures).map(async (picture) => {
                setState({ ...state, isLoading: true })
                const formData = new FormData()
                formData.append("file", picture)
                formData.append('upload_preset', 'my-uploads');
                const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDNAME}/image/upload`, formData)
                cloudinaryUrls.subPictures = [...cloudinaryUrls.subPictures, data.url]
            });
        }
        return new Promise<any>((resolve, reject) => {
            resolve(cloudinaryUrls)
        })
    }



    return (
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth={"md"} fullWidth={true}>
            <DialogTitle>{"Chỉnh sửa sân"}</DialogTitle>
            <DialogContent className="flex-col space-y-3">
                <TextField
                    value={name}
                    onChange={(e) => setState({ ...state, name: e.target.value })}
                    focused={name ? true : false}
                    margin="dense"
                    label="Tên sân bóng"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    value={location}
                    onChange={(e) => setState({ ...state, location: e.target.value })}
                    focused={location ? true : false}
                    autoFocus
                    margin="dense"
                    label="Địa điểm"
                    fullWidth
                    variant="standard"
                />

                <TextField
                    value={longitude}
                    onChange={(e) => setState({ ...state, longitude: e.target.value })}
                    focused={longitude ? true : false}
                    autoFocus
                    margin="dense"
                    type="number"
                    label="Kinh độ"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    value={latitude}
                    onChange={(e) => setState({ ...state, latitude: e.target.value })}
                    focused={latitude ? true : false}
                    autoFocus
                    margin="dense"
                    type="number"
                    label="Vĩ độ"
                    fullWidth
                    variant="standard"
                />
                <FormLabel className="mt-4" component="legend">Size</FormLabel>
                <FormGroup defaultValue={size} onChange={handleSelect} className="!flex-row">

                    {pitchSize.map((item: number) => (
                        <FormControlLabel
                            key={item}
                            control={
                                <Checkbox value={item} />
                            }
                            label={item}
                        />
                    ))}
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
                            {!slots?.length || slots.length < slot ?
                                [...Array(slot).keys()].map((item: any) => (
                                    <Grid key={item} item xs={6} md={4} lg={4} >
                                        <Button className="!bg-primary w-full" variant="contained">{`Slot ${item + 1}`}</Button>
                                        <Grid container>
                                            <Grid item lg={6}>
                                                <input defaultValue={slots?.length ? slots[item]?.start : ""} name={`start-${item + 1}`} className="border-[1px] outline-none !border-primary text-center !text-sm h-10 w-full cursor-pointer" type="time" min="07:00" max="19:00" required placeholder="Pleas  e enter text" />
                                            </Grid>
                                            <Grid item lg={6}>
                                                <input defaultValue={slots?.length ? slots[item]?.end : ""} name={`end-${item + 1}`} className="border-[1px] outline-none !border-primary  text-center  !text-sm h-10 w-full cursor-pointer" type="time" min="07:00" max="19:00" required placeholder="Please enter text" />
                                            </Grid>
                                            <Grid lg={12}>
                                                <input defaultValue={slots?.length ? slots[item]?.price : ""} name={`price-${item + 1}`} className="border-[1px] outline-none !border-primary text-center !text-sm h-10 w-full cursor-pointer" type="number" // the change is here
                                                    required placeholder="Enter your price" />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                ))
                                :
                                slots.slice(0, slot).map((item: Slot) => (
                                    <Grid key={item.id} item xs={6} md={4} lg={4} >
                                        <Button className="!bg-primary w-full" variant="contained">{`Slot ${item.id}`}</Button>
                                        <Grid container>
                                            <Grid item lg={6}>
                                                <input defaultValue={item.start} name={`start-${item.id}`} className="border-[1px] outline-none border-primary text-center !text-sm h-10 w-full cursor-pointer" type="time" min="07:00" max="19:00" required placeholder="Please enter text" />
                                            </Grid>
                                            <Grid item lg={6}>
                                                <input defaultValue={item.end} name={`end-${item.id}`} className="border-[1px] outline-none border-primary  text-center  !text-sm h-10 w-full cursor-pointer" type="time" min="07:00" max="19:00" required placeholder="Please enter text" />
                                            </Grid>
                                            <Grid lg={12}>
                                                <input defaultValue={item.price} name={`price-${item.id}`} className="border-[1px] outline-none border-primary text-center !text-sm h-10 w-full cursor-pointer" type="number" // the change is here
                                                    required placeholder="Enter your price" />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                ))
                            }
                        </Grid>
                    </form>
                }

                <FormLabel className="my-3" component="legend">Hình ảnh chính</FormLabel>
                <div className="flex !w-full !h-96" title="Main picture">

                    <Tooltip title="Add Main Picture">
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

                    <Tooltip title="Add Pictures">
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
                        <ImageList cols={blobPicture?.length >= 3 ? 3 : 2}>
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
            <DialogActions className="flex  items-center  bg-gray-100 w-full">

                <div className="flex space-x-2">
                    <Button variant="outlined" className="!text-primary !border-primary" onClick={() => setOpen(false)}>Hủy</Button>
                    <Button disabled={isLoading} className="!bg-primary flex justify-center items-center space-x-2" variant="contained" onClick={handleSubmit}>
                        {isLoading &&
                            <AiOutlineLoading3Quarters className="animate-spin duration-700 ease-linear" />
                        }
                        <span> Hoàn tất</span>
                    </Button>
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

export default FormEditPitchModal