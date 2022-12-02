import Image from "next/image";
import React, { useEffect, useState } from "react";
import { GiSoccerBall } from "react-icons/gi";
import facebook from "../assets/images/facebook.png";
import twitter from "../assets/images/twitter.png";
import instagram from "../assets/images/instagram.png";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { NextPage } from "next";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

const Footer: NextPage<any> = (): ReactJSXElement => {
  const [scrollY, setScrollY] = useState(0)
  const [breakpoints, setBreakpoints] = useState(0)
  const router = useRouter();

  useEffect(() => {
    if (router.asPath.includes("/pitch")) {
      setBreakpoints(0)
    } else if (router.asPath === "/") {
      setBreakpoints(2114)
    } else if (router.asPath === "/product") {
      setBreakpoints(200)
    }
  }, [router])


  useEffect(() => {
    const handleScrollY = () => {
      setScrollY(Math.floor(window.scrollY))
    }
    window.addEventListener('scroll', handleScrollY)
    return () => {
      window.removeEventListener('scroll', handleScrollY)
    }
  }, [])


  return (
    <div className="p-12 mt-32 h-[300px] bg-[#f7f6f6] overflow-hidden">
      <div className="flex justify-around mt-10">
        <div className={`${scrollY >= breakpoints ? "translate-y-0 opacity-100-" : "translate-y-[100%] opacity-0"} transition-all duration-1000 ease-in-out delay-300`} >
          <Image layout="fixed" objectFit='cover' width={120} height={120} src={require("../assets/images/goal.png")} />
          <div className="flex gap-3">
            <Link href="https://www.facebook.com/">
              <a>
                <Image className="cursor-pointer" src={facebook} />
              </a>
            </Link>
            <Link href="https://twitter.com/">
              <a>
                <Image className="cursor-pointer" src={twitter} />
              </a>
            </Link>
            <Link href="https://www.instagram.com/">
              <a>
                <Image className="cursor-pointer" src={instagram} />
              </a>
            </Link>
          </div>
        </div>
        <div className={`${scrollY >= breakpoints ? "translate-y-0 opacity-100-" : "translate-y-[100%] opacity-0"} transition-all duration-1000 ease-in-out delay-300 lg:block hidden flex-col space-y-6`}>
          <h1 className="font-extrabold">About Sport Yard</h1>
          <Link href="/">
            <p className="cursor-pointer hover:underline">About us</p>
          </Link>
          <Link href="/">
            <p className="cursor-pointer hover:underline">Terms and Condition</p>
          </Link>
          <Link href="/">
            <p className="cursor-pointer hover:underline">Contact us</p>
          </Link>
        </div>
        <div className={`${scrollY >= breakpoints ? "translate-y-0 opacity-100-" : "translate-y-[100%] opacity-0"} transition-all duration-1000 ease-in-out delay-300 lg:block hidden flex-col space-y-6`}>
          <h1 className="font-extrabold">Sport Yard For Playersd</h1>
          <Link href="/">
            <p className="cursor-pointer hover:underline">Stadiums List</p>
          </Link>
          <Link href="/">
            <p className="cursor-pointer hover:underline">Privacy Policy</p>
          </Link>{" "}
          <Link href="/">
            <p className="cursor-pointer hover:underline">FAQS</p>
          </Link>
        </div>
        <div className={`${scrollY >= breakpoints ? "translate-y-0 opacity-100-" : "translate-y-[100%] opacity-0"} transition-all duration-1000 ease-in-out delay-300 lg:block hidden flex-col`}>
          <h1 className="font-extrabold">Sport Yard For Stadium owners</h1>
          <Link href="/">
            <p className="cursor-pointer hover:underline">Join as an owner</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer