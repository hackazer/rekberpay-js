import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function UserProfile() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: "",
    profileImage: "",
    bio: "",
  });

  const [kycData, setKycData] = useState({
    idType: "ktp",
    idNumber: "",
    fullName: "",
    dateOfBirth: "",
    address: "",
  });

  const { data: profile } = trpc.user.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setEditMode(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const submitKycMutation = trpc.user.submitKYC.useMutation({
    onSuccess: () => {
      toast.success("KYC submitted for verification!");
      setKycData({
        idType: "ktp",
        idNumber: "",
        fullName: "",
        dateOfBirth: "",
        address: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit KYC");
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        profileImage: profile.profileImage || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || !profile) {
    return null;
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleKycChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setKycData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycData.idNumber || !kycData.fullName || !kycData.dateOfBirth || !kycData.address) {
      toast.error("Please fill in all KYC fields");
      return;
    }
    submitKycMutation.mutate(kycData);
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-600 mt-1">Manage your account and verification</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="border-slate-200 p-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                {profile.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <h3 className="font-bold text-slate-900">{profile.name || "User"}</h3>
              <p className="text-sm text-slate-600 mt-1">{profile.email}</p>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Logout
              </Button>
            </Card>

            {/* KYC Status */}
            <Card className="border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">KYC Status</h3>
              <div className={`px-3 py-2 rounded-lg text-sm font-medium text-center ${getKycStatusColor(profile.kycStatus)}`}>
                {profile.kycStatus === "verified" && <CheckCircle2 className="w-4 h-4 inline mr-2" />}
                {profile.kycStatus === "pending" && <AlertCircle className="w-4 h-4 inline mr-2" />}
                {profile.kycStatus.charAt(0).toUpperCase() + profile.kycStatus.slice(1)}
              </div>
              {profile.kycStatus === "verified" && profile.kycVerifiedAt && (
                <p className="text-xs text-slate-600 mt-2">
                  Verified on {new Date(profile.kycVerifiedAt).toLocaleDateString()}
                </p>
              )}
            </Card>

            {/* Stats */}
            <Card className="border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-600">Total Deals</p>
                  <p className="text-2xl font-bold text-slate-900">{profile.totalDeals}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-slate-900">{profile.completedDeals}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Rating</p>
                  <p className="text-2xl font-bold text-slate-900">{profile.ratingScore || "0"}/5</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card className="border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
                {!editMode && (
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    Edit
                  </Button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Full Name</label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Phone Number</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditMode(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">Full Name</p>
                    <p className="font-semibold text-slate-900">{formData.name || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-semibold text-slate-900">{profile.email || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Phone</p>
                    <p className="font-semibold text-slate-900">{formData.phone || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Bio</p>
                    <p className="text-slate-900">{formData.bio || "Not set"}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* KYC Verification */}
            {profile.kycStatus !== "verified" && (
              <Card className="border-slate-200 p-6 bg-gradient-to-br from-yellow-50 to-slate-50 border-yellow-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Complete KYC Verification</h2>
                <p className="text-sm text-slate-600 mb-6">
                  Verify your identity to unlock higher transaction limits and access all features.
                </p>

                <form onSubmit={handleKycSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">ID Type</label>
                    <select
                      name="idType"
                      value={kycData.idType}
                      onChange={handleKycChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ktp">KTP (Indonesian ID)</option>
                      <option value="passport">Passport</option>
                      <option value="sim">SIM (Driver's License)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">ID Number</label>
                    <Input
                      type="text"
                      name="idNumber"
                      value={kycData.idNumber}
                      onChange={handleKycChange}
                      className="border-slate-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Full Name</label>
                    <Input
                      type="text"
                      name="fullName"
                      value={kycData.fullName}
                      onChange={handleKycChange}
                      className="border-slate-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Date of Birth</label>
                    <Input
                      type="date"
                      name="dateOfBirth"
                      value={kycData.dateOfBirth}
                      onChange={handleKycChange}
                      className="border-slate-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Address</label>
                    <textarea
                      name="address"
                      value={kycData.address}
                      onChange={handleKycChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitKycMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {submitKycMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit KYC
                  </Button>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
