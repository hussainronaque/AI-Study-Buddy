#!/usr/bin/env python3
import os
import argparse
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timezone, date
from extract_schedule import extract_schedule

DEFAULT_MONGO_URI = "mongodb+srv://shayaanqazi:3syGsUHkPXnjIDgU@cluster0.57on7ed.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

def parse_time_str(time_str: str) -> datetime:
    """
    Convert "HH:MM AM/PM" into a timezone-aware datetime (today's date).
    """
    # If empty, return None
    if not time_str:
        return None
    # Parse into a time object
    t = datetime.strptime(time_str, "%I:%M %p").time()
    # Combine with today's date in UTC
    return datetime.combine(date.today(), t, tzinfo=timezone.utc)

class ScheduleUploader:
    def __init__(self, mongo_uri=None, db_name="ai_study_planner_db"):
        self.mongo_uri = mongo_uri or os.getenv("MONGODB_URI") or DEFAULT_MONGO_URI
        self.client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=5000)
        self.db = self.client[db_name]
        self.users = self.db["users"]
        self.schedules = self.db["schedules"]

    def get_or_create_user(self, firebase_uid, email, name):
        user = self.users.find_one({"firebase_uid": firebase_uid})
        if user:
            print(f"User {firebase_uid} found.")
            return user["_id"]

        print(f"User {firebase_uid} not found. Creating new user...")
        now = datetime.now(timezone.utc)
        new_user = {
            "firebase_uid": firebase_uid,
            "name": name,
            "email": email,
            "profile_picture": "",
            "preferences": {
                "study_hours_per_day": 2,
                "notification_settings": {"email": True, "push": True},
                "integrations": {"google_calendar": False, "microsoft_calendar": False}
            },
            "created_at": now,
            "updated_at": now
        }
        return self.users.insert_one(new_user).inserted_id

    def upload_schedule(self, user_id, schedule):
        # Remove old entries
        self.schedules.delete_many({"user_id": ObjectId(user_id)})

        now = datetime.now(timezone.utc)
        docs = []
        for e in schedule:
            start_dt = parse_time_str(e["start_time"])
            end_dt   = parse_time_str(e.get("end_time", ""))

            docs.append({
                "user_id": ObjectId(user_id),
                "type": "class",             # adjust if you have other types
                "title": e["course"],
                "description": e.get("type", ""),  
                "start_time": start_dt,
                "end_time": end_dt,
                "priority": "medium",
                "recurring": {"type": "none", "interval": 0},
                "status": "upcoming",
                "created_at": now,
                "updated_at": now
            })

        if docs:
            res = self.schedules.insert_many(docs)
            print(f"Inserted {len(res.inserted_ids)} schedule entries.")
        else:
            print("No schedule entries to insert.")

    def close(self):
        self.client.close()


def main():
    parser = argparse.ArgumentParser(...)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--image", help="Path to schedule image file")
    group.add_argument("--text",  help="Raw schedule text")
    parser.add_argument("--firebase-uid", required=True)
    parser.add_argument("--email",       required=True)
    parser.add_argument("--name",        required=True)
    parser.add_argument("--mongo-uri")
    args = parser.parse_args()

    schedule = extract_schedule(image_path=args.image, text=args.text)

    uploader = ScheduleUploader(mongo_uri=args.mongo_uri)
    user_id = uploader.get_or_create_user(
        firebase_uid=args.firebase_uid,
        email=args.email,
        name=args.name
    )
    uploader.upload_schedule(user_id=user_id, schedule=schedule)
    uploader.close()

if __name__ == "__main__":
    main()
