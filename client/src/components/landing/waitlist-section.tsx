import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const waitlistSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  userType: z.string().min(1, { message: "Please select a user type" }),
  updates: z.boolean().optional()
});

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

export function WaitlistSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      fullName: "",
      email: "",
      userType: "",
      updates: true
    }
  });

  async function onSubmit(data: WaitlistFormValues) {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/waitlist", data);
      toast({
        title: "Success!",
        description: "You've been added to our waitlist. We'll be in touch soon!",
        variant: "default"
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Failed to join waitlist. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="waitlist" className="bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Join our waitlist
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            SyncroPlan is currently in development. Sign up to be among the first to try it when we launch!
          </p>
        </div>
        <div className="mt-10 max-w-xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>I am a</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Please select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="updates"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2 flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I want to receive updates about product launches and feature releases.
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Joining..." : "Join Waitlist"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
