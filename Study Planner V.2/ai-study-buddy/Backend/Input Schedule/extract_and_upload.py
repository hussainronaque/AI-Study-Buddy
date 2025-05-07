#!/usr/bin/env python3
import os
import json
import base64
import io
import argparse
import requests  # Added to fetch images from URLs
from datetime import datetime, timezone
from bson import ObjectId
from pymongo import MongoClient
from openai import OpenAI
from dotenv import load_dotenv
from PIL import Image  # You'll need to install Pillow: pip install Pillow

# Load environment variables from .env file
load_dotenv()

class ColumnBasedScheduleProcessor:
    def __init__(self):
        """
        Initialize the Schedule Processor with OpenAI client
        """
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-4.1-mini-2025-04-14"

    def ensure_valid_image_format(self, image_data):
        """
        Ensure the image data is in a valid format for the OpenAI API        
        Args:
            image_data: Image data in any format (binary)
            
        Returns:
            Base64 encoded image in a supported format (PNG, JPEG, GIF, WEBP)
        """
        try:
            # Try to open the image with PIL
            img = Image.open(io.BytesIO(image_data))
            print(f"Image format detected: {img.format}, Size: {img.size}")

            # Convert to JPEG if it's not in a supported format
            if img.format not in ['PNG', 'JPEG', 'GIF', 'WEBP']:
                print(f"Converting from {img.format} to JPEG")
                output = io.BytesIO()
                if img.mode == 'RGBA':
                    # Convert RGBA to RGB (JPEG doesn't support alpha channel)
                    img = img.convert('RGB')
                img.save(output, format='JPEG', quality=95)
                image_bytes = output.getvalue()
            else:
                # Use original bytes if already supported
                buffer = io.BytesIO()
                img.save(buffer, format=img.format)
                image_bytes = buffer.getvalue()

            # Convert to base64
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            return base64_image
            
        except Exception as e:
            print(f"Error converting image: {e}")
            return None

    def process_schedule_image_from_db(self, schedule_image_data):
        """
        Process a schedule image retrieved from the database using GPT-4.1 Nano        
        Args:
            schedule_image_data: The image data from the database (URL string, base64, or binary)
            
        Returns:
            List of parsed schedule data
        """
        print("Processing schedule image from database...")
        try:
            # If the data is a URL, fetch the image
            if isinstance(schedule_image_data, str) and schedule_image_data.lower().startswith(('http://', 'https://')):
                url = schedule_image_data.replace('\\', '/')  # normalize backslashes
                print(f"Fetching image from URL: {url}")
                resp = requests.get(url)
                resp.raise_for_status()
                binary_data = resp.content
            elif isinstance(schedule_image_data, str):
                # Maybe it's base64-encoded already
                try:
                    binary_data = base64.b64decode(schedule_image_data)
                except Exception:
                    print("String data is not a valid base64 or URL")
                    return []
            else:
                # Assume it's binary
                binary_data = schedule_image_data

            # Ensure we have a valid image format
            base64_image = self.ensure_valid_image_format(binary_data)

            if not base64_image:
                print("Could not convert image to a valid format")
                return []

            # Prepare the prompt with column-based day detection
            prompt = """
            You are a schedule parser assistant. Analyze this student schedule image to extract course information.
            
            FOCUS ON COLUMN-BASED DAY DETECTION:
            The image shows a schedule grid with 5 columns representing days (Monday through Friday).
            For each course, you must look at WHICH SPECIFIC COLUMNS the course appears in.
            
            Example approach:
            1. Identify each unique course (by code and name)
            2. For each course, check each column (Monday, Tuesday, Wednesday, Thursday, Friday) to see if the course is present
            3. Only include the days where you actually see the course in that column
            
            For each unique course entry, extract:
            - Course code (e.g., "CS/CE 353/374", "PHIL 122")
            - Full course name (e.g., "Software Engineering")
            - Days: ONLY include the days (columns) where you actually see this course appearing
              * Use M=Monday, T=Tuesday, W=Wednesday, R=Thursday, F=Friday
              * Combine days with no separator (e.g., "MW" for Monday and Wednesday, "TR" for Tuesday and Thursday)
            - Start time (e.g., "10:00 AM")
            - End time (e.g., "11:15 AM")
            
            CRITICAL: Courses may appear in different time slots on different days. A course that appears in columns 1 and 3 
            should be marked as "MW" (Monday and Wednesday), NOT "MWF".
            
            Return your response as a JSON array of objects with these properties:
            "course_code", "course_name", "days", "start_time", "end_time"
            
            Provide ONLY the JSON array response with no additional text.
            """

            # Call the OpenAI API with GPT-4.1 Nano model
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a schedule parser that carefully analyzes schedule grids column by column. For each course, you identify exactly which columns (days) the course appears in. Respond ONLY with valid JSON."},
                    {"role": "user", "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]}
                ],
                max_tokens=1000,
                temperature=0.1
            )

            # Extract response content
            response_text = response.choices[0].message.content

            # Try to parse the JSON
            try:
                # Clean up the response - sometimes models add markdown code blocks
                cleaned_response = response_text.replace("```json", "").replace("```", "").strip()
                schedule = json.loads(cleaned_response)

                print("\nParsed Schedule:")
                print(json.dumps(schedule, indent=2))

                return schedule
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON response: {e}")
                print("Raw response:", response_text)
                return []
        except Exception as e:
            print(f"Error processing schedule: {e}")
            return []


