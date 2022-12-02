import React, { useEffect, useState, useRef } from "react";
import Clothes from "./Clothes";
import { Box, Button, Card, CardMedia, Container, FormControl, Grid, InputBase, InputLabel, MenuItem, NativeSelect, Select, Skeleton, TextField, Typography } from "@mui/material";
import { NextPage } from "next";
import { GoSearch } from "react-icons/go";
import axios from "axios";
import { Product, Product as ProductModel } from "../../Models";
import { styled } from '@mui/material/styles';
import { useDispatch, useSelector } from "react-redux";
import { setIsLoading } from "../../redux/features/isSlice";
import { RootState } from "../../redux/store";

interface State {
    limit: number;
    products: ProductModel[];
    namePitch: string,
    nameDistrict: string,
    nameWard: string
    loading: boolean
}



const ListClothes: NextPage = () => {
    const { isLoading }: any = useSelector<RootState>(state => state.is)
    const [state, setState] = useState<State>({
        limit: 8,
        products: [],
        namePitch: "",
        nameDistrict: "",
        nameWard: "",
        loading: true,
    });
    const dispatch = useDispatch()
    const { products, limit, namePitch, nameDistrict, nameWard, loading } = state;
    const limitPitch = useRef();

    useEffect(() => {
        return () => {
            dispatch(setIsLoading(true))
        }
    }, [])

    useEffect(() => {
        axios.get("/api/products")
            .then(res => res.data.products.filter((p: Product) => p.type === "clothes"))
            .then(data => {
                limitPitch.current = data.length
                setState({ ...state, products: data.splice(0, limit) })
            }).then((data) => {
                dispatch(setIsLoading(false))
            })
    }, [limit]);

    const handleLimit = () => {
        if (limitPitch?.current && limit < limitPitch?.current) {
            setState({ ...state, limit: limit + 3 });
        } else {
            setState({ ...state, limit: 3 });
        }
    };
    return (
        <Container maxWidth={"xl"} className="!px-20 relative w-full py-20 mb-20">
            {isLoading ?
                <Grid container spacing={2} marginBottom={3}>
                    <Grid item xs={4}>
                        <Skeleton variant="rectangular" className="w-full !h-[56px] rounded-md" />
                    </Grid>
                    <Grid item xs={4}>
                        <Skeleton variant="rectangular" className="w-full !h-[56px] rounded-md" />
                    </Grid>
                    <Grid item xs={4}>
                        <Skeleton variant="rectangular" className="w-full !h-[56px] rounded-md" />
                    </Grid>
                </Grid>
                :
                <Grid container spacing={2} marginBottom={3}>
                    <Grid item xs={4}>
                        <TextField className="w-full" id="outlined-basic" label="Name Pitch" variant="outlined" />
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Name District</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                value={nameDistrict}
                                onChange={e => setState({ ...state, nameDistrict: e.target.value })}
                                label="Name District"
                            >
                                <MenuItem value={10}>Ten</MenuItem>
                                <MenuItem value={20}>Twenty</MenuItem>
                                <MenuItem value={30}>Thirty</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Name Ward</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                label="nameWard"
                                value={nameWard}
                                onChange={e => setState({ ...state, nameWard: e.target.value })}
                            >
                                <MenuItem value={10}>Ten</MenuItem>
                                <MenuItem value={20}>Twenty</MenuItem>
                                <MenuItem value={30}>Thirty</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            }
            {isLoading ?
                <Grid maxWidth={"xl"} container spacing={2} >
                    <Grid item xs={12} md={6} lg={4} >
                        <Skeleton variant="rectangular" className="!w-full !h-[20rem]" />
                        <div className="flex justify-between">
                            <Skeleton className="!w-[50%]" variant="text" />
                            <Skeleton className="!w-[20%]" variant="text" />
                        </div>
                        <Skeleton className="w-full" variant="text" />
                        <Skeleton className="w-[30%]" variant="text" />
                        <Skeleton className="w-full h-[4rem]" variant="text" />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4} >
                        <Skeleton variant="rectangular" className="!w-full !h-[20rem]" />
                        <div className="flex justify-between">
                            <Skeleton className="!w-[50%]" variant="text" />
                            <Skeleton className="!w-[20%]" variant="text" />
                        </div>
                        <Skeleton className="w-full" variant="text" />
                        <Skeleton className="w-[30%]" variant="text" />
                        <Skeleton className="w-full h-[4rem]" variant="text" />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4} >
                        <Skeleton variant="rectangular" className="!w-full !h-[20rem]" />
                        <div className="flex justify-between">
                            <Skeleton className="!w-[50%]" variant="text" />
                            <Skeleton className="!w-[20%]" variant="text" />
                        </div>
                        <Skeleton className="w-full" variant="text" />
                        <Skeleton className="w-[30%]" variant="text" />
                        <Skeleton className="w-full h-[4rem]" variant="text" />
                    </Grid>
                </Grid>
                :
                <Grid maxWidth={"xl"} container spacing={2} >
                    {products.map(item => (
                        <Clothes
                            key={item.id}
                            id={item.id}
                            name={item.name}
                            price={item.price}
                            pictures={item.pictures}
                            mainPictures={item.mainPictures}
                            description={item.description}
                            size={item.size}
                            discount={item.discount}
                            type={item.type}
                        />
                    ))}
                </Grid>
            }
            {/* <div className="absolute left-[35%]  bottom-0 w-[30rem]">
        {isLoading ?
          <Skeleton variant="rounded" className="!h-[2.5rem]" />
          :
          <Button
            onClick={handleLimit}
            className="lg:w-full bg-primary hover:!bg-primary"
            variant="contained"
          >
            {limitPitch?.current && limit < limitPitch?.current
              ? "See more"
              : "See less"}
          </Button>
        }
      </div> */}
        </Container>
    );
};



export default ListClothes;
