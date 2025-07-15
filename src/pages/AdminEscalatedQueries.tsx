import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, AlertTriangle, MessageSquare, Calendar, User, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import NotAuthorized from "@/components/NotAuthorized";

interface EscalatedQuery {
  id: string;
  original_question: string;
  ai_response: string;
  escalation_reason: string;
  user_feedback: string | null;
  status: string;
  file_url: string | null;
  conversation_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const AdminEscalatedQueries = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading, hasProfile } = useAdminAuth();
  const { toast } = useToast();
  const [queries, setQueries] = useState<EscalatedQuery[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<EscalatedQuery[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isAdmin) {
      fetchEscalatedQueries();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    // Filter queries based on search term and status
    let filtered = queries;
    
    if (searchTerm) {
      filtered = filtered.filter(query => 
        query.original_question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.escalation_reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (query.user_feedback && query.user_feedback.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(query => query.status === statusFilter);
    }
    
    setFilteredQueries(filtered);
  }, [queries, searchTerm, statusFilter]);

  const fetchEscalatedQueries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('escalated_queries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQueries(data || []);
      setFilteredQueries(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch escalated queries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQueryStatus = async (queryId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('escalated_queries')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', queryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Query status updated successfully",
      });
      
      fetchEscalatedQueries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update query status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonsColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'not_helpful':
        return 'bg-orange-100 text-orange-800';
      case 'incorrect_info':
        return 'bg-red-100 text-red-800';
      case 'needs_human':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasProfile || !isAdmin) {
    return <NotAuthorized />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <div className="w-px h-6 bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Escalated Issues
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 border-gray-300"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-gray-300">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Link to="/admin/faqs">
                  <Button variant="outline" className="border-gray-300">
                    Manage FAQs
                  </Button>
                </Link>
                <Link to="/admin/orders">
                  <Button variant="outline" className="border-gray-300">
                    View Orders
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-2xl font-bold text-gray-900">{queries.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600 ml-auto" />
              </div>
            </CardContent>
          </Card>
          
          {['pending', 'in_progress', 'resolved'].map((status) => (
            <Card key={status}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600 capitalize">
                      {status.replace('_', ' ')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {queries.filter(query => query.status === status).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Queries List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredQueries.length === 0 ? (
              <Card className="border-gray-200">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">
                    {searchTerm || statusFilter !== "all" ? "No issues match your filters." : "No escalated issues found."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredQueries.map((query) => (
                <Card key={query.id} className="border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(query.status)}>
                          {query.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getReasonsColor(query.escalation_reason)}>
                          {query.escalation_reason.replace('_', ' ')}
                        </Badge>
                        {query.file_url && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            Has File
                          </Badge>
                        )}
                      </div>
                      
                      <Select 
                        value={query.status} 
                        onValueChange={(value) => updateQueryStatus(query.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Original Question
                      </h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {query.original_question}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">AI Response</h4>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-md">
                        {query.ai_response}
                      </p>
                    </div>
                    
                    {query.user_feedback && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">User Feedback</h4>
                        <p className="text-gray-700 bg-yellow-50 p-3 rounded-md">
                          {query.user_feedback}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>User: {query.user_id.slice(0, 8)}...</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(query.created_at)}</span>
                        </div>
                      </div>
                      
                      {query.file_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(query.file_url!, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View File
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEscalatedQueries;