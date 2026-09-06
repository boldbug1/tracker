import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import BackgroundPixelStars from "@/components/ui/background-pixel-stars";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0c0c0d] text-white selection:bg-white/20 flex flex-col relative">
      <BackgroundPixelStars />
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center px-6 border-b border-[#222]">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-sm text-[#888] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="font-pixel flex-1 w-full max-w-3xl mx-auto px-6 py-12 md:py-24 animate-in fade-in duration-300">
        <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">
          PRIVACY
        </h1>
        <p className="text-xl text-[#888] mb-8 font-medium">
          Your workspace. Your data.
        </p>
        <p className="text-sm text-[#666] mb-16 pb-8 border-b border-[#222]">
          Last updated: September 6, 2026
        </p>

        <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-white prose-a:underline hover:prose-a:text-[#ccc] text-[#999] leading-relaxed space-y-12">
          
          <section>
            <h2 className="text-xl text-white mb-4">1. Overview</h2>
            <p>
              At Dailys, we believe your productivity data is yours alone. Our infrastructure is designed to provide a secure, private workspace where your tasks, notes, and metrics remain confidential. We only collect the data necessary to provide and secure our service. We do not sell your personal data or use it to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <h3 className="text-white font-medium">Account Data</h3>
              <p>When you create an account, we collect your email address and a securely hashed password to authenticate you.</p>

              <h3 className="text-white font-medium">User-Created Content</h3>
              <p>We store the content you explicitly create and save within Dailys. This includes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Tasks and their completion status</li>
                <li>Notes and document contents</li>
                <li>Metric Tracker records (leads, pipeline values, activities)</li>
              </ul>

              <h3 className="text-white font-medium">Browser Storage Data</h3>
              <p>We store essential functional data locally in your browser's <code>localStorage</code> to maintain your session and preferences without requiring constant server roundtrips. This includes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Authentication session tokens</li>
                <li>Theme preferences (light/dark mode, colors)</li>
                <li>Focus Mode timers and background selections</li>
                <li>Clock format preferences</li>
                <li>Temporary offline caches for your Metric Tracker data</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4">3. How We Use Information</h2>
            <p>We strictly use the collected information to operate the Dailys application. Specifically, to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Authenticate your account and maintain your active session.</li>
              <li>Provide the application functionality (syncing tasks and notes).</li>
              <li>Save your custom interface preferences.</li>
              <li>Secure our service against unauthorized access.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4">4. Authentication</h2>
            <p>
              Authentication is handled securely via Supabase. We support email and password authentication. Passwords are cryptographically hashed and are never stored in plain text.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4">5. Local Browser Storage & Cookies</h2>
            <p>
              Dailys uses <strong>essential local browser storage</strong> (<code>localStorage</code>) to function. This allows us to keep you logged in and persist your dashboard layout choices. 
            </p>
            <p>
              <strong>We do not currently use any optional analytics trackers, marketing cookies, or third-party tracking pixels.</strong> A small, first-party cookie (<code>dailys_cookie_consent</code>) is used solely to remember that you have seen and accepted our privacy settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4">6. Third-Party Services</h2>
            <p>
              We rely on trusted third-party infrastructure to operate Dailys reliably. Currently, our only data sub-processor is:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase</strong>: Provides our PostgreSQL database, authentication service, and secure file storage backend.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4">7. Data Storage & Security</h2>
            <p>
              Your data is stored securely in our Supabase-managed PostgreSQL database. Data is associated strictly with your authenticated account via secure Row-Level Security (RLS) policies, meaning your data is isolated and cannot be accessed by other users.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4">8. Account Deletion & Data Retention</h2>
            <p>
              Your data is retained for as long as your account is active. If you wish to delete your account and all associated data, you may contact support. Upon account deletion, your tasks, notes, metrics, and authentication records will be permanently removed from our active database.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4">9. Children's Privacy</h2>
            <p>
              Dailys is not intended for use by children under the age of 13. We do not knowingly collect personal information from children. If we become aware that we have collected personal data from a child, we will take steps to securely delete that information.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4">10. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy or how your data is handled, please reach out to us at:
            </p>
            <p className="mt-2">
              <a href="mailto:dailyssupport@gmail.com" className="text-white hover:text-[#ccc]">dailyssupport@gmail.com</a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