def normalize_time_string(time_str):
    """Ensure time string matches '%I:%M %p' by inserting a space before AM/PM."""
    return time_str.replace("AM", " AM").replace("PM", " PM").strip()


def get_mongodb_connection():
    """
    Establish connection to MongoDB using connection string from .env file
    """
    try:
        mongodb_uri = os.getenv("MONGODB_URI")
        if not mongodb_uri:
            raise ValueError("MONGODB_URI environment variable is not set")
        client = MongoClient(mongodb_uri)
        db_name = "site_database"
        db = client[db_name]
        print(f"Connected to MongoDB database: {db_name}")
        return db
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise


def get_user_schedule_image(db, user_id):
    """
    Retrieve the user's schedule image from MongoDB.
    """
    try:
        user_id_obj = ObjectId(user_id)
        collections = db.list_collection_names()
        print(f"Available collections: {collections}")
        user_study_plan = db.study_plans.find_one({"userId": user_id_obj})
        if user_study_plan and "scheduleImage" in user_study_plan:
            print(f"Found schedule image for user ID: {user_id}")
            return user_study_plan["scheduleImage"].replace('\\', '/')
        else:
            user = db.users.find_one({"_id": user_id_obj})
            if user and "scheduleImage" in user:
                print(f"Found schedule image in users collection for user ID: {user_id}")
                return user["scheduleImage"].replace('\\', '/')
        return None
    except Exception as e:
        print(f"Error retrieving schedule image from MongoDB: {e}")
        return None


def extract_schedule_from_db(db, user_id):
    processor = ColumnBasedScheduleProcessor()
    schedule_image_data = get_user_schedule_image(db, user_id)
    if schedule_image_data:
        return processor.process_schedule_image_from_db(schedule_image_data)
    else:
        print("No schedule image found to process")
        return []

class ScheduleUploader:
    def __init__(self, mongo_uri=None, db_name="site_database"):
        # Use the default URI if none is provided
        self.mongo_uri = mongo_uri or os.getenv("MONGODB_URI")
        self.client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=5000)
        self.db = self.client[db_name]
        self.collection = self.db["courses"]

    def upload(self, user_id, schedule):
        docs = []
        for e in schedule:
            try:
                # Normalize and parse time strings into datetime objects (dummy date 1900-01-01)
                norm_start = normalize_time_string(e["start_time"])
                start_dt = datetime.strptime(norm_start, "%I:%M %p").replace(tzinfo=timezone.utc)

                end_dt = None
                end_str = e.get("end_time", "")
                if end_str:
                    norm_end = normalize_time_string(end_str)
                    end_dt = datetime.strptime(norm_end, "%I:%M %p").replace(tzinfo=timezone.utc)

                docs.append({
                    "user_id":    ObjectId(user_id),       # matches schema
                    "type":       "class",               # must be one of: class, deadline, exam, extracurricular
                    "title":      e["course_name"],      # required field
                    "course_code": e["course_code"],
                    "days":       e["days"],
                    "start_time":  start_dt,               # BSON Date
                    "end_time":    end_dt,                 # BSON Date or null
                    "uploadedAt": datetime.now(timezone.utc)
                })
            except Exception as ex:
                print(f"Error processing entry {e}: {ex}")

        if docs:
            res = self.collection.insert_many(docs)
            print(f"Inserted {len(res.inserted_ids)} entries.")
        else:
            print("No valid entries to insert.")

    def close(self):
        self.client.close()


def main():
    parser = argparse.ArgumentParser(description="Extract a schedule and upload it to MongoDB.")
    parser.add_argument("--user", required=True, help="MongoDB user ObjectId")
    parser.add_argument("--mongo-uri", help="MongoDB connection URI (overrides .env)")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--from-db", action="store_true", help="Fetch schedule image from DB")
    group.add_argument("--image", help="Path to schedule image file")
    args = parser.parse_args()

    # Connect to DB
    db = get_mongodb_connection()

    if args.from_db:
        schedule = extract_schedule_from_db(db, args.user)
    else:
        # Load local image file
        with open(args.image, 'rb') as f:
            image_data = f.read()
        processor = ColumnBasedScheduleProcessor()
        schedule = processor.process_schedule_image_from_db(image_data)

    if not schedule:
        print("No schedule data was extracted")
        return

    uploader = ScheduleUploader(mongo_uri=args.mongo_uri)
    uploader.upload(user_id=args.user, schedule=schedule)
    uploader.close()

if __name__ == "__main__":
    main()
