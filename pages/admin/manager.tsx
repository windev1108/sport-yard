import React, { useState, useEffect, useLayoutEffect, memo, useCallback } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import axios from 'axios';
import Layout from '../../components/Layout';
import { useDispatch, useSelector } from 'react-redux';
import dynamic from 'next/dynamic'
import { Pitch, Product, User } from '../../Models';
import { GiClothes, GiSoccerField, GiSonicShoes } from 'react-icons/gi';
import { HiUser } from 'react-icons/hi'
import { useSession } from 'next-auth/react';
import Router from 'next/router';
import { RootState } from '../../redux/store';
import { Avatar, Button, IconButton, ImageList, ImageListItem, Tooltip, Typography } from '@mui/material';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FiEdit } from 'react-icons/fi';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import { deepOrange } from '@mui/material/colors';
import { FaUsers } from 'react-icons/fa';
import ConfirmModal from "../../components/Modals/ConfirmModal"
import { setIsLoading, setOpenFormEditUser } from '../../redux/features/isSlice';
import { setIdEditing } from '../../redux/features/userSlice';
import { getCookie } from 'cookies-next';
import jwt from "jsonwebtoken"
import Skeleton from '@mui/material/Skeleton';
const AddUserModal = dynamic(() => import("../../components/Modals/AddUserModal"), { ssr: false })
const AddPitchModal = dynamic(() => import("../../components/Modals/AddPitchModal"), { ssr: false })
const AddProductModal = dynamic(() => import("../../components/Modals/AddProductModal"), { ssr: false })
const FormEditProductModal = dynamic(() => import("../../components/Modals/FormEditProductModal"), { ssr: false })
const FormEditPitchModal = dynamic(() => import("../../components/Modals/FormEditPitchModal"), { ssr: false })


interface State {
    tabData: User[] | Pitch[] | any
    tab: number
    idDeleting: string
    idEditing: string
    typeProduct: string
    pictures: string[]
    isLoading: boolean
}

