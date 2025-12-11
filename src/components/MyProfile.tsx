import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
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
  CheckCircle2,
  Lock,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';
import { format, parseISO } from 'date-fns';

// This type matches the to_dict() method from your Employee model
type UserProfileData = {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  department_id: number;
  designation: string;
  avatar: string | null;
  date_of_birth: string | null;
  is_active: boolean;
  joining_date: string;
  created_at: string;
  flat: string | null;
  house_no: string | null;
  city: string | null;
  postal_code: string | null;
  state: string | null;
  country: string | null;
};

export function MyProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(true);

  // User data state - now fetched from API
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [profileForm, setProfileForm] = useState<Partial<UserProfileData>>({});

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- Fetch user data on component mount ---
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get<UserProfileData>('/auth/me');
        setUserData(data);
        setProfileForm(data);
      } catch (error) {
        console.error("Failed to fetch user data", error);
        toast.error('Failed to load profile', {
          description: 'Could not retrieve user data. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);


  const handleProfileInputChange = (field: keyof UserProfileData, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!userData) return;

    // Only send changed fields
    const changedData: Partial<UserProfileData> = {};
    for (const key in profileForm) {
      if ((profileForm as any)[key] !== (userData as any)[key]) {
        (changedData as any)[key] = (profileForm as any)[key];
      }
    }
    
    // The API endpoint /employees/{employee_id} expects these
    // This is just a subset of what can be changed.
    const updatePayload = {
        name: profileForm.name,
        phone_number: profileForm.phone_number,
        email: profileForm.email,
        designation: profileForm.designation,
        flat: profileForm.flat,
        house_no: profileForm.house_no,
        city: profileForm.city,
        postal_code: profileForm.postal_code,
        state: profileForm.state,
    };

    try {
      const { data } = await api.put(
        `/employees/${userData.employee_id}`, // Use the /employees endpoint
        updatePayload
      );
      
      setUserData(data as any); // Update main data with response
      setProfileForm(data as any ); // Sync form state
      setIsEditing(false);
      toast.success('Profile updated', {
        description: 'Your profile information has been saved successfully.',
      });
    } catch (error: any) {
      console.error("Failed to update profile", error);
      const errorMsg = error.response?.data?.detail || 'An unknown error occurred.';
      toast.error('Update failed', {
        description: errorMsg,
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (userData) {
      setProfileForm(userData); // Reset form to original data
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please make sure your new passwords match.',
      });
      return;
    }
    
    try {
      await api.post('/auth/change-password', passwordData); // Use new endpoint
      toast.success('Password changed', {
        description: 'Your password has been updated successfully.',
      });
      setPasswordData({ current_password: '', new_password: '' });
      setConfirmPassword('');
    } catch (error: any) {
      console.error("Failed to change password", error);
      const errorMsg = error.response?.data?.detail || 'An unknown error occurred.';
      toast.error('Password change failed', {
        description: errorMsg,
      });
    }
  };

  const formatJoinDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <main className="space-y-6 md:space-y-8">
      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading profile...</span>
        </div>
      ) : !userData ? (
        <div className="flex h-[400px] items-center justify-center">
          <span className="text-red-500">Could not load user profile.</span>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="border-b border-border bg-linear-to-r from-primary/5 via-primary/3 to-background rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg ring-2 ring-primary/10">
                    <AvatarImage src={profileForm.avatar || ''} alt={profileForm.name} />
                    <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-[24px] text-primary-foreground">
                      {getInitials(profileForm.name)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg">
                      <Camera className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{profileForm.name}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">{profileForm.email}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="gap-1.5 bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="text-[11px] font-semibold">{profileForm.is_active ? 'Active' : 'Inactive'}</span>
                    </Badge>
                    <Badge variant="outline" className="gap-1.5 bg-primary/5 border-primary/20">
                      <Shield className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      <span className="text-[11px] font-semibold">{profileForm.role}</span>
                    </Badge>
                    <Badge variant="outline" className="gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="text-[11px] font-semibold">{profileForm.employee_id}</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </header>

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
                            value={profileForm.name || ''}
                            onChange={(e) => handleProfileInputChange('name', e.target.value)}
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
                            value={profileForm.employee_id || ''}
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
                            value={profileForm.email || ''}
                            onChange={(e) => handleProfileInputChange('email', e.target.value)}
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
                            value={profileForm.phone_number || ''}
                            onChange={(e) => handleProfileInputChange('phone_number', e.target.value)}
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
                          {/* Note: Department select needs to be populated dynamically if editable */}
                          <Input
                            value={profileForm.department_id || ''} // This should be mapped to dept name
                            disabled
                            className="border-0 bg-transparent px-0"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-[14px] font-medium">
                          Location (City)
                        </Label>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                          <Input
                            id="location"
                            value={profileForm.city || ''}
                            onChange={(e) => handleProfileInputChange('city', e.target.value)}
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
                            value={formatJoinDate(profileForm.joining_date)}
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
                            value={profileForm.role || ''}
                            disabled
                            className="border-0 bg-transparent px-0 text-muted-foreground"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-[14px] font-medium">
                        Bio (Designation)
                      </Label>
                      {/* Using designation for bio as in the hardcoded file */}
                      <Textarea
                        id="bio"
                        value={profileForm.designation || ''}
                        onChange={(e) => handleProfileInputChange('designation', e.target.value)}
                        disabled={!isEditing}
                        rows={4}
                        className={!isEditing ? 'border-0 bg-transparent px-0 resize-none' : 'resize-none'}
                        placeholder={isEditing ? 'Enter your designation or bio...' : 'N/A'}
                      />
                    </div>
                  </Card>
                  
                  {/* Account Statistics card removed since no data is present. */}
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-4 sm:space-y-6">
                  <Card className="border-2 p-4 sm:p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
                    <div className="mb-4 sm:mb-6 flex items-center gap-3">
                      {/* ... header ... */}
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-[14px] font-medium">
                          Current Password
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.current_password}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, current_password: e.target.value })
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
                            value={passwordData.new_password}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, new_password: e.target.value })
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
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>

                      {/* ... password requirements ... */}

                      <div className="flex justify-end">
                        <Button onClick={handleChangePassword} className="gap-2">
                          <Save className="h-4 w-4" aria-hidden="true" />
                          Update Password
                        </Button>
                      </div>
                    </div>
                  </Card>
                  
                  {/* ... other static security cards ... */}
                  
                </div>
              )}
            </div>
          </>
        )}
    </main>
  );
}