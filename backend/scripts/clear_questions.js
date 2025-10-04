require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Question = require('../models/Question');

async function clearAllQuestions() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Deleting all questions...');
    const result = await Question.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} questions`);

    console.log('📊 Current question count:', await Question.countDocuments());
    
    await mongoose.connection.close();
    console.log('👋 Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearAllQuestions();
