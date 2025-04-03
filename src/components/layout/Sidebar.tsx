
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  FileCheck, 
  ShoppingCart, 
  Settings,
  ClipboardList,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon, title, isActive = false }) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        isActive
          ? "bg-procurement-50 text-procurement-900 font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {icon}
      {title}
    </Link>
  );
};

const Sidebar = () => {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-white p-6">
      <div className="space-y-4">
        <div className="py-2">
          <h2 className="text-lg font-semibold tracking-tight mb-1">Navigation</h2>
          <div className="space-y-1">
            <SidebarLink 
              href="/" 
              icon={<LayoutDashboard className="h-4 w-4" />} 
              title="Dashboard" 
              isActive={true}
            />
            <SidebarLink 
              href="/rfps" 
              icon={<FileText className="h-4 w-4" />} 
              title="RFPs"
            />
            <SidebarLink 
              href="/vendors" 
              icon={<Users className="h-4 w-4" />} 
              title="Vendors"
            />
            <SidebarLink 
              href="/evaluations" 
              icon={<ClipboardList className="h-4 w-4" />} 
              title="Evaluations"
            />
            <SidebarLink 
              href="/analytics" 
              icon={<BarChart3 className="h-4 w-4" />} 
              title="Analytics"
            />
          </div>
        </div>
        
        <div className="py-2">
          <h2 className="text-lg font-semibold tracking-tight mb-1">Procurement</h2>
          <div className="space-y-1">
            <SidebarLink 
              href="/contracts" 
              icon={<FileCheck className="h-4 w-4" />} 
              title="Contracts"
            />
            <SidebarLink 
              href="/purchase-orders" 
              icon={<ShoppingCart className="h-4 w-4" />} 
              title="Purchase Orders"
            />
          </div>
        </div>
        
        <div className="py-2">
          <h2 className="text-lg font-semibold tracking-tight mb-1">System</h2>
          <div className="space-y-1">
            <SidebarLink 
              href="/settings" 
              icon={<Settings className="h-4 w-4" />} 
              title="Settings"
            />
            <SidebarLink 
              href="/documentation" 
              icon={<BookOpen className="h-4 w-4" />} 
              title="Documentation"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
