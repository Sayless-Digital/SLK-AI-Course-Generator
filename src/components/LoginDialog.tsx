import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { appName, serverURL } from '@/constants';
import Logo from '../res/logo.svg';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { useId } from "react";
import { useGoogleLogin } from '@react-oauth/google';

// Type definitions for Google JWT payload
interface GoogleJwtPayload {
  email: string;
  name: string;
  [key: string]: any;
}

interface LoginDialogProps {
  children: React.ReactNode;
  triggerClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSwitchToSignup?: () => void;
}

const LoginDialog = ({ children, triggerClassName, open, onOpenChange, onSwitchToSignup }: LoginDialogProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const id = useId();

  const redirectHome = () => {
    navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      const postURL = serverURL + '/api/login';
      const response = await axios.post(postURL, { email, password });
      if (response.data.success) {
        sessionStorage.setItem('email', response.data.user.email);
        sessionStorage.setItem('mName', response.data.user.mName);
        sessionStorage.setItem('auth', 'true');
        sessionStorage.setItem('uid', response.data.user.id);
        sessionStorage.setItem('type', response.data.user.type);
        setIsOpen(false);
        if (sessionStorage.getItem('shared') === null) {
          redirectHome();
        } else {
          getDataFromDatabase(sessionStorage.getItem('shared'));
        }
      } else {
        setError(response.data.message);
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  async function getDataFromDatabase(id: string) {
    const postURL = serverURL + `/api/shareable?id=${id}`;
    try {
      const response = await axios.get(postURL);
      const dat = response.data[0].content;
      const jsonData = JSON.parse(dat);
      const type = response.data[0].type.toLowerCase();
      const mainTopic = response.data[0].mainTopic;
      const user = sessionStorage.getItem('uid');
      const content = JSON.stringify(jsonData);

      const postURLs = serverURL + '/api/courseshared';
      const responses = await axios.post(postURLs, { user, content, type, mainTopic });
      if (responses.data.success) {
        sessionStorage.removeItem('shared');
        redirectHome();
      } else {
        redirectHome();
      }
    } catch (error) {
      console.error(error);
      redirectHome();
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const decoded = jwtDecode(credentialResponse.credential) as GoogleJwtPayload;
    const email = decoded.email;
    const name = decoded.name;
    const postURL = serverURL + '/api/social';
    try {
      setIsLoading(true);
      const response = await axios.post(postURL, { email, name });
      if (response.data.success) {
        setIsLoading(false);
        sessionStorage.setItem('email', decoded.email);
        sessionStorage.setItem('mName', decoded.name);
        sessionStorage.setItem('auth', 'true');
        sessionStorage.setItem('uid', response.data.user.id);
        sessionStorage.setItem('type', response.data.user.type);
        setIsOpen(false);
        redirectHome();
      } else {
        setIsLoading(false);
        setError(response.data.message);
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setError('Internal Server Error');
    }
  };

  const handleGoogleError = () => {
    setIsLoading(false);
    setError('Internal Server Error');
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setIsLoading(false);
  };

  return (
    <Dialog open={open !== undefined ? open : isOpen} onOpenChange={(dialogOpen) => {
      if (onOpenChange) {
        onOpenChange(dialogOpen);
      } else {
        setIsOpen(dialogOpen);
      }
      if (!dialogOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <div className={triggerClassName}>
          {children}
        </div>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="h-8 w-8 rounded-md bg-primary flex items-center justify-center"
            aria-hidden="true"
          >
            <img src={Logo} alt="Logo" className='h-5 w-5' />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">Welcome back</DialogTitle>
            <DialogDescription className="sm:text-center">
              Enter your credentials to login to your account.
            </DialogDescription>
          </DialogHeader>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Input
                id={`${id}-email`}
                placeholder="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                id={`${id}-password`}
                placeholder="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <div className="flex items-center gap-2">
              <Checkbox id={`${id}-remember`} />
              <Label
                htmlFor={`${id}-remember`}
                className="text-muted-foreground font-normal"
              >
                Remember me
              </Label>
            </div>
            <Link to="/forgot-password" className="text-sm underline hover:no-underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>

        <div className="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1">
          <span className="text-muted-foreground text-xs">Or</span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => googleLogin()}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="text-center text-sm">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => {
              if (onOpenChange) {
                onOpenChange(false);
              } else {
                setIsOpen(false);
              }
              onSwitchToSignup?.();
            }}
            className="font-medium text-primary hover:underline cursor-pointer"
          >
            Sign up
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog; 