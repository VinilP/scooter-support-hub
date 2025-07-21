import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Paperclip, User, Bot, FileText, Image, X, MessageCircle, Minimize2, LogIn, LogOut, Flag, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "./AuthModal";
import EscalationModal from "./EscalationModal";
import ChatHistory from "./ChatHistory";

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

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const getInitialMessages = (): Message[] => [
  {
    id: '1',
    content: "Hi! I'm here to help you with any questions about your electric scooter. Here are some frequently asked questions you can click on, or feel free to type your own question:",
    sender: 'bot',
    timestamp: new Date(),
  }
];

const FloatingChatWidget = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [escalationData, setEscalationData] = useState<{
    messageId: string;
    question: string;
    answer: string;
    fileUrl?: string;
  } | null>(null);
  const [isSubmittingEscalation, setIsSubmittingEscalation] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(getInitialMessages());
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [showFaqSuggestions, setShowFaqSuggestions] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load FAQs and chat history on mount
  useEffect(() => {
    const loadFaqs = async () => {
      try {
        console.log('Loading FAQs...');
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: true })
          .limit(5);

        if (error) throw error;
        console.log('FAQs loaded:', data);
        setFaqs(data || []);
      } catch (error) {
        console.error('Error loading FAQs:', error);
      }
    };

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
          // If there are stored messages beyond the initial one, hide FAQ suggestions
          if (messagesWithDates.length > 1) {
            setShowFaqSuggestions(false);
          }
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

    loadFaqs();
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
      setShowFaqSuggestions(true);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  const handleFaqClick = async (faq: FAQ) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: faq.question,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setShowFaqSuggestions(false);

    // Special handling for order status FAQ
    if (faq.question === "What is my order status?") {
      setIsTyping(true);
      
      try {
        if (!user) {
          const responseMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: "Please log in to view your order status.",
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, responseMessage]);
          addFollowUpMessage();
          setIsTyping(false);
          return;
        }

        // Fetch user orders
        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('order_date', { ascending: false });

        if (error) throw error;

        let responseContent = "";
        if (!orders || orders.length === 0) {
          responseContent = "You don't have any orders yet. Would you like to browse our scooter products?";
        } else {
          responseContent = "Here are your current orders:\n\n";
          orders.forEach((order, index) => {
            const orderDate = new Date(order.order_date).toLocaleDateString();
            const deliveryEta = order.delivery_eta 
              ? new Date(order.delivery_eta).toLocaleDateString()
              : "TBD";
            
            responseContent += `${index + 1}. **Order ${order.order_id}**\n`;
            responseContent += `   • Model: ${order.model}\n`;
            responseContent += `   • Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}\n`;
            responseContent += `   • Order Date: ${orderDate}\n`;
            responseContent += `   • Estimated Delivery: ${deliveryEta}\n\n`;
          });
        }

        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: responseContent,
          sender: 'bot',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, responseMessage]);
        
        // Add follow-up message after a short delay
        setTimeout(() => {
          addFollowUpMessage();
        }, 1000);

      } catch (error) {
        console.error('Error fetching orders:', error);
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'm sorry, I couldn't retrieve your order information right now. Please try again later or contact our support team.",
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, responseMessage]);
        addFollowUpMessage();
      } finally {
        setIsTyping(false);
      }
    } else {
      // Regular FAQ response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: faq.answer,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Add follow-up message after a short delay
      setTimeout(() => {
        addFollowUpMessage();
      }, 1000);
    }
  };

  const addFollowUpMessage = () => {
    const followUpMessage: Message = {
      id: (Date.now() + 2).toString(),
      content: "Is there anything else I can help you with? You can type your question or click 'Show FAQ Options' to see common questions.",
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, followUpMessage]);
  };

  const showFaqOptions = () => {
    setShowFaqSuggestions(true);
    const faqMessage: Message = {
      id: Date.now().toString(),
      content: "Here are some frequently asked questions you can click on:",
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, faqMessage]);
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

    // Hide FAQ suggestions once user starts typing their own messages
    setShowFaqSuggestions(false);

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

  const handleEscalateQuery = (messageId: string, question: string, answer: string, fileUrl?: string) => {
    setEscalationData({ messageId, question, answer, fileUrl });
    setIsEscalationModalOpen(true);
  };

  const handleSubmitEscalation = async (feedback: string) => {
    if (!escalationData || !currentConversationId) return;

    setIsSubmittingEscalation(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-query', {
        body: {
          conversationId: currentConversationId,
          originalQuestion: escalationData.question,
          aiResponse: escalationData.answer,
          fileUrl: escalationData.fileUrl,
          userFeedback: feedback || undefined,
          escalationReason: 'not_helpful'
        },
      });

      if (error) throw error;

      toast({
        title: "Query Submitted",
        description: "Your query has been submitted for review. Our team will get back to you soon.",
      });

      setIsEscalationModalOpen(false);
      setEscalationData(null);

    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit query for review",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEscalation(false);
    }
  };

  const handleSelectConversation = (conversationId: string, conversationMessages: Message[]) => {
    setCurrentConversationId(conversationId);
    setMessages(conversationMessages);
    setShowFaqSuggestions(false);
    setShowHistory(false);
    
    toast({
      title: "Conversation Loaded",
      description: "Previous conversation has been loaded.",
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
          data-chat-trigger
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
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                    className="h-8 w-8 p-0 hover:bg-muted/50"
                    title="Chat history"
                  >
                    <History className="h-3 w-3" />
                  </Button>
                )}
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChatHistory}
                  className="h-8 w-8 p-0 hover:bg-muted/50"
                  title="Clear chat"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area - Chat or History */}
          {showHistory ? (
            <ChatHistory 
              onBack={() => setShowHistory(false)}
              onSelectConversation={handleSelectConversation}
            />
          ) : (
            <>
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
                      
                      {/* Show FAQ Options button for follow-up messages */}
                      {message.sender === 'bot' && message.content.includes("Is there anything else I can help you with?") && (
                        <div className="mt-3 pt-2 border-t border-border/20">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={showFaqOptions}
                            className="h-7 px-3 text-xs glass-morphism hover:bg-primary/10"
                          >
                            <Bot className="w-3 h-3 mr-1" />
                            Show FAQ Options
                          </Button>
                        </div>
                      )}
                      
                      {/* Not helpful button for bot messages */}
                      {message.sender === 'bot' && user && message.id !== '1' && !message.content.includes("Is there anything else I can help you with?") && (
                        <div className="mt-3 pt-2 border-t border-border/20">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Find the previous user message to get the question
                              const messageIndex = messages.findIndex(m => m.id === message.id);
                              const prevUserMessage = messages.slice(0, messageIndex).reverse().find(m => m.sender === 'user');
                              const question = prevUserMessage?.content || 'Previous question not found';
                              const fileUrl = prevUserMessage?.file ? 'file-attached' : undefined;
                              
                              handleEscalateQuery(message.id, question, message.content, fileUrl);
                            }}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Flag className="w-3 h-3 mr-1" />
                            Not helpful? Submit query
                          </Button>
                        </div>
                      )}
                      
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

                {/* FAQ Suggestions */}
                {(() => {
                  console.log('FAQ Debug:', { 
                    showFaqSuggestions, 
                    faqsLength: faqs.length, 
                    faqs: faqs.slice(0, 2) // Just first 2 for debugging
                  });
                  return showFaqSuggestions && faqs.length > 0 && (
                    <div className="space-y-2 animate-fade-in">
                      <div className="text-xs text-muted-foreground text-center mb-2">
                        Click on a question below:
                      </div>
                      {faqs.map((faq) => (
                        <Button
                          key={faq.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleFaqClick(faq)}
                          className="w-full text-left p-3 h-auto glass-morphism hover:bg-primary/10 justify-start text-xs"
                        >
                          <div className="flex items-start gap-2">
                            <Bot className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                            <span className="text-left break-words">{faq.question}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  );
                })()}

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
            </>
          )}

          {/* Input area - Only show when not in history view */}
          {!showHistory && (
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
          )}
        </Card>
      )}
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
      
      <EscalationModal
        isOpen={isEscalationModalOpen}
        onClose={() => setIsEscalationModalOpen(false)}
        onSubmit={handleSubmitEscalation}
        isSubmitting={isSubmittingEscalation}
      />
    </div>
  );
};

export default FloatingChatWidget;