
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddCustomerFormProps {
  onAddCustomer: (customer: {
    name: string;
    dueAmount: number;
    entryDate: string;
    dueDate: string;
    paidDate: null;
    paidAmount: null;
    contactNumber: string;
    preferredLanguage?: string;
  }) => void;
  languages: string[];
}

const customerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  dueAmount: z.number().min(1, { message: "Amount must be greater than 0" }),
  dueDate: z.string().min(1, { message: "Due date is required" }),
  contactNumber: z.string().min(10, { message: "Valid phone number required" }),
  preferredLanguage: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ onAddCustomer, languages }) => {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      dueAmount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      contactNumber: '',
      preferredLanguage: languages[0],
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
      preferredLanguage: values.preferredLanguage,
    });
    
    form.reset({
      name: '',
      dueAmount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      contactNumber: '',
      preferredLanguage: languages[0],
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

        <FormField
          control={form.control}
          name="preferredLanguage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Language</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language.charAt(0).toUpperCase() + language.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
