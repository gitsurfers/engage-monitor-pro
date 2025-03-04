
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
      <CustomCard className="max-w-md w-full p-8">
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Social Media Monitor</h1>
            <p className="text-muted-foreground">
              Connect with Twitter to start monitoring your social media feeds
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={handleLogin} 
              size="lg" 
              className="bg-[#1DA1F2] hover:bg-[#1a8cd8] w-full max-w-xs"
            >
              <Twitter className="mr-2 h-5 w-5" />
              Login with Twitter
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>This will redirect you to Twitter for authentication.</p>
            <p>No passwords are stored by this application.</p>
          </div>
        </div>
      </CustomCard>
    </div>
  );
};

export default Login;
