import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { spawn } from "child_process";
import path from "path";
import multer from "multer";
import fs from "fs";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get current file path and directory for ES modules (replacement for __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Serve the test login page
  app.get("/test-login", (req, res) => {
    res.sendFile(path.resolve("test-login.html"));
  });

  // Waitlist API endpoint
  app.post("/api/waitlist", async (req, res) => {
    const { fullName, email, userType, updates } = req.body;
    
    try {
      await storage.addToWaitlist({
        fullName,
        email,
        userType,
        updates,
        createdAt: new Date()
      });
      
      res.status(201).json({ message: "Successfully added to waitlist" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add to waitlist" });
    }
  });

  // Contact form API endpoint
  app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;
    
    try {
      await storage.saveContactMessage({
        name,
        email,
        subject,
        message,
        createdAt: new Date()
      });
      
      res.status(201).json({ message: "Message received" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Tasks API endpoints
  app.get("/api/tasks", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userId = req.user?.id;
    const tasks = storage.getTasksByUserId(userId);
    res.json(tasks);
  });

  app.post("/api/tasks", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userId = req.user?.id;
    const task = {
      ...req.body,
      userId,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    storage.createTask(task);
    res.status(201).json(task);
  });

  app.put("/api/tasks/:id", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const taskId = req.params.id;
    const userId = req.user?.id;
    const existingTask = storage.getTaskById(taskId);
    
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    if (existingTask.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    const updatedTask = {
      ...existingTask,
      ...req.body,
      id: taskId,
      userId
    };
    
    storage.updateTask(updatedTask);
    res.json(updatedTask);
  });

  app.delete("/api/tasks/:id", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const taskId = req.params.id;
    const userId = req.user?.id;
    const existingTask = storage.getTaskById(taskId);
    
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    if (existingTask.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    storage.deleteTask(taskId);
    res.status(204).send();
  });

  // Set up multer storage for CSV file uploads
  const csvStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Create a temporary directory for CSV uploads if it doesn't exist
      const uploadsDir = path.join(__dirname, '../uploads');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      // Rename the file to include the timestamp to avoid name conflicts
      const timestamp = Date.now();
      cb(null, `${file.fieldname}-${timestamp}.csv`);
    }
  });
  
  const csvUpload = multer({ 
    storage: csvStorage,
    fileFilter: (req, file, cb) => {
      // Accept only CSV files
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed'));
      }
    }
  });
  
  // CSV file upload and timetable generation endpoint
  app.post('/api/generate-timetable-csv', csvUpload.fields([
    { name: 'courses', maxCount: 1 },
    { name: 'faculty', maxCount: 1 },
    { name: 'rooms', maxCount: 1 },
    { name: 'students', maxCount: 1 },
    { name: 'lectures', maxCount: 1 },
    { name: 'labs', maxCount: 1 },
    { name: 'optimized_timetable', maxCount: 1 }
  ]), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Check if user is faculty
    if (req.user?.userType !== "faculty") {
      return res.status(403).json({ 
        message: "Access denied. Timetable generation is available only for faculty members." 
      });
    }
    
    // Check if required CSV files are uploaded
    if (!req.files || !Object.keys(req.files).length) {
      return res.status(400).json({ 
        status: "error",
        message: "No CSV files were uploaded" 
      });
    }
    
    const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Check for required files
    const requiredFiles = ['courses', 'faculty', 'rooms'];
    const missingFiles = requiredFiles.filter(
      file => !uploadedFiles[file] || !uploadedFiles[file].length
    );
    
    if (missingFiles.length) {
      return res.status(400).json({
        status: "error",
        message: `Missing required CSV files: ${missingFiles.join(', ')}`
      });
    }
    
    try {
      // Read the uploaded CSV files
      const readFile = promisify(fs.readFile);
      const filesContent: { [key: string]: string } = {};
      
      for (const [key, files] of Object.entries(uploadedFiles)) {
        if (files && files.length) {
          const fileContent = await readFile(files[0].path, 'utf8');
          filesContent[key] = fileContent;
        }
      }
      
      // Execute the Python script as a separate process
      const pythonProcess = spawn("python3", ["./server/timetable-generator.py"]);
      
      // Prepare the input data for the Python script
      const inputData = {
        csvData: filesContent
      };
      
      let resultData = "";
      let errorData = "";
      
      // Send input data to the Python process
      pythonProcess.stdin.write(JSON.stringify(inputData));
      pythonProcess.stdin.end();
      
      // Collect output from the Python process
      pythonProcess.stdout.on("data", (data) => {
        resultData += data.toString();
        console.log("Python process output:", data.toString());
      });
      
      pythonProcess.stderr.on("data", (data) => {
        errorData += data.toString();
        console.error("Python process error:", data.toString());
      });
      
      // Handle process completion
      pythonProcess.on("close", (code) => {
        console.log(`Python process exited with code ${code}`);
        
        // Clean up uploaded files
        Object.values(uploadedFiles).flat().forEach(file => {
          fs.unlink(file.path, (err) => {
            if (err) console.error(`Error deleting file ${file.path}:`, err);
          });
        });
        
        if (code !== 0) {
          console.error(`Error: ${errorData}`);
          return res.status(500).json({ 
            status: "error", 
            message: "Error generating timetable", 
            error: errorData 
          });
        }
        
        try {
          // Parse the output from Python - use only the last line which should contain the JSON
          const lines = resultData.trim().split('\n');
          const jsonOutput = lines[lines.length - 1];
          
          const result = JSON.parse(jsonOutput);
          console.log("Successfully parsed Python output");
          
          // If timetable generation was successful, automatically save it
          if (result.status === "success" && result.timetable && Array.isArray(result.timetable)) {
            const timetableName = `Generated CSV Timetable ${new Date().toLocaleString()}`;
            
            storage.saveTimetable(timetableName, result.timetable, req.user.id)
              .then(savedTimetable => {
                // Include the saved timetable info in the response
                result.savedTimetable = {
                  id: savedTimetable.id,
                  name: savedTimetable.name
                };
                res.json(result);
              })
              .catch(saveError => {
                console.error("Error saving timetable from CSV:", saveError);
                // Still return the generated timetable even if saving failed
                res.json({
                  ...result,
                  saveError: "Timetable was generated but could not be saved"
                });
              });
          } else {
            // Pass the result directly to the client if there's no timetable data
            res.json(result);
          }
        } catch (e) {
          console.error("Error parsing Python output:", e);
          console.error("Raw output:", resultData);
          res.status(500).json({ 
            status: "error", 
            message: "Error processing timetable data" 
          });
        }
      });
    } catch (error) {
      console.error("Error handling CSV files:", error);
      res.status(500).json({
        status: "error",
        message: error instanceof Error ? error.message : "Error processing CSV files"
      });
    }
  });

  // API endpoints for timetable storage and retrieval
  app.post("/api/save-timetable", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Check if user is faculty
    if (req.user?.userType !== "faculty") {
      return res.status(403).json({ 
        message: "Access denied. Timetable saving is available only for faculty members." 
      });
    }
    
    const { name, timetableData } = req.body;
    
    if (!name || !timetableData || !Array.isArray(timetableData)) {
      return res.status(400).json({ 
        message: "Invalid timetable data. Name and timetable data array are required." 
      });
    }
    
    storage.saveTimetable(name, timetableData, req.user.id)
      .then(timetable => {
        res.status(201).json({ 
          message: "Timetable saved successfully", 
          timetable 
        });
      })
      .catch(error => {
        res.status(500).json({ 
          message: "Failed to save timetable", 
          error: error.message 
        });
      });
  });
  
  app.get("/api/timetables", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Students can see all timetables, faculty only see their own
    const promise = req.user.userType === "faculty" 
      ? storage.getTimetablesByFaculty(req.user.id)
      : storage.getAllTimetables();
      
    promise
      .then(timetables => {
        res.json(timetables);
      })
      .catch(error => {
        res.status(500).json({ 
          message: "Failed to fetch timetables", 
          error: error.message 
        });
      });
  });
  
  app.get("/api/timetables/:id", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const timetableId = req.params.id;
    
    storage.getTimetableById(timetableId)
      .then(timetable => {
        if (!timetable) {
          return res.status(404).json({ message: "Timetable not found" });
        }
        
        // If user is faculty, ensure they own the timetable
        if (req.user.userType === "faculty" && timetable.createdBy !== req.user.id) {
          return res.status(403).json({ message: "Access denied. You don't have permission to view this timetable." });
        }
        
        res.json(timetable);
      })
      .catch(error => {
        res.status(500).json({ 
          message: "Failed to fetch timetable", 
          error: error.message 
        });
      });
  });

  // Timetable Generation API endpoint (non-CSV version)
  app.post("/api/generate-timetable", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Check if user is faculty
    if (req.user?.userType !== "faculty") {
      return res.status(403).json({ 
        message: "Access denied. Timetable generation is available only for faculty members." 
      });
    }
    
    // Log input data for debugging
    console.log("Generating timetable with input data:", JSON.stringify(req.body));
    
    // Execute the Python script as a separate process
    const pythonProcess = spawn("python3", ["./server/timetable-generator.py"]);
    
    // Set up input data
    const inputData = req.body;
    
    let resultData = "";
    let errorData = "";
    
    // Send input data to the Python process
    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();
    
    // Collect output from the Python process
    pythonProcess.stdout.on("data", (data) => {
      resultData += data.toString();
      console.log("Python process output:", data.toString());
    });
    
    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
      console.error("Python process error:", data.toString());
    });
    
    // Handle process completion
    pythonProcess.on("close", (code) => {
      console.log(`Python process exited with code ${code}`);
      
      if (code !== 0) {
        console.error(`Error: ${errorData}`);
        return res.status(500).json({ 
          status: "error", 
          message: "Error generating timetable", 
          error: errorData 
        });
      }
      
      try {
        // Parse the output from Python - use only the last line which should contain the JSON
        const lines = resultData.trim().split('\n');
        const jsonOutput = lines[lines.length - 1];
        
        const result = JSON.parse(jsonOutput);
        console.log("Successfully parsed Python output");
        
        // If timetable generation was successful, automatically save it
        if (result.status === "success" && result.timetable && Array.isArray(result.timetable)) {
          const timetableName = `Generated Timetable ${new Date().toLocaleString()}`;
          
          storage.saveTimetable(timetableName, result.timetable, req.user.id)
            .then(savedTimetable => {
              // Include the saved timetable info in the response
              result.savedTimetable = {
                id: savedTimetable.id,
                name: savedTimetable.name
              };
              res.json(result);
            })
            .catch(saveError => {
              console.error("Error saving timetable:", saveError);
              // Still return the generated timetable even if saving failed
              res.json({
                ...result,
                saveError: "Timetable was generated but could not be saved"
              });
            });
        } else {
          // Pass the result directly to the client if there's no timetable data
          res.json(result);
        }
      } catch (e) {
        console.error("Error parsing Python output:", e);
        console.error("Raw output:", resultData);
        res.status(500).json({ 
          status: "error", 
          message: "Error processing timetable data" 
        });
      }
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
