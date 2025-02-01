import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl sm:text-5xl font-bold mb-6 animate-fade-up">
        Welcome to SIM
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
        Your centralized platform for managing and accessing multimedia content.
        Browse through documents, music, videos, and games with ease.
      </p>
      <div className="flex flex-wrap justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <Link
          to="/documents"
          className="inline-flex items-center px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Get Started <ArrowRight className="ml-2" size={18} />
        </Link>
      </div>
    </div>
  );
};

export default Index;