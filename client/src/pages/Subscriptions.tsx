import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubscriptionList from "@/components/SubscriptionList";
import AddSubscriptionModal from "@/components/AddSubscriptionModal";

export default function Subscriptions() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600 mt-1">Manage your recurring payments</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Subscription
          </Button>
        </div>
      </div>
      
      {/* Subscription List */}
      <SubscriptionList />
      
      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </>
  );
}
