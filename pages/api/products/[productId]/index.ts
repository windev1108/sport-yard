
import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../../../utils/db";



// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: any, res: NextApiResponse) => {
  const { productId } = req.query;

  try {
    if (req.method === 'PUT') {
      await db.collection('products').doc(productId).update({
        ...req.body,
      });
    } else if (req.method === 'GET') {
      const doc = await db.collection('products').doc(productId).get()
      if (!doc.exists) {
        res.status(404).end();
      } else {
        res.status(200).json(doc.data());
      }
    } else if (req.method === 'DELETE') {
      await db.collection('products').doc(productId).delete();
    }
    res.status(200).end();
  } catch (e) {
    res.status(400).end();
  }
}