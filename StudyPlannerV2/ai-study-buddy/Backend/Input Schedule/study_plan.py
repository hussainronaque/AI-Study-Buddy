import pymongo
from datetime import datetime, timedelta, timezone
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from bson.objectid import ObjectId
import argparse
import re

# Load environment variables (for API keys)
load_dotenv()

# Configure OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Custom JSON encoder for datetime objects
class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.strftime("%Y-%m-%d %H:%M:%S")
        elif isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

def connect_to_mongodb(mongo_uri=None):
    """Connect to MongoDB and return the database."""
    uri = mongo_uri or (
        "mongodb+srv://shayaanqazi:shDjocJeMTuQHA8K@cluster0.57on7ed.mongodb.net/"
        "?retryWrites=true&w=majority&appName=Cluster0"
    )
    mongo_client = pymongo.MongoClient(uri)
    return mongo_client["site_database"]


def get_user_schedule(db, user_id):
    """Retrieve the user's schedule from MongoDB (from 'courses' collection)."""
    try:
        user_id_obj = ObjectId(user_id)
        schedules = db.courses.find({"user_id": user_id_obj})
        schedule_list = list(schedules)
        print(f"Found {len(schedule_list)} schedule items for user ID: {user_id}")
        return schedule_list
    except Exception as e:
        print(f"Error querying MongoDB: {e}")
        return []


def get_user_tasks(db, user_id):
    """Retrieve the user's tasks from the 'study_plans' collection."""
    try:
        user_id_obj = ObjectId(user_id)
        study_plan_doc = db.study_plans.find_one({"userId": user_id_obj})
        if not study_plan_doc or "tasks" not in study_plan_doc:
            print("No tasks found in study_plans document.")
            return []
        task_list = study_plan_doc["tasks"]
        print(f"Found {len(task_list)} tasks for user ID: {user_id}")
        return task_list
    except Exception as e:
        print(f"Error querying MongoDB for tasks: {e}")
        return []


def parse_schedule(raw_schedule):
    """Parse the MongoDB schedule into a more usable format, converting datetimes to strings."""
    parsed_schedule = []
    for item in raw_schedule:
        raw_start = item.get("start_time", "")
        raw_end   = item.get("end_time", "")

        if isinstance(raw_start, datetime):
            # Convert to server's local time
            if raw_start.tzinfo is not None:
                raw_start = raw_start.astimezone(None)  # Convert to server's local timezone
            start_str = raw_start.strftime("%Y-%m-%d %H:%M:%S")
        else:
            start_str = raw_start

        if isinstance(raw_end, datetime):
            # Convert to server's local time
            if raw_end.tzinfo is not None:
                raw_end = raw_end.astimezone(None)  # Convert to server's local timezone
            end_str = raw_end.strftime("%Y-%m-%d %H:%M:%S")
        else:
            end_str = raw_end

        parsed_schedule.append({
            "course_code": item.get("course_code", ""),
            "course_name": item.get("title", ""),
            "days": item.get("days", ""),
            "start_time": start_str,
            "end_time": end_str
        })
    return parsed_schedule


def expand_daily_schedule(parsed_schedule):
    """Expand schedule to daily format for easier gap analysis."""
    days_mapping = {
        'M': 'Monday', 'T': 'Tuesday', 'W': 'Wednesday',
        'R': 'Thursday', 'F': 'Friday', 'S': 'Saturday', 'U': 'Sunday'
    }
    daily_schedule = {day: [] for day in days_mapping.values()}
    for course in parsed_schedule:
        # Parse dates in server's local time
        start_time = datetime.strptime(course['start_time'], "%Y-%m-%d %H:%M:%S")
        end_time = datetime.strptime(course['end_time'], "%Y-%m-%d %H:%M:%S")
        
        for day_char in course['days']:
            if day_char in days_mapping:
                daily_schedule[days_mapping[day_char]].append({
                    'course': f"{course['course_code']} - {course['course_name']}",
                    'start_time': start_time,
                    'end_time': end_time
                })
    for day in daily_schedule:
        daily_schedule[day].sort(key=lambda x: x['start_time'])
    return daily_schedule


