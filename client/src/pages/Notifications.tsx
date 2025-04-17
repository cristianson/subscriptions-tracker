import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BellIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Subscription } from "@shared/schema";
import { formatCurrency, formatDateFull, getDueDateLabel } from "@/lib/utils";

export default function Notifications() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderDays, setReminderDays] = useState(3);
  
  const { data: upcomingPayments, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/dashboard/upcoming-payments"],
  });
  
  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Manage your payment reminders</p>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders for upcoming payments
                  </p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified by email
                  </p>
                </div>
                <Switch 
                  id="email" 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  disabled={!notificationsEnabled}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reminder-days">Reminder Days Before</Label>
                <div className="flex space-x-2">
                  {[1, 3, 5, 7].map((days) => (
                    <Button
                      key={days}
                      type="button"
                      variant={reminderDays === days ? "default" : "outline"}
                      size="sm"
                      onClick={() => setReminderDays(days)}
                      disabled={!notificationsEnabled}
                      className={reminderDays === days ? "bg-primary text-white" : ""}
                    >
                      {days} {days === 1 ? "day" : "days"}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  You'll receive reminders {reminderDays} days before each payment is due
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payment Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingPayments && upcomingPayments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPayments.map((subscription) => (
                    <div 
                      key={subscription.id}
                      className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="mr-4 mt-1">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <BellIcon className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{subscription.name} Payment</h3>
                            <p className="text-sm text-gray-500">
                              Your subscription to {subscription.provider} ({subscription.description}) will be charged on {formatDateFull(subscription.nextPaymentDate)}.
                            </p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {getDueDateLabel(subscription.nextPaymentDate)}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 flex justify-between items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(subscription.amount)}
                          </p>
                          <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Mark as seen
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming reminders</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You don't have any subscription payments due soon.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
