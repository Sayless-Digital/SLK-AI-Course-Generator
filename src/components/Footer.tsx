
import React from 'react';
import { cn } from '@/lib/utils';
import { appName, companyName } from '@/constants';
import Logo from '../res/logo.svg';

const Footer = () => {
  return (
    <footer className="h-12 px-6 md:px-10 bg-background border-t border-border/50">
      <div className="max-w-7xl mx-auto h-full">
        <div className="flex items-center justify-center space-x-2 h-full">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
            <img src={Logo} alt="Logo" className='h-4 w-4' />
          </div>
          <span className="text-sm text-muted-foreground">
            &copy; 2025 Success Launch Kit
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
