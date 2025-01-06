'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { fetchApi } from '@/utils/api';

interface Category {
  id: number;
  name: string;
  icon: string;
}

const AddTransactionPage: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: '',
    category_id: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchApi('/categories');
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await fetchApi('/transactions', {
        method: 'POST',
        body: formData,
      });

      router.push('/transactions');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Add Transaction</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              ₫
            </span>
            <input
              type="number"
              step="1000"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="block w-full pl-8 pr-4 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="0"
            />
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setFormData({ ...formData, category_id: category.id})}
                className={`p-4 border rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors ${
                  formData.category_id === category.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm text-gray-600">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description Input (formerly Note) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="block w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            rows={3}
            placeholder="Add a description..."
          />
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !formData.amount || !formData.category_id}
          className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
};

export default AddTransactionPage; 