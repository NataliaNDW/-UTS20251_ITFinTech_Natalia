"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  paymentId?: string;
}

interface DailyData {
  date: string;
  total: number;
  orders: number;
}

interface StatusData {
  name: string;
  value: number;
}

interface ItemData {
  name: string;
  value: number;
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [timeRange, setTimeRange] = useState("7days");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      });
  }, []);

  // Data processing functions
  const processDaily = (days: number) => {
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    return dateRange.map(date => {
      const dayOrders = orders.filter(order => 
        new Date(order.createdAt).toDateString() === date.toDateString()
      );
      return {
        date: format(date, 'dd/MM'),
        total: dayOrders.reduce((sum, order) => sum + order.total, 0),
        orders: dayOrders.length
      };
    });
  };

  const processStatusData = (): StatusData[] => {
    const statusCount: Record<string, number> = orders.reduce((acc: Record<string, number>, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count
    }));
  };

  const processItemsSold = (): ItemData[] => {
    const itemCount: Record<string, number> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        itemCount[item.name] = (itemCount[item.name] || 0) + item.qty;
      });
    });
    return Object.entries(itemCount)
      .map(([name, value]): ItemData => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const calculateTotalRevenue = () => {
    return orders.reduce((sum, order) => {
      if (order.status === 'LUNAS') {
        return sum + order.total;
      }
      return sum;
    }, 0);
  };

  const calculateAverageOrderValue = () => {
    const completedOrders = orders.filter(order => order.status === 'LUNAS');
    if (completedOrders.length === 0) return 0;
    return completedOrders.reduce((sum, order) => sum + order.total, 0) / completedOrders.length;
  };

  const data = {
    daily: processDaily(timeRange === "7days" ? 7 : 30),
    status: processStatusData(),
    topItems: processItemsSold(),
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih Periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 Hari Terakhir</SelectItem>
            <SelectItem value="30days">30 Hari Terakhir</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Chart 1: Daily Revenue */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Pendapatan Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Order Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.status}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {data.status.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Daily Orders Count */}
        <Card>
          <CardHeader>
            <CardTitle>Jumlah Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 4: Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Total Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              Rp {calculateTotalRevenue().toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              Dari pesanan yang sudah lunas
            </p>
          </CardContent>
        </Card>

        {/* Card 6: Average Order Value */}
        <Card>
          <CardHeader>
            <CardTitle>Rata-rata Nilai Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              Rp {Math.round(calculateAverageOrderValue()).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              Per transaksi yang selesai
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
