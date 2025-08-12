// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
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
  SidebarGroup,
  SidebarGroupContent,
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
import { Button } from '@/components/ui/button';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, User, DollarSign, LogOut, Sparkles, Menu, Settings2Icon, X, Moon, Sun } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { appName, serverURL, websiteURL } from '@/constants';
import Logo from '../../res/logo.svg';
import { DownloadIcon } from '@radix-ui/react-icons';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';

const DashboardLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  // Helper to check active route
  const isActive = (path: string) => location.pathname === path;
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('uid') === null) {
      window.location.href = websiteURL + '/';
    }
    
    // Get user name and email
    const name = sessionStorage.getItem('mName');
    const email = sessionStorage.getItem('email');
    if (name) {
      setUserName(name);
    }
    if (email) {
      setUserEmail(email);
    }
    
    async function checkAdminStatus() {
      try {
        const userEmail = sessionStorage.getItem('email');
        const userType = sessionStorage.getItem('type');
        
        // Check if user has admin type
        if (userType === 'admin') {
          setAdmin(true);
          return;
        }

        // Check if user is in admin table
        const postURL = serverURL + `/api/getadmins`;
        const response = await axios.get(postURL);
        const admins = response.data.admins;
        
        const isAdmin = admins.some(admin => admin.email === userEmail);
        
        if (isAdmin) {
          setAdmin(true);
          sessionStorage.setItem('adminEmail', userEmail);
        }
      } catch (error) {
        console.error('Admin status check error:', error);
      }
    }

    checkAdminStatus();
  }, []);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    });
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return
    installPrompt.prompt()
    installPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        console.log('User accepted install')
      }
      setInstallPrompt(null)
    })
  }

  function Logout() {
    sessionStorage.clear();
    window.location.href = websiteURL + '/';
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background to-muted/30">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar className="border-r border-border/40">
          <SidebarHeader className="border-b border-border/40 h-12">
            <Link to="/dashboard" className="flex items-center space-x-2 px-2 h-full">
              <div className="h-8 w-8 rounded-md bg-primary from-primary flex items-center justify-center">
                <img src={Logo} alt="Logo" className='h-5 w-5' />
              </div>
              <span className="font-display text-lg font-bold bg-primary text-gradient">{appName}</span>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Home" isActive={isActive('/dashboard')}>
                      <Link to="/dashboard" className={cn(isActive('/dashboard') && "text-primary")}>
                        <Home />
                        <span>Home</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Profile" isActive={isActive('/dashboard/profile')}>
                      <Link to="/dashboard/profile" className={cn(isActive('/dashboard/profile') && "text-primary")}>
                        <User />
                        <span>Profile</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Pricing" isActive={isActive('/dashboard/pricing')}>
                      <Link to="/dashboard/pricing" className={cn(isActive('/dashboard/pricing') && "text-primary")}>
                        <DollarSign />
                        <span>Pricing</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Generate Course" isActive={isActive('/dashboard/generate-course')}>
                      <Link to="/dashboard/generate-course" className={cn(isActive('/dashboard/generate-course') && "text-primary")}>
                        <Sparkles />
                        <span>Generate Course</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {admin ?
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Admin Panel" isActive={isActive('/admin')}>
                        <Link to="/admin" className={cn(isActive('/admin') && "text-primary")}>
                          <Settings2Icon />
                          <span>Admin Panel</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    :
                    <></>}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupContent>
                <div>
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-indigo-500 hover:from-indigo-500 hover:to-primary shadow-md transition-all"
                    size="sm"
                    asChild
                  >
                    <Link to="/dashboard/generate-course">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Course
                    </Link>
                  </Button>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="px-2 py-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full flex items-center space-x-2 justify-start h-auto p-2 rounded-lg border border-border shadow-sm hover:bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col items-start min-w-0 flex-1 text-left">
                    <span className="text-sm font-semibold truncate w-full">{userName}</span>
                    <span className="text-xs text-muted-foreground truncate w-full">{userEmail}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[210px]">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                {installPrompt && (
                  <DropdownMenuItem onClick={handleInstallClick}>
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    <span>Desktop App</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center space-x-2 px-2 py-1.5"
                  onClick={toggleTheme}
                >
                  {theme === 'light' ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  <span>Theme</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={Logout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                    <span className="font-display font-medium text-lg">{appName}</span>
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
                        to="/dashboard"
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('/dashboard') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Home className="h-5 w-5" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                      
                      <Link 
                        to="/dashboard/profile"
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('/dashboard/profile') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span className="font-medium">Profile</span>
                      </Link>
                      
                      <Link 
                        to="/dashboard/pricing"
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('/dashboard/pricing') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <DollarSign className="h-5 w-5" />
                        <span className="font-medium">Pricing</span>
                      </Link>
                      
                      {admin && (
                        <Link 
                          to="/admin"
                          className={cn(
                            "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                            "hover:text-primary hover:bg-accent/80",
                            isActive('/admin') && "bg-accent text-primary border border-border shadow-sm"
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Settings2Icon className="h-5 w-5" />
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                      )}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border/40">
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-indigo-500 hover:from-indigo-500 hover:to-primary shadow-md transition-all"
                        size="sm"
                        asChild
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link to="/dashboard/generate-course">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Course
                        </Link>
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        <ThemeToggle />
                        <span className="text-sm text-muted-foreground">Toggle Theme</span>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => {
                          Logout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        )}

        <main className="flex-1 overflow-hidden">
          {isMobile && <div className="h-12"></div>}
          <div className="w-full h-full p-2 overflow-y-auto">
          {isMobile && (
            <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-2 h-12 flex items-center shadow-sm bg-background/80 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                    <img src={Logo} alt="Logo" className='h-5 w-5' />
                  </div>
                  <span className="font-display font-medium text-base">{appName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-3 w-3" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/profile" className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      {installPrompt && (
                        <DropdownMenuItem onClick={handleInstallClick}>
                          <DownloadIcon className="h-4 w-4 mr-2" />
                          <span>Desktop App</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="flex items-center space-x-2 px-2 py-1.5"
                        onClick={toggleTheme}
                      >
                        {theme === 'light' ? (
                          <Moon className="h-4 w-4" />
                        ) : (
                          <Sun className="h-4 w-4" />
                        )}
                        <span>Theme</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={Logout}
                        className="text-destructive focus:text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
