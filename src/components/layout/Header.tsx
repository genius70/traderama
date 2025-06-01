
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TrendingUp, User, Settings, LogOut, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const { user, signOut } = useAuth();
  
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Traderama</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              Strategies
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              Trades
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              Market Data
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              Brokers
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button>Sign In</Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
