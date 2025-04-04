import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { PlusCircle, Filter, Download, Trash2, Edit, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { RFP } from '@/types/vendor';

// Mock user for now - in a real app would come from auth context
const mockUser = {
  id: '1',
  name: 'Test Vendor',
  email: 'vendor@example.com',
  role: 'vendor'
};

const RfpsPage = () => {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRfp, setCurrentRfp] = useState<RFP | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    rfpTitle: '',
    description: '',
    amount: '',
    submissionDeadline: '',
    status: 'Draft'
  });
  
  // Load RFPs
  useEffect(() => {
    // In a real app, fetch from API
    fetchRfps();
  }, [page]);
  
  const fetchRfps = async () => {
    setLoading(true);
    
    // In a real app, this would be an API call
    try {
      // Mock data for now
      const mockRfps: RFP[] = [
        {
          id: '1',
          title: 'School Supplies Procurement',
          value: 25000,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          status: 'Draft',
          vendorId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'IT Infrastructure Upgrade',
          value: 75000,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
          status: 'Submitted',
          vendorId: '1',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        {
          id: '3',
          title: 'Municipal Building Renovation',
          value: 150000,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          status: 'Awarded',
          vendorId: '1',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        }
      ];
      
      setRfps(mockRfps);
      setTotalPages(1); // Mock pagination
    } catch (error) {
      console.error('Error fetching RFPs:', error);
      toast({
        title: "Error",
        description: "Failed to load RFPs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
  };
  
  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.rfpTitle || !formData.description || !formData.amount || !formData.submissionDeadline) {
        toast({
          title: "Error",
          description: "Please fill all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // In a real app, this would be an API call
      if (isEditing && currentRfp) {
        // Update existing RFP
        const updatedRfps = rfps.map(rfp => 
          rfp.id === currentRfp.id 
            ? { 
                ...rfp, 
                title: formData.rfpTitle,
                value: parseFloat(formData.amount),
                deadline: formData.submissionDeadline,
                status: formData.status as 'Draft' | 'Submitted' | 'Awarded' | 'Rejected',
                updatedAt: new Date().toISOString()
              } 
            : rfp
        );
        setRfps(updatedRfps);
        toast({
          title: "Success",
          description: "RFP updated successfully",
        });
      } else {
        // Create new RFP
        const newRfp: RFP = {
          id: Date.now().toString(),
          title: formData.rfpTitle,
          value: parseFloat(formData.amount),
          deadline: formData.submissionDeadline,
          status: formData.status as 'Draft' | 'Submitted' | 'Awarded' | 'Rejected',
          vendorId: mockUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setRfps([newRfp, ...rfps]);
        toast({
          title: "Success",
          description: "RFP created successfully",
        });
      }
      
      // Close dialog and reset form
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting RFP:', error);
      toast({
        title: "Error",
        description: "Failed to submit RFP. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleEdit = (rfp: RFP) => {
    setCurrentRfp(rfp);
    setIsEditing(true);
    setFormData({
      rfpTitle: rfp.title,
      description: rfp.title, // In a real app, this would be rfp.description
      amount: rfp.value.toString(),
      submissionDeadline: new Date(rfp.deadline).toISOString().split('T')[0],
      status: rfp.status
    });
    setOpenDialog(true);
  };
  
  const handleDelete = (rfpId: string) => {
    try {
      // In a real app, this would be an API call
      setRfps(rfps.filter(rfp => rfp.id !== rfpId));
      toast({
        title: "Success",
        description: "RFP deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting RFP:', error);
      toast({
        title: "Error",
        description: "Failed to delete RFP. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const resetForm = () => {
    setFormData({
      rfpTitle: '',
      description: '',
      amount: '',
      submissionDeadline: '',
      status: 'Draft'
    });
    setCurrentRfp(null);
    setIsEditing(false);
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'Submitted':
        return <Badge variant="secondary">Submitted</Badge>;
      case 'Awarded':
        return <Badge variant="success">Awarded</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const dueDate = new Date(deadline);
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return 'Overdue';
    if (daysDiff === 0) return 'Due today';
    return `${daysDiff} days`;
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
          <div className="grid gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">RFPs Management</h1>
                <p className="text-muted-foreground">
                  Create, manage, and track Request for Proposals.
                </p>
              </div>
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="md:w-auto"
                    onClick={() => {
                      resetForm();
                      setOpenDialog(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New RFP
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit RFP' : 'Create New RFP'}</DialogTitle>
                    <DialogDescription>
                      {isEditing 
                        ? 'Update the details for this Request for Proposal.' 
                        : 'Fill in the details to create a new Request for Proposal.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="rfpTitle" className="text-right">Title</Label>
                      <Input 
                        id="rfpTitle" 
                        name="rfpTitle"
                        value={formData.rfpTitle}
                        onChange={handleInputChange}
                        className="col-span-3" 
                        placeholder="e.g. School Supplies Procurement"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Description</Label>
                      <Textarea 
                        id="description" 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="col-span-3" 
                        placeholder="Provide a detailed description of the RFP"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">Amount</Label>
                      <Input 
                        id="amount" 
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="col-span-3" 
                        placeholder="e.g. 25000"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="submissionDeadline" className="text-right">Deadline</Label>
                      <Input 
                        id="submissionDeadline" 
                        name="submissionDeadline"
                        type="date"
                        value={formData.submissionDeadline}
                        onChange={handleInputChange}
                        className="col-span-3" 
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">Status</Label>
                      <Select 
                        onValueChange={handleStatusChange} 
                        defaultValue={formData.status}
                        value={formData.status}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Submitted">Submitted</SelectItem>
                          <SelectItem value="Awarded">Awarded</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>{isEditing ? 'Update' : 'Create'}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* RFP Table */}
            <Card>
              <div className="p-4 bg-white border-b flex justify-between items-center">
                <h2 className="font-semibold">Your RFPs</h2>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
              <CardContent className="p-0">
                <Table>
                  <TableCaption>List of your Request for Proposals.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Title</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading RFPs...
                        </TableCell>
                      </TableRow>
                    ) : rfps.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No RFPs found. Create your first RFP using the button above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      rfps.map((rfp) => (
                        <TableRow key={rfp.id}>
                          <TableCell className="font-medium">{rfp.title}</TableCell>
                          <TableCell className="text-right">${rfp.value.toLocaleString()}</TableCell>
                          <TableCell>{new Date(rfp.deadline).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {getDaysRemaining(rfp.deadline)}
                          </TableCell>
                          <TableCell>{getStatusBadge(rfp.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(rfp)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit RFP</p>
                                  </TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(rfp.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete RFP</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              
              {/* Pagination */}
              <div className="p-4 border-t">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) setPage(page - 1);
                        }}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          href="#" 
                          isActive={pageNum === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(pageNum);
                          }}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < totalPages) setPage(page + 1);
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RfpsPage;
