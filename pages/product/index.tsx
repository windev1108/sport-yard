import { Box, Container, Divider, Grid, Tab, Tabs, Button, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import ListProducts from "../../components/ListProducts";
import { Product } from "../../Models";
import { convertLowerCase } from "../../utils/helper";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import instance from "../../server/db/instance";

interface State {
    products: Product[]
    isLoading: boolean
    keywords: string
    random: number
}



const Products = () => {
    const [state, setState] = useState<State>({
        products: [],
        keywords: "",
        isLoading: true,
        random: 0
    })
    const [tab, setTab] = useState("clothes");
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setState({ ...state, isLoading: true })
        setTab(newValue);
    };
    const { products, keywords, random, isLoading } = state
    const theme = useTheme();
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        instance.get("/products")
            .then(res => {
                return random ? res.data.products.filter((product: Product) => product.type === tab && convertLowerCase(product.name).match(convertLowerCase(keywords))) : res.data.products.filter((product: Product) => product.type === tab)
            })
            .then(data => {
                setState({ ...state, products: data, isLoading: false })
            })
    }, [tab, random]);


    return (
        <Layout>
            <Container maxWidth={"xl"}>
                <Grid className="lg:flex block" container paddingY={12}>
                    <Grid className="space-y-6" item xs={12} md={2} lg={2}>
                        <Tabs
                            orientation={isTablet ? "horizontal" : "vertical"}
                            variant="scrollable"
                            value={tab}
                            onChange={handleChange}
                            aria-label="Vertical tabs example"
                            sx={{ borderRight: 1, borderColor: 'divider' }}
                        >
                            <Divider />
                            <Tab value={"clothes"} label="Clothes" />
                            <Divider />
                            <Tab value={"sneakers"} label="Sneakers" />
                            <Divider />
                        </Tabs>
                        <Box className="space-y-4">
                            <TextField
                                value={keywords}
                                onChange={e => setState({ ...state, keywords: e.target.value })}
                                className="w-full"
                                label="Search"
                            />
                            <Button
                                onClick={() => setState({ ...state, random: Math.floor(Math.random() * 900000 + 10000) })}
                                className="!bg-primary w-full" variant="contained">
                                Search
                            </Button>
                        </Box>
                    </Grid>
                    <Grid className="lg:!mt-0 mt-6" item xs={12} md={10} lg={10}>
                        <ListProducts isLoading={isLoading} products={products} />
                    </Grid>
                </Grid>
            </Container>
        </Layout>
    );
};

export default Products;
