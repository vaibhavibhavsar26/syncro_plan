import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LogoIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isActivePath = (path: string) => {
    return location === path ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700";
  };

  const mobileIsActivePath = (path: string) => {
    return location === path ? "bg-primary-50 border-primary-500 text-primary-700" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700";
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="flex items-center">
                  <LogoIcon className="h-8 w-auto text-primary-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">SyncroPlan</span>
                </a>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActivePath("/")}`}>
                  Home
                </a>
              </Link>
              <Link href="/about">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActivePath("/about")}`}>
                  About
                </a>
              </Link>
              <Link href="/contact">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActivePath("/contact")}`}>
                  Contact
                </a>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button variant="outline" onClick={() => window.location.href = "/auth"}>
              Login
            </Button>
            <Button className="ml-3" onClick={() => window.location.href = "/auth?register=true"}>
              Register
            </Button>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open main menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-sm">
                <nav className="flex flex-col h-full pt-6">
                  <div className="space-y-1">
                    <Link href="/">
                      <a onClick={() => setIsSheetOpen(false)} className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${mobileIsActivePath("/")}`}>
                        Home
                      </a>
                    </Link>
                    <Link href="/about">
                      <a onClick={() => setIsSheetOpen(false)} className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${mobileIsActivePath("/about")}`}>
                        About
                      </a>
                    </Link>
                    <Link href="/contact">
                      <a onClick={() => setIsSheetOpen(false)} className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${mobileIsActivePath("/contact")}`}>
                        Contact
                      </a>
                    </Link>
                  </div>
                  <div className="pt-4 pb-3 border-t border-gray-200 mt-auto">
                    <div className="flex items-center justify-between px-4">
                      <Button variant="outline" className="w-full" onClick={() => { setIsSheetOpen(false); window.location.href = "/auth"; }}>
                        Login
                      </Button>
                      <Button className="w-full ml-2" onClick={() => { setIsSheetOpen(false); window.location.href = "/auth?register=true"; }}>
                        Register
                      </Button>
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
