import React, { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { NextPage } from 'next';
import { FormControl, FormHelperText, ImageList, ImageListItem, LinearProgress } from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Checkbox, FormControlLabel, FormGroup, FormLabel, Tooltip } from '@mui/material';
import { BiImageAdd } from 'react-icons/bi';
import { clothesSize, sneakersSize } from '../../utils/helper';
import instance from '../../server/db/instance';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { setIsUpdate } from '../../redux/features/isSlice';



export interface PropsModal {
    setOpen: any
    open: boolean
    id: string
    tab: number
}

interface State {
    name: string
    description: string
    price: number | string
    size: string[]
    pictures: any[]
    amount: string
    backSidePicture: any
    fontPicture: any
    discount: number | string
    blobPicture: string[]
    blobFont: string
    blobBackSide: string
    isLoading: boolean
    isUploaded: boolean
}

interface CloudinaryUrls {
    fontUrl: string
    backSideUrl: string
    urls: string[]
}


const FormEditProductModal: NextPage<PropsModal> = ({ id, tab, setOpen, open }) => {
    const dispatch = useDispatch()
    const { isUpdated }: any = useSelector<RootState>(state => state.is)
    const { user }: any = useSelector<RootState>(state => state.user)
    const [state, setState] = useState<State>({
        name: "",
        description: "",
        price: "",
        amount: "",
        size: [],
        pictures: [],
        fontPicture: {},
        backSidePicture: {},
        discount: "",
        blobPicture: [],
        blobFont: "",
        blobBackSide: "",
        isLoading: false,
        isUploaded: false,
    })
    const { name, price, discount, size, amount, description, pictures, fontPicture, backSidePicture, blobPicture, blobFont, blobBackSide, isLoading, isUploaded } = state



    useEffect(() => {
        instance.get(`/products/${id}`)
            .then(res => setState({
                ...state,
                name: res.data.name,
                description: res.data.description,
                price: res.data.price,
                size: [],
                amount: res.data.amount,
                blobPicture: res.data?.pictures,
                blobFont: res.data?.mainPictures?.[0],
                blobBackSide: res.data?.mainPictures?.[1],
                discount: res.data.discount,
            }))

    }, [])



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
            blobs.push(URL?.createObjectURL(files[i]))
        }
        setState({ ...state, blobPicture: blobs, pictures: files })
    }

    const onFileBackSideChange = (e: any) => {
        let file = e.target.files[0]
        setState({
            ...state, blobBackSide: URL?.createObjectURL(file), backSidePicture: file
        })
    }

    const onFileFontChange = (e: any) => {
        let file = e.target.files[0]
        setState({
            ...state, blobFont: URL?.createObjectURL(file), fontPicture: file
        })
    }



    const handleSubmit = async () => {
        if (!name || !price || !size.length || !discount || !amount) {
            toast.info("Vui lòng điền đầy đủ thông tin", {
                autoClose: 3000,
                theme: "colored",
            });
        } else if (pictures.length === 0 && !fontPicture.name && !backSidePicture.name) {
            instance.put(`/products/${id}`, {
                name,
                description,
                price,
                size,
                amount,
                discount,
                type: tab === 2 ? "clothes" : "sneakers",
            })
            setOpen(false)
            dispatch(setIsUpdate(!isUpdated))
            toast.success("Cập nhật thành công", { autoClose: 3000, theme: "colored" })
        } else {
            setState({ ...state, isLoading: true })
            handleUploadFiles()
                .then((res: any) => {
                    console.log(res)
                    instance.put(`/products/${id}`, {
                        name,
                        description,
                        price,
                        size,
                        discount,
                        amount,
                        mainPictures: [res?.fontUrl ? res?.fontUrl : blobFont, res.backSideUrl ? res.backSideUrl : blobBackSide],
                        pictures: res.urls.length > 0 ? res.urls : blobPicture,
                        type: tab === 2 ? "clothes" : "sneakers",
                    })
                    setOpen(false)
                    dispatch(setIsUpdate(!isUpdated))
                    toast.success("Cập nhật thành công", { autoClose: 3000, theme: "colored" })
                    setState({ ...state, isLoading: false })
                })
        }
    }


    const handleUploadFiles = async () => {
        const cloudinaryUrls: CloudinaryUrls = {
            fontUrl: "",
            backSideUrl: '',
            urls: [],
        }
        if (fontPicture?.name) {
            const formData = new FormData()
            formData.append("file", fontPicture)
            formData.append('upload_preset', 'my-uploads');
            const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDNAME}/image/upload`, formData)
            cloudinaryUrls.fontUrl = data.url
        }
        if (backSidePicture?.name) {
            const formData = new FormData()
            formData.append("file", backSidePicture)
            formData.append('upload_preset', 'my-uploads');
            const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDNAME}/image/upload`, formData)
            cloudinaryUrls.backSideUrl = data.url
        }
        if (pictures.length > 0) {
            Array.from(pictures).map(async (picture) => {
                setState({ ...state, isLoading: true })
                const formData = new FormData()
                formData.append("file", picture)
                formData.append('upload_preset', 'my-uploads');
                const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDNAME}/image/upload`, formData)
                cloudinaryUrls.urls = [...cloudinaryUrls.urls, data.url]
            });
        }
        return new Promise((resolve, reject) => {
            resolve(cloudinaryUrls)
        })
    }


    return (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth={true}>
            <DialogTitle>{"Sửa sản phẩm"}</DialogTitle>
            <DialogContent>
                <FormControl
                    fullWidth
                    error variant="standard">
                    <TextField
                        value={name}
                        onChange={(e) => setState({ ...state, name: e.target.value })}
                        focused={name ? true : false}
                        margin="dense"
                        label="Name"
                        fullWidth
                        variant="standard"
                    />
                    {!name &&
                        <FormHelperText id="component-error-text">Vui lòng nhập tên sản phẩm</FormHelperText>
                    }
                </FormControl>

                <FormControl
                    fullWidth
                    error variant="standard">
                    <TextField
                        value={description}
                        onChange={(e) => setState({ ...state, description: e.target.value })}
                        focused={description ? true : false}
                        autoFocus
                        margin="dense"
                        label="Description"
                        fullWidth
                        variant="standard"
                    />
                    {!description &&
                        <FormHelperText id="component-error-text">Vui lòng nhập mô tả</FormHelperText>
                    }
                </FormControl>

                <FormControl
                    fullWidth
                    error variant="standard">
                    <TextField
                        value={price}
                        onChange={(e) => setState({ ...state, price: e.target.value })}
                        focused={price ? true : false}
                        autoFocus
                        margin="dense"
                        type="number"
                        label="Price"
                        fullWidth
                        variant="standard"
                    />
                    {!price &&
                        <FormHelperText id="component-error-text">Vui lòng nhập giá sản phẩm</FormHelperText>
                    }
                </FormControl>


                <FormControl
                    fullWidth
                    error variant="standard">
                    <TextField
                        value={amount}
                        onChange={(e) => setState({ ...state, amount: e.target.value })}
                        focused={price ? true : false}
                        autoFocus
                        margin="dense"
                        type="number"
                        label="Số lượng tồn kho"
                        fullWidth
                        variant="standard"
                    />
                    {!amount &&
                        <FormHelperText id="component-error-text">Vui lòng nhập số lượng tồn kho</FormHelperText>
                    }
                </FormControl>


                <FormControl
                    fullWidth
                    error variant="standard">
                    <TextField
                        value={discount}
                        onChange={(e) => setState({ ...state, discount: e.target.value })}
                        focused={discount ? true : false}
                        autoFocus
                        margin="dense"
                        type="number"
                        label="Discount/%"
                        fullWidth
                        variant="standard"
                    />
                    {!discount &&
                        <FormHelperText id="component-error-text">Vui lòng nhập khuyến mãi</FormHelperText>
                    }
                </FormControl>


                <FormLabel className="mt-4" component="legend">Size</FormLabel>
                <FormGroup defaultValue={size} onChange={handleSelect} className="!flex-row">

                    {tab === 2 &&
                        clothesSize.map((item: string) => (
                            <FormControlLabel
                                key={item}
                                control={
                                    <Checkbox value={item} />
                                }
                                label={item}
                            />
                        ))
                    }
                    {tab === 3 &&
                        sneakersSize.map((item: number) => (
                            <FormControlLabel
                                key={item}
                                control={
                                    <Checkbox value={item} />
                                }
                                label={item}
                            />
                        ))
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
                    <Tooltip title="Add sub pictures">
                        <label
                            onChange={onFileChange}
                            htmlFor="upload"
                            className="cursor-pointer  rounded-full"
                        >
                            <BiImageAdd
                                className="h-full cursor-pointer  w-[4rem]  p-4 text-[#1976d2] rounded-full"
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

                <div className="flex space-x-2">
                    <Button className="!border-primary text-primary" variant="outlined" onClick={() => setOpen(false)}>Hủy</Button>
                    <Button disabled={isLoading} className="!bg-primary flex justify-center items-center space-x-2" variant="contained" onClick={handleSubmit}>
                        {isLoading &&
                            <AiOutlineLoading3Quarters className="animate-spin duration-700 ease-linear" />
                        }
                        <span> Hoàn tất</span>
                    </Button>
                </div>
            </DialogActions>
            {
                isLoading &&
                <div className="absolute top-0 left-0 right-0 ">
                    <LinearProgress />
                </div>
            }
        </Dialog >
    )
}

export default FormEditProductModal