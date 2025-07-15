import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Paperclip, User, Bot, FileText, Image, X } from "lucide-react";
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

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm here to help you with any questions about your electric scooter. How can I assist you today?",
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
    <div className="flex flex-col h-screen max-h-screen bg-gradient-secondary">
      {/* Header */}
      <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-primary">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Support Assistant</h2>
            <p className="text-sm text-muted-foreground">Ask me anything about your scooter</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 max-w-[85%]",
              message.sender === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              message.sender === 'user' 
                ? "bg-gradient-primary" 
                : "bg-muted"
            )}>
              {message.sender === 'user' ? (
                <User className="h-4 w-4 text-white" />
              ) : (
                <Bot className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Message bubble */}
            <Card className={cn(
              "p-3 max-w-full",
              message.sender === 'user'
                ? "bg-primary text-primary-foreground"
                : "bg-card"
            )}>
              {/* File attachment */}
              {message.file && (
                <div className="mb-2 p-2 rounded-lg bg-background/10 border border-border/20">
                  <div className="flex items-center gap-2">
                    {message.file.type === 'pdf' ? (
                      <FileText className="h-4 w-4 text-red-500" />
                    ) : (
                      <Image className="h-4 w-4 text-blue-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{message.file.name}</p>
                      <p className="text-xs opacity-70">{message.file.size}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Message text */}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Timestamp */}
              <p className={cn(
                "text-xs mt-1 opacity-70",
                message.sender === 'user' ? "text-right" : ""
              )}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </Card>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <Card className="p-3 bg-card">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
        {/* File preview */}
        {selectedFile && (
          <div className="mb-3 p-3 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2">
              {getFileType(selectedFile) === 'pdf' ? (
                <FileText className="h-4 w-4 text-red-500" />
              ) : (
                <Image className="h-4 w-4 text-blue-500" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
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
            className="shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question or describe your issue..."
            className="flex-1"
          />

          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() && !selectedFile}
            className="shrink-0"
            variant="electric"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2 text-center">
          You can upload PDF documents or images (JPEG, PNG) to get more specific help
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;