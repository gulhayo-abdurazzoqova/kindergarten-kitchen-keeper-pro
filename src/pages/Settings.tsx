
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useKitchenStore } from '@/store';
import { useToast } from '@/components/ui/use-toast';
import { toast } from '@/components/ui/sonner';
import { AlertCircle, Save, UserCog, Loader2 } from 'lucide-react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Settings = () => {
  const { currentUser } = useKitchenStore();
  const { toast: uiToast } = useToast();
  const queryClient = useQueryClient();
  
  // State for settings
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableRealTimeUpdates, setEnableRealTimeUpdates] = useState(true);
  
  // Get settings from API
  const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.settings.get(),
    onSuccess: (data) => {
      if (data.settings) {
        setLowStockThreshold(data.settings.lowStockThreshold || 10);
        setEnableNotifications(data.settings.enableNotifications !== false);
        setEnableRealTimeUpdates(data.settings.enableRealTimeUpdates !== false);
      }
    },
    onError: (error) => {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings. Using default values.');
    }
  });
  
  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: (settings: any) => api.settings.update(settings),
    onSuccess: () => {
      toast.success('Settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error) => {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    }
  });

  const handleSaveSettings = () => {
    const settings = {
      lowStockThreshold,
      enableNotifications,
      enableRealTimeUpdates,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.id
    };
    
    saveSettingsMutation.mutate(settings);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your application settings</p>
        </div>
      </div>

      {isLoadingSettings ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading settings...</span>
        </div>
      ) : (
        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="admin">Admin Settings</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold (%)</Label>
                  <Input 
                    id="lowStockThreshold" 
                    type="number" 
                    value={lowStockThreshold} 
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))} 
                    min="1" 
                    max="100"
                  />
                  <p className="text-sm text-muted-foreground">
                    Alert will be triggered when ingredient stock falls below this percentage
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="realTimeUpdates">Real-time Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable real-time updates for inventory changes
                    </p>
                  </div>
                  <Switch 
                    id="realTimeUpdates" 
                    checked={enableRealTimeUpdates} 
                    onCheckedChange={setEnableRealTimeUpdates} 
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={saveSettingsMutation.isPending} 
                  className="ml-auto"
                >
                  {saveSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableNotifications">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for alerts and important events
                    </p>
                  </div>
                  <Switch 
                    id="enableNotifications" 
                    checked={enableNotifications} 
                    onCheckedChange={setEnableNotifications} 
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-medium">Notification Types</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when ingredients fall below threshold
                      </p>
                    </div>
                    <Switch defaultChecked disabled={!enableNotifications} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Misuse Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when potential misuse is detected
                      </p>
                    </div>
                    <Switch defaultChecked disabled={!enableNotifications} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={saveSettingsMutation.isPending}
                  className="ml-auto"
                >
                  {saveSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {currentUser?.role === 'admin' && (
            <TabsContent value="admin" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Settings</CardTitle>
                  <CardDescription>
                    Administrator-only settings and configurations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center p-2 border rounded-md bg-yellow-50 border-yellow-200">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                      <p className="text-sm text-yellow-700">
                        These settings are only available to administrators.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="userManagement">User Management</Label>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" className="flex items-center">
                          <UserCog className="mr-2 h-4 w-4" />
                          Manage Users
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleSaveSettings}
                    disabled={saveSettingsMutation.isPending}
                    className="ml-auto"
                  >
                    {saveSettingsMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
};

export default Settings;
