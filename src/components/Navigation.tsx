import { Menu, X, Zap, User, Package, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const navItems = user ? [
    { icon: Package, label: "Orders", href: "/order-tracking" },
    { icon: Settings, label: "Admin FAQs", href: "/admin/faqs" },
    { icon: User, label: "Log Out", href: "#", onClick: handleLogout },
  ] : [
    { icon: User, label: "Log In", href: "/login" },
    { icon: User, label: "Sign Up", href: "/login?signup=true" },
  ];

  return (
    <nav className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">ScootSupport</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="flex items-center space-x-2"
                onClick={item.onClick}
                asChild={!item.onClick}
              >
                {item.onClick ? (
                  <>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </>
                ) : (
                  <Link to={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )}
              </Button>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={cn(
        "md:hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      )}>
        <div className="px-4 py-4 space-y-2 bg-secondary/50">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start space-x-2"
              onClick={item.onClick}
              asChild={!item.onClick}
            >
              {item.onClick ? (
                <>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </>
              ) : (
                <Link to={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;