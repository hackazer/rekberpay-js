import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, TrendingUp, Wallet, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  const { data: buyerEscrows, isLoading: buyerLoading } = trpc.escrow.getMyEscrows.useQuery(
    { role: "buyer", limit: 10 },
    { enabled: isAuthenticated }
  );

  const { data: sellerEscrows, isLoading: sellerLoading } = trpc.escrow.getMyEscrows.useQuery(
    { role: "seller", limit: 10 },
    { enabled: isAuthenticated }
  );

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const allEscrows = [...(buyerEscrows || []), ...(sellerEscrows || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "disputed":
        return "bg-red-100 text-red-800";
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "funded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "disputed":
        return <AlertCircle className="w-4 h-4" />;
      case "pending_payment":
        return <Clock className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back, {user?.name || "User"}</p>
          </div>
          <Button onClick={() => navigate("/escrow/create")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Escrow
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total Escrows</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{allEscrows.length}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Active Transactions</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {allEscrows.filter((e) => e.status !== "completed" && e.status !== "cancelled").length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {allEscrows.filter((e) => e.status === "completed").length}
                </p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total Volume</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  Rp {(allEscrows.reduce((sum, e) => sum + e.amount, 0) / 100000).toFixed(0)}K
                </p>
              </div>
              <Wallet className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Escrows List */}
        <Card className="border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>
          </div>

          <div className="divide-y divide-slate-200">
            {buyerLoading || sellerLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : allEscrows.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-600 mb-4">No escrows yet</p>
                <Button onClick={() => navigate("/escrow/create")} variant="outline">
                  Create Your First Escrow
                </Button>
              </div>
            ) : (
              allEscrows.map((escrow) => (
                <div
                  key={escrow.id}
                  className="p-6 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/escrow/${escrow.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{escrow.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {escrow.buyerId === user?.id ? "As Buyer" : "As Seller"} •{" "}
                        {new Date(escrow.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">Rp {(escrow.amount / 100000).toFixed(0)}K</p>
                      <div className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(escrow.status)}`}>
                        {getStatusIcon(escrow.status)}
                        {escrow.status.replace(/_/g, " ").toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6 border-slate-200 bg-gradient-to-br from-blue-50 to-slate-50">
            <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/escrow/create")}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Escrow
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/profile")}>
                View Profile
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-slate-200 bg-gradient-to-br from-green-50 to-slate-50">
            <h3 className="font-bold text-slate-900 mb-4">Need Help?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Have questions about your transactions? Check out our help center or contact support.
            </p>
            <Button variant="outline" className="w-full justify-start">
              Contact Support
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
