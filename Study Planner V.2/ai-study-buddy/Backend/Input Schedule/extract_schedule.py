import os
import json
import base64
from openai import OpenAI
from dotenv import load_dotenv

class SimplifiedScheduleProcessor:
    def __init__(self):
        """
        Initialize the Schedule Processor with OpenAI client
        """
        # Load environment variables from .env file
        load_dotenv()
        
        # Get API key from environment variables
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
            
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
            
            # Prepare the prompt
            prompt = """
            You are a schedule parser assistant. Your task is to analyze this student schedule image
            and extract course information in a structured format. Pay close attention to course names, 
            days of the week, and time slots.
            
            For each course entry, extract:
            - Course name and number (e.g., "CS/CE 353/374", "PHIL 122")
            - Days of the week (use short form: M, T, W, R, F, TR, MWF)
            - Start time (e.g., "10:30 AM")
            - End time (e.g., "11:20 AM")
            
            Return your response as a JSON array of objects, where each object represents one course with
            the following properties: "course", "days", "start_time", "end_time".
            
            Be precise with course codes. If course numbers appear to be merged (e.g., 3531374), 
            determine if this might be two separate course numbers (e.g., 353/374).
            
            If days are listed as full names (Monday, Tuesday, etc.), convert them to the short form:
            Monday = M, Tuesday = T, Wednesday = W, Thursday = R, Friday = F
            
            Provide ONLY the JSON array response with no additional text.
            """
            
            # Call the OpenAI API with GPT-4.1 Nano model
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a schedule parser assistant. Respond ONLY with valid JSON."},
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
    processor = SimplifiedScheduleProcessor()
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