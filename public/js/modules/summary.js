
const SummaryModule = {
  async summarizeVideo(videoId, button) {
    const summaryList = document.getElementById(`summary-${videoId}`);
    summaryList.innerHTML = `<li class="loading"><i class="fas fa-spinner fa-spin"></i> Generating summary...</li>`;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Working...';

    try {
      console.log(` Fetching summary for video: ${videoId}`);
      const response = await fetch(`${backendUrl}api/summarize?video_id=${videoId}`);
      
      console.log('🔧 Response status:', response.status);
      const data = await response.json();
      console.log(' Full API response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      // Debug the summary data structure
      console.log('Summary data:', data.summary);
      console.log('Summary type:', typeof data.summary);
      console.log('Is array?:', Array.isArray(data.summary));
      
      if (data.summary && Array.isArray(data.summary)) {
        console.log('Summary is array, length:', data.summary.length);
        
        // Map through each item and handle different formats
        summaryList.innerHTML = data.summary.map((item, index) => {
          console.log(` Item ${index}:`, item, 'Type:', typeof item);
          
          if (typeof item === 'string') {
            return `<li>${item}</li>`;
          } else if (item && typeof item === 'object') {
            // Handle object format - try different property names
            const text = item.text || item.summary || item.content || JSON.stringify(item);
            return `<li>${text}</li>`;
          } else {
            return `<li>Summary point ${index + 1}</li>`;
          }
        }).join('');
        
        // Add mind map button
        const mindmapBtn = document.createElement('button');
        mindmapBtn.className = 'action-btn mindmap';
        mindmapBtn.innerHTML = '<i class="fas fa-project-diagram"></i> Mind Map';
        mindmapBtn.onclick = () => window.mindMapManager.generateFromSummary(data.summary);
        
        const li = document.createElement('li');
        li.className = 'mindmap-container';
        li.appendChild(mindmapBtn);
        summaryList.appendChild(li);
        
      } else {
        console.log(' Summary is not array or is empty');
        throw new Error(data.error || "No summary generated or invalid format");
      }
    } catch (error) {
      console.error(' Summary error:', error);
      summaryList.innerHTML = `
        <li class="error">
          <i class="fas fa-exclamation-circle"></i> ${error.message}
        </li>
      `;
    } finally {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-align-left"></i> Summarize';
    }
  }
};