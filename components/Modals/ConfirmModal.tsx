import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material'
import { NextPage } from 'next'
import React from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { setIsUpdate } from '../../redux/features/isSlice'
import { RootState } from '../../redux/store'


interface Props {
    setOpen: any
    open: boolean
    id: string
    tab: number
}

const ConfirmModal: NextPage<Props> = ({ tab, id, open, setOpen }) => {
    const { isUpdated }: any = useSelector<RootState>(state => state.is)
    const dispatch = useDispatch()

    const handleDeleteUser = () => {
        axios.delete(`/api/users/${id}`)
        toast.success("Delete user success", { autoClose: 3000, theme: "colored" })
        setOpen(false)
        dispatch(setIsUpdate(!isUpdated))
    }

    const handleDeletePitch = () => {
        axios.delete(`/api/pitch/${id}`)
        toast.success("Delete pitch success", { autoClose: 3000, theme: "colored" })
        setOpen(false)
        dispatch(setIsUpdate(!isUpdated))
    }

    const handleDeleteProduct = () => {
        axios.delete(`/api/products/${id}`)
        toast.success("Delete product success", { autoClose: 3000, theme: "colored" })
        setOpen(false)
        dispatch(setIsUpdate(!isUpdated))
    }
    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {tab === 0 && "Are you sure you want to delete this user?"}
                {tab === 1 && "Are you sure you want to delete this pitch?"}
                {tab === 2 || tab == 3 && "Are you sure you want to delete this product?"}
            </DialogTitle>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Disagree</Button>
                {tab === 0 &&
                    <Button onClick={handleDeleteUser} autoFocus>
                        Agree
                    </Button>}

                {tab === 1 &&
                    <Button onClick={handleDeletePitch} autoFocus>
                        Agree
                    </Button>}

                {tab === 2 || tab == 3 &&
                    <Button onClick={handleDeleteProduct} autoFocus>
                        Agree
                    </Button>}

            </DialogActions>
        </Dialog>
    )
}

export default ConfirmModal