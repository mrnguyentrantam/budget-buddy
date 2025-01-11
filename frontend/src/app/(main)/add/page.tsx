"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { fetchApi } from "@/utils/api";
import { Switch } from "@headlessui/react";
import { toast } from 'sonner';

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
    amount: "",
    category_id: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
    frequency: "monthly",
    end_date: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchApi("/categories");
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
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
      const loadingToast = toast.loading('Đang thêm giao dịch...');

      await fetchApi("/transactions", {
        method: "POST",
        body: formData,
      });

      const budgetStatus = await fetchApi("/budgets/check", {
        method: "POST",
        body: {
          category_id: formData.category_id,
          date: formData.date,
        },
      });

      toast.dismiss(loadingToast);

      if (budgetStatus.is_exceeded) {
        toast.warning(`Đã vượt quá ngân sách cho ${budgetStatus.categoryName}: ₫${budgetStatus.remaining_amount.toLocaleString()}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push('/transactions');
      } else {
        toast.success('Thêm giao dịch thành công');
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push('/transactions');
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Thêm Giao Dịch</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số Tiền
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
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="block w-full pl-8 pr-4 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="0"
            />
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh Mục
          </label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, category_id: category.id })
                }
                className={`p-4 border rounded-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors ${
                  formData.category_id === category.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm text-gray-600">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô Tả (Không bắt buộc)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="block w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            rows={3}
            placeholder="Thêm mô tả..."
          />
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Recurring Transaction Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Giao Dịch Định Kỳ
          </span>
          <Switch
            checked={formData.isRecurring}
            onChange={(checked) =>
              setFormData({ ...formData, isRecurring: checked })
            }
            className={`${
              formData.isRecurring ? "bg-blue-500" : "bg-gray-200"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
          >
            <span className="sr-only">Bật giao dịch định kỳ</span>
            <span
              className={`${
                formData.isRecurring ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>

        {/* Recurring Transaction Options */}
        {formData.isRecurring && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tần Suất
              </label>
              <select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value })
                }
                className="block w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="daily">Hàng ngày</option>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
                <option value="yearly">Hàng năm</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày Kết Thúc (Không bắt buộc)
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !formData.amount || !formData.category_id}
          className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Đang thêm..." : "Thêm Giao Dịch"}
        </button>
      </form>
    </div>
  );
};

export default AddTransactionPage;
