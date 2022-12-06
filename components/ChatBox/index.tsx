import { IconButton, Tooltip, Avatar } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Message, User } from '../../Models';
import { RootState } from '../../redux/store';
import { deepOrange } from '@mui/material/colors';
import { setOpenChatBox, setOpenProfileModal } from '../../redux/features/isSlice';
import { IoMdCall, IoMdClose, IoMdSend } from 'react-icons/io'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { BsChevronCompactUp, BsEmojiSmile } from 'react-icons/bs';
import { RiVideoLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import moment from 'moment';
import { CgProfile } from 'react-icons/cg'
import { GrUserAdmin } from 'react-icons/gr';
import { AiFillPicture, AiOutlineCloseCircle, AiOutlineUpload } from 'react-icons/ai';
import EmojisPicker from '../EmojisPicker';
import LinearProgress from '@mui/material/LinearProgress';
import useSWR from 'swr';
import { setIdProfile } from '../../redux/features/userSlice';
import Link from 'next/link';
import { getCookie } from 'cookies-next';
import jwt from "jsonwebtoken"
import io from 'socket.io-client'




interface State {
    conversations: User[]
    messages: Message[]
    users: User[],
    userSelected: any
    message: string
    previewBlobs: {
        name: string
        preview: string
    }[]
    pictures: {}[]
    isOpenChatMessage: boolean
    isFadeDownChatBox: boolean
    isLoading: boolean
    isUploaded: boolean
    isOpenOptionInfo: boolean
}

interface SocketUser {
    socketId?: string
    userId: string
    typing?: boolean
    receiverId?: string
}
interface TimeLine {
    inTime: number
    messages?: Message[]
}

let socket: any

const ChatBox = () => {
    const dispatch = useDispatch()
    const [state, setState] = useState<State>({
        conversations: [],
        messages: [],
        users: [],
        userSelected: {},
        pictures: [],
        message: "",
        previewBlobs: [],
        isOpenChatMessage: false,
        isFadeDownChatBox: false,
        isUploaded: false,
        isLoading: false,
        isOpenOptionInfo: false
    })
    const { isOpenChatBox }: any = useSelector<RootState>(state => state.is)
    const { user }: any = useSelector<RootState>(state => state.user)
    const { conversations, users, messages, message, previewBlobs, pictures, userSelected, isUploaded, isLoading, isOpenChatMessage, isOpenOptionInfo, isFadeDownChatBox } = state
    const [showEmojis, setShowEmojis] = useState(false)
    const [usersOnline, setUsersOnline] = useState<SocketUser[]>([])
    const [urls, setUrls] = useState<string[]>([])
    const [emoji, setEmoji] = useState<{ native: string } | any>({})
    const messageEndRef = useRef<any>(null)
    const messageRef = useRef<any>()


    const toggleChatBox = () => {
        dispatch(setOpenChatBox(!isOpenChatBox))
    }




    const hideChatMessage = () => {
        setState({ ...state, isOpenChatMessage: false, isFadeDownChatBox: false })
        setTimeout(() => {
            setState({ ...state, userSelected: {}, isOpenChatMessage: false, isFadeDownChatBox: false })
        }, 500)
    }


    const fetcher = async (url: string) => {
        const res = await axios.get(url)
        messageEndRef.current && scrollToBottom()
        return res.data.messages?.filter((m: Message) => m.senderId === user.id && m.receiverId === userSelected.id || m.receiverId === user.id && m.senderId === userSelected.id)
    }



    const { data, mutate } = useSWR(userSelected.id ? "/api/messages" : null, fetcher)

    useEffect(() => {

        socketInitializer()


        return () => {
            socket.disconnect()
        }

    }, [])


    const socketInitializer = async () => {
        const token: any = getCookie("token")
        const { id }: any = jwt.decode(token)
        await fetch('/api/socket')
        socket = io("/")

        socket.on('connect', () => {
            console.log('connected')
            id && socket?.emit("user-connected", { userId: id })

        })
        socket.on("users-online", (data: SocketUser[]) => {
            setUsersOnline(data)
        })
    }


    useEffect(() => {
        mutate()
        setTimeout(() => {
            scrollToBottom()
        }, 300)
        setState({ ...state, isOpenOptionInfo: false })
    }, [userSelected.id])

    useEffect(() => {
        getConversations()
    }, [isOpenChatBox , user])

    const getConversations = async () => {
        const resUsers = await axios.get('/api/users')
        setState({
            ...state,
            users: resUsers.data.users,
            conversations:
                user.conversations?.map((conversation: string) => {
                    return resUsers.data.users.find((u: User) => u.id === conversation)
                })
        })
    }


    const handleSendMessage = async (e: any) => {
        e.preventDefault();
        const { data }: any = await axios.get(`/api/users/${userSelected.id}`)
        const checkIsExistConversations = data?.conversations.some((conversation: string) => conversation === user.id)

        if (pictures.length) {
            if (urls.length === previewBlobs.length && isUploaded) {
                setState({ ...state, pictures: [], previewBlobs: [] })
                await axios.post("/api/messages", {
                    senderId: user.id,
                    receiverId: userSelected.id,
                    pictures: urls,
                    type: "images"
                })
                !checkIsExistConversations && axios.put(`/api/users/${userSelected.id}`, {
                    conversations: [...data.conversations, user.id]
                })
            } else {
                toast.info("Vui lòng thử lại sau", { autoClose: 3000, theme: "colored" })
            }
            await mutate()
        } else if (message) {
            setState({ ...state, message: "" })
            await axios.post("/api/messages", {
                senderId: user.id,
                receiverId: userSelected.id,
                message,
                type: "text"
            })
            await mutate()
            setTimeout(() => {
                scrollToBottom()
            }, 300)
            !checkIsExistConversations && axios.put(`/api/users/${userSelected.id}`, {
                conversations: [...data.conversations, user.id]
            })
        } else {
            toast.info("Vui lòng nhập tin nhắn", { autoClose: 3000, theme: "colored" })
        }
    }


    const getUser = (id: string) => {
        const user = users.find((u: User) => u.id === id)
        return user
    }

    const handleShowMessage = (userSelected: User) => {
        setState({ ...state, userSelected, isOpenChatMessage: true })
    }

    useEffect(() => {
        setState({ ...state, message: `${message} ${emoji?.native}` })
        messageRef?.current?.focus()
    }, [emoji])


    const handleDeleteBlob = (name: string) => {
        setState({ ...state, previewBlobs: previewBlobs?.filter(blob => blob.name !== name), pictures: Array.from(pictures)?.filter((pic: any) => pic.name !== name) })
    }

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const onFileChange = (e: any) => {
        const files = e.target.files

        const results = Array.from(files).map((file: any) => {
            return {
                preview: URL?.createObjectURL(file),
                name: file.name
            }
        })
        setState({ ...state, previewBlobs: results, pictures: files, message: "" })
    }

    const handleUploadPictures = (e: any) => {
        e.preventDefault()
        setState({ ...state, isLoading: true })
        Array.from(pictures).forEach(async (picture: any) => {
            const formData = new FormData()
            formData.append("file", picture)
            formData.append('upload_preset', 'my-uploads');
            const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDNAME}/image/upload`, formData)
            setUrls((prev: string[]) => [...prev, data.url])
        });
        setState({ ...state, isUploaded: true, isLoading: false })
    }



    useEffect(() => {
        socket?.emit("user-typing", { userId: user.id, receiverId: userSelected.id, typing: Boolean(message) })
    }, [message])

    const handleOpenProfile = (id: string) => {
        dispatch(setOpenProfileModal(true))
        dispatch(setIdProfile(id))
    }


    return (
        <>
            <div className={`${isOpenChatBox ? "translate-y-0" : "translate-y-[90%]"} z-[1002] origin-bottom-right w-[40vw] lg:w-[288px]  transition-all duration-700 ease-in-out fixed bottom-0 right-1  shadow-md h-[30rem]`}>
                <div
                    onClick={toggleChatBox}
                    className={`${isOpenChatMessage ? "rounded-tr-lg" : "rounded-t-lg"} shadow-lg transition-all duration-700 ease-in-out border-[1px] border-gray-300 !bg-white flex items-center h-[47px]  !p-1 cursor-pointer`}>
                    <div className="flex justify-between w-full items-center px-2">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Avatar src={user.avatar} sx={{ bgcolor: deepOrange[500] }} alt="" className="w-8 h-8" >{user.firstName?.substring(0, 1)}
                                </Avatar>
                                <div className="bg-primary absolute -bottom-[2px] -right-[3px] w-[.90rem] h-[.90rem] rounded-full border-[3px] border-white"></div>
                            </div>
                            <span className="font-semibold">Chat</span>
                        </div>
                        <IconButton className={`${isOpenChatBox ? "rotate-[180deg]" : "rotate-0"}`}>
                            <BsChevronCompactUp className="text-gray-500" size={25} />
                        </IconButton>
                    </div>

                </div>
                <div className="max-h-full border-l-[1px] overflow-y-scroll scrollbar scrollbar-thumb-gray-500 scrollbar-track-gray-300 bg-white h-full border-gray-300  w-full">
                    {conversations?.map((conversation: User) => (
                        <div
                            onClick={() => handleShowMessage(conversation)}
                            key={conversation?.id} className={`${conversation?.id === userSelected.id && "bg-gray-200"} flex p-2 hover:bg-gray-100 cursor-pointer items-center px-5 space-x-2`}>
                            <div className="relative">
                                <Avatar alt="" src={conversation.avatar} sx={{ bgcolor: deepOrange[500] }} >{conversation.firstName?.substring(0, 1)}
                                </Avatar>
                                <div className={`${usersOnline.some((u: SocketUser) => u.userId === conversation.id) ? "bg-primary text-primary animate-ripple" : "bg-[#BDBDBD]"} absolute bottom-0 right-0 border-[3px] border-white w-[.90rem] h-[.90rem] rounded-full`}></div>
                            </div>
                            <div>
                                <div className="flex space-x-2 items-center">
                                    <span className="flex text-sm font-semibold text-black">{`${conversation?.firstName} ${conversation?.lastName}`}</span>
                                    {conversation?.id === process.env.NEXT_PUBLIC_ADMIN_ID &&
                                        <GrUserAdmin className="text-primary" />
                                    }
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isOpenChatMessage &&
                <div className={`
            ${isFadeDownChatBox && "lg:translate-y-[90%] lg:!w-[250px]"} 
            z-[1002] fixed lg:right-[18.2rem] left-0 lg:left-auto top-0 lg:top-auto border-[1px] border-gray-300 lg:w-[25rem] w-screen h-screen  lg:h-[30rem] bg-white lg:bottom-0 bottom-0 origin-left transition-all duration-700 ease-in-out`}>
                    <div className="h-full">
                        <div
                            className="relative h-[10%] flex cursor-pointer px-2 items-center border-[1px]">
                            <div
                                onClick={() => setState({ ...state, isFadeDownChatBox: !isFadeDownChatBox })}
                                className="absolute  z-20 top-0 left-0 right-0 bottom-0">

                            </div>
                            <div
                                className="relative z-10 flex space-x-3 items-center">
                                <div className="relative">
                                    <Avatar src={userSelected.avatar} sx={{ bgcolor: deepOrange[500] }} alt="Remy Sharp" className="w-8 h-8" >{userSelected.firstName?.substring(0, 1)}</Avatar>
                                    <div className={`${usersOnline.some((u: SocketUser) => u.userId === userSelected.id) ? "bg-primary text-primary animate-ripple" : "bg-[#BDBDBD]"} absolute -bottom-[2px] -right-[3px] w-[.90rem] h-[.90rem] rounded-full border-[3px] border-white`}></div>
                                </div>
                                <div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-black">{`${userSelected.firstName} ${userSelected.lastName}`}</span>

                                    </div>
                                    {usersOnline.some((u: SocketUser) => u.userId === userSelected.id) &&
                                        <span className="flex text-xs">Đang hoạt động</span>
                                    }
                                </div>
                            </div>
                            <div className="z-30">
                                <IconButton
                                    onClick={() => setState({ ...state, isOpenOptionInfo: !isOpenOptionInfo })}
                                >
                                    <FiChevronDown className={`${isOpenOptionInfo && "lg:rotate-[180deg] rotate-[-180deg] "} transition-all duration-700 ease-in-out`} />
                                </IconButton>
                                <div className={`${isOpenOptionInfo ? "scale-100" : "scale-0"} ${userSelected.phone ? "lg:top-[-150%] bottom-[-100%] lg:bottom-auto" : "lg:top-[-80%] bottom-[-50%] lg:bottom-auto"} origin-bottom-right absolute -left-[0%] transition-all duration-700 ease-in-out bg-white shadow-md border-[1px] border-gray-300 w-[9rem]`}>
                                    <div onClick={() => handleOpenProfile(userSelected?.id!)} className="flex space-x-2 items-center px-3 py-1 hover:bg-gray-200">
                                        <CgProfile className="text-primary" size={20} />
                                        <span className="font-semibold">Xem hồ sơ</span>
                                    </div>
                                    {userSelected.phone &&
                                        <div className="flex items-center px-3 py-1 space-x-2 w-full hover:bg-gray-200">
                                            <IoMdCall size={20} className="text-primary" />
                                            <Link href={`tel:${userSelected.phone}`} >
                                                <a className="font-semibold">
                                                    Gọi
                                                </a>
                                            </Link>
                                        </div>
                                    }
                                </div>
                            </div>
                            <IconButton
                                className="z-30 absolute right-1"
                                onClick={hideChatMessage}
                            >
                                <IoMdClose />
                            </IconButton>
                        </div>
                        <div className="relative h-[70%] w-full overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ">
                            {data && typeof data !== "string" && data?.map((item: Message, index: number) => (
                                <div key={item.id} className="flex flex-col w-full p-2">
                                    {/* <span className="text-center text-xs">{new Date(item.timestamp).getDate() === new Date().getDate() ? moment(item.timestamp).fromNow() : dayjs(item.timestamp).locale("vi-VN").format("dddd DD-MM-YYYY")}</span> */}
                                    <div className={`${item.senderId === user.id ? "justify-end" : "justify-start"} flex w-full`}>
                                        {item.type === "text" &&
                                            <div className={`flex max-w-[50%] space-x-2`}>
                                                {item.senderId !== user.id
                                                    &&
                                                    <Avatar src={getUser(item.senderId)?.avatar} sx={{ bgcolor: deepOrange[500] }} alt="" className="w-8 h-8" >{getUser(item.senderId)?.firstName?.substring(0, 1)}
                                                    </Avatar>
                                                }
                                                <span className={`${item.senderId === user.id ? "bg-[#d7e4ff]" : "bg-gray-100"} px-3 text-black py-2 text-sm rounded-md max-w-[100%]`}>{item.message}</span>
                                            </div>
                                        }
                                        {item.type === "images" &&
                                            <div className={`${item.pictures.length >= 3 ? "grid-cols-3" : `grid-cols-${item.pictures.length}`} max-w-[50%] gap-1 grid h-auto`}>
                                                {item.pictures?.map((item) => (
                                                    <img className="transition-all duration-700 ease-in-out object-cover h-full" key={item} src={item} alt="" />
                                                ))}
                                            </div>
                                        }
                                    </div>
                                    {index === data?.length - 1 && usersOnline.find((u: SocketUser) => u.userId === userSelected.id)?.receiverId === user.id && usersOnline.find((u: SocketUser) => u.userId === userSelected.id)?.typing &&
                                        <div className="relative flex items-center py-2 space-x-12">
                                            <Avatar src={getUser(userSelected.id)?.avatar} sx={{ bgcolor: deepOrange[500] }} alt="" className="w-8 h-8" >{getUser(userSelected.id)?.firstName?.substring(0, 1)}
                                            </Avatar>

                                            <Tooltip title={`${getUser(userSelected.id)?.firstName} ${getUser(userSelected.id)?.lastName} đang nhập tin nhắn`}>
                                                <div className="!ml-2 px-4 rounded-lg bg-gray-100" data-title="dot-typing">
                                                    <div className="flex items-center justify-center px-3 py-3 stage">
                                                        <div className="dot-typing"></div>
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </div>
                                    }
                                    {index === data?.length - 1 && <div ref={messageEndRef} className="w-full"></div>}
                                </div>
                            ))}

                        </div>
                        <div className="h-[20%] relative items-center w-full border-t-[1px] border-gray-300">
                            {isLoading &&
                                <div className="absolute -top-1 left-0 right-0">
                                    <LinearProgress />
                                </div>
                            }
                            {previewBlobs.length > 0 &&
                                <div className="absolute gap-1 z-10 grid grid-cols-3 top-0 right-0 left-0 h-20 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 overflow-y-scroll overflow-x-hidden  w-[65%] items-center">
                                    {previewBlobs?.map((item) => (
                                        <div className="relative" key={item.name}>
                                            <img className="object-cover w-full h-[5rem]" src={item.preview} alt="" />
                                            <IconButton
                                                onClick={() => handleDeleteBlob(item.name)}
                                                className="absolute -top-2 -right-2">
                                                <AiOutlineCloseCircle className="text-primary" size={20} />
                                            </IconButton>
                                        </div>
                                    ))}
                                </div>
                            }
                            <div className="h-1/2 flex items-center justify-end space-x-2 px-3">
                                <div className="relative">
                                    <IconButton
                                        onClick={() => setShowEmojis(!showEmojis)}
                                    >
                                        <BsEmojiSmile size={18} className="text-yellow-500" />
                                    </IconButton>
                                    {showEmojis &&
                                        <EmojisPicker setEmoji={setEmoji} setShowEmoji={setShowEmojis} />
                                    }
                                </div>

                                <IconButton>
                                    <label
                                        onChange={onFileChange}
                                        className="cursor-pointer"
                                        htmlFor="uploadPictures">
                                        <input
                                            hidden
                                            multiple
                                            accept="image/*"
                                            id="uploadPictures"
                                            type="file" />
                                        <AiFillPicture size={18} className="text-yellow-500" />
                                    </label>
                                </IconButton>
                                <IconButton>
                                    <RiVideoLine size={18} className="text-yellow-500" />
                                </IconButton>

                            </div>
                            <form
                                onSubmit={previewBlobs.length && !isUploaded ? handleUploadPictures : handleSendMessage}
                                className="h-1/2 flex  border-gray-300">
                                <div className="w-full flex-1">
                                    {previewBlobs.length === 0 &&
                                        <input
                                            onChange={(e) => setState({ ...state, message: e.target.value })}
                                            value={message}
                                            ref={messageRef}
                                            className="px-4 text-black  text-sm outline-none bg-transparent placeholder:text-sm" type="text" placeholder="Gửi tin nhắn" />
                                    }
                                </div>
                                <Tooltip title="Send message">
                                    <IconButton
                                        type='submit'
                                    >
                                        {previewBlobs.length && !isUploaded ?
                                            <AiOutlineUpload className="text-primary" />
                                            :
                                            <IoMdSend className="text-primary" />
                                        }
                                    </IconButton>
                                </Tooltip>
                            </form>

                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default ChatBox