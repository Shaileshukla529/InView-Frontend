import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Briefcase,
  Clock,
  CheckCircle2,
  Lock,
  Key,
  Bell,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfile({ open, onOpenChange }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // User data state
  const [userData, setUserData] = useState({
    name: 'Admin User',
    email: 'admin@inview.com',
    phone: '+1 (555) 123-4567',
    role: 'System Administrator',
    department: 'IT Department',
    location: 'New York, USA',
    joinDate: '2023-01-15',
    employeeId: 'EMP-001',
    bio: 'System administrator with over 10 years of experience in managing enterprise attendance systems and IT infrastructure.',
    status: 'Active',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = () => {
    toast.success('Profile updated', {
      description: 'Your profile information has been saved successfully.',
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original values if needed
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please make sure your new passwords match.',
      });
      return;
    }
    toast.success('Password changed', {
      description: 'Your password has been updated successfully.',
    });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-5xl overflow-y-auto p-0 sm:w-full">
        {/* Header */}
        <DialogHeader className="border-b border-border bg-linear-to-r from-primary/5 via-primary/3 to-background p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-background shadow-lg ring-2 ring-primary/10">
                  <AvatarImage src="" alt={userData.name} />
                  <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-lg sm:text-[24px] text-primary-foreground">
                    {userData.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg">
                    <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl sm:text-[24px] md:text-[28px] tracking-tight">{userData.name}</DialogTitle>
                <DialogDescription className="sr-only">
                  View and edit your profile information and security settings
                </DialogDescription>
                <p className="mt-1 text-xs sm:text-[13px] text-muted-foreground">{userData.email}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1.5 bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="text-[11px] font-semibold">{userData.status}</span>
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 bg-primary/5 border-primary/20">
                    <Shield className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <span className="text-[11px] font-semibold">{userData.role}</span>
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="text-[11px] font-semibold">{userData.employeeId}</span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="border-b border-border bg-muted/20">
          <div className="flex gap-1 px-4 sm:px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-3 text-[13px] sm:text-[14px] font-medium transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <User className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Profile Information</span>
              <span className="sm:hidden">Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-3 text-[13px] sm:text-[14px] font-medium transition-all duration-200 ${
                activeTab === 'security'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              Security
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Action Buttons */}
              <div className="flex justify-end gap-2 sm:gap-3">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancelEdit} className="gap-2">
                      <X className="h-4 w-4" aria-hidden="true" />
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} className="gap-2">
                      <Save className="h-4 w-4" aria-hidden="true" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="gap-2">
                    <Edit className="h-4 w-4" aria-hidden="true" />
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Basic Information */}
              <Card className="border-2 p-4 sm:p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
                <div className="mb-4 sm:mb-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-50">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-[16px] sm:text-[18px] font-semibold leading-tight tracking-tight">
                    Basic Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-[14px] font-medium">
                      Full Name
                    </Label>
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="fullName"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? 'border-0 bg-transparent px-0' : ''}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeId" className="text-[14px] font-medium">
                      Employee ID
                    </Label>
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="employeeId"
                        value={userData.employeeId}
                        disabled
                        className="border-0 bg-transparent px-0 text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[14px] font-medium">
                      Email Address
                    </Label>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? 'border-0 bg-transparent px-0' : ''}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[14px] font-medium">
                      Phone Number
                    </Label>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="phone"
                        type="tel"
                        value={userData.phone}
                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? 'border-0 bg-transparent px-0' : ''}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-[14px] font-medium">
                      Department
                    </Label>
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      {isEditing ? (
                        <Select
                          value={userData.department}
                          onValueChange={(val: any) => setUserData({ ...userData, department: val })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IT Department">IT Department</SelectItem>
                            <SelectItem value="HR Department">HR Department</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={userData.department}
                          disabled
                          className="border-0 bg-transparent px-0"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-[14px] font-medium">
                      Location
                    </Label>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="location"
                        value={userData.location}
                        onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? 'border-0 bg-transparent px-0' : ''}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="joinDate" className="text-[14px] font-medium">
                      Join Date
                    </Label>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="joinDate"
                        value={new Date(userData.joinDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        disabled
                        className="border-0 bg-transparent px-0 text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-[14px] font-medium">
                      Role
                    </Label>
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="role"
                        value={userData.role}
                        disabled
                        className="border-0 bg-transparent px-0 text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-[14px] font-medium">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={userData.bio}
                    onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className={!isEditing ? 'border-0 bg-transparent px-0 resize-none' : 'resize-none'}
                  />
                </div>
              </Card>

              {/* Account Statistics */}
              <Card className="border-2 p-4 sm:p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
                <div className="mb-4 sm:mb-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-purple-50">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-[16px] sm:text-[18px] font-semibold leading-tight tracking-tight">
                    Account Statistics
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Card className="border border-border p-4">
                    <div className="space-y-2">
                      <p className="text-[13px] text-muted-foreground">Days Active</p>
                      <p className="text-[24px] font-semibold leading-none tracking-tight">648</p>
                    </div>
                  </Card>
                  <Card className="border border-border p-4">
                    <div className="space-y-2">
                      <p className="text-[13px] text-muted-foreground">Login Sessions</p>
                      <p className="text-[24px] font-semibold leading-none tracking-tight">1,234</p>
                    </div>
                  </Card>
                  <Card className="border border-border p-4">
                    <div className="space-y-2">
                      <p className="text-[13px] text-muted-foreground">Last Login</p>
                      <p className="text-[24px] font-semibold leading-none tracking-tight">Today</p>
                    </div>
                  </Card>
                </div>
              </Card>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-4 sm:space-y-6">
              <Card className="border-2 p-4 sm:p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
                <div className="mb-4 sm:mb-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-red-50">
                    <Key className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-[16px] sm:text-[18px] font-semibold leading-tight tracking-tight">
                      Change Password
                    </h3>
                    <p className="mt-1 text-xs sm:text-[13px] text-muted-foreground">
                      Update your password to keep your account secure
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-[14px] font-medium">
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-[14px] font-medium">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        placeholder="Enter new password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-[14px] font-medium">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-[13px] text-blue-900">
                      <strong>Password Requirements:</strong>
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-[12px] text-blue-800">
                      <li>At least 8 characters long</li>
                      <li>Include uppercase and lowercase letters</li>
                      <li>Include at least one number</li>
                      <li>Include at least one special character</li>
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleChangePassword} className="gap-2">
                      <Save className="h-4 w-4" aria-hidden="true" />
                      Update Password
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Security Information */}
              <Card className="border-2 p-4 sm:p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
                <div className="mb-4 sm:mb-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-[16px] sm:text-[18px] font-semibold leading-tight tracking-tight">
                      Security Information
                    </h3>
                    <p className="mt-1 text-xs sm:text-[13px] text-muted-foreground">
                      Account security details and recent activity
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-[13px] font-medium text-muted-foreground">Last Password Change</p>
                          <p className="mt-1 text-[16px] font-semibold">30 days ago</p>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                          <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-[13px] font-medium text-muted-foreground">Active Sessions</p>
                          <p className="mt-1 text-[16px] font-semibold">2 devices</p>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                          <Activity className="h-4 w-4 text-blue-600" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <Bell className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" aria-hidden="true" />
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-blue-900">
                          Security Best Practices
                        </p>
                        <ul className="mt-2 space-y-1 text-[12px] text-blue-800">
                          <li className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-blue-600"></div>
                            Use a strong, unique password for this account
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-blue-600"></div>
                            Change your password regularly (recommended every 90 days)
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-blue-600"></div>
                            Never share your credentials with anyone
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-blue-600"></div>
                            Log out when using shared devices
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
