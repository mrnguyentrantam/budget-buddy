import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersIcon, FolderIcon, BarChart3Icon } from "lucide-react";

export default function AdminPage() {
  const adminLinks = [
    {
      title: "User Management",
      description: "Manage user accounts, permissions, and roles",
      href: "/admin/users",
      icon: UsersIcon,
      color: "text-blue-500"
    },
    {
      title: "Categories",
      description: "Manage transaction categories and budgets",
      href: "/admin/categories",
      icon: FolderIcon,
      color: "text-green-500"
    },
    {
      title: "Statistics",
      description: "View system statistics and analytics",
      href: "/admin/stats",
      icon: BarChart3Icon,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${link.color} bg-opacity-10`}>
                    <link.icon className={`w-6 h-6 ${link.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{link.title}</CardTitle>
                    <CardDescription className="mt-1.5">
                      {link.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  Click to manage →
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Quick Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <CardDescription className="text-2xl font-bold">
                0
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Categories
              </CardTitle>
              <CardDescription className="text-2xl font-bold">
                0
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Transactions
              </CardTitle>
              <CardDescription className="text-2xl font-bold">
                0
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
} 