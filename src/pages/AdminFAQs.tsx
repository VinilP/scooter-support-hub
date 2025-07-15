import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import TagInput from "@/components/TagInput";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const AdminFAQs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    tags: [] as string[],
    category: "general",
    is_active: true,
    display_order: 0
  });

  const categories = [
    { value: "general", label: "General" },
    { value: "charging", label: "Charging" },
    { value: "performance", label: "Performance" },
    { value: "maintenance", label: "Maintenance" },
    { value: "safety", label: "Safety" },
    { value: "troubleshooting", label: "Troubleshooting" }
  ];

  const commonTags = [
    "charging", "battery", "power", "speed", "range", "performance",
    "maintenance", "care", "waterproof", "safety", "troubleshooting",
    "repair", "warranty", "tire", "brake", "motor", "bluetooth",
    "app", "scooter", "electric", "general", "help"
  ];

  useEffect(() => {
    if (user) {
      fetchFAQs();
    }
  }, [user]);

  useEffect(() => {
    let filtered = faqs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter(faq => faq.tags.includes(selectedTag));
    }

    setFilteredFaqs(filtered);
  }, [faqs, searchTerm, selectedTag]);

  // Get all unique tags from FAQs
  const allTags = Array.from(new Set(faqs.flatMap(faq => faq.tags))).sort();

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-faqs', {
        method: 'GET'
      });

      if (error) throw error;

      if (data.success) {
        setFaqs(data.data);
        setFilteredFaqs(data.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch FAQs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.functions.invoke('manage-faqs', {
        method: editingFaq ? 'PUT' : 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: `FAQ ${editingFaq ? 'updated' : 'created'} successfully`,
        });
        
        resetForm();
        fetchFAQs();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingFaq ? 'update' : 'create'} FAQ`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      tags: faq.tags || [],
      category: faq.category,
      is_active: faq.is_active,
      display_order: faq.display_order
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const { data, error } = await supabase.functions.invoke('manage-faqs', {
        method: 'DELETE',
        body: { id }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: "FAQ deleted successfully",
        });
        fetchFAQs();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete FAQ",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      tags: [],
      category: "general",
      is_active: true,
      display_order: 0
    });
    setEditingFaq(null);
    setIsDialogOpen(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Please log in to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
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
              <h1 className="text-2xl font-bold text-gray-900">FAQ Administration</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 border-gray-300"
                />
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => resetForm()}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add FAQ
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">
                    {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question" className="text-gray-700">Question</Label>
                    <Input
                      id="question"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      placeholder="Enter the FAQ question..."
                      required
                      className="border-gray-300 focus:border-gray-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="answer" className="text-gray-700">Answer</Label>
                    <Textarea
                      id="answer"
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      placeholder="Enter the FAQ answer..."
                      required
                      rows={4}
                      className="border-gray-300 focus:border-gray-500"
                    />
                  </div>
                  
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-gray-700">Tags</Label>
                    <TagInput
                      tags={formData.tags}
                      onChange={(tags) => setFormData({ ...formData, tags })}
                      suggestions={commonTags}
                      placeholder="Add tags to categorize this FAQ..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-gray-700">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="display_order" className="text-gray-700">Display Order</Label>
                      <Input
                        id="display_order"
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                        className="border-gray-300 focus:border-gray-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active" className="text-gray-700">Active</Label>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingFaq ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTag === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTag(null)}
            className={selectedTag === null ? "bg-gray-900 text-white" : "border-gray-300 text-gray-600"}
          >
            All Tags ({faqs.length})
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={selectedTag === tag ? "bg-gray-900 text-white" : "border-gray-300 text-gray-600"}
            >
              {tag} ({faqs.filter(faq => faq.tags.includes(tag)).length})
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredFaqs.length === 0 ? (
              <Card className="border-gray-200">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">
                    {searchTerm || selectedTag ? "No FAQs match your filters." : "No FAQs found. Create your first FAQ to get started."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredFaqs.map((faq) => (
                <Card key={faq.id} className="border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={faq.is_active ? "default" : "secondary"}
                            className={`text-xs ${
                              faq.is_active 
                                ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {faq.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                            {categories.find(c => c.value === faq.category)?.label || faq.category}
                          </Badge>
                          <div className="flex flex-wrap gap-1">
                            {faq.tags.map((tag) => (
                              <Badge 
                                key={tag}
                                variant="secondary" 
                                className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                                onClick={() => setSelectedTag(tag)}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">
                            Order: {faq.display_order}
                          </span>
                        </div>
                        <CardTitle className="text-lg text-gray-900 mb-2">
                          {faq.question}
                        </CardTitle>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(faq)}
                          className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(faq.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                    <div className="mt-4 text-xs text-gray-400">
                      Created: {new Date(faq.created_at).toLocaleDateString()} • 
                      Updated: {new Date(faq.updated_at).toLocaleDateString()}
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

export default AdminFAQs;