import { Avatar, Grid, ListItemAvatar, Typography, Rating, IconButton } from '@mui/material'
import moment from 'moment'
import { NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import { AiFillStar } from 'react-icons/ai'
import { useDispatch } from 'react-redux'
import { Reviews, User } from '../../Models'
import { setOpenProfileModal } from '../../redux/features/isSlice'
import { setIdProfile } from '../../redux/features/userSlice'
import { deepOrange } from '@mui/material/colors';
import instance from '../../server/db/instance'


interface Props {
    review: Reviews
}


const Review: NextPage<Props> = ({ review }) => {
    const dispatch = useDispatch()
    const [state, setState] = useState({
        users: []
    })
    const { users } = state

    useEffect(() => {
        instance.get(`/users`)
            .then(res => setState({ ...state, users: res.data.users }))
            .catch(err => console.error(err))
    }, [])



    const getUser = (id: string) => {
        const user: any = users.find((u: User) => u.id === id)
        return user
    }
    const handleShowProfile = (id: string) => {
        dispatch(setOpenProfileModal(true))
        dispatch(setIdProfile(id))
    }
    return (
        <Grid container >
            <Grid item alignSelf={"center"}>
                <ListItemAvatar
                    className="cursor-pointer"
                    onClick={() => handleShowProfile(review.userId)}
                >
                    <Avatar src={getUser(review.userId)?.avatar} sx={{ bgcolor: deepOrange[500] }}>{getUser(review.userId)?.firstName.substring(0, 1).toUpperCase()}</Avatar>

                </ListItemAvatar>
            </Grid>
            <Grid item className="flex-1">
                <Grid container>
                    <Grid
                        item lg={12}>
                        <Typography
                            className="cursor-pointer"
                            onClick={() => handleShowProfile(review.userId)}
                            fontWeight={700} variant="body1" component="h1">
                            {`${getUser(review.userId)?.firstName} ${getUser(review.userId)?.lastName}`}
                        </Typography>
                    </Grid>
                    <Grid item lg={12}>
                        <Rating name="read-only" precision={0.5} value={review.star} readOnly />
                    </Grid>
                    <Grid item lg={12}>
                        <Typography className="!text-base" variant="body1" component="h1">
                            {review.comment}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <Typography className="!font-semibold !text-sm text-gray-400" component="h1">
                    {moment(review.timestamp).fromNow()}
                </Typography>
            </Grid>
        </Grid>
    )
}

export default Review