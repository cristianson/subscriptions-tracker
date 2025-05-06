import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, SlidersVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import SummaryCards from "@/components/SummaryCards";
import ExpenseChart from "@/components/ExpenseChart";
import UpcomingPayments from "@/components/UpcomingPayments";
import SubscriptionList from "@/components/SubscriptionList";
import AddSubscriptionModal from "@/components/AddSubscriptionModal";

export default function Dashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track and manage all your subscriptions</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Subscription
          </Button>
          
          <Button variant="outline">
            <SlidersVertical className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Summary Cards */}
        <SummaryCards />
        
        {/* Expense Chart */}
        <div className="md:col-span-8">
          <ExpenseChart />
        </div>
        
        {/* Upcoming Payments */}
        <div className="md:col-span-4">
          <UpcomingPayments />
        </div>
        
        {/* Subscription List */}
        <div className="md:col-span-12">
          <SubscriptionList />
        </div>
      </div>
      
      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </>
  );
}
