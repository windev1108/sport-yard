import { NextApiRequest, NextApiResponse } from 'next'
const { Server } = require('socket.io')



interface User {
  socketId?: string
  userId: string
  receiverId? : string
  typing?: boolean
}


const SocketHandler = (req: NextApiRequest, res: any) => {
  let users: User[] = [];

  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server, {
      cors: {
        origin: "*",
        method: ["GET", "POST"]
      }
    })
    res.socket.server.io = io
    io.on('connection', function (socket: any) {
      console.log('a user connected');

      socket.on('user-connected', (data: User) => {
        console.log('a user ' + data.userId + ' connected');
        // saving userId to object with socket ID
        if (!users.some((u: User) => u.userId === data.userId)) {
          users = [...users, { socketId: socket.id, userId: data.userId }]
        }
        console.log("users :", users);
        io.emit("users-online", users)
      });
      socket.on("user-typing", (data: User) => {
        const index = users.findIndex((u: User) => u.userId === data.userId)
        if (index !== -1) {
          users[index].typing = data.typing
          users[index].receiverId = data.receiverId
        }
        io.emit("users-online", users)
      })

      socket.on('disconnect', () => {
        console.log('user ' + users[socket.id] + ' disconnected');
        // remove saved socket from users object
        users = users.filter((u: User) => u.socketId !== socket.id)
        console.log("users :", users);
        io.emit("users-online", users)
      });
    });
  }
  res.end()
}

export default SocketHandler