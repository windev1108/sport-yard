import type { NextPage } from "next";
import Layout from "../components/Layout";
import Slider from "../components/Slider";
import AreaRow from "../components/AreaRow";
import BookReviewRow from "../components/BookReviewRow";
import { Container } from '@mui/material';
import PitchRow from "../components/PitchRow"
import ClothesRow from "../components/ClothesRow";
import SneakersRow from "../components/SneakerRow";
const Home: NextPage = () => {



  return (
    <Layout>
      <Slider />
      <Container maxWidth="xl">
        <PitchRow />
        <ClothesRow />
        <SneakersRow />
        <AreaRow />
        <BookReviewRow />
      </Container>
    </Layout>
  );
};

export default Home;
