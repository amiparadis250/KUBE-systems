/**
 * WebSocket Handlers
 * Real-time communication using Socket.IO
 */

import { Server as SocketIOServer, Socket } from 'socket.io';

interface ConnectedUser {
  userId: string;
  socketId: string;
  role: string;
}

const connectedUsers: Map<string, ConnectedUser> = new Map();

export const initializeSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Handle user authentication
    socket.on('authenticate', (data: { userId: string; role: string }) => {
      connectedUsers.set(socket.id, {
        userId: data.userId,
        socketId: socket.id,
        role: data.role
      });

      console.log(`✅ User authenticated: ${data.userId} (${data.role})`);

      // Join role-based rooms
      socket.join(data.role);
      socket.join(`user_${data.userId}`);

      // Send confirmation
      socket.emit('authenticated', {
        success: true,
        message: 'Successfully authenticated'
      });
    });

    // Handle real-time alert subscription
    socket.on('subscribe:alerts', (data: { module?: string }) => {
      const room = data.module ? `alerts_${data.module}` : 'alerts_all';
      socket.join(room);
      console.log(`📢 Client subscribed to: ${room}`);
    });

    // Handle real-time telemetry subscription
    socket.on('subscribe:telemetry', (data: { entityId: string; entityType: string }) => {
      const room = `telemetry_${data.entityType}_${data.entityId}`;
      socket.join(room);
      console.log(`📊 Client subscribed to telemetry: ${room}`);
    });

    // Handle patrol tracking
    socket.on('subscribe:patrol', (data: { patrolId: string }) => {
      socket.join(`patrol_${data.patrolId}`);
      console.log(`🚁 Client subscribed to patrol: ${data.patrolId}`);
    });

    // Handle location updates
    socket.on('location:update', (data: any) => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        // Broadcast location to relevant users
        io.to(user.role).emit('location:changed', {
          userId: user.userId,
          ...data
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        console.log(`👋 User disconnected: ${user.userId}`);
        connectedUsers.delete(socket.id);
      } else {
        console.log(`👋 Client disconnected: ${socket.id}`);
      }
    });
  });

  // Return helper functions for emitting events
  return {
    // Emit new alert to relevant users
    emitAlert: (alert: any) => {
      io.to('alerts_all').emit('alert:new', alert);
      io.to(`alerts_${alert.module}`).emit('alert:new', alert);

      if (alert.assignedToId) {
        io.to(`user_${alert.assignedToId}`).emit('alert:assigned', alert);
      }
    },

    // Emit telemetry data
    emitTelemetry: (entityType: string, entityId: string, data: any) => {
      io.to(`telemetry_${entityType}_${entityId}`).emit('telemetry:update', data);
    },

    // Emit patrol update
    emitPatrolUpdate: (patrolId: string, update: any) => {
      io.to(`patrol_${patrolId}`).emit('patrol:update', update);
    },

    // Broadcast system notification
    broadcastNotification: (notification: any) => {
      io.emit('notification', notification);
    }
  };
};

export default initializeSocketHandlers;
