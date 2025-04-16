const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config(); // Load environment variables

const uri = process.env.MONGODB_URI || "mongodb+srv://shayaanqazi:3syGsUHkPXnjIDgU@cluster0.57on7ed.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");

    const database = client.db("ai_study_planner_db");
    console.log("📂 Setting up collections...");

    // 1️⃣ Users Collection
    await database.createCollection("users", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["firebase_uid", "name", "email", "created_at"],
          properties: {
            firebase_uid: { bsonType: "string", description: "Firebase Authentication UID" },
            name: { bsonType: "string" },
            email: { bsonType: "string" },
            profile_picture: { bsonType: "string" },
            preferences: {
              bsonType: "object",
              properties: {
                study_hours_per_day: { bsonType: "int" },
                notification_settings: {
                  bsonType: "object",
                  properties: {
                    email: { bsonType: "bool" },
                    push: { bsonType: "bool" }
                  }
                },
                integrations: {
                  bsonType: "object",
                  properties: {
                    google_calendar: { bsonType: "bool" },
                    microsoft_calendar: { bsonType: "bool" }
                  }
                }
              }
            },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: "date" }
          }
        }
      }
    });
    console.log("✅ Created 'users' collection");

    // 2️⃣ Schedules Collection
    await database.createCollection("schedules", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["user_id", "type", "title", "start_time", "end_time"],
          properties: {
            user_id: { bsonType: "objectId" },
            type: { bsonType: "string", enum: ["class", "deadline", "exam", "extracurricular"] },
            title: { bsonType: "string" },
            description: { bsonType: "string" },
            start_time: { bsonType: "date" },
            end_time: { bsonType: "date" },
            priority: { bsonType: "string", enum: ["low", "medium", "high"] },
            recurring: {
              bsonType: "object",
              properties: {
                type: { bsonType: "string", enum: ["none", "daily", "weekly", "monthly"] },
                interval: { bsonType: "int" }
              }
            },
            status: { bsonType: "string", enum: ["upcoming", "completed", "missed"] },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: "date" }
          }
        }
      }
    });
    console.log("✅ Created 'schedules' collection");

    // 3️⃣ Study Plans Collection
    await database.createCollection("study_plans", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["user_id", "tasks", "generated_at"],
          properties: {
            user_id: { bsonType: "objectId" },
            schedule_id: { bsonType: "objectId" },
            ai_generated: { bsonType: "bool" },
            tasks: {
              bsonType: "array",
              items: {
                bsonType: "object",
                properties: {
                  task_name: { bsonType: "string" },
                  start_time: { bsonType: "date" },
                  end_time: { bsonType: "date" },
                  status: { bsonType: "string", enum: ["pending", "completed", "missed"] },
                  feedback: { bsonType: "string" }
                }
              }
            },
            generated_at: { bsonType: "date" },
            updated_at: { bsonType: "date" }
          }
        }
      }
    });
    console.log("✅ Created 'study_plans' collection");

    // 4️⃣ Progress Tracking Collection
    await database.createCollection("progress_tracking", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["user_id", "study_plan_id", "completed_tasks", "total_tasks"],
          properties: {
            user_id: { bsonType: "objectId" },
            study_plan_id: { bsonType: "objectId" },
            completed_tasks: { bsonType: "int" },
            total_tasks: { bsonType: "int" },
            performance_score: { bsonType: "int" },
            study_patterns: {
              bsonType: "object",
              properties: {
                average_study_time: { bsonType: "int" },
                most_focused_time: { bsonType: "string" },
                task_completion_rate: { bsonType: "double" }
              }
            },
            ai_feedback: { bsonType: "string" },
            updated_at: { bsonType: "date" }
          }
        }
      }
    });
    console.log("✅ Created 'progress_tracking' collection");

    // 5️⃣ Notifications Collection
    await database.createCollection("notifications", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["user_id", "message", "sent_at"],
          properties: {
            user_id: { bsonType: "objectId" },
            message: { bsonType: "string" },
            type: { bsonType: "string", enum: ["reminder", "deadline", "study_session"] },
            sent_at: { bsonType: "date" },
            status: { bsonType: "string", enum: ["sent", "pending", "failed"] }
          }
        }
      }
    });
    console.log("✅ Created 'notifications' collection");

    // 6️⃣ Calendar Sync Collection
    await database.createCollection("calendar_sync", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["user_id", "platform", "last_sync"],
          properties: {
            user_id: { bsonType: "objectId" },
            platform: { bsonType: "string", enum: ["google", "microsoft"] },
            last_sync: { bsonType: "date" },
            status: { bsonType: "string", enum: ["success", "failed"] }
          }
        }
      }
    });
    console.log("✅ Created 'calendar_sync' collection");

    // Indexing for better query performance
    console.log("📌 Creating indexes...");
    await database.collection("users").createIndex({ "email": 1 }, { unique: true });
    await database.collection("schedules").createIndex({ "user_id": 1 });
    await database.collection("study_plans").createIndex({ "user_id": 1 });
    await database.collection("progress_tracking").createIndex({ "user_id": 1 });
    console.log("✅ Indexing completed!");

    console.log("🎉 Database setup completed successfully!");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
  } finally {
    await client.close();
    console.log("🔌 MongoDB connection closed");
  }
}

run().catch(console.dir);
