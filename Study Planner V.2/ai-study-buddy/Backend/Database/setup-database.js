const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config(); // To load environment variables from a .env file

// Replace with your actual MongoDB URI or use environment variable
const uri = process.env.MONGODB_URI || "mongodb+srv://shayaanqazi:3syGsUHkPXnjIDgU@cluster0.57on7ed.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("Connected to MongoDB!");

    // Create database reference
    const database = client.db("ai_study_planner_db");
    
    // Create collections with validation
    console.log("Setting up collections and validation schemas...");

    // Users Collection
    await database.createCollection("users", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["email", "name", "password", "createdAt"],
          properties: {
            name: {
              bsonType: "string",
              description: "Full name of the user"
            },
            email: {
              bsonType: "string",
              description: "User's email address"
            },
            password: {
              bsonType: "string",
              description: "Hashed password"
            },
            preferences: {
              bsonType: "object",
              properties: {
                studyHoursPerDay: { bsonType: "number" },
                preferredStudyTime: { bsonType: "string" },
                notification: { bsonType: "bool" }
              }
            },
            createdAt: {
              bsonType: "date",
              description: "Date the user account was created"
            }
          }
        }
      }
    });
    console.log("Created users collection");

    // StudyPlans Collection
    await database.createCollection("studyPlans", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId", "title", "createdAt"],
          properties: {
            userId: {
              bsonType: "objectId",
              description: "Reference to the user"
            },
            title: {
              bsonType: "string",
              description: "Title of the study plan"
            },
            description: {
              bsonType: "string",
              description: "Description of the study plan"
            },
            subjects: {
              bsonType: "array",
              items: {
                bsonType: "objectId",
                description: "References to subjects"
              }
            },
            startDate: {
              bsonType: "date"
            },
            endDate: {
              bsonType: "date"
            },
            isActive: {
              bsonType: "bool",
              description: "Whether this plan is active"
            },
            createdAt: {
              bsonType: "date"
            }
          }
        }
      }
    });
    console.log("Created studyPlans collection");

    // Subjects Collection
    await database.createCollection("subjects", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId", "title", "createdAt"],
          properties: {
            userId: {
              bsonType: "objectId",
              description: "Reference to the user"
            },
            title: {
              bsonType: "string",
              description: "Subject title"
            },
            description: {
              bsonType: "string"
            },
            priority: {
              bsonType: "int",
              description: "Priority level 1-5"
            },
            estimatedHours: {
              bsonType: "number"
            },
            topics: {
              bsonType: "array",
              items: {
                bsonType: "object",
                properties: {
                  title: { bsonType: "string" },
                  completed: { bsonType: "bool" }
                }
              }
            },
            createdAt: {
              bsonType: "date"
            }
          }
        }
      }
    });
    console.log("Created subjects collection");

    // StudySessions Collection
    await database.createCollection("studySessions", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId", "subjectId", "startTime", "endTime"],
          properties: {
            userId: {
              bsonType: "objectId"
            },
            subjectId: {
              bsonType: "objectId"
            },
            planId: {
              bsonType: "objectId"
            },
            startTime: {
              bsonType: "date"
            },
            endTime: {
              bsonType: "date"
            },
            duration: {
              bsonType: "number",
              description: "Duration in minutes"
            },
            notes: {
              bsonType: "string"
            },
            productivity: {
              bsonType: "int",
              description: "Self-rated productivity (1-10)"
            }
          }
        }
      }
    });
    console.log("Created studySessions collection");

    // AIRecommendations Collection
    await database.createCollection("aiRecommendations", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId", "createdAt"],
          properties: {
            userId: {
              bsonType: "objectId"
            },
            content: {
              bsonType: "string",
              description: "AI recommendation content"
            },
            type: {
              bsonType: "string",
              enum: ["schedule", "method", "resource", "other"],
              description: "Type of recommendation"
            },
            applied: {
              bsonType: "bool",
              description: "Whether user applied this recommendation"
            },
            createdAt: {
              bsonType: "date"
            }
          }
        }
      }
    });
    console.log("Created aiRecommendations collection");

    // Create indexes for better performance
    console.log("Creating indexes...");
    await database.collection("users").createIndex({ "email": 1 }, { unique: true });
    await database.collection("studyPlans").createIndex({ "userId": 1 });
    await database.collection("subjects").createIndex({ "userId": 1 });
    await database.collection("studySessions").createIndex({ "userId": 1 });
    await database.collection("studySessions").createIndex({ "subjectId": 1 });
    await database.collection("aiRecommendations").createIndex({ "userId": 1 });
    console.log("Created all indexes");

    // Create sample data (optional)
    const createSampleData = false; // Set to true if you want to create sample data
    
    if (createSampleData) {
      console.log("Creating sample data...");
      
      // Create a test user
      const usersCollection = database.collection("users");
      const userResult = await usersCollection.insertOne({
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword123",
        preferences: {
          studyHoursPerDay: 2,
          preferredStudyTime: "evening",
          notification: true
        },
        createdAt: new Date()
      });
      console.log("Created sample user");
      
      // Create a sample subject
      const subjectsCollection = database.collection("subjects");
      const subjectResult = await subjectsCollection.insertOne({
        userId: userResult.insertedId,
        title: "Mathematics",
        description: "Advanced calculus and algebra",
        priority: 4,
        estimatedHours: 40,
        topics: [
          { title: "Limits and Continuity", completed: false },
          { title: "Derivatives", completed: false },
          { title: "Integrals", completed: false }
        ],
        createdAt: new Date()
      });
      console.log("Created sample subject");
      
      // Create a sample study plan
      const plansCollection = database.collection("studyPlans");
      const planResult = await plansCollection.insertOne({
        userId: userResult.insertedId,
        title: "Spring Semester Plan",
        description: "My study plan for the spring semester",
        subjects: [subjectResult.insertedId],
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days later
        isActive: true,
        createdAt: new Date()
      });
      console.log("Created sample study plan");
      
      // Create a sample study session
      const sessionsCollection = database.collection("studySessions");
      await sessionsCollection.insertOne({
        userId: userResult.insertedId,
        subjectId: subjectResult.insertedId,
        planId: planResult.insertedId,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        duration: 60, // 60 minutes
        notes: "Focused on understanding derivatives",
        productivity: 8
      });
      console.log("Created sample study session");
      
      // Create a sample AI recommendation
      const recommendationsCollection = database.collection("aiRecommendations");
      await recommendationsCollection.insertOne({
        userId: userResult.insertedId,
        content: "Based on your study patterns, try using the Pomodoro technique with 25-minute focused sessions.",
        type: "method",
        applied: false,
        createdAt: new Date()
      });
      console.log("Created sample AI recommendation");
      
      console.log("Sample data creation completed");
    }
    
    console.log("Database setup completed successfully!");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log("MongoDB connection closed");
  }
}

run().catch(console.dir);