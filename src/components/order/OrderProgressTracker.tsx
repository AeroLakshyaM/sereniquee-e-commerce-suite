import { CheckCircle, Circle, Package, Truck, Home } from 'lucide-react';

interface OrderProgressProps {
  status: string;
  createdAt: string;
  updatedAt: string;
}

const ORDER_STAGES = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

const STATUS_INDEX: { [key: string]: number } = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
};

export default function OrderProgressTracker({ status, createdAt, updatedAt }: OrderProgressProps) {
  const currentIndex = STATUS_INDEX[status];
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center gap-3 text-red-600">
          <Circle className="h-8 w-8" />
          <div>
            <p className="font-semibold text-lg">Order Cancelled</p>
            <p className="text-sm text-muted-foreground">
              This order was cancelled on {new Date(updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width: `${(currentIndex / (ORDER_STAGES.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Progress Steps */}
          <div className="relative flex justify-between">
            {ORDER_STAGES.map((stage, index) => {
              const Icon = stage.icon;
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div key={stage.key} className="flex flex-col items-center" style={{ width: '25%' }}>
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-primary text-white shadow-lg scale-110'
                        : 'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-4 ring-primary/30' : ''}`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-8 w-8" />
                    ) : (
                      <Icon className="h-8 w-8" />
                    )}
                  </div>
                  <p
                    className={`mt-3 text-sm font-medium text-center ${
                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {stage.label}
                  </p>
                  {isCompleted && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {index === 0
                        ? new Date(createdAt).toLocaleDateString()
                        : new Date(updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {ORDER_STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={stage.key} className="flex items-start gap-4">
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  } ${isCurrent ? 'ring-4 ring-primary/30' : ''}`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                {index < ORDER_STAGES.length - 1 && (
                  <div
                    className={`absolute top-12 left-6 w-0.5 h-8 ${
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 pt-2">
                <p
                  className={`font-medium ${
                    isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {stage.label}
                </p>
                {isCompleted && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {index === 0
                      ? new Date(createdAt).toLocaleDateString()
                      : new Date(updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
