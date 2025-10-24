import { CheckIcon } from "@/components/ui/icons";

export function DemoSection() {
  const benefits = [
    {
      title: "Daily, weekly, and monthly views",
      description: "Switch between different timeframes to plan your schedule effectively."
    },
    {
      title: "Conflict detection",
      description: "Get alerts when you have overlapping commitments to help you plan better."
    },
    {
      title: "Time analytics",
      description: "Understand how you spend your time with helpful analytics and insights."
    }
  ];

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          <div className="mt-10 lg:mt-0 lg:col-start-1">
            <div className="pr-4 -ml-4 -mt-4 sm:pr-6 md:-ml-6 md:-mt-6">
              <img 
                className="max-w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5" 
                src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                alt="SyncroPlan dashboard example" 
              />
            </div>
          </div>
          <div className="lg:col-start-2">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Visualize your time better
            </h2>
            <p className="mt-3 text-lg text-gray-500">
              SyncroPlan's intuitive interface makes it easy to see your entire schedule at a glance. Color-coding helps you quickly distinguish between academic commitments and personal tasks.
            </p>
            <div className="mt-8 space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                      <CheckIcon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{benefit.title}</h3>
                    <p className="mt-2 text-base text-gray-500">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
