export default function Footer() {
  return (
    <footer className="text-center py-8 text-textSecondary text-sm mt-auto">
      <p className="mb-2">
        Designed & Developed by Pramod Mehtre
      </p>
      <a 
        href="https://github.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-textSecondary hover:text-textPrimary transition-colors underline underline-offset-4 decoration-gray-700 hover:decoration-gray-400"
      >
        View source on GitHub
      </a>
    </footer>
  );
}
