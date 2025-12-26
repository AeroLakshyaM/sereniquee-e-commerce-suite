import { useState, useMemo } from 'react';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { Calendar as BigCalendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarView.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface OrderEvent extends Event {
  id: string;
  title?: string;
  start: Date;
  end: Date;
  status: string;
  total: number;
  customer: string;
  items: number;
}

const STATUS_COLORS = {
  pending: '#eab308',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export default function CalendarView() {
  const { data: orders, isLoading } = useAdminOrders();
  const [selectedEvent, setSelectedEvent] = useState<OrderEvent | null>(null);

  const events: OrderEvent[] = useMemo(() => {
    if (!orders) return [];

    return orders.map((order) => ({
      id: order.id,
      title: `Order #${order.id.slice(0, 8)} - ${order.user?.full_name || order.user?.email || 'Unknown'}`,
      start: new Date(order.created_at),
      end: new Date(order.created_at),
      status: order.status,
      total: order.total_amount,
      customer: order.user?.full_name || order.user?.email || 'Unknown',
      items: order.order_items.length,
    }));
  }, [orders]);

  const eventStyleGetter = (event: OrderEvent) => {
    const backgroundColor = STATUS_COLORS[event.status as keyof typeof STATUS_COLORS] || '#6b7280';
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.875rem',
      },
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl mb-2">Order Calendar</h2>
        <p className="text-muted-foreground">
          View all orders by date. Click on any order to see details.
        </p>
      </div>

      {/* Legend */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Status Legend:</span>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm capitalize">{status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div style={{ height: '700px' }}>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={(event) => setSelectedEvent(event as OrderEvent)}
              views={['month', 'week', 'day']}
              defaultView="month"
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Order Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm">{selectedEvent.id.slice(0, 8)}...</p>
                </div>
                <Badge
                  style={{
                    backgroundColor:
                      STATUS_COLORS[selectedEvent.status as keyof typeof STATUS_COLORS],
                    color: 'white',
                  }}
                >
                  {selectedEvent.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Customer</p>
                  <p className="font-medium">{selectedEvent.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="font-medium">
                    {format(selectedEvent.start as Date, 'PPP')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Items</p>
                  <p className="font-medium">{selectedEvent.items}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total</p>
                  <p className="font-medium">₹{selectedEvent.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
