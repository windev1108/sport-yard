import React, { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { NextPage } from 'next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Avatar, Divider, IconButton, Skeleton, Typography } from '@mui/material';
import { deepOrange } from '@mui/material/colors';
import { AiFillBank, AiTwotoneMail } from 'react-icons/ai';
import { BsFillTelephoneFill } from 'react-icons/bs';
import { SiBitcoincash } from 'react-icons/si';
import { setOpenChatBox, setOpenFormEditUser, setOpenFormTransaction, setOpenProfileModal } from '../../redux/features/isSlice'
import { setIdEditing, setIdProfile } from '../../redux/features/userSlice';
import axios from 'axios';
import { setAction } from '../../redux/features/transactionSlice';
import dynamic from 'next/dynamic';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { GrClose, GrUserExpert, GrUserAdmin, GrUser } from 'react-icons/gr';
import { removeCookies, getCookie } from 'cookies-next';
import { RiUserFollowLine, RiUserLine, RiUserSettingsLine } from 'react-icons/ri';
const Balance = dynamic(() => import("../Balance"), { ssr: false })



interface State {
    isLoading: boolean
    userProfile: any
}


const ProfileModal: NextPage = () => {
    const token = getCookie("token")
    const dispatch = useDispatch()
    const { isUpdated, isOpenProfileModal }: any = useSelector<RootState>(state => state.is)
    const { idProfile, user }: any = useSelector<RootState>(state => state.user)
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [state, setState] = useState<State>({
        isLoading: true,
        userProfile: {}
    })
    const { userProfile, isLoading } = state


    useEffect(() => {
        axios.get(`/api/users/${idProfile}`)
            .then(res => {
                setTimeout(() => setState({ ...state, userProfile: res.data, isLoading: false }), 500)
            })
    }, [])


    const handleShowFormEdit = () => {
        dispatch(setOpenFormEditUser(true))
        dispatch(setOpenProfileModal(false))
        dispatch(setIdEditing(idProfile))
    }


    const handleOpenFormWithdraw = (event: React.MouseEvent) => {
        dispatch(setOpenFormTransaction(true))
        dispatch(setOpenProfileModal(false))
        dispatch(setAction("withdraw"))
    }
    const handleOpenFormDeposit = (event: React.MouseEvent) => {
        dispatch(setOpenFormTransaction(true))
        dispatch(setOpenProfileModal(false))
        dispatch(setAction("deposit"))
    }


    const handleClose = () => {
        dispatch(setOpenProfileModal(false))
        dispatch(setIdProfile(""))
    }

    const handleLogout = () => {
        removeCookies("token")
        dispatch(setOpenProfileModal(false))

    }

    const handleSendMessage = async () => {
        const isExistConversation = user.conversations.some((c: string) => c === idProfile)
        !isExistConversation && axios.put(`/api/users/${user.id}`, {
            conversations: [...user.conversations, idProfile]
        })
        dispatch(setOpenProfileModal(false))
        dispatch(setOpenChatBox(true))
    }
    return (
        <Dialog
            className="z-[10002]"
            fullScreen={fullScreen}
            open={isOpenProfileModal} onClose={handleClose} maxWidth="lg">
            <DialogTitle className="text-center items-center" fontWeight={700}>
                {isLoading ?
                    <div className="flex justify-center">
                        <Skeleton variant="rounded" width={90} height={30} />
                    </div>
                    :
                    <div>
                        <Typography className="!font-semibold text-lg" variant="body1" component="h1">
                            Hồ sơ
                        </Typography>
                        <div className="absolute right-1 top-2">
                            <IconButton
                                onClick={handleClose}
                            >
                                <GrClose />
                            </IconButton>
                        </div>
                    </div>
                }
            </DialogTitle>
            <Divider />
            <DialogContent className="lg:flex block justify-center lg:space-y-0 space-y-6 space-x-6 lg:w-[35rem]">
                <div className="lg:w-[40%] w-full ">
                    <div className="flex justify-center">
                        {isLoading ?
                            <Skeleton variant="circular" className="!w-36 !h-36" />
                            :
                            <Avatar
                                src={userProfile.avatar ? userProfile.avatar : ""}
                                className="!text-6xl !w-36 !h-36"
                                sx={{ bgcolor: deepOrange[500] }}>{userProfile?.firstName?.substring(0, 1)}</Avatar>
                        }
                    </div>
                </div>
                <div className="w-[60%]">
                    {isLoading ?
                        <Skeleton variant="text" width={100} />
                        :
                        <Typography fontWeight={700} variant="body1" component="h1">
                            {`${userProfile?.firstName} ${userProfile?.lastName}`}
                        </Typography>
                    }


                    {isLoading ?
                        <Skeleton variant="text" width={200} />
                        :
                        <div className="flex gap-2 items-center">
                            <AiTwotoneMail color="#ef8e19" size={20} />
                            <Typography variant="body1" component="h1">
                                {userProfile?.email}
                            </Typography>
                        </div>

                    }

                    {isLoading ?
                        <Skeleton variant="text" width={200} />
                        :
                        <div className="flex gap-2 items-center">
                            <BsFillTelephoneFill color="#ef8e19" size={18} />
                            <Typography variant="body1" component="h1">
                                {userProfile.phone ? `+84${userProfile.phone}` : "No contact"}
                            </Typography>
                        </div>

                    }

                    {isLoading ?
                        <Skeleton variant="text" width={200} />
                        :
                        <div className="flex gap-2 items-center">
                            {user?.role === "admin" &&
                                <RiUserSettingsLine color="#ef8e19" size={22} />
                            }
                            {user?.role === "owner" &&
                                <RiUserFollowLine color="#ef8e19" size={22} />
                            }
                            {user?.role === "customer" &&
                                <RiUserLine color="#ef8e19" size={22} />
                            }
                            <Typography variant="body1" component="h1">
                                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                            </Typography>
                        </div>

                    }
                    {isLoading ?
                        <Skeleton variant="text" width={200} />
                        :
                        <div className="">
                            <div className="flex space-x-2">
                                <AiFillBank color="#ef8e19" size={20} />
                                {userProfile.banks?.length > 0 ?
                                    <Typography fontWeight={600} variant="body1" component="h1">
                                        {idProfile === user.id ? userProfile?.banks[0].name : "*********"}
                                    </Typography>

                                    :
                                    <Typography variant="body1" component="h1">
                                        {"No payment method yet"}
                                    </Typography>
                                }
                            </div>
                            {userProfile.banks?.length > 0 && idProfile === user.id &&
                                <Typography className="" fontWeight={600} variant="body1" component="h1">
                                    {`${userProfile?.banks[0].bankCode} / ${userProfile?.banks[0].accountNumber}`}
                                </Typography>
                            }
                        </div>
                    }
                    {isLoading ?
                        <Skeleton variant="text" width={100} />
                        :
                        <div className="flex gap-2 items-center">
                            <SiBitcoincash className="rotate-[20deg]" color="#ef8e19" size={20} />
                            {idProfile === user.id ?
                                <Balance />
                                :
                                <span className="translate-y-1">
                                    ************
                                </span>
                            }
                        </div>
                    }
                </div>
            </DialogContent>
            <DialogActions className="flex w-full items-center  bg-gray-100">
                {token && user.id === idProfile &&
                    <div className="flex  justify-between space-x-2 w-full">
                        <div className="flex space-x-2">
                            {isLoading
                                ?
                                <Skeleton variant="rounded" width={80} height={35} />
                                :
                                <Button
                                    onClick={handleOpenFormDeposit}
                                    className="!bg-[#ff9c00] !text-white">Nạp tiền</Button>
                            }
                            {isLoading ?
                                <Skeleton variant="rounded" width={90} height={35} />
                                :
                                <Button
                                    onClick={handleOpenFormWithdraw}
                                    className="!bg-[#018833] !text-white">Rút tiền</Button>
                            }
                        </div>
                        <div className="flex space-x-2">
                            {isLoading ?
                                <Skeleton variant="rounded" width={62} height={35} />
                                :
                                <div>
                                    <Button onClick={handleShowFormEdit} className="justify-self-start !bg-[#007FFF] !text-white" variant="contained">Sửa thông tin</Button>
                                </div>
                            }
                            {isLoading ?
                                <Skeleton variant="rounded" width={62} height={35} />
                                :
                                <div>
                                    <Button onClick={handleLogout} className="!bg-primary justify-self-start  !text-white" variant="contained">Đăng xuất</Button>
                                </div>
                            }
                        </div>
                    </div>
                }
                {token && user.id !== idProfile &&
                    <div>
                        {isLoading
                            ?
                            <Skeleton variant="rounded" width={80} height={35} />
                            :
                            <Button
                                onClick={handleSendMessage}
                                className="!bg-primary !text-white">Nhắn tin</Button>
                        }
                    </div>
                }
            </DialogActions>
        </Dialog >
    )
}

export default React.memo(ProfileModal)


