import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, Skeleton, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { NextPage } from 'next'
import React, { useEffect, useState, memo, useMemo } from 'react'
import { GrNext, GrPrevious } from 'react-icons/gr'
import { BiTime } from "react-icons/bi"
import { toast } from 'react-toastify'
import { Order, Pitch, Slot, User } from '../../Models'
import Currency from 'react-currency-formatter';
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { setIsUpdate, setOpenBackdropModal, setOpenNotificationDetail, setOpenPaymentModal } from '../../redux/features/isSlice'
import { setIdOrder } from '../../redux/features/ordersSlice'
import { GiSoccerField } from 'react-icons/gi'
import axios from 'axios'
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton'
import { AiOutlineClose } from 'react-icons/ai'
import { getCookie } from 'cookies-next'
import instance from '../../server/db/instance'


interface Props {
    open: boolean,
    pitch: Pitch
    date: any
    setOpen: (a: boolean) => void
    changeDate: (a: any) => void
}

interface State {
    duration: number
    slot: number
    total: number
    size: number
    orders: Order[]
    owner: User | any
    isLoading: boolean
    city: string
    weather: string
    icon: string
    temperature: number
    humidity: number
    windspeed: number
}

const BookingPitchModal: NextPage<Props> = ({ date, pitch, open, changeDate, setOpen }) => {
    const token = getCookie("token")
    const dispatch = useDispatch()
    const { user }: any = useSelector<RootState>(state => state.user)
    const { isUpdated }: any = useSelector<RootState>(state => state.is)
    const [state, setState] = useState<State>({
        duration: 0,
        slot: 0,
        total: 0,
        size: 0,
        orders: [],
        owner: {},
        isLoading: true,
        city: "",
        weather: "",
        icon: "",
        temperature: 0,
        humidity: 0,
        windspeed: 0,
    })

    const { duration, slot, total, size, orders, owner, city, weather, temperature, humidity, windspeed, icon, isLoading } = state
    const theme = useTheme();
    const fullscreen = useMediaQuery(theme.breakpoints.down('md'));




    useEffect(() => {
        instance.get("/orders")
            .then(resOrder => {
                instance.get(`/users/${pitch.owner}`)
                    .then(resUser => {
                        axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${pitch.coordinates.latitude}&lon=${pitch.coordinates.longitude}&cnt=${date.getDate()}&units=metric&lang=vi&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_APIKEY}`)
                            .then(resWeather => {
                                setState({ ...state, city: "Đà Nẵng", weather: resWeather.data.weather[0].description, icon: resWeather.data.weather[0].icon, temperature: Math.round(resWeather.data.main.temp), humidity: resWeather.data.main.humidity, windspeed: +(resWeather.data.wind.speed * 3.6).toFixed(2), orders: resOrder.data.orders, owner: resUser.data, isLoading: false })
                            })
                    })
            })
    }, [])



    useMemo(() => {
        const slotFound: Slot | undefined = pitch.slots.find(s => +s.id === slot)
        if (size === 5) {
            setState({ ...state, total: Math.round(+slotFound?.price! / 60 * duration - +slotFound?.price! / 60 * duration / 100 * 50) })
        } else if (size === 7) {
            setState({ ...state, total: Math.round(+slotFound?.price! / 60 * duration - +slotFound?.price! / 60 * duration / 100 * 25) })
        } else if (size === 11) {
            setState({ ...state, total: Math.round(+slotFound?.price! / 60 * duration) })
        } else {
            return
        }
    }, [duration, slot, size])


    const handleClose = () => {
        setOpen(false)
    }

    const handleNexDate = () => {
        const day = new Date(date)
        setState({ ...state, slot: 0 })
        changeDate(new Date(day.setDate(day.getDate() + 1)))

    }

    const handlePrevDate = () => {
        const dateNow = new Date(Date.now())
        const day = new Date(date)
        setState({ ...state, slot: 0 })
        if (date.getMonth() === dateNow.getMonth() && date.getDate() <= dateNow.getDate()) {
            toast.info("Không thể quay lại ngày đã qua", { autoClose: 3000, theme: "colored" })
        } else {
            changeDate(new Date(day.setDate(day.getDate() - 1)))
        }
    }

    const handleBooking = () => {
        if (!token) {
            toast.info("Vui lòng đăng nhập", { autoClose: 3000, theme: "colored" })
        } else if (pitch.owner === user.id) {
            toast.info("Không thể tự đặt sân của chính mình", { autoClose: 3000, theme: "colored" })
        } else if (user.role !== "customer") {
            toast.info(`Không thể đặt sân với vai trò ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`, { autoClose: 3000, theme: "colored" })
        } else if (!slot || !duration || !size) {
            toast.info("Vui lòng hoàn thành booking", { autoClose: 3000, theme: "colored" })
        } else {
            if (owner.id) {
                const formData: any = {
                    type: "booking",
                    senderId: user.id,
                    receiverId: "",
                    duration,
                    ordererId: user.id,
                    ownerId: owner.id!,
                    location: pitch.location,
                    productId: pitch.id,
                    slot,
                    time: `${pitch.slots.find(s => s.id === slot)?.start} - ${pitch.slots.find(s => s.id === slot)?.end}`,
                    size,
                    total,
                    nameProduct: pitch.name,
                    date,
                    contactOrderer: user.phone ?? "",
                    ownerName: `${owner.firstName} ${owner.lastName}`,
                    ordererName: `${user.firstName} ${user.lastName}`,
                    status: 0,
                }
                dispatch(setOpenBackdropModal(true))
                setTimeout(async () => {
                    const { data }: { data: { id: string } } = await instance.post("/orders", formData)
                    dispatch(setIdOrder(data.id))
                    dispatch(setOpenBackdropModal(false))
                    dispatch(setOpenNotificationDetail(true))
                    dispatch(setIsUpdate(!isUpdated))
                    setOpen(false)
                }, 1500)
            }
        }
    }


    const handleInValidDate = (start: number) => {
        const dateNow = new Date()
        if (dateNow.getDate() > date.getDate()) {
            return true
        } else if (dateNow.getDate() === date.getDate() && dateNow.getMonth() === date.getMonth() && dateNow.getHours() > start) {
            return true
        } else {
            return false
        }
    }



    const handleInvalidSlot = (slot: number) => {
        const orderSameDate: Order[] = orders?.filter((order: Order) => new Date(order.date!).getDate() === date.getDate() && order.status === 3 && order.productId === pitch.id)
        if (orderSameDate.some((order: Order) => order.slot === slot) || pitch?.booked?.some((b) => b.slot === slot && new Date(b.date).getDate() === new Date(date).getDate())) {
            return true
        } else {
            return false
        }
    }

    const handleSelectSlot = (slot: number) => {
        setState({ ...state, slot })
    }



    const handleLockSlot = (slot: number) => {
        instance.put(`/pitch/${pitch.id}`, {
            booked: pitch?.booked ? [...pitch?.booked, {
                slot,
                date
            }] :
                [{ slot, date }]
        })
        dispatch(setIsUpdate(!isUpdated))
        setOpen(false)
        toast.success("Lock slot thành công", { autoClose: 3000, theme: "colored" })
    }

    const handleDeleteSlot = (slot: number) => {
        const newSlots = pitch.slots?.filter(s => s.id !== slot)

        instance.put(`/pitch/${pitch.id}`, {
            slots: newSlots.map((s, index: number) => {
                return {
                    ...s,
                    id: index + 1,
                }
            })
        })
        dispatch(setIsUpdate(!isUpdated))
        setOpen(false)
        toast.success("Xóa slot thành công", { autoClose: 3000, theme: "colored" })
    }

    return (
        <Dialog
            fullScreen={fullscreen}
            maxWidth={"lg"}
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
        >
            <DialogTitle className="p-3">
                <Typography fontWeight={700} variant="body1" component="span">
                    {`Book a Field on ${pitch.name}`}
                </Typography>
                <IconButton
                    className="absolute top-2 right-0"
                    onClick={handleClose}
                >
                    <AiOutlineClose size={20} />
                </IconButton>
            </DialogTitle>
            <DialogContent className="lg:p-4 p-2" dividers>
                <div className="flex-col space-y-2 w-full lg:w-[35rem]">
                    <div className="relative bg-gradient-to-b from-cyan-500 to-blue-500">
                        {isLoading ?
                            <div className="absolute left-[10%] top-[42%] ">
                                <Skeleton className="text-center" variant="rounded" width={80} height={40} />
                            </div>
                            :
                            <div className="absolute left-[10%] top-[20%] ">
                                <img className="object-cover" src={`http://openweathermap.org/img/wn/${icon}@2x.png`} />
                            </div>
                        }
                        {isLoading ?
                            <div className="absolute right-[10%] top-[42%] ">
                                <Skeleton className="text-center" variant="rounded" width={80} height={40} />
                            </div>
                            :
                            <div className="absolute right-[10%] top-[20%] ">
                                <img className="object-cover" src={`http://openweathermap.org/img/wn/${icon}@2x.png`} />
                            </div>
                        }
                        {isLoading ?
                            <div className="flex justify-center">
                                <Skeleton className="text-center" variant="text" width={100} height={35} />
                            </div>
                            :
                            <Typography textAlign={"center"} color="#fff" fontWeight={700} fontSize={18} variant="body1" component="h1">
                                {city}
                            </Typography>
                        }
                        {isLoading ?
                            <div className="flex justify-center">
                                <Skeleton className="text-center" variant="text" width={80} height={30} />
                            </div>
                            :
                            <Typography textAlign={"center"} color="#fff" fontSize={14} variant="body1" component="h1">
                                {weather.charAt(0).toUpperCase() + weather.slice(1)}
                            </Typography>
                        }

                        {isLoading ?
                            <div className="flex justify-center">
                                <Skeleton className="text-center" variant="text" width={100} height={50} />
                            </div>
                            :
                            <Typography textAlign={"center"} color="#fff" fontSize={40} variant="body1" component="h1">
                                {`${temperature}°C`}
                            </Typography>
                        }
                        <div className="flex justify-between px-2 pt-2">
                            {isLoading ?
                                <Skeleton className="text-center" variant="text" width={100} />
                                :
                                <div className="flex space-x-1">
                                    <Typography color="#fff" fontSize={16} variant="body1" component="h1">
                                        Độ ẩm :
                                    </Typography>
                                    <Typography fontWeight={700} color="#fff" fontSize={16} variant="body1" component="h1">
                                        {`${humidity}%`}
                                    </Typography>
                                </div>
                            }
                            {isLoading ?
                                <Skeleton className="text-center" variant="text" width={100} />
                                :
                                <div className="flex space-x-1">
                                    <Typography color="#fff" fontSize={16} variant="body1" component="h1">
                                        Gió :
                                    </Typography>
                                    <Typography fontWeight={700} color="#fff" fontSize={16} variant="body1" component="h1">
                                        {`${windspeed}km/h`}
                                    </Typography>
                                </div>
                            }
                        </div>

                    </div>
                    <div className="flex-start">
                        <Typography
                            variant="body1" component="span">
                            Select a Date
                        </Typography>
                    </div>
                    <div className="flex rounded-lg justify-between items-center border-gray-200 border-[1px] p-1">
                        <Button
                            className="lg:!text-sm !text-xs  !text-primary"
                            onClick={handlePrevDate}
                            variant="text" startIcon={<GrPrevious />}>
                            Past Day
                        </Button>
                        <Typography className="lg:!text-base text-sm" variant="body1" component="span">
                            {date.toString().substring(0, 15)}
                        </Typography>
                        <Button
                            className="lg:!text-sm !text-xs !text-primary"
                            onClick={handleNexDate}
                            variant="text" endIcon={<GrNext />}>
                            Next day
                        </Button>
                    </div>
                    <div className="flex-start">
                        <Typography variant="body1" component="span">
                            Available  sizes
                        </Typography>
                    </div>

                    <Grid container spacing={1}>
                        {pitch.size.map(s => (
                            <Grid key={s} item lg={4}>
                                <Button variant={size === s ? "contained" : "outlined"} onClick={() => setState({ ...state, size: +s })} className={`w-[33.33%] !border-primary ${size === +s && "!bg-primary"} flex space-x-1 !w-full`} >
                                    <GiSoccerField className={`${size === +s && "text-[#fff]"} text-primary`} size={24} />
                                    <Typography color={size === +s ? "#fff" : "#666"} variant="body1" component="span">
                                        {`${+s} v ${+s}`}
                                    </Typography>
                                </Button>
                            </Grid>
                        ))}
                    </Grid>

                    <div className="flex-start">
                        <Typography variant="body1" component="h1">
                            Duration
                        </Typography>
                    </div>
                    <div className="flex justify-around space-x-2">
                        <Button variant={duration === 60 ? "contained" : "outlined"} onClick={() => setState({ ...state, duration: 60 })} className={`w-[33.33%] !border-primary ${duration === 60 && "flex justify-center items-center !bg-primary"} flex space-x-1`} >
                            <BiTime size={20} />
                            <Typography className="lg:text-base text-sm whitespace-nowrap" color={duration === 60 ? "#fff" : "#666"} variant="body1" component="span">
                                60 mins
                            </Typography>
                        </Button>
                        <Button variant={duration === 90 ? "contained" : "outlined"} onClick={() => setState({ ...state, duration: 90 })} className={`w-[33.33%] !border-primary ${duration === 90 && "flex justify-center items-center !bg-primary"} flex space-x-1`} >
                            <BiTime size={20} />
                            <Typography className="lg:text-base text-sm whitespace-nowrap" color={duration === 90 ? "#fff" : "#666"} variant="body1" component="span">
                                90 mins
                            </Typography>
                        </Button>
                        <Button variant={duration === 120 ? "contained" : "outlined"} onClick={() => setState({ ...state, duration: 120 })} className={`w-[33.33%] !border-primary ${duration === 120 && "flex justify-center items-center !bg-primary"} flex space-x-1`} >
                            <BiTime size={20} />
                            <Typography className="lg:text-base text-sm whitespace-nowrap" color={duration === 120 ? "#fff" : "#666"} variant="body1" component="span">
                                120 mins
                            </Typography>
                        </Button>
                    </div>
                    <div className="flex-start">
                        <Typography variant="body1" component="span">
                            Available  slots
                        </Typography>
                    </div>
                    <Grid
                        container spacing={1} >
                        {pitch.slots.map(item => (
                            <Grid
                                item
                                xs={6}
                                lg={4}
                                key={item.id}
                            >
                                <Button
                                    disabled={handleInValidDate(+item.start.substring(0, 2)) || handleInvalidSlot(item.id)}
                                    className={`${handleInValidDate(+item.start.substring(0, 2)) && "!bg-gray-300"}  ${handleInvalidSlot(item.id) && "!bg-gray-300"} group relative w-full !border-primary !text-black !px-1 ${slot === item.id && "!bg-primary"}`}
                                    onClick={() => handleSelectSlot(item.id)}
                                    variant={slot === item.id ? "contained" : "outlined"}>
                                    {handleInvalidSlot(item.id) ?
                                        <Typography className="absolute  bg-white bg-opacity-70 shadow-md rounded-md px-2 py-1 text-red-500 left-[25%] top-[30%]" fontWeight={700} variant='body1' component="h1">
                                            {"Booked"}
                                        </Typography>
                                        :
                                        handleInValidDate(+item.start.substring(0, 2)) &&
                                        <Typography className="absolute  bg-black bg-opacity-60 shadow-md rounded-md px-2 py-1 text-red-500 left-[22%] top-[30%]" fontWeight={700} variant='body1' component="h1">
                                            {"Overtime"}
                                        </Typography>
                                    }


                                    {pitch.owner === user.id &&
                                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60 group-hover:block hidden">
                                            <div className="relative top-[50%] w-[80%] space-y-2 left-[50%] translate-x-[-50%] translate-y-[-50%] flex-col">
                                                <Button
                                                    onClick={() => handleDeleteSlot(item.id)}
                                                    variant="contained" className="w-full !bg-red-500 hover:bg-red-400 font-bold shadow-md rounded-md px-2 py-1 text-whites">
                                                    {"Delete Slot"}
                                                </Button>
                                                <Button
                                                    onClick={() => handleLockSlot(item.id)}
                                                    variant="contained" className="w-full !bg-primary hover:bg-opacity-70 font-bold shadow-md rounded-md px-2 py-1 text-whites">
                                                    {"Lock Slot"}
                                                </Button>
                                            </div>
                                        </div>
                                    }

                                    {/* {optionSlot === item.id &&
                                        <div className="absolute top-0 left-0 bottom-0 right-0 bg-black bg-opacity-60">
                                            <Button
                                                onClick={handleSetBooked}
                                                variant="contained" className="absolute bg-primary hover:bg-opacity-80 font-bold shadow-md rounded-md px-2 py-1 text-white left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                                                {"Booked"}
                                            </Button>
                                        </div>
                                    } */}

                                    <Grid container>
                                        <Grid item xs={12} md={12} lg={12} textAlign="center">
                                            <Typography fontWeight={700} color={slot === item.id && !handleInValidDate(+item.start.substring(0, 2)) ? "#fff" : "#666"} variant="body1" component="span">
                                                {`Slot ${item.id}`}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={12} lg={12}>
                                            <Typography fontSize={15} color={slot === item.id && !handleInValidDate(+item.start.substring(0, 2)) ? "#fff" : "#666"} variant="body2" component="span">
                                                {`${item.start} : ${item.end}`}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={12} lg={12}>
                                            <Typography align='center' fontSize={15} color={slot === item.id && !handleInValidDate(+item.start.substring(0, 2)) ? "#fff" : "#666"} variant="body2" component="span">
                                                <Currency quantity={+item.price} currency="VND" pattern="##,### !" />
                                                <Typography className="lowercase" variant='body2' component="span">/h</Typography>
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Button>
                            </Grid>
                        ))}

                    </Grid>
                </div>
            </DialogContent>
            <DialogActions>
                <Typography className="flex-1 px-3" fontWeight={700} variant="body1" component="span">
                    {`Total : `}
                    <Currency quantity={total || 0} currency="VND" pattern="##,### !" />
                </Typography>
                <Button className="!text-primary" onClick={() => setOpen(false)}>Cancel</Button>
                <Button className="!bg-primary" variant='contained' onClick={handleBooking}>Booking</Button>
            </DialogActions>
        </Dialog>
    )
}

export default memo(BookingPitchModal)


