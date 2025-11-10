import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EscrowDetail() {
  const { isAuthenticated, loading, user } = useAuth();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const escrowId = window.location.pathname.split("/").pop() || "";

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  const { data: escrow, isLoading } = trpc.escrow.getById.useQuery(
    { id: escrowId },
    { enabled: isAuthenticated && !!escrowId }
  );

  const confirmPaymentMutation = trpc.escrow.confirmPayment.useMutation({
    onSuccess: () => {
      toast.success("Payment confirmed!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to confirm payment");
    },
  });

  const releasePaymentMutation = trpc.escrow.releasePayment.useMutation({
    onSuccess: () => {
      toast.success("Payment released!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to release payment");
    },
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-32 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !escrow) {
    return null;
  }

  const isBuyer = escrow.buyerId === user?.id;
  const isSeller = escrow.sellerId === user?.id;

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">{escrow.title}</h1>
            <p className="text-slate-600 mt-1">Escrow ID: {escrow.id}</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-medium ${getStatusColor(escrow.status)}`}>
            {escrow.status.replace(/_/g, " ").toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Amount Card */}
            <Card className="border-slate-200 p-8 bg-gradient-to-br from-blue-50 to-slate-50">
              <p className="text-slate-600 text-sm mb-2">Escrow Amount</p>
              <h2 className="text-4xl font-bold text-slate-900">Rp {(escrow.amount / 100000).toFixed(0)}K</h2>
              <p className="text-slate-600 mt-4">
                {isBuyer ? "You are the buyer" : "You are the seller"}
              </p>
            </Card>

            {/* Description */}
            {escrow.description && (
              <Card className="border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-3">Description</h3>
                <p className="text-slate-600">{escrow.description}</p>
              </Card>
            )}

            {/* Item Details */}
            {escrow.itemTitle && (
              <Card className="border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Item Details</h3>
                <div className="space-y-4">
                  {escrow.itemTitle && (
                    <div>
                      <p className="text-sm text-slate-600">Item Title</p>
                      <p className="font-semibold text-slate-900">{escrow.itemTitle}</p>
                    </div>
                  )}
                  {escrow.itemDescription && (
                    <div>
                      <p className="text-sm text-slate-600">Description</p>
                      <p className="text-slate-900">{escrow.itemDescription}</p>
                    </div>
                  )}
                  {escrow.itemPrice && (
                    <div>
                      <p className="text-sm text-slate-600">Original Price</p>
                      <p className="font-semibold text-slate-900">Rp {(escrow.itemPrice / 100000).toFixed(0)}K</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Timeline */}
            <Card className="border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-600 mt-2"></div>
                    <div className="w-0.5 h-12 bg-slate-300 my-2"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Created</p>
                    <p className="text-sm text-slate-600">{new Date(escrow.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {escrow.paidAt && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-green-600 mt-2"></div>
                      <div className="w-0.5 h-12 bg-slate-300 my-2"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Funded</p>
                      <p className="text-sm text-slate-600">{new Date(escrow.paidAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {escrow.completedAt && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-green-600 mt-2"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Completed</p>
                      <p className="text-sm text-slate-600">{new Date(escrow.completedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Parties */}
            <Card className="border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Parties</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Buyer</p>
                  <p className="font-semibold text-slate-900">User #{escrow.buyerId}</p>
                  {isBuyer && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-2 inline-block">You</span>}
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Seller</p>
                  <p className="font-semibold text-slate-900">User #{escrow.sellerId}</p>
                  {isSeller && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-2 inline-block">You</span>}
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {isBuyer && escrow.status === "created" && (
                  <Button
                    onClick={() => navigate(`/escrow/${escrow.id}?action=payment`)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Initiate Payment
                  </Button>
                )}

                {isBuyer && escrow.status === "funded" && (
                  <Button
                    onClick={() => releasePaymentMutation.mutate({ escrowId: escrow.id })}
                    disabled={releasePaymentMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {releasePaymentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Release Payment
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => navigate(`/dispute/${escrow.id}`)}
                  className="w-full"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Create Dispute
                </Button>

                <Button variant="outline" className="w-full">
                  Message Seller
                </Button>
              </div>
            </Card>

            {/* Release Condition */}
            <Card className="border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Release Condition</h3>
              <p className="text-sm text-slate-600 capitalize">
                {escrow.releaseCondition.replace(/_/g, " ")}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
