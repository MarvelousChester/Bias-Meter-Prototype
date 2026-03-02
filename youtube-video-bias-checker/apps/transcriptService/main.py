import logging
import uvicorn
import urllib
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import requests
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# --- Definition Scraper Code ---

def get_ebsco_definition(keyword: str) -> dict:
    """
    Searches EBSCO Research Starters for a keyword's definition.
    """
    url_templates = [
        "https://www.ebsco.com/research-starters/diplomacy-and-international-relations/{keyword}",
        "https://www.ebsco.com/research-starters/political-science/{keyword}",
        "https://www.ebsco.com/research-starters/history/{keyword}",
        "https://www.ebsco.com/research-starters/psychology/{keyword}"
    ]
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    for template in url_templates:
        url = template.format(keyword=keyword)
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code != 200:
                logger.info(f"Skipping {url} (Status: {response.status_code})")
                continue
            soup = BeautifulSoup(response.text, 'html.parser')
            overview_h1 = soup.find('h1', id='research-starter-title')
            if overview_h1:
                next_el = overview_h1.next_sibling
                while next_el and next_el.name is None:
                    next_el = next_el.next_sibling
                if next_el and next_el.name == 'div':
                    
                    first_p = next_el.find('p')
                    definition = first_p.get_text(strip=True)
                    if definition:
                        logger.info(f"SUCCESS: Definition found at {url}")
                        return {
                            "Term": keyword,
                            "Definition": definition,
                            "Link": url
                        }
            else:
                logger.info(f"'Overview' H2 not found on {url}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Could not access {url}. Error: {e}")
            continue
    logger.warning(f"FAILURE: Definition not found for '{keyword}' in any source.")
    return {
        "Term": keyword,
        "Definition": "Definition not found.",
        "Link": ""
    }

@app.get("/api/python/definition/{encoded_keyword}")
def definition(encoded_keyword: str):
    keyword = (urllib.parse.unquote(encoded_keyword)).lower()
    return get_ebsco_definition(keyword)

# --- YouTube Transcript Code ---

ytt_api = YouTubeTranscriptApi()

def getYoutubeTranscript(video_id: str):
    logger.info(f"Fetching transcript for video_id: {video_id}")
    transcript = ytt_api.fetch(video_id)
    logger.info(f"Transcript fetched: {transcript[:100]}...")  # Log first 100 chars
    return transcript

@app.get("/api/python/{video_id}")
def get_transcript(video_id: str):
    try:
        logger.info(f"API called with video_id: {video_id}")
        transcript = getYoutubeTranscript(video_id)
        formatter = TextFormatter()
        formatted_transcript = formatter.format_transcript(transcript)
        return JSONResponse(content={"transcript": formatted_transcript}, status_code=200)
    except Exception as e:
        logger.error(f"Error fetching transcript: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)
# --- Main execution ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5328)