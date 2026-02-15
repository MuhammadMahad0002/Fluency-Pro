import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mic, 
  Target, 
  Trophy, 
  BookOpen, 
  Zap, 
  Globe,
  ArrowRight,
  Check,
  Star,
  Users,
  Clock,
  BarChart3
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const features = [
    {
      icon: <Mic size={32} />,
      title: 'Voice Recognition',
      description: 'Advanced speech recognition tracks your pronunciation in real-time as you speak.'
    },
    {
      icon: <Target size={32} />,
      title: 'Word-by-Word Tracking',
      description: 'Follow along with highlighted text that shows your progress through each speech.'
    },
    {
      icon: <Trophy size={32} />,
      title: 'Score & Analytics',
      description: 'Get detailed scores and track your improvement over time with comprehensive analytics.'
    },
    {
      icon: <BookOpen size={32} />,
      title: 'AI-Generated Speeches',
      description: 'Practice with AI-generated speeches on various topics tailored to your skill level.'
    },
    {
      icon: <Zap size={32} />,
      title: 'Multiple Durations',
      description: 'Choose from 2, 5, or 10-minute speeches to fit your practice schedule.'
    },
    {
      icon: <Globe size={32} />,
      title: 'Diverse Topics',
      description: 'Explore speeches on technology, environment, education, health, and more.'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Choose Your Topic',
      description: 'Select from a variety of interesting topics that match your interests.'
    },
    {
      step: 2,
      title: 'Select Duration',
      description: 'Pick a 2, 5, or 10-minute speech based on your available time.'
    },
    {
      step: 3,
      title: 'Start Speaking',
      description: 'Click start and read the speech aloud. Our AI tracks your words in real-time.'
    },
    {
      step: 4,
      title: 'Get Your Score',
      description: 'Receive detailed feedback including accuracy, time, and an overall score.'
    }
  ];

  const benefits = [
    'Improve pronunciation and fluency',
    'Build confidence in public speaking',
    'Track progress with detailed analytics',
    'Practice at your own pace',
    'Learn new vocabulary on diverse topics',
    'Secure and personalized experience'
  ];

  const stats = [
    { icon: <Users size={24} />, value: '10,000+', label: 'Active Learners' },
    { icon: <Clock size={24} />, value: '50,000+', label: 'Hours Practiced' },
    { icon: <Star size={24} />, value: '4.9/5', label: 'User Rating' },
    { icon: <BarChart3 size={24} />, value: '95%', label: 'Improvement Rate' }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="container nav-container">
          <Link to="/" className="logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">Fluency<span className="gradient-text">Pro</span></span>
          </Link>
          <div className="nav-buttons">
            <Link to="/login" className="btn btn-secondary">Log In</Link>
            <Link to="/signup" className="btn btn-primary">Sign Up Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob hero-blob-1"></div>
          <div className="hero-blob hero-blob-2"></div>
          <div className="hero-blob hero-blob-3"></div>
        </div>
        <div className="container hero-container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-badge">
              <Zap size={16} />
              <span>AI-Powered English Practice</span>
            </div>
            <h1 className="hero-title">
              Master English Fluency with 
              <span className="gradient-text"> Confidence</span>
            </h1>
            <p className="hero-subtitle">
              Practice speaking English with AI-generated speeches, real-time voice recognition, 
              and detailed performance analytics. Track your progress and become a confident speaker.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-primary btn-large">
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large">
                Already a member? Log In
              </Link>
            </div>
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="stat-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-info">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="hero-card glass-card">
              <div className="mock-speech">
                <div className="mock-header">
                  <span className="mock-topic">📚 Education</span>
                  <span className="mock-duration">5 min</span>
                </div>
                <div className="mock-text">
                  <span className="word-matched">Education is </span>
                  <span className="word-matched">the foundation </span>
                  <span className="word-current">of </span>
                  <span className="word-unmatched">personal and societal development...</span>
                </div>
                <div className="mock-progress">
                  <div className="mock-progress-bar" style={{ width: '35%' }}></div>
                </div>
                <div className="mock-mic animate-pulse-glow">
                  <Mic size={24} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Powerful Features for <span className="gradient-text">Better Learning</span></h2>
            <p className="section-subtitle">
              Everything you need to improve your English speaking skills in one place
            </p>
          </motion.div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="feature-card glass-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
            <p className="section-subtitle">
              Simple steps to start improving your English fluency today
            </p>
          </motion.div>
          <div className="steps-container">
            {howItWorks.map((item, index) => (
              <motion.div 
                key={index} 
                className="step-card"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="step-number">{item.step}</div>
                <div className="step-content">
                  <h3 className="step-title">{item.title}</h3>
                  <p className="step-description">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="step-connector"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="container benefits-container">
          <motion.div 
            className="benefits-content"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Why Choose <span className="gradient-text">FluencyPro?</span></h2>
            <p className="section-subtitle">
              Join thousands of learners who have improved their English speaking skills
            </p>
            <ul className="benefits-list">
              {benefits.map((benefit, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="benefit-check">
                    <Check size={16} />
                  </div>
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>
            <Link to="/signup" className="btn btn-primary btn-large">
              Start Your Journey
              <ArrowRight size={20} />
            </Link>
          </motion.div>
          <motion.div 
            className="benefits-visual"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="score-preview glass-card">
              <h4>Your Progress</h4>
              <div className="score-circle">
                <svg viewBox="0 0 100 100">
                  <circle className="score-bg" cx="50" cy="50" r="45" />
                  <circle className="score-fill" cx="50" cy="50" r="45" />
                </svg>
                <span className="score-value">87</span>
              </div>
              <div className="score-details">
                <div className="score-detail">
                  <span className="detail-label">Accuracy</span>
                  <span className="detail-value">92%</span>
                </div>
                <div className="score-detail">
                  <span className="detail-label">Time</span>
                  <span className="detail-value">4:32</span>
                </div>
                <div className="score-detail">
                  <span className="detail-label">Words</span>
                  <span className="detail-value">234/254</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <motion.div 
            className="cta-card glass-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="cta-title">Ready to Become Fluent in English?</h2>
            <p className="cta-subtitle">
              Join thousands of learners and start improving your speaking skills today. It's free to get started!
            </p>
            <div className="cta-buttons">
              <Link to="/signup" className="btn btn-accent btn-large">
                Create Free Account
                <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <span className="logo-icon">🎯</span>
              <span className="logo-text">Fluency<span className="gradient-text">Pro</span></span>
            </Link>
            <p>Helping people become fluent in English through AI-powered speech practice.</p>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 FluencyPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
