const { Message } = require('../models/index');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── Join a room (for SOS tracking or buddy chat) ──
    socket.on('join:room', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on('leave:room', (roomId) => {
      socket.leave(roomId);
    });

    // ── Buddy Chat ──
    socket.on('chat:message', async ({ chatRoomId, senderId, senderName, content }) => {
      try {
        // Persist message to DB
        const msg = await Message.create({
          chatRoomId,
          sender: senderId,
          senderName,
          content,
        });

        // Broadcast to all in room
        io.to(chatRoomId).emit('chat:message', {
          _id: msg._id,
          chatRoomId,
          sender: senderId,
          senderName,
          content,
          sentAt: msg.sentAt,
        });
      } catch (err) {
        console.error('Chat error:', err.message);
      }
    });

    // ── Live SOS location ping ──
    socket.on('sos:ping', ({ trackingId, lat, lng }) => {
      // Broadcast to anyone tracking this SOS
      io.to(`sos:${trackingId}`).emit(`sos:location:${trackingId}`, {
        lat,
        lng,
        timestamp: new Date(),
      });
    });

    // ── Join SOS tracking room ──
    socket.on('track:join', (trackingId) => {
      socket.join(`sos:${trackingId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};
