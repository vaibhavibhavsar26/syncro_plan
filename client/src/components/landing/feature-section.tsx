import { 
  CalendarIcon, 
  TaskIcon, 
  IntegrationIcon, 
  ReminderIcon, 
  ExportIcon, 
  MobileIcon 
} from "@/components/ui/icons";

export function FeatureSection() {
  const features = [
    {
      title: "Academic Timetable",
      description: "Easily view and manage your academic schedule with color-coded entries for classes, labs, and other activities.",
      icon: CalendarIcon,
      color: "bg-primary-500"
    },
    {
      title: "Personal Task Manager",
      description: "Create, organize, and track your personal tasks with intuitive drag-and-drop functionality.",
      icon: TaskIcon,
      color: "bg-amber-500"
    },
    {
      title: "Seamless Integration",
      description: "Sync your academic timetable with personal tasks for a comprehensive view of your schedule.",
      icon: IntegrationIcon,
      color: "bg-primary-500"
    },
    {
      title: "Smart Reminders",
      description: "Get timely reminders for classes, assignments, and personal tasks to stay on track.",
      icon: ReminderIcon,
      color: "bg-emerald-500"
    },
    {
      title: "Export and Share",
      description: "Download your timetable as PDF or share it with classmates and colleagues.",
      icon: ExportIcon,
      color: "bg-primary-500"
    },
    {
      title: "Responsive Design",
      description: "Access your schedule on any device with our mobile-friendly interface.",
      icon: MobileIcon,
      color: "bg-amber-500"
    }
  ];

  return (
    <section id="features" className="bg-gray-50 py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for better scheduling
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            SyncroPlan offers powerful tools to help students and faculty manage their academic and personal schedules.
          </p>
        </div>

        <div className="mt-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-8">
                  <div className={`flex items-center justify-center h-12 w-12 rounded-md ${feature.color} text-white`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-medium text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-base text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
