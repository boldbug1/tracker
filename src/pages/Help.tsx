import { useState, useMemo } from "react";
import { Link } from "react-router";
import { ArrowLeft, Search, ChevronRight } from "lucide-react";
import Footer from "@/components/Footer";
import BackgroundPixelStars from "@/components/ui/background-pixel-stars";

type Category = "Getting Started" | "Notes" | "Focus" | "Metric Tracker" | "Account & Data" | "FAQ";

interface HelpArticle {
  slug: string;
  category: Category;
  title: string;
  content: React.ReactNode;
}

const articles: HelpArticle[] = [
  {
    slug: "what-is-dailys",
    category: "Getting Started",
    title: "What is Dailys?",
    content: (
      <div className="space-y-4">
        <p>
          Dailys is a privacy-first productivity and habit tracking dashboard designed to help you stay focused and build better habits, entirely in your browser.
        </p>
        <p>
          We rely on your browser's local storage to securely save your layout preferences and data offline, while utilizing a secure backend to persist your tasks and notes when logged in.
        </p>
      </div>
    ),
  },
  {
    slug: "creating-an-account",
    category: "Getting Started",
    title: "Creating an account",
    content: (
      <div className="space-y-4">
        <p>
          You can create a Dailys account using your email address and a secure password.
        </p>
        <p>
          Once authenticated, your session is saved in your local browser storage so you don't have to log in repeatedly.
        </p>
      </div>
    ),
  },
  {
    slug: "managing-tasks",
    category: "Getting Started",
    title: "Tasks",
    content: (
      <div className="space-y-4">
        <p>
          Manage your daily to-dos from the dashboard. You can add, complete, and track tasks. 
          Your tasks are automatically saved to your account.
        </p>
      </div>
    ),
  },
  {
    slug: "creating-notes",
    category: "Notes",
    title: "Creating notes",
    content: (
      <div className="space-y-4">
        <p>
          Dailys offers a powerful rich-text editor for taking notes. You can format text, add headers, and create lists.
        </p>
      </div>
    ),
  },
  {
    slug: "text-formatting",
    category: "Notes",
    title: "Text formatting & tables",
    content: (
      <div className="space-y-4">
        <p>
          Highlight text to reveal the formatting toolbar. You can make text bold, italic, underline, or add links. You can also insert tables to organize your data.
        </p>
      </div>
    ),
  },
  {
    slug: "focus-sessions",
    category: "Focus",
    title: "Focus sessions",
    content: (
      <div className="space-y-4">
        <p>
          Use Focus Mode to eliminate distractions. You can choose between different ambient backgrounds like the retro 8-bit fireplace or starry night.
        </p>
      </div>
    ),
  },
  {
    slug: "pomodoro-stopwatch",
    category: "Focus",
    title: "Pomodoro & Stopwatch",
    content: (
      <div className="space-y-4">
        <p>
          Set a Pomodoro timer for structured work intervals, or use the Stopwatch to track how long you spend on open-ended tasks. 
          Your timer preferences are saved to your local browser storage.
        </p>
      </div>
    ),
  },
  {
    slug: "metric-tracker",
    category: "Metric Tracker",
    title: "Metric Tracker",
    content: (
      <div className="space-y-4">
        <p>
          The Metric Tracker helps you log daily numbers, leads, activities, and follow-ups. You can view your progress over time through integrated graphs and charts.
        </p>
      </div>
    ),
  },
  {
    slug: "data-privacy",
    category: "Account & Data",
    title: "Data and Privacy",
    content: (
      <div className="space-y-4">
        <p>
          We believe in strict data privacy. Dailys currently does not use analytics or marketing trackers.
          Your data is your own. For more details, see our <Link to="/privacy" className="text-white underline hover:text-[#ccc]">Privacy Policy</Link>.
        </p>
      </div>
    ),
  },
  {
    slug: "faq-redirect",
    category: "FAQ",
    title: "Frequently Asked Questions",
    content: (
      <div className="space-y-4">
        <p>
          We've moved our most common questions to a dedicated FAQ page.
        </p>
        <p>
          <Link to="/faq" className="inline-flex items-center gap-2 text-white bg-[#222] hover:bg-[#333] px-4 py-2 rounded transition-colors">
            View the FAQ <ChevronRight className="w-4 h-4" />
          </Link>
        </p>
      </div>
    ),
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const lowerQuery = searchQuery.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(lowerQuery) ||
        a.category.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set<Category>();
    filteredArticles.forEach((a) => cats.add(a.category));
    return Array.from(cats);
  }, [filteredArticles]);

  return (
    <div className="min-h-screen bg-[#0c0c0d] text-white selection:bg-white/20 flex flex-col relative z-0">
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
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:py-24">
        {selectedArticle ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-2 text-sm text-[#888] hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Help Center
            </button>
            <div className="mb-4 flex items-center gap-2 text-sm text-[#888]">
              <span>Help Center</span>
              <span>/</span>
              <span>{selectedArticle.category}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold mb-8 tracking-tight font-pixel">
              {selectedArticle.title}
            </h1>
            <div className="font-pixel prose prose-invert max-w-none text-[#999] leading-relaxed">
              {selectedArticle.content}
            </div>
            
            <div className="mt-16 pt-8 border-t border-[#222]">
              <h3 className="font-medium text-white mb-2 font-pixel">Still need help?</h3>
              <p className="text-sm text-[#888] mb-4 font-pixel">
                If you couldn't find the answer to your question, our support team is here to help.
              </p>
              <a 
                href="mailto:dailyssupport@gmail.com"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-[#222] hover:bg-[#111] rounded-lg transition-colors text-white font-pixel"
              >
                Contact Support
              </a>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <div className="mb-16 text-center">
              <h1 className="text-3xl md:text-5xl font-semibold mb-4 tracking-tight font-pixel">
                How can we help?
              </h1>
              <p className="text-lg text-[#888] mb-8 font-pixel">
                Find answers, learn how Dailys works, or contact support.
              </p>
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="font-pixel w-full h-14 pl-12 pr-4 bg-[#111] border border-[#222] rounded-xl text-white placeholder:text-[#666] focus:outline-none focus:border-[#444] transition-colors"
                />
              </div>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="text-center py-12 border border-[#222] rounded-xl bg-[#111]/50">
                <p className="text-[#888] font-pixel">No help articles found.</p>
                <p className="text-[#666] text-sm mt-1 font-pixel">Try another search term.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {categories.map((category) => (
                  <section key={category}>
                    <h2 className="text-sm font-medium text-[#888] uppercase tracking-wider mb-4 pb-2 border-b border-[#222] font-pixel">
                      {category}
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredArticles
                        .filter((a) => a.category === category)
                        .map((article) => (
                          <li key={article.slug}>
                            <button
                              onClick={() => setSelectedArticle(article)}
                              className="flex items-center justify-between w-full p-4 text-left border border-[#222] hover:border-[#444] bg-[#111]/30 hover:bg-[#111] rounded-xl transition-all group"
                            >
                              <span className="font-medium text-[#ccc] group-hover:text-white transition-colors font-pixel">
                                {article.title}
                              </span>
                              <ChevronRight className="w-4 h-4 text-[#444] group-hover:text-[#888] transition-colors" />
                            </button>
                          </li>
                        ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
            
            <div className="mt-24 text-center">
              <h3 className="font-medium text-white mb-2 font-pixel">Can't find what you're looking for?</h3>
              <a 
                href="mailto:dailyssupport@gmail.com"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-[#222] hover:bg-[#111] rounded-lg transition-colors text-white mt-4 font-pixel"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
