import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CalendarIcon, Download, Loader2, PlusCircle, RefreshCw } from "lucide-react";

type TimeSlot = {
  time: string;
  monday?: Entry;
  tuesday?: Entry;
  wednesday?: Entry;
  thursday?: Entry;
  friday?: Entry;
};

type Entry = {
  title: string;
  location: string;
  type: "class" | "lab" | "other";
};

// Sample timetable data
const sampleTimetable: TimeSlot[] = [
  {
    time: "09:00 - 10:00",
    monday: { title: "Computer Science 101", location: "Room 201", type: "class" },
    wednesday: { title: "Computer Science 101", location: "Room 201", type: "class" },
    friday: { title: "Computer Science 101", location: "Room 201", type: "class" }
  },
  {
    time: "10:00 - 11:00",
    tuesday: { title: "Mathematics", location: "Room 305", type: "class" },
    thursday: { title: "Mathematics", location: "Room 305", type: "class" }
  },
  {
    time: "11:00 - 12:00",
    monday: { title: "Physics Lab", location: "Lab 102", type: "lab" },
    wednesday: { title: "Physics Lab", location: "Lab 102", type: "lab" }
  },
  {
    time: "12:00 - 13:00"
  },
  {
    time: "13:00 - 14:00",
    tuesday: { title: "English Literature", location: "Room 401", type: "class" },
    friday: { title: "English Literature", location: "Room 401", type: "class" }
  },
  {
    time: "14:00 - 15:00",
    monday: { title: "Computer Programming", location: "Lab 203", type: "lab" },
    thursday: { title: "Computer Programming", location: "Lab 203", type: "lab" }
  },
  {
    time: "15:00 - 16:00",
    tuesday: { title: "Study Group", location: "Library", type: "other" },
    wednesday: { title: "Academic Advising", location: "Room 105", type: "other" }
  }
];

// Define schema for course, faculty, and room inputs
const courseSchema = z.object({
  id: z.string().min(1, "Course ID is required"),
  name: z.string().min(1, "Course name is required"),
  lectureCount: z.string().transform(val => parseInt(val)),
  hasLab: z.boolean().default(false),
  labCount: z.string().optional().transform(val => val ? parseInt(val) : 0),
});

const facultySchema = z.object({
  id: z.string().min(1, "Faculty ID is required"),
  name: z.string().min(1, "Name is required"),
});

const roomSchema = z.object({
  id: z.string().min(1, "Room ID is required"),
  name: z.string().min(1, "Room name is required"),
  capacity: z.string().transform(val => parseInt(val)),
  type: z.enum(["Lecture", "Lab"]),
});

const timetableGeneratorSchema = z.object({
  courses: z.array(courseSchema).min(1, "At least one course is required"),
  faculty: z.array(facultySchema).min(1, "At least one faculty member is required"),
  rooms: z.array(roomSchema).min(1, "At least one room is required"),
});

type TimetableGeneratorFormValues = z.infer<typeof timetableGeneratorSchema>;

// Convert API timetable format to our UI format
function convertApiTimetableToUiFormat(apiTimetable: any[]): TimeSlot[] {
  const timeSlots: { [key: string]: TimeSlot } = {};
  const timeSlotOrder: string[] = [
    "9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", 
    "14:00-15:00", "15:00-16:00"
  ];
  
  // Initialize time slots
  timeSlotOrder.forEach(time => {
    const displayTime = time.replace("-", " - ");
    timeSlots[time] = { time: displayTime };
  });
  
  // Fill in the entries
  apiTimetable.forEach(entry => {
    try {
      if (!entry.timeSlot) {
        console.error("Missing timeSlot in entry:", entry);
        return;
      }
      
      const [day, time] = entry.timeSlot.split(" ");
      const dayLower = day.toLowerCase();
      
      if (timeSlots[time]) {
        const entryType = typeof entry.type === 'string' 
          ? entry.type.toLowerCase() as "class" | "lab" | "other" 
          : "other";
          
        const newEntry: Entry = {
          title: `${entry.courseName} (${entry.type})`,
          location: entry.roomName || "TBA",
          type: entryType
        };
        
        timeSlots[time][dayLower as keyof TimeSlot] = newEntry;
      }
    } catch (error) {
      console.error("Error processing timetable entry:", entry, error);
    }
  });
  
  // Convert to array in the right order
  return timeSlotOrder.map(time => timeSlots[time]);
}

// Define the timetable entry type from the API
type TimetableEntry = {
  id: string;
  name: string;
  createdAt: string;
  createdBy: number;
  timetableData: any[];
};

export function Timetable() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState("week");
  const [timetable, setTimetable] = useState<TimeSlot[]>(sampleTimetable);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isFetchDialogOpen, setIsFetchDialogOpen] = useState(false);
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("monday");
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  
  // Fetch available timetables from the server
  const { data: availableTimetables, isLoading: timetablesLoading, error: timetablesError } = useQuery({
    queryKey: ['/api/timetables'],
    enabled: user?.userType === 'student' || user?.userType === 'faculty',
  });
  
  // CSV file states
  const [csvFiles, setCsvFiles] = useState<{
    courses: File | null;
    faculty: File | null;
    rooms: File | null;
    students: File | null;
    lectures: File | null;
    labs: File | null;
  }>({
    courses: null,
    faculty: null,
    rooms: null,
    students: null,
    lectures: null,
    labs: null,
  });
  
  // Form for timetable generation
  const form = useForm<TimetableGeneratorFormValues>({
    resolver: zodResolver(timetableGeneratorSchema),
    defaultValues: {
      courses: [{ id: "", name: "", lectureCount: "1", hasLab: false, labCount: "0" }],
      faculty: [{ id: "", name: "" }],
      rooms: [{ id: "", name: "", capacity: "30", type: "Lecture" }],
    },
  });
  
  // Handle CSV file input change
  const handleFileChange = (fileType: keyof typeof csvFiles) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFiles(prev => ({
        ...prev,
        [fileType]: e.target.files![0]
      }));
      
      toast({
        title: "File Selected",
        description: `${fileType}.csv file selected: ${e.target.files[0].name}`,
      });
    }
  };
  
  // Handle CSV file upload button click
  const handleFileUpload = (fileType: keyof typeof csvFiles) => async () => {
    if (!csvFiles[fileType]) {
      toast({
        title: "Error",
        description: `No ${fileType}.csv file selected`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      const fileContents = await csvFiles[fileType]!.text();
      parseCSV(fileType, fileContents);
      
      toast({
        title: "Upload Successful",
        description: `${fileType}.csv file processed successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process CSV file",
        variant: "destructive",
      });
    }
  };
  
  // Parse CSV content based on file type
  const parseCSV = (fileType: string, content: string) => {
    // Split the CSV content into lines and parse
    const lines = content.split('\n');
    if (lines.length <= 1) {
      throw new Error("CSV file appears to be empty or has only headers");
    }
    
    // Skip header row (first line) and process data rows
    const dataRows = lines.slice(1).filter(line => line.trim().length > 0);
    
    console.log(`Parsed ${dataRows.length} rows from ${fileType}.csv`);
  };
  
  // Generate timetable from CSV files
  const generateTimetableFromCSV = async () => {
    const hasRequiredFiles = csvFiles.courses && csvFiles.faculty && csvFiles.rooms;
    
    if (!hasRequiredFiles) {
      toast({
        title: "Missing Files",
        description: "Please upload at least courses, faculty, and rooms CSV files",
        variant: "destructive",
      });
      return;
    }
    
    // Create FormData to send files to the server
    const formData = new FormData();
    Object.entries(csvFiles).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });
    
    try {
      const response = await fetch('/api/generate-timetable-csv', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === "success") {
        toast({
          title: "Success",
          description: "Timetable generated successfully from CSV files",
        });
        
        // Convert API response to our UI format and update timetable
        if (result.timetable && Array.isArray(result.timetable)) {
          const newTimetable = convertApiTimetableToUiFormat(result.timetable);
          setTimetable(newTimetable);
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to generate timetable from CSV files",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate timetable from CSV files",
        variant: "destructive",
      });
    }
  };
  
  // Reset all CSV file selections
  const resetCSVFiles = () => {
    setCsvFiles({
      courses: null,
      faculty: null,
      rooms: null,
      students: null,
      lectures: null,
      labs: null,
    });
    
    toast({
      title: "Reset Complete",
      description: "All CSV file selections have been cleared",
    });
  };
  
  // Mutation for generating timetable
  const generateTimetableMutation = useMutation({
    mutationFn: async (data: TimetableGeneratorFormValues) => {
      const response = await apiRequest("POST", "/api/generate-timetable", data);
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        toast({
          title: "Success",
          description: "Timetable generated successfully",
        });
        
        // Convert API response to our UI format and update timetable
        if (data.timetable && Array.isArray(data.timetable)) {
          const newTimetable = convertApiTimetableToUiFormat(data.timetable);
          setTimetable(newTimetable);
        }
        
        setIsGenerateDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to generate timetable",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate timetable",
        variant: "destructive",
      });
    },
  });
  
  // Add and remove fields for dynamic form
  const addCourse = () => {
    const courses = form.getValues().courses;
    form.setValue("courses", [
      ...courses, 
      { id: "", name: "", lectureCount: "1", hasLab: false, labCount: "0" }
    ]);
  };
  
  const removeCourse = (index: number) => {
    const courses = form.getValues().courses;
    form.setValue("courses", courses.filter((_, i) => i !== index));
  };
  
  const addFaculty = () => {
    const faculty = form.getValues().faculty;
    form.setValue("faculty", [...faculty, { id: "", name: "" }]);
  };
  
  const removeFaculty = (index: number) => {
    const faculty = form.getValues().faculty;
    form.setValue("faculty", faculty.filter((_, i) => i !== index));
  };
  
  const addRoom = () => {
    const rooms = form.getValues().rooms;
    form.setValue("rooms", [...rooms, { id: "", name: "", capacity: "30", type: "Lecture" }]);
  };
  
  const removeRoom = (index: number) => {
    const rooms = form.getValues().rooms;
    form.setValue("rooms", rooms.filter((_, i) => i !== index));
  };
  
  const onSubmit = (data: TimetableGeneratorFormValues) => {
    generateTimetableMutation.mutate(data);
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case "class":
        return "bg-primary-100 border-primary-500 text-primary-800";
      case "lab":
        return "bg-amber-100 border-amber-500 text-amber-800";
      case "other":
        return "bg-emerald-100 border-emerald-500 text-emerald-800";
      default:
        return "bg-gray-100";
    }
  };

  const handleDownloadTimetable = () => {
    // Create a hidden canvas element to render the timetable
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Set background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add title
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('SyncroPlan Academic Timetable', canvas.width / 2, 50);
      
      // Add day of week if in day view
      if (activeView === 'day') {
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`${selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}`, canvas.width / 2, 80);
      }
      
      // Create a table structure for the timetable
      const startY = 120;
      const rowHeight = 50;
      const colWidth = 200;
      
      // Draw table headers
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#333333';
      
      // Time column
      ctx.fillRect(0, startY, colWidth, rowHeight);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Time', colWidth / 2, startY + 30);
      
      // Day columns (only relevant days in day view)
      if (activeView === 'day') {
        ctx.fillStyle = '#333333';
        ctx.fillRect(colWidth, startY, colWidth, rowHeight);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1), colWidth + colWidth / 2, startY + 30);
      } else {
        days.forEach((day, index) => {
          ctx.fillStyle = '#333333';
          ctx.fillRect(colWidth * (index + 1), startY, colWidth, rowHeight);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(day.charAt(0).toUpperCase() + day.slice(1), colWidth * (index + 1) + colWidth / 2, startY + 30);
        });
      }
      
      // Draw time slots and entries
      timetable.forEach((slot, slotIndex) => {
        const y = startY + (slotIndex + 1) * rowHeight;
        
        // Time column
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, y, colWidth, rowHeight);
        ctx.fillStyle = '#333333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(slot.time, colWidth / 2, y + 30);
        
        // Entry columns
        if (activeView === 'day') {
          // In day view, only show the selected day
          const entry = slot[selectedDay as keyof TimeSlot] as Entry | undefined;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(colWidth, y, colWidth, rowHeight);
          
          if (entry) {
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(entry.title, colWidth + colWidth / 2, y + 20);
            
            ctx.font = '12px Arial';
            ctx.fillText(entry.location, colWidth + colWidth / 2, y + 40);
          }
        } else {
          // In week view, show all days
          days.forEach((day, dayIndex) => {
            const entry = slot[day as keyof TimeSlot] as Entry | undefined;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(colWidth * (dayIndex + 1), y, colWidth, rowHeight);
            
            if (entry) {
              ctx.fillStyle = '#333333';
              ctx.font = 'bold 12px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(entry.title, colWidth * (dayIndex + 1) + colWidth / 2, y + 20);
              
              ctx.font = '12px Arial';
              ctx.fillText(entry.location, colWidth * (dayIndex + 1) + colWidth / 2, y + 40);
            }
          });
        }
      });
      
      // Convert the canvas to a data URL
      const dataURL = canvas.toDataURL('image/png');
      
      // Create a link element to trigger the download
      const downloadLink = document.createElement('a');
      downloadLink.href = dataURL;
      downloadLink.download = `SyncroPlan-Timetable-${activeView === 'day' ? selectedDay : 'week'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast({
        title: "Download Complete",
        description: "Your timetable has been downloaded as a PNG image",
      });
    } else {
      toast({
        title: "Download Failed",
        description: "Unable to generate timetable image",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            {user?.userType === "faculty" 
              ? "Timetable Generation Tool" 
              : "Your Academic Timetable"}
          </CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          {/* View controls for both student and faculty users */}
          <Tabs defaultValue={activeView} onValueChange={setActiveView}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Student-specific controls */}
          {user?.userType === "student" && (
            <Dialog open={isFetchDialogOpen} onOpenChange={setIsFetchDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Fetch Timetable
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Fetch Academic Timetable</DialogTitle>
                  <DialogDescription>
                    Select a timetable created by faculty to view your academic schedule.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  {timetablesLoading ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : timetablesError ? (
                    <div className="text-destructive text-center">
                      Failed to load timetables. Please try again.
                    </div>
                  ) : availableTimetables && availableTimetables.length > 0 ? (
                    <Select 
                      value={selectedTimetableId} 
                      onValueChange={setSelectedTimetableId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a timetable" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimetables.map((t: TimetableEntry) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name} ({new Date(t.createdAt).toLocaleDateString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No timetables available. Please ask your faculty to generate one.
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button 
                    onClick={() => {
                      if (selectedTimetableId) {
                        // Fetch the selected timetable
                        fetch(`/api/timetables/${selectedTimetableId}`, {
                          credentials: 'include'
                        })
                          .then(res => res.json())
                          .then(data => {
                            if (data && data.timetableData && Array.isArray(data.timetableData)) {
                              // Convert timetable data to UI format
                              const newTimetable = convertApiTimetableToUiFormat(data.timetableData);
                              setTimetable(newTimetable);
                              
                              toast({
                                title: "Success",
                                description: `Timetable "${data.name}" loaded successfully`,
                              });
                              
                              setIsFetchDialogOpen(false);
                            } else {
                              toast({
                                title: "Error",
                                description: "Invalid timetable data format",
                                variant: "destructive",
                              });
                            }
                          })
                          .catch(err => {
                            toast({
                              title: "Error",
                              description: "Failed to fetch timetable",
                              variant: "destructive",
                            });
                            console.error("Error fetching timetable:", err);
                          });
                      } else {
                        toast({
                          title: "Error",
                          description: "Please select a timetable",
                          variant: "destructive",
                        });
                      }
                    }} 
                    disabled={!selectedTimetableId || timetablesLoading}
                  >
                    Load Timetable
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {/* Download button available for all users */}
          <Button variant="outline" size="sm" onClick={handleDownloadTimetable}>
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
          
          {/* Faculty-specific controls */}
          {user?.userType === "faculty" && (
            <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Generate New Timetable</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Generate a New Timetable</DialogTitle>
                  <DialogDescription>
                    Enter the courses, faculty, and rooms information to generate an optimal timetable
                    using constraint satisfaction and genetic algorithms.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Courses Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Courses</h3>
                      
                      {form.watch("courses").map((_, index) => (
                        <div key={index} className="p-4 border rounded-md space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Course {index + 1}</h4>
                            {index > 0 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeCourse(index)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`courses.${index}.id`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Course ID</FormLabel>
                                  <FormControl>
                                    <Input placeholder="CS101" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`courses.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Course Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Introduction to Computer Science" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`courses.${index}.lectureCount`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Lecture Count</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`courses.${index}.hasLab`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-end space-x-2">
                                  <FormControl>
                                    <Checkbox 
                                      checked={field.value} 
                                      onCheckedChange={field.onChange} 
                                    />
                                  </FormControl>
                                  <FormLabel>Has Lab Component</FormLabel>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {form.watch(`courses.${index}.hasLab`) && (
                              <FormField
                                control={form.control}
                                name={`courses.${index}.labCount`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Lab Sessions</FormLabel>
                                    <FormControl>
                                      <Input type="number" min="1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <Button type="button" variant="outline" onClick={addCourse}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Course
                      </Button>
                    </div>
                    
                    {/* Faculty Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Faculty</h3>
                      
                      {form.watch("faculty").map((_, index) => (
                        <div key={index} className="p-4 border rounded-md space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Faculty Member {index + 1}</h4>
                            {index > 0 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeFaculty(index)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`faculty.${index}.id`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Faculty ID</FormLabel>
                                  <FormControl>
                                    <Input placeholder="F1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`faculty.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Dr. John Smith" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button type="button" variant="outline" onClick={addFaculty}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Faculty
                      </Button>
                    </div>
                    
                    {/* Rooms Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Rooms</h3>
                      
                      {form.watch("rooms").map((_, index) => (
                        <div key={index} className="p-4 border rounded-md space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Room {index + 1}</h4>
                            {index > 0 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeRoom(index)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`rooms.${index}.id`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Room ID</FormLabel>
                                  <FormControl>
                                    <Input placeholder="R1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`rooms.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Room Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Room 101" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`rooms.${index}.capacity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Capacity</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`rooms.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Room Type</FormLabel>
                                  <FormControl>
                                    <select 
                                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                                      value={field.value}
                                      onChange={field.onChange}
                                    >
                                      <option value="Lecture">Lecture</option>
                                      <option value="Lab">Lab</option>
                                    </select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button type="button" variant="outline" onClick={addRoom}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Room
                      </Button>
                    </div>
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        type="submit"
                        disabled={generateTimetableMutation.isPending}
                      >
                        {generateTimetableMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          'Generate Timetable'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {user?.userType === "faculty" ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h3 className="text-md font-medium text-blue-700">CSV Import/Export Instructions</h3>
              <p className="text-sm text-blue-600 mt-1">
                Upload CSV files to quickly import data or use the form above for manual entry:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-600 mt-2 space-y-1">
                <li>courses.csv: id,name,lecture_count,has_lab,lab_count</li>
                <li>faculty.csv: id,name,specialization</li>
                <li>rooms.csv: id,name,capacity,type</li>
                <li>students.csv: id,name,program,batch</li>
                <li>lectures.csv: course_id,faculty_id,room_id,day,time</li>
                <li>labs.csv: course_id,faculty_id,room_id,day,time</li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white shadow rounded-lg">
              <div>
                <h3 className="text-md font-medium mb-3">Upload CSV Files</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Courses</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleFileChange('courses')}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary-50 file:text-primary-700
                          hover:file:bg-primary-100"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleFileUpload('courses')}
                      >
                        Upload
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="file" 
                        accept=".csv"
                        onChange={handleFileChange('faculty')} 
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary-50 file:text-primary-700
                          hover:file:bg-primary-100"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleFileUpload('faculty')}
                      >
                        Upload
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="file" 
                        accept=".csv"
                        onChange={handleFileChange('rooms')}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary-50 file:text-primary-700
                          hover:file:bg-primary-100"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleFileUpload('rooms')}
                      >
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-3">Additional Data</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Students</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="file" 
                        accept=".csv"
                        onChange={handleFileChange('students')}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary-50 file:text-primary-700
                          hover:file:bg-primary-100"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleFileUpload('students')}
                      >
                        Upload
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lectures</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="file" 
                        accept=".csv"
                        onChange={handleFileChange('lectures')}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary-50 file:text-primary-700
                          hover:file:bg-primary-100"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleFileUpload('lectures')}
                      >
                        Upload
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Labs</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="file" 
                        accept=".csv"
                        onChange={handleFileChange('labs')} 
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary-50 file:text-primary-700
                          hover:file:bg-primary-100"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleFileUpload('labs')}
                      >
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline"
                  onClick={resetCSVFiles}
                >
                  Reset All
                </Button>
                <Button 
                  onClick={generateTimetableFromCSV}
                  disabled={!csvFiles.courses || !csvFiles.faculty || !csvFiles.rooms}
                >
                  Generate Timetable from CSV
                </Button>
              </div>
            </div>
            
            {timetable && timetable.length > 0 && (
              <div className="overflow-x-auto">
                <h3 className="text-md font-medium mb-3">Generated Timetable Preview</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border bg-gray-50 font-medium text-sm"></th>
                      {days.map((day) => (
                        <th key={day} className="p-2 border bg-gray-50 font-medium text-sm capitalize">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timetable.map((slot, index) => (
                      <tr key={index}>
                        <td className="p-2 border font-medium text-sm">{slot.time}</td>
                        {days.map((day) => {
                          const entry = slot[day as keyof TimeSlot] as Entry | undefined;
                          return (
                            <td key={day} className="p-1 border h-20 align-top">
                              {entry && (
                                <div className={`p-1 rounded border-l-4 text-sm h-full flex flex-col ${getEntryColor(entry.type)}`}>
                                  <div className="font-medium">{entry.title}</div>
                                  <div className="text-xs mt-1">{entry.location}</div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          // Student view - show the timetable directly
          <>
            {/* Day View */}
            {activeView === "day" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium capitalize">{selectedDay} Schedule</h3>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map(day => (
                        <SelectItem key={day} value={day}>
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  {timetable.map((slot, index) => {
                    const entry = slot[selectedDay as keyof TimeSlot] as Entry | undefined;
                    return (
                      <div key={index} className="border rounded-md p-3 flex">
                        <div className="w-32 font-medium">{slot.time}</div>
                        {entry ? (
                          <div className={`flex-1 p-2 border-l-4 rounded ${getEntryColor(entry.type)}`}>
                            <div className="font-medium">{entry.title}</div>
                            <div className="text-xs">{entry.location}</div>
                          </div>
                        ) : (
                          <div className="flex-1 p-2 text-gray-400 italic">No scheduled activity</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Week View */}
            {activeView === "week" && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border bg-gray-50 font-medium text-sm"></th>
                      {days.map((day) => (
                        <th key={day} className="p-2 border bg-gray-50 font-medium text-sm capitalize">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timetable.map((slot, index) => (
                      <tr key={index}>
                        <td className="p-2 border font-medium text-sm">{slot.time}</td>
                        {days.map((day) => {
                          const entry = slot[day as keyof TimeSlot] as Entry | undefined;
                          return (
                            <td key={day} className="p-1 border h-20 align-top">
                              {entry && (
                                <div className={`p-1 rounded border-l-4 text-sm h-full flex flex-col ${getEntryColor(entry.type)}`}>
                                  <div className="font-medium">{entry.title}</div>
                                  <div className="text-xs mt-1">{entry.location}</div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Month View */}
            {activeView === "month" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Monthly Schedule</h3>
                
                <div className="grid grid-cols-7 gap-1">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                    <div key={day} className="text-center font-medium p-2 bg-gray-100">
                      {day}
                    </div>
                  ))}
                  
                  {/* Generate a simple monthly calendar */}
                  {Array.from({ length: 35 }, (_, i) => {
                    const isWeekend = i % 7 >= 5; // Saturday or Sunday
                    const dayNumber = i + 1;
                    const isCurrentMonth = dayNumber <= 30; // Simple 30-day month
                    
                    return (
                      <div 
                        key={i} 
                        className={`p-2 min-h-[100px] border ${isWeekend ? 'bg-gray-50' : ''} ${!isCurrentMonth ? 'text-gray-300' : ''}`}
                      >
                        <div className="font-medium mb-1">{isCurrentMonth ? dayNumber : ''}</div>
                        {isCurrentMonth && !isWeekend && dayNumber <= 20 ? ( // Random events for the first 20 days (excluding weekends)
                          <div className="text-xs space-y-1">
                            {dayNumber % 5 === 0 && (
                              <div className="bg-primary-100 text-primary-900 p-1 rounded">
                                Classes scheduled
                              </div>
                            )}
                            {dayNumber % 7 === 0 && (
                              <div className="bg-amber-100 text-amber-900 p-1 rounded">
                                Lab sessions
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="text-sm text-yellow-700">
                    This is a preview of the monthly calendar view. In the future, this will display your actual schedule for the month.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
