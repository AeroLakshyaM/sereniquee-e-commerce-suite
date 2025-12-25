import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingCart, Users, Package } from 'lucide-react';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) return null;

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Orders',
      value: analytics.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Users',
      value: analytics.totalUsers.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Products',
      value: analytics.totalProducts.toString(),
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Revenue Trends (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.ordersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Top 5 Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="font-serif text-xl">User Growth (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                name="Total Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Products Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Product Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Product Name</th>
                  <th className="text-left p-4 text-sm font-medium">Units Sold</th>
                  <th className="text-left p-4 text-sm font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topProducts.map((product, index) => (
                  <tr key={index} className="border-t border-border">
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4 text-muted-foreground">{product.sales}</td>
                    <td className="p-4 font-medium">${product.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
