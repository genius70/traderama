import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-2xl sm:text-3xl font-bold mb-4">
          Ready to Start Trading Iron Condors?
        </h3>
        <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Join thousands of traders who trust Traderama for their options
          trading success
        </p>
        <Link to="/auth">
          <Button
            size="lg"
            variant="secondary"
            className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-red-600 hover:text-white transition-all duration-300"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
