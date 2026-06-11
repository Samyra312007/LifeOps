import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Ghost } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6 overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
      
      <div className="text-center max-w-2xl relative z-10">
        <div className="relative inline-block mb-12">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative w-32 h-32 rounded-[3rem] bg-muted/50 border border-border flex items-center justify-center text-muted-foreground">
                <Ghost size={64} className="opacity-50" />
            </div>
        </div>

        <h1 className="text-8xl md:text-[10rem] font-editorial font-bold tracking-tighter mb-4 italic leading-none">404</h1>
        <h2 className="text-3xl md:text-4xl font-editorial font-bold mb-8 italic">Coordinate Not Found</h2>
        <p className="text-xl text-muted-foreground font-medium mb-12 leading-relaxed text-balance">
          The requested temporal or spatial address does not exist within the current LifeOps architecture.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/">
                <Button className="h-16 px-10 rounded-3xl text-lg font-bold shadow-2xl shadow-primary/30 group">
                    <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Return to Nexus
                </Button>
            </Link>
            <Button variant="outline" className="h-16 px-10 rounded-3xl text-lg font-bold border-2 gap-2">
                <Search size={18} />
                Global Search
            </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
