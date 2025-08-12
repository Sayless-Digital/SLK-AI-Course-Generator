
import React, { useEffect, useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useLocation, Link, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  DollarSign,
  UserCog,
  MessageSquare,
  FileText,
  Shield,
  X,
  ArrowLeft,
  CreditCard,
  LogOut,
  Menu,
  FileEdit,
  FileSliders,
  Banknote,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { serverURL } from '@/constants';
import axios from 'axios';
import Logo from '../../res/logo.svg';

const AdminLayout = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper to check active route
  const isActive = (path: string) => location.pathname === path;

  const navigate = useNavigate();
  function redirectHome() {
    navigate("/dashboard");
  }

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        // Check if user is logged in
        const userEmail = sessionStorage.getItem('email');
        const userType = sessionStorage.getItem('type');
        
        if (!userEmail) {
          redirectHome();
          return;
        }

        // Check if user has admin type
        if (userType === 'admin') {
          // User has admin privileges, allow access
          return;
        }

        // Check if user is in admin table
        const postURL = serverURL + `/api/getadmins`;
        const response = await axios.get(postURL);
        const admins = response.data.admins;
        
        const isAdmin = admins.some(admin => admin.email === userEmail);
        
        if (!isAdmin) {
          redirectHome();
          return;
        }

        // User is in admin table, allow access
        sessionStorage.setItem('adminEmail', userEmail);
      } catch (error) {
        console.error('Admin access check error:', error);
        redirectHome();
      }
    }

    checkAdminAccess();
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background to-muted/20">
        {/* Desktop Sidebar */}
        {!isMobile && (
        <Sidebar className="border-r border-border/40">
          <SidebarHeader className="border-b border-border/40 h-12">
            <Link to="/admin" className="flex items-center space-x-2 px-2 h-full">
              <div className="h-8 w-8 rounded-md bg-primary from-primary flex items-center justify-center">
                <img src={Logo} alt="Logo" className='h-5 w-5' />
              </div>
              <span className="font-display text-lg font-bold">Admin Panel</span>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard" isActive={isActive('/admin')}>
                  <Link to="/admin" className={cn(isActive('/admin') && "text-primary")}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Users" isActive={isActive('/admin/users')}>
                  <Link to="/admin/users" className={cn(isActive('/admin/users') && "text-primary")}>
                    <Users />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Courses" isActive={isActive('/admin/courses')}>
                  <Link to="/admin/courses" className={cn(isActive('/admin/courses') && "text-primary")}>
                    <BookOpen />
                    <span>Courses</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Paid Users" isActive={isActive('/admin/paid-users')}>
                  <Link to="/admin/paid-users" className={cn(isActive('/admin/paid-users') && "text-primary")}>
                    <DollarSign />
                    <span>Paid Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Admins" isActive={isActive('/admin/admins')}>
                  <Link to="/admin/admins" className={cn(isActive('/admin/admins') && "text-primary")}>
                    <UserCog />
                    <span>Admins</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Contacts" isActive={isActive('/admin/contacts')}>
                  <Link to="/admin/contacts" className={cn(isActive('/admin/contacts') && "text-primary")}>
                    <MessageSquare />
                    <span>Contacts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Blogs" isActive={isActive('/admin/blogs')}>
                  <Link to="/admin/blogs" className={cn(isActive('/admin/blogs') && "text-primary")}>
                    <FileSliders />
                    <span>Manage Blogs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Create Blog" isActive={isActive('/admin/create-blog')}>
                  <Link to="/admin/create-blog" className={cn(isActive('/admin/create-blog') && "text-primary")}>
                    <FileEdit />
                    <span>Create Blog</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Terms" isActive={isActive('/admin/terms')}>
                  <Link to="/admin/terms" className={cn(isActive('/admin/terms') && "text-primary")}>
                    <FileText />
                    <span>Terms</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Privacy" isActive={isActive('/admin/privacy')}>
                  <Link to="/admin/privacy" className={cn(isActive('/admin/privacy') && "text-primary")}>
                    <Shield />
                    <span>Privacy</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Cancellation" isActive={isActive('/admin/cancellation')}>
                  <Link to="/admin/cancellation" className={cn(isActive('/admin/cancellation') && "text-primary")}>
                    <X />
                    <span>Cancellation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Refund" isActive={isActive('/admin/refund')}>
                  <Link to="/admin/refund" className={cn(isActive('/admin/refund') && "text-primary")}>
                    <ArrowLeft />
                    <span>Refund</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Subscription & Billing" isActive={isActive('/admin/subscription-billing')}>
                  <Link to="/admin/subscription-billing" className={cn(isActive('/admin/subscription-billing') && "text-primary")}>
                    <CreditCard />
                    <span>Subscription & Billing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Bank Transfers" isActive={isActive('/admin/bank-transfers')}>
                  <Link to="/admin/bank-transfers" className={cn(isActive('/admin/bank-transfers') && "text-primary")}>
                    <Banknote />
                    <span>Bank Transfers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-border/40 px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Theme">
                  <div className="flex items-center space-x-2">
                    <ThemeToggle />
                    <span>Toggle Theme</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        )}

        {/* Mobile Sheet */}
        {isMobile && (
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent 
              side="right" 
              className="w-[300px] sm:w-[400px] p-0 bg-background"
            >
              <SheetHeader className="h-12 px-2 border-b border-border/40">
                <SheetTitle className="flex items-center justify-between h-full">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                      <img src={Logo} alt="Logo" className='h-5 w-5' />
                    </div>
                    <span className="font-display font-medium text-lg">Admin Panel</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col h-full">
                <nav className="flex-1 px-2 py-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Link 
                        to="/admin"
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('/admin') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                      
                      <Link 
                        to="/admin/users"
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('/admin/users') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Users className="h-5 w-5" />
                        <span className="font-medium">Users</span>
                      </Link>
                      
                      <Link 
                        to="/admin/courses"
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('/admin/courses') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BookOpen className="h-5 w-5" />
                        <span className="font-medium">Courses</span>
                      </Link>
                      
                      <Link 
                        to="/admin/paid-users"
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('/admin/paid-users') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <DollarSign className="h-5 w-5" />
                        <span className="font-medium">Paid Users</span>
                      </Link>
                      
                      <Link 
                        to="/admin/admins"
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('/admin/admins') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <UserCog className="h-5 w-5" />
                        <span className="font-medium">Admins</span>
                      </Link>
                      
                      <Link 
                        to="/admin/contacts"
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('/admin/contacts') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span className="font-medium">Contacts</span>
                      </Link>
                      
                      <Link 
                        to="/admin/blogs"
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('/admin/blogs') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <FileSliders className="h-5 w-5" />
                        <span className="font-medium">Blogs</span>
                      </Link>
                      
                      <Link 
                        to="/admin/create-blog"
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('/admin/create-blog') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <FileEdit className="h-5 w-5" />
                        <span className="font-medium">Create Blog</span>
                      </Link>
                      
                      <Link 
                        to="/admin/terms"
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('/admin/terms') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <FileText className="h-5 w-5" />
                        <span className="font-medium">Terms</span>
                      </Link>
                      
                      <Link 
                        to="/admin/privacy"
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('/admin/privacy') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Shield className="h-5 w-5" />
                        <span className="font-medium">Privacy</span>
                      </Link>
                      
                      <Link 
                        to="/admin/cancellation"
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('/admin/cancellation') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <X className="h-5 w-5" />
                        <span className="font-medium">Cancellation</span>
                      </Link>
                      
                      <Link 
                        to="/admin/refund"
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('/admin/refund') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Refund</span>
                      </Link>
                      
                      <Link 
                        to="/admin/subscription-billing"
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('/admin/subscription-billing') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <CreditCard className="h-5 w-5" />
                        <span className="font-medium">Subscription & Billing</span>
                      </Link>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border/40">
                      <div className="flex items-center space-x-2">
                        <ThemeToggle />
                        <span className="text-sm text-muted-foreground">Toggle Theme</span>
                      </div>
                    </div>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        )}

        <main className="flex-1 overflow-auto p-2">
          {isMobile && <div className="h-12"></div>}
          {isMobile && (
            <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-2 h-12 flex items-center shadow-sm bg-background/80 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                    <img src={Logo} alt="Logo" className='h-5 w-5' />
                  </div>
                  <span className="font-display font-medium text-base">Admin Panel</span>
                </div>
                <div className="flex items-center space-x-2">
                <ThemeToggle />
                  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                      >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </SheetTrigger>
                  </Sheet>
                </div>
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
