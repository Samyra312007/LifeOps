import Layout from "@/components/Layout";
import { ChevronRight } from "lucide-react";

export default function Placeholder({ section }: { section: string }) {
  return (
    <Layout>
      <div className="p-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {section}
        </h1>
        <p className="text-foreground mb-6">
          This section is ready to be built. Let me know what you'd like here!
        </p>
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-foreground mb-2">Next steps</h3>
          <p className="text-sm text-foreground mb-4">
            Would you like me to implement the full design for this page? Just let me know and I'll build it out with all the specific content and components.
          </p>
          <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors inline-flex items-center gap-2">
            Let's build it <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </Layout>
  );
}
