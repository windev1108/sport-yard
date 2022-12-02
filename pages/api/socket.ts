import { NextApiResponse , NextApiRequest} from 'next'
import { Server } from 'socket.io'

const SocketHandler = (req : NextApiRequest, res : any) => {
  interface UserServer {
    socketId : string
    userId : string
  }
    let users : UserServer[] = []
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io
    io.on('connection', socket => {
       console.log(`User ${socket.id} connected`)
      socket.on('new-user', userId => {
        const isExistUser = users.some((u : UserServer) => u.userId === userId)
        !isExistUser && users.push({ socketId : socket.id , userId})
        io.emit("list-users" , users)
        console.log("connection users ",users)         
    })
    socket.on("disconnect", () => {
       console.log(`User ${socket.id} disconnect`)
       users = users.filter((u : UserServer) => u.socketId !== socket.id)
        io.emit("list-users" , users.filter((u : UserServer) => u.socketId !== socket.id))
        console.log("disconnect users ",users)         
    })
})
  }
  res.end()
}

export default SocketHandler