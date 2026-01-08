import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private token: string | null = null;

    connect(token: string) {
        this.token = token;

        this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            auth: {
                token
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to real-time server');
        });

        this.socket.on('connected', (data) => {
            console.log('Real-time connection confirmed:', data);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from real-time server');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error.message);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Booking events
    onBookingUpdate(callback: (data: any) => void) {
        this.socket?.on('booking:updated', callback);
    }

    onNewBooking(callback: (data: any) => void) {
        this.socket?.on('booking:new', callback);
    }

    onBookingCancelled(callback: (data: any) => void) {
        this.socket?.on('booking:cancelled', callback);
    }

    emitBookingUpdate(bookingId: string, data: any) {
        this.socket?.emit('booking:update', { bookingId, ...data });
    }

    // Payment events
    onPaymentUpdate(callback: (data: any) => void) {
        this.socket?.on('payment:updated', callback);
    }

    emitPaymentUpdate(bookingId: string, status: string, data: any) {
        this.socket?.emit('payment:update', { bookingId, status, ...data });
    }

    // Notification events
    onNotification(callback: (data: any) => void) {
        this.socket?.on('notification:new', callback);
    }

    sendNotification(targetUserId: string, notification: any) {
        this.socket?.emit('notification:send', { targetUserId, ...notification });
    }

    broadcastNotification(notification: any) {
        this.socket?.emit('notification:send', { broadcast: true, ...notification });
    }

    // Chat events
    onChatMessage(callback: (data: any) => void) {
        this.socket?.on('chat:message', callback);
    }

    onTyping(callback: (data: any) => void) {
        this.socket?.on('chat:typing', callback);
    }

    sendChatMessage(targetUserId: string, message: string) {
        this.socket?.emit('chat:message', { targetUserId, message });
    }

    emitTyping(targetUserId: string, isTyping: boolean) {
        this.socket?.emit('chat:typing', { targetUserId, isTyping });
    }

    // Property events
    onPropertyAvailabilityUpdate(callback: (data: any) => void) {
        this.socket?.on('property:availability:updated', callback);
    }

    emitPropertyAvailability(propertyId: string, data: any) {
        this.socket?.emit('property:availability', { propertyId, ...data });
    }

    // Presence
    updatePresence(status: 'online' | 'away' | 'busy') {
        this.socket?.emit('presence:update', { status });
    }

    // User connection events (admin only)
    onUserConnected(callback: (data: any) => void) {
        this.socket?.on('user:connected', callback);
    }

    onUserDisconnected(callback: (data: any) => void) {
        this.socket?.on('user:disconnected', callback);
    }

    // Generic event listeners
    on(event: string, callback: (data: any) => void) {
        this.socket?.on(event, callback);
    }

    off(event: string, callback?: (data: any) => void) {
        if (callback) {
            this.socket?.off(event, callback);
        } else {
            this.socket?.off(event);
        }
    }

    emit(event: string, data: any) {
        this.socket?.emit(event, data);
    }

    isConnected() {
        return this.socket?.connected || false;
    }

    getSocket() {
        return this.socket;
    }
}

export const socketService = new SocketService();
export default socketService;
