import dayjs from "dayjs";
import { Reviews } from "../Models";



export const formatReviews = (reviews: Reviews[]) => {
  const results = reviews.reduce(
    (accumulator, currentValue) =>
      accumulator + currentValue.star / reviews.length,
    0
  );

  return Math.round(results * 2) / 2;
};


export const getSlots = (price: number) => [
  {
    time: "07:00 AM : 09:00 AM",
    price
  },
  {
    id: 2,
    time: "09:00 AM : 11:00 AM",
    price
  },
  {
    id: 3,
    time: "01:00 PM : 03:00 PM",
    price
  },
  {
    id: 4,
    time: "03:00 PM : 05:00 PM",
    price: price + 50000
  },
  {
    id: 5,
    time: "05:00 PM : 07:00 PM",
    price: price + 50000
  },
  {
    id: 6,
    time: "07:00 PM : 09:00 PM",
    price: price + 50000
  },
]


export const TimeAgo = (time: string) => {
  let results;
  let month;
  const date = new Date();
  const dayNow = date.getDate();
  const hoursNow = date.getHours();
  const minNow = date.getMinutes();
  const monthNow = date.getMonth() + 1;
  const day = +time.substr(8, 2);
  const hours = +time.substr(16, 2);
  const min = +time.substr(19, 2);

  if (day === dayNow && hours === hoursNow && min === minNow) {
    results = "vừa xong";
  } else if (day === dayNow && hours === hoursNow && min < minNow) {
    results = ` ${minNow - min} phút trước`;
  } else if (day === dayNow && min !== minNow) {
    results = `${hoursNow - hours} giờ trước`;
  } else if (month === monthNow && day !== dayNow) {
    results = `${dayNow - day} ngày trước`;
  }
  return `${hours}:${min} `;
};

export const pitchSize = [5, 7, 11]
export const clothesSize = ["S", "M", "L", "XL", "XXL"]
export const sneakersSize = [36, 37, 38, 39, 40, 41, 42, 43, 44]

export const banking = [
  {
    nameVN: "Đầu tư và Phát triển Việt Nam",
    nameEN: "Vietnam Commercial Bank for Investment and Development JSC",
    bankCode: "BIDV",
  },
  {
    nameVN: "Công Thương Việt Nam",
    nameEN: "Vietnam Joint Stock Commercial Bank for Industry and Trade",
    bankCode: "VietinBank",
  }, {
    nameVN: "Ngoại thương Việt Nam",
    nameEN: "JSC Bank for Foreign Trade of Vietnam",
    bankCode: "Vietcombank",
  }, {
    nameVN: "Việt Nam Thịnh Vượng",
    nameEN: "Vietnam Prosperity Bank",
    bankCode: "VPBank",
  }, {
    nameVN: "Quân đội",
    nameEN: "Military Commercial Joint Stock Bank",
    bankCode: "MB",
  }, {
    nameVN: "Kỹ Thương Việt Nam",
    nameEN: "VietNam Technological and Commercial Joint Stock Bank",
    bankCode: "Techcombank",
  }, {
    nameVN: "Á Châu",
    nameEN: "Asia Commercial Joint Stock Bank",
    bankCode: "ACB",
  }, {
    nameVN: "Sài Gòn-Hà Nội",
    nameEN: "Saigon - Hanoi Commercial Joint Stock Bank",
    bankCode: "SHB",
  }, {
    nameVN: "NH TMCP Phát triển Nhà Tp HCM",
    nameEN: "Ho Chi Minh City Development Bank",
    bankCode: "HDBank",
  }, {
    nameVN: "TMCP Sài Gòn",
    nameEN: "Sai Gon Commercial Bank",
    bankCode: "SCB",
  }, {
    nameVN: "Sài Gòn Thương Tín",
    nameEN: "Sai Gon Thuong Tin Commercial Joint Stock Bank",
    bankCode: "Sacombank",
  }, {
    nameVN: "Tiên Phong",
    nameEN: "Tien Phong Bank",
    bankCode: "TPBank",
  }, {
    nameVN: "NH TMCP Quốc tế Việt Nam",
    nameEN: "Vietnam International and Commercial Joint Stock Bank",
    bankCode: "VIB",
  }, {
    nameVN: "Hàng Hải Việt Nam",
    nameEN: "Vietnam Maritime Joint - Stock Commercial Bank",
    bankCode: "MSB",
  }, {
    nameVN: "Đông Nam Á",
    nameEN: "South East Asia Bank",
    bankCode: "SeABank",
  }, {
    nameVN: "Phương Đông",
    nameEN: "Orient Commercial Joint Stock Bank",
    bankCode: "OCB",
  },
   {
    nameVN: "Ngân hàng xuất nhập khẩu Việt Nam",
    nameEN: "Vietnam Export Import Commercial Joint Stock Bank",
    bankCode: "Eximbank",
  },
   {
    nameVN: "Bưu điện Liên Việt",
    nameEN: "Lien Viet Postal Commercial Joint Stock Bank",
    bankCode: "LienVietPostBank",
  },
   {
    nameVN: "Đại chúng Việt Nam",
    nameEN: "Vietnam Public Joint Stock Commercial Bank",
    bankCode: "PVcombank",
  }, {
    nameVN: "Ngân hàng TMCP Bắc Á",
    nameEN: "Bac A Bank",
    bankCode: "Bac A Bank",
  }
]


    // check empty space
    export const hasEmpySpace = (string: string) => {
        return /\s/g.test(string);
    }

    export const containsNumbers = (string: string) => {
        return /\d/.test(string);
    }




export function convertLowerCase(str : string) {
    return str.toLowerCase() 
}


    
export const formatDate = (timestamp : any) => {
  const date = new Date(timestamp);
  const formatter = dayjs(date);
  const now = new Date();

  if (dayjs().isSame(formatter, "date")) return formatter.format("h:mm A");

  if (dayjs().isSame(formatter, "week")) return formatter.format("ddd h:mm A");

  if (now.getFullYear() === date.getFullYear())
    return formatter.format("MMM DD h:mm A");

  return formatter.format("DD MMM YYYY h:mm A");
};



  