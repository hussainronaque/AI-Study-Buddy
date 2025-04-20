import pymongo
from datetime import datetime, timedelta
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from bson.objectid import ObjectId

# Load environment variables (for API keys)
load_dotenv()

# Configure OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def connect_to_mongodb():
    """Connect to MongoDB and return the database."""
    mongo_client = pymongo.MongoClient(
        "mongodb+srv://shayaanqazi:shDjocJeMTuQHA8K@cluster0.57on7ed.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    )
    db = mongo_client["ai_study_planner_db"]
    return db


def get_user_schedule(db, user_id):
    """Retrieve the user's schedule from MongoDB."""
    try:
        user_id_obj = ObjectId(user_id)
        schedules = db.schedules.find({"user_id": user_id_obj})
        schedule_list = list(schedules)
        print(f"Found {len(schedule_list)} schedule items for user ID: {user_id}")
        return schedule_list
    except Exception as e:
        print(f"Error querying MongoDB: {e}")
        return []


def parse_schedule(raw_schedule):
    """Parse the MongoDB schedule into a more usable format, converting datetimes to strings."""
    parsed_schedule = []
    for item in raw_schedule:
        raw_start = item.get("start_time", "")
        raw_end   = item.get("end_time", "")

        # Convert datetime objects into formatted strings
        if isinstance(raw_start, datetime):
            start_str = raw_start.strftime("%Y-%m-%d %H:%M:%S")
        else:
            start_str = raw_start

        if isinstance(raw_end, datetime):
            end_str = raw_end.strftime("%Y-%m-%d %H:%M:%S")
        else:
            end_str = raw_end

        parsed_item = {
            "course_code": item.get("course_code", ""),
            "course_name": item.get("title", ""),
            "days": item.get("days", ""),
            "start_time": start_str,
            "end_time": end_str
        }
        parsed_schedule.append(parsed_item)
    return parsed_schedule


def expand_daily_schedule(parsed_schedule):
    """Expand schedule to daily format for easier gap analysis."""
    days_mapping = {
        'M': 'Monday',
        'T': 'Tuesday',
        'W': 'Wednesday',
        'R': 'Thursday',
        'F': 'Friday',
        'S': 'Saturday',
        'U': 'Sunday'
    }
    daily_schedule = {day: [] for day in days_mapping.values()}

    for course in parsed_schedule:
        # Parse the stored time strings back to datetime for calculations
        start_time = datetime.strptime(course['start_time'], "%Y-%m-%d %H:%M:%S")
        end_time   = datetime.strptime(course['end_time'],   "%Y-%m-%d %H:%M:%S")

        for day_char in course['days']:
            if day_char in days_mapping:
                day_name = days_mapping[day_char]
                daily_schedule[day_name].append({
                    'course': f"{course['course_code']} - {course['course_name']}",
                    'start_time': start_time,
                    'end_time': end_time
                })

    # Sort each day's schedule by start time
    for day in daily_schedule:
        daily_schedule[day] = sorted(daily_schedule[day], key=lambda x: x['start_time'])
    return daily_schedule


def find_gaps(daily_schedule, min_gap_minutes=30):
    """Find gaps in the schedule for each day."""
    gaps = {day: [] for day in daily_schedule}
    for day, classes in daily_schedule.items():
        if not classes:
            morning = datetime.strptime("08:00", "%H:%M")
            evening = datetime.strptime("22:00", "%H:%M")
            gaps[day].append({
                'start': morning,
                'end': evening,
                'duration_mins': (evening - morning).seconds // 60
            })
            continue

        # Gap before first class
        morning = datetime.strptime("08:00", "%H:%M")
        if (classes[0]['start_time'] - morning).seconds // 60 >= min_gap_minutes:
            gaps[day].append({
                'start': morning,
                'end': classes[0]['start_time'],
                'duration_mins': (classes[0]['start_time'] - morning).seconds // 60
            })

        # Gaps between classes
        for i in range(len(classes) - 1):
            current_end = classes[i]['end_time']
            next_start  = classes[i+1]['start_time']
            gap_mins    = (next_start - current_end).seconds // 60
            if gap_mins >= min_gap_minutes:
                gaps[day].append({
                    'start': current_end,
                    'end': next_start,
                    'duration_mins': gap_mins
                })

        # Gap after last class
        evening = datetime.strptime("22:00", "%H:%M")
        if (evening - classes[-1]['end_time']).seconds // 60 >= min_gap_minutes:
            gaps[day].append({
                'start': classes[-1]['end_time'],
                'end': evening,
                'duration_mins': (evening - classes[-1]['end_time']).seconds // 60
            })
    return gaps


def format_gaps_for_display(gaps):
    """Format gaps for better readability."""
    formatted_gaps = {}
    for day, day_gaps in gaps.items():
        formatted_gaps[day] = []
        for gap in day_gaps:
            formatted_gaps[day].append({
                'start': gap['start'].strftime("%I:%M%p"),
                'end':   gap['end'].strftime("%I:%M%p"),
                'duration_mins': gap['duration_mins'],
                'duration_hours': round(gap['duration_mins'] / 60, 1)
            })
    return formatted_gaps


def generate_study_plan(parsed_schedule, gaps, tasks):
    """Use OpenAI API to generate a study plan based on schedule gaps and tasks."""
    gaps_str     = json.dumps(format_gaps_for_display(gaps), indent=2)
    schedule_str = json.dumps(parsed_schedule, indent=2)
    tasks_str    = json.dumps(tasks, indent=2)

    prompt = f"""
    I need help creating a study plan based on my schedule and tasks. 
    
    Here's my current course schedule:
    {schedule_str}
    
    These are the available gaps in my schedule where I could study:
    {gaps_str}
    
    Here are the tasks I need to complete, with their deadlines and estimated hours needed:
    {tasks_str}
    
    Please create a detailed study plan that:
    1. Allocates time for each task in my available gaps
    2. Prioritizes tasks based on deadlines
    3. Considers the estimated time needed for each task
    4. Ensures I have sufficient breaks
    5. Suggests specific time blocks for each task
    
    For each task, specify which day and time block I should work on it, and for how long.
    """

    response = client.chat.completions.create(
        model="gpt-4.1-nano-2025-04-14",
        messages=[
            {"role": "system", "content": "You are a helpful academic assistant specializing in time management and study planning."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=2000
    )
    return response.choices[0].message.content


def main():
    # Sample tasks (in a real application, these would be input by the user)
    sample_tasks = [
        {"task_id": 1, "title": "CS412 Algorithm Analysis Assignment", "deadline": "2025-04-26", "estimated_hours": 4, "priority": "high"},
        {"task_id": 2, "title": "PHIL122 Essay Outline",             "deadline": "2025-04-24", "estimated_hours": 2, "priority": "medium"},
        {"task_id": 3, "title": "CS353 Software Project Milestone", "deadline": "2025-04-29", "estimated_hours": 6, "priority": "high"},
        {"task_id": 4, "title": "MGMT301 Case Study Analysis",      "deadline": "2025-04-27", "estimated_hours": 3, "priority": "medium"},
        {"task_id": 5, "title": "CS334 Programming Contest Prep",  "deadline": "2025-04-25", "estimated_hours": 5, "priority": "high"}
    ]

    db      = connect_to_mongodb()
    user_id = "67f22c2dc64e0a2c11f0d952"

    print(f"Looking for schedules with user_id: {user_id}")
    raw_schedule      = get_user_schedule(db, user_id)
    raw_schedule_list = raw_schedule

    if not raw_schedule_list:
        print(f"No schedule found for user ID: {user_id}")
        return

    parsed_schedule = parse_schedule(raw_schedule_list)
    print("Parsed Schedule:")
    print(json.dumps(parsed_schedule, indent=2))

    daily_schedule = expand_daily_schedule(parsed_schedule)
    gaps           = find_gaps(daily_schedule)

    print("\nIdentified Gaps:")
    formatted_gaps = format_gaps_for_display(gaps)
    print(json.dumps(formatted_gaps, indent=2))

    study_plan = generate_study_plan(parsed_schedule, gaps, sample_tasks)
    print("\nGenerated Study Plan:")
    print(study_plan)

if __name__ == "__main__":
    main()
