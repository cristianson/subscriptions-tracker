import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Subscription } from "@shared/schema";
import { formatCurrency, formatDateFull, getRelativeTimeClass } from "@/lib/utils";
import { Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SiSpotify, SiNetflix, SiAdobe, SiApple, SiGithub } from "react-icons/si";
import { FaCloud } from "react-icons/fa";
import AddSubscriptionModal from "./AddSubscriptionModal";

// Icon mapping based on provider name (case-insensitive)
const providerIcons: Record<string, React.ReactNode> = {
  "spotify": <SiSpotify className="text-lg" />,
  "netflix": <SiNetflix className="text-lg" />,
  "adobe": <SiAdobe className="text-lg" />,
  "apple": <SiApple className="text-lg" />,
  "github": <SiGithub className="text-lg" />
};

function getIconForProvider(provider: string): React.ReactNode {
  const normalizedProvider = provider.toLowerCase();
  for (const key in providerIcons) {
    if (normalizedProvider.includes(key)) {
      return providerIcons[key];
    }
  }
  return <FaCloud className="text-lg" />;
}

function getBackgroundColorForProvider(provider: string): string {
  const providerMap: Record<string, string> = {
    "spotify": "bg-purple-100",
    "netflix": "bg-red-100",
    "adobe": "bg-gray-100",
    "apple": "bg-blue-100",
    "github": "bg-gray-100"
  };
  
  const normalizedProvider = provider.toLowerCase();
  for (const key in providerMap) {
    if (normalizedProvider.includes(key)) {
      return providerMap[key];
    }
  }
  
  return "bg-blue-100";
}

function getCategoryColor(category: string): string {
  const categoryMap: Record<string, string> = {
    "Entertainment": "bg-blue-100 text-blue-800",
    "Productivity": "bg-green-100 text-green-800",
    "Utilities": "bg-yellow-100 text-yellow-800",
    "Other": "bg-gray-100 text-gray-800"
  };
  
  return categoryMap[category] || "bg-gray-100 text-gray-800";
}

export default function SubscriptionList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();
  
  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });
  
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/subscriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/upcoming-payments"] });
      toast({
        title: "Subscription deleted",
        description: "The subscription has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete subscription. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this subscription?")) {
      deleteMutation.mutate(id);
    }
  };
  
  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsAddModalOpen(true);
  };
  
  const filteredSubscriptions = subscriptions?.filter(sub => {
    const matchesSearch = searchTerm === "" || 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "" || sub.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base font-semibold">Active Subscriptions</CardTitle>
          <div className="mt-4 md:mt-0 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Next Payment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full mr-4" />
                        <div>
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-20 mt-1" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200">
          <CardTitle className="font-semibold text-gray-800">Active Subscriptions</CardTitle>
          
          <div className="mt-4 md:mt-0 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                className="pl-10"
                placeholder="Search subscriptions"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Cycle</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Payment</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</TableHead>
                  <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions && filteredSubscriptions.length > 0 ? (
                  filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id} className="hover:bg-gray-50">
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 ${getBackgroundColorForProvider(subscription.provider)} rounded-full flex items-center justify-center`}>
                            {getIconForProvider(subscription.provider)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{subscription.name}</div>
                            <div className="text-sm text-gray-500">{subscription.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(subscription.category)}`}>
                          {subscription.category}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={getRelativeTimeClass(subscription.nextPaymentDate)}>
                          {formatDateFull(subscription.nextPaymentDate)}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(subscription.amount)}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(subscription)}
                          className="text-primary hover:text-primary/80 mr-3"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(subscription.id)}
                          className="text-gray-400 hover:text-[#FF4D4F]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm || categoryFilter ? 
                        'No subscriptions match your search criteria' : 
                        'No subscriptions found. Add your first subscription.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredSubscriptions && filteredSubscriptions.length > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to{" "}
                      <span className="font-medium">{filteredSubscriptions.length}</span> of{" "}
                      <span className="font-medium">{subscriptions?.length}</span> subscriptions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AddSubscriptionModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen}
        subscription={editingSubscription}
        onClose={() => setEditingSubscription(null)}
      />
    </>
  );
}
