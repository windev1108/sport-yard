import { Box, Button, Container, Grid, Typography, TextField } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import axios from "axios";
import React, { useState, useLayoutEffect } from "react";
import Layout from "../../components/Layout";
import ListPitch from "../../components/ListPitch";
import { Pitch } from "../../Models";
import { convertLowerCase } from "../../utils/helper";

const Yards = () => {
  const [state, setState] = useState({
    pitch: [],
    keywords: "",
    isLoading: true,
    district: "",
    random: 0
  })
  const { pitch, keywords, random, district, isLoading } = state

  useLayoutEffect(() => {
    axios.get("/api/pitch")
      .then(res => {
        if (district) {
          setState({ ...state, pitch: res.data.pitch.filter((p: Pitch) => convertLowerCase(p.location).match(convertLowerCase(district))), isLoading: false })
        } else if (keywords) {
          setState({ ...state, pitch: res.data.pitch.filter((p: Pitch) => convertLowerCase(p.name).match(convertLowerCase(keywords))), isLoading: false })
        } else {
          setState({ ...state, pitch: res.data.pitch, isLoading: false })
        }
      })
  }, [random, district]);



  return (
    <Layout>
      <Container maxWidth={"xl"}>
        <Grid className="lg:flex block" container paddingY={12}>
          <Grid className="space-y-6" item xs={12} md={2} lg={2}>
            <Box className="space-y-4">
              <TextField
                value={keywords}
                onChange={e => setState({ ...state, keywords: e.target.value })}
                className="w-full"
                label="Tìm kiếm theo tên sân"
              />
              <Button
                onClick={() => setState({ ...state, random: Math.floor(Math.random() * 900000 + 10000) })}
                className="!bg-primary w-full" variant="contained">
                Tìm kiếm
              </Button>
              <Grid container spacing={2}>
                <Grid item xs={12} md={2} lg={12}>
                  <Typography fontWeight={700} textAlign={"center"} variant="body1" component="h1">
                    Tìm theo Quận
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={12}>
                  <FormControl className="w-full">
                    <InputLabel id="demo-simple-select-autowidth-label">Chọn Quận</InputLabel>
                    <Select
                      value={district}
                      onChange={(e) => setState({ ...state, district: e.target.value })}
                      className="w-full"
                      labelId="demo-simple-select-autowidth-label"
                      id="demo-simple-select-autowidth"
                      autoWidth
                      label="Chọn Quận"
                    >
                      <MenuItem value={""}>
                        Tất cả
                      </MenuItem>
                      <MenuItem value={"hải châu"}>Quận Hải châu</MenuItem>
                      <MenuItem value={"cẩm lệ"}>Quận Cẩm lệ</MenuItem>
                      <MenuItem value={"thanh khê"}>Quận Thanh khê</MenuItem>
                      <MenuItem value={"liên chiểu"}>Quận Liên chiểu</MenuItem>
                      <MenuItem value={"hòa vang"}>Quận Hòa Vang</MenuItem>
                      <MenuItem value={"ngũ hành sơn"}>Quận Ngũ Hành Sơn</MenuItem>
                      <MenuItem value={"sơn trà"}>Quận Sơn trà</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

              </Grid>
            </Box>
          </Grid>
          <Grid className="lg:!mt-0 mt-6" item xs={12} md={10} lg={10}>
            {pitch.length ?
              <ListPitch pitch={pitch} isLoading={isLoading} />
              :
              <Typography className="p-4 text-center" variant="body1" component="h1">Không tìm thấy sân bóng nào</Typography>
            }
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default Yards;
