import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  X as CloseIcon, 
  LogOut as LogOutIcon, 
  Loader2,
  User as UserIcon 
} from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  activePath: string;
}

export default function MobileMenu({ isOpen, onClose, navItems, activePath }: MobileMenuProps) {
  const { user, logoutMutation } = useAuth();
  
  if (!isOpen) return null;

  return (
    <div className="bg-white fixed inset-0 z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
            <path d="M10 4c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
          </svg>
          <h1 className="text-xl font-bold text-primary ml-2">SubManager</h1>
        </div>
        <button onClick={onClose} className="text-gray-600 focus:outline-none">
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>
      
      <nav className="mt-6 flex-1">
        <div className="px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activePath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
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
        <div className="flex flex-col space-y-3">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-700 truncate">{user?.username || 'Guest'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="w-full flex items-center justify-center"
            onClick={() => {
              logoutMutation.mutate();
              onClose();
            }}
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
    </div>
  );
}
