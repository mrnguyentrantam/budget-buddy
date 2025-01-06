'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchApi } from '@/utils/api';

interface AddBudgetFormProps {
  categories: Array<{ id: number; name: string }>;
  onBudgetAdded: () => void;
  budgetToEdit: Budget | null;
}

export function AddBudgetForm({ categories, onBudgetAdded, budgetToEdit }: AddBudgetFormProps) {
  const [selectedCategory, setSelectedCategory] = useState(budgetToEdit?.category_id?.toString() || '');
  const [amount, setAmount] = useState(budgetToEdit?.amount?.toString() || '');
  const [startDate, setStartDate] = useState(budgetToEdit?.start_date || '');
  const [endDate, setEndDate] = useState(budgetToEdit?.end_date || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/budgets', {
        method: 'POST',
        body: {
          amount: parseFloat(amount),
          category_id: parseInt(selectedCategory),
          start_date: startDate,
          end_date: endDate,
        },
      });
      setAmount('');
      setSelectedCategory('');
      setStartDate('');
      setEndDate('');
      onBudgetAdded();
    } catch (error) {
      console.error('Error creating budget:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Start Date</label>
        <input
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="block w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">End Date</label>
        <input
          type="date"
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="block w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          ₫
        </span>
        <input
          type="number"
          step="1000"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="block w-full pl-8 pr-4 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
          placeholder="0"
        />
      </div>

      <Button type="submit" className="w-full">
        Add Budget
      </Button>
    </form>
  );
} 