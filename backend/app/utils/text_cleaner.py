import re
from typing import Dict, List, Union, Any, Tuple

def clean_text_dict(d: Union[bytes, Dict, List, Any]) -> Union[str, Dict, List, Any]:
    """Clean and decode text from various formats."""
    if isinstance(d, bytes):
        return d.decode('utf-8', errors='ignore')
    if isinstance(d, dict):
        return {k: clean_text_dict(v) for k, v in d.items()}
    if isinstance(d, list):
        return [clean_text_dict(item) for item in d]
    return d

def clean_raw_text(text: str) -> Tuple[str, Dict]:
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