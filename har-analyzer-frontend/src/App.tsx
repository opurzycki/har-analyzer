import { Activity } from "lucide-react";
import { useState } from "react";
import { FileUpload } from "./components/FileUpload";
import { AnalysisDashboard } from "./components/AnalysisDashboard";
import type { AnalysisResult } from "./types";
import { ThemeToggle } from "./components/ThemeToggle";
import { JiraTemplateModal } from "./components/JiraTemplateModal";

function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border/40 bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAnalysisResult(null)}>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight">HAR Analyzer</span>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <JiraTemplateModal />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center gap-12">
        {!analysisResult ? (
          <>
            <div className="text-center space-y-4 max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text">
                Analyze your Network Traffic
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Upload your HAR files to visualize requests, identify bottlenecks, and optimize your application performance with advanced analytics.
              </p>
            </div>

            <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
              <FileUpload onAnalysisComplete={setAnalysisResult} />
            </div>
          </>
        ) : (
          <AnalysisDashboard
            result={analysisResult}
            onReset={() => setAnalysisResult(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 HAR Analyzer.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;