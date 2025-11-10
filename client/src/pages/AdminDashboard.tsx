import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Users, TrendingUp, AlertCircle, Lock, Unlock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "escrows" | "disputes">("overview");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
    if (!loading && user?.role !== "admin") {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, user, navigate]);

  const { data: users, isLoading: usersLoading } = trpc.admin.getUsers.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const { data: escrows, isLoading: escrowsLoading } = trpc.admin.getEscrows.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const { data: disputes, isLoading: disputesLoading } = trpc.admin.getDisputes.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const { data: stats } = trpc.admin.getStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const freezeUserMutation = trpc.admin.freezeUser.useMutation({
    onSuccess: () => {
      toast.success("User frozen successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to freeze user");
    },
  });

  const unfreezeUserMutation = trpc.admin.unfreezeUser.useMutation({
    onSuccess: () => {
      toast.success("User unfrozen successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unfreeze user");
    },
  });

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container max-w-6xl mx-auto px-4 py-6 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage users, escrows, and disputes</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="container max-w-6xl mx-auto px-4 flex gap-8">
          {["overview", "users", "escrows", "disputes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="p-6 border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Total Escrows</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {(stats?.totalEscrows as number) || 0}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6 border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Total Volume</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      Rp {((stats?.totalVolume as number) / 100000000 || 0).toFixed(1)}M
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6 border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Completed</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {(stats?.completedCount as number) || 0}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-purple-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6 border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Disputed</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {(stats?.disputedCount as number) || 0}
                    </p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-red-600 opacity-20" />
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
              <p className="text-slate-600">Dashboard analytics and activity logs coming soon.</p>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <Card className="border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">User Management</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">KYC Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {usersLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ) : users && users.length > 0 ? (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{u.name || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{u.email || "N/A"}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded text-xs font-medium">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              u.kycStatus === "verified"
                                ? "bg-green-100 text-green-800"
                                : u.kycStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {u.kycStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              u.isFrozen
                                ? "bg-red-100 text-red-800"
                                : u.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {u.isFrozen ? "Frozen" : u.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {u.isFrozen ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => unfreezeUserMutation.mutate({ userId: u.id })}
                              disabled={unfreezeUserMutation.isPending}
                            >
                              <Unlock className="w-3 h-3 mr-1" />
                              Unfreeze
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                freezeUserMutation.mutate({
                                  userId: u.id,
                                  reason: "Admin action",
                                })
                              }
                              disabled={freezeUserMutation.isPending}
                            >
                              <Lock className="w-3 h-3 mr-1" />
                              Freeze
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-600">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Escrows Tab */}
        {activeTab === "escrows" && (
          <Card className="border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Escrow Management</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {escrowsLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ) : escrows && escrows.length > 0 ? (
                    escrows.slice(0, 10).map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{e.title}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          Rp {(e.amount / 100000).toFixed(0)}K
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded text-xs font-medium">
                            {e.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(e.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-600">
                        No escrows found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Disputes Tab */}
        {activeTab === "disputes" && (
          <Card className="border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Dispute Management</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Reason</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {disputesLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ) : disputes && disputes.length > 0 ? (
                    disputes.slice(0, 10).map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{d.reason}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded text-xs font-medium">
                            {d.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-600">
                        No disputes found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
