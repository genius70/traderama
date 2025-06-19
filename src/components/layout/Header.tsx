
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, User, Settings, Users, BarChart3, Plus, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isAdmin = user?.email === 'royan.shaw@gmail.com';

  const NavigationItems = ({ mobile = false, onItemClick = () => {} }) => (
    <div className={`${mobile ? 'flex flex-col space-y-4' : 'hidden md:flex items-center space-x-6'}`}>
     <Link 
        to="/market-trends" 
        className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
        onClick={onItemClick}
      > 
       Markets |
    </Link>
    <Link 
        to="/dashboard" 
        className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
        onClick={onItemClick}
      >
        Dashboard |
      </Link>
      <Link 
        to="/trade-positions" 
        className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
        onClick={onItemClick}
      >
        Positions |
      </Link>
     <Link 
        to="/copy-trading" 
        className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
        onClick={onItemClick}
      >
        Auto Trading |
      </Link>     
     <Link 
        to="/community" 
        className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
        onClick={onItemClick}
      >
        Community |
      </Link>
      <Link 
        to="/create-strategy" 
        className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
        onClick={onItemClick}
      >
        Create Strategy |
      </Link>
      {isAdmin && (
        <Link 
          to="/admin" 
          className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
          onClick={onItemClick}
        >
          Analytics
        </Link>
      )}
    </div>
  );

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Traderama</span>
          </Link>

          {/* Desktop Navigation */}
          {user && <NavigationItems />}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Mobile Menu */}
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <div className="flex flex-col space-y-6 mt-6">
                      <NavigationItems mobile onItemClick={() => setIsMenuOpen(false)} />
                      
                      <div className="border-t pt-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {user?.email?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{user?.email}</p>
                            {isAdmin && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Link 
                            to="/profile" 
                            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                          <Link 
                            to="/settings" 
                            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </Link>
                          <button 
                            onClick={() => {
                              handleSignOut();
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors w-full text-left"
                          >
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Desktop User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full hidden md:flex">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user?.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-gray-900">{user?.email}</p>
                        {isAdmin && <Badge variant="secondary" className="text-xs w-fit">Admin</Badge>}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>Admin Analytics</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
