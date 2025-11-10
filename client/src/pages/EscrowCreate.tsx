import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function EscrowCreate() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    itemTitle: "",
    itemDescription: "",
    sellerId: "",
    releaseCondition: "manual" as const,
    sourceUrl: "",
  });

  const [step, setStep] = useState<"url" | "details">("url");
  const [urlInput, setUrlInput] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  const createEscrowMutation = trpc.escrow.create.useMutation({
    onSuccess: (data) => {
      if (data) {
        toast.success("Escrow created successfully!");
        navigate(`/escrow/${data.id}`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create escrow");
    },
  });

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // In a real implementation, this would call an API to parse the URL
    // For now, we'll just move to the next step
    setFormData((prev) => ({
      ...prev,
      sourceUrl: urlInput,
      title: "Product from " + new URL(urlInput).hostname,
    }));
    setStep("details");
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.amount || !formData.sellerId || !formData.releaseCondition) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amountInCents = Math.round(parseFloat(formData.amount) * 100);

    createEscrowMutation.mutate({
      title: formData.title,
      description: formData.description,
      amount: amountInCents,
      itemTitle: formData.itemTitle,
      itemDescription: formData.itemDescription,
      sellerId: parseInt(formData.sellerId),
      releaseCondition: formData.releaseCondition,
      sourceUrl: formData.sourceUrl,
    });
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container max-w-2xl mx-auto px-4 py-6 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create Escrow</h1>
            <p className="text-slate-600 mt-1">Set up a new secure transaction</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {step === "url" ? (
          // Step 1: URL Input
          <Card className="border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Smart URL Escrow Creation</h2>
            <p className="text-slate-600 mb-6">
              Paste a marketplace link (Facebook Marketplace, etc.) and we'll automatically extract the product details.
            </p>

            <form onSubmit={handleUrlSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Marketplace URL (Optional)
                </label>
                <Input
                  type="url"
                  placeholder="https://www.facebook.com/marketplace/item/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="border-slate-300"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Leave empty to manually enter details
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep("details");
                    setFormData((prev) => ({
                      ...prev,
                      sourceUrl: "",
                    }));
                  }}
                  className="flex-1"
                >
                  Skip & Enter Manually
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Parse URL & Continue
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          // Step 2: Escrow Details
          <Card className="border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Escrow Details</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Escrow Title *
                </label>
                <Input
                  type="text"
                  name="title"
                  placeholder="e.g., iPhone 14 Pro Max"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="border-slate-300"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Describe the transaction..."
                  value={formData.description}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Amount (IDR) *
                </label>
                <Input
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleFormChange}
                  className="border-slate-300"
                  step="0.01"
                  required
                />
              </div>

              {/* Seller ID */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Seller User ID *
                </label>
                <Input
                  type="number"
                  name="sellerId"
                  placeholder="Enter seller's user ID"
                  value={formData.sellerId}
                  onChange={handleFormChange}
                  className="border-slate-300"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">
                  The user ID of the seller you're transacting with
                </p>
              </div>

              {/* Item Details */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Item Details (Optional)</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Item Title
                    </label>
                    <Input
                      type="text"
                      name="itemTitle"
                      placeholder="Product name"
                      value={formData.itemTitle}
                      onChange={handleFormChange}
                      className="border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Item Description
                    </label>
                    <textarea
                      name="itemDescription"
                      placeholder="Detailed product description..."
                      value={formData.itemDescription}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Release Condition */}
              <div className="border-t border-slate-200 pt-6">
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Release Condition *
                </label>
                <select
                  name="releaseCondition"
                  value={formData.releaseCondition}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="manual">Manual Release (Buyer confirms)</option>
                  <option value="confirmation">Seller Confirmation</option>
                  <option value="delivery_proof">Delivery Proof Required</option>
                  <option value="milestone">Milestone-based</option>
                  <option value="auto">Automatic Release</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("url")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={createEscrowMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {createEscrowMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Escrow
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
