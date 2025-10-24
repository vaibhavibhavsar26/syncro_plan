export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      content: "SyncroPlan has been a game-changer for my academic life. I can finally see my class schedule and personal tasks in one place, making it so much easier to plan my days.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80"
    },
    {
      name: "David Martinez",
      role: "Physics Professor",
      content: "As a faculty member, I love how SyncroPlan helps me organize my teaching schedule, office hours, and research time. The ability to share my availability with students has reduced scheduling conflicts.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80"
    },
    {
      name: "Michael Chen",
      role: "MBA Student",
      content: "The color-coding feature in SyncroPlan is brilliant! I can quickly distinguish between classes, group meetings, and personal commitments. It's visually intuitive and helps me manage my time better.",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80"
    }
  ];

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Testimonials</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            What our early users are saying
          </p>
        </div>
        <div className="mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <img className="h-12 w-12 rounded-full object-cover" src={testimonial.image} alt={testimonial.name} />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{testimonial.name}</h3>
                  <p className="text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <div className="mt-1">
                <p className="text-gray-600">"{testimonial.content}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
