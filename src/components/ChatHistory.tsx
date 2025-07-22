import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, MessageCircle, Calendar, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  latest_message: string;
  message_count: number;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  created_at: string;
  file_name?: string;
  file_type?: string;
}

interface ChatHistoryProps {
  onBack: () => void;
  onSelectConversation: (conversationId: string, messages: any[]) => void;
}

const ChatHistory = ({ onBack, onSelectConversation }: ChatHistoryProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-conversations');
      
      if (error) throw error;
      
      setConversations(data.conversations || []);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`https://hzkhillrqgssivrnufhg.supabase.co/functions/v1/get-conversations?conversationId=${conversationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation messages",
        variant: "destructive",
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation.id);
    await loadMessages(conversation.id);
  };

  const handleLoadConversation = () => {
    if (selectedConversation && messages.length > 0) {
      // Convert messages to the format expected by FloatingChatWidget
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.created_at),
        file: msg.file_name ? {
          name: msg.file_name,
          type: msg.file_type === 'pdf' ? 'pdf' as const : 'image' as const,
          size: '...'
        } : undefined
      }));
      
      onSelectConversation(selectedConversation, formattedMessages);
    }
  };

  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);
        
      if (error) throw error;
      
      // Remove from local state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // Clear selection if deleted conversation was selected
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      
      toast({
        title: "Deleted",
        description: "Conversation deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Please sign in to view chat history</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Chat
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b glass-morphism">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h3 className="font-semibold text-sm">Chat History</h3>
              <p className="text-xs text-muted-foreground">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex min-h-0">
        {/* Conversations List */}
        <div className="w-1/2 border-r flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className={cn(
                      "p-3 cursor-pointer transition-all hover:bg-muted/50",
                      selectedConversation === conversation.id && "bg-muted border-primary"
                    )}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle className="h-3 w-3 text-primary shrink-0" />
                          <p className="text-xs font-medium truncate">
                            {conversation.title || `Conversation ${conversation.id.slice(0, 8)}`}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-1">
                          {conversation.latest_message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(conversation.updated_at)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {conversation.message_count} msg{conversation.message_count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => deleteConversation(conversation.id, e)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Messages Preview */}
        <div className="w-1/2 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-3 border-b glass-morphism">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Messages</h4>
                  <Button
                    onClick={handleLoadConversation}
                    size="sm"
                    className="text-xs h-7"
                  >
                    Load Conversation
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                {loadingMessages ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Loading messages...
                  </div>
                ) : (
                  <div className="p-3 space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-2 max-w-[90%]",
                          message.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg text-xs",
                          message.sender === 'user'
                            ? "bg-primary text-primary-foreground"
                            : "glass-morphism"
                        )}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className={cn(
                            "text-xs mt-1 opacity-70",
                            message.sender === 'user' ? "text-right" : ""
                          )}>
                            {new Date(message.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-sm text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Select a conversation to view messages
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;