export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  avatar: string
  isOwner? : boolean;
  balance: number
  phone: number;
  conversations? : string[]
  address : string,
  bank: {
        bankCode: string,
        accountNumber: number
      },
  timestamp: string
}

export interface Reviews {
  id?: string;
  name: string;
  star: number;
  comment: string;
  avatar : string;
  userId: string;
  timestamp: any
}

export interface Pitch {
  id: string;
  name: string;
  pictures: string[];
  price: number;
  location: string;
  owner: string;
  mainPicture: string;
  booked : {
    slot: number,
    date : string
  }[]
  slots: Slot[]
  size:  number[]
  coordinates: {
    longitude: number;
    latitude: number;
  };
  timestamp: {
    nanoseconds: number;
    seconds: number;
  };
};



export interface Slot {
  id: number,
  start: string,
  end: string
  price: string
}


export interface Bank {
  id: number
  name: string,
  bankCode: string
  bankName: string
  accountNumber: string
}

export interface Product {
  id: string;
  name: string;
  price: number;
  pictures: string[];
  mainPictures: string[];
  size: string[];
  owner?: string;
  discount: number;
  description: string;
  type: string
  timestamp?: {
    nanoseconds: number;
    seconds: number;
  };

}



export interface Transaction {
  id: string,
  transactionId: number
  action : string
  senderId: string
  sender: string
  receiver: string
  receiverId: string
  amount: number
  status: string
  balance: number
  bank: Bank
  transferContent: string
  timestamp: string
}


export interface Order {
  id? : string
  type: string
  nameProduct: string
  products? : Cart[]
  message?: string
  productId?: string
  receiverId?: string
  ordererName: string
  ownerId: string
  orderId: string
  time: string
  location?: string
  address: string
  bank: Bank
  thumbnail: string
  slot?: number
  size: number
  duration? : number
  senderId: string
  ownerName: string
  total : number
  contactOrderer: number
  contactOwner: number
  transferContent: string
  methodPay? : number
  status: number
  bookingId? : number
  date?: string
  timestamp? : string
}

export interface Message {
  id? : string
  senderId : string
  receiverId : string
  message?: string
  pictures : string[]
  type: string
  timestamp? : any
}


export interface Cart {
    amount: number
    product: Product
    size?: number | string
}

export interface Session {
  id: String
  iat : Number
}