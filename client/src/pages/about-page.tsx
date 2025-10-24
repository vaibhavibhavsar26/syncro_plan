import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { AboutSection } from "@/components/landing/about-section";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h1 className="text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                About SyncroPlan
              </h1>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Learn more about our mission, team, and the story behind SyncroPlan.
              </p>
            </div>
          </div>
        </div>
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
