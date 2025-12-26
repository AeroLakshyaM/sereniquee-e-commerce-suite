import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  user_id: string;
}

export default function OrderNotifications() {
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastOrderIdRef = useRef<string | null>(null);

  // Initialize audio on mount
  useEffect(() => {
    // Create notification sound (bell chime using Web Audio API)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playNotificationSound = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };

    audioRef.current = { play: playNotificationSound } as any;
  }, []);

  // Subscribe to new orders
  useEffect(() => {
    // Fetch initial orders
    const fetchInitialOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setRecentOrders(data);
        if (data.length > 0) {
          lastOrderIdRef.current = data[0].id;
        }
        // Count pending orders for badge
        const pending = data.filter(o => o.status === 'pending').length;
        setUnreadCount(pending);
      }
    };

    fetchInitialOrders();

    // Set up real-time subscription
    const channel = supabase
      .channel('orders-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new as Order;
          
          // Play sound
          if (audioRef.current) {
            audioRef.current.play();
          }

          // Show toast notification
          toast({
            title: '🎉 New Order Received!',
            description: `Order #${newOrder.id.slice(0, 8)} - ₹${newOrder.total_amount.toFixed(2)}`,
            duration: 10000,
          });

          // Update recent orders
          setRecentOrders(prev => [newOrder, ...prev.slice(0, 4)]);
          setUnreadCount(prev => prev + 1);
          lastOrderIdRef.current = newOrder.id;

          // Show browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Order!', {
              body: `Order for ₹${newOrder.total_amount.toFixed(2)}`,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const updatedOrder = payload.new as Order;
          setRecentOrders(prev =>
            prev.map(order => (order.id === updatedOrder.id ? updatedOrder : order))
          );
          
          // Recalculate pending count
          const pending = recentOrders.filter(o => o.status === 'pending').length;
          setUnreadCount(pending);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, recentOrders]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => {
          setShowNotifications(!showNotifications);
          if (!showNotifications) markAllAsRead();
        }}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-80 bg-background border shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
            <h3 className="font-semibold">Recent Orders</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowNotifications(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="divide-y">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">
                      Order #{order.id.slice(0, 8)}
                    </span>
                    <Badge
                      variant={order.status === 'pending' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>₹{order.total_amount.toFixed(2)}</span>
                    <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent orders</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
