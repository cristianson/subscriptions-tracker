import { useQuery } from "@tanstack/react-query";
import { ArrowDownIcon, ArrowUpIcon, ClockIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function SummaryCards() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/dashboard/summary"],
  });
  
  if (isLoading) {
    return (
      <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-card p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Monthly Cost */}
      <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Monthly Cost</p>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">
              {formatCurrency(data?.totalMonthlyExpense || 0)}
            </h3>
            <p className="text-sm text-success flex items-center mt-1">
              <ArrowDownIcon className="mr-1 h-3 w-3 text-success" />
              <span>4.3% vs last month</span>
            </p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <svg 
              className="w-6 h-6 text-primary" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Active Subscriptions */}
      <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">{data?.activeSubscriptions || 0}</h3>
            <p className="text-sm text-warning flex items-center mt-1">
              <ArrowUpIcon className="mr-1 h-3 w-3 text-warning" />
              <span>2 new this month</span>
            </p>
          </div>
          <div className="bg-[#00D4FF]/10 p-3 rounded-full">
            <svg 
              className="w-6 h-6 text-[#00D4FF]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Upcoming Payments */}
      <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Upcoming Payments</p>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">
              {formatCurrency(data?.upcomingPaymentsTotal || 0)}
            </h3>
            <p className="text-sm text-[#FF4D4F] flex items-center mt-1">
              <ClockIcon className="mr-1 h-3 w-3 text-[#FF4D4F]" />
              <span>{data?.upcomingPaymentsThisWeek || 0} due this week</span>
            </p>
          </div>
          <div className="bg-[#FF4D4F]/10 p-3 rounded-full">
            <svg 
              className="w-6 h-6 text-[#FF4D4F]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
