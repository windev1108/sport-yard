import { Avatar, Box, Button, Container, CssBaseline, Grid, IconButton, TextField, Typography } from "@mui/material";
import Head from "next/head";
import { useEffect, useState } from 'react'
import Image from "next/image";
import Link from "next/link";
import Banner from "../assets/images/Banner.png";
import { AiFillLock, AiOutlineLoading3Quarters } from "react-icons/ai";
import { User } from "../Models";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { NextPage } from "next";
import OtpInputInput from 'react-otp-input';
import { BsDashLg } from "react-icons/bs";
import Countdown from "../components/Countdown";
import emailjs from '@emailjs/browser';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import instance from "../server/db/instance";


interface State {
    email: string
    password: string
    repeatPassword: string
    users: User[]
    otpInput: string
    otp: number
    isShowRepeatPassword: boolean
    isShowPassword: boolean
    isLoading: boolean
    isShowOTPInput: boolean
    isShowResetPassword: boolean
}

const Signin: NextPage = (): JSX.Element => {
    const [state, setState] = useState<State>({
        email: "",
        password: "",
        repeatPassword: "",
        users: [],
        otpInput: "",
        otp: 0,
        isShowPassword: false,
        isShowRepeatPassword: false,
        isLoading: false,
        isShowOTPInput: false,
        isShowResetPassword: false
    })
    const { users, email, password, repeatPassword, isShowRepeatPassword, isShowResetPassword, isShowOTPInput, isLoading, isShowPassword, otpInput, otp } = state
    const router = useRouter()
    const [countdown, setCountdown] = useState(60)
    const handleSetOtpInput = (otp: number) => {
        setState({ ...state, otp });
    }
    const handleChange = (otpInput: string) => setState({ ...state, otpInput });

    const handleResendOTP = () => {
        const OTPRandom = Math.floor(Math.random() * 900000 + 10000)
        setCountdown(60)
        const templateParams = {
            to_email: email,
            to_user: `${users.find(u => u.email === email)?.firstName} ${users.find(u => u.email === email)?.lastName}`,
            OTP: OTPRandom
        }
        emailjs.send(process.env.NEXT_PUBLIC_SERVICE_ID as string, process.env.NEXT_PUBLIC_TEMPLATE_ID1 as string, templateParams, process.env.NEXT_PUBLIC_PUBLIC_KEY)
        setState({ ...state, otp: OTPRandom })
    }


    useEffect(() => {
        instance.get("/users")
            .then(res => res.data)
            .then((data) => {
                setState({ ...state, users: data.users })
            })
    }, [])



    const handleCheckEmailValid = async (e: any) => {
        e.preventDefault()
        if (!email) {
            toast.info("Vui lòng nhập email của bạn", { autoClose: 3000, theme: "colored" })
        } else if (!users?.some(u => u.email === email)) {
            toast.info("Không tìm thấy email của bạn", { autoClose: 3000, theme: "colored" })
        } else {
            setState({ ...state, isLoading: true })
            setTimeout(() => {
                const OTPRandom = Math.floor(Math.random() * 900000 + 10000)
                const templateParams = {
                    to_email: email,
                    to_user: `${users.find(u => u.email === email)?.firstName} ${users.find(u => u.email === email)?.lastName}`,
                    OTP: OTPRandom
                }
                emailjs.send(process.env.NEXT_PUBLIC_SERVICE_ID as string, process.env.NEXT_PUBLIC_TEMPLATE_ID1 as string, templateParams, process.env.NEXT_PUBLIC_PUBLIC_KEY)
                setState({ ...state, isShowOTPInput: true, otp: OTPRandom, isLoading: false })
            }, 2000)
        }

    }

    const handleCheckOTP = () => {
        if (!countdown) {
            toast.info("Mã OTP đã hết hạn", { autoClose: 3000, theme: "colored" })
        } else if (+otp !== +otpInput) {
            toast.info("Mã OTP không chính xác", { autoClose: 3000, theme: "colored" })
        } else {
            setState({ ...state, isLoading: true })
            setTimeout(() => {
                setState({ ...state, isLoading: false, isShowResetPassword: true, isShowOTPInput: false })
            }, 2000)
        }
    }


    const handleResetPassword = async () => {
        if (password.length < 6) {
            toast.info("Mật khẩu phải ít nhất 6 kí tự ", { autoClose: 3000, theme: "colored" })
        } else if (password !== repeatPassword) {
            toast.info("Nhập lại mật khẩu không chính xác", { autoClose: 3000, theme: "colored" })
        } else {
            const user: User | undefined = users.find((u: User) => u.email === email)
            setState({ ...state, isLoading: true })
            setTimeout(() => {
                user?.id && instance.put(`/users/${user?.id}`, {
                    password
                })
                setState({ ...state, isLoading: false })
                toast.success("Chúc mừng bạn đã lấy lại mật khẩu thành công", { autoClose: 3000, theme: "colored" })
                router.push("/signin")
            }, 2000)

        }


    }


    return (
        <>
            <Head>
                <title>Signin - Sport Yard</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/goal.png" />
            </Head>
            <div className="h-screen bg-gray-100 overflow-hidden">
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} lg={6}>
                        <Container component="main" >
                            <CssBaseline />
                            <Box
                                sx={{
                                    marginTop: 8,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                }}
                            >
                                <Link href="/" passHref>
                                    <Grid className="group cursor-pointer" container alignItems={"center"} justifyContent="center" sx={{ width: 500 }}>
                                        <Grid className="lg:block hidden" item xs={0} md={0} lg={3}>
                                            <Image src={require("../assets/images/goal.png")} />
                                        </Grid>
                                        <Grid item xs={0} md={12} lg={6}>
                                            <Typography fontSize={30} className="  text-primary" variant="body2" component="main">
                                                Sport Yard
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Link>

                                <Avatar
                                    className="bg-primary"
                                    sx={{ m: 1 }}>
                                    <AiFillLock
                                    />
                                </Avatar>
                                <Typography
                                    component="h1" variant="h5">
                                    {isShowResetPassword ? "Reset Password" : "Forgot password"}
                                </Typography>
                                <Box component="form" sx={{ mt: 6, width: 500 }}>
                                    {isShowOTPInput &&
                                        <Grid container>
                                            <Grid item lg={12} justifyContent={"center"} marginY={4}>
                                                {countdown <= 0 ?
                                                    <div className="flex space-x-1 justify-center">
                                                        <Typography textAlign={"center"} variant="body1" component="h1">
                                                            {`Mã OTP của bạn đã hết hạn`}
                                                        </Typography>
                                                        <Typography
                                                            onClick={handleResendOTP}
                                                            className="cursor-pointer font-semibold text-[#1976D2]" variant="body1" component="h1">Gửi lại</Typography>
                                                    </div>
                                                    :
                                                    <Countdown countdown={countdown} setCountdown={setCountdown} setOtp={handleSetOtpInput} />
                                                }
                                            </Grid>
                                            <Grid item lg={12}>
                                                <OtpInputInput
                                                    className="w-full h-16 grid grid-cols-6"
                                                    containerStyle="w-full"
                                                    inputStyle="!w-full !h-full !outline-none font-semibold text-xl"
                                                    value={otpInput}
                                                    onChange={handleChange}
                                                    numInputs={6}
                                                    separator={<BsDashLg className="px-2" />}
                                                />
                                            </Grid>
                                        </Grid>
                                    }

                                    {isShowResetPassword &&
                                        <Grid container spacing={2}>
                                            <Grid item lg={12}>
                                                <div className="relative flex w-full items-center">
                                                    <TextField
                                                        value={password}
                                                        onChange={(e) => setState({ ...state, password: e.target.value })}
                                                        focused={password ? true : false}
                                                        autoFocus
                                                        type={isShowPassword ? "text" : "password"}
                                                        margin="dense"
                                                        label="New Password"
                                                        fullWidth
                                                        variant="standard"
                                                    />
                                                    <IconButton
                                                        onClick={() => setState({ ...state, isShowPassword: !isShowPassword })}
                                                        className="absolute right-0" >
                                                        {isShowPassword ?
                                                            <FaRegEye size={22} className="text-gray-700" />
                                                            :
                                                            <FaRegEyeSlash size={22} className="text-gray-700" />
                                                        }
                                                    </IconButton>
                                                </div>
                                            </Grid>

                                            <Grid item lg={12}>
                                                <div className="relative flex w-full items-center">
                                                    <TextField
                                                        value={repeatPassword}
                                                        onChange={(e) => setState({ ...state, repeatPassword: e.target.value })}
                                                        focused={repeatPassword ? true : false}
                                                        autoFocus
                                                        type={isShowRepeatPassword ? "text" : "password"}
                                                        margin="dense"
                                                        label="Repeat new Password"
                                                        fullWidth
                                                        variant="standard"
                                                    />
                                                    <IconButton
                                                        onClick={() => setState({ ...state, isShowRepeatPassword: !isShowRepeatPassword })}
                                                        className="absolute right-0" >
                                                        {isShowRepeatPassword ?
                                                            <FaRegEye size={22} className="text-gray-700" />
                                                            :
                                                            <FaRegEyeSlash size={22} className="text-gray-700" />
                                                        }
                                                    </IconButton>
                                                </div>
                                            </Grid>

                                        </Grid>
                                    }

                                    {!isShowOTPInput && !isShowResetPassword &&
                                        <Grid container spacing={2}>
                                            <Grid item lg={12}>
                                                <TextField
                                                    required
                                                    value={email}
                                                    onChange={e => setState({ ...state, email: e.target.value })}
                                                    fullWidth
                                                    id="email"
                                                    type="email"
                                                    label="Enter your email address"
                                                    name="email"
                                                    autoComplete="email"
                                                />
                                            </Grid>

                                        </Grid>
                                    }

                                    {isShowOTPInput &&
                                        <Button
                                            onClick={handleCheckOTP}
                                            disabled={isLoading}
                                            className="bg-[#1976dE]"
                                            type="button"
                                            fullWidth
                                            variant="contained"
                                            sx={{ mt: 3, mb: 2 }}
                                        >
                                            <div className="flex items-center space-x-2">
                                                {isLoading &&
                                                    <AiOutlineLoading3Quarters className="animate-spin" />
                                                }
                                                <span className="text-base">Confirm</span>
                                            </div>
                                        </Button>
                                    }

                                    {isShowResetPassword &&
                                        <Button
                                            onClick={handleResetPassword}
                                            disabled={isLoading}
                                            className="bg-[#1976dE]"
                                            type="button"
                                            fullWidth
                                            variant="contained"
                                            sx={{ mt: 3, mb: 2 }}
                                        >
                                            <div className="flex items-center space-x-2">
                                                {isLoading &&
                                                    <AiOutlineLoading3Quarters className="animate-spin" />
                                                }
                                                <span className="text-base">Confirm</span>
                                            </div>
                                        </Button>
                                    }


                                    {!isShowOTPInput && !isShowResetPassword &&
                                        <Button
                                            onClick={handleCheckEmailValid}
                                            disabled={isLoading}
                                            className="bg-[#1976dE]"
                                            type="button"
                                            fullWidth
                                            variant="contained"
                                            sx={{ mt: 3, mb: 2 }}
                                        >
                                            <div className="flex items-center space-x-2">
                                                {isLoading &&
                                                    <AiOutlineLoading3Quarters className="animate-spin" />
                                                }
                                                <span className="text-base">Confirm</span>
                                            </div>
                                        </Button>
                                    }


                                </Box>
                            </Box>
                        </Container>
                    </Grid>
                    <Grid className="lg:block hidden" item xs={0} md={0} lg={6}>
                        <Image
                            className="lg:translate-y-[-10rem] h-[10rem]"
                            alt="Banner"
                            src={Banner}
                            layout="intrinsic"
                            objectFit="cover"
                        />
                    </Grid>
                </Grid>
            </div>
        </>
    );
};

export default Signin;
