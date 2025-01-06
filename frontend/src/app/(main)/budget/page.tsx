'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { AddBudgetForm } from '@/components/AddBudgetForm';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Budget {
  id: number;
  amount: number;
  category_id: number;
  start_date: string;
  end_date: string;
  total_transactions: number;
  remaining_amount: number;
  category: {
    id: number;
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

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await fetchApi('/budgets', {
        method: 'GET',
      });
      setBudgets(response);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetchApi('/categories', {
        method: 'GET',
      });
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleBudgetAdded = () => {
    fetchBudgets();
    setIsModalOpen(false);
    setSelectedBudget(null);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedBudget(null);
    }
  };

  const handleDeleteBudget = async (budget: Budget) => {
    try {
      await fetchApi(`/budgets/${budget.id}`, {
        method: 'DELETE',
      });
      fetchBudgets();
      setBudgetToDelete(null);
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, budget: Budget) => {
    e.stopPropagation();
    setBudgetToDelete(budget);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
          <DialogTrigger asChild>
            <Button>Add Budget</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedBudget ? 'Edit Budget' : 'Add New Budget'}</DialogTitle>
            </DialogHeader>
            <AddBudgetForm 
              categories={categories} 
              onBudgetAdded={handleBudgetAdded}
              budgetToEdit={selectedBudget}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Budget List */}
      <div className="space-y-4">
        {budgets.map((budget) => {
          const percentage = (budget.total_transactions / budget.amount) * 100;
          
          return (
            <div
              key={budget.id}
              className="p-4 bg-white rounded-lg shadow cursor-pointer"
              onClick={() => handleEditBudget(budget)}
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-medium">{budget.category.name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => handleDeleteClick(e, budget)}
                >
                  Delete
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="relative h-2 w-full bg-green-500 rounded">
                  <div 
                    className="absolute top-0 left-0 h-full bg-red-500 rounded" 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-gray-600">Spent: </span>
                    <span className="font-medium text-red-600">{formatVND(budget.total_transactions)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Budget: </span>
                    <span className="font-medium text-green-600">{formatVND(budget.amount)}</span>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Remaining: </span>
                  <span className={`font-medium ${budget.remaining_amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatVND(budget.remaining_amount)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!budgetToDelete} onOpenChange={(open) => !open && setBudgetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the budget for {budgetToDelete?.category.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => budgetToDelete && handleDeleteBudget(budgetToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update the floating action button dialog */}
      <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
        <DialogTrigger asChild>
          <Button className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0">
            +
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBudget ? 'Edit Budget' : 'Add New Budget'}</DialogTitle>
          </DialogHeader>
          <AddBudgetForm 
            categories={categories} 
            onBudgetAdded={handleBudgetAdded}
            budgetToEdit={selectedBudget}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 