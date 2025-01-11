"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApi } from "@/utils/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Budget {
  id: number;
  amount: number;
  total_transactions: number;
  remaining_amount: number;
  category: {
    name: string;
    icon: string;
  };
}

interface Transaction {
  id: number;
  amount: number;
  created_at: string;
  description: string;
  category: {
    name: string;
    icon: string;
  };
}

const formatVND = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getCurrentMonthYear = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
};

const formatMonthYear = (value: string) => {
  const [year, month] = value.split("-");
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );
};

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    const [year, month] = selectedMonth.split("-");
    try {
      setIsLoading(true);
      const [budgetsData, transactionsData] = await Promise.all([
        fetchApi(`/budgets?month=${month}&year=${year}`),
        fetchApi(`/transactions?month=${month}&year=${year}`),
      ]);

      setBudgets(budgetsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  // Calculate totals based on transactions instead of budgets
  const totalSpent = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  if (isLoading) {
    return (
      <div className="p-4">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Month Selector */}
      <div className="w-[200px]">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn tháng" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const value = `${date.getFullYear()}-${String(
                date.getMonth() + 1
              ).padStart(2, "0")}`;
              return (
                <SelectItem key={value} value={value}>
                  {formatMonthYear(value)}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Chi Tiêu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatVND(totalSpent)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tổng Quan Ngân Sách</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgets.map((budget: Budget) => {
              const percentage =
                (budget.total_transactions / budget.amount) * 100;
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{budget.category.name}</span>
                      <span className="text-xl">{budget.category.icon}</span>
                    </div>
                    <span>
                      {formatVND(budget.total_transactions)} /{" "}
                      {formatVND(budget.amount)}
                    </span>
                  </div>
                  <div className="relative h-2 w-full bg-green-500 rounded">
                    <div
                      className="absolute top-0 left-0 h-full bg-red-500 rounded"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Giao Dịch Gần Đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction: Transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    <span className="text-xl mr-1">{transaction.category.icon}</span>
                    {transaction.category.name} •{" "}
                    {new Date(transaction.created_at).toLocaleDateString('vi-VN', {
                      day: 'numeric',
                      month: 'numeric',
                      year: 'numeric',
                      weekday: 'long'
                    })}
                  </p>
                </div>
                <span className="font-medium">
                  {formatVND(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
