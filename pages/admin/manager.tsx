import React, { useState, useLayoutEffect, memo, useCallback, useRef } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Layout from '../../components/Layout';
import { useDispatch, useSelector } from 'react-redux';
import dynamic from 'next/dynamic'
import { Pitch, Product, User } from '../../Models';
import { GiClothes, GiSoccerField, GiSonicShoes } from 'react-icons/gi';
import { HiUser } from 'react-icons/hi'
import Router from 'next/router';
import { RootState } from '../../redux/store';
import { Avatar, IconButton, ImageList, ImageListItem, Tooltip, Typography } from '@mui/material';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FiEdit } from 'react-icons/fi';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import { deepOrange } from '@mui/material/colors';
import { FaUsers } from 'react-icons/fa';
import ConfirmModal from "../../components/Modals/ConfirmModal"
import { setOpenFormEditUser } from '../../redux/features/isSlice';
import { setIdEditing } from '../../redux/features/userSlice';
import { getCookie } from 'cookies-next';
import jwt from "jsonwebtoken"
import Skeleton from '@mui/material/Skeleton';
import instance from '../../server/db/instance';
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
    const usersRef: { current: User[] } = useRef<User[]>([])
    const { tabData, tab, idDeleting, idEditing, typeProduct, isLoading } = state


    useLayoutEffect(() => {
        if (!token || user.role !== "admin") {
            Router.push("/")
        }

    }, [token])

    const getUser = (id: string) => {
        return usersRef.current?.find((u: User) => u.id === id)
    }

    useLayoutEffect(() => {
        if (user.role === "admin") {
            switch (tab) {
                case 0: {
                    instance.get("/users")
                        .then(res => {
                            setState({ ...state, tabData: res.data.users, isLoading: false })
                            usersRef.current = res.data.users
                        })
                }
                    break
                case 1: {
                    instance.get("/pitch")
                        .then(res => {
                            setState({ ...state, tabData: res.data.pitch, isLoading: false })
                        })
                }
                    break
                case 2: {
                    instance.get("/products")
                        .then(res => {
                            setState({ ...state, tabData: res.data.products?.filter((p: Product) => p.type === "clothes"), isLoading: false })
                        })
                }
                    break
                case 3: {
                    instance.get("/products")
                        .then(res => {
                            setState({ ...state, tabData: res.data.products?.filter((p: Product) => p.type === "sneakers"), isLoading: false })
                        })
                }
                    break
                default: return
            }
        }
    }, [tab, isUpdated])


    const handleChange = useCallback((e: React.SyntheticEvent, newValue: number) => {
        setTimeout(() => {
            setState({ ...state, tab: newValue, isLoading: true });
        }, 500)
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
                    tooltipTitle="Thêm người dùng"
                />
                <SpeedDialAction
                    onClick={() => setModalAddPitch(true)}
                    icon={<GiSoccerField className="text-orange-500 text-3xl" />}
                    tooltipTitle="Thêm sân"
                />
                <SpeedDialAction
                    onClick={handleShowModalAddClothes}
                    icon={<GiClothes className="text-orange-500 text-3xl" />}
                    tooltipTitle="Thêm áo thể thao"
                />
                <SpeedDialAction
                    onClick={handleShowModalAddShoes}
                    icon={<GiSonicShoes className="text-orange-500 text-3xl" />}
                    tooltipTitle="Thêm giày thể thao"
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
                    <Tab value={0} icon={<FaUsers className="text-4xl" />} label="Người dùng" />
                    <Tab value={1} icon={<GiSoccerField className="text-4xl" />} label="Sân bóng" />
                    <Tab value={2} icon={<GiClothes className="text-4xl" />} label="Áo thể thao" />
                    <Tab value={3} icon={<GiSonicShoes className="text-4xl" />} label="Giày thể thao" />
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
                                    STT</th>


                                {tab === 0 &&
                                    <th
                                        colSpan={1}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Ảnh đại diện"}</th>
                                }
                                {tab === 0 ?
                                    <th
                                        colSpan={1}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Tên"}</th>
                                    :
                                    <th
                                        colSpan={1}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left whitespace-nowrap text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {tab === 1 ? "Tên sân bóng" : "Tên sản phẩm"}</th>
                                }

                                {tab === 0 ?
                                    <th
                                        colSpan={1}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Họ"}</th>
                                    :
                                    <th
                                        colSpan={2}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {tab === 1 ? "Địa điểm" : "Mô tả"}</th>
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
                                        {"Giá"}</th>
                                }



                                {tab !== 1 && tab !== 0 &&
                                    <th
                                        colSpan={2}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Giảm giá"}</th>
                                }

                                {tab !== 0 && tab !== 1 &&
                                    <th
                                        colSpan={1}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Số lượng"}</th>
                                }

                                {tab !== 0 &&
                                    <th
                                        colSpan={2}
                                        className="px-6 py-3 text-xs font-medium leading-4 whitespace-nowrap text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {tab === 1 ? "Chủ sân" : "Chủ sản phẩm"}</th>
                                }



                                {tab === 0 ?
                                    <th
                                        colSpan={2}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Mật khẩu"}</th>
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
                                        {"Vai trò"}</th>
                                    :
                                    <th
                                        colSpan={2}
                                        className="px-6 py-3 text-xs font-medium leading-4  text-center text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                        {"Hình ảnh"}</th>

                                }
                                <th
                                    colSpan={2}
                                    className="px-6 py-3 text-xs font-medium leading-4  text-center text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                    Sửa</th>
                                <th
                                    colSpan={2}
                                    className="px-6 py-3 text-xs font-medium leading-4  text-center text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                    Xóa</th>
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
                                            <div className="text-sm leading-5 text-gray-500">{tab === 1 ? data.location : data.description !== "" ? data.description : "Không có mô tả"}</div>
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
                                            colSpan={2}
                                            className="px-6  border-b border-gray-200">
                                            <div className="text-sm text-center leading-5 text-gray-500"> {`${data.discount}%`}</div>
                                        </td>
                                    }
                                    {tab !== 0 && tab !== 1 &&
                                        <td
                                            colSpan={1}
                                            className="px-6  border-b border-gray-200">
                                            <div className="text-sm text-center whitespace-nowrap leading-5 text-gray-500"> {data?.amount}</div>
                                        </td>
                                    }
                                    {tab !== 0 &&
                                        <td
                                            colSpan={1}
                                            className="px-6  border-b border-gray-200">
                                            <div className="text-sm text-center whitespace-nowrap leading-5 text-gray-500"> {`${getUser(data.owner)?.firstName} ${getUser(data.owner)?.lastName} `}</div>
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
                                            colSpan={2}
                                            className="px-6  border-b border-gray-200">
                                            <div className="text-sm leading-5 text-gray-500"> {`${data.size?.sort((a: number | string, b: number | string) => typeof a === "number" && typeof b === "number" ? a - b : data.size)}`}</div>
                                        </td>
                                    }

                                    <td
                                        colSpan={1}
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