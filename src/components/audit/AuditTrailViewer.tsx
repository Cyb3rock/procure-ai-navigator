
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock, Download, Filter, Info, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AuditEvent {
  id: string;
  timestamp: string;
  user: {
    name: string;
    role: string;
  };
  action: string;
  target: string;
  description: string;
  category: 'document' | 'evaluation' | 'system' | 'vendor' | 'approval';
}

const mockAuditEvents: AuditEvent[] = [
  {
    id: "A1",
    timestamp: "2023-11-12T14:32:10Z",
    user: {
      name: "Alice Johnson",
      role: "Procurement Manager"
    },
    action: "Upload",
    target: "IT Infrastructure RFP",
    description: "Uploaded new RFP document and initiated AI processing",
    category: "document"
  },
  {
    id: "A2",
    timestamp: "2023-11-12T15:10:22Z",
    user: {
      name: "System AI",
      role: "Automated Process"
    },
    action: "Extract",
    target: "IT Infrastructure RFP",
    description: "Automatically extracted 15 requirements from RFP document",
    category: "system"
  },
  {
    id: "A3",
    timestamp: "2023-11-12T16:05:45Z",
    user: {
      name: "Bob Smith",
      role: "Evaluator"
    },
    action: "Score",
    target: "Tech Solutions Inc. Proposal",
    description: "Submitted evaluation scores for technical criteria",
    category: "evaluation"
  },
  {
    id: "A4",
    timestamp: "2023-11-12T16:30:18Z",
    user: {
      name: "System AI",
      role: "Automated Process"
    },
    action: "Analyze",
    target: "Vendor Comparison",
    description: "Generated weighted comparison matrix for 4 vendors",
    category: "system"
  },
  {
    id: "A5",
    timestamp: "2023-11-12T17:15:40Z",
    user: {
      name: "Carol Williams",
      role: "Procurement Officer"
    },
    action: "Update",
    target: "Digital Enterprises",
    description: "Updated vendor compliance status to 'Partial'",
    category: "vendor"
  },
  {
    id: "A6",
    timestamp: "2023-11-12T18:22:05Z",
    user: {
      name: "David Brown",
      role: "Department Head"
    },
    action: "Approve",
    target: "Vendor Selection",
    description: "Approved Tech Solutions Inc. as selected vendor",
    category: "approval"
  }
];

const getCategoryBadgeStyle = (category: string) => {
  switch (category) {
    case 'document':
      return 'bg-blue-100 text-blue-800';
    case 'evaluation':
      return 'bg-purple-100 text-purple-800';
    case 'system':
      return 'bg-gray-100 text-gray-800';
    case 'vendor':
      return 'bg-green-100 text-green-800';
    case 'approval':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

export function AuditTrailViewer() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <CardDescription>
          Complete record of procurement activities and decisions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search audit events..."
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAuditEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center text-xs">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {formatDate(event.timestamp).split(',')[0]}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(event.timestamp).split(',')[1].trim()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{event.user.name}</div>
                      <div className="text-xs text-muted-foreground">{event.user.role}</div>
                    </TableCell>
                    <TableCell>{event.action}</TableCell>
                    <TableCell className="font-medium">{event.target}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                      {event.description}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(getCategoryBadgeStyle(event.category))}>
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="text-muted-foreground">
              Showing {mockAuditEvents.length} of {mockAuditEvents.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <Badge className="bg-procurement-100 text-procurement-800">
                  <Info className="h-3 w-3 mr-1" />
                  Immutable Record
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
