/**
 * Test script for Article API
 * Run with: node test-article-api.js
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';

async function testArticleAPI() {
  console.log('🧪 Testing Article API...\n');

  try {
    // Test 1: Single video article fetch
    console.log('Test 1: Fetching articles for a single video');
    console.log('─'.repeat(50));
    
    const response = await axios.post(`${BACKEND_URL}/api/articles/test123`, {
      videoTitle: 'Introduction to Machine Learning - Neural Networks Explained'
    });

    if (response.data.success) {
      console.log('✅ Success!');
      console.log(`📰 Received ${response.data.count} articles:`);
      response.data.articles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`   Source: ${article.source}`);
        console.log(`   URL: ${article.url}`);
        console.log(`   Snippet: ${article.snippet.substring(0, 100)}...`);
      });
    } else {
      console.log('❌ Failed:', response.data);
    }

    console.log('\n' + '─'.repeat(50));
    console.log('\n✅ All tests completed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    console.log('\n💡 Make sure:');
    console.log('   1. Backend server is running (npm start)');
    console.log('   2. Environment variables are set in .env');
    console.log('   3. Google API keys are valid\n');
  }
}

// Run tests
testArticleAPI();
