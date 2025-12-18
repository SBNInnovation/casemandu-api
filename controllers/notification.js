// socket.io server
const io = new Server(server, {
  cors: {
    origin:  ["https://client-casemandu.vercel.app", "https://admin-casemandu.vercel.app","http://localhost:3000", "https://casemandu-client.vercel.app","https://customize-new-sigma.vercel.app"], // change in production
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Listen from client
  socket.on("message", (data) => {
    console.log("Message received:", data);

    // Send back to client
    socket.emit("message", "Message received successfully");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
