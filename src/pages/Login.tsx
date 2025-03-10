
import React from 'react';
import { Button } from "@/components/ui/button";
import { Twitter } from "lucide-react";
import { CustomCard } from "@/components/ui/CustomCard";

const Login = () => {
  const handleLogin = () => {
    // Redirect to backend's Twitter auth endpoint
    window.location.href = 'http://localhost:3000/auth/twitter';
  };

  return (
    <div className="h-screen flex items-center justify-center bg-background p-4">
      <CustomCard className="max-w-md w-full p-6 md:p-8">
        <div className="space-y-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Twitter className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Social Media Monitor</h1>
            <p className="text-sm text-muted-foreground">
              Connect with Twitter to start monitoring your social media feeds
            </p>
          </div>
          
          <div className="flex justify-center pt-2">
            <Button 
              onClick={handleLogin} 
              size="lg" 
              className="bg-[#1DA1F2] hover:bg-[#1a8cd8] w-full max-w-xs"
            >
              <Twitter className="mr-2 h-4 w-4" />
              Login with Twitter
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground mt-4">
            <p>This will redirect you to Twitter for authentication.</p>
            <p>No passwords are stored by this application.</p>
          </div>
        </div>
      </CustomCard>
    </div>
  );
};

export default Login;
