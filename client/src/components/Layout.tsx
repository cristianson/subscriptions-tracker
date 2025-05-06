import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import MobileMenu from "./MobileMenu";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  HomeIcon, 
  CreditCardIcon, 
  CalendarIcon, 
  BellIcon, 
  BarChartIcon, 
  SettingsIcon,
  MenuIcon,
  LogOutIcon,
  UserIcon,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

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
      <aside className="bg-background md:w-64 w-full md:min-h-screen border-r border-border md:flex md:flex-col hidden md:block">
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
              <path d="M10 4c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
            </svg>
            <h1 className="text-xl font-bold text-foreground">SubManager</h1>
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
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        
        <div className="border-t border-border p-4">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-foreground truncate">{user?.username || 'Guest'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="w-full flex items-center justify-center"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOutIcon className="mr-2 h-4 w-4" />
              )}
              {logoutMutation.isPending ? 'Logging out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="bg-background p-4 flex justify-between items-center shadow-sm md:hidden">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
            <path d="M10 4c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
          </svg>
          <h1 className="text-xl font-bold text-foreground ml-2">SubManager</h1>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="text-foreground focus:outline-none"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
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
