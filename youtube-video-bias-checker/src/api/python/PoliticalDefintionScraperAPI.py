from fastapi import FastAPI
from fastapi.responses import JSONResponse
import logging
import requests
import json
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI()
def get_ebsco_definition(keyword: str) -> dict:
    
    """
    Searches EBSCO Research Starters for a keyword's definition.

    It checks three specific URLs in order. If a definition is found,
    it stops and returns the data.

    Args:
        keyword: The term to search for.

    Returns:
        A dictionary in the specified JSON format.
    """
    
    # URL templates in the specified order
    url_templates = [
        "https://www.ebsco.com/research-starters/diplomacy-and-international-relations/{keyword}",
        "https://www.ebsco.com/research-starters/political-science/{keyword}",
        "https://www.ebsco.com/research-starters/history/{keyword}"
    ]

    # Use a common User-Agent to avoid being blocked
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    for template in url_templates:
        # Format the URL with the keyword
        url = template.format(keyword=keyword)
        
        try:
            # 1. Attempt to access the webpage
            response = requests.get(url, headers=headers, timeout=10)
            
            # Skip if page not found (404) or other error
            if response.status_code != 200:
                print(f"INFO: Skipping {url} (Status: {response.status_code})")
                continue

            # Parse the HTML
            soup = BeautifulSoup(response.text, 'html.parser')

            # 2. Locate the <h2 id="overview">Overview</h2> element
            overview_h2 = soup.find('h2', id='overview')

            if overview_h2:
                # 3. Find the first <p> element that immediately follows
                
                # We loop through next_sibling to find the *first tag*
                # This correctly skips over whitespace and comments
                next_el = overview_h2.next_sibling
                while next_el and next_el.name is None: # Skips NavigableStrings, Comments, etc.
                    next_el = next_el.next_sibling
                
                # Check if the first tag found is a <p> tag
                if next_el and next_el.name == 'p':
                    # 4. Extract the text
                    definition = next_el.get_text(strip=True)
                    
                    if definition:
                        # 5. Success! Return the result and stop.
                        print(f"SUCCESS: Definition found at {url}")
                        return {
                            "Term": keyword,
                            "Definition": definition,
                            "Link": url
                        }

            else:
                print(f"INFO: 'Overview' H2 not found on {url}")

        except requests.exceptions.RequestException as e:
            # Handle connection errors, timeouts, etc.
            print(f"ERROR: Could not access {url}. Error: {e}")
            continue # Try the next URL

    # 6. If loop finishes, no definition was found
    print(f"FAILURE: Definition not found for '{keyword}' in any source.")
    return {
        "Term": keyword,
        "Definition": "Definition not found.",
        "Link": ""
    }

@app.get("/api/python/definition/{keyword}")
def definition(keyword: str):
    return get_ebsco_definition(keyword)
