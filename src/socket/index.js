const { Server } = require('socket.io');

class Socket {
    constructor({ server, database }) {
        this.server = server;
        this.database = database;
        this.io = new Server(server, {
            cors: {
                methods: ['GET', 'POST'],
            },
        });

        this.io.on('connect', this.setupSocket);
    }

    setupSocket(socket) {
        console.log(`User connected: ${socket.id}`);

        socket.on('new_message', (data) => {
            console.log(data);
            socket.emit('send_message', 'Hi');
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    }
}

module.exports = Socket;
