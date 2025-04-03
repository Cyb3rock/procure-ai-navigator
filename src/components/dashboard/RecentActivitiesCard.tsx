
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  action: string;
  target: string;
  time: string;
}

const mockActivities: Activity[] = [
  {
    id: "1",
    user: {
      name: "Alice Johnson",
      initials: "AJ"
    },
    action: "uploaded",
    target: "IT Infrastructure RFP documents",
    time: "10 minutes ago"
  },
  {
    id: "2",
    user: {
      name: "Bob Smith",
      initials: "BS"
    },
    action: "evaluated",
    target: "Office Furniture bid from VendorCorp",
    time: "1 hour ago"
  },
  {
    id: "3",
    user: {
      name: "Carol Williams",
      initials: "CW"
    },
    action: "created",
    target: "Marketing Services RFP",
    time: "2 hours ago"
  },
  {
    id: "4",
    user: {
      name: "David Brown",
      initials: "DB"
    },
    action: "submitted",
    target: "evaluation scores for Cloud Migration proposals",
    time: "3 hours ago"
  },
  {
    id: "5",
    user: {
      name: "Emma Davis",
      initials: "ED"
    },
    action: "approved",
    target: "Training & Development contract award",
    time: "5 hours ago"
  }
];

export function RecentActivitiesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[350px] overflow-auto scrollbar-thin">
        <div className="space-y-5">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback className="bg-procurement-100 text-procurement-700">
                  {activity.user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm leading-none">
                  <span className="font-medium">{activity.user.name}</span>
                  <span className="text-muted-foreground"> {activity.action} </span>
                  <span>{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
