import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Calendar, Clock, Edit, Trash2 } from "lucide-react";
import { AddTaskModal } from "./add-task-modal";

type Task = {
  id: string;
  name: string;
  date: string;
  time: string;
  duration: string;
  reminder: boolean;
  status: "pending" | "ongoing" | "completed";
};

// Empty initial tasks list - let users add their own tasks
const initialTasks: Task[] = [];

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTab, setActiveTab] = useState("all");
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const filterTasks = (status?: string) => {
    if (status === "all") return tasks;
    return tasks.filter(task => task.status === status);
  };

  const handleTaskStatusChange = (taskId: string, checked: boolean) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: checked ? "completed" : "pending" } 
        : task
    ));
  };

  const handleAddTask = (newTask: Omit<Task, "id">) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
    };
    setTasks([...tasks, task]);
    setIsAddTaskModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-amber-100 text-amber-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Task Manager</CardTitle>
          <Button onClick={() => setIsAddTaskModalOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="space-y-4">
            {filterTasks(activeTab).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tasks found in this category
              </div>
            ) : (
              filterTasks(activeTab).map(task => (
                <div key={task.id} className="flex items-start justify-between p-4 border rounded-lg bg-white">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      checked={task.status === "completed"}
                      onCheckedChange={(checked) => handleTaskStatusChange(task.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div>
                      <h3 className={`font-medium ${task.status === "completed" ? "line-through text-gray-500" : ""}`}>
                        {task.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {task.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {task.time} ({task.duration})
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(task.status)} variant="outline">
                      {task.status}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AddTaskModal 
        isOpen={isAddTaskModalOpen} 
        onClose={() => setIsAddTaskModalOpen(false)} 
        onAddTask={handleAddTask}
      />
    </>
  );
}
