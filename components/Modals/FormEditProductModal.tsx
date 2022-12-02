import React, { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { NextPage } from 'next';
import { GeoPoint } from 'firebase/firestore';
import { ImageList, ImageListItem } from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';
import { User } from '../../Models';
import { useDispatch, useSelector } from 'react-redux';
import { setIsUpdate } from '../../redux/features/isSlice';
import { RootState } from '../../redux/store';
import { Checkbox, FormControlLabel, FormGroup, FormLabel, Tooltip } from '@mui/material';
import CircularProgressWithLabel from '../ProgessCirle';
import { BiImageAdd } from 'react-icons/bi';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from '../../firebase/config';
import { clothesSize, sneakersSize } from '../../utils/helper';



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
    backSidePicture: any
    fontPicture: any
    discount: number | string
    blobPicture: string[]
    blobFont: string
    blobBackSide: string
    percent: number
}


const FormEditProductModal: NextPage<PropsModal> = ({ id, tab, setOpen, open }) => {
    const dispatch = useDispatch()
    const { isUpdated }: any = useSelector<RootState>(state => state.is)
    const { user }: any = useSelector<RootState>(state => state.user)
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
        percent: 0
    })
    const { name, price, discount, size, description, pictures, fontPicture, backSidePicture, blobPicture, blobFont, blobBackSide, percent } = state
    const [urls, setUrls] = useState<string[]>([])
    const [fontUrl, setFontUrl] = useState<string>("")
    const [backSideUrl, setBackSideUrl] = useState<string>("")



    useEffect(() => {
        axios.get(`/api/products/${id}`)
            .then(res => setState({
                ...state,
                name: res.data.name,
                description: res.data.description,
                price: res.data.price,
                size: [],
                percent: 0,
                blobPicture: res.data?.pictures,
                blobFont: res.data?.mainPictures?.[0],
                blobBackSide: res.data?.mainPictures?.[1],
                discount: res.data.discount,
            }))

        return () => {
            setState({ ...state, percent: 0 })
        }
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



    const handleSubmit = () => {

        if (!name || !price || !size.length || !discount || !description) {
            toast.info("Please complete all information", {
                autoClose: 3000,
                theme: "colored",
            });
        } else {
            const promise: any = [];
            if (!pictures.length && !fontPicture.name && !backSidePicture.name) {
                axios.put(`/api/products/${id}`, {
                    name,
                    description,
                    price,
                    size,
                    discount,
                    type: tab === 2 ? "clothes" : "sneakers",
                    owner: user.id,
                })
                setOpen(false)
                setState({ ...state, percent: 0 })
                dispatch(setIsUpdate(!isUpdated))
                toast.success("Updated success", { autoClose: 3000, theme: "colored" })
            } else if (pictures.length && fontPicture.name && !backSidePicture.name) {
                Array.from(pictures).map((picture) => {
                    const uploadTask = storage.ref(`file/${picture.name}`).put(picture);
                    promise.push(uploadTask);
                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                            const progress = Math.round(
                                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                            );
                        },
                        (error) => {
                            console.log(error);
                        },
                        async () => {
                            await storage
                                .ref("file")
                                .child(picture.name)
                                .getDownloadURL()
                                .then((url) => {
                                    setUrls((prevState: any) => [...prevState, url]);
                                });
                        }
                    );
                });
                const storageRef = ref(storage, `/file/${fontPicture.name}`);
                const uploadTask = uploadBytesResumable(storageRef, fontPicture);
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const percent = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        setState({ ...state, percent })
                    },
                    (err) => console.log(err),
                    () => {
                        // download url
                        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                            setFontUrl(url)
                        });
                    }
                );
                if (urls.length === promise.length && fontUrl) {
                    axios.put(`/api/products/${id}`, {
                        name,
                        description,
                        price,
                        size,
                        mainPictures: [fontUrl, blobBackSide],
                        pictures: urls,
                        owner: user.id,
                        discount,
                        type: tab === 2 ? "clothes" : "sneakers",
                    })
                }
                dispatch(setIsUpdate(!isUpdated))
                setOpen(false)
                setState({ ...state, percent: 0 })
                toast.success("Updated success", { autoClose: 3000, theme: "colored" })
            } else if (pictures.length && backSidePicture.name && !fontPicture.name) {
                Array.from(pictures).map((picture) => {
                    const uploadTask = storage.ref(`file/${picture.name}`).put(picture);
                    promise.push(uploadTask);
                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                            const progress = Math.round(
                                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                            );
                        },
                        (error) => {
                            console.log(error);
                        },
                        async () => {
                            await storage
                                .ref("file")
                                .child(picture.name)
                                .getDownloadURL()
                                .then((url) => {
                                    setUrls((prevState: any) => [...prevState, url]);
                                });
                        }
                    );
                });
                const storageRef = ref(storage, `/file/${backSidePicture.name}`);
                const uploadTask = uploadBytesResumable(storageRef, backSidePicture);
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const percent = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                    },
                    (err) => console.log(err),
                    () => {
                        // download url
                        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                            setBackSideUrl(url)
                        });
                    }
                );
                Promise.all(promise)
                    .then(() => {
                        if (urls.length === promise.length && backSideUrl) {
                            axios.put(`/api/products/${id}`, {
                                name,
                                description,
                                price,
                                size,
                                mainPictures: [blobFont, backSideUrl],
                                pictures: urls,
                                owner: user.id,
                                discount,
                                type: tab === 2 ? "clothes" : "sneakers",
                            })
                        }
                    })
                setOpen(false)
                setState({ ...state, percent: 0 })
                dispatch(setIsUpdate(!isUpdated))
                toast.success("Updated success", { autoClose: 3000, theme: "colored" })
            } else if (!pictures.length && fontPicture.name && !backSidePicture.name) {
                const storageRef = ref(storage, `/file/${fontPicture.name}`);
                const uploadTask = uploadBytesResumable(storageRef, fontPicture);
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const percent = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        setState({ ...state, percent })
                    },
                    (err) => console.log(err),
                    () => {
                        // download url
                        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                            setFontUrl(url)
                        });
                    }
                );
                if (urls.length === promise.length && fontUrl) {
                    axios.put(`/api/products/${id}`, {
                        name,
                        description,
                        price,
                        size,
                        mainPictures: [fontUrl, blobBackSide],
                        owner: user.id,
                        discount,
                        type: tab === 2 ? "clothes" : "sneakers",
                    })
                }
                dispatch(setIsUpdate(!isUpdated))
                setOpen(false)
                setState({ ...state, percent: 0 })
                toast.success("Updated success", { autoClose: 3000, theme: "colored" })
            } else if (!pictures.length && backSidePicture.name && !fontPicture.name) {
                const storageRef = ref(storage, `/file/${backSidePicture.name}`);
                const uploadTask = uploadBytesResumable(storageRef, backSidePicture);
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const percent = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        setState({ ...state, percent })
                    },
                    (err) => console.log(err),
                    () => {
                        // download url
                        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                            setBackSideUrl(url)
                        });
                    }
                );
                if (urls.length === promise.length && backSideUrl) {
                    axios.put(`/api/products/${id}`, {
                        name,
                        description,
                        price,
                        size,
                        mainPictures: [blobFont, backSideUrl],
                        owner: user.id,
                        discount,
                        type: tab === 2 ? "clothes" : "sneakers",
                    })
                }
                setOpen(false)
                setState({ ...state, percent: 0 })
                dispatch(setIsUpdate(!isUpdated))
                toast.success("Updated success", { autoClose: 3000, theme: "colored" })
            } else {
                Array.from(pictures).map((picture) => {
                    const uploadTask = storage.ref(`file/${picture.name}`).put(picture);
                    promise.push(uploadTask);
                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                            const progress = Math.round(
                                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                            );
                        },
                        (error) => {
                            console.log(error);
                        },
                        async () => {
                            await storage
                                .ref("file")
                                .child(picture.name)
                                .getDownloadURL()
                                .then((url) => {
                                    setUrls((prevState: any) => [...prevState, url]);
                                });
                        }
                    );
                });
                const storageRef1 = ref(storage, `/file/${fontPicture.name}`);
                const storageRef2 = ref(storage, `/file/${backSidePicture.name}`);
                const uploadTask1 = uploadBytesResumable(storageRef1, fontPicture);
                const uploadTask2 = uploadBytesResumable(storageRef2, backSidePicture);

                uploadTask1.on(
                    "state_changed",
                    (snapshot) => {
                        const percent = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                    },
                    (err) => console.log(err),
                    () => {
                        // download url
                        getDownloadURL(uploadTask1.snapshot.ref).then((url) => {
                            setFontUrl(url)
                        });
                    }
                );
                uploadTask2.on(
                    "state_changed",
                    (snapshot) => {
                        const percent = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        setState({ ...state, percent })
                    },
                    (err) => console.log(err),
                    () => {
                        // download url
                        getDownloadURL(uploadTask2.snapshot.ref).then((url) => {
                            setBackSideUrl(url)
                        });
                    }
                );

                if (urls.length === promise.length && fontUrl && backSideUrl) {
                    axios.put(`/api/products/${id}`, {
                        name,
                        description,
                        price,
                        size,
                        pictures: urls,
                        mainPictures: [fontPicture, backSidePicture],
                        owner: user.id,
                        type: tab === 2 ? "clothes" : "sneakers",
                    })
                }
                setOpen(false)
                setState({ ...state, percent: 0 })
                dispatch(setIsUpdate(!isUpdated))
                toast.success("Updated success", { autoClose: 3000, theme: "colored" })
            }
        }
    }


    return (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth={true}>
            <DialogTitle>{"Form edit Product"}</DialogTitle>
            <DialogContent>
                <TextField
                    value={name}
                    onChange={(e) => setState({ ...state, name: e.target.value })}
                    focused={name ? true : false}
                    margin="dense"
                    label="Name"
                    fullWidth
                    variant="standard"
                />

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

                <FormLabel className="my-3" component="legend">Main Picture</FormLabel>
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
                    <FormLabel className="mt-4" component="legend">Sub Pictures</FormLabel>
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
                {percent > 0 &&
                    <CircularProgressWithLabel className="flex-1" value={percent} />
                }
                <div className="">
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </div>
            </DialogActions>
        </Dialog >
    )
}

export default FormEditProductModal