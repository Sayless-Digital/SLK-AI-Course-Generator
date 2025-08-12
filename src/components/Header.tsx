
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { appName } from '@/constants';
import Logo from '../res/logo.svg';
import LoginDialog from './LoginDialog';
import SignupDialog from './SignupDialog';
import { Menu, X, Home, Sparkles, DollarSign, User, LogOut, Settings, Moon, Sun } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  // Check if user is logged in
  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    const name = sessionStorage.getItem('mName');
    if (auth === 'true' && name) {
      setIsLoggedIn(true);
      // Extract first name only
      const firstName = name.split(' ')[0];
      setUserName(firstName);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    setUserName('');
    window.location.href = '/';
  };

  // Helper function to check if a section is active
  const isActive = (section: string) => activeSection === section;

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigationClick = (section: string) => {
    setActiveSection(section);
    // Close mobile menu
    setIsMobileMenuOpen(false);
    
    if (section === 'home') {
      // Scroll to top of page for home
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
    // Smooth scroll to section
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-2 h-12 flex items-center shadow-sm",
        isScrolled ? "bg-background/80 backdrop-blur-sm" : "bg-transparent"
      )}
    >
      <div className="w-full flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <img src={Logo} alt="Logo" className='h-5 w-5' />
          </div>
          <span className="font-display font-medium text-base">{appName}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a 
            href="#features" 
            className="text-sm font-medium hover:text-primary transition-colors"
            onClick={() => handleNavigationClick('features')}
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            className="text-sm font-medium hover:text-primary transition-colors"
            onClick={() => handleNavigationClick('how-it-works')}
          >
            How It Works
          </a>
          <a 
            href="#pricing" 
            className="text-sm font-medium hover:text-primary transition-colors"
            onClick={() => handleNavigationClick('pricing')}
          >
            Pricing
          </a>
        </nav>

        {/* Call to Actions */}
        <div className="hidden md:flex items-center space-x-2">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 focus-visible:ring-0 focus-visible:ring-offset-0">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3 w-3" />
                  </div>
                  <span className="text-sm font-semibold">Hey {userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
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
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <LoginDialog 
                open={isLoginOpen} 
                onOpenChange={setIsLoginOpen}
                onSwitchToSignup={() => {
                  setIsLoginOpen(false);
                  setIsSignupOpen(true);
                }}
              >
                <Button variant="secondary" size="sm" className="w-[100px] bg-purple-100/60 hover:bg-purple-200/80 dark:bg-purple-900/20 dark:hover:bg-purple-900/30">Login</Button>
              </LoginDialog>
              <SignupDialog 
                open={isSignupOpen} 
                onOpenChange={setIsSignupOpen}
                onSwitchToLogin={() => {
                  setIsSignupOpen(false);
                  setIsLoginOpen(true);
                }}
              >
                <Button size="sm" className="bg-primary hover:bg-primary/90 transition-colors w-[100px]">Get Started</Button>
              </SignupDialog>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center space-x-2">
          {isLoggedIn ? (
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
                  <Link to="/dashboard" className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
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
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LoginDialog 
              open={isLoginOpen} 
              onOpenChange={setIsLoginOpen}
              onSwitchToSignup={() => {
                setIsLoginOpen(false);
                setIsSignupOpen(true);
              }}
            >
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3 w-3" />
                </div>
              </Button>
            </LoginDialog>
          )}
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
            <SheetContent 
              side="right" 
              className="w-[300px] sm:w-[400px] p-0 bg-background"
            >
              <SheetHeader className="h-12 px-2 border-b border-border/40">
                <SheetTitle className="flex items-center space-x-2 h-full">
                  <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                    <img src={Logo} alt="Logo" className='h-5 w-5' />
                  </div>
                  <span className="font-display font-medium text-lg">{appName}</span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col h-full">
                {/* Navigation Links */}
                <nav className="flex-1 px-2 py-2">
                  <div className="space-y-6">
                    <div>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleNavigationClick('home')}
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('home') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                      >
                        <Home className="h-5 w-5" />
                        <span className="font-medium">Home</span>
                      </button>
                      
                      <button
                        onClick={() => handleNavigationClick('features')}
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('features') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                      >
                        <Sparkles className="h-5 w-5" />
                        <span className="font-medium">Features</span>
                      </button>
                      
                      <button
                        onClick={() => handleNavigationClick('how-it-works')}
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('how-it-works') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                      >
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">How It Works</span>
                      </button>
                      
                      <button
                        onClick={() => handleNavigationClick('pricing')}
                        className={cn(
                          "w-full flex items-center space-x-3 text-left px-3 py-2 rounded-md transition-all",
                          "hover:text-primary hover:bg-accent/80",
                          isActive('pricing') && "bg-accent text-primary border border-border shadow-sm"
                        )}
                      >
                        <DollarSign className="h-5 w-5" />
                        <span className="font-medium">Pricing</span>
                      </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                      {isLoggedIn ? (
                      <></>
                    ) : (
                      <div className="space-y-3 pt-4 border-t border-border/40">
                        <>
                          <LoginDialog 
                            open={isLoginOpen} 
                            onOpenChange={(open) => {
                              setIsLoginOpen(open);
                              if (open) setIsMobileMenuOpen(false);
                            }}
                            onSwitchToSignup={() => {
                              setIsLoginOpen(false);
                              setIsSignupOpen(true);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <Button variant="outline" size="sm" className="w-full">Login</Button>
                          </LoginDialog>
                          <SignupDialog 
                            open={isSignupOpen} 
                            onOpenChange={(open) => {
                              setIsSignupOpen(open);
                              if (open) setIsMobileMenuOpen(false);
                            }}
                            onSwitchToLogin={() => {
                              setIsSignupOpen(false);
                              setIsLoginOpen(true);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <Button size="sm" className="w-full">Get Started</Button>
                          </SignupDialog>
                        </>
                      </div>
                      )}
                  </div>
                </nav>


              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
