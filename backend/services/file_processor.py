import os
from pypdf import PdfReader
from PIL import Image
try:
    from pydub import AudioSegment
except ImportError:
    AudioSegment = None
try:
    from moviepy.editor import VideoFileClip
except ImportError:
    VideoFileClip = None

class FileProcessor:
    @staticmethod
    def process_file(file_path: str, filename: str) -> str:
        """
        Parses the uploaded file based on its extension and returns a text summary
        to be injected as context for the agents.
        """
        ext = os.path.splitext(filename)[1].lower()
        
        try:
            if ext == '.pdf':
                return FileProcessor._process_pdf(file_path)
            elif ext in ['.png', '.jpg', '.jpeg', '.webp']:
                return FileProcessor._process_image(file_path, filename)
            elif ext in ['.mp4', '.avi', '.mov', '.mkv']:
                return FileProcessor._process_video(file_path, filename)
            elif ext in ['.mp3', '.wav', '.ogg', '.m4a']:
                return FileProcessor._process_audio(file_path, filename)
            else:
                # Text or fallback
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read(2000)
                    return f"Text File '{filename}' contents (excerpt):\n{content}"
        except Exception as e:
            return f"File '{filename}' was uploaded but failed parsing: {str(e)}"

    @staticmethod
    def _process_pdf(file_path: str) -> str:
        reader = PdfReader(file_path)
        num_pages = len(reader.pages)
        text_content = ""
        # Extract text from first 3 pages
        for i in range(min(num_pages, 3)):
            page_text = reader.pages[i].extract_text()
            if page_text:
                text_content += f"\n--- Page {i+1} ---\n" + page_text
            
        return f"PDF Document with {num_pages} pages. Excerpt:\n{text_content[:2000]}"

    @staticmethod
    def _process_image(file_path: str, filename: str) -> str:
        with Image.open(file_path) as img:
            width, height = img.size
            mode = img.mode
            return f"Image file '{filename}' with resolution {width}x{height}, format {img.format}, mode {mode}."

    @staticmethod
    def _process_video(file_path: str, filename: str) -> str:
        if VideoFileClip:
            try:
                clip = VideoFileClip(file_path)
                duration = clip.duration
                size = clip.size
                clip.close()
                return f"Video file '{filename}', Duration: {duration:.2f}s, Resolution: {size[0]}x{size[1]}."
            except Exception as e:
                return f"Video file '{filename}' (moviepy failed: {e})."
        return f"Video file '{filename}' uploaded."

    @staticmethod
    def _process_audio(file_path: str, filename: str) -> str:
        if AudioSegment and AudioSegment:
            try:
                audio = AudioSegment.from_file(file_path)
                duration = len(audio) / 1000.0  # length in ms
                return f"Audio file '{filename}', Duration: {duration:.2f}s, Channels: {audio.channels}, Frame rate: {audio.frame_rate}Hz."
            except Exception as e:
                return f"Audio file '{filename}' (pydub failed: {e})."
        return f"Audio file '{filename}' uploaded."

file_processor = FileProcessor()
