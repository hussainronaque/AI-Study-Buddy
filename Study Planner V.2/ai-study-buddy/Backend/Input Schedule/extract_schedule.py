import os
import numpy as np
import cv2
from PIL import Image
import re
import json
import easyocr
from groq import Groq

class EnhancedScheduleProcessor:
    def __init__(self):
        """
        Initialize the Schedule Processor with EasyOCR
        """
        # Initialize EasyOCR reader
        self.reader = easyocr.Reader(['en'], gpu=False)  # Set gpu=True if you have GPU support
            
        # Set API key directly
        self.api_key = "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"
        self.client = Groq(api_key=self.api_key)

    def load_and_enhance_image(self, image_path):
        """
        Load image and enhance it for better OCR
        """
        try:
            # Load image with OpenCV
            img = cv2.imread(image_path)
            if img is None:
                # Try with PIL if OpenCV fails
                pil_img = Image.open(image_path)
                img = np.array(pil_img.convert('RGB'))
                img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                
            # Make a copy of original
            original = img.copy()
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply adaptive thresholding
            thresh = cv2.adaptiveThreshold(
                gray, 255, 
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY, 11, 2
            )
            
            # Denoise
            denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
            
            # Add dilation to connect broken text
            kernel = np.ones((1, 1), np.uint8)
            dilated = cv2.dilate(denoised, kernel, iterations=1)
            
            return {
                "original": original,
                "enhanced": dilated
            }
        except Exception as e:
            print(f"Image processing error: {e}")
            return None

    def extract_structured_text(self, image_path):
        """
        Extract text from the image using EasyOCR
        """
        # Enhance image
        images = self.load_and_enhance_image(image_path)
        
        if images is None:
            print("Failed to process image")
            return None

        # Extract text with bounding boxes
        try:
            # First try with enhanced image
            results = self.reader.readtext(images["enhanced"])
            if not results or len(results) < 5:  # If few results, try original
                results = self.reader.readtext(images["original"])
                
            # Each result is [bbox, text, confidence]
            return results
        except Exception as e:
            print(f"OCR Error: {e}")
            return None

    def detect_table_structure(self, ocr_results, image_shape):
        """
        Detect table structure from OCR results
        """
        if not ocr_results:
            return None
            
        # Group text by rows based on y-coordinate
        rows = {}
        for bbox, text, conf in ocr_results:
            # Get center y-coordinate
            center_y = sum([p[1] for p in bbox]) / 4
            
            # Group with tolerance
            row_found = False
            tolerance = 20  # Pixels
            for row_y in rows.keys():
                if abs(center_y - row_y) < tolerance:
                    rows[row_y].append((bbox, text, conf))
                    row_found = True
                    break
                    
            if not row_found:
                rows[center_y] = [(bbox, text, conf)]
                
        # Sort rows by y-coordinate
        sorted_rows = sorted(rows.items(), key=lambda x: x[0])
        
        # Within each row, sort by x-coordinate
        structured_rows = []
        for y, elements in sorted_rows:
            sorted_elements = sorted(elements, key=lambda x: x[0][0][0])  # Sort by left x-coordinate
            structured_rows.append([text for _, text, _ in sorted_elements])
            
        return structured_rows

    def clean_and_normalize_text(self, text):
        """
        Clean and normalize the extracted text
        """
        # Fix common OCR errors
        text = text.replace("OOAM", "00AM")
        text = text.replace("OOPM", "00PM")
        text = text.replace("1SAM", "15AM")
        text = text.replace("CAMpus", "Campus")
        
        # Fix time formats
        text = re.sub(r'(\d+)-(\d+)(AM|PM)', r'\1:\2 \3', text)
        text = re.sub(r'(\d+)\.(\d+)(AM|PM)', r'\1:\2 \3', text)
        
        # Fix course codes
        text = re.sub(r'CS\s*ICE', r'CS/CE', text)
        text = re.sub(r'(\d+)/(\d+)', r'\1/\2', text)
        
        # Normalize spacing
        text = re.sub(r'\s+', ' ', text)
        
        return text

    def extract_schedule_directly(self, raw_text):
        """
        Extract schedule information directly from text using regex patterns
        """
        # Clean and normalize the text
        text = self.clean_and_normalize_text(raw_text)
        
        # Define patterns
        course_pattern = re.compile(r'((?:CS|MGMT|PHIL|CE)(?:/[A-Z]+)?\s+\d+(?:[-/]\d+)?(?:-\w+)?(?:\s+\w+)?)')
        time_pattern = re.compile(r'(\d+:\d+\s*(?:AM|PM))\s*(?:-\s*(\d+:\d+\s*(?:AM|PM)))?')
        day_pattern = re.compile(r'\b(Monday|Tuesday|Wednesday|Thursday|Friday|M|T|W|R|F|TR|MWF)\b')
        
        # Split text into potential course blocks
        course_blocks = re.split(r'(?=(?:CS|MGMT|PHIL|CE)(?:/[A-Z]+)?\s+\d+)', text)
        course_blocks = [block for block in course_blocks if block.strip()]
        
        # Process each block independently
        schedule = []
        processed_entries = set()  # To track unique entries
        
        for block in course_blocks:
            # Extract course
            course_match = course_pattern.search(block)
            if not course_match:
                continue
                
            course = course_match.group(1).strip()
            
            # Fix common course code issues
            course = re.sub(r'(\d+)1(\d+)', r'\1/\2', course)  # Fix CS 3531374 → CS 353/374
            
            # Extract days
            day_matches = day_pattern.findall(block)
            course_days = []
            
            # Map full day names to abbreviations
            day_map = {
                'Monday': 'M',
                'Tuesday': 'T',
                'Wednesday': 'W',
                'Thursday': 'R',
                'Friday': 'F'
            }
            
            for day in day_matches:
                if day in day_map:
                    course_days.append(day_map[day])
                else:
                    course_days.append(day)
                    
            if not course_days:
                # If no specific days found, look for common patterns
                if "MWF" in block:
                    course_days = ["MWF"]
                elif "TR" in block:
                    course_days = ["TR"]
                elif "M" in block and "W" in block and "F" in block:
                    course_days = ["MWF"]
                elif "T" in block and "R" in block:
                    course_days = ["TR"]
                else:
                    continue  # Skip if no days can be determined
                    
            # Find times with improved pattern
            time_matches = time_pattern.findall(block)
            if time_matches:
                start_time = time_matches[0][0].strip()
                end_time = time_matches[0][1].strip() if time_matches[0][1] else ""
            else:
                # Try finding individual times
                single_time = re.search(r'(\d+:\d+\s*(?:AM|PM))', block)
                if single_time:
                    start_time = single_time.group(1).strip()
                    end_time = ""
                else:
                    continue  # Skip if no time can be determined
            
            # Clean up course name
            # Remove any trailing time or day information from course name
            course = re.sub(r'\b(MWF|TR|M|T|W|R|F)\b.*$', '', course).strip()
            course = re.sub(r'\d+:\d+\s*(?:AM|PM).*$', '', course).strip()
            
            # Create a unique entry key to avoid duplicates
            for day_group in course_days:
                entry_key = f"{course}|{day_group}|{start_time}"
                
                if entry_key not in processed_entries:
                    processed_entries.add(entry_key)
                    schedule.append({
                        "course": course,
                        "days": day_group,
                        "start_time": start_time,
                        "end_time": end_time
                    })
        
        return schedule

    def validate_schedule_entries(self, schedule):
        """
        Validate and clean schedule entries
        """
        if not schedule:
            return []
            
        validated_schedule = []
        seen_entries = set()
        
        for entry in schedule:
            # Check if entry has required fields
            if not all(k in entry for k in ["course", "days", "start_time"]):
                continue
                
            # Standardize course codes
            course = entry["course"]
            
            # Fix CS/CE formatting
            if "CS/CE" in course or "CS CE" in course or "CSCE" in course:
                course = re.sub(r'CS\s*/?\s*CE', 'CS/CE', course)
            
            # Fix course numbers with embedded delimiters
            course = re.sub(r'(\d+)[/\\|-](\d+)', r'\1/\2', course)
            
            # Standardize course code format (ensure space between dept and number)
            course = re.sub(r'([A-Z]+)(\d+)', r'\1 \2', course)
            
            # Fix time formats
            start_time = entry["start_time"]
            if start_time:
                # Ensure proper time format (e.g., "9:00 AM" instead of "9 AM")
                if re.match(r'^\d+\s*[AP]M$', start_time):
                    hour = re.match(r'^\d+', start_time).group(0)
                    ampm = re.search(r'[AP]M$', start_time).group(0)
                    start_time = f"{hour}:00 {ampm}"
                    
            end_time = entry.get("end_time", "")
            if end_time:
                # Ensure proper time format for end time
                if re.match(r'^\d+\s*[AP]M$', end_time):
                    hour = re.match(r'^\d+', end_time).group(0)
                    ampm = re.search(r'[AP]M$', end_time).group(0)
                    end_time = f"{hour}:00 {ampm}"
            
            # Ensure days are in standard format
            days = entry["days"]
            if days in ["M", "T", "W", "R", "F", "MWF", "TR"]:
                pass  # Already in standard format
            elif "monday" in days.lower() and "wednesday" in days.lower() and "friday" in days.lower():
                days = "MWF"
            elif "tuesday" in days.lower() and "thursday" in days.lower():
                days = "TR"
            
            # Create unique key for deduplication
            entry_key = f"{course}|{days}|{start_time}"
            if entry_key not in seen_entries:
                seen_entries.add(entry_key)
                
                # Create validated entry
                validated_entry = {
                    "course": course,
                    "days": days,
                    "start_time": start_time,
                    "end_time": end_time
                }
                
                validated_schedule.append(validated_entry)
        
        # Sort by course code for consistency
        validated_schedule.sort(key=lambda x: x["course"])
        
        return validated_schedule

    def process_with_groq_fallback(self, raw_text):
        """
        Process using direct extraction first, fallback to Groq
        """
        # First try direct extraction
        schedule = self.extract_schedule_directly(raw_text)
        
        # Validate and clean up the extracted schedule
        validated_schedule = self.validate_schedule_entries(schedule)
        
        # If we got reasonable results, return them
        if validated_schedule and len(validated_schedule) >= 3:
            return validated_schedule
            
        # Otherwise, try with Groq
        groq_schedule = self.process_schedule_with_groq(raw_text)
        
        # Validate and clean up Groq results as well
        validated_groq_schedule = self.validate_schedule_entries(groq_schedule)
        
        return validated_groq_schedule

    def process_schedule_with_groq(self, raw_text):
        """
        Process schedule text using Groq API with DeepSeek model
        """
        # Clean text before sending
        cleaned_text = self.clean_and_normalize_text(raw_text)
        
        # Prepare the prompt
        prompt = f"""
        You are a schedule parser assistant. Your task is to analyze OCR text from student schedules 
        and extract course information in a structured format. Pay close attention to course names, 
        days of the week, and time slots. 
        
        Here's an example:

        Example input:
        Spring 2023 Schedule CS/CE 390 Lecture MWF 10:30 AM - 11:20 AM MGMT 452-A TR 1:00 PM - 2:15 PM PHIL 201 MWF 8:00 AM - 8:50 AM

        Example output:
        [
          {{
            "course": "CS/CE 390 Lecture",
            "days": "MWF",
            "start_time": "10:30 AM",
            "end_time": "11:20 AM"
          }},
          {{
            "course": "MGMT 452-A",
            "days": "TR",
            "start_time": "1:00 PM",
            "end_time": "2:15 PM"
          }},
          {{
            "course": "PHIL 201",
            "days": "MWF",
            "start_time": "8:00 AM",
            "end_time": "8:50 AM"
          }}
        ]

        The input I'm giving you is from OCR on a schedule image, so there may be formatting issues. 
        I need you to carefully extract the course codes (like CS/CE 353/374), the days (like MWF or TR),
        and the time slots (like 8:00 AM - 9:15 AM).

        If course numbers appear to be merged (e.g., 3531374), carefully determine if this might be two 
        separate course numbers (e.g., 353/374) based on context.

        If days are listed as full names (Monday, Tuesday, etc.), convert them to the short form:
        Monday = M, Tuesday = T, Wednesday = W, Thursday = R, Friday = F

        Be sure to include both start_time and end_time whenever possible.

        Now analyze the following OCR text and extract the schedule information:

        {cleaned_text}

        Provide ONLY a JSON array response with no additional text.
        """

        # Call the Groq API with DeepSeek model
        try:
            response = self.client.chat.completions.create(
                model="deepseek-r1-distill-llama-70b",
                messages=[
                    {"role": "system", "content": "You are a schedule parser assistant. Respond ONLY with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.1
            )
            
            # Extract response content
            response_text = response.choices[0].message.content
            
            # Try to extract valid JSON from the response
            try:
                # First clean up the response - sometimes models add markdown code blocks
                cleaned_response = re.sub(r'```json|```', '', response_text).strip()
                parsed_schedule = json.loads(cleaned_response)
                return parsed_schedule
            except json.JSONDecodeError:
                # If direct parsing fails, try to find a JSON array in the text
                json_pattern = r'\[\s*{.*}\s*\]'
                json_match = re.search(json_pattern, response_text, re.DOTALL)
                
                if json_match:
                    json_text = json_match.group(0)
                    try:
                        parsed_schedule = json.loads(json_text)
                        return parsed_schedule
                    except json.JSONDecodeError:
                        pass
            
            # If all parsing attempts fail    
            print("Could not parse JSON from Groq response:")
            print(response_text)
            
            # Final fallback - extraction without LLM
            return self.extract_schedule_directly(cleaned_text)
            
        except Exception as e:
            print(f"Groq API Error: {e}")
            # Fallback to direct extraction
            return self.extract_schedule_directly(cleaned_text)

    def post_process_schedule(self, schedule):
        """
        Apply specific post-processing for university schedule format
        """
        # Corrections for specific courses
        corrected_schedule = []
        
        for entry in schedule:
            course = entry["course"]
            
            # Fix CS/CE course format
            if "CS" in course and any(num in course for num in ["353", "374"]):
                entry["course"] = "CS/CE 353/374"
                
            elif "CS" in course and any(num in course for num in ["412", "471"]):
                entry["course"] = "CS/CE 412/471"
            
            # Ensure L designations are properly formatted
            if "334L" in course:
                if "Laboratory" not in entry.get("type", ""):
                    entry["type"] = "Laboratory"
                    
            # Fix section numbers
            if "PHIL" in course and "122" in course:
                if "S3" not in course:
                    entry["course"] = "PHIL 122 - S3"
                    
            corrected_schedule.append(entry)
        
        return corrected_schedule

    def extract_cell_colors(self, image_path):
        """
        Extract colored cells from schedule image to aid in structure detection
        """
        img = cv2.imread(image_path)
        if img is None:
            return []
        
        # Convert to HSV for better color segmentation
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Define color ranges for different cell types
        # Green cells
        lower_green = np.array([30, 30, 100])
        upper_green = np.array([90, 255, 255])
        green_mask = cv2.inRange(hsv, lower_green, upper_green)
        
        # Orange/tan cells
        lower_orange = np.array([5, 30, 100])
        upper_orange = np.array([30, 255, 255])
        orange_mask = cv2.inRange(hsv, lower_orange, upper_orange)
        
        # Combine masks
        combined_mask = cv2.bitwise_or(green_mask, orange_mask)
        
        # Find contours
        contours, _ = cv2.findContours(combined_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Get cell information
        cells = []
        
        for contour in contours:
            if cv2.contourArea(contour) > 500:  # Filter small contours
                x, y, w, h = cv2.boundingRect(contour)
                
                # Determine cell color
                cell_region = hsv[y:y+h, x:x+w]
                average_hue = np.mean(cell_region[:,:,0])
                
                if 30 <= average_hue <= 90:
                    color = "green"
                else:
                    color = "orange"
                    
                cells.append({
                    "x": x, 
                    "y": y, 
                    "width": w, 
                    "height": h, 
                    "color": color
                })
        
        return cells

    def process_schedule_image(self, image_path):
        """
        Process a schedule image and extract structured data
        """
        print("Processing schedule image...")
        
        # Get OCR results
        ocr_results = self.extract_structured_text(image_path)
        
        if not ocr_results:
            print("No text detected in the image")
            return []
        
        # Convert OCR results to raw text
        raw_text = " ".join([text for _, text, _ in ocr_results])
        
        # Process the extracted text
        schedule = self.process_with_groq_fallback(raw_text)
        
        # Post-process to fix specific course codes
        schedule = self.post_process_schedule(schedule)
        
        # Combine related courses
        schedule = self.combine_related_courses(schedule)
        
        print("\nFinal Parsed Schedule:")
        print(json.dumps(schedule, indent=2))
        
        return schedule

    def process_schedule_text(self, schedule_text):
        """
        Process schedule text directly
        """
        # Clean the text
        cleaned_text = self.clean_and_normalize_text(schedule_text)
        
        print("Original Text:", schedule_text)
        print("Cleaned Text:", cleaned_text)
        
        # Try multiple parsing approaches
        parsed_schedule = self.process_with_groq_fallback(cleaned_text)
        
        # Final validation
        validated_schedule = self.validate_schedule_entries(parsed_schedule)
        
        # Post-process and combine related courses
        processed_schedule = self.post_process_schedule(validated_schedule)
        combined_schedule = self.combine_related_courses(processed_schedule)
        
        print("\nParsed Schedule:")
        print(json.dumps(combined_schedule, indent=2))
        
        return combined_schedule

    def combine_related_courses(self, schedule):
        """
        Combine related courses like CS/CE 353/374 that might be split across entries
        """
        if not schedule:
            return []
            
        # First, group courses by their base code (e.g., CS 353, CS/CE 353)
        course_groups = {}
        
        for entry in schedule:
            # Extract the base course code (department and number)
            course = entry["course"]
            
            # Extract just the course number without section/type
            match = re.search(r'([A-Z/]+)\s+(\d+)/?(\d+)?', course)
            if match:
                dept = match.group(1)
                num = match.group(2)
                base_key = f"{dept} {num}"
                
                if base_key not in course_groups:
                    course_groups[base_key] = []
                    
                course_groups[base_key].append(entry)
        
        # Combine related entries
        combined_schedule = []
        processed_keys = set()
        
        for base_key, entries in course_groups.items():
            if base_key in processed_keys:
                continue
                
            # Look for related course codes
            related_keys = []
            for other_key in course_groups.keys():
                if base_key != other_key and (base_key in other_key or other_key in base_key):
                    related_keys.append(other_key)
            
            if related_keys:
                # Combine related courses
                all_entries = entries.copy()
                for related_key in related_keys:
                    all_entries.extend(course_groups[related_key])
                    processed_keys.add(related_key)
                
                # Find the most descriptive course name
                course_names = [e["course"] for e in all_entries]
                best_name = max(course_names, key=len)
                
                # Get unique days and times
                unique_schedule_entries = {}
                for entry in all_entries:
                    key = f"{entry['days']}|{entry['start_time']}"
                    if key not in unique_schedule_entries:
                        unique_schedule_entries[key] = entry
                
                # Add each unique time slot
                for unique_entry in unique_schedule_entries.values():
                    combined_entry = {
                        "course": best_name,
                        "days": unique_entry["days"],
                        "start_time": unique_entry["start_time"],
                        "end_time": unique_entry.get("end_time", "")
                    }
                    combined_schedule.append(combined_entry)
                    
                processed_keys.add(base_key)
            else:
                # No related courses, add entries directly
                combined_schedule.extend(entries)
                processed_keys.add(base_key)
        
        return combined_schedule
    
def extract_schedule(image_path: str = None, text: str = None) -> list:
    """
    Wrapper around EnhancedScheduleProcessor to unify image/text input.
    """
    processor = EnhancedScheduleProcessor()
    if image_path:
        return processor.process_schedule_image(image_path)
    elif text:
        return processor.process_schedule_text(text)
    else:
        raise ValueError("Either image_path or text must be provided")

# Example usage
def main():
    processor = EnhancedScheduleProcessor()

    use_ocr = 'y' 
    
    try:
        if use_ocr == 'y':
            # Get image path from user
            image_path = "Study Planner V.2\\ai-study-buddy\\Backend\\Input Schedule\\image.png"
            schedule = processor.process_schedule_image(image_path)
            
            print("\nFinal Schedule:")
            print(json.dumps(schedule, indent=2))
        else:
            # Get schedule text directly
            print("Enter your schedule text (press Enter twice when done):")
            lines = []
            while True:
                line = input()
                if line.strip() == "":
                    break
                lines.append(line)
            
            schedule_text = " ".join(lines)
            schedule = processor.process_schedule_text(schedule_text)
            
            print("\nFinal Schedule:")
            print(json.dumps(schedule, indent=2))
    except Exception as e:
        print(f"Error processing schedule: {e}")

if __name__ == "__main__":
    main()