import type { NextApiRequest, NextApiResponse } from "next";
import jwt from 'jsonwebtoken';

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const KEY = process.env.NEXT_PUBLIC_SECRET || ""
    const { id } = req.body
    try {
        res.status(200).json({
            token: jwt.sign({ id }, KEY)
        })
    } catch {
        res.status(400).end()
    }
}