import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, User, Settings, Users, BarChart3, Plus, Menu, X, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import UserNotifications from "@/components/notifications/UserNotifications";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Fetch unread notifications count
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('notification_recipients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (!error) {
        setUnreadCount(count || 0);
      }
    };

    fetchUnreadCount();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('notification-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification_recipients',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const NavigationItems = ({ mobile = false, onItemClick = () => {} }) => (
    <div className={`${mobile ? 'flex flex-col space-y-2' : 'hidden lg:flex items-center justify-center space-x-1 min-w-0 flex-1'}`}>
      <Link 
        to="/market-trends" 
        className="text-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-accent whitespace-nowrap text-sm"
        onClick={onItemClick}
      > 
        Markets
      </Link>
      <div className={`${mobile ? 'hidden' : 'h-4 w-px bg-gray-300 mx-1'}`} />
      
      <Link 
        to="/dashboard" 
        className="text-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-accent whitespace-nowrap text-sm"
        onClick={onItemClick}
      >
        Dashboard
      </Link>
      <div className={`${mobile ? 'hidden' : 'h-4 w-px bg-border mx-1'}`} />
      
      <Link 
        to="/trade-positions" 
        className="text-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-accent whitespace-nowrap text-sm"
        onClick={onItemClick}
      >
        Positions
      </Link>
      <div className={`${mobile ? 'hidden' : 'h-4 w-px bg-border mx-1'}`} />
      
      <Link 
        to="/options-trading" 
        className="text-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-accent whitespace-nowrap text-sm"
        onClick={onItemClick}
      >
        Training
      </Link>
      <div className={`${mobile ? 'hidden' : 'h-4 w-px bg-border mx-1'}`} />
      
      <Link 
        to="/auto-trading" 
        className="text-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-accent whitespace-nowrap text-sm"
        onClick={onItemClick}
      >
        Auto Trading
      </Link>
      <div className={`${mobile ? 'hidden' : 'h-4 w-px bg-border mx-1'}`} />
      
      <Link 
        to="/community" 
        className="text-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-accent whitespace-nowrap text-sm"
        onClick={onItemClick}
      >
        Community
      </Link>
      <div className={`${mobile ? 'hidden' : 'h-4 w-px bg-border mx-1'}`} />
      
      <Link 
        to="/create-strategy" 
        className="text-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-accent whitespace-nowrap text-sm"
        onClick={onItemClick}
      >
        Create Strategy
      </Link>
      
      {isAdmin && (
        <>
          <div className={`${mobile ? 'hidden' : 'h-4 w-px bg-border mx-1'}`} />
          <Link 
            to="/admin" 
            className="text-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-accent whitespace-nowrap text-sm"
            onClick={onItemClick}
          >
            Analytics
          </Link>
        </>
      )}
    </div>
  );

  return (
    <header className="bg-background/80 backdrop-blur-md shadow-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 min-w-0">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground hidden sm:block">Traderama</span>
            <span className="text-lg font-bold text-foreground sm:hidden">TR</span>
          </Link>

          {/* Desktop Navigation - Only visible on desktop */}
          {user && (
            <div className="flex-1 flex justify-center px-4 lg:px-8 min-w-0 overflow-hidden">
              <NavigationItems />
            </div>
          )}

          {/* Right Side - User Menu and Mobile Menu */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {user ? (
              <>
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications Bell */}
                <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-semibold text-white bg-destructive rounded-full">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[90vw] sm:w-[400px] max-h-[80vh] sm:max-h-[600px] overflow-y-auto p-0" align="end">
                    <div className="p-4">
                      <UserNotifications />
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Mobile/Tablet Menu Button - Only visible on mobile/tablet */}
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
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

                {/* Desktop User Menu - Only visible on desktop */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hidden lg:flex">
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