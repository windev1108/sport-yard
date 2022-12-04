import { updateDoc , doc} from "firebase/firestore";
import { db } from "./config";



export const updateUser = async (payload : any, id : string) => {
  const docRef = doc(db, "users", id);
  await updateDoc(docRef, payload);
};