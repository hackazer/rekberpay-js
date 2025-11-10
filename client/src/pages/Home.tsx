import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Shield, Zap, Users, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO} alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-lg text-slate-900">{APP_TITLE}</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button onClick={() => navigate("/profile")}>Profile</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => (window.location.href = getLoginUrl())}>
                  Login
                </Button>
                <Button onClick={() => (window.location.href = getLoginUrl())}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-slate-900 mb-6">
              Secure Escrow Transactions Made Simple
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              RekberPay is Indonesia's trusted escrow platform, enabling safe milestone-based transactions between buyers and sellers anywhere.
            </p>
            <div className="flex gap-4">
              <Button size="lg" onClick={() => (window.location.href = getLoginUrl())}>
                Start Trading Now <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg h-96 flex items-center justify-center text-white">
            <div className="text-center">
              <Shield className="w-24 h-24 mx-auto mb-4" />
              <p className="text-lg font-semibold">Secure & Regulated</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-t border-slate-200">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">Why Choose RekberPay?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 border-slate-200">
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Transactions</h3>
              <p className="text-slate-600">
                Funds are held securely until both parties confirm the transaction is complete. Your money is always protected.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 border-slate-200">
              <Zap className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Payouts</h3>
              <p className="text-slate-600">
                Get paid quickly with our instant payout system. Funds are transferred directly to your account after verification.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 border-slate-200">
              <Users className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Dispute Resolution</h3>
              <p className="text-slate-600">
                Built-in mediation system with secure chat and evidence upload. Fair resolution for all parties involved.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-8 border-slate-200">
              <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Analytics</h3>
              <p className="text-slate-600">
                Track your transaction history, reputation score, and earnings with detailed analytics and reports.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-8 border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">KYC Verified</h3>
              <p className="text-slate-600">
                Complete KYC verification for enhanced security and compliance with Indonesian regulations.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-8 border-slate-200">
              <Zap className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Multiple Payment Methods</h3>
              <p className="text-slate-600">
                Support for various payment gateways including Mayar, QR codes, and more. Choose what works for you.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Smart URL Feature Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-slate-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Smart URL Escrow Creation</h2>
              <p className="text-lg text-slate-600 mb-6">
                Our killer feature: Simply paste any marketplace link and we'll automatically extract product details, prefill the form, and create your escrow in seconds.
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Facebook Marketplace Support</h4>
                    <p className="text-slate-600">Paste any Facebook Marketplace link</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Auto-Fill Product Details</h4>
                    <p className="text-slate-600">Images, price, title, and description extracted automatically</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900">One-Click Creation</h4>
                    <p className="text-slate-600">Review and create escrow with a single click</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-lg p-8 text-white">
              <code className="text-sm">
                <div className="mb-4">rekberpay.com/</div>
                <div className="text-blue-400">https://www.facebook.com/marketplace/item/12345</div>
                <div className="mt-8 text-green-400">→ Auto-extract product details</div>
                <div className="text-green-400">→ Prefill escrow form</div>
                <div className="text-green-400">→ Create instantly</div>
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Trade Safely?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of buyers and sellers using RekberPay for secure transactions
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">About</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Compliance</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">Facebook</a></li>
                <li><a href="#" className="hover:text-white">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2024 RekberPay. All rights reserved. Secure Escrow for Indonesia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
