import { StudentIcon, FacultyIcon } from "@/components/ui/icons";

export function AboutSection() {
  return (
    <section id="about" className="bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">About SyncroPlan</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Why we built SyncroPlan
          </p>
        </div>
        <div className="mt-10 max-w-3xl mx-auto text-center text-lg text-gray-500">
          <p>
            We created SyncroPlan with a simple mission: to help students and faculty better manage their time. Balancing academic responsibilities with personal life can be challenging, and existing solutions often treat these as separate domains.
          </p>
          <p className="mt-4">
            SyncroPlan bridges this gap by providing a unified platform where your academic and personal schedules work together harmoniously. Our team of former educators and software engineers brings a deep understanding of academic environments and productivity systems.
          </p>
          <p className="mt-4">
            Whether you're a student juggling classes and extracurriculars or a faculty member managing teaching and research, SyncroPlan helps you stay organized and focused on what matters most.
          </p>
        </div>
        
        <div className="mt-16">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-8">Who SyncroPlan is for</h3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            {/* Students */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mx-auto">
                  <StudentIcon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="mt-5 text-lg font-medium text-gray-900 text-center">Students</h3>
                <p className="mt-2 text-base text-gray-500">
                  Manage class schedules, study sessions, assignments, and personal activities all in one place. Stay on top of deadlines and maintain a healthy school-life balance.
                </p>
              </div>
            </div>

            {/* Faculty */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mx-auto">
                  <FacultyIcon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="mt-5 text-lg font-medium text-gray-900 text-center">Faculty</h3>
                <p className="mt-2 text-base text-gray-500">
                  Efficiently manage teaching schedules, office hours, research time, and departmental commitments. Create and share timetables with students and colleagues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
