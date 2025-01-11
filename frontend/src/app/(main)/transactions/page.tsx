'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { TransactionList } from '../../../components/TransactionList';
import { TransactionFilters } from '../../../components/TransactionFilters';

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Transaction {
  id: number;
  amount: number;
  category: Category;
  description?: string;
  created_at: string;
}

const TransactionsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchApi('/categories');
        setCategories(data);
      } catch (err) {
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        let url = `/transactions?month=${selectedMonth}&year=${selectedYear}`;
        if (selectedCategory) {
          url += `&category_id=${selectedCategory}`;
        }
        const data = await fetchApi(url);
        setTransactions(data);
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [selectedCategory, selectedMonth, selectedYear]);

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giao dịch này không?')) {
      return;
    }

    try {
      await fetchApi(`/transactions/${id}`, {
        method: 'DELETE',
      });
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err) {
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/transactions/${id}`);
  };

  if (isLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Giao Dịch</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {decodeURIComponent(error)}
        </div>
      )}
      <TransactionFilters
        categories={categories}
        selectedCategory={selectedCategory}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onCategoryChange={setSelectedCategory}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />
      <TransactionList 
        transactions={transactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default TransactionsPage; 