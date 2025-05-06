import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type TimeRange = 'monthly' | 'yearly';

export default function ExpenseChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["/api/subscriptions"],
  });

  const getChartData = () => {
    if (!subscriptions) return [];

    // For monthly view show last 12 months
    if (timeRange === 'monthly') {
      // This is a simplified version that would need to be enhanced with real data
      return [
        { name: 'Jan', amount: 122 },
        { name: 'Feb', amount: 119 },
        { name: 'Mar', amount: 124 },
        { name: 'Apr', amount: 135 },
        { name: 'May', amount: 142 },
        { name: 'Jun', amount: 147 },
        { name: 'Jul', amount: 156 },
        { name: 'Aug', amount: 142 },
        { name: 'Sep', amount: 145 },
        { name: 'Oct', amount: 150 },
        { name: 'Nov', amount: 145 },
        { name: 'Dec', amount: 149 },
      ];
    }

    // For yearly view show last 5 years
    return [
      { name: '2019', amount: 1420 },
      { name: '2020', amount: 1580 },
      { name: '2021', amount: 1720 },
      { name: '2022', amount: 1850 },
      { name: '2023', amount: 1790 },
    ];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Subscription Expenses</CardTitle>
          <div className="inline-flex rounded-md shadow-sm space-x-0">
            <Skeleton className="h-8 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[220px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Subscription Expenses</CardTitle>
        <div className="inline-flex rounded-md shadow-sm space-x-0">
          <Button
            variant={timeRange === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("monthly")}
            className={cn(
              "rounded-r-none",
              timeRange === "monthly" ? "bg-zinc-900 text-white" : ""
            )}
          >
            Monthly
          </Button>
          <Button
            variant={timeRange === "yearly" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("yearly")}
            className={cn(
              "rounded-l-none",
              timeRange === "yearly" ? "bg-zinc-900 text-white" : ""
            )}
          >
            Yearly
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getChartData()}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) => `$${value}`}
                width={50}
              />
              <Tooltip
                formatter={(value) => [`$${value}`, 'Amount']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <Bar dataKey="amount" fill="#2A2A2A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