const OwnerManager = () => {
    const token: any = getCookie("token")
    const dispatch = useDispatch()
    const { user }: User | any = useSelector<RootState>(state => state?.user)
    const { isUpdated }: boolean | any = useSelector<RootState>(state => state.is)
    const [state, setState] = useState<State>({
        tabData: [],
        tab: 0,
        idDeleting: "",
        idEditing: "",
        typeProduct: "",
        pictures: [],
        isLoading: true
    })
    const [openModalAddUser, setModalAddUser] = useState(false)
    const [openModalAddPitch, setModalAddPitch] = useState(false);
    const [openModalAddProduct, setModalAddProduct] = useState(false);
    const [openConfirmModal, setConfirmModal] = useState(false);
    const [openFormEditProductModal, setFormEditProductModal] = useState(false);
    const [openFormEditPitchModal, setFormEditPitchModal] = useState(false);
    const { tabData, tab, idDeleting, idEditing, typeProduct, isLoading } = state


    useLayoutEffect(() => {
        if (!token || user.role !== "admin") {
            Router.push("/")
        }

    }, [token])


    useLayoutEffect(() => {
        switch (tab) {
            case 0: {
                axios.get("/api/users")
                    .then(res => {
                        setState({ ...state, tabData: res.data.users, isLoading: false })
                    })
            }
                break
            case 1: {
                axios.get("/api/pitch")
                    .then(res => {
                        setState({ ...state, tabData: res.data.pitch, isLoading: false })
                    })
            }
                break
            case 2: {
                axios.get("/api/products")
                    .then(res => {
                        setState({ ...state, tabData: res.data.products?.filter((p: Product) => p.type === "clothes"), isLoading: false })
                    })
            }
                break
            case 3: {
                axios.get("/api/products")
                    .then(res => {
                        setState({ ...state, tabData: res.data.products?.filter((p: Product) => p.type === "sneakers"), isLoading: false })
                    })
            }
                break
            default: return
        }
    }, [tab])


    const handleChange = useCallback((e: React.SyntheticEvent, newValue: number) => {
        setState({ ...state, tab: newValue, isLoading: true });
    }, [])

    const handleDelete = (id: any) => {
        setState({ ...state, idDeleting: id })
        setConfirmModal(true)
    };

    const handleShowModalAddClothes = () => {
        setState({ ...state, typeProduct: "clothes" })
        setModalAddProduct(true)
    }
    const handleShowModalAddShoes = () => {
        setState({ ...state, typeProduct: "sneakers" })
        setModalAddProduct(true)
    }

    const handleSetupFormEdit = (id: string) => {
        setState({ ...state, idEditing: id })
        switch (tab) {
            case 0: {
                dispatch(setIdEditing(id))
                dispatch(setOpenFormEditUser(true))
            }
                break
            case 1: setFormEditPitchModal(true)
                break
            default: setFormEditProductModal(true)
        }
    }


    return (
        <Layout>
            <SpeedDial
                className="group after:absolute after:bottom-0 after:left-0 after:right-0 after:bg-white after:h-14 after:rounded-full"
                ariaLabel="SpeedDial basic example"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                icon={<SpeedDialIcon className="group-hover:text-white text-primary" />}
            >
                <SpeedDialAction
                    onClick={() => setModalAddUser(true)}
                    icon={<HiUser className="text-orange-500 text-3xl" />}
                    tooltipTitle="Add User"
                />
                <SpeedDialAction
                    onClick={() => setModalAddPitch(true)}
                    icon={<GiSoccerField className="text-orange-500 text-3xl" />}
                    tooltipTitle="Add Pitch"
                />
                <SpeedDialAction
                    onClick={handleShowModalAddClothes}
                    icon={<GiClothes className="text-orange-500 text-3xl" />}
                    tooltipTitle="Add Clothes"
                />
                <SpeedDialAction
                    onClick={handleShowModalAddShoes}
                    icon={<GiSonicShoes className="text-orange-500 text-3xl" />}
                    tooltipTitle="Add Sneakers"
                />
            </SpeedDial>


            {openModalAddUser && <AddUserModal open={openModalAddUser} setOpen={setModalAddUser} />}
            {openModalAddPitch && <AddPitchModal open={openModalAddPitch} setOpen={setModalAddPitch} />}
            {openModalAddProduct && <AddProductModal type={typeProduct} open={openModalAddProduct} setOpen={setModalAddProduct} />}


            {openFormEditProductModal && <FormEditProductModal tab={tab} id={idEditing} open={openFormEditProductModal} setOpen={setFormEditProductModal} />}
            {openFormEditPitchModal && <FormEditPitchModal id={idEditing} open={openFormEditPitchModal} setOpen={setFormEditPitchModal} />}
            {openConfirmModal && <ConfirmModal tab={tab} id={idDeleting} open={openConfirmModal} setOpen={setConfirmModal} />}
            <div className="pt-16  overflow-hidden">
                <Tabs value={tab} onChange={handleChange} aria-label="icon label tabs example">
                    <Tab value={0} icon={<FaUsers className="text-4xl" />} label="Users" />
                    <Tab value={1} icon={<GiSoccerField className="text-4xl" />} label="Pitch" />
                    <Tab value={2} icon={<GiClothes className="text-4xl" />} label="Clothes" />
                    <Tab value={3} icon={<GiSonicShoes className="text-4xl" />} label="Sneakers" />
                </Tabs>
                {isLoading ?
                    <Skeleton variant="rectangular" width={2000} height={800} />
                    :
                    <table className="min-w-full overflow-x-scroll overflow-y-hidden">
                        <thead>
                            <tr>
                                <th
                                    colSpan={1}
                                    className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                    ID</th>


                                {tab === 0 &&
                                    <th
                                        colSpan={1}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Avatar"}</th>
                                }
                                {tab === 0 ?
                                    <th
                                        colSpan={1}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Firt Name"}</th>
                                    :
                                    <th
                                        colSpan={1}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Name"}</th>
                                }

                                {tab === 0 ?
                                    <th
                                        colSpan={1}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Last name"}</th>
                                    :
                                    <th
                                        colSpan={2}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {tab === 1 ? "Location" : "Description"}</th>
                                }

                                {tab === 0 ?
                                    <th
                                        colSpan={2}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Email"}</th>
                                    :
                                    tab !== 1 &&
                                    <th
                                        colSpan={1}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Price"}</th>
                                }



                                {tab !== 1 && tab !== 0 &&
                                    <th
                                        colSpan={2}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Discount"}</th>
                                }

                                {tab === 0 ?
                                    <th
                                        colSpan={2}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Password"}</th>
                                    :
                                    <th
                                        colSpan={1}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Size"}</th>
                                }


                                {tab === 0 ?
                                    <th
                                        colSpan={2}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Role"}</th>
                                    :
                                    <th
                                        colSpan={2}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-center text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Pictures"}</th>

                                }
                                <th
                                    colSpan={2}
                                    className="px-6 py-3 text-xs font-medium leading-4  text-center text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                    Edit</th>
                                <th
                                    colSpan={2}
                                    className="px-6 py-3 text-xs font-medium leading-4  text-center text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                    Delete</th>
                            </tr>
                        </thead>
                        <tbody className="h-full overflow-y-scroll bg-white">
                            {tabData?.map((data: any, index: number) => (
                                <tr
                                    key={index}
                                >
                                    <td
                                        className="px-6  border-b border-gray-200">
                                        <div className="text-lg leading-5 text-gray-500">{index + 1}</div>
                                    </td>

                                    {tab === 0 &&
                                        <td
                                            colSpan={1}
                                            className="px-6  border-b border-gray-200">
                                            <div className="flex items-center">
                                                <Avatar className="object-cover w-20 h-20" src={data.avatar} sx={{ bgcolor: deepOrange[500] }}>{data.firstName?.substring(0, 1)}</Avatar>
                                            </div>
                                        </td>
                                    }

                                    <td
                                        colSpan={1}
                                        className="px-6  border-b border-gray-200">
                                        <div className="flex items-center">
                                            <div className="ml-4">
                                                <div className="text-sm font-medium leading-5 text-gray-900">
                                                    {tab === 0 ? data.firstName : data.name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>


                                    {tab === 0 ?
                                        <td
                                            colSpan={1}
                                            className="px-6  border-b text-gray-900">
                                            <div className="flex items-center">
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium leading-5 text-gray-900">
                                                        {data.lastName}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        :
                                        <td
                                            colSpan={2}
                                            className="border-b border-gray-200">
                                            <div className="text-sm leading-5 text-gray-500">{tab === 1 ? data.location : data.description}</div>
                                        </td>
                                    }

                                    {tab === 0 ?
                                        <td
                                            colSpan={2}
                                            className="px-6  border-b border-gray-200">
                                            <div className="text-sm leading-5 text-gray-500"> {data.email}</div>
                                        </td>
                                        :
                                        tab !== 1 &&
                                        <td
                                            colSpan={1}
                                            className="px-6  border-b border-gray-200">
                                            <div className="text-sm leading-5 text-gray-500"> {`${data.price}₫`}</div>
                                        </td>
                                    }


                                    {tab === 2 &&
                                        <td
                                            colSpan={2}
                                            className="px-6  border-b border-gray-200">
                                            <div className="text-sm text-center leading-5 text-gray-500"> {`${data.discount}%`}</div>
                                        </td>
                                    }

                                    {tab === 3 &&
                                        <td
                                            colSpan={1}
                                            className="px-6  border-b border-gray-200">
                                            <div className="text-sm text-center leading-5 text-gray-500"> {`${data.discount}%`}</div>
                                        </td>
                                    }

                                    {tab === 0 ?
                                        <td
                                            colSpan={2}
                                            className="px-6 text-lg  border-b border-gray-200">
                                            <div className="text-sm leading-5 text-gray-500"> {data.password}</div>
                                        </td>
                                        :
                                        <td
                                            colSpan={1}
                                            className="px-6  border-b border-gray-200">
                                            <div className="text-sm leading-5 text-gray-500"> {`${data.size?.sort((a: number | string, b: number | string) => typeof a === "number" && typeof b === "number" ? a - b : data.size)}`}</div>
                                        </td>
                                    }

                                    <td
                                        colSpan={2}
                                        className="!h-36 border-b border-gray-200">
                                        {tab === 0 ?
                                            <span
                                                className={`${data.role === "admin" && "bg-blue-300"} ${data.role === "owner" && "bg-green-200"} ${data.role === "customer" && "bg-gray-200"} text-base  inline-flex px-3 py-1  font-semibold leading-5 text-green-800  rounded-full`}>{data.role?.charAt(0).toUpperCase() + data.role?.substring(1)}</span>
                                            :
                                            <ImageList cols={data.pictures?.length >= 2 ? 2 : 1} className="!h-full">
                                                {tab === 1 && data.pictures &&
                                                    [data.mainPicture, ...data?.pictures]?.map((item: string, index: number) => (
                                                        <ImageListItem key={index}>
                                                            <img
                                                                src={item}
                                                                alt=""
                                                                className="object-cover !w-full  !h-40"
                                                                loading="lazy"
                                                            />
                                                        </ImageListItem>
                                                    ))

                                                }
                                                {tab === 2 && data.pictures && data.mainPictures &&
                                                    [...data.mainPictures, ...data.pictures]?.map((item: string, index: number) => (
                                                        <ImageListItem key={index}>
                                                            <img
                                                                src={item}
                                                                alt=""
                                                                className="object-cover !w-full !h-40"
                                                                loading="lazy"
                                                            />
                                                        </ImageListItem>
                                                    ))
                                                }
                                                {tab == 3 && data.pictures && data.mainPictures &&
                                                    [...data.mainPictures, ...data.pictures]?.map((item: string) => (
                                                        <ImageListItem key={item}>
                                                            <img
                                                                src={item}
                                                                alt=""
                                                                className="object-cover !h-40"
                                                                loading="lazy"
                                                            />
                                                        </ImageListItem>
                                                    ))
                                                }
                                            </ImageList>
                                        }
                                    </td>
                                    <td
                                        colSpan={2}
                                        className="text-center  border-b border-gray-200">
                                        <Tooltip title="Edit">
                                            <IconButton
                                                onClick={() => handleSetupFormEdit(data.id)}
                                            >
                                                <FiEdit className="text-[#1976D2] text-3xl" />
                                            </IconButton>
                                        </Tooltip>
                                    </td>
                                    <td
                                        colSpan={2}
                                        className="text-center  border-b border-gray-200">
                                        <Tooltip title="Delete">
                                            <IconButton
                                                onClick={() => handleDelete(data.id)}
                                            >
                                                <RiDeleteBin6Line className="text-[#f87171] text-3xl" />
                                            </IconButton>
                                        </Tooltip>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                }

            </div>
        </Layout >
    );
}



export default memo(OwnerManager)