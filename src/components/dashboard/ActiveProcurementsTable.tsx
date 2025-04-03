
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Procurement {
  id: string;
  title: string;
  category: string;
  status: 'draft' | 'active' | 'evaluation' | 'awarded' | 'closed';
  date: string;
  budget: string;
  progress: number;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  active: "bg-blue-100 text-blue-800",
  evaluation: "bg-yellow-100 text-yellow-800",
  awarded: "bg-green-100 text-green-800",
  closed: "bg-slate-100 text-slate-800",
};

const mockData: Procurement[] = [
  {
    id: "PRO-2023-001",
    title: "IT Infrastructure Upgrade",
    category: "Information Technology",
    status: "active",
    date: "2023-10-15",
    budget: "$450,000",
    progress: 25,
  },
  {
    id: "PRO-2023-002",
    title: "Office Furniture Procurement",
    category: "Facilities",
    status: "evaluation",
    date: "2023-09-30",
    budget: "$120,000",
    progress: 60,
  },
  {
    id: "PRO-2023-003",
    title: "Marketing Services RFP",
    category: "Marketing",
    status: "awarded",
    date: "2023-08-15",
    budget: "$250,000",
    progress: 85,
  },
  {
    id: "PRO-2023-004",
    title: "Cloud Migration Consulting",
    category: "Information Technology",
    status: "draft",
    date: "2023-10-28",
    budget: "$380,000",
    progress: 10,
  },
  {
    id: "PRO-2023-005",
    title: "Training & Development Programs",
    category: "Human Resources",
    status: "active",
    date: "2023-10-05",
    budget: "$175,000",
    progress: 40,
  },
];

export function ActiveProcurementsTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Procurement</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead className="hidden md:table-cell">Budget</TableHead>
            <TableHead className="hidden md:table-cell">Progress</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockData.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>
                <Badge className={cn(statusColors[item.status])}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">{item.date}</TableCell>
              <TableCell className="hidden md:table-cell">{item.budget}</TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full",
                        item.progress < 30 ? "bg-blue-500" : 
                        item.progress < 70 ? "bg-yellow-500" : "bg-green-500"
                      )}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground w-9">
                    {item.progress}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
