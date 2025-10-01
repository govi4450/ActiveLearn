from youtube_transcript_api import YouTubeTranscriptApi
import sys
import json
                                                                                                             
def get_transcript(video_id):
    try:
        # CORRECT: Create an instance and call fetch() method
        ytt_api = YouTubeTranscriptApi()
        transcript = ytt_api.fetch(video_id, languages=['en', 'hi'])
        
        # Extract text from transcript snippets
        transcript_texts = [snippet.text for snippet in transcript.snippets]
        
        return {
            'success': True,
            'transcript': transcript_texts,
            'error': None
        }
    except Exception as e:
        return {
            'success': False,
            'transcript': None,
            'error': str(e)
        }
                                                                                                     
if __name__ == "__main__":
    if len(sys.argv) > 1:
        video_id = sys.argv[1]
        result = get_transcript(video_id)
        print(json.dumps(result))
    else:
        print(json.dumps({
            'success': False,
            'transcript': None,
            'error': 'No video ID provided'
        }))