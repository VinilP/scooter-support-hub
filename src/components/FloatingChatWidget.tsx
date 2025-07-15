import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Paperclip, User, Bot, FileText, Image, X, MessageCircle, Minimize2, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "./AuthModal";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  file?: {
    name: string;
    type: 'pdf' | 'image';
    size: string;
  };
}

const STORAGE_KEYS = {
  MESSAGES: 'scootsupport_chat_messages',
  CONVERSATION_ID: 'scootsupport_conversation_id',
  CHAT_STATE: 'scootsupport_chat_state'
};

const getInitialMessages = (): Message[] => [
  {
    id: '1',
    content: "Hi! I'm here to help you with any questions about your electric scooter. How can I assist you today?",
    sender: 'bot',
    timestamp: new Date(),
  }
];

const FloatingChatWidget = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(getInitialMessages());
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const storedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
        const storedConversationId = localStorage.getItem(STORAGE_KEYS.CONVERSATION_ID);
        const storedChatState = localStorage.getItem(STORAGE_KEYS.CHAT_STATE);

        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages);
          // Convert timestamp strings back to Date objects
          const messagesWithDates = parsedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(messagesWithDates);
        }

        if (storedConversationId) {
          setCurrentConversationId(storedConversationId);
        }

        if (storedChatState) {
          const { isExpanded } = JSON.parse(storedChatState);
          setIsExpanded(isExpanded);
        }
      } catch (error) {
        console.error('Error loading chat history from localStorage:', error);
        // Fallback to initial state if localStorage is corrupted
        setMessages(getInitialMessages());
        setCurrentConversationId(null);
      }
    };

    loadChatHistory();
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  }, [messages]);

  // Save conversation ID to localStorage whenever it changes
  useEffect(() => {
    try {
      if (currentConversationId) {
        localStorage.setItem(STORAGE_KEYS.CONVERSATION_ID, currentConversationId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CONVERSATION_ID);
      }
    } catch (error) {
      console.error('Error saving conversation ID to localStorage:', error);
    }
  }, [currentConversationId]);

  // Save chat state (expanded/collapsed) to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_STATE, JSON.stringify({ isExpanded }));
    } catch (error) {
      console.error('Error saving chat state to localStorage:', error);
    }
  }, [isExpanded]);

  // Clear localStorage when user signs out
  useEffect(() => {
    if (!user) {
      // Only clear if user explicitly signed out (not on initial load)
      const hasStoredState = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (hasStoredState && currentConversationId) {
        // User signed out, clear chat history
        clearChatHistory();
      }
    }
  }, [user, currentConversationId]);

  const clearChatHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.MESSAGES);
      localStorage.removeItem(STORAGE_KEYS.CONVERSATION_ID);
      localStorage.removeItem(STORAGE_KEYS.CHAT_STATE);
      setMessages(getInitialMessages());
      setCurrentConversationId(null);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (validTypes.includes(file.type)) {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please select a file smaller than 10MB.",
            variant: "destructive",
          });
          return;
        }
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF or image file.",
          variant: "destructive",
        });
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileType = (file: File): 'pdf' | 'image' => {
    return file.type === 'application/pdf' ? 'pdf' : 'image';
  };

  const uploadFile = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload files.",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('upload-file', {
        body: formData,
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() && !selectedFile) return;

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    let fileContext = '';
    let fileUrl = '';
    let fileName = '';
    let fileType = '';

    // Upload file if present
    if (selectedFile) {
      const uploadResult = await uploadFile(selectedFile);
      if (!uploadResult) return; // Upload failed
      
      fileContext = uploadResult.fileContext;
      fileUrl = uploadResult.fileUrl;
      fileName = uploadResult.fileName;
      fileType = uploadResult.fileType;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue || (selectedFile ? `Uploaded ${selectedFile.name}` : ''),
      sender: 'user',
      timestamp: new Date(),
      file: selectedFile ? {
        name: selectedFile.name,
        type: getFileType(selectedFile),
        size: formatFileSize(selectedFile.size)
      } : undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setSelectedFile(null);
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('save-chat', {
        body: {
          message: inputValue,
          conversationId: currentConversationId,
          fileContext: fileContext || undefined,
        },
      });

      if (error) throw error;

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      
      // Update conversation ID if this was the first message
      if (!currentConversationId && data.conversationId) {
        setCurrentConversationId(data.conversationId);
      }

    } catch (error: any) {
      toast({
        title: "Message Failed",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAuthSuccess = () => {
    toast({
      title: "Welcome!",
      description: "You can now use the chat feature.",
    });
  };

  const handleSignOut = async () => {
    // Clear chat history before signing out
    clearChatHistory();
    await signOut();
    toast({
      title: "Signed Out",
      description: "You've been signed out successfully.",
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Bubble Trigger */}
      {!isExpanded && (
        <Button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
            "bg-gradient-to-r from-primary to-primary-glow",
            "hover:scale-110 hover:shadow-xl",
            "widget-glass border-2"
          )}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Expanded Chat Interface */}
      {isExpanded && (
        <Card className={cn(
          "w-[350px] h-[500px] md:w-[400px] md:h-[600px]",
          "flex flex-col rounded-2xl overflow-hidden",
          "widget-glass border-2 animate-scale-in"
        )}>
          {/* Header */}
          <div className="p-4 border-b glass-morphism">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-primary">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Support Assistant</h3>
                  <p className="text-xs text-muted-foreground">
                    {user ? `Signed in as ${user.email?.substring(0, 20)}...` : 'Sign in for full features'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {user ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="h-8 w-8 p-0 hover:bg-muted/50"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="h-8 w-8 p-0 hover:bg-muted/50"
                  >
                    <LogIn className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-8 w-8 p-0 hover:bg-muted/50"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2 max-w-[85%] animate-fade-in",
                  message.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1",
                  message.sender === 'user' 
                    ? "bg-gradient-primary" 
                    : "glass-morphism"
                )}>
                  {message.sender === 'user' ? (
                    <User className="h-3 w-3 text-white" />
                  ) : (
                    <Bot className="h-3 w-3 text-primary" />
                  )}
                </div>

                {/* Message bubble */}
                <div className={cn(
                  "p-3 rounded-2xl max-w-full text-sm",
                  message.sender === 'user'
                    ? "bg-gradient-primary text-white rounded-br-lg"
                    : "glass-morphism rounded-bl-lg"
                )}>
                  {/* File attachment */}
                  {message.file && (
                    <div className="mb-2 p-2 rounded-lg bg-background/20 border border-border/20">
                      <div className="flex items-center gap-2">
                        {message.file.type === 'pdf' ? (
                          <FileText className="h-3 w-3 text-red-500" />
                        ) : (
                          <Image className="h-3 w-3 text-blue-500" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{message.file.name}</p>
                          <p className="text-xs opacity-70">{message.file.size}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Message text */}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Timestamp */}
                  <p className={cn(
                    "text-xs mt-1 opacity-70",
                    message.sender === 'user' ? "text-right" : ""
                  )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2 max-w-[85%] animate-fade-in">
                <div className="w-6 h-6 rounded-full glass-morphism flex items-center justify-center mt-1">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="p-3 glass-morphism rounded-2xl rounded-bl-lg">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-3 border-t glass-morphism">
            {/* File preview */}
            {selectedFile && (
              <div className="mb-2 p-2 rounded-lg border glass-morphism">
                <div className="flex items-center gap-2">
                  {getFileType(selectedFile) === 'pdf' ? (
                    <FileText className="h-3 w-3 text-red-500" />
                  ) : (
                    <Image className="h-3 w-3 text-blue-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Input row */}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 h-8 w-8 glass-morphism"
                disabled={uploading}
              >
                <Paperclip className="h-3 w-3" />
              </Button>

              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={user ? "Type your message..." : "Sign in to chat..."}
                className="flex-1 text-sm glass-morphism border-0"
                disabled={!user}
              />

              <Button
                onClick={sendMessage}
                disabled={(!inputValue.trim() && !selectedFile) || uploading || isTyping || !user}
                size="icon"
                className="shrink-0 h-8 w-8 bg-gradient-primary hover:scale-105 transition-transform"
              >
                <Send className="h-3 w-3 text-white" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 text-center">
              {user ? "Upload PDF or images for better assistance" : "Sign in to use chat features"}
            </p>
          </div>
        </Card>
      )}
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default FloatingChatWidget;