
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { User } from '../../../server/src/schema';

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
            <AvatarFallback className="text-xs">
              {getUserInitials(user.username)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" side="top" align="center">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                <AvatarFallback className="text-lg">
                  {getUserInitials(user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {user.username}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Member since {user.created_at.toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  // Handle profile edit
                  console.log('Edit profile');
                }}
              >
                <span className="mr-2">⚙️</span>
                Settings
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  // Handle view saved maps
                  console.log('View saved maps');
                }}
              >
                <span className="mr-2">🗺️</span>
                My Maps
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  // Handle export data
                  console.log('Export data');
                }}
              >
                <span className="mr-2">💾</span>
                Export Data
              </Button>
              
              <hr className="my-2" />
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  // Handle logout
                  console.log('Logout');
                  setIsOpen(false);
                }}
              >
                <span className="mr-2">🚪</span>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
