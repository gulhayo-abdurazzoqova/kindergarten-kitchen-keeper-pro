
import React, { useState } from 'react';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import { 
  Bell, 
  ChartBar,
  List,
  User,
  Utensils,
  Settings,
  Book,
  LogOut
} from 'lucide-react';
import { useKitchenStore } from '@/store';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const Dashboard: React.FC = () => {
  const { currentUser, alerts, logout } = useKitchenStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadAlerts = alerts.filter(alert => !alert.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager' || isAdmin;

  const navItems = [
    {
      name: "Dashboard",
      icon: <ChartBar className="h-5 w-5" />,
      path: "/",
      allowed: true
    },
    {
      name: "Ingredients",
      icon: <List className="h-5 w-5" />,
      path: "/ingredients",
      allowed: isManager
    },
    {
      name: "Meals",
      icon: <Utensils className="h-5 w-5" />,
      path: "/meals",
      allowed: isManager
    },
    {
      name: "Serving",
      icon: <Book className="h-5 w-5" />,
      path: "/serving",
      allowed: true
    },
    {
      name: "Reports",
      icon: <ChartBar className="h-5 w-5" />,
      path: "/reports",
      allowed: isManager
    },
    {
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/settings",
      allowed: isAdmin
    }
  ].filter(item => item.allowed);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile header */}
      <div className="md:hidden bg-kitchen-green text-white p-4 flex items-center justify-between">
        <button 
          className="text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <List className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold">KinderKitchen</h1>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-1">
                <Bell className="h-6 w-6" />
                {unreadAlerts > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadAlerts}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[250px]">
              {alerts.slice(0, 5).map((alert) => (
                <DropdownMenuItem key={alert.id}>
                  <div className="flex flex-col">
                    <span className="font-semibold">{alert.message}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.date).toLocaleString()}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem>
                <Link to="/alerts" className="w-full text-center hover:underline">
                  View all alerts
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1">
                <User className="h-6 w-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="font-medium">{currentUser?.name}</DropdownMenuItem>
              <DropdownMenuItem className="text-gray-500">Role: {currentUser?.role}</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-50">
          <nav className="flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Sidebar for desktop */}
      <div className="hidden md:flex flex-col w-64 bg-white shadow-lg">
        <div className="p-5">
          <h1 className="text-2xl font-bold text-kitchen-green">KinderKitchen</h1>
          <p className="text-gray-500 text-sm mt-1">Kitchen Management System</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="flex items-center space-x-3 px-6 py-3 hover:bg-gray-100"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-kitchen-green text-white rounded-full h-10 w-10 flex items-center justify-center">
              <span className="font-medium">{currentUser?.name.substring(0, 1)}</span>
            </div>
            <div>
              <p className="font-medium">{currentUser?.name}</p>
              <p className="text-sm text-gray-500 capitalize">{currentUser?.role}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Desktop header */}
        <div className="hidden md:flex items-center justify-between bg-white p-4 shadow">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-1">
                  <Bell className="h-6 w-6" />
                  {unreadAlerts > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadAlerts}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[250px]">
                {alerts.length === 0 ? (
                  <DropdownMenuItem>No alerts</DropdownMenuItem>
                ) : (
                  alerts.slice(0, 5).map((alert) => (
                    <DropdownMenuItem key={alert.id}>
                      <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            alert.type === 'low_stock' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {alert.type === 'low_stock' ? 'Low Stock' : 'Misuse'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(alert.date).toLocaleString()}
                          </span>
                        </div>
                        <span className="font-medium mt-1">{alert.message}</span>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
                {alerts.length > 0 && (
                  <DropdownMenuItem>
                    <Link to="/alerts" className="w-full text-center text-kitchen-blue hover:underline">
                      View all alerts
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
