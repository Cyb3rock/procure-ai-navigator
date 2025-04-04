
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface AddCustomerFormProps {
  onAddCustomer: (customer: {
    name: string;
    dueAmount: number;
    entryDate: string;
    dueDate: string;
    paidDate: null;
    paidAmount: null;
    contactNumber: string;
  }) => void;
}

const customerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  dueAmount: z.number().min(1, { message: "Amount must be greater than 0" }),
  dueDate: z.string().min(1, { message: "Due date is required" }),
  contactNumber: z.string().min(10, { message: "Valid phone number required" }),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ onAddCustomer }) => {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      dueAmount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      contactNumber: '',
    },
  });

  const handleSubmit = (values: CustomerFormValues) => {
    const today = new Date().toISOString().split('T')[0];
    
    onAddCustomer({
      name: values.name,
      dueAmount: values.dueAmount,
      entryDate: today,
      dueDate: values.dueDate,
      paidDate: null,
      paidAmount: null,
      contactNumber: values.contactNumber,
    });
    
    form.reset({
      name: '',
      dueAmount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      contactNumber: '',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dueAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Amount</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  {...field} 
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 123-4567" {...field} />
              </FormControl>
              <FormDescription>
                Include country code, e.g., +1 for US
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          Add Customer
        </Button>
      </form>
    </Form>
  );
};

export default AddCustomerForm;