def find_gaps(daily_schedule, min_gap_minutes=30):
    """Find gaps in the schedule for each day."""
    gaps = {day: [] for day in daily_schedule}
    for day, classes in daily_schedule.items():
        if not classes:
            # Use server's local time for morning and evening
            morning = datetime.now().replace(hour=8, minute=0, second=0, microsecond=0)
            evening = datetime.now().replace(hour=22, minute=0, second=0, microsecond=0)
            gaps[day].append({'start': morning, 'end': evening, 'duration_mins': (evening-morning).seconds//60})
            continue
        
        morning = datetime.now().replace(hour=8, minute=0, second=0, microsecond=0)
        if (classes[0]['start_time'] - morning).seconds//60 >= min_gap_minutes:
            gaps[day].append({'start': morning, 'end': classes[0]['start_time'], 'duration_mins': (classes[0]['start_time']-morning).seconds//60})
        
        for i in range(len(classes)-1):
            gap = (classes[i+1]['start_time'] - classes[i]['end_time']).seconds//60
            if gap >= min_gap_minutes:
                gaps[day].append({'start': classes[i]['end_time'], 'end': classes[i+1]['start_time'], 'duration_mins': gap})
        
        evening = datetime.now().replace(hour=22, minute=0, second=0, microsecond=0)
        if (evening - classes[-1]['end_time']).seconds//60 >= min_gap_minutes:
            gaps[day].append({'start': classes[-1]['end_time'], 'end': evening, 'duration_mins': (evening-classes[-1]['end_time']).seconds//60})
    
    return gaps


def format_gaps_for_display(gaps):
    """Format gaps for better readability."""
    formatted = {}
    for day, day_gaps in gaps.items():
        formatted[day] = [
            {
                'start': g['start'].strftime("%I:%M%p"),
                'end':   g['end'].strftime("%I:%M%p"),
                'duration_mins': g['duration_mins'],
                'duration_hours': round(g['duration_mins']/60,1)
            } for g in day_gaps
        ]
    return formatted


def generate_study_plan(parsed_schedule, gaps, tasks):
    """Use OpenAI API to generate a study plan based on schedule gaps and tasks."""
    gaps_str = json.dumps(format_gaps_for_display(gaps), indent=2)
    sched_str = json.dumps(parsed_schedule, indent=2)
    # Use the custom DateTimeEncoder for tasks
    tasks_str = json.dumps(tasks, indent=2, cls=DateTimeEncoder)

    # Get server's current time
    current_time = datetime.now()
    current_time_str = current_time.strftime("%Y-%m-%d %H:%M:%S")

    prompt = f"""
    I need help creating a study plan based on my schedule and upcoming tasks, as well as the current date and time.

    Take into account the current date and time: {current_time_str}, and so make the study plan till the date of submission. Be careful about the dates.

    Here's my current course schedule:
    {sched_str}

    These are the available gaps in my schedule where I could study:
    {gaps_str}

    Here are the tasks I need to complete, with their deadlines:
    {tasks_str}

    Please review these tasks and:
    1. Assign a priority level (high/medium/low) to each task.
    2. Estimate the hours needed for each task.
    3. Allocate time blocks in the available gaps accordingly.
    4. Ensure sufficient breaks and realistic scheduling.
    5. Provide a detailed study plan specifying day, time block, task, and duration.
    
    Important: Do not start your response with "Certainly!" or similar phrases. Do not use markdown formatting like ### or ** in your response. Just provide the plain study plan.
    """

    response = client.chat.completions.create(
        model="gpt-4.1-mini-2025-04-14",
        messages=[
            {"role": "system", "content": "You are a helpful academic assistant specializing in time management and study planning. Provide direct, clean responses without markdown formatting (no ### headings or ** bold text) and without starting with phrases like 'Certainly!' or 'Here's your study plan:'"},
            {"role": "user", "content": prompt}
        ],
        max_tokens=2000
    )
    return response.choices[0].message.content


def format_study_plan(study_plan):
    """Remove common phrases like 'Certainly!' and markdown formatting."""
    # Remove phrases like "Certainly!", "Here's your study plan:", etc.
    phrases_to_remove = [
        r"^Certainly!.*?\n",
        r"^Sure!.*?\n",
        r"^Here's.*?plan:.*?\n",
        r"^Here is.*?plan:.*?\n",
        r"^I'd be happy to.*?\n",
        r"^Based on.*?information:.*?\n"
    ]
    
    formatted_plan = study_plan
    for phrase in phrases_to_remove:
        formatted_plan = re.sub(phrase, "", formatted_plan, flags=re.IGNORECASE | re.DOTALL)
    
    # Remove markdown headings (###)
    formatted_plan = re.sub(r"###\s*", "", formatted_plan)
    
    # Remove bold formatting (**)
    formatted_plan = re.sub(r"\*\*(.*?)\*\*", r"\1", formatted_plan)
    
    # Remove any leading/trailing whitespace
    formatted_plan = formatted_plan.strip()
    
    return formatted_plan


def save_study_plan_to_db(db, user_id, study_plan):
    """Save the generated study plan to the ai_gens collection."""
    try:
        user_id_obj = ObjectId(user_id)
        
        # Format the study plan to remove unwanted elements
        formatted_plan = format_study_plan(study_plan)
        
        # Create document to insert
        doc = {
            "userId": user_id_obj,
            "type": "study_plan",
            "content": formatted_plan,
            "created_at": datetime.now()
        }
        
        # Check if a study plan already exists for this user
        existing_plan = db.ai_gens.find_one({"userId": user_id_obj, "type": "study_plan"})
        
        if existing_plan:
            # Update existing document
            result = db.ai_gens.update_one(
                {"_id": existing_plan["_id"]},
                {"$set": {"content": formatted_plan, "updated_at": datetime.now()}}
            )
            print(f"Updated existing study plan document. Modified count: {result.modified_count}")
        else:
            # Insert new document
            result = db.ai_gens.insert_one(doc)
            print(f"Created new study plan document with ID: {result.inserted_id}")
        
        return True
    except Exception as e:
        print(f"Error saving study plan to MongoDB: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Generate a study plan based on user schedule.")
    parser.add_argument("--user", required=True, help="MongoDB user ObjectId")
    parser.add_argument("--mongo-uri", help="MongoDB connection URI (optional)")
    args = parser.parse_args()

    db      = connect_to_mongodb(args.mongo_uri)
    user_id = args.user

    print(f"Looking for schedules with user_id: {user_id}")
    raw_schedule = get_user_schedule(db, user_id)
    if not raw_schedule:
        print(f"No schedule found for user ID: {user_id}")
        return

    parsed = parse_schedule(raw_schedule)
    print("Parsed Schedule:")
    print(json.dumps(parsed, indent=2))

    daily = expand_daily_schedule(parsed)
    gaps  = find_gaps(daily)

    print("\nIdentified Gaps:")
    print(json.dumps(format_gaps_for_display(gaps), indent=2))

    task_data = get_user_tasks(db, user_id)
    if not task_data:
        print(f"No tasks found for user ID: {user_id}")
        return

    study_plan = generate_study_plan(parsed, gaps, task_data)
    
    # Show both the original and formatted study plan in the console
    print("\nOriginal Generated Study Plan:")
    print(study_plan)
    
    formatted_plan = format_study_plan(study_plan)
    print("\nFormatted Study Plan (to be saved):")
    print(formatted_plan)
    
    # Save the formatted study plan to the ai_gens collection
    save_result = save_study_plan_to_db(db, user_id, study_plan)
    if save_result:
        print(f"Successfully saved formatted study plan to ai_gens collection for user: {user_id}")
    else:
        print(f"Failed to save study plan to database for user: {user_id}")

if __name__ == "__main__":
    main()