// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../../utils/db";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      const entries = await db
        .collection("products")
        .orderBy("timestamp", "desc")
        .get();
      const products = entries.docs.map((entry) => ({
        id: entry.id,
        ...entry.data(),
      }));
      res.status(200).json({ products });
    } else if (req.method === "POST") {
      db.collection("products").add({
        ...req.body,
        timestamp: new Date().toUTCString()
      })
      res.status(200).json({});
    } else {
      res.status(400).end();
    }
  } catch (e) {
    res.status(400).end();
  }
};
