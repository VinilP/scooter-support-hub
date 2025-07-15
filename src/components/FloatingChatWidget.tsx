import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Paperclip, User, Bot, FileText, Image, X, MessageCircle, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

const FloatingChatWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm here to help you with any questions about your electric scooter. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        alert('Please select a PDF or image file (JPEG, PNG)');
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

  const sendMessage = async () => {
    if (!inputValue.trim() && !selectedFile) return;

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

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: selectedFile 
          ? "I've received your file. Let me analyze it and get back to you with relevant information."
          : "Thanks for your question! I'm processing your request and will provide you with detailed assistance shortly.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 2000);
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
                  <p className="text-xs text-muted-foreground">Always here to help</p>
                </div>
              </div>
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
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 h-8 w-8 glass-morphism"
              >
                <Paperclip className="h-3 w-3" />
              </Button>

              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 text-sm glass-morphism border-0"
              />

              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim() && !selectedFile}
                size="icon"
                className="shrink-0 h-8 w-8 bg-gradient-primary hover:scale-105 transition-transform"
              >
                <Send className="h-3 w-3 text-white" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 text-center">
              Upload PDF or images for better assistance
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FloatingChatWidget;