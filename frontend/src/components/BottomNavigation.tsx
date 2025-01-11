'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  HomeIcon, 
  ArrowTrendingUpIcon, 
  PlusCircleIcon, 
  ChartPieIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  ArrowTrendingUpIcon as ArrowTrendingUpIconSolid, 
  PlusCircleIcon as PlusCircleIconSolid, 
  ChartPieIcon as ChartPieIconSolid, 
  UserIcon as UserIconSolid 
} from '@heroicons/react/24/solid';

const navigation = [
  { name: 'Trang Chủ', href: '/home', icon: HomeIcon, activeIcon: HomeIconSolid },
  { name: 'Giao Dịch', href: '/transactions', icon: ArrowTrendingUpIcon, activeIcon: ArrowTrendingUpIconSolid },
  { name: 'Thêm', href: '/add', icon: PlusCircleIcon, activeIcon: PlusCircleIconSolid },
  { name: 'Ngân Sách', href: '/budget', icon: ChartPieIcon, activeIcon: ChartPieIconSolid },
  { name: 'Tài Khoản', href: '/account', icon: UserIcon, activeIcon: UserIconSolid },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = isActive ? item.activeIcon : item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 min-w-[4rem] ${
                  isActive 
                    ? 'text-blue-500' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`h-6 w-6 ${
                  item.name === 'Add' ? 'h-8 w-8 -mt-4 text-blue-500' : ''
                }`} />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
} 