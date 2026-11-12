import { useEffect, useState } from 'react';
import { ADMIN_USERS_PAGE_SIZE, useUsers, useDeleteUser } from '@/hooks/useUsers';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Mail, Phone, MapPin, Calendar, ShoppingBag, DollarSign, Trash2 } from 'lucide-react';

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const { data, isLoading } = useUsers({
    search: debouncedSearch,
    page,
    pageSize: ADMIN_USERS_PAGE_SIZE,
  });
  const users = data?.users ?? [];
  const totalUsers = data?.total ?? 0;
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { toast } = useToast();
  const [userToDelete, setUserToDelete] = useState<{ id: string, name: string | null } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / ADMIN_USERS_PAGE_SIZE));

  const handleDelete = () => {
    if (!userToDelete) return;
    
    deleteUser(userToDelete.id, {
      onSuccess: () => {
        toast({
          title: "User deleted",
          description: "The user has been successfully removed from the platform.",
        });
        setUserToDelete(null);
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Error deleting user",
          description: error.message || "Failed to delete user.",
        });
        setUserToDelete(null);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl mb-2">User Management</h2>
          <p className="text-muted-foreground">
            Total Users: <span className="font-semibold">{totalUsers}</span>
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="shadow-soft hover:shadow-elegant transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {user.full_name || 'N/A'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role.toUpperCase()}
                  </Badge>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  {user.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3 mt-0.5" />
                      <span>
                        {user.address}
                        {user.city && `, ${user.city}`}
                        {user.postal_code && ` ${user.postal_code}`}
                        {user.country && `, ${user.country}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3" />
                    </div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-sm font-semibold">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-center border-x border-border">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <ShoppingBag className="h-3 w-3" />
                    </div>
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="text-sm font-semibold">{user.order_count}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <DollarSign className="h-3 w-3" />
                    </div>
                    <p className="text-xs text-muted-foreground">Spent</p>
                    <p className="text-sm font-semibold">₹{user.total_spent.toFixed(2)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Orders
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Send Email
                  </Button>
                  {user.role !== 'admin' && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => setUserToDelete({ id: user.id, name: user.full_name || user.email })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No users found matching your search.</p>
        </div>
      )}

      {totalUsers > ADMIN_USERS_PAGE_SIZE && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages} ({totalUsers} users)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account for <strong>{userToDelete?.name}</strong> and remove all their data from our servers.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
