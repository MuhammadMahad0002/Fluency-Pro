import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Mic, 
  MicOff, 
  ArrowLeft, 
  Clock, 
  Target,
  Trophy,
  RotateCcw,
  Home,
  Volume2,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  SkipForward
} from 'lucide-react';
import './PracticePage.css';

const PracticePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { topic, duration } = location.state || {};

  // State
  const [speechText, setSpeechText] = useState('');
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [isPracticeComplete, setIsPracticeComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Live transcript state - shows what mic is hearing
  const [liveTranscript, setLiveTranscript] = useState('');
  const [micStatus, setMicStatus] = useState('idle'); // idle, listening, error
  
  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [expectedTime, setExpectedTime] = useState(0);
  
  // Results state
  const [matchedWords, setMatchedWords] = useState(0);
  const [skippedWords, setSkippedWords] = useState(0);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [timeScore, setTimeScore] = useState(0);
  const [topScores, setTopScores] = useState([]);
  const [savingScore, setSavingScore] = useState(false);
  const [vocabulary, setVocabulary] = useState([]);

  // Refs for tracking state without closure issues
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const textContainerRef = useRef(null);
  const currentIndexRef = useRef(0);
  const matchedCountRef = useRef(0);
  const skippedCountRef = useRef(0);
  const wordsRef = useRef([]);
  const isListeningRef = useRef(false);
  const isPracticeCompleteRef = useRef(false);
  const restartTimeoutRef = useRef(null);
  const processedWordsRef = useRef(new Set());
  const silenceTimeoutRef = useRef(null);
  const watchdogRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const recognitionActiveRef = useRef(false);

  // Redirect if no topic/duration selected
  useEffect(() => {
    if (!topic || !duration) {
      navigate('/dashboard');
    }
  }, [topic, duration, navigate]);

  // Fetch speech text
  useEffect(() => {
    if (topic && duration) {
      fetchSpeech();
    }
  }, [topic, duration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecognition();
    };
  }, []);

  // Auto-scroll to current word
  useEffect(() => {
    if (textContainerRef.current && currentWordIndex > 0) {
      const currentWordElement = textContainerRef.current.querySelector('.word-current');
      if (currentWordElement) {
        currentWordElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentWordIndex]);

  const cleanupRecognition = (clearTimer = true) => {
    // Stop watchdog
    if (watchdogRef.current) {
      clearInterval(watchdogRef.current);
      watchdogRef.current = null;
    }
    
    recognitionActiveRef.current = false;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (clearTimer && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  const fetchSpeech = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/speech/generate', {
        topic: topic.name,
        duration: duration.id
      });
      
      setSpeechText(response.data.speechText);
      setExpectedTime(response.data.expectedTime);
      
      // Store vocabulary words
      if (response.data.vocabulary) {
        setVocabulary(response.data.vocabulary);
      }
      
      // Parse words - clean and prepare
      const wordList = response.data.speechText
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map((word, index) => ({
          text: word,
          cleanText: word.replace(/[^a-zA-Z0-9']/g, '').toLowerCase(),
          index,
          matched: false
        }));
      
      setWords(wordList);
      wordsRef.current = wordList;
      setLoading(false);
    } catch (error) {
      console.error('Error fetching speech:', error);
      setError('Failed to generate speech. Please try again.');
      setLoading(false);
    }
  };

  const createRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setMicStatus('listening');
      setError('');
      recognitionActiveRef.current = true;
      lastActivityRef.current = Date.now();
    };

    recognition.onresult = (event) => {
      if (isPracticeCompleteRef.current) return;
      
      // Update activity timestamp on every result
      lastActivityRef.current = Date.now();
      recognitionActiveRef.current = true;

      let interimTranscript = '';
      let finalTranscript = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update live transcript display (shows what mic is hearing)
      const displayTranscript = (finalTranscript + interimTranscript).trim();
      setLiveTranscript(displayTranscript.slice(-100)); // Show last 100 chars
      
      // Reset silence timeout - clear transcript after 2 seconds of no speech
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      silenceTimeoutRef.current = setTimeout(() => {
        setLiveTranscript('');
      }, 2000);
      
      // Process words from the transcript - focus on recent words only
      const allSpokenWords = displayTranscript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
      
      // Only process the last 3-4 words to avoid skipping ahead too fast
      const recentWords = allSpokenWords.slice(-4);
      
      // Process each recent spoken word sequentially
      recentWords.forEach(spokenWord => {
        const cleanSpoken = spokenWord.replace(/[^a-zA-Z0-9']/g, '');
        if (cleanSpoken.length >= 2) {
          processSpokenWord(cleanSpoken);
        }
      });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      recognitionActiveRef.current = false;
      
      if (event.error === 'not-allowed') {
        setMicStatus('error');
        setError('Microphone access denied. Please allow microphone access in browser settings.');
        isListeningRef.current = false;
        setIsListening(false);
      } else if (event.error === 'no-speech') {
        // This is normal - no speech detected
        // Don't log anything, just let it restart
        console.log('No speech detected, will restart...');
        lastActivityRef.current = Date.now(); // Reset activity to prevent watchdog trigger
      } else if (event.error === 'audio-capture') {
        setMicStatus('error');
        setError('No microphone found. Please connect a microphone.');
      } else if (event.error === 'aborted') {
        // Recognition was aborted, this is expected during cleanup
        console.log('Recognition aborted');
      } else if (event.error === 'network') {
        setError('Network error. Please check your internet connection.');
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended, isListening:', isListeningRef.current, 'active:', recognitionActiveRef.current);
      recognitionActiveRef.current = false;
      
      // Auto-restart if still supposed to be listening
      if (isListeningRef.current && !isPracticeCompleteRef.current) {
        // Clear any existing restart timeout
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        
        restartTimeoutRef.current = setTimeout(() => {
          if (isListeningRef.current && !isPracticeCompleteRef.current) {
            forceRestartRecognition();
          }
        }, 100); // Faster restart - 100ms instead of 200ms
      } else {
        setMicStatus('idle');
      }
    };

    return recognition;
  };

  // Force restart recognition with a fresh instance
  const forceRestartRecognition = () => {
    console.log('🔄 Force restarting speech recognition...');
    
    // Stop existing recognition if any
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    
    // Create new instance
    recognitionRef.current = createRecognition();
    
    if (recognitionRef.current && isListeningRef.current && !isPracticeCompleteRef.current) {
      try {
        recognitionRef.current.start();
        console.log('✅ Speech recognition restarted successfully');
      } catch (e) {
        console.error('Failed to restart recognition:', e);
        // Try again in a moment
        setTimeout(() => {
          if (isListeningRef.current && !isPracticeCompleteRef.current) {
            forceRestartRecognition();
          }
        }, 500);
      }
    }
  };

  // Watchdog timer to detect stuck recognition
  const startWatchdog = () => {
    if (watchdogRef.current) {
      clearInterval(watchdogRef.current);
    }
    
    watchdogRef.current = setInterval(() => {
      if (!isListeningRef.current || isPracticeCompleteRef.current) {
        return;
      }
      
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      
      // If no activity for 5 seconds and recognition isn't active, force restart
      if (timeSinceActivity > 5000 && !recognitionActiveRef.current) {
        console.log('⚠️ Watchdog: Recognition appears stuck, restarting...');
        forceRestartRecognition();
        lastActivityRef.current = Date.now();
      }
      
      // If no activity for 10 seconds even with "active" recognition, force restart
      if (timeSinceActivity > 10000) {
        console.log('⚠️ Watchdog: No activity for 10s, forcing restart...');
        forceRestartRecognition();
        lastActivityRef.current = Date.now();
      }
    }, 2000); // Check every 2 seconds
  };

  const stopWatchdog = () => {
    if (watchdogRef.current) {
      clearInterval(watchdogRef.current);
      watchdogRef.current = null;
    }
  };

  const processSpokenWord = (cleanSpoken) => {
    const currentIdx = currentIndexRef.current;
    const wordsList = wordsRef.current;
    
    if (currentIdx >= wordsList.length) return;

    // Only check current word and next 2 words - stricter to prevent skipping
    const searchRange = Math.min(currentIdx + 3, wordsList.length);
    
    for (let i = currentIdx; i < searchRange; i++) {
      const targetWord = wordsList[i];
      const targetClean = targetWord.cleanText;
      
      // Skip if this exact position was already matched
      if (targetWord.matched) continue;
      
      // Calculate match score - stricter matching
      let isMatch = false;
      
      // Exact match
      if (cleanSpoken === targetClean) {
        isMatch = true;
      }
      // Starts with (spoken word is prefix of target or vice versa)
      else if (cleanSpoken.length >= 3 && targetClean.length >= 3) {
        if (targetClean.startsWith(cleanSpoken) || cleanSpoken.startsWith(targetClean)) {
          isMatch = true;
        }
      }
      // For longer words, allow fuzzy match
      else if (targetClean.length >= 5 && cleanSpoken.length >= 4) {
        const distance = levenshteinDistance(cleanSpoken, targetClean);
        // Allow 1 character difference for words 5+ chars, 2 for words 7+ chars
        const maxDistance = targetClean.length >= 7 ? 2 : 1;
        if (distance <= maxDistance) {
          isMatch = true;
        }
      }
      
      if (isMatch) {
        // Only mark the matched word, not words in between (prevents skipping)
        const newWords = [...wordsList];
        
        // If matching current word, just mark it
        if (i === currentIdx) {
          newWords[i] = { ...newWords[i], matched: true };
          const newMatchedCount = matchedCountRef.current + 1;
          const newIndex = i + 1;
          
          wordsRef.current = newWords;
          currentIndexRef.current = newIndex;
          matchedCountRef.current = newMatchedCount;
          
          setWords([...newWords]);
          setCurrentWordIndex(newIndex);
          setMatchedWords(newMatchedCount);
          
          if (newIndex >= wordsList.length) {
            completePractice(newMatchedCount, wordsList.length);
          }
        } else {
          // If matching a word ahead, only proceed if it's the next word (i === currentIdx + 1)
          // This prevents accidentally skipping multiple words
          if (i === currentIdx + 1) {
            // Mark both current and next word
            newWords[currentIdx] = { ...newWords[currentIdx], matched: true };
            newWords[i] = { ...newWords[i], matched: true };
            const newMatchedCount = matchedCountRef.current + 2;
            const newIndex = i + 1;
            
            wordsRef.current = newWords;
            currentIndexRef.current = newIndex;
            matchedCountRef.current = newMatchedCount;
            
            setWords([...newWords]);
            setCurrentWordIndex(newIndex);
            setMatchedWords(newMatchedCount);
            
            if (newIndex >= wordsList.length) {
              completePractice(newMatchedCount, wordsList.length);
            }
          }
        }
        
        break; // Found match, stop searching
      }
    }
  };

  // Simple Levenshtein distance for fuzzy matching
  const levenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  };

  const startPractice = () => {
    // Reset everything
    currentIndexRef.current = 0;
    matchedCountRef.current = 0;
    isPracticeCompleteRef.current = false;
    processedWordsRef.current = new Set();
    
    const resetWords = wordsRef.current.map(word => ({ ...word, matched: false }));
    wordsRef.current = resetWords;
    
    setWords(resetWords);
    setCurrentWordIndex(0);
    setMatchedWords(0);
    setElapsedTime(0);
    setLiveTranscript('');
    setIsPracticeStarted(true);
    setIsPracticeComplete(false);
    setError('');
    
    // Clean up any existing recognition
    cleanupRecognition();
    
    // Create and start new recognition
    recognitionRef.current = createRecognition();
    
    if (recognitionRef.current) {
      try {
        isListeningRef.current = true;
        setIsListening(true);
        lastActivityRef.current = Date.now();
        recognitionRef.current.start();
        
        // Start watchdog to monitor recognition health
        startWatchdog();
        
        // Start timer
        timerRef.current = setInterval(() => {
          setElapsedTime(prev => prev + 1);
        }, 1000);
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
        setError('Failed to start microphone. Please refresh and try again.');
        setMicStatus('error');
      }
    }
  };

  const stopListening = () => {
    isListeningRef.current = false;
    setIsListening(false);
    setMicStatus('idle');
    
    // Stop watchdog
    stopWatchdog();
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    
    // Stop the timer when paused
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resumeListening = () => {
    if (isPracticeCompleteRef.current) return;
    
    setError('');
    setLiveTranscript('');
    
    // Create new recognition instance (don't clear timer)
    cleanupRecognition(false);
    recognitionRef.current = createRecognition();
    
    if (recognitionRef.current) {
      try {
        isListeningRef.current = true;
        setIsListening(true);
        lastActivityRef.current = Date.now();
        recognitionRef.current.start();
        
        // Start watchdog
        startWatchdog();
        
        // Restart timer only if not already running
        if (!timerRef.current) {
          timerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
          }, 1000);
        }
      } catch (e) {
        console.error('Failed to resume speech recognition:', e);
        setError('Failed to resume. Please try again.');
      }
    }
  };

  const skipWord = () => {
    if (currentIndexRef.current < wordsRef.current.length && !isPracticeCompleteRef.current) {
      // Track skipped words
      skippedCountRef.current += 1;
      setSkippedWords(prev => prev + 1);
      
      const newIndex = currentIndexRef.current + 1;
      currentIndexRef.current = newIndex;
      setCurrentWordIndex(newIndex);
      
      if (newIndex >= wordsRef.current.length) {
        completePractice(matchedCountRef.current, wordsRef.current.length);
      }
    }
  };

  const completePractice = async (finalMatchedWords, totalWords) => {
    isPracticeCompleteRef.current = true;
    setIsPracticeComplete(true);
    stopListening();
    
    // Calculate results with improved scoring formula
    const skippedCount = skippedCountRef.current;
    const wrongWords = totalWords - finalMatchedWords - skippedCount;
    
    // 1. Time Score (0-30 points) - faster completion = higher score
    let calculatedTimeScore = 0;
    if (elapsedTime <= expectedTime * 0.7) {
      calculatedTimeScore = 30; // Excellent - finished 30%+ faster
    } else if (elapsedTime <= expectedTime) {
      calculatedTimeScore = 25 + (5 * (1 - elapsedTime / expectedTime)); // Good - finished on time
    } else if (elapsedTime <= expectedTime * 1.3) {
      calculatedTimeScore = 15; // Acceptable - slight overtime
    } else {
      calculatedTimeScore = Math.max(5, 15 - Math.floor((elapsedTime - expectedTime * 1.3) / 30)); // Overtime penalty
    }
    
    // 2. Accuracy Score (0-50 points) - based on correctly spoken words
    const accuracyPercent = (finalMatchedWords / totalWords) * 100;
    const accuracyScore = Math.round(accuracyPercent * 0.5);
    
    // 3. Fluency Bonus (0-20 points) - based on continuous speech without skips
    const skipPenalty = Math.min(20, skippedCount * 2); // -2 points per skip, max 20
    const fluencyBonus = Math.max(0, 20 - skipPenalty);
    
    // Final score calculation
    const finalScore = Math.min(100, Math.round(calculatedTimeScore + accuracyScore + fluencyBonus));
    const finalAccuracy = Math.round(accuracyPercent);
    
    setTimeScore(Math.round(calculatedTimeScore));
    setAccuracy(finalAccuracy);
    setScore(finalScore);
    
    // Save score to database
    setSavingScore(true);
    try {
      await axios.post('/api/scores', {
        topic: topic.name,
        duration: duration.id,
        score: finalScore,
        wordsMatched: finalMatchedWords,
        totalWords: totalWords,
        timeTaken: elapsedTime,
        expectedTime: expectedTime,
        accuracy: finalAccuracy,
        speechText: speechText
      });
      
      // Fetch updated top scores
      const scoresResponse = await axios.get('/api/scores/top');
      setTopScores(scoresResponse.data.scores);
    } catch (error) {
      console.error('Error saving score:', error);
    }
    setSavingScore(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const restartPractice = () => {
    stopListening();
    isPracticeCompleteRef.current = false;
    currentIndexRef.current = 0;
    matchedCountRef.current = 0;
    skippedCountRef.current = 0;
    processedWordsRef.current = new Set();
    
    const resetWords = wordsRef.current.map(word => ({ ...word, matched: false }));
    wordsRef.current = resetWords;
    
    setIsPracticeComplete(false);
    setIsPracticeStarted(false);
    setCurrentWordIndex(0);
    setMatchedWords(0);
    setSkippedWords(0);
    setTimeScore(0);
    setElapsedTime(0);
    setScore(0);
    setAccuracy(0);
    setLiveTranscript('');
    setWords(resetWords);
    setError('');
  };

  const getNewSpeech = () => {
    stopListening();
    isPracticeCompleteRef.current = false;
    currentIndexRef.current = 0;
    matchedCountRef.current = 0;
    skippedCountRef.current = 0;
    processedWordsRef.current = new Set();
    
    setIsPracticeComplete(false);
    setIsPracticeStarted(false);
    setCurrentWordIndex(0);
    setMatchedWords(0);
    setSkippedWords(0);
    setTimeScore(0);
    setElapsedTime(0);
    setScore(0);
    setAccuracy(0);
    setLiveTranscript('');
    setVocabulary([]);
    setError('');
    
    fetchSpeech();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Generating your speech...</p>
      </div>
    );
  }

  if (error && !isPracticeStarted) {
    return (
      <div className="practice-page">
        <div className="error-container glass-card">
          <XCircle size={48} className="error-icon" />
          <h2>Oops!</h2>
          <p>{error}</p>
          <Link to="/dashboard" className="btn btn-primary">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-page">
      {/* Header */}
      <header className="practice-header">
        <div className="container header-container">
          <Link to="/dashboard" className="back-btn">
            <ArrowLeft size={20} />
            Back
          </Link>
          <div className="practice-info">
            <span className="practice-topic">{topic?.icon} {topic?.name}</span>
            <span className="practice-duration">{duration?.label}</span>
          </div>
          <div className="timer">
            <Clock size={20} />
            <span>{formatTime(elapsedTime)}</span>
            <span className="timer-separator">/</span>
            <span className="expected-time">{formatTime(expectedTime)}</span>
          </div>
        </div>
      </header>

      <main className="practice-main">
        <div className="container">
          {/* Results Modal */}
          <AnimatePresence>
            {isPracticeComplete && (
              <motion.div 
                className="results-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="results-modal glass-card"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <div className="results-header">
                    <Trophy className="results-trophy" size={48} />
                    <h2>Practice Complete!</h2>
                  </div>
                  
                  <div className="score-display">
                    <div className="score-circle-large">
                      <svg viewBox="0 0 100 100">
                        <circle className="score-bg" cx="50" cy="50" r="45" />
                        <circle 
                          className="score-fill" 
                          cx="50" 
                          cy="50" 
                          r="45"
                          style={{ 
                            strokeDashoffset: 283 - (283 * score / 100) 
                          }}
                        />
                      </svg>
                      <span className="score-value-large">{score}</span>
                    </div>
                    <p className="score-label">Your Score</p>
                  </div>
                  
                  <div className="results-stats">
                    <div className="result-stat">
                      <Target size={24} />
                      <div>
                        <span className="stat-value">{accuracy}%</span>
                        <span className="stat-label">Accuracy</span>
                      </div>
                    </div>
                    <div className="result-stat">
                      <CheckCircle size={24} />
                      <div>
                        <span className="stat-value">{matchedWords}/{words.length}</span>
                        <span className="stat-label">Words</span>
                      </div>
                    </div>
                    <div className="result-stat">
                      <Clock size={24} />
                      <div>
                        <span className="stat-value">{formatTime(elapsedTime)}</span>
                        <span className="stat-label">Time Taken</span>
                      </div>
                    </div>
                  </div>

                  {topScores.length > 0 && (
                    <div className="top-scores-mini">
                      <h4>Your Top 5 Scores</h4>
                      <div className="scores-mini-list">
                        {topScores.slice(0, 5).map((s, index) => (
                          <div key={s._id} className="score-mini-item">
                            <span className="score-mini-rank">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>
                            <span className="score-mini-topic">{s.topic}</span>
                            <span className="score-mini-value">{s.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Score Breakdown */}
                  <div className="score-breakdown">
                    <h4>📊 Score Breakdown</h4>
                    <div className="breakdown-items">
                      <div className="breakdown-item">
                        <span className="breakdown-label">⏱️ Time Score</span>
                        <span className="breakdown-value">{timeScore}/30</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">🎯 Accuracy Score</span>
                        <span className="breakdown-value">{Math.round(accuracy * 0.5)}/50</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">🔄 Fluency Bonus</span>
                        <span className="breakdown-value">{Math.max(0, 20 - skippedWords * 2)}/20</span>
                      </div>
                      {skippedWords > 0 && (
                        <div className="breakdown-item penalty">
                          <span className="breakdown-label">⏭️ Skipped Words</span>
                          <span className="breakdown-value">-{Math.min(20, skippedWords * 2)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vocabulary Section */}
                  {vocabulary.length > 0 && (
                    <div className="vocabulary-section">
                      <h4>📚 Key Vocabulary from this Speech</h4>
                      <div className="vocabulary-grid">
                        {vocabulary.map((item, index) => (
                          <div key={index} className="vocabulary-card">
                            <div className="vocab-word">{item.word}</div>
                            <div className="vocab-meaning">{item.meaning}</div>
                            {item.example && (
                              <div className="vocab-example">
                                <em>"{item.example}"</em>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {savingScore && (
                    <div className="saving-indicator">
                      <Loader className="spin" size={16} />
                      <span>Saving your score...</span>
                    </div>
                  )}

                  <div className="results-actions">
                    <button className="btn btn-primary" onClick={restartPractice}>
                      <RotateCcw size={20} />
                      Try Again
                    </button>
                    <button className="btn btn-secondary" onClick={getNewSpeech}>
                      <Volume2 size={20} />
                      New Speech
                    </button>
                    <Link to="/dashboard" className="btn btn-secondary">
                      <Home size={20} />
                      Dashboard
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Microphone Monitor - Shows what mic is hearing */}
          {isPracticeStarted && !isPracticeComplete && (
            <motion.div 
              className="mic-monitor glass-card"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mic-monitor-header">
                <div className={`mic-indicator ${micStatus}`}>
                  {micStatus === 'listening' ? (
                    <>
                      <Mic size={18} className="mic-icon-pulse" />
                      <span>🟢 Listening...</span>
                    </>
                  ) : micStatus === 'error' ? (
                    <>
                      <AlertCircle size={18} />
                      <span>🔴 Mic Error</span>
                    </>
                  ) : (
                    <>
                      <MicOff size={18} />
                      <span>⚪ Mic Off</span>
                    </>
                  )}
                </div>
                <button className="skip-btn" onClick={skipWord} title="Skip current word if stuck">
                  <SkipForward size={16} />
                  Skip Word
                </button>
              </div>
              
              <div className="live-transcript-section">
                <div className="transcript-row">
                  <span className="transcript-label">🎤 I hear:</span>
                  <span className="transcript-text">
                    {liveTranscript || '(waiting for speech...)'}
                  </span>
                </div>
                <div className="expected-row">
                  <span className="expected-label">📖 Say:</span>
                  <span className="expected-text-multi">
                    {currentWordIndex < words.length ? (
                      words.slice(currentWordIndex, currentWordIndex + 8).map((word, idx) => (
                        <span 
                          key={currentWordIndex + idx} 
                          className={idx === 0 ? 'current-word' : 'upcoming-word'}
                        >
                          {word.text}{' '}
                        </span>
                      ))
                    ) : (
                      <span className="complete-text">✓ Complete!</span>
                    )}
                  </span>
                </div>
              </div>
              
              {error && (
                <div className="mic-error-inline">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Speech Text */}
          <div className="speech-container glass-card">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(currentWordIndex / words.length) * 100}%` }}
              ></div>
            </div>
            <div className="progress-info">
              <span>{currentWordIndex} / {words.length} words</span>
              <span>{Math.round((currentWordIndex / words.length) * 100)}% complete</span>
            </div>
            
            <div className="speech-text" ref={textContainerRef}>
              {words.map((word, index) => (
                <span
                  key={index}
                  className={`word ${
                    index < currentWordIndex 
                      ? 'word-matched' 
                      : index === currentWordIndex 
                        ? 'word-current' 
                        : 'word-unmatched'
                  }`}
                >
                  {word.text}{' '}
                </span>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="controls-container">
            {!isPracticeStarted ? (
              <motion.button 
                className="btn btn-accent btn-large start-practice-btn"
                onClick={startPractice}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mic size={24} />
                Start Speaking
              </motion.button>
            ) : (
              <div className="practice-controls">
                <motion.button 
                  className={`mic-btn ${isListening ? 'listening' : ''}`}
                  onClick={isListening ? stopListening : resumeListening}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isListening ? (
                    <>
                      <div className="mic-pulse"></div>
                      <MicOff size={32} />
                    </>
                  ) : (
                    <Mic size={32} />
                  )}
                </motion.button>
                <p className="mic-status">
                  {isListening ? 'Click to pause listening' : 'Click to resume listening'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PracticePage;
