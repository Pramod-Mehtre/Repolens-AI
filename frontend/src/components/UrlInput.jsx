import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

const EXAMPLES = [
  { label: "expressjs/express", url: "https://github.com/expressjs/express" },
  { label: "sindresorhus/got", url: "https://github.com/sindresorhus/got" },
  { label: "pallets/flask", url: "https://github.com/pallets/flask" },
];

export default function UrlInput({ onAnalyze, isLoading, mode = "hero" }) {
  const [url, setUrl] = useState("");
  const [hasError, setHasError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setHasError(true);
      return;
    }
    setHasError(false);
    onAnalyze(url.trim());
  };

  const handleExampleClick = (exampleUrl) => {
    setUrl(exampleUrl);
    setHasError(false);
    onAnalyze(exampleUrl);
  };

  return (
    <div className="w-full">
      <form 
        onSubmit={handleSubmit} 
        className={`relative flex items-center w-full bg-card border rounded-lg transition-colors overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary ${
          hasError ? "border-error" : "border-gray-800"
        }`}
      >
        <div className="pl-4 text-textSecondary">
          <Search size={18} />
        </div>
        <input
          id="github-repo-url"
          type="text"
          aria-label="GitHub repository URL"
          aria-required="true"
          aria-describedby={hasError ? "url-error" : undefined}
          className="flex-1 bg-transparent border-none py-3 px-3 text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-0 font-mono text-sm sm:text-base"
          placeholder="https://github.com/owner/repository"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (hasError) setHasError(false);
          }}
          disabled={isLoading}
          autoComplete="url"
          spellCheck={false}
        />
        <div className="pr-2">
          <button
            type="submit"
            aria-label={isLoading ? "Analyzing repository..." : "Analyze repository"}
            className="bg-primary hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="animate-spin" size={16} />}
            {mode === "hero" ? "Analyze" : (isLoading ? "" : "Analyze")}
          </button>
        </div>
      </form>

      {mode === "hero" && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <span className="text-sm text-textSecondary">Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              className="text-sm px-3 py-1 bg-white/5 hover:bg-white/10 text-textSecondary hover:text-textPrimary border border-gray-800 rounded-full transition-colors"
              onClick={() => handleExampleClick(ex.url)}
              disabled={isLoading}
              type="button"
            >
              {ex.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
