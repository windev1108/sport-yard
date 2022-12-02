import React, { useState, useEffect } from 'react'
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { NextPage } from 'next';
import { useDispatch, useSelector } from 'react-redux';
import { setIsUpdate } from '../../redux/features/isSlice';
import { RootState } from '../../redux/store';
import { BiImageAdd } from 'react-icons/bi';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/config"
import { toast } from 'react-toastify';
import { ImageList, Tooltip, ImageListItem } from '@mui/material';
import CircularProgressWithLabel from '../ProgessCirle';
import Checkbox from '@mui/material/Checkbox/Checkbox';
import FormGroup from '@mui/material/FormGroup/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import FormLabel from '@mui/material/FormLabel/FormLabel';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/router';
import { RiImageAddFill } from 'react-icons/ri';
import LinearProgress from '@mui/material/LinearProgress';


export interface PropsModal {
    setOpen: any
    open: boolean
    type: string
}

interface State {
    name: string
    description: string
    price: number | string
    size: string[]
    pictures: any[]
    fontPicture: any
    backSidePicture: any
    discount: number | string
    blobPicture: any[]
    blobFont: any
    blobBackSide: any
    isUploaded: boolean
    isLoading: boolean
}


const AddUserModal: NextPage<PropsModal> = ({ type, setOpen, open }) => {
    const dispatch = useDispatch()
    const router = useRouter()
    const { user }: any = useSelector<RootState>(state => state.user)
    const { isUpdated }: any = useSelector<RootState>(state => state.is)
    const [state, setState] = useState<State>({
        name: "",
        description: "",
        price: "",
        size: [],
        pictures: [],
        fontPicture: {},
        backSidePicture: {},
        discount: "",
        blobPicture: [],
        blobFont: "",
        blobBackSide: "",
        isUploaded: false,
        isLoading: false
    })
    const { name, price, discount, size, description, pictures, fontPicture, backSidePicture, blobPicture, blobFont, blobBackSide, isLoading , isUploaded } = state
    const [urls, setUrls] = useState<string[]>([])
    const [fontUrl, setFontUrl] = useState<string>("")
    const [backSideUrl, setBackSideUrl] = useState<string>("")
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        return () => {
            setState({
                name: "",
                description: "",
                price: "",
                size: [],
                pictures: [],
                fontPicture: {},
                backSidePicture: {},
                discount: "",
                blobPicture: [],
                blobFont: "",
                blobBackSide: "",
                isLoading: false,
                isUploaded: false
            })
        }
    }, [])


    const onFileChange = (e: any) => {
        let files = e.target.files
        let blobs: any = []
        for (let i = 0; i < files.length; i++) {
            blobs.push(URL.createObjectURL(files[i]))
        }
        setState({ ...state, blobPicture: blobs, pictures: files })
    }

    const onFileBackSideChange = (e: any) => {
        let file = e.target.files[0]
        setState({
            ...state, blobBackSide: URL.createObjectURL(file), backSidePicture: file
        })
    }

    const onFileFontChange = (e: any) => {
        let file = e.target.files[0]
        setState({
            ...state, blobFont: URL.createObjectURL(file), fontPicture: file
        })
    }


    const handleSubmit = async () => {
        if (!blobPicture || !blobFont || !blobBackSide) {
            toast.info("Please choose pictures", { autoClose: 3000, theme: "colored" })
        } else if (!name || !price || !size.length || !discount) {
            toast.info("Please complete all information", {
                autoClose: 3000,
                theme: "colored",
            });
        } else {
            if (isUploaded) {
                axios.post("/api/products", {
                    name,
                    description,
                    discount,
                    price,
                    size,
                    mainPictures: [fontUrl, backSideUrl],
                    pictures: urls,
                    type,
                    owner: user.id,
                })
                setOpen(false)
                dispatch(setIsUpdate(!isUpdated))
                toast.success("Thêm sản phẩm thành công ", { autoClose: 3000, theme: "colored" })
            }else{
                toast.info("Vui lòng thử lại sau ", { autoClose: 3000, theme: "colored" })
            }
        }
    }


    const handleUploadFiles = async () => {
        setState({...state , isLoading: true})
        Array.from(pictures).map(async (picture) => {
            const formData = new FormData()
            formData.append("file", picture)
            formData.append('upload_preset', 'my-uploads');
            const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDNAME}/image/upload`, formData)
            setUrls((prev: string[]) => [...prev, data.url])
        });
        const formData1 = new FormData()
        formData1.append("file", backSidePicture)
        formData1.append('upload_preset', 'my-uploads');
        const res1 = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDNAME}/image/upload`, formData1)
        const formData2 = new FormData()
        formData2.append("file", fontPicture)
        formData2.append('upload_preset', 'my-uploads');
        const res2 = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDNAME}/image/upload`, formData2)
        setBackSideUrl(res1.data.url)
        setFontUrl(res2.data.url)
        setState({...state , isLoading: false , isUploaded: true})
    }

    const handleSelect = (e: any) => {
        const checkIsExist = size.some((s: string) => s === e.target.value)
        if (!checkIsExist) {
            setState({ ...state, size: [...size, e.target.value] })
        } else {
            const newArr = size.filter(s => s !== e.target.value)
            setState({ ...state, size: newArr })
        }
    }

    return (
        <Dialog fullScreen={fullScreen} open={open} onClose={() => setOpen(false)} fullWidth={true}>
            <DialogTitle>{"Thêm sản phẩm"}</DialogTitle>
            <DialogContent>
                <TextField
                    value={name}
                    onChange={(e) => setState({ ...state, name: e.target.value })}
                    autoFocus
                    margin="dense"
                    label="Name product"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    value={description}
                    onChange={(e) => setState({ ...state, description: e.target.value })}
                    autoFocus
                    margin="dense"
                    label="Description"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    value={price}
                    onChange={(e) => setState({ ...state, price: e.target.value })}
                    autoFocus
                    margin="dense"
                    type="number"
                    label="Price"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    value={discount}
                    onChange={(e) => setState({ ...state, discount: e.target.value })}
                    autoFocus
                    margin="dense"
                    type="number"
                    label="Discount/%"
                    fullWidth
                    variant="standard"
                />
                <FormLabel className="mt-4" component="legend">Size</FormLabel>
                <FormGroup onChange={handleSelect} className="!flex-row">
                    <FormControlLabel
                        control={
                            <Checkbox value={type === "clothes" ? "S" : "36"} />
                        }
                        label={type === "clothes" ? "S" : "36"}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox value={type === "clothes" ? "M" : "37"} />

                        }
                        label={type === "clothes" ? "M" : "37"}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox value={type === "clothes" ? "L" : "38"} />

                        }
                        label={type === "clothes" ? "L" : "38"}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox value={type === "clothes" ? "X" : "39"} />

                        }
                        label={type === "clothes" ? "X" : "39"}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox value={type === "clothes" ? "XXL" : "40"} />

                        }
                        label={type === "clothes" ? "XXL" : "40"}
                    />
                    {type === "sneakers" &&
                        <FormControlLabel
                            control={
                                <Checkbox value={"41"} />

                            }
                            label="41"
                        />
                    }
                    {type === "sneakers" &&
                        <FormControlLabel
                            control={
                                <Checkbox value={"42"} />

                            }
                            label="42"
                        />
                    }
                </FormGroup>

                <FormLabel className="my-3" component="legend">Hình ảnh chính</FormLabel>
                <div className="flex items-center">
                    <div className="flex-1" title="Main picture">
                        <Tooltip title="Add Font Picture">
                            <label
                                onChange={onFileFontChange}
                                htmlFor="fontPicture"
                                className="cursor-pointer flex justify-center !h-52  border-dashed border-[2px] border-black"
                            >
                                {blobFont ?
                                    <img
                                        src={blobFont}
                                        alt={blobFont}
                                        className="object-fill w-full h-full"
                                        loading="lazy"
                                    />
                                    :
                                    <BiImageAdd
                                        className="h-full cursor-pointer  w-[4rem]  p-4 text-[#1976d2] rounded-full"
                                    />
                                }
                                <input
                                    accept="image/*"
                                    hidden
                                    id="fontPicture"
                                    name="img"
                                    type="file"
                                />
                            </label>
                        </Tooltip>
                    </div>

                    <div className="flex-1" title="Main picture">
                        <Tooltip title="Add Backside Picture">
                            <label
                                onChange={onFileBackSideChange}
                                htmlFor="backSidePicture"
                                className="cursor-pointer flex justify-center !h-52 border-l-0 border-dashed border-[2px] border-black"
                            >
                                {blobBackSide ?
                                    <img
                                        src={blobBackSide}
                                        alt={blobBackSide}
                                        className="object-fill w-full h-full"
                                        loading="lazy"
                                    />
                                    :
                                    <BiImageAdd
                                        className="h-full cursor-pointer  w-[4rem]  p-4 text-[#1976d2] rounded-full"
                                    />
                                }
                                <input
                                    accept="image/*"
                                    hidden

                                    id="backSidePicture"
                                    name="img"
                                    type="file"
                                />
                            </label>
                        </Tooltip>
                    </div>
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
                        <ImageList cols={blobPicture?.length >= 3 ? 3 : 2}>
                            {blobPicture?.map((item) => (
                                <ImageListItem key={item}>
                                    <img
                                        src={item}
                                        alt={item}
                                        className=" !h-52"
                                        loading="lazy"
                                    />
                                </ImageListItem>
                            ))}
                        </ImageList>
                    </div>
                </div>


            </DialogContent>
            <DialogActions className="flex items-center  bg-gray-100 w-full">
                <div className="">
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button className="!bg-primary" variant="contained" onClick={isUploaded ? handleSubmit : handleUploadFiles}>{isUploaded ? "Submit" : "Upload"}</Button>
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