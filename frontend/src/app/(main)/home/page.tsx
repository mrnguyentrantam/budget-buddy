'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApi } from "@/utils/api";
interface Budget {
  id: number;
  amount: number;
  total_transactions: number;
  remaining_amount: number;
  category: {
    name: string;
  };
}

interface Transaction {
  id: number;
  amount: number;
  created_at: string;
  description: string;
  category: {
    name: string;
  };
}

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Home() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [budgetsData, transactionsData] = await Promise.all([
        fetchApi('/budgets'),
        fetchApi('/transactions?limit=5')
      ]);
      
      setBudgets(budgetsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate totals only when budgets are available
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.total_transactions, 0);
  const totalRemaining = totalBudget - totalSpent;

  if (isLoading) {
    return (
      <div className="p-4">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatVND(totalBudget)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatVND(totalSpent)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatVND(totalRemaining)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgets.map((budget: Budget) => {
              const percentage = (budget.total_transactions / budget.amount) * 100;
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{budget.category.name}</span>
                    <span>{formatVND(budget.total_transactions)} / {formatVND(budget.amount)}</span>
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
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction: Transaction) => (
              <div key={transaction.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {transaction.category.name} • {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-medium">{formatVND(transaction.amount)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
