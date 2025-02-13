import re
from typing import Dict, List, Union, Any, Tuple
import logging

logger = logging.getLogger(__name__)

def clean_text_dict(d: Union[bytes, Dict, List, Any]) -> Union[str, Dict, List, Any]:
    """Clean and decode text from various formats."""
    if isinstance(d, bytes):
        return d.decode('utf-8', errors='ignore')
    if isinstance(d, dict):
        return {k: clean_text_dict(v) for k, v in d.items()}
    if isinstance(d, list):
        return [clean_text_dict(item) for item in d]
    return d

def clean_raw_text2(text: str) -> Tuple[str, Dict]:
    """Clean raw text and extract metadata."""
    page_metadata = {
        'unit_number': None,
        'unit_title': None
    }
    
    lines = text.splitlines()
    if not lines:
        return "", page_metadata
    
    # Extract unit info
    first_line = lines[0]
    last_line = lines[-1]

    # Process unit information
    if "unit" in first_line.lower():
        unit_info = first_line.lower().split("unit")
        if len(unit_info) > 1:
            number_title = unit_info[1].split(":", 1)
            if len(number_title) > 1:
                page_metadata['unit_number'] = number_title[0].strip()
                page_metadata['unit_title'] = number_title[1].strip()
            lines = lines[1:]
    elif "unit" in last_line.lower():
        unit_info = last_line.lower().split("unit")
        if len(unit_info) > 1:
            number_title = unit_info[1].split(":", 1)
            if len(number_title) > 1:
                page_metadata['unit_number'] = number_title[0].strip()
                page_metadata['unit_title'] = number_title[1].strip()
            lines = lines[:-1]

    # Clean and join lines
    cleaned_lines = []
    for line in lines:
        line = line.strip()
        if line and not re.match(r'^[0-9]+$', line):
            cleaned_lines.append(line)

    cleaned_text = ' '.join(cleaned_lines)
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text)
    
    return cleaned_text.strip(), page_metadata

def clean_raw_text(text: str) -> tuple[str, dict]:
    """Clean raw text and extract metadata."""
    page_metadata = {
        'unit_number': None,
        'unit_title': None
    }    
 
    lines = text.splitlines()
    if not lines:
        return "", page_metadata    
    
    # Extract unit info before cleaning
    first_line = lines[0]
    last_line = lines[-1]
  
    # Check first line for unit info
    if first_line.lower().find("unit") != -1:
        try:
            unit_parts = first_line.lower().split("unit")[1].split(":")
            if len(unit_parts) > 1:
                page_metadata['unit_number'] = unit_parts[0].strip()
                page_metadata['unit_title'] = first_line.split(":")[1].strip()
            lines = lines[1:]
        except (IndexError, AttributeError) as e:
            logger.warning(f"Error parsing unit info from first line: {first_line}")
            logger.debug(f"Error details: {str(e)}")
    
    # Check last line for unit info if not found in first line
    elif last_line.lower().find("unit") != -1:
        try:
            unit_parts = last_line.lower().split("unit")[1].split(":")
            if len(unit_parts) > 1:
                page_metadata['unit_number'] = unit_parts[0].strip()
                page_metadata['unit_title'] = last_line.split(":")[1].strip()
            lines = lines[:-1]
        except (IndexError, AttributeError) as e:
            logger.warning(f"Error parsing unit info from last line: {last_line}")
            logger.debug(f"Error details: {str(e)}")
  
    # Rest of cleaning code
    lines = [line.strip() for line in lines if line.strip()]
    
    # Remove headers and footers
    lines = [line for line in lines 
            if not re.match(r'^[0-9]+$', line) 
            and not 'BIOLOGY GRADE 12' in line
            and not 'MINISTRY OF EDUCATION' in line
            and not 'FDRE-MoE ETHIOPIA' in line
            and not 'BIOLOGY GRADE 9' in line
            and not 'Grade 9 Biology' in line]
    
    # Join lines while preserving paragraphs
    current_paragraph = []
    cleaned_paragraphs = []
    
    for line in lines:
        # Check if line is a title or heading
        if re.match(r'^[0-9]+\.[0-9]+.*$', line) or line.isupper():
            if current_paragraph:
                cleaned_paragraphs.append(' '.join(current_paragraph))
                current_paragraph = []
            cleaned_paragraphs.append(line)
            continue
            
        # Check if line is a list item
        if re.match(r'^[0-9]+\.|\s*•|\s*-', line):
            if current_paragraph:
                cleaned_paragraphs.append(' '.join(current_paragraph))
                current_paragraph = []
            cleaned_paragraphs.append(line)
            continue
        
        # Check for end of paragraph
        if line.strip().endswith(('.', '?', '!')):
            current_paragraph.append(line)
            cleaned_paragraphs.append(' '.join(current_paragraph))
            current_paragraph = []
        else:
            current_paragraph.append(line)
    
    # Add any remaining paragraph
    if current_paragraph:
        cleaned_paragraphs.append(' '.join(current_paragraph))
    
    # Join paragraphs with double newlines
    final_text = '\n\n'.join(cleaned_paragraphs)  
    
    # Remove multiple spaces and newlines
    final_text = re.sub(r' +', ' ', final_text)
    final_text = re.sub(r'\n{3,}', '\n\n', final_text)

    return final_text.strip(), page_metadata
