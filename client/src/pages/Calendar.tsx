import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Subscription } from "@shared/schema";
import { formatCurrency, getDueDateLabel, formatDateFull } from "@/lib/utils";
import AddSubscriptionModal from "@/components/AddSubscriptionModal";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  // Get subscriptions for the selected date
  const getDaySubscriptions = (day: Date) => {
    if (!subscriptions) return [];
    
    return subscriptions.filter(sub => {
      const subDate = new Date(sub.nextPaymentDate);
      return (
        subDate.getDate() === day.getDate() &&
        subDate.getMonth() === day.getMonth() &&
        subDate.getFullYear() === day.getFullYear()
      );
    });
  };

  // Get subscriptions for the selected month
  const getMonthSubscriptions = () => {
    if (!subscriptions || !date) return [];
    
    return subscriptions.filter(sub => {
      const subDate = new Date(sub.nextPaymentDate);
      return (
        subDate.getMonth() === date.getMonth() &&
        subDate.getFullYear() === date.getFullYear()
      );
    }).sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime());
  };

  // Calculate the total amount for the selected date
  const getDayTotal = (day: Date) => {
    const daySubscriptions = getDaySubscriptions(day);
    return daySubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  };

  // Calculate the total amount for the selected month
  const getMonthTotal = () => {
    const monthSubscriptions = getMonthSubscriptions();
    return monthSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  };

  // Custom day renderer to show subscription info
  const dayRenderer = (day: Date) => {
    const daySubscriptions = getDaySubscriptions(day);
    const hasSubscriptions = daySubscriptions.length > 0;
    const totalAmount = getDayTotal(day);
    
    return hasSubscriptions ? (
      <div className="relative w-full h-full flex items-center justify-center">
        <span className={hasSubscriptions ? "text-primary font-bold" : ""}>
          {day.getDate()}
        </span>
        {hasSubscriptions && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
          </div>
        )}
      </div>
    ) : (
      day.getDate()
    );
  };

  const selectedDateSubscriptions = date ? getDaySubscriptions(date) : [];

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Calendar</h1>
          <p className="text-gray-600 mt-1">View upcoming subscription payments</p>
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
      
      {/* Calendar View */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                components={{
                  DayContent: ({ date }) => dayRenderer(date),
                }}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="mr-2">
                  {date && (
                    <span>{formatDateFull(date)}</span>
                  )}
                </div>
                <div className="text-sm text-gray-500 ml-auto">
                  {selectedDateSubscriptions.length > 0 ? (
                    <span>{formatCurrency(getDayTotal(date!))}</span>
                  ) : (
                    <span>No payments</span>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateSubscriptions.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateSubscriptions.map((subscription) => (
                    <div 
                      key={subscription.id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{subscription.name}</p>
                        <p className="text-xs text-gray-500">{subscription.provider}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(subscription.amount)}
                        </p>
                        <p className="text-xs text-gray-500">{subscription.billingCycle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No payments due</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There are no subscriptions due on the selected date.
                  </p>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-900">Monthly Overview</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {date && `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`}
                </p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Payments</span>
                    <span className="text-sm font-medium">{getMonthSubscriptions().length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Amount</span>
                    <span className="text-sm font-medium">{formatCurrency(getMonthTotal())}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
