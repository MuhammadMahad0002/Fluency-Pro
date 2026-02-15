import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  Play, 
  Trophy, 
  Clock, 
  Target,
  BarChart3,
  ChevronRight,
  Loader,
  History,
  X,
  ChevronLeft,
  Calendar
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [topScores, setTopScores] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // History modal state
  const [showHistory, setShowHistory] = useState(false);
  const [allScores, setAllScores] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState(null);

  const durations = [
    { id: '2-minute', label: '2 Minutes', time: '2 min', words: '~260 words' },
    { id: '5-minute', label: '5 Minutes', time: '5 min', words: '~650 words' },
    { id: '10-minute', label: '10 Minutes', time: '10 min', words: '~1300 words' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [topicsRes, scoresRes, statsRes] = await Promise.all([
        axios.get('/api/speech/topics'),
        axios.get('/api/scores/top'),
        axios.get('/api/scores/stats')
      ]);
      
      setTopics(topicsRes.data.topics);
      setTopScores(scoresRes.data.scores);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = () => {
    if (selectedTopic && selectedDuration) {
      navigate('/practice', { 
        state: { 
          topic: selectedTopic, 
          duration: selectedDuration 
        } 
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchScoreHistory = async (page = 1) => {
    try {
      setHistoryLoading(true);
      const response = await axios.get(`/api/scores/history?page=${page}&limit=10`);
      setAllScores(response.data.scores);
      setHistoryPagination(response.data.pagination);
      setHistoryPage(page);
    } catch (error) {
      console.error('Error fetching score history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openHistoryModal = () => {
    setShowHistory(true);
    fetchScoreHistory(1);
  };

  const closeHistoryModal = () => {
    setShowHistory(false);
    setAllScores([]);
    setHistoryPage(1);
    setHistoryPagination(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container header-container">
          <Link to="/" className="logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">Fluency<span className="gradient-text">Pro</span></span>
          </Link>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
            </div>
            <button className="btn btn-secondary" onClick={handleLogout}>
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          {/* Welcome Section */}
          <motion.section 
            className="welcome-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>Welcome back, <span className="gradient-text">{user?.firstName}</span>! 👋</h1>
            <p>Ready to improve your English fluency? Select a topic and duration to start practicing.</p>
          </motion.section>

          {/* Stats Section */}
          {stats && stats.totalSessions > 0 && (
            <motion.section 
              className="stats-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="stats-grid">
                <div className="stat-card glass-card">
                  <div className="stat-icon-wrapper">
                    <BarChart3 size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{stats.totalSessions}</span>
                    <span className="stat-label">Sessions</span>
                  </div>
                </div>
                <div className="stat-card glass-card">
                  <div className="stat-icon-wrapper">
                    <Trophy size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{Math.round(stats.averageScore)}</span>
                    <span className="stat-label">Avg Score</span>
                  </div>
                </div>
                <div className="stat-card glass-card">
                  <div className="stat-icon-wrapper">
                    <Target size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{Math.round(stats.averageAccuracy)}%</span>
                    <span className="stat-label">Accuracy</span>
                  </div>
                </div>
                <div className="stat-card glass-card">
                  <div className="stat-icon-wrapper">
                    <Clock size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{formatTime(Math.round(stats.totalTimePracticed))}</span>
                    <span className="stat-label">Practiced</span>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          <div className="dashboard-grid">
            {/* Practice Section */}
            <motion.section 
              className="practice-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="section-title">Start Practice</h2>
              
              {/* Topics */}
              <div className="selection-block">
                <h3>Choose a Topic</h3>
                <div className="topics-grid">
                  {topics.map((topic) => (
                    <motion.button
                      key={topic.id}
                      className={`topic-card glass-card ${selectedTopic?.id === topic.id ? 'selected' : ''}`}
                      onClick={() => setSelectedTopic(topic)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="topic-icon">{topic.icon}</span>
                      <span className="topic-name">{topic.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="selection-block">
                <h3>Select Duration</h3>
                <div className="duration-grid">
                  {durations.map((duration) => (
                    <motion.button
                      key={duration.id}
                      className={`duration-card glass-card ${selectedDuration?.id === duration.id ? 'selected' : ''}`}
                      onClick={() => setSelectedDuration(duration)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="duration-time">{duration.time}</span>
                      <span className="duration-words">{duration.words}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <button 
                className={`btn btn-primary btn-large start-btn ${(!selectedTopic || !selectedDuration) ? 'btn-disabled' : ''}`}
                onClick={handleStartPractice}
                disabled={!selectedTopic || !selectedDuration}
              >
                <Play size={20} />
                Start Practice
                <ChevronRight size={20} />
              </button>

              {selectedTopic && selectedDuration && (
                <motion.p 
                  className="selection-summary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Selected: <strong>{selectedTopic.icon} {selectedTopic.name}</strong> • <strong>{selectedDuration.label}</strong>
                </motion.p>
              )}
            </motion.section>

            {/* Top Scores Section */}
            <motion.section 
              className="scores-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="section-title">
                <Trophy size={24} className="title-icon" />
                Top 5 Scores
              </h2>
              
              {topScores.length > 0 ? (
                <div className="scores-list">
                  {topScores.map((score, index) => (
                    <motion.div 
                      key={score._id} 
                      className="score-item glass-card"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="score-rank">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div className="score-details">
                        <span className="score-topic">{score.topic}</span>
                        <span className="score-meta">
                          {score.duration} • {Math.round(score.accuracy)}% accuracy
                        </span>
                      </div>
                      <div className="score-value">{score.score}</div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-scores glass-card">
                  <Trophy size={48} className="empty-icon" />
                  <p>No scores yet</p>
                  <span>Complete your first practice session to see your scores here!</span>
                </div>
              )}

              {/* View All Scores Button */}
              {topScores.length > 0 && (
                <button className="btn btn-secondary view-all-btn" onClick={openHistoryModal}>
                  <History size={18} />
                  View All Scores
                </button>
              )}
            </motion.section>
          </div>
        </div>
      </main>

      {/* Score History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            className="history-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeHistoryModal}
          >
            <motion.div 
              className="history-modal glass-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="history-modal-header">
                <h2>
                  <History size={24} />
                  Score History
                </h2>
                <button className="close-btn" onClick={closeHistoryModal}>
                  <X size={24} />
                </button>
              </div>

              <div className="history-modal-content">
                {historyLoading ? (
                  <div className="history-loading">
                    <Loader className="spin" size={32} />
                    <p>Loading scores...</p>
                  </div>
                ) : allScores.length > 0 ? (
                  <div className="history-list">
                    {allScores.map((score, index) => (
                      <motion.div 
                        key={score._id} 
                        className="history-item"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <div className="history-item-left">
                          <div className="history-score-badge">
                            {score.score}
                          </div>
                          <div className="history-details">
                            <span className="history-topic">{score.topic}</span>
                            <span className="history-meta">
                              {score.duration} • {score.wordsMatched}/{score.totalWords} words • {Math.round(score.accuracy)}% accuracy
                            </span>
                          </div>
                        </div>
                        <div className="history-item-right">
                          <div className="history-time">
                            <Clock size={14} />
                            {formatTime(score.timeTaken)}
                          </div>
                          <div className="history-date">
                            <Calendar size={14} />
                            {formatDate(score.createdAt)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="history-empty">
                    <Trophy size={48} />
                    <p>No scores recorded yet</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {historyPagination && historyPagination.pages > 1 && (
                <div className="history-pagination">
                  <button 
                    className="pagination-btn"
                    disabled={historyPage <= 1}
                    onClick={() => fetchScoreHistory(historyPage - 1)}
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {historyPage} of {historyPagination.pages}
                  </span>
                  <button 
                    className="pagination-btn"
                    disabled={historyPage >= historyPagination.pages}
                    onClick={() => fetchScoreHistory(historyPage + 1)}
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {historyPagination && (
                <div className="history-total">
                  Total: {historyPagination.total} practice sessions
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
