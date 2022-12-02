// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../../../../utils/db";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {  userId  } : any = req.query

  try {
    if (req.method === "GET") {
      const entries = await db
        .collection("users")
        .doc(userId)
        .collection("transactions")
        .orderBy("timestamp", "desc")
        .get();
      const transactions = entries.docs.map((entry) => ({
        id: entry.id,
        ...entry.data(),
      }));
      res.status(200).json({ transactions });
    } else if (req.method === "POST") {
      const { id } = await db.collection("users").doc(userId).collection("transactions").add({
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
