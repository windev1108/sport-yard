import axios from 'axios'




const instance  = axios.create({
   baseURL: process.env.NEXT_PUBLIC_SERVER || 'http://localhost:5000'
})


export default instance 