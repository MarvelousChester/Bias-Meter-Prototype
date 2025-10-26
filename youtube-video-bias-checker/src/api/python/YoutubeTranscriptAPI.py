import logging
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import uvicorn
from youtube_transcript_api import YouTubeTranscriptApi

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI()
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
        return JSONResponse(content={"transcript": transcript.to_raw_data()}, status_code=200)
    except Exception as e:
        logger.error(f"Error fetching transcript: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5328)