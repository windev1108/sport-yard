import React, { useEffect, useState } from 'react'
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, Tooltip, Avatar } from '@mui/material'
import { GiClothes, GiSoccerField } from 'react-icons/gi';
import { FiLogIn } from 'react-icons/fi';
import { FaInfoCircle } from 'react-icons/fa';
import { MdContactPhone, MdDashboardCustomize } from 'react-icons/md'
import { NextPage } from 'next';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { BiLogOut } from 'react-icons/bi';
import { useDispatch, useSelector } from 'react-redux';
import SneakerImg from '../assets/images/shoes.png'
import { setIdProfile, setUser } from '../redux/features/userSlice';
import { deepOrange } from '@mui/material/colors';
import Router from 'next/router';
import { AiFillHome } from 'react-icons/ai';
import Image from 'next/image';
import { setOpenProfileModal } from '../redux/features/isSlice';
import { getCookie, CookieValueTypes, removeCookies } from 'cookies-next';
import { RootState } from '../redux/store';
import { toast } from 'react-toastify';

type Props = {
  anchor: string;
  toggleDrawer: any
}



const DrawerComponent: NextPage<Props> = ({ anchor, toggleDrawer }) => {
  const token: CookieValueTypes | any = getCookie("token");
  const dispatch = useDispatch()
  const { user }: any = useSelector<RootState>(state => state.user)


  const handleSignout = () => {
    Router.push("/")
    removeCookies("token")
    setTimeout(() => dispatch(setUser({})), 1000)
  }

  const handleOpenProfile = (id: string) => {
    dispatch(setOpenProfileModal(true))
    dispatch(setIdProfile(id))
  }


  const handleRedirectToManager = () => {
    if (!user?.isOwner) {
      toast.info("Vui lòng nạp tối thiểu 500.000đ để kích hoạt tài khoản", { autoClose: 3000, theme: "colored" })
    }else{
      Router.push("/owner/manager")
    }
  }

  return (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        <Tooltip className="flex justify-center" title="Menu" arrow>
          <Typography className="text-base font-semibold text-primary" variant="body1" component="h1">
            MENU
          </Typography>
        </Tooltip>

        <ListItem disablePadding>
          <Link href="/">
            <a className="w-full">
              <ListItemButton>
                <ListItemIcon>
                  <AiFillHome className="text-2xl text-primary" />
                </ListItemIcon>
                <ListItemText primary={"Home"} />
              </ListItemButton>
            </a>
          </Link>
        </ListItem>

        <ListItem disablePadding>
          <Link href="/pitch">
            <a className="w-full group">
              <ListItemButton>
                <ListItemIcon>
                  <Image className="group-hover:animate-pulse transition-transfom duration-700" src={require("../assets/images/pitch.png")} width={34} height={34} />
                </ListItemIcon>
                <ListItemText primary={"Pitch"} />
              </ListItemButton>
            </a>
          </Link>
        </ListItem>

        <ListItem disablePadding>
          <Link href="/product">
            <a className="w-full group">
              <ListItemButton>
                <ListItemIcon>
                  <Image className="group-hover:rotate-[0deg] rotate-[30deg] transition-transfom duration-700" src={SneakerImg} width={30} height={30} />
                </ListItemIcon>
                <ListItemText primary={"Products"} />
              </ListItemButton>
            </a>
          </Link>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <FaInfoCircle className="text-2xl !text-primary" />
            </ListItemIcon>
            <ListItemText primary={"About us"} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <MdContactPhone className="text-2xl text-primary" />
            </ListItemIcon>
            <ListItemText primary={"Contact us"} />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <Tooltip className="flex justify-center" title="Personal" arrow>
          <Typography className="text-base font-semibold text-primary" variant="body1" component="h1">
            PERSONAL
          </Typography>
        </Tooltip>

        {token &&
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleOpenProfile(user.id)}
            >
              <ListItemIcon>
                <Avatar src={user?.avatar} sx={{ bgcolor: deepOrange[500] }}>{user?.firstName?.substring(0, 1)}</Avatar>
              </ListItemIcon>
              <ListItemText primary={`${user?.firstName} ${user?.lastName}`} />
            </ListItemButton>
          </ListItem>
        }
        {token && user?.role === "owner" &&
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleRedirectToManager}
            >
              <ListItemIcon>
                <MdDashboardCustomize className="text-2xl text-primary" />
              </ListItemIcon>
              <ListItemText primary={"Manager"} />
            </ListItemButton>
          </ListItem>
        }

        {token && user?.role === "admin" &&
          <ListItem disablePadding>
            <Link href="/admin/manager">
              <a className="w-full">
                <ListItemButton>
                  <ListItemIcon>
                    <MdDashboardCustomize className="text-2xl text-primary" />
                  </ListItemIcon>
                  <ListItemText primary={"Manager"} />
                </ListItemButton>
              </a>
            </Link>
          </ListItem>
        }



        {token ?
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleSignout}
            >
              <ListItemIcon>
                <BiLogOut className="text-2xl text-primary" />
              </ListItemIcon>
              <ListItemText primary={"Sign out"} />
            </ListItemButton>
          </ListItem>
          :

          <ListItem disablePadding>
            <Link href="/signin">
              <ListItemButton>
                <ListItemIcon>
                  <FiLogIn className="text-2xl text-primary" />
                </ListItemIcon>
                <ListItemText primary={"Sign in"} />
              </ListItemButton>
            </Link>
          </ListItem>
        }


      </List>
    </Box>
  )
}

export default DrawerComponent