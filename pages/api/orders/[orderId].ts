
import type { NextApiRequest, NextApiResponse } from "next";
import { serverTimestamp } from "firebase/firestore";
import db from "../../../utils/db";



// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: any, res: NextApiResponse) => {
  const { orderId } = req.query;

  try {
    if (req.method === 'PUT') {
      await db.collection('orders').doc(orderId).update({
        ...req.body,
        timestamp: new Date().toUTCString()
      });
    } else if (req.method === 'GET') {
      const doc = await db.collection('orders').doc(orderId).get()
      if (!doc.exists) {
        res.status(404).end();
      } else {
        res.status(200).json({...doc.data() , id : orderId});
      }
    } else if (req.method === 'DELETE') {
      await db.collection('orders').doc(orderId).delete();
    }
    res.status(200).end();
  } catch (e) {
    res.status(400).end();
  }
}