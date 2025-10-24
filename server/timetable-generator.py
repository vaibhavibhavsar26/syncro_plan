import json
import sys
import pandas as pd
from ortools.sat.python import cp_model
import random
import numpy as np

def generate_timetable(input_data):
    """
    Generate a timetable using CSP and GA algorithms
    
    Args:
        input_data: Dictionary containing:
            - courses: List of courses
            - faculty: List of faculty
            - rooms: List of rooms
            - lectures: List of lectures
            - labs: List of labs
            - students: List of students
            - use_provided_timetable: Whether to use provided timetable
            - provided_timetable: Provided timetable data
    
    Returns:
        An optimized timetable
    """
    try:
        # Check if we should use provided timetable format directly
        if input_data.get('use_provided_timetable', False) and 'provided_timetable' in input_data:
            print("Using provided timetable format")
            
            # Format the provided timetable data to match our expected output format
            timetable_results = []
            provided_data = input_data['provided_timetable']
            
            for entry in provided_data:
                # Extract data from entry
                course_id = entry.get("CourseID", "")
                time_slot = entry.get("TimeSlot", "")
                faculty_id = entry.get("FacultyID", "")
                room_id = entry.get("RoomID", "")
                entry_type = entry.get("Type", "Lecture")
                
                # Map day abbreviations to full names
                day_mapping = {
                    "Mon": "Monday",
                    "Tue": "Tuesday",
                    "Wed": "Wednesday",
                    "Thu": "Thursday",
                    "Fri": "Friday"
                }
                
                # Process time slot format (e.g., "Mon 9-10" to "Monday 9:00-10:00")
                parts = time_slot.split()
                if len(parts) == 2:
                    day_abbr, time_range = parts
                    day = day_mapping.get(day_abbr, day_abbr)
                    
                    # Parse time range (e.g., "9-10" to "9:00-10:00")
                    times = time_range.split('-')
                    if len(times) == 2:
                        start, end = times
                        formatted_time = f"{start}:00-{end}:00"
                        formatted_time_slot = f"{day} {formatted_time}"
                    else:
                        formatted_time_slot = time_slot
                else:
                    formatted_time_slot = time_slot
                
                # Find course name
                course_name = "Unknown Course"
                for course in input_data.get('courses', []):
                    if course.get('id') == course_id:
                        course_name = course.get('name', "Unknown Course")
                        break
                
                # Find faculty name
                faculty_name = "Unknown Faculty"
                for faculty in input_data.get('faculty', []):
                    if faculty.get('id') == faculty_id:
                        faculty_name = faculty.get('name', "Unknown Faculty")
                        break
                
                # Find room name
                room_name = f"Room {room_id}"
                for room in input_data.get('rooms', []):
                    if room.get('id') == room_id:
                        room_name = room.get('name', f"Room {room_id}")
                        break
                
                # Add formatted entry to results
                timetable_results.append({
                    "courseId": course_id,
                    "courseName": course_name,
                    "timeSlot": formatted_time_slot,
                    "facultyId": faculty_id,
                    "facultyName": faculty_name,
                    "roomId": room_id,
                    "roomName": room_name,
                    "type": entry_type
                })
            
            return {
                "status": "success",
                "message": "Timetable generated successfully from provided format",
                "timetable": timetable_results
            }
        
        # Extract data from input for normal generation
        courses_data = input_data.get('courses', [])
        faculty_data = input_data.get('faculty', [])
        rooms_data = input_data.get('rooms', [])
        lectures_data = input_data.get('lectures', [])
        labs_data = input_data.get('labs', [])
        
        print(f"Received courses_data: {courses_data}")
        print(f"Received faculty_data: {faculty_data}")
        print(f"Received rooms_data: {rooms_data}")
        print(f"Received lectures_data: {lectures_data}")
        print(f"Received labs_data: {labs_data}")
        
        # Create a timetable based on the provided CSV files
        # This approach uses the lectures.csv and labs.csv directly
        if lectures_data or labs_data:
            print("Generating timetable from lectures and labs CSV data")
            timetable_results = []
            
            # Process lectures
            for lecture in lectures_data:
                course_id = lecture.get('courseId', '')
                faculty_id = lecture.get('facultyId', '')
                room_id = lecture.get('roomId', '')
                
                # Find course name
                course_name = "Unknown Course"
                for course in courses_data:
                    if course.get('id') == course_id:
                        course_name = course.get('name', "Unknown Course")
                        break
                
                # Find faculty name
                faculty_name = "Unknown Faculty"
                for faculty in faculty_data:
                    if faculty.get('id') == faculty_id:
                        faculty_name = faculty.get('name', "Unknown Faculty")
                        break
                
                # Find room name
                room_name = f"Room {room_id}"
                for room in rooms_data:
                    if room.get('id') == room_id:
                        room_name = room.get('name', f"Room {room_id}")
                        break
                
                # Assign a time slot (simplified allocation)
                day_options = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
                time_options = ["9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "14:00-15:00", "15:00-16:00"]
                time_slot = f"{random.choice(day_options)} {random.choice(time_options)}"
                
                timetable_results.append({
                    "courseId": course_id,
                    "courseName": course_name,
                    "timeSlot": time_slot,
                    "facultyId": faculty_id,
                    "facultyName": faculty_name,
                    "roomId": room_id,
                    "roomName": room_name,
                    "type": "Lecture"
                })
            
            # Process labs
            for lab in labs_data:
                course_id = lab.get('courseId', '')
                faculty_id = lab.get('facultyId', '')
                room_id = lab.get('roomId', '')
                
                # Find course name
                course_name = "Unknown Course"
                for course in courses_data:
                    if course.get('id') == course_id:
                        course_name = course.get('name', "Unknown Course")
                        break
                
                # Find faculty name
                faculty_name = "Unknown Faculty"
                for faculty in faculty_data:
                    if faculty.get('id') == faculty_id:
                        faculty_name = faculty.get('name', "Unknown Faculty")
                        break
                
                # Find room name
                room_name = f"Room {room_id}"
                for room in rooms_data:
                    if room.get('id') == room_id:
                        room_name = room.get('name', f"Room {room_id}")
                        break
                
                # Assign a time slot (simplified allocation)
                day_options = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
                time_options = ["9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "14:00-15:00", "15:00-16:00"]
                time_slot = f"{random.choice(day_options)} {random.choice(time_options)}"
                
                timetable_results.append({
                    "courseId": course_id,
                    "courseName": course_name,
                    "timeSlot": time_slot,
                    "facultyId": faculty_id,
                    "facultyName": faculty_name,
                    "roomId": room_id,
                    "roomName": room_name,
                    "type": "Lab"
                })
            
            # Genetic Algorithm Optimization to avoid conflicts
            if len(timetable_results) > 0:
                # Convert to dataframes for optimization
                try:
                    courses = pd.DataFrame(courses_data)
                    faculty = pd.DataFrame(faculty_data)
                    rooms = pd.DataFrame(rooms_data)
                    
                    # Define available time slots
                    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
                    time_slots = ["9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "14:00-15:00", "15:00-16:00"]
                    available_slots = [f"{day} {slot}" for day in days for slot in time_slots]
                    
                    optimized_schedule = genetic_algorithm_optimize(timetable_results, faculty, rooms, available_slots)
                    timetable_results = optimized_schedule
                except Exception as opt_error:
                    print(f"Error during optimization: {str(opt_error)}")
                    # Continue with unoptimized schedule if optimization fails
            
            return {
                "status": "success",
                "message": "Timetable generated successfully from CSV data",
                "timetable": timetable_results
            }
        
        # Standard timetable generation using CP-SAT and GA if no direct data is available
        # Ensure data types are correct
        for course in courses_data:
            # Convert lectureCount to int
            if 'lectureCount' in course and not isinstance(course['lectureCount'], int):
                try:
                    course['lectureCount'] = int(course['lectureCount'])
                except (ValueError, TypeError):
                    course['lectureCount'] = 1
            
            # Ensure hasLab is boolean
            if 'hasLab' in course and not isinstance(course['hasLab'], bool):
                course['hasLab'] = bool(course['hasLab'])
            
            # Convert labCount to int if hasLab is True
            if course.get('hasLab', False) and 'labCount' in course and not isinstance(course['labCount'], int):
                try:
                    course['labCount'] = int(course['labCount'])
                except (ValueError, TypeError):
                    course['labCount'] = 1
        
        for room in rooms_data:
            # Convert capacity to int
            if 'capacity' in room and not isinstance(room['capacity'], int):
                try:
                    room['capacity'] = int(room['capacity'])
                except (ValueError, TypeError):
                    room['capacity'] = 30
        
        # Convert to dataframes
        courses = pd.DataFrame(courses_data)
        faculty = pd.DataFrame(faculty_data)
        rooms = pd.DataFrame(rooms_data)
        
        print("Data conversion successful")
        
        # Generate sessions (lectures and labs)
        sessions = []
        for _, course in courses.iterrows():
            course_id = course["id"]
            course_name = course["name"]
            
            # Add lecture sessions
            for i in range(int(course.get("lectureCount", 1))):
                sessions.append({
                    "courseId": course_id,
                    "courseName": course_name,
                    "facultyId": None,  # To be assigned
                    "roomId": None,     # To be assigned
                    "type": "Lecture"
                })
            
            # Add lab sessions if applicable
            if course.get("hasLab", False):
                for i in range(int(course.get("labCount", 1))):
                    sessions.append({
                        "courseId": course_id,
                        "courseName": course_name,
                        "facultyId": None,  # To be assigned
                        "roomId": None,     # To be assigned
                        "type": "Lab"
                    })
        
        sessions_df = pd.DataFrame(sessions)
        
        # Define available time slots
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        time_slots = ["9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "14:00-15:00", "15:00-16:00"]
        available_slots = [f"{day} {slot}" for day in days for slot in time_slots]
        
        # CSP Model Initialization
        model = cp_model.CpModel()
        time_table = {}
        
        # Assign faculty and rooms based on lectures/labs data if available
        faculty_assignments = {}
        room_assignments = {}
        
        # Use lectures data to guide assignments
        for lecture in lectures_data:
            course_id = lecture.get('courseId', '')
            faculty_id = lecture.get('facultyId', '')
            room_id = lecture.get('roomId', '')
            
            if course_id and faculty_id:
                faculty_assignments[course_id] = faculty_id
            
            if course_id and room_id:
                room_assignments[course_id] = room_id
        
        # Assign faculty and rooms
        for i, row in sessions_df.iterrows():
            course_id = row["courseId"]
            session_type = row["type"]
            
            # Select faculty based on assignments or randomly
            if course_id in faculty_assignments:
                faculty_id = faculty_assignments[course_id]
            else:
                eligible_faculty = faculty["id"].tolist()
                faculty_id = random.choice(eligible_faculty) if eligible_faculty else None
            
            # Select room based on assignments or randomly
            if course_id in room_assignments:
                room_id = room_assignments[course_id]
            else:
                # For random selection, prefer rooms of appropriate type
                if session_type == "Lab":
                    eligible_rooms = rooms[rooms.get("type", "Lecture") == "Lab"]["id"].tolist()
                    if not eligible_rooms:  # Fallback to all rooms if no labs
                        eligible_rooms = rooms["id"].tolist()
                else:
                    eligible_rooms = rooms[rooms.get("type", "Lecture") == "Lecture"]["id"].tolist()
                    if not eligible_rooms:  # Fallback to all rooms if no lecture rooms
                        eligible_rooms = rooms["id"].tolist()
                
                room_id = random.choice(eligible_rooms) if eligible_rooms else None
            
            # Create variable for this session
            var = model.NewIntVar(0, len(available_slots) - 1, f"slot_{course_id}_{i}")
            time_table[(course_id, i)] = (var, faculty_id, room_id, session_type, row["courseName"])
        
        # Add constraints
        # 1. No faculty member can teach two sessions at the same time
        for faculty_id in faculty["id"].unique():
            faculty_sessions = [(key, var) for key, (var, fid, _, _, _) in time_table.items() if fid == faculty_id]
            for i, (key1, var1) in enumerate(faculty_sessions):
                for j, (key2, var2) in enumerate(faculty_sessions):
                    if i < j:
                        model.Add(var1 != var2)
        
        # 2. No room can be used for two sessions at the same time
        for room_id in rooms["id"].unique():
            room_sessions = [(key, var) for key, (var, _, rid, _, _) in time_table.items() if rid == room_id]
            for i, (key1, var1) in enumerate(room_sessions):
                for j, (key2, var2) in enumerate(room_sessions):
                    if i < j:
                        model.Add(var1 != var2)
        
        # 3. No student should have two classes at the same time (if student data is available)
        student_data = input_data.get('students', [])
        if student_data:
            # Create mapping of courses to variables
            course_to_var = {}
            for (course_id, i), (var, _, _, _, _) in time_table.items():
                if course_id not in course_to_var:
                    course_to_var[course_id] = []
                course_to_var[course_id].append(var)
            
            # Add constraints for each student's enrolled courses
            for student in student_data:
                enrolled_courses = student.get('enrolledCourses', [])
                # Get all variables for this student's courses
                student_vars = []
                for course_id in enrolled_courses:
                    if course_id in course_to_var:
                        student_vars.extend(course_to_var[course_id])
                
                # No two courses for this student should be at the same time
                for i, var1 in enumerate(student_vars):
                    for j, var2 in enumerate(student_vars):
                        if i < j:
                            model.Add(var1 != var2)
        
        # Solve CSP model
        solver = cp_model.CpSolver()
        status = solver.Solve(model)
        
        # Process results
        timetable_results = []
        if status == cp_model.FEASIBLE or status == cp_model.OPTIMAL:
            for (course_id, session_idx), (var, faculty_id, room_id, session_type, course_name) in time_table.items():
                time_slot_idx = solver.Value(var)
                time_slot = available_slots[time_slot_idx]
                
                # Find faculty and room names
                faculty_name = ""
                room_name = ""
                
                if faculty_id and "id" in faculty.columns and "name" in faculty.columns:
                    faculty_row = faculty[faculty["id"] == faculty_id]
                    if not faculty_row.empty:
                        faculty_name = faculty_row.iloc[0]["name"]
                
                if room_id and "id" in rooms.columns and "name" in rooms.columns:
                    room_row = rooms[rooms["id"] == room_id]
                    if not room_row.empty:
                        room_name = room_row.iloc[0]["name"]
                
                timetable_results.append({
                    "courseId": course_id,
                    "courseName": course_name,
                    "timeSlot": time_slot,
                    "facultyId": faculty_id,
                    "facultyName": faculty_name,
                    "roomId": room_id,
                    "roomName": room_name,
                    "type": session_type
                })
        
            # Genetic Algorithm Optimization
            optimized_schedule = genetic_algorithm_optimize(timetable_results, faculty, rooms, available_slots)
            
            # Format and return the result
            return {
                "status": "success",
                "message": "Timetable generated successfully",
                "timetable": optimized_schedule
            }
        else:
            # If CSP solver couldn't find a solution, return empty timetable
            return {
                "status": "error",
                "message": "Could not generate a feasible timetable with the given constraints",
                "timetable": []
            }
    
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error generating timetable: {str(e)}"
        }

def genetic_algorithm_optimize(initial_schedule, faculty, rooms, available_slots):
    """
    Optimize the initial schedule using genetic algorithm
    
    Args:
        initial_schedule: Initial schedule from CSP
        faculty: Faculty DataFrame
        rooms: Rooms DataFrame
        available_slots: List of available time slots
    
    Returns:
        Optimized schedule
    """
    # Parameters
    POPULATION_SIZE = 30
    GENERATIONS = 50
    MUTATION_RATE = 0.1
    
    def fitness(schedule):
        """Calculate fitness score (lower is better)"""
        penalty = 0
        
        # Check for various constraints and conflicts
        for i, session1 in enumerate(schedule):
            # Check for same faculty teaching at same time
            for j, session2 in enumerate(schedule):
                if i < j:
                    if session1["timeSlot"] == session2["timeSlot"]:
                        # Same faculty conflict
                        if session1["facultyId"] == session2["facultyId"]:
                            penalty += 10
                        
                        # Same room conflict
                        if session1["roomId"] == session2["roomId"]:
                            penalty += 10
            
            # Check for back-to-back slots for faculty (small penalty)
            for j, session2 in enumerate(schedule):
                if i != j and session1["facultyId"] == session2["facultyId"]:
                    # Simple check if slots are close (not perfect but illustrative)
                    day1, time1 = session1["timeSlot"].split(" ", 1)
                    day2, time2 = session2["timeSlot"].split(" ", 1)
                    
                    if day1 == day2:
                        # If consecutive hours, small penalty
                        times = [time1, time2]
                        times.sort()
                        if times[0].split("-")[1] == times[1].split("-")[0]:
                            penalty += 1  # Small penalty for consecutive classes
        
        return -penalty  # Negative because we want to maximize fitness
    
    def mutate(schedule):
        """Mutate the schedule by changing random time slots"""
        mutated = schedule.copy()
        
        for i in range(len(mutated)):
            if random.random() < MUTATION_RATE:
                # Randomly reassign a timeslot
                mutated[i] = mutated[i].copy()
                mutated[i]["timeSlot"] = random.choice(available_slots)
        
        return mutated
    
    def crossover(parent1, parent2):
        """Crossover two parent schedules"""
        crossover_point = random.randint(1, len(parent1) - 1)
        child = parent1[:crossover_point] + parent2[crossover_point:]
        return child
    
    # Initialize population with the initial schedule and variations
    population = [initial_schedule]
    
    # Create variations for the rest of the population
    for _ in range(POPULATION_SIZE - 1):
        variation = initial_schedule.copy()
        # Randomly change some time slots
        for i in range(len(variation)):
            if random.random() < 0.3:  # 30% chance to change
                variation_item = variation[i].copy()
                variation_item["timeSlot"] = random.choice(available_slots)
                variation[i] = variation_item
        population.append(variation)
    
    # Run the genetic algorithm
    for generation in range(GENERATIONS):
        # Calculate fitness for each schedule
        fitness_scores = [fitness(schedule) for schedule in population]
        
        # Sort population by fitness
        sorted_population = [x for _, x in sorted(zip(fitness_scores, population), key=lambda pair: pair[0], reverse=True)]
        
        # Keep best schedules
        new_population = sorted_population[:5]  # Elitism - keep top 5
        
        # Create new generation
        while len(new_population) < POPULATION_SIZE:
            # Tournament selection
            tournament_size = 3
            tournament = random.sample(sorted_population[:15], tournament_size)
            parent1 = tournament[0]
            
            tournament = random.sample(sorted_population[:15], tournament_size)
            parent2 = tournament[0]
            
            # Create child through crossover and mutation
            child = crossover(parent1, parent2)
            child = mutate(child)
            
            new_population.append(child)
        
        population = new_population
    
    # Return the best schedule from the final population
    fitness_scores = [fitness(schedule) for schedule in population]
    best_schedule_idx = fitness_scores.index(max(fitness_scores))
    
    return population[best_schedule_idx]

# Parse CSV data and convert to format needed for timetable generation
def parse_csv_data(csv_data):
    """
    Parse CSV data and convert to structured format
    
    Args:
        csv_data: Dictionary containing CSV content as strings
    
    Returns:
        Dictionary with structured data for timetable generation
    """
    result = {
        "courses": [],
        "faculty": [],
        "rooms": [],
        "lectures": [],
        "labs": [],
        "students": []
    }
    
    # Helper function to parse CSV content
    def parse_csv_content(content):
        lines = content.strip().split('\n')
        if len(lines) <= 1:
            return []
        
        # Extract headers
        headers = [h.strip() for h in lines[0].split(',')]
        
        # Parse data rows
        data = []
        for line in lines[1:]:
            if not line.strip():
                continue
                
            values = [v.strip() for v in line.split(',')]
            if len(values) != len(headers):
                # Skip rows with wrong number of columns
                print(f"Warning: Skipping row with incorrect number of columns: {line}")
                continue
                
            # Create record as dictionary
            record = {}
            for i, header in enumerate(headers):
                record[header] = values[i]
            data.append(record)
            
        return data
    
    # Parse courses CSV
    if 'courses' in csv_data and csv_data['courses']:
        courses_data = parse_csv_content(csv_data['courses'])
        for course in courses_data:
            # Map CSV columns to expected format based on provided format
            course_id = course.get("CourseID", "")
            lecture_count = 1
            has_lab = False
            lab_count = 0
            
            # Try to determine if course has lab by looking at labs CSV
            if 'labs' in csv_data and csv_data['labs']:
                labs_content = parse_csv_content(csv_data['labs'])
                for lab in labs_content:
                    if lab.get("CourseID", "") == course_id:
                        has_lab = True
                        lab_count += 1
            
            result['courses'].append({
                "id": course_id or f"C{len(result['courses'])+1}",
                "name": course.get("CourseName", "Unknown Course"),
                "lectureCount": lecture_count,
                "hasLab": has_lab,
                "labCount": lab_count,
                "duration": int(course.get("Duration", 1))
            })
    
    # Parse faculty CSV
    if 'faculty' in csv_data and csv_data['faculty']:
        faculty_data = parse_csv_content(csv_data['faculty'])
        for faculty in faculty_data:
            result['faculty'].append({
                "id": faculty.get("FacultyID", f"F{len(result['faculty'])+1}"),
                "name": faculty.get("Name", "Unknown Faculty")
            })
    
    # Parse rooms CSV
    if 'rooms' in csv_data and csv_data['rooms']:
        rooms_data = parse_csv_content(csv_data['rooms'])
        for room in rooms_data:
            # Determine room type based on room ID (basic assumption that 'Lab' in name means it's a lab)
            room_id = room.get("RoomID", "")
            room_type = "Lab" if "Lab" in room_id else "Lecture"
            
            result['rooms'].append({
                "id": room_id or f"R{len(result['rooms'])+1}",
                "name": f"Room {room_id}",
                "capacity": int(room.get("Capacity", 30)),
                "type": room_type
            })
    
    # Parse lectures CSV
    if 'lectures' in csv_data and csv_data['lectures']:
        lectures_data = parse_csv_content(csv_data['lectures'])
        for lecture in lectures_data:
            result['lectures'].append({
                "id": lecture.get("LectureID", ""),
                "courseId": lecture.get("CourseID", ""),
                "facultyId": lecture.get("FacultyID", ""),
                "roomId": lecture.get("RoomID", "")
            })
    
    # Parse labs CSV
    if 'labs' in csv_data and csv_data['labs']:
        labs_data = parse_csv_content(csv_data['labs'])
        for lab in labs_data:
            result['labs'].append({
                "id": lab.get("LabID", ""),
                "courseId": lab.get("CourseID", ""),
                "roomId": lab.get("LabRoomID", ""),
                "facultyId": lab.get("LabInstructor", "")
            })
    
    # Parse students CSV
    if 'students' in csv_data and csv_data['students']:
        students_data = parse_csv_content(csv_data['students'])
        for student in students_data:
            enrolled_courses = student.get("EnrolledCourses", "[]")
            # Convert the string representation to a list
            try:
                # Strip quotes and brackets
                courses_list = enrolled_courses.strip("[]'\"").split(",")
                # Clean up each course ID
                courses_list = [c.strip("' \"") for c in courses_list]
                courses_list = [c for c in courses_list if c]  # Remove empty strings
            except:
                courses_list = []
                
            result['students'].append({
                "id": student.get("StudentID", ""),
                "enrolledCourses": courses_list
            })
    
    # If a timetable CSV was provided, parse it for direct use
    if 'optimized_timetable' in csv_data and csv_data['optimized_timetable']:
        result['use_provided_timetable'] = True
        result['provided_timetable'] = parse_csv_content(csv_data['optimized_timetable'])
    else:
        result['use_provided_timetable'] = False
        
    return result

# Script execution entry point
if __name__ == "__main__":
    try:
        # Redirect standard output to save debug prints
        import io
        import sys
        original_stdout = sys.stdout
        debug_output = io.StringIO()
        sys.stdout = debug_output
        
        # Read input data from stdin (sent by Node.js)
        input_str = ""
        for line in sys.stdin:
            input_str += line
        
        # Parse the JSON input
        input_data = json.loads(input_str)
        
        # Check if we received CSV data
        if 'csvData' in input_data:
            # Parse CSV data and convert to structured format
            processed_data = parse_csv_data(input_data['csvData'])
        else:
            # Use the input data directly
            processed_data = input_data
        
        # If no valid input is provided, use test data
        if not processed_data['courses'] or not processed_data['faculty'] or not processed_data['rooms']:
            test_data = {
                "courses": [
                    {"id": "CS101", "name": "Introduction to Computer Science", "lectureCount": 3, "hasLab": True, "labCount": 1},
                    {"id": "CS201", "name": "Data Structures", "lectureCount": 2, "hasLab": True, "labCount": 2},
                    {"id": "MA101", "name": "Calculus I", "lectureCount": 3, "hasLab": False}
                ],
                "faculty": [
                    {"id": "F1", "name": "Dr. John Smith"},
                    {"id": "F2", "name": "Dr. Jane Doe"},
                    {"id": "F3", "name": "Prof. Bob Johnson"}
                ],
                "rooms": [
                    {"id": "R1", "name": "Room 101", "capacity": 50, "type": "Lecture"},
                    {"id": "R2", "name": "Room 102", "capacity": 40, "type": "Lecture"},
                    {"id": "R3", "name": "Lab 201", "capacity": 30, "type": "Lab"}
                ]
            }
            result = generate_timetable(test_data)
        else:
            result = generate_timetable(processed_data)
        
        # Restore standard output for the final result
        sys.stdout = original_stdout
        
        # Save debug info in the result for troubleshooting
        debug_info = debug_output.getvalue()
        result["debug"] = debug_info
        
        # Output result to stdout (will be captured by Node.js)
        print(json.dumps(result))
    except Exception as e:
        # Make sure we restore stdout in case of error
        if 'original_stdout' in locals():
            sys.stdout = original_stdout
            
        # Handle any errors
        error_result = {
            "status": "error",
            "message": f"Error in timetable generator: {str(e)}"
        }
        
        # Include traceback for more detailed error info
        import traceback
        error_result["traceback"] = traceback.format_exc()
        
        print(json.dumps(error_result))