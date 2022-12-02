import Image from "next/image";
import React from "react";
const Slider = () => {
  return (
        <div
          className="!w-full pt-[64px] relative"
        >
          <Image height={400} objectFit="fill" alt="" layout="responsive" src={require("../assets/images/bgImage.png")}  />
        </div>
  );
};

export default Slider;
