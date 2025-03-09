const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors()); // Habilita CORS
app.use(express.static("public"));
const server = http.createServer(app);
const io = socketIo(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

io.on("connection", (socket) => {
	console.log("Nuevo cliente conectado");

	socket.on("audio", (data) => {
		io.emit("audio", data);
	});

	socket.on("disconnect", () => {
		console.log("Cliente desconectado");
	});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Servidor escuchando en el puerto ${PORT}`);
});
