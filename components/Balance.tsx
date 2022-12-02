import React, { memo, useEffect, useState } from 'react'
import { Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import Currency from 'react-currency-formatter'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/config'
import { User } from '../Models'
import { setUser } from '../redux/features/userSlice'
import { getCookie, CookieValueTypes } from 'cookies-next';
import jwt from 'jsonwebtoken';
import { RootState } from '../redux/store'


const Balance = () => {
    const token: CookieValueTypes | any = getCookie("token")
    const data = jwt.decode(token) as { [key: string]: string }
    const dispatch = useDispatch()
    const { user }: User | any = useSelector<RootState>(state => state.user)


    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("timestamp", "desc"))
        const unsub = onSnapshot(q, (snapshot: any) => {
            const results = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }))
            dispatch(setUser({ ...results.find((u: User) => u.id === data?.id)}))
        })
        return unsub
    }, [])


    return (
        <Typography fontWeight={600} variant="body1" component="h1">
            <Currency quantity={user?.balance ?? 0} currency="VND" pattern="##,### !" />
        </Typography>
    )
}

export default memo(Balance)