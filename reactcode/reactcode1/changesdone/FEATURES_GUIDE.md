# 🎓 ActiveLearn - Features Guide

## 📝 Notes Feature - How It Works

### **Taking Notes While Watching Videos**

1. **Open Notes Panel**
   - Click the **"📝 Notes"** button on any video card
   - Side panel slides in from the right

2. **Capture Timestamp**
   - Click **"⏱️ Capture Time"** button
   - Current moment is captured automatically
   - OR manually enter seconds in the input field

3. **Write Your Note**
   - Type what you learned in the text area
   - Example: "Newton's Third Law explained with examples"

4. **Save Note**
   - Click **"+ Add Note at [time]"**
   - Note is saved with timestamp to database

5. **View All Notes**
   - See all notes for THIS video in the panel
   - OR go to Dashboard → Notes Tab to see ALL notes from ALL videos

### **Note: Timestamp Capture**
Since YouTube iframe doesn't allow direct access to video time without complex API setup, the current implementation provides:
- **"Capture Time" button** - Captures the moment you click it
- **Manual input** - Enter the video time in seconds (e.g., 135 for 2:15)

**Recommended Usage:**
- Pause the video at important moments
- Note the time from YouTube player (e.g., 2:15)
- Enter 135 seconds (2×60 + 15)
- Or just click "Capture Time" when you want to take a note

---

## 🏆 Achievements System - 13 Badges

### **Video Watching Badges (5 badges)**

| Badge | Icon | Unlock Condition | Description |
|-------|------|------------------|-------------|
| **First Steps** | 🎬 | Watch 1 video | Watched your first video |
| **Explorer** | 🔍 | Watch 5 videos | Watched 5 videos |
| **Knowledge Seeker** | 📚 | Watch 10 videos | Watched 10 videos |
| **Learning Enthusiast** | 🌟 | Watch 25 videos | Watched 25 videos |
| **Master Learner** | 🏆 | Watch 50 videos | Watched 50 videos |

### **Quiz Badges (2 badges)**

| Badge | Icon | Unlock Condition | Description |
|-------|------|------------------|-------------|
| **Quiz Starter** | 📝 | Complete 1 quiz | Completed your first quiz |
| **Quiz Master** | 🎓 | Complete 10 quizzes | Completed 10 quizzes |

### **Score Badges (2 badges)**

| Badge | Icon | Unlock Condition | Description |
|-------|------|------------------|-------------|
| **Perfect Score** | 💯 | Score 100% on any quiz | Scored 100% on a quiz |
| **High Scorer** | ⭐ | Average score above 80% | Average score above 80% |

### **Streak Badges (3 badges)**

| Badge | Icon | Unlock Condition | Description |
|-------|------|------------------|-------------|
| **3-Day Streak** | 🔥 | Learn for 3 days in a row | Learned for 3 days in a row |
| **Week Warrior** | 💪 | Learn for 7 days in a row | Learned for 7 days in a row |
| **Monthly Champion** | 👑 | Learn for 30 days in a row | Learned for 30 days in a row |

### **Special Badge (1 badge)**

| Badge | Icon | Unlock Condition | Description |
|-------|------|------------------|-------------|
| **Early Bird** | 🌅 | Join the platform | Joined the platform |

### **How Achievements Unlock**

Achievements are **automatically unlocked** when you meet the conditions. The system tracks:
- Number of unique videos watched
- Number of completed quizzes
- Quiz scores and averages
- Days with learning activity

**Note:** Currently, achievements need to be manually triggered via the backend API. In a future update, they can be auto-triggered when users complete actions.

---

## 📊 Quiz System - Why Count Shows 0

### **How Quizzes Are Counted**

A quiz is counted as **"completed"** ONLY when:
1. ✅ You answer ALL questions in the quiz
2. ✅ The system marks `completed: true` in the database

### **Current Behavior**

If you:
- Answer 3 out of 5 questions → **NOT counted** (incomplete)
- Answer 5 out of 5 questions → **COUNTED** (complete)

### **Why Your Quiz Shows 0**

You likely:
1. Started a quiz but didn't finish all questions
2. Closed the quiz modal before completing
3. Answered some questions but not all

### **How to Complete a Quiz**

1. Click **"Quiz"** button on a video
2. Answer **ALL questions** one by one
3. Submit each answer
4. Complete the entire quiz
5. Check Dashboard → Quiz count updates

### **Technical Details**

From `backend/routes/dashboard.js` line 29:
```javascript
const totalQuizzes = progressRecords.filter(p => p.completed).length;
```

From `backend/controllers/questionController.js` line 225-226:
```javascript
const totalQuestionsForVideo = await Question.countDocuments({ videoId: video_id });
progress.completed = progress.responses.length >= totalQuestionsForVideo;
```

---

## 🎯 Goals System

### **Creating Goals**

1. Go to **Dashboard → Goals Tab**
2. Click **"+ Add Goal"**
3. Select:
   - **Type**: Daily, Weekly, Monthly, Custom
   - **Metric**: Videos, Quizzes, Study Time, Score
   - **Target**: Number to achieve (e.g., 5 videos)
   - **End Date**: Deadline

