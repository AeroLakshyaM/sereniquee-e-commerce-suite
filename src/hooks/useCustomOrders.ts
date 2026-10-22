import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CustomOrderInquiry } from "@/types";

export const useCustomOrders = () => {
  const queryClient = useQueryClient();
  const submitInquiry = useMutation({
    mutationFn: async (inquiryData: Omit<CustomOrderInquiry, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
      const response = await fetch('/api/custom-order-inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(inquiryData) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Inquiry could not be submitted.');
      return result;
    },
    onSuccess: () => { toast.success("Inquiry submitted successfully! We will contact you soon."); queryClient.invalidateQueries({ queryKey: ["custom-orders"] }); },
    onError: (error) => { console.error("Error submitting inquiry:", error); toast.error(error instanceof Error ? error.message : "Failed to submit inquiry."); },
  });
  const { data: inquiries, isLoading: isFetchingInquiries } = useQuery({
    queryKey: ["custom-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from('custom_order_inquiries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as CustomOrderInquiry[];
    },
  });
  const updateInquiryStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CustomOrderInquiry['status'] }) => {
      const { data, error } = await supabase.from('custom_order_inquiries').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { toast.success("Inquiry status updated."); queryClient.invalidateQueries({ queryKey: ["custom-orders"] }); },
    onError: (error) => { console.error("Error updating inquiry:", error); toast.error("Failed to update inquiry status."); },
  });
  const deleteInquiry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_order_inquiries').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => { toast.success("Inquiry deleted successfully."); queryClient.invalidateQueries({ queryKey: ["custom-orders"] }); },
    onError: (error) => { console.error("Error deleting inquiry:", error); toast.error("Failed to delete inquiry."); },
  });
  return { submitInquiry, updateInquiryStatus, deleteInquiry, inquiries, isFetchingInquiries };
};
