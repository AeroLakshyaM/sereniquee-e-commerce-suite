import { useState } from 'react';
import { useCustomOrders } from '@/hooks/useCustomOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CustomOrderInquiry } from '@/types';
import { Loader2, Mail, Phone, Clock, DollarSign, PackageOpen, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function CustomOrdersManager() {
  const { inquiries, isFetchingInquiries, updateInquiryStatus, deleteInquiry } = useCustomOrders();
  const [searchTerm, setSearchTerm] = useState('');

  if (isFetchingInquiries) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filteredInquiries = inquiries?.filter((inq) => 
    inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inq.inquiry_type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'contacted': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'quoted': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'ordered': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom & Bulk Orders</CardTitle>
        <CardDescription>Manage incoming inquiries for bespoke and bulk purchases.</CardDescription>
        <div className="mt-4">
          <Input 
            placeholder="Search by name, email, or type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
             No custom orders found.
          </div>
        ) : (
          <div className="space-y-6">
            {filteredInquiries.map((inquiry) => (
              <div key={inquiry.id} className="border rounded-lg p-6 bg-card hover:bg-accent/5 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-border/50">
                  <div>
                    <h3 className="text-xl font-medium flex items-center gap-2">
                      {inquiry.name}
                      <span className={`text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Submitted on {format(new Date(inquiry.created_at), 'PPP at p')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      disabled={updateInquiryStatus.isPending}
                      value={inquiry.status}
                      onValueChange={(val: CustomOrderInquiry['status']) => 
                        updateInquiryStatus.mutate({ id: inquiry.id, status: val })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="quoted">Quoted</SelectItem>
                        <SelectItem value="ordered">Ordered</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this custom order request?")) {
                          deleteInquiry.mutate(inquiry.id);
                        }
                      }}
                      disabled={deleteInquiry.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Contact Details</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${inquiry.email}`} className="hover:underline">{inquiry.email}</a>
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${inquiry.phone}`} className="hover:underline">{inquiry.phone}</a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Request Specs</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <PackageOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{inquiry.inquiry_type}</span> Type
                      </div>
                      {inquiry.quantity_estimate && (
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          Est. Qty: <span className="font-semibold">{inquiry.quantity_estimate}</span>
                        </div>
                      )}
                      {inquiry.budget_range && (
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          Budget: <span className="font-semibold">{inquiry.budget_range}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/30 p-4 rounded-md">
                  <p className="text-sm font-semibold mb-2">Description / Notes:</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{inquiry.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}