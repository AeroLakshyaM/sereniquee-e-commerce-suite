import { useState } from "react";
import { useCustomOrders } from "@/hooks/useCustomOrders";
import { SeoHelmet } from "@/components/layout/SeoHelmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomOrderInquiry } from "@/types";

export default function CustomOrders() {
  const { submitInquiry } = useCustomOrders();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiry_type: "custom" as CustomOrderInquiry["inquiry_type"],
    description: "",
    quantity_estimate: "",
    budget_range: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitInquiry.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      inquiry_type: formData.inquiry_type,
      description: formData.description,
      quantity_estimate: formData.quantity_estimate ? parseInt(formData.quantity_estimate) : undefined,
      budget_range: formData.budget_range,
    });
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      inquiry_type: "custom",
      description: "",
      quantity_estimate: "",
      budget_range: "",
    });
  };

  return (
    <div className="container-luxury py-16 md:py-24 max-w-4xl mx-auto">
      <SeoHelmet 
        title="Custom & Bulk Orders" 
        description="Request bespoke, custom, or bulk candles for weddings, events, or wholesale." 
      />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">Custom & Bulk Orders</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Need a specific fragrance, personalized labeling, or a large batch for a special event? 
          Fill out the inquiry form below, and we'll work with you to create something extraordinary.
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Full Name *</label>
              <Input 
                id="name" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email Address *</label>
              <Input 
                id="email" 
                type="email" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="jane@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
              <Input 
                id="phone" 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">Inquiry Type *</label>
              <Select 
                value={formData.inquiry_type} 
                onValueChange={(val: any) => setFormData({...formData, inquiry_type: val})}
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Design / Scent</SelectItem>
                  <SelectItem value="bulk">Bulk Event Order (Wedding, Corporate)</SelectItem>
                  <SelectItem value="wholesale">Wholesale Pricing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Project Description *</label>
            <Textarea 
              id="description" 
              required 
              rows={5}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Tell us about your vision, preferred scents, container types, or any specific requirements..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="qty" className="text-sm font-medium">Estimated Quantity</label>
              <Input 
                id="qty" 
                type="number" 
                min="1"
                value={formData.quantity_estimate}
                onChange={e => setFormData({...formData, quantity_estimate: e.target.value})}
                placeholder="e.g. 50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="budget" className="text-sm font-medium">Budget Range</label>
              <Input 
                id="budget" 
                value={formData.budget_range}
                onChange={e => setFormData({...formData, budget_range: e.target.value})}
                placeholder="e.g. $500 - $1000"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-6 text-lg" 
            disabled={submitInquiry.isPending}
          >
            {submitInquiry.isPending ? "Submitting..." : "Submit Inquiry"}
          </Button>
        </form>
      </div>
    </div>
  );
}
