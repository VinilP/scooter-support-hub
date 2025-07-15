import { MessageSquare, Phone, Mail, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">ScootSupport</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted partner for electric scooter support and maintenance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/support" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Support
              </Link>
              <Link to="/order-tracking" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Track Order
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <div className="space-y-2">
              <button 
                onClick={() => {
                  // Scroll to bottom to make chat widget visible and trigger it
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  // Small delay to let scroll complete, then trigger chat
                  setTimeout(() => {
                    const chatButton = document.querySelector('[data-chat-trigger]') as HTMLButtonElement;
                    if (chatButton) {
                      chatButton.click();
                    }
                  }, 500);
                }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Live Chat
              </button>
              <a 
                href="tel:1231231231"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call Support
              </a>
              <a 
                href="mailto:support@scootsupport.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email Us
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Phone: (123) 123-1231</p>
              <p>Email: support@scootsupport.com</p>
              <p>Available 24/7</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 ScootSupport. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;