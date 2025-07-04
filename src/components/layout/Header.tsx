import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, Menu, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto py-4 px-6 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="text-xl font-bold">Traderama</div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Button variant="ghost">Strategies</Button>
          <Button variant="ghost">Community</Button>
          <Button variant="ghost">Market</Button>
        </nav>

        {/* User Profile and Dropdown (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline">Sign In</Button>
          )}
          <Button variant="ghost" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" className="md:hidden" onClick={toggleMobileMenu}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Menu (Conditional Rendering) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-50 border-b">
          <nav className="flex flex-col p-4 space-y-3">
            <Button variant="ghost" className="justify-start">Strategies</Button>
            <Button variant="ghost" className="justify-start">Community</Button>
            <Button variant="ghost" className="justify-start">Market</Button>
            {user ? (
              <>
                <Button variant="ghost" className="justify-start">Profile</Button>
                <Button variant="ghost" className="justify-start" onClick={() => signOut()}>Logout</Button>
              </>
            ) : (
              <Button variant="outline" className="justify-start">Sign In</Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
