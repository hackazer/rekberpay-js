import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DisputeDetail() {
  const { isAuthenticated, loading, user } = useAuth();
  const [, navigate] = useLocation();
  const disputeId = window.location.pathname.split("/").pop() || "";
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  // Get dispute ID from URL - in a real app, this would be from route params
  const escrowId = new URLSearchParams(window.location.search).get("escrowId") || "";

  const { data: dispute, isLoading } = trpc.dispute.getByEscrowId.useQuery(
    { escrowId },
    { enabled: isAuthenticated && !!escrowId }
  );

  const { data: messages } = trpc.dispute.getMessages.useQuery(
    { disputeId: dispute?.id || "" },
    { enabled: isAuthenticated && !!dispute?.id }
  );

  const addMessageMutation = trpc.dispute.addMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      toast.success("Message sent!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
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

  if (!isAuthenticated || !dispute) {
    return null;
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !dispute.id) return;

    addMessageMutation.mutate({
      disputeId: dispute.id,
      message: message.trim(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "escalated":
        return "bg-red-100 text-red-800";
      case "mediation":
        return "bg-yellow-100 text-yellow-800";
      case "open":
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
            <h1 className="text-3xl font-bold text-slate-900">Dispute Details</h1>
            <p className="text-slate-600 mt-1">Dispute ID: {dispute.id}</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-medium ${getStatusColor(dispute.status)}`}>
            {dispute.status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dispute Information */}
            <Card className="border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Dispute Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Reason</p>
                  <p className="font-semibold text-slate-900">{dispute.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Description</p>
                  <p className="text-slate-900">{dispute.description}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Created</p>
                  <p className="font-semibold text-slate-900">{new Date(dispute.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </Card>

            {/* Messages */}
            <Card className="border-slate-200 p-6 flex flex-col h-96">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Conversation</h2>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-slate-50 p-4 rounded-lg">
                {messages && messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.senderId === user?.id
                            ? "bg-blue-600 text-white"
                            : "bg-white text-slate-900 border border-slate-200"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.senderId === user?.id ? "text-blue-100" : "text-slate-600"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-600 py-8">
                    <p>No messages yet. Start the conversation.</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="border-slate-300 flex-1"
                />
                <Button
                  type="submit"
                  disabled={addMessageMutation.isPending || !message.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {addMessageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Parties */}
            <Card className="border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Parties</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Initiated By</p>
                  <p className="font-semibold text-slate-900">User #{dispute.initiatedBy}</p>
                  {dispute.initiatedBy === user?.id && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-2 inline-block">
                      You
                    </span>
                  )}
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Against</p>
                  <p className="font-semibold text-slate-900">User #{dispute.initiatedAgainst}</p>
                  {dispute.initiatedAgainst === user?.id && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded mt-2 inline-block">
                      You
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* Status */}
            <Card className="border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Status</h3>
              <div className={`px-3 py-2 rounded-lg text-sm font-medium text-center ${getStatusColor(dispute.status)}`}>
                {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
              </div>
              {dispute.resolution && (
                <div className="mt-4">
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Resolution</p>
                  <p className="font-semibold text-slate-900 capitalize">
                    {dispute.resolution.replace(/_/g, " ")}
                  </p>
                </div>
              )}
            </Card>

            {/* Actions */}
            {dispute.status === "open" && (
              <Card className="border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Actions</h3>
                <Button variant="outline" className="w-full mb-2">
                  Add Evidence
                </Button>
                <Button variant="outline" className="w-full">
                  Request Mediation
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
