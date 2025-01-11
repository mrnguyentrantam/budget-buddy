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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category">Danh mục</Label>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="amount">Số tiền</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Nhập số tiền"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Ngày bắt đầu</Label>
          <Input
            type="date"
            value={startDate.split('T')[0]}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="endDate">Ngày kết thúc</Label>
          <Input
            type="date"
            value={endDate.split('T')[0]}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting
          ? "Đang lưu..."
          : budgetToEdit
          ? "Cập nhật ngân sách"
          : "Thêm ngân sách"}
      </Button>
    </form>
  );
} 