
import type { NextApiRequest, NextApiResponse } from "next";
import { serverTimestamp } from "firebase/firestore";
import db from "../../../../utils/db";



// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: any, res: NextApiResponse) => {
  const { pitchId } = req.query;

  try {
    if (req.method === 'PUT') {
      await db.collection('pitch').doc(pitchId).update({
        ...req.body,
      });
    } else if (req.method === 'GET') {
      const doc = await db.collection('pitch').doc(pitchId).get()
      if (!doc.exists) {
        res.status(404).end();
      } else {
        res.status(200).json({...doc.data() , id : doc.id});
      }
    } else if (req.method === 'DELETE') {
      await db.collection('pitch').doc(pitchId).delete();
    }
    res.status(200).end();
  } catch (e) {
    res.status(400).end();
  }
}