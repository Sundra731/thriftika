
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { io } from 'socket.io-client';
import Toast from '../components/Toast';
import useToastStore from '../store/toastStore';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    fetchConversations();

    // Initialize Socket.IO
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    });

    setSocket(newSocket);

    // Join user room
    newSocket.emit('join', user?._id);

    // Listen for new messages
    newSocket.on('new-message', (message) => {
      if (selectedConversation && message.conversation === selectedConversation._id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
      // Update conversations list
      fetchConversations();
    });

    // Listen for notifications
    newSocket.on('message-notification', (data) => {
      showToast(`New message from ${data.sender.name}`, 'info');
      fetchConversations();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      if (socket) {
        socket.emit('join-conversation', selectedConversation._id);
      }
    }

    return () => {
      if (socket && selectedConversation) {
        socket.emit('leave-conversation', selectedConversation._id);
      }
    };
  }, [selectedConversation, socket]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.data);
    } catch (error) {
      showToast('Failed to load conversations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/messages/${conversationId}`);
      setMessages(response.data.data);
      scrollToBottom();
    } catch (error) {
      showToast('Failed to load messages', 'error');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !socket) return;

    try {
      // Send via Socket.IO for real-time
      socket.emit('send-message', {
        conversationId: selectedConversation._id,
        content: newMessage,
        userId: user._id,
      });

      setNewMessage('');
    } catch (error) {
      showToast('Failed to send message', 'error');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg h-[600px] flex">
          {/* Conversations Sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Messages</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="mb-4">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                    <p className="text-gray-500 mb-4">
                      Messaging is available after you make a purchase or receive an order.
                    </p>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p><strong>How it works:</strong></p>
                      <ul className="text-left list-disc list-inside space-y-1">
                        <li>Buy an item from a seller</li>
                        <li>A conversation automatically opens</li>
                        <li>Chat securely within the app</li>
                        <li>Messages are monitored for safety</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const otherUser = conversation.buyer._id === user._id ? conversation.seller : conversation.buyer;
                  const unreadCount = conversation.buyer._id === user._id ? conversation.buyerUnreadCount : conversation.sellerUnreadCount;

                  return (
                    <div
                      key={conversation._id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?._id === conversation._id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={otherUser.avatar || '/default-avatar.png'}
                          alt={otherUser.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {otherUser.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            Transaction: ${conversation.transaction?.amount || 'N/A'}
                          </p>
                          {conversation.lastMessage && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {conversation.lastMessageAt && (
                            <p className="text-xs text-gray-400">
                              {formatTime(conversation.lastMessageAt)}
                            </p>
                          )}
                          {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedConversation.buyer._id === user._id
                        ? selectedConversation.seller.avatar || '/default-avatar.png'
                        : selectedConversation.buyer.avatar || '/default-avatar.png'
                      }
                      alt="Other user"
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedConversation.buyer._id === user._id
                          ? selectedConversation.seller.name
                          : selectedConversation.buyer.name
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        Transaction: ${selectedConversation.transaction?.amount || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => {
                    const isOwnMessage = message.sender._id === user._id;
                    const showDate = index === 0 ||
                      formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                    return (
                      <div key={message._id}>
                        {showDate && (
                          <div className="text-center mb-4">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                        )}

                        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                              {formatTime(message.createdAt)}
                            </p>
                            {message.isFlagged && (
                              <p className="text-xs text-red-500 mt-1">⚠️ Flagged for review</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </form>
                  <p className="text-xs text-gray-500 mt-2">
                    Messages are monitored for scam keywords to keep you safe.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                  <div className="mb-4">
                    <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500 mb-4">
                    Click on a conversation from the sidebar to start chatting with buyers or sellers you've done business with.
                  </p>
                  <div className="text-sm text-gray-600">
                    <p><strong>Secure messaging features:</strong></p>
                    <ul className="text-left list-disc list-inside mt-2 space-y-1">
                      <li>Real-time chat with transaction partners</li>
                      <li>Automatic scam keyword detection</li>
                      <li>Message history and notifications</li>
                      <li>Keeps conversations within the platform</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toast />
    </div>
  );
};

export default Messages;
                             