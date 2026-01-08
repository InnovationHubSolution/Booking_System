import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { logInfo, logError } from './logger';

interface UserSocket {
    userId: string;
    role: string;
    socketId: string;
}

const connectedUsers = new Map<string, UserSocket>();

export const setupSocket = (httpServer: HTTPServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true
        }
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
            socket.data.userId = decoded.userId;
            socket.data.role = decoded.role;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.data.userId;
        const role = socket.data.role;

        logInfo(`User connected: ${userId} (${role})`);

        // Store connected user
        connectedUsers.set(userId, {
            userId,
            role,
            socketId: socket.id
        });

        // Join user-specific room
        socket.join(`user:${userId}`);

        // Join role-specific rooms
        if (role === 'admin') {
            socket.join('admins');
        } else if (role === 'host') {
            socket.join('hosts');
        }

        // Send initial connection confirmation
        socket.emit('connected', {
            message: 'Successfully connected to real-time server',
            userId,
            connectedUsers: connectedUsers.size
        });

        // Broadcast to admins about new user
        io.to('admins').emit('user:connected', {
            userId,
            role,
            timestamp: new Date()
        });

        // Handle booking updates
        socket.on('booking:update', (data) => {
            logInfo(`Booking update from ${userId}: ${data.bookingId}`);

            // Emit to specific user
            if (data.targetUserId) {
                io.to(`user:${data.targetUserId}`).emit('booking:updated', data);
            }

            // Emit to admins and hosts
            io.to('admins').emit('booking:updated', data);
            io.to('hosts').emit('booking:updated', data);
        });

        // Handle new bookings
        socket.on('booking:new', (data) => {
            logInfo(`New booking notification: ${data.bookingId}`);

            // Notify admins
            io.to('admins').emit('booking:new', data);

            // Notify property host if applicable
            if (data.hostId) {
                io.to(`user:${data.hostId}`).emit('booking:new', data);
            }
        });

        // Handle booking cancellations
        socket.on('booking:cancel', (data) => {
            logInfo(`Booking cancellation: ${data.bookingId}`);

            // Notify all relevant parties
            io.to(`user:${data.userId}`).emit('booking:cancelled', data);
            io.to('admins').emit('booking:cancelled', data);

            if (data.hostId) {
                io.to(`user:${data.hostId}`).emit('booking:cancelled', data);
            }
        });

        // Handle payment updates
        socket.on('payment:update', (data) => {
            logInfo(`Payment update: ${data.bookingId} - ${data.status}`);

            io.to(`user:${data.userId}`).emit('payment:updated', data);
            io.to('admins').emit('payment:updated', data);
        });

        // Handle notifications
        socket.on('notification:send', (data) => {
            if (role !== 'admin') {
                return socket.emit('error', { message: 'Unauthorized' });
            }

            if (data.targetUserId) {
                io.to(`user:${data.targetUserId}`).emit('notification:new', data);
            } else if (data.broadcast) {
                io.emit('notification:new', data);
            }
        });

        // Handle chat messages (for customer support)
        socket.on('chat:message', (data) => {
            logInfo(`Chat message from ${userId} to ${data.targetUserId}`);

            // Send to target user
            io.to(`user:${data.targetUserId}`).emit('chat:message', {
                from: userId,
                message: data.message,
                timestamp: new Date()
            });

            // Send to admins
            io.to('admins').emit('chat:message', {
                from: userId,
                to: data.targetUserId,
                message: data.message,
                timestamp: new Date()
            });
        });

        // Handle typing indicators
        socket.on('chat:typing', (data) => {
            io.to(`user:${data.targetUserId}`).emit('chat:typing', {
                userId,
                isTyping: data.isTyping
            });
        });

        // Handle presence updates
        socket.on('presence:update', (data) => {
            connectedUsers.get(userId)!.socketId = socket.id;
            io.to('admins').emit('presence:updated', {
                userId,
                status: data.status,
                timestamp: new Date()
            });
        });

        // Handle property availability updates
        socket.on('property:availability', (data) => {
            if (role !== 'admin' && role !== 'host') {
                return;
            }

            logInfo(`Property availability update: ${data.propertyId}`);
            io.emit('property:availability:updated', data);
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            logInfo(`User disconnected: ${userId}`);

            connectedUsers.delete(userId);

            io.to('admins').emit('user:disconnected', {
                userId,
                timestamp: new Date()
            });
        });

        // Handle errors
        socket.on('error', (error) => {
            logError('Socket error:', error);
            socket.emit('error', { message: 'An error occurred' });
        });
    });

    logInfo('✅ Socket.io server initialized');

    return io;
};

// Helper function to emit to specific user
export const emitToUser = (io: Server, userId: string, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
};

// Helper function to emit to all admins
export const emitToAdmins = (io: Server, event: string, data: any) => {
    io.to('admins').emit(event, data);
};

// Helper function to emit to all hosts
export const emitToHosts = (io: Server, event: string, data: any) => {
    io.to('hosts').emit(event, data);
};

// Helper function to broadcast to all connected users
export const broadcast = (io: Server, event: string, data: any) => {
    io.emit(event, data);
};

// Get connected users count
export const getConnectedUsersCount = () => {
    return connectedUsers.size;
};

// Check if user is online
export const isUserOnline = (userId: string) => {
    return connectedUsers.has(userId);
};

export default { setupSocket, emitToUser, emitToAdmins, emitToHosts, broadcast };
