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
    <div className={`${mobile ? 'flex flex-col space-y-4' : 'hidden xl:flex items-center justify-center space-x-1 min-w-0 flex-1'}`}>
      <Link 
        to="/market-trends" 
        className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 xl:px-3 py-2 rounded-md hover:bg-gray-50 whitespace-nowrap"
        onClick={onItemClick}
      > 
        Markets
      </Link>
      <div className={`${mobile ? 'hidden' : 'h-4 w-px bg-gray-300 mx-1'}`} />
      
      <Link 
        to="/dashboard" 
        className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 xl:px-3 py-2 rounded-md hover:bg-gray-50 whitespace-nowrap"
        onClick={onItemClick}
      >
        Dashboard
      </Link>
      <div className={`${mobile ? 'hidden' : 'h-4 w-px bg-gray-300 mx-1'}`} />
      
      <Link 
        to="/trade-positions" 
        className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 xl:px-3 py-2 rounded-md hover:bg-gray-50 whitespace-nowrap"
        onClick={onItemClick}
      >
        Positions
      </Link>
      <div className={`${mobile ? 'hidden' : 'h-4 w-px bg-gray-300 mx-1'}`} />
      
      <Link 
        to="/options-trading" 
        className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 xl:px-3 py-2 rounded-md hover:bg-gray-50 whitespace-nowrap"
        onClick={onItemClick}
      >
        Training
      </Link>
      <div className={`${mobile ? 'hidden' : 'h-4 w-px bg-gray-300 mx-1'}`} />
      
      <Link 
        to="/auto-trading" 
        className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 xl:px-3 py-2 rounded-md hover:bg-gray-50 whitespace-nowrap"
        onClick={onItemClick}
      >
        Auto Trading
      </Link>
      <div className={`${mobile ? 'hidden' : 'h-4 w-px bg-gray-300 mx-1'}`} />
      
      <Link 
        to="/community" 
        className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 xl:px-3 py-2 rounded-md hover:bg-gray-50 whitespace-nowrap"
        onClick={onItemClick}
      >
        Community
      </Link>
      <div className={`${mobile ? 'hidden' : 'h-4 w-px bg-gray-300 mx-1'}`} />
      
      <Link 
        to="/create-strategy" 
        className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 xl:px-3 py-2 rounded-md hover:bg-gray-50 whitespace-nowrap"
        onClick={onItemClick}
      >
        Create Strategy
      </Link>
      
      {isAdmin && (
        <>
          <div className={`${mobile ? 'hidden' : 'h-4 w-px bg-gray-300 mx-1'}`} />
          <Link 
            to="/admin" 
            className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 xl:px-3 py-2 rounded-md hover:bg-gray-50 whitespace-nowrap"
            onClick={onItemClick}
          >
            Analytics
          </Link>
        </>
      )}
    </div>
  );

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 min-w-0">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 hidden sm:block">Traderama</span>
            <span className="text-lg font-bold text-gray-900 sm:hidden">TR</span>
          </Link>

          {/* Desktop Navigation - Flexible and responsive */}
          {user && (
            <div className="flex-1 flex justify-center px-4 xl:px-8 min-w-0 overflow-hidden">
              <NavigationItems />
            </div>
          )}

          {/* Right Side - User Menu and Mobile Menu */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {user ? (
              <>
                {/* Mobile/Tablet Menu Button */}
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="xl:hidden">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 sm:w-96">
                    <div className="flex flex-col space-y-6 mt-6">
                      <div className="flex items-center space-x-3 pb-4 border-b">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                        <span className="text-lg font-bold text-gray-900">Traderama</span>
                      </div>
                      
                      <NavigationItems mobile onItemClick={() => setIsMenuOpen(false)} />
                      
                      <div className="border-t pt-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {user?.email?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{user?.email}</p>
                            {isAdmin && <Badge variant="secondary" className="text-xs mt-1">Admin</Badge>}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Link 
                            to="/profile" 
                            className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors px-3 py-2 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <User className="h-5 w-5" />
                            <span>Profile</span>
                          </Link>
                          <Link 
                            to="/settings" 
                            className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors px-3 py-2 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Settings className="h-5 w-5" />
                            <span>Settings</span>
                          </Link>
                          {isAdmin && (
                            <Link 
                              to="/admin" 
                              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors px-3 py-2 rounded-md"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <BarChart3 className="h-5 w-5" />
                              <span>Admin Analytics</span>
                            </Link>
                          )}
                          <button 
                            onClick={() => {
                              handleSignOut();
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center space-x-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors w-full text-left px-3 py-2 rounded-md"
                          >
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Desktop User Menu - Hidden on mobile/tablet */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hidden xl:flex">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {user?.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-white" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {user?.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user?.email}</p>
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
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
