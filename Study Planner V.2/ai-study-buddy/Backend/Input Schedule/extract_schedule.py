import os
import json
import base64
from openai import OpenAI

class ColumnBasedScheduleProcessor:
    def __init__(self):
        """
        Initialize the Schedule Processor with OpenAI client
        """
        self.api_key = "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"
        self.client = OpenAI(api_key=self.api_key)
        self.model = "gpt-4.1-nano-2025-04-14"

    def encode_image(self, image_path):
        """
        Encode image to base64 for API transmission
        """
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

    def process_schedule_image(self, image_path):
        """
        Process a schedule image using GPT-4.1 Nano and extract structured data
        """
        print("Processing schedule image...")
        
        try:
            # Encode image to base64
            base64_image = self.encode_image(image_path)
            
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

def extract_schedule(image_path):
    """
    Wrapper function to extract schedule from an image
    """
    processor = ColumnBasedScheduleProcessor()
    return processor.process_schedule_image(image_path)

# Main function to run the script
def main():
    # Set image path
    image_path = "Study Planner V.2\\ai-study-buddy\\Backend\\Input Schedule\\image.png"
    
    try:
        # Process the image and get the schedule
        schedule = extract_schedule(image_path)
        
        # Print the final schedule
        print("\nFinal Schedule:")
        print(json.dumps(schedule, indent=2))
    except Exception as e:
        print(f"Error processing schedule: {e}")

if __name__ == "__main__":
    main()