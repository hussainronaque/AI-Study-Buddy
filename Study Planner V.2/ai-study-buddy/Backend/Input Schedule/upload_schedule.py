#!/usr/bin/env python3
import os
import argparse
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timezone

from extract_schedule import extract_schedule

# Store the MongoDB connection string directly in the script
DEFAULT_MONGO_URI = "mongodb+srv://shayaanqazi:shDjocJeMTuQHA8K@cluster0.57on7ed.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

class ScheduleUploader:
    def __init__(self, mongo_uri=None, db_name="ai_study_planner_db"):
        # Use the default URI if none is provided
        self.mongo_uri = mongo_uri or os.getenv("MONGODB_URI") or DEFAULT_MONGO_URI
        self.client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=5000)
        self.db = self.client[db_name]
        self.collection = self.db["schedules"]

    def upload(self, user_id, schedule):
        docs = []
        for e in schedule:
            try:
                # Parse time strings into datetime objects (dummy date 1900-01-01)
                start_dt = datetime.strptime(e["start_time"], "%I:%M%p")
                start_dt = start_dt.replace(tzinfo=timezone.utc)

                end_dt = None
                end_str = e.get("end_time", "")
                if end_str:
                    end_dt = datetime.strptime(end_str, "%I:%M%p")
                    end_dt = end_dt.replace(tzinfo=timezone.utc)

                docs.append({
                    "user_id":    ObjectId(user_id),       # matches schema
                    "type":       "class",               # must be one of: class, deadline, exam, extracurricular
                    "title":      e["course_name"],      # required field
                    "course_code": e["course_code"],
                    "days":       e["days"],
                    "start_time":  start_dt,              # BSON Date
                    "end_time":    end_dt,                # BSON Date or null
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
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--image", help="Path to schedule image file")
    group.add_argument("--text", help="Raw schedule text")
    parser.add_argument("--user", required=True, help="MongoDB user ObjectId")
    parser.add_argument("--mongo-uri", help="MongoDB connection URI (overrides default and env var)")
    args = parser.parse_args()

    if args.image:
        schedule = extract_schedule(image_path=args.image)
    else:
        print("Text input not supported by extract_schedule function")
        return

    uploader = ScheduleUploader(mongo_uri=args.mongo_uri)
    uploader.upload(user_id=args.user, schedule=schedule)
    uploader.close()

if __name__ == "__main__":
    main()
