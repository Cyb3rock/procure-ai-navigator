
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Customer {
  id: string;
  name: string;
  dueAmount: number;
  entryDate: string;
  dueDate: string;
  paidDate: string | null;
  paidAmount: number | null;
  contactNumber: string;
  preferredLanguage?: string;
}

interface CustomersListProps {
  customers: Customer[];
  onRecordPayment: (id: string, paidAmount: number) => void;
}

const CustomersList: React.FC<CustomersListProps> = ({ customers, onRecordPayment }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenPaymentDialog = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setPaymentAmount(customer.dueAmount);
    setDialogOpen(true);
  };

  const handleSubmitPayment = () => {
    if (selectedCustomerId) {
      onRecordPayment(selectedCustomerId, paymentAmount);
      setDialogOpen(false);
      setSelectedCustomerId(null);
    }
  };

  // Calculate days remaining until due date
  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Sort customers by due date (closest first)
  const sortedCustomers = [...customers].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="space-y-4">
      {customers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No customers with active credit. Add a customer to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Due Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCustomers.map((customer) => {
                const daysRemaining = calculateDaysRemaining(customer.dueDate);
                let statusClass = "";
                let statusText = `${daysRemaining} days left`;
                
                if (customer.paidDate) {
                  statusClass = "text-green-600";
                  statusText = "Paid";
                } else if (daysRemaining < 0) {
                  statusClass = "text-red-600 font-medium";
                  statusText = `Overdue by ${Math.abs(daysRemaining)} days`;
                } else if (daysRemaining <= 3) {
                  statusClass = "text-amber-600";
                }
                
                return (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>${customer.dueAmount.toFixed(2)}</TableCell>
                    <TableCell>{customer.dueDate}</TableCell>
                    <TableCell className={statusClass}>{statusText}</TableCell>
                    <TableCell className="text-right">
                      {!customer.paidDate ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenPaymentDialog(customer)}
                        >
                          Record Payment
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Paid on {customer.paidDate}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Enter the amount received from the customer
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment" className="text-right">
                Amount
              </Label>
              <Input
                id="payment"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersList;
