const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');

const execPromise = util.promisify(exec);

class TranscriptService {
  static async getVideoTranscript(videoId) {
    try {
      if (!videoId || typeof videoId !== 'string') {
        throw new Error('Invalid video ID');
      }

      const pythonScriptPath = path.join(__dirname, '../scripts/youtube_transcript.py');
      const venvPythonPath = path.join(__dirname, '../../venv/bin/python3'); // Virtual environment Python
      
      // Check if virtual environment exists, otherwise use system Python
      let pythonCommand = 'python3';
      try {
        await fs.access(venvPythonPath);
        pythonCommand = venvPythonPath;
        console.log('Using virtual environment Python');
      } catch {
        console.log('Using system Python');
      }

      // Verify Python script exists
      try {
        await fs.access(pythonScriptPath);
      } catch {
        throw new Error(`Python script not found at ${pythonScriptPath}`);
      }

      console.log(`Fetching transcript for video: ${videoId}`);
      
      // Check if Python is available
      try {
        await execPromise(`${pythonCommand} --version`);
      } catch {
        throw new Error('Python 3 is not installed or not in PATH');
      }

      const { stdout, stderr } = await execPromise(
        `"${pythonCommand}" "${pythonScriptPath}" "${videoId}"`,
        { timeout: 30000 }
      );

      if (stderr) {
        console.error('Python stderr:', stderr);
        if (stderr.includes('ModuleNotFoundError')) {
          throw new Error(`
Python dependencies not installed. Please run:

# Using virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate
pip install youtube-transcript-api

# Or using system Python
pip install youtube-transcript-api
          `);
        }
      }

      let result;
      try {
        result = JSON.parse(stdout);
      } catch (parseError) {
        console.error('Failed to parse Python script output:', stdout);
        throw new Error('Invalid response from transcript service');
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch transcript');
      }

      if (!result.transcript || result.transcript.length === 0) {
        throw new Error('Received empty transcript');
      }

      return result.transcript.join(' ');
    } catch (error) {
      console.error('Transcript fetch error:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('ModuleNotFoundError')) {
        throw new Error(`
Unable to fetch transcript: Python dependencies missing.

Please install the required Python package by running:

pip install youtube-transcript-api

Or if using Python 3 specifically:
pip3 install youtube-transcript-api

If you're still having issues, try creating a virtual environment:
python3 -m venv venv
source venv/bin/activate
pip install youtube-transcript-api
        `);
      }
      
      if (error.message.includes('Python 3 is not installed')) {
        throw new Error('Python 3 is required but not installed. Please install Python 3 and try again.');
      }
      
      throw new Error(`Could not get transcript: ${error.message}`);
    }
  }

  // Test Python environment
  static async testPythonEnvironment() {
    try {
      const venvPythonPath = path.join(__dirname, '../../venv/bin/python3');
      let pythonCommand = 'python3';
      
      try {
        await fs.access(venvPythonPath);
        pythonCommand = venvPythonPath;
      } catch {}
      
      // Test Python availability
      await execPromise(`${pythonCommand} --version`);
      
      // Test module availability
      await execPromise(`${pythonCommand} -c "import youtube_transcript_api; print('Module available')"`);
      
      return { success: true, message: 'Python environment is properly configured' };
    } catch (error) {
      return { 
        success: false, 
        message: 'Python environment issue: ' + error.message,
        solution: 'Run: pip install youtube-transcript-api'
      };
    }
  }
}

module.exports = TranscriptService;