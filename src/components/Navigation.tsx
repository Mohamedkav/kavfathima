import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Lock, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AdminBookingDialog from "./AdminBookingDialog";
import AdminCalendarView from "./AdminCalendarView";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check if admin is already logged in
    const adminStatus = localStorage.getItem("isAdminLoggedIn");
    if (adminStatus === "true") {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === "admin" && password === "admin123") {
      setIsAdminLoggedIn(true);
      localStorage.setItem("isAdminLoggedIn", "true");
      setIsAdminDialogOpen(false);
      setUsername("");
      setPassword("");
      toast({
        title: "Login successful",
        description: "Welcome, Admin!",
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("isAdminLoggedIn");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const navItems = [
    { label: "Home", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { label: "About", action: () => scrollToSection("about") },
    { label: "Gallery", action: () => scrollToSection("gallery") },
    { label: "Book Now", action: () => scrollToSection("booking") },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-background/95 backdrop-blur-md shadow-lg" : "bg-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Admin Login - Top Left */}
          <div className="hidden md:flex items-center space-x-4">
            {isAdminLoggedIn ? (
              <>
                <AdminCalendarView isScrolled={isScrolled} />
                <AdminBookingDialog isScrolled={isScrolled} />
                <button
                  onClick={handleAdminLogout}
                  className={`font-medium transition-colors duration-300 ${
                    isScrolled 
                      ? "text-foreground" 
                      : "text-white"
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAdminDialogOpen(true)}
                className={`font-medium transition-colors duration-300 ${
                  isScrolled 
                    ? "text-foreground" 
                    : "text-white"
                }`}
              >
                Admin Login
              </button>
            )}
          </div>

          {/* Desktop Navigation - Top Right */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className={`font-medium transition-all duration-300 hover:scale-105 ${
                  isScrolled 
                    ? "text-foreground hover:text-primary" 
                    : "text-white hover:text-accent"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${
                isScrolled ? "text-foreground" : "text-white"
              } hover:bg-transparent`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-md shadow-lg border-t border-border/50">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="block w-full text-left font-medium text-foreground hover:text-primary transition-colors duration-300 py-2"
                >
                  {item.label}
                </button>
              ))}
              {isAdminLoggedIn ? (
                <>
                  <div className="py-2">
                    <AdminCalendarView isScrolled={true} />
                  </div>
                  <div className="py-2">
                    <AdminBookingDialog isScrolled={true} />
                  </div>
                  <button
                    onClick={handleAdminLogout}
                    className="w-full text-left font-medium text-foreground transition-colors duration-300 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsAdminDialogOpen(true)}
                  className="block w-full text-left font-medium text-foreground transition-colors duration-300 py-2"
                >
                  Admin Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Admin Login Dialog */}
      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Admin Login
            </DialogTitle>
            <DialogDescription>
              Enter your admin credentials to access the admin panel
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navigation;