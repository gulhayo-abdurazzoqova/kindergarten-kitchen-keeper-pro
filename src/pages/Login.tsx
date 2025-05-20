
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useKitchenStore } from '@/store';

const Login: React.FC = () => {
  const { users, login } = useKitchenStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<string>('');

  const handleLogin = () => {
    if (selectedUser) {
      const success = login(selectedUser);
      if (success) {
        toast({
          title: 'Logged in successfully',
          description: 'Welcome to the Kindergarten Kitchen Management System',
        });
        navigate('/');
      } else {
        toast({
          title: 'Login failed',
          description: 'Could not log in with the selected user',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Please select a user',
        description: 'You must select a user to continue',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">KinderKitchen</CardTitle>
            <CardDescription className="text-center">
              Kindergarten Kitchen Management System
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">Select User</Label>
              <div className="grid grid-cols-1 gap-2">
                {users.map((user) => (
                  <Button
                    key={user.id}
                    type="button"
                    variant={selectedUser === user.id ? "default" : "outline"}
                    onClick={() => setSelectedUser(user.id)}
                    className={`justify-start ${
                      selectedUser === user.id ? "bg-kitchen-green hover:bg-kitchen-green/90" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full mr-2 flex items-center justify-center ${
                        selectedUser === user.id ? "bg-white text-kitchen-green" : "bg-kitchen-green text-white"
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs capitalize text-muted-foreground">{user.role}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-kitchen-green hover:bg-kitchen-green/90" 
              onClick={handleLogin}
              disabled={!selectedUser}
            >
              Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
