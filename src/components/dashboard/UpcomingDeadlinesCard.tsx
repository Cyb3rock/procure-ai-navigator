
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Deadline {
  id: string;
  title: string;
  date: string;
  daysLeft: number;
  category: 'rfp' | 'evaluation' | 'contract';
}

const mockDeadlines: Deadline[] = [
  {
    id: "1",
    title: "IT Infrastructure RFP Response Deadline",
    date: "2023-11-15",
    daysLeft: 2,
    category: 'rfp'
  },
  {
    id: "2",
    title: "Office Furniture Procurement Evaluation",
    date: "2023-11-20",
    daysLeft: 7,
    category: 'evaluation'
  },
  {
    id: "3",
    title: "Marketing Services Contract Signing",
    date: "2023-11-25",
    daysLeft: 12,
    category: 'contract'
  },
  {
    id: "4",
    title: "Cloud Migration Vendor Presentation",
    date: "2023-11-18",
    daysLeft: 5,
    category: 'evaluation'
  },
  {
    id: "5",
    title: "Training Programs RFP Release",
    date: "2023-11-14",
    daysLeft: 1,
    category: 'rfp'
  }
];

const categoryColors: Record<string, string> = {
  rfp: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  evaluation: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  contract: "bg-green-100 text-green-800 hover:bg-green-200"
};

export function UpcomingDeadlinesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {mockDeadlines.map((deadline) => (
            <div 
              key={deadline.id} 
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{deadline.title}</span>
                  <Badge className={cn(categoryColors[deadline.category], "text-xs font-normal")}>
                    {deadline.category.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  <span>{deadline.date}</span>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs rounded-full px-2 py-1",
                deadline.daysLeft <= 2 ? "bg-red-100 text-red-800" : 
                deadline.daysLeft <= 7 ? "bg-yellow-100 text-yellow-800" : 
                "bg-green-100 text-green-800"
              )}>
                <ClockIcon className="h-3 w-3" />
                <span>{deadline.daysLeft} days</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
