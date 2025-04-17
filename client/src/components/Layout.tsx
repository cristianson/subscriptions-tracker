import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import MobileMenu from "./MobileMenu";
import { 
  HomeIcon, 
  CreditCardIcon, 
  CalendarIcon, 
  BellIcon, 
  BarChartIcon, 
  SettingsIcon,
  MenuIcon
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: HomeIcon },
    { href: "/subscriptions", label: "Subscriptions", icon: CreditCardIcon },
    { href: "/calendar", label: "Calendar", icon: CalendarIcon },
    { href: "/notifications", label: "Notifications", icon: BellIcon },
    { href: "/reports", label: "Reports", icon: BarChartIcon },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-white md:w-64 w-full md:min-h-screen border-r border-gray-200 md:flex md:flex-col hidden md:block">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
              <path d="M10 4c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
            </svg>
            <h1 className="text-xl font-bold text-primary">SubManager</h1>
          </div>
        </div>
        
        <nav className="mt-6 flex-1">
          <div className="px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "sidebar-item flex items-center px-4 py-3 text-sm font-medium rounded-md",
                    isActive 
                      ? "active bg-primary/10 border-l-3 border-primary text-primary" 
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-gray-500")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              <span className="text-sm font-medium">AM</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Alex Morgan</p>
              <p className="text-xs text-gray-500">alex@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="bg-white p-4 flex justify-between items-center shadow-sm md:hidden">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
            <path d="M10 4c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
          </svg>
          <h1 className="text-xl font-bold text-primary ml-2">SubManager</h1>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(true)} 
          className="text-gray-600 focus:outline-none"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
        activePath={location}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
        {children}
      </main>
    </div>
  );
}
