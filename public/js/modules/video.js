const VideoModule = {
  TRUSTED_SOURCES: [
    "wikipedia.org", "khanacademy.org", "britannica.com", "edu.gov",
    "academia.edu", "scholar.google.com", "coursera.org", "edx.org",
    "mit.edu", "harvard.edu", "stanford.edu", "tutorialspoint.com",
    "geeksforgeeks.org", "towardsdatascience.com", "medium.com/education",
    "arxiv.org", "ted.com", "youtube.com", "smithsonianmag.com"
  ],

  init() {
    this.loadPreviousSearch();
    this.bindEvents();
  },

  bindEvents() {
    document.querySelector(".search-container button").addEventListener("click", this.getRecommendations.bind(this));
    document.getElementById("searchQuery").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.getRecommendations();
    });
  },

  loadPreviousSearch() {
    const savedTopic = localStorage.getItem("lastTopic");
    if (savedTopic) {
      document.getElementById("searchQuery").value = savedTopic;
      this.getRecommendations();
    }
  },

  getRecommendations() {
    const topic = document.getElementById("searchQuery").value;
    if (topic) {
      localStorage.setItem("lastTopic", topic);
      this.fetchVideos(topic);
    }
  },

  async fetchVideos(topic) {
    const container = document.getElementById("videoList");
    container.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching videos...</div>`;

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(topic)}&maxResults=5&key=${apiKey}`
      );
      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        throw new Error("No videos found");
      }

      const videoIds = data.items.map(video => video.id.videoId).join(",");
      const statsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`
      );
      const statsData = await statsResponse.json();

      await this.displayVideoResults(data.items, statsData.items);
    } catch (error) {
      container.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> ${error.message || "Error loading videos"}</div>`;
      console.error("Video fetch error:", error);
    }
  },

  async displayVideoResults(videos, stats) {
    const container = document.getElementById("videoList");
    container.innerHTML = "";

    for (const video of videos) {
      const videoId = video.id.videoId;
      const statsInfo = stats.find(stat => stat.id === videoId)?.statistics || {};
      const likes = statsInfo.likeCount ? parseInt(statsInfo.likeCount).toLocaleString() : "N/A";
      const views = statsInfo.viewCount ? parseInt(statsInfo.viewCount).toLocaleString() : "N/A";

      const videoCard = document.createElement("div");
      videoCard.className = "video-card";
      videoCard.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
        <div class="video-content">
          <h3 class="video-title">${video.snippet.title}</h3>
          <div class="video-stats">
            <span><i class="fas fa-thumbs-up"></i> ${likes}</span>
            <span><i class="fas fa-eye"></i> ${views}</span>
          </div>
          <div class="video-actions">
            <button class="action-btn summarize" onclick="SummaryModule.summarizeVideo('${videoId}', this)">
              <i class="fas fa-align-left"></i> Summarize
            </button>
            <button class="action-btn quiz" onclick="QuestionModule.generateQuestions('${videoId}', this)">
              <i class="fas fa-question-circle"></i> Quiz
            </button>
            <button class="action-btn practice" onclick="PracticeModule.startPracticeMode('${videoId}')">
              <i class="fas fa-play-circle"></i> Practice
            </button>
          </div>
          <div class="video-results">
            <ul id="summary-${videoId}" class="summary-list"></ul>
            <div id="quiz-container-${videoId}" class="quiz-container" style="display:none"></div>
            <ul id="questions-${videoId}" class="question-list"></ul>
          </div>
        </div>
      `;

      container.appendChild(videoCard);
      await this.attachArticlesToCard(videoCard, video.snippet.title);
    }
  },

  async attachArticlesToCard(card, videoTitle) {
    const articlesContainer = document.createElement("div");
    articlesContainer.className = "video-articles";
    articlesContainer.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading articles...</div>`;
    card.querySelector(".video-content").appendChild(articlesContainer);

    try {
      const articles = await this.fetchEducationalArticles(videoTitle);
      articlesContainer.innerHTML = `
        <h4 class="articles-heading"><i class="fas fa-newspaper"></i> Related Articles</h4>
        <div class="articles-grid">
          ${articles.map(article => `
            <div class="article-card">
              <div class="article-header">
                <span class="article-source">${new URL(article.link).hostname}</span>
              </div>
              <h5 class="article-title">${article.title}</h5>
              <p class="article-snippet">${article.snippet}</p>
              <a href="${article.link}" target="_blank" class="article-link">
                <i class="fas fa-external-link-alt"></i> Read Article
              </a>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      articlesContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> ${error.message}</div>`;
    }
  },

  async fetchEducationalArticles(query) {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query + " educational article")}&num=5`
    );
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("No articles found");
    }

    return data.items
      .filter(item => this.TRUSTED_SOURCES.some(source => item.link.includes(source)))
      .slice(0, 4);
  }
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  VideoModule.init();
});