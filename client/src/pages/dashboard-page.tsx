import { useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Timetable } from "@/components/dashboard/timetable";
import { TaskList } from "@/components/dashboard/task-list";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsLogoutDialogOpen(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <a href="/dashboard" className="flex items-center">
                  <svg className="h-8 w-auto text-primary-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  <span className="ml-2 text-xl font-bold text-gray-900">SyncroPlan</span>
                </a>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="/dashboard" className="border-primary-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </a>
                <a href="/dashboard?view=timetable" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Professional Timetable
                </a>
                {user.userType === "student" && (
                  <a href="/dashboard?view=tasks" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Personal Task Manager
                  </a>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-700">Hello, {user.username}</span>
              
              <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will need to sign in again to access your schedules and tasks.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} disabled={logoutMutation.isPending}>
                      {logoutMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging out...
                        </>
                      ) : (
                        "Log out"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.userType === "faculty" ? "Faculty Professional Dashboard" : "Student Dashboard"}
              </h1>
              
              {/* Faculty only see timetable generation */}
              {user.userType === "faculty" && (
                <div className="space-y-8">
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h2 className="text-lg leading-6 font-medium text-gray-900">Timetable Generator</h2>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Upload course, faculty, and room data to generate conflict-free timetables for your institution.
                      </p>
                    </div>
                    <Timetable />
                  </div>
                </div>
              )}
              
              {/* Students see both timetable and task list */}
              {user.userType === "student" && (
                <div className="space-y-8">
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h2 className="text-lg leading-6 font-medium text-gray-900">My Academic Timetable</h2>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        View your current class schedule generated by your institution.
                      </p>
                    </div>
                    <Timetable />
                  </div>
                  
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h2 className="text-lg leading-6 font-medium text-gray-900">Personal Task Manager</h2>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Organize your personal tasks and assignments alongside your academic schedule.
                      </p>
                    </div>
                    <TaskList />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
