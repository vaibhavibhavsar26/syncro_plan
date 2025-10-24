import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function HeroSection() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16 lg:px-8 grid lg:grid-cols-2 gap-8 items-center">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span>Welcome to </span>
            <span className="text-primary-600">SyncroPlan</span>
          </h1>
          <p className="mt-3 text-lg text-gray-500 sm:mt-5 sm:text-xl md:mt-5 max-w-xl mx-auto lg:mx-0">
            Your Ultimate Academic and Personal Schedule Manager! Sync your academic timetable with personal tasks seamlessly.
          </p>
          <div className="mt-8 sm:flex justify-center lg:justify-start">
            <div className="rounded-md shadow">
              <Link href="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  Login
                </Button>
              </Link>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <Link href="/auth?register=true">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Register
                </Button>
              </Link>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <Link href="/about">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden shadow-xl transform transition-all">
          <img 
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fHNjaGVkdWxlfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60" 
            alt="Calendar and scheduling interface" 
          />
        </div>
      </div>

      {/* Wave Divider */}
      <div className="relative h-16 bg-white">
        <svg className="absolute bottom-0 w-full h-16 text-gray-50" preserveAspectRatio="none" viewBox="0 0 1440 54">
          <path fill="currentColor" d="M0 22L60 17.2C120 12 240 1.3 360 6.7C480 12 600 32 720 42.8C840 54 960 54 1080 45.3C1200 37 1320 21 1380 13.3L1440 6.7V54H1380C1320 54 1200 54 1080 54C960 54 840 54 720 54C600 54 480 54 360 54C240 54 120 54 60 54H0V22Z"></path>
        </svg>
      </div>
    </section>
  );
}
