import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { socketService } from '../services/socketService';
import { Badge } from './PremiumUX';

interface ChatMessage {
    id: string;
    senderId: string;
    receiverId: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

interface ChatWindowProps {
    targetUserId: string;
    targetUserName: string;
    currentUserId: string;
    onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
    targetUserId,
    targetUserName,
    currentUserId,
    onClose
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isOnline, setIsOnline] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Load chat history
        loadChatHistory();

        // Set up real-time listeners
        socketService.onChatMessage((data) => {
            if (data.senderId === targetUserId || data.receiverId === targetUserId) {
                setMessages(prev => [...prev, data]);
            }
        });

        socketService.onTyping((data: { userId: string; isTyping: boolean }) => {
            if (data.userId === targetUserId) {
                setOtherUserTyping(data.isTyping);
            }
        });

        socketService.onStatusChange((data: { userId: string; status: string }) => {
            if (data.userId === targetUserId) {
                setIsOnline(data.isOnline);
            }
        });

        // Scroll to bottom
        scrollToBottom();

        return () => {
            socketService.off('chat:message');
            socketService.off('user:typing');
            socketService.off('user:status');
        };
    }, [targetUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadChatHistory = async () => {
        // This would load chat history from API
        setMessages([]);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            id: Date.now().toString(),
            senderId: currentUserId,
            receiverId: targetUserId,
            message: newMessage.trim(),
            timestamp: new Date(),
            read: false
        };

        // Add to local state immediately
        setMessages(prev => [...prev, messageData]);
        setNewMessage('');

        // Send via socket
        if (socketService.isConnected()) {
            socketService.sendChatMessage(messageData.recipientId, messageData);
        }

        // Stop typing indicator
        socketService.emitTyping(targetUserId, false);
    };

    const handleTyping = (value: string) => {
        setNewMessage(value);

        // Emit typing indicator
        socketService.emitTyping(targetUserId, value.length > 0);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        if (value.length > 0) {
            typingTimeoutRef.current = setTimeout(() => {
                socketService.emitTyping(targetUserId, false);
            }, 2000);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-40">
            {/* Chat Header */}
            <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                            {targetUserName.charAt(0).toUpperCase()}
                        </div>
                        {isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-medium">{targetUserName}</h3>
                        <p className="text-xs text-blue-200">
                            {isOnline ? '🟢 Online' : '⚫ Offline'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 text-xl"
                >
                    ✕
                </button>
            </div>

            {/* Messages Area */}
            <div className="h-80 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p>💬 Start the conversation!</p>
                        <p className="text-sm">Send a message to {targetUserName}</p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs px-4 py-2 rounded-lg ${message.senderId === currentUserId
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                    }`}
                            >
                                <p className="text-sm">{message.message}</p>
                                <p className={`text-xs mt-1 ${message.senderId === currentUserId
                                    ? 'text-blue-200'
                                    : 'text-gray-500'
                                    }`}>
                                    {format(message.timestamp, 'HH:mm')}
                                </p>
                            </div>
                        </div>
                    ))
                )}

                {/* Typing Indicator */}
                {otherUserTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 px-4 py-2 rounded-lg">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => handleTyping(e.target.value)}
                        placeholder={`Message ${targetUserName}...`}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

// Chat System Component for managing multiple conversations
interface ChatSystemProps {
    currentUserId: string;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ currentUserId }) => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [isMinimized, setIsMinimized] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Load conversations and set up real-time updates
        loadConversations();

        socketService.onChatMessage((data) => {
            // Update unread count if not in active chat
            if (activeChat !== data.senderId && data.receiverId === currentUserId) {
                setUnreadCount(prev => prev + 1);
            }

            // Update conversation list
            loadConversations();
        });

        return () => {
            socketService.off('chat:message');
        };
    }, [currentUserId, activeChat]);

    const loadConversations = async () => {
        // This would load conversations from API
        // For now, we'll use mock data
        setConversations([]);
    };

    const startChat = (userId: string, userName: string) => {
        setActiveChat(userId);
        setIsMinimized(false);
        setUnreadCount(0);
    };

    const closeChat = () => {
        setActiveChat(null);
        setIsMinimized(true);
    };

    return (
        <>
            {/* Chat Toggle Button */}
            {isMinimized && (
                <button
                    onClick={() => setIsMinimized(false)}
                    className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-30"
                >
                    <div className="relative">
                        💬
                        {unreadCount > 0 && (
                            <div className="absolute -top-2 -right-2">
                                <Badge color="red" size="small">
                                    {unreadCount}
                                </Badge>
                            </div>
                        )}
                    </div>
                </button>
            )}

            {/* Active Chat Window */}
            {!isMinimized && activeChat && (
                <ChatWindow
                    targetUserId={activeChat}
                    targetUserName="Support"
                    currentUserId={currentUserId}
                    onClose={closeChat}
                />
            )}
        </>
    );
};

export default ChatSystem;