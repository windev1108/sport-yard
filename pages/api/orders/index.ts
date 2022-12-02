// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../../utils/db";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      const entries = await db
        .collection("orders")
        .orderBy("timestamp", "desc")
        .get();
      const orders = entries.docs.map((entry) => ({
        id: entry.id,
        ...entry.data(),
      }));
      res.status(200).json({ orders });
    } else if (req.method === "POST") {
      const { id } = await db.collection("orders").add({
        ...req.body,
        timestamp: new Date().toUTCString()
      });
      res.status(200).json({ id });
    } else {
      res.status(400).end();
    }
  } catch (e) {
    res.status(400).end();
  }
};