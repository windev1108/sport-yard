import React, { useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import { SiBitcoincash } from 'react-icons/si'
import Link from 'next/link';
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Drawer from '@mui/material/Drawer';
import NavBar from './NavBar';
import { Avatar, Grid, Skeleton, Tooltip, Divider, NoSsr } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { FaUserCircle } from 'react-icons/fa';
import { deepOrange } from '@mui/material/colors';
import dynamic from 'next/dynamic'
import { BiLogOut } from 'react-icons/bi';
import { FiLogIn } from 'react-icons/fi';
import { setOpenProfileModal } from '../redux/features/isSlice'
import { setIdProfile } from '../redux/features/userSlice';
import Cart from './Cart';
import Image from 'next/image';
const Transactions = dynamic(() => import("./Transactions"), { ssr: false })
const Notifications = dynamic(() => import("./Notifications"), { ssr: false })
const Balance = dynamic(() => import("./Balance"), { ssr: false })
import { getCookie, CookieValueTypes } from 'cookies-next';


const theme = createTheme({
  palette: {
    primary: {
      main: '#fff',
    },
  },
});





function Header() {
  const token: CookieValueTypes | any = getCookie("token");
  const { user }: any = useSelector<RootState>(state => state.user)
  const dispatch = useDispatch()

  const [state, setState] = React.useState({
    isShowDrawer: false,
    height: 0,
    isLoading: true
  });
  const { isShowDrawer, isLoading } = state


  const [accountAnchorEl, setAccountAnchorEl] = React.useState<null | HTMLElement>(null);


  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAccountAnchorEl(null);
  };



  const toggleDrawer =
    (anchor: string, open: boolean) =>
      (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
          event.type === 'keydown' &&
          ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
          return;
        }

        setState({ ...state, isShowDrawer: !isShowDrawer });
      };


  const handleOpenProfile = () => {
    dispatch(setOpenProfileModal(true))
    dispatch(setIdProfile(user.id))
  }




  useEffect(() => {
    setState({ ...state, isLoading: false })
  }, [])


  return (
    <>
      <Drawer
        anchor={"left"}
        open={isShowDrawer}
        onClose={toggleDrawer("left", false)}
      >
        <NavBar
          anchor={"left"}
          toggleDrawer={toggleDrawer}
        />
      </Drawer>
      <ThemeProvider theme={theme}>
        <Box className="fixed left-0 right-0 z-[1001] w-full" >
          <AppBar position="static">
            <Toolbar>
              {isLoading ?
                <Skeleton variant="circular" className="translate-x-[-8px]" width={40} height={40} />
                :
                <IconButton
                  onClick={toggleDrawer("left", true)}
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="open drawer"
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              }
              {isLoading ?
                <Skeleton variant="rounded" width={210} height={40} />
                :
                <Link className="lg:block hidden" href="/" passHref>
                  <a className="group flex space-x-2 items-center">
                    <Image objectFit='cover' width={40} height={40} src={require("../assets/images/goal.png")} />
                    <Typography
                      variant="h6"
                      noWrap
                      component="h1"
                      sx={{
                        mr: 2,
                        display: { xs: 'none', md: 'flex' },
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '.3rem',
                        color: 'inherit',
                        textDecoration: 'none',
                      }}
                    >
                      Sport Yard
                    </Typography>
                  </a>
                </Link>
              }
              <Box sx={{ flexGrow: 1 }} />
              <Box className="lg:flex hidden items-center space-x-1">
                {token &&
                  <Tooltip
                    title="Your cash">
                    {isLoading ?
                      <Skeleton variant="rounded" width={120} height={20} />
                      :
                      <Grid className=" cursor-pointer" container spacing={1}>
                        <Grid item>
                          <SiBitcoincash className="rotate-[20deg]" color="#ef8e19" size={22} />
                        </Grid>
                        <Grid item>
                          <Balance />
                        </Grid>
                      </Grid>
                    }
                  </Tooltip>
                }
                {isLoading ?
                  <Skeleton variant="circular" width={40} height={40} />
                  :
                  token &&
                  <Transactions />
                }
                {isLoading ?
                  <Skeleton variant="circular" width={40} height={40} />
                  :
                  token &&
                  <Notifications />
                }
                {isLoading ?
                  <Skeleton variant="circular" width={40} height={40} />
                  :
                  token &&
                  <Cart />
                }
                {isLoading ?
                  <Skeleton variant="circular" width={40} height={40} />
                  :
                  <Tooltip title="Profile">
                    {token
                      ?
                      <IconButton
                        onClick={handleOpenProfile}
                        size="large"
                        aria-haspopup="true">
                        <Avatar
                          src={user?.avatar ? user?.avatar : ""}
                          sx={{ bgcolor: deepOrange[500] }}>{user?.firstName?.substring(0, 1)}</Avatar>
                      </IconButton>
                      :
                      <>
                        <IconButton
                          size="large"
                          aria-label="account of current user"
                          aria-controls="menu-appbar"
                          aria-haspopup="true"
                          onClick={handleMenu}
                          color="inherit"
                        >
                          <FaUserCircle size={40} />
                        </IconButton>
                        <Menu
                          className=" 60 mt-10 mr-6"
                          id="menu-appbar"
                          anchorEl={accountAnchorEl}
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                          keepMounted
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                          open={Boolean(accountAnchorEl)}
                          onClose={handleClose}
                        >
                          <Link href="/signin
                          ">
                            <a >
                              <MenuItem>
                                <IconButton
                                  className="!p-0 flex space-x-3"
                                  size="large"
                                  aria-haspopup="true"
                                  color="inherit"
                                >
                                  <FiLogIn className="text-primary" size={20} />
                                  <Typography variant="body1" component="h1">
                                    Sign in
                                  </Typography>
                                </IconButton>
                              </MenuItem>
                            </a>
                          </Link>
                          <Divider />
                          <Link href="/signup
                          ">
                            <a >
                              <MenuItem>
                                <IconButton
                                  className="!p-0 flex space-x-3"
                                  size="large"
                                  aria-haspopup="true"
                                  color="inherit"
                                >
                                  <BiLogOut className="text-primary" size={20} />
                                  <Typography variant="body1" component="h1">
                                    Sign up
                                  </Typography>
                                </IconButton>
                              </MenuItem>
                            </a>
                          </Link>
                        </Menu>
                      </>
                    }
                  </Tooltip>
                }

              </Box>

              <Box className="lg:hidden flex items-center space-x-1">
                {isLoading ?
                    <Skeleton variant="circular" width={40} height={40} />
                  :
                  token &&
                  <Transactions />
                }
                {isLoading ?
                    <Skeleton variant="circular" width={40} height={40} />
                  :
                  token &&
                  <Notifications />
                }
                {isLoading ?
                    <Skeleton variant="circular" width={40} height={40} />
                  :
                  token &&
                  <Cart />
                }
                {isLoading ?
                    <Skeleton variant="circular" width={40} height={40} />
                  :
                  <Tooltip title="Profile">
                    {token
                      ?
                      <IconButton
                        onClick={handleOpenProfile}
                        size="large"
                        aria-haspopup="true">
                        <Avatar
                          src={user?.avatar ? user?.avatar : ""}
                          sx={{ bgcolor: deepOrange[500] }}>{user?.firstName?.substring(0, 1)}</Avatar>
                      </IconButton>
                      :
                      <>
                        <IconButton
                          size="large"
                          aria-label="account of current user"
                          aria-controls="menu-appbar"
                          aria-haspopup="true"
                          onClick={handleMenu}
                          color="inherit"
                        >
                          <FaUserCircle size={40} />
                        </IconButton>
                        <Menu
                          className=" 60 mt-10 mr-6"
                          id="menu-appbar"
                          anchorEl={accountAnchorEl}
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                          keepMounted
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                          open={Boolean(accountAnchorEl)}
                          onClose={handleClose}
                        >
                          <Link href="/signin
                          ">
                            <a >
                              <MenuItem>
                                <IconButton
                                  className="!p-0 flex space-x-3"
                                  size="large"
                                  aria-haspopup="true"
                                  color="inherit"
                                >
                                  <FiLogIn className="text-primary" size={20} />
                                  <Typography variant="body1" component="h1">
                                    Sign in
                                  </Typography>
                                </IconButton>
                              </MenuItem>
                            </a>
                          </Link>
                          <Divider />
                          <Link href="/signup
                          ">
                            <a >
                              <MenuItem>
                                <IconButton
                                  className="!p-0 flex space-x-3"
                                  size="large"
                                  aria-haspopup="true"
                                  color="inherit"
                                >
                                  <BiLogOut className="text-primary" size={20} />
                                  <Typography variant="body1" component="h1">
                                    Sign up
                                  </Typography>
                                </IconButton>
                              </MenuItem>
                            </a>
                          </Link>
                        </Menu>
                      </>
                    }
                  </Tooltip>
                }

              </Box>

            </Toolbar>
          </AppBar>
        </Box>
      </ThemeProvider>
    </>
  );
}


export default Header