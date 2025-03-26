
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Mail, Shield, Database, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[90vh] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="container max-w-5xl animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-primary/10 text-primary font-medium mb-2">
                Physical Mail Management Simplified
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Document tracking for the modern workplace
              </h1>
              <p className="text-lg text-muted-foreground">
                MailMinder helps organizations efficiently track, manage, and distribute physical mail and documents with a beautiful and intuitive interface.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                {user ? (
                  <Button size="lg" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button size="lg" onClick={() => navigate("/login")}>
                    Get Started
                  </Button>
                )}
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative h-80 lg:h-96 rounded-lg bg-gradient-to-br from-primary/5 to-primary/30 overflow-hidden shadow-xl border border-primary/20">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <div className="w-full max-w-md p-6 glass-panel rounded-lg transform hover:scale-[1.02] transition-transform">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Incoming Document</h3>
                      <p className="text-sm text-muted-foreground">Regional Office Communication</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 bg-muted rounded-full w-3/4"></div>
                    <div className="h-2.5 bg-muted rounded-full"></div>
                    <div className="h-2.5 bg-muted rounded-full w-5/6"></div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <div className="w-20 h-8 bg-muted rounded-md"></div>
                    <div className="w-20 h-8 bg-primary/20 rounded-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/50 py-16">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Key Features</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              MailMinder provides all the tools your organization needs to efficiently manage physical documents
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Document Tracking</h3>
              <p className="text-muted-foreground">Track the complete lifecycle of physical documents from receipt to archival.</p>
            </div>
            <div className="glass-card p-6 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Management</h3>
              <p className="text-muted-foreground">Create organizations and assign granular permissions to team members.</p>
            </div>
            <div className="glass-card p-6 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Storage</h3>
              <p className="text-muted-foreground">Securely store document metadata and track history with our robust database.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-auto">
        <div className="container max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} MailMinder. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