4. Click **"Create Goal"**

### **Goal Types**

- **Daily**: Complete by end of day
- **Weekly**: Complete by end of week
- **Monthly**: Complete by end of month
- **Custom**: Set your own deadline

### **Metrics**

- **Videos**: Number of videos to watch
- **Quizzes**: Number of quizzes to complete
- **Study Time**: Hours to study
- **Score**: Average score to achieve

### **Tracking Progress**

Goals show:
- Progress bar (visual)
- Current / Target (e.g., 3/5 videos)
- Percentage complete
- Days remaining

---

## 📚 Bookmarks System

### **Bookmarking Videos**

1. Find a video you like
2. Click the **⭐ Bookmark** button (top of video card)
3. Video is saved to your bookmarks

### **Viewing Bookmarks**

1. Go to **Dashboard → Bookmarks Tab**
2. See all bookmarked videos
3. Click **"View"** to watch again
4. Click **"Remove"** to unbookmark

### **Bookmark Features**

- Video thumbnail saved
- Video title saved
- Timestamp of when bookmarked
- Optional notes (future feature)

---

## 📈 Performance Charts

### **What Charts Show**

1. **Activity Bar Chart**
   - Videos watched
   - Quizzes completed
   - Practice sessions

2. **Score Gauge**
   - Your average quiz score
   - Visual circular gauge
   - Color-coded performance

### **Where to Find**

Dashboard → Overview Tab → Performance Charts section

---

## 🔧 Troubleshooting

### **Quiz Count Not Updating**

**Problem**: Completed quiz but count shows 0

**Solution**:
1. Make sure you answered ALL questions
2. Don't close quiz modal until finished
3. Check if quiz shows "Completed" status
4. Refresh dashboard page

### **Notes Not Saving**

**Problem**: Notes disappear after adding

**Solution**:
1. Make sure you're logged in
2. Check internet connection
3. Verify note content is not empty
4. Check browser console for errors

### **Achievements Not Unlocking**

**Problem**: Met condition but badge not unlocked

**Solution**:
1. Achievements currently need manual triggering
2. Backend needs to call unlock API
3. Future update will auto-unlock
4. Check Dashboard → Achievements to see unlocked badges

### **Bookmarks Not Showing**

**Problem**: Bookmarked video but not in list

**Solution**:
1. Refresh the bookmarks tab
2. Check if you're logged in as same user
3. Verify bookmark button showed "Bookmarked" after clicking

---

## 🚀 Quick Start Guide

### **For New Users**

1. **Register/Login**
   - Create account or login
   - Username will be used for all features

2. **Watch Your First Video**
   - Search for a topic (e.g., "Physics")
   - Click on a video to watch
   - Unlock "First Steps" achievement 🎬

3. **Take Notes**
   - Click "📝 Notes" button
   - Capture timestamp
   - Write what you learned
   - Save note

4. **Complete a Quiz**
   - Click "Quiz" button
   - Answer ALL questions
   - Check your score
   - Unlock "Quiz Starter" achievement 📝

5. **Set a Goal**
   - Go to Dashboard → Goals
   - Create your first goal
   - Track your progress

6. **Bookmark Favorites**
   - Click ⭐ on videos you like
   - Access them quickly from Dashboard

7. **Track Progress**
   - Check Dashboard → Overview
   - See your stats and charts
   - View achievements

---

## 📱 Mobile Experience

All features are **fully responsive**:

- **Desktop**: Full side-by-side layout
- **Tablet**: Optimized spacing
- **Mobile**: Bottom panels and stacked layouts

---

## 🎨 Dark Mode

All features support **dark mode**:

- Toggle dark mode from settings
- All panels, buttons, and text adapt
- Easy on the eyes for night studying

---

## 💡 Tips for Best Experience

1. **Complete Quizzes Fully**
   - Don't skip questions
   - Finish entire quiz for accurate tracking

2. **Take Notes Regularly**
   - Pause video at key moments
   - Write clear, concise notes
   - Review notes before exams

3. **Set Realistic Goals**
   - Start small (e.g., 3 videos/week)
   - Increase gradually
   - Celebrate achievements

4. **Use Bookmarks Wisely**
   - Bookmark videos you'll revisit
   - Remove old bookmarks
   - Organize by topic (future feature)

5. **Track Your Progress**
   - Check dashboard daily
   - Monitor your streak
   - Aim for consistency

---

## 🔮 Future Features (Planned)

- ⏰ Auto-capture video timestamp from YouTube API
- 🏷️ Tags for bookmarks and notes
- 📁 Folders for organizing content
- 🔔 Goal reminders and notifications
- 🤝 Share notes with friends
- 📊 Advanced analytics and insights
- 🎯 Custom achievement creation
- 🔄 Sync across devices

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Verify you're logged in
3. Check browser console for errors
4. Ensure backend server is running
5. Restart both frontend and backend

---

**Happy Learning! 🎓✨**
