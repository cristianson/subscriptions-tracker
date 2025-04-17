import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNextPaymentDate, formatDateFull, getRelativeTimeClass, getDueDateLabel } from "@/lib/utils";
import { Subscription } from "@shared/schema";
import { SiSpotify, SiNetflix, SiAdobe, SiApple, SiGithub } from "react-icons/si";
import { FaCloud } from "react-icons/fa";

// Icon mapping based on provider name (case-insensitive)
const providerIcons: Record<string, React.ReactNode> = {
  "spotify": <SiSpotify className="text-lg text-gray-700" />,
  "netflix": <SiNetflix className="text-lg text-gray-700" />,
  "adobe": <SiAdobe className="text-lg text-gray-700" />,
  "apple": <SiApple className="text-lg text-gray-700" />,
  "github": <SiGithub className="text-lg text-gray-700" />
};

function getIconForProvider(provider: string): React.ReactNode {
  const normalizedProvider = provider.toLowerCase();
  for (const key in providerIcons) {
    if (normalizedProvider.includes(key)) {
      return providerIcons[key];
    }
  }
  return <FaCloud className="text-lg text-gray-700" />;
}

function getBorderColor(date: Date | string): string {
  const paymentDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const diffTime = paymentDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return "border-[#FF4D4F]";
  if (diffDays <= 3) return "border-[#FFAB00]";
  return "border-gray-300";
}

export default function UpcomingPayments() {
  const { data: upcomingPayments, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/dashboard/upcoming-payments"],
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Upcoming Payments</CardTitle>
          <Link href="/calendar" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div className="flex-1 min-w-0 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex-shrink-0 text-right space-y-1">
                  <Skeleton className="h-4 w-16 ml-auto" />
                  <Skeleton className="h-3 w-20 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Upcoming Payments</CardTitle>
        <Link href="/calendar" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingPayments && upcomingPayments.map((subscription) => (
            <div 
              key={subscription.id} 
              className={`flex items-center p-3 bg-gray-50 rounded-lg border-l-4 ${getBorderColor(subscription.nextPaymentDate)}`}
            >
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                  {getIconForProvider(subscription.provider)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{subscription.name}</p>
                <p className="text-xs text-gray-500">{getDueDateLabel(subscription.nextPaymentDate)}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-medium text-gray-900">{formatCurrency(subscription.amount)}</p>
                <p className={`text-xs ${getRelativeTimeClass(subscription.nextPaymentDate)}`}>
                  {formatDateFull(subscription.nextPaymentDate)}
                </p>
              </div>
            </div>
          ))}
          
          {upcomingPayments && upcomingPayments.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500">No upcoming payments</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
