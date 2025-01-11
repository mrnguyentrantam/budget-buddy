import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

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

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const TransactionList = ({ transactions, onEdit, onDelete }: TransactionListProps) => {
  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.created_at.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        Không tìm thấy giao dịch nào
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date} className="space-y-2">
          <div className="sticky top-0 bg-gray-50 p-2 rounded-lg">
            <h2 className="font-semibold text-gray-600">
              {format(parseISO(date), 'EEEE, dd MMMM yyyy', { locale: vi })}
            </h2>
            <div className="text-sm text-gray-500">
              {groupedTransactions[date].length} giao dịch
            </div>
          </div>

          <div className="space-y-2">
            {groupedTransactions[date]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {transaction.category.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.category.name}
                      </div>
                      {transaction.description && (
                        <div className="text-sm text-gray-500">{transaction.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-lg font-semibold">
                      {Math.round(Number(transaction.amount)).toLocaleString('vi-VN')} ₫
                    </div>
                    <button
                      onClick={() => onEdit(transaction.id)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}; 