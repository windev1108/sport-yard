import type { NextApiRequest, NextApiResponse } from "next";
import jwt from 'jsonwebtoken';
import { getCookie } from "cookies-next";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
       if(req.method === "GET"){
        const token = getCookie("token")
        console.log("token ",token)
         res.status(200).json({ token })
       }else{
        res.status(400).end()
       }
    } catch {
        res.status(400).end()
    }
}