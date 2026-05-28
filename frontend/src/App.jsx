import React, { useState, useEffect, useCallback } from 'react';
import { 
  Briefcase, User, Bell, LogOut, Plus, Search, Star, 
  CheckCircle2, AlertCircle, TrendingUp, Layers, Send, 
  FileText, Check, Award, Info, Globe, Building, Clock, 
  ShieldAlert, RefreshCw, ChevronRight, Edit3, Heart
} from 'lucide-react';
import api, { clearAuth } from './api';

// Skill list definition for tagging
const SYSTEM_SKILLS = ["Python", "FastAPI", "React", "Docker", "PostgreSQL", "Redis", "Celery", "Machine Learning", "Tailwind CSS", "TypeScript", "Javascript", "CSS", "HTML"];

export default function App() {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState('landing');
  const [user, setUser] = useState(null); // { email, role, id }
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  
  // Forms & Modal State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('freelancer');
  
  const [clientProfile, setClientProfile] = useState({ company_name: '', industry: '', website: '' });
  const [freelancerProfile, setFreelancerProfile] = useState({ title: '', bio: '', hourly_rate: 35, skills: [] });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Job Search & Match State
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null); // For proposal/matching detail modals
  const [proposalRate, setProposalRate] = useState(50);
  const [proposalCover, setProposalCover] = useState('');
  
  // Dashboards Data
  const [myProposals, setMyProposals] = useState([]);
  const [myContracts, setMyContracts] = useState([]);
  const [myPostedJobs, setMyPostedJobs] = useState([]);
  const [jobProposals, setJobProposals] = useState({}); // job_id -> proposals
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  
  // Selected contract for review/sign
  const [selectedContract, setSelectedContract] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);

  // Job Creation Form
  const [newJob, setNewJob] = useState({ title: '', description: '', budget: 1000, skills: [] });
  const [showNewJobModal, setShowNewJobModal] = useState(false);

  // Admin state
  const [newSkillName, setNewSkillName] = useState('');
  const [adminStats, setAdminStats] = useState({ users: 0, jobs: 0, contracts: 0 });

  // System alerts/toasts
  const [alert, setAlert] = useState(null); // { type: 'success'|'error', message: '' }

  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Sync token changes
  useEffect(() => {
    const handleAuthChange = () => {
      const storedToken = localStorage.getItem('access_token');
      setToken(storedToken);
      if (!storedToken) {
        setUser(null);
        setActiveTab('landing');
      }
    };
    window.addEventListener('auth_change', handleAuthChange);
    return () => window.removeEventListener('auth_change', handleAuthChange);
  }, []);

  // Fetch current user details if logged in
  const fetchUserMe = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('user_role', res.data.role);
      localStorage.setItem('user_email', res.data.email);
      // Fetch profile next
      fetchProfile(res.data);
    } catch (err) {
      clearAuth();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUserMe();
    }
  }, [token, fetchUserMe]);

  const fetchProfile = async (currentUser) => {
    try {
      if (currentUser.role === 'client') {
        const res = await api.get('/profiles/client');
        if (res.data) setClientProfile(res.data);
      } else if (currentUser.role === 'freelancer') {
        const res = await api.get('/profiles/freelancer');
        if (res.data) {
          setFreelancerProfile({
            title: res.data.title,
            bio: res.data.bio,
            hourly_rate: parseFloat(res.data.hourly_rate),
            skills: res.data.skills.map(s => s.name)
          });
        }
      }
    } catch (err) {
      // Profile might not exist yet, which is fine
    }
  };

  // Fetch Notifications
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const markNotifRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotifsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      fetchNotifications();
      triggerAlert('success', 'All notifications marked as read.');
    } catch (err) {
      console.error(err);
    }
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      setToken(res.data.access_token);
      triggerAlert('success', 'Logged in successfully!');
      setLoginEmail('');
      setLoginPassword('');
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Login failed. Please check credentials.');
    }
  };

  // Registration handler
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { email: registerEmail, password: registerPassword, role: registerRole });
      triggerAlert('success', 'Account registered successfully! Logging you in...');
      // Automatically login
      const res = await api.post('/auth/login', { email: registerEmail, password: registerPassword });
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      setToken(res.data.access_token);
      setRegisterEmail('');
      setRegisterPassword('');
      setActiveTab(registerRole === 'client' ? 'client-dashboard' : 'freelancer-dashboard');
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Registration failed.');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      } catch (err) {
        console.error(err);
      }
    }
    clearAuth();
    triggerAlert('success', 'Logged out successfully.');
  };

  // Save profile info
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      if (user.role === 'client') {
        await api.post('/profiles/client', clientProfile);
      } else {
        await api.post('/profiles/freelancer', freelancerProfile);
      }
      setIsEditingProfile(false);
      triggerAlert('success', 'Profile updated successfully!');
      fetchUserMe();
    } catch (err) {
      triggerAlert('error', 'Failed to update profile.');
    }
  };

  // Job board search loading
  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data.filter(j => j.status === 'open' || j.status === 'completed' || j.status === 'in_progress'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [activeTab]);

  // Client Posted Jobs & Proposals
  const fetchClientDashboardData = async () => {
    if (user?.role !== 'client') return;
    try {
      const resJobs = await api.get('/jobs');
      setMyPostedJobs(resJobs.data);

      const resContracts = await api.get('/contracts/me');
      setMyContracts(resContracts.data);

      // Fetch proposals for each job
      const openJobs = resJobs.data.filter(j => j.status === 'open');
      for (let j of openJobs) {
        const propRes = await api.get(`/proposals/job/${j.id}`);
        setJobProposals(prev => ({ ...prev, [j.id]: propRes.data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Freelancer Proposals & Contracts
  const fetchFreelancerDashboardData = async () => {
    if (user?.role !== 'freelancer') return;
    try {
      const resProps = await api.get('/proposals/me');
      setMyProposals(resProps.data);

      const resContracts = await api.get('/contracts/me');
      setMyContracts(resContracts.data);
    } catch (err) {
      console.error(err);
    }
  };

  // System Admin Stats
  const fetchAdminStats = async () => {
    if (user?.role !== 'admin') return;
    try {
      const stats = await api.get('/admin/stats');
      setAdminStats(stats.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'client-dashboard') fetchClientDashboardData();
    if (activeTab === 'freelancer-dashboard') fetchFreelancerDashboardData();
    if (activeTab === 'admin-panel') fetchAdminStats();
  }, [activeTab, user]);

  // Job Creation (Client)
  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const created = await api.post('/jobs', newJob);
      // Publish it immediately
      await api.post(`/jobs/${created.data.id}/status?new_status=open`);
      triggerAlert('success', 'Job created and published successfully!');
      setShowNewJobModal(false);
      setNewJob({ title: '', description: '', budget: 1000, skills: [] });
      fetchClientDashboardData();
    } catch (err) {
      triggerAlert('error', 'Failed to publish job.');
    }
  };

  // Submit Bid Proposal (Freelancer)
  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/proposals', {
        job_id: selectedJob.id,
        rate: proposalRate,
        cover_letter: proposalCover
      });
      triggerAlert('success', 'Bid proposal submitted successfully!');
      setSelectedJob(null);
      setProposalCover('');
      fetchFreelancerDashboardData();
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to submit proposal.');
    }
  };

  // Accept Proposal & Hire (Client)
  const handleHireFreelancer = async (proposalId) => {
    try {
      await api.post('/contracts', { proposal_id: proposalId });
      triggerAlert('success', 'Contract successfully created! Work is in progress.');
      fetchClientDashboardData();
    } catch (err) {
      triggerAlert('error', 'Failed to start contract.');
    }
  };

  // Complete Contract (Client)
  const handleCompleteContract = async (contractId) => {
    try {
      const res = await api.post(`/contracts/${contractId}/complete`);
      triggerAlert('success', 'Contract marked completed.');
      setSelectedContract(res.data);
      setShowReviewModal(true);
      fetchClientDashboardData();
    } catch (err) {
      triggerAlert('error', 'Failed to complete contract.');
    }
  };

  // Post Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        contract_id: selectedContract.id,
        rating: reviewRating,
        comment: reviewComment
      });
      triggerAlert('success', 'Review submitted successfully!');
      setShowReviewModal(false);
      setReviewComment('');
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to submit review.');
    }
  };

  // Skill Creation (Admin)
  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName) return;
    try {
      await api.post('/profiles/skills', { name: newSkillName });
      triggerAlert('success', `Skill "${newSkillName}" created in system database taxonomy!`);
      setNewSkillName('');
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to add skill.');
    }
  };

  // Toggle skills selections for filtering
  const handleToggleSkillFilter = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Filtered jobs list
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkills = selectedSkills.length === 0 || 
                          selectedSkills.some(skill => job.skills.some(js => js.name === skill));
    return matchesSearch && matchesSkills && job.status === 'open';
  });

  return (
    <div className="app-container">
      {/* Dynamic Floating Toast Alerts */}
      {alert && (
        <div 
          className="glass-panel"
          style={{ 
            position: 'fixed', 
            top: '24px', 
            right: '24px', 
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderLeft: alert.type === 'success' ? '4px solid var(--success)' : '4px solid var(--danger)'
          }}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 style={{ width: '20px', height: '20px', color: 'var(--success)' }} />
          ) : (
            <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--danger)' }} />
          )}
          <span className="font-medium text-sm">{alert.message}</span>
        </div>
      )}

      {/* Main Grid View */}
      <div className="dashboard-layout">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="sidebar">
          <div className="sidebar-header">
            {/* Elite Match Logo */}
            <div className="logo-container cursor-pointer" onClick={() => setActiveTab('landing')}>
              <div className="logo-icon">
                <Briefcase style={{ width: '20px', height: '20px', color: 'var(--bg-sidebar)' }} />
              </div>
              <div className="logo-text">
                <h2>EliteMatch</h2>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="nav-menu">
              <button 
                onClick={() => setActiveTab('landing')}
                className={`nav-link ${activeTab === 'landing' ? 'active' : ''}`}
              >
                <Globe style={{ width: '18px', height: '18px' }} />
                Landing Page
              </button>

              <button 
                onClick={() => setActiveTab('job-search')}
                className={`nav-link ${activeTab === 'job-search' ? 'active' : ''}`}
              >
                <Search style={{ width: '18px', height: '18px' }} />
                Find Projects
              </button>

              {user?.role === 'freelancer' && (
                <button 
                  onClick={() => setActiveTab('freelancer-dashboard')}
                  className={`nav-link ${activeTab === 'freelancer-dashboard' ? 'active' : ''}`}
                >
                  <User style={{ width: '18px', height: '18px' }} />
                  Freelance Hub
                </button>
              )}

              {user?.role === 'client' && (
                <button 
                  onClick={() => setActiveTab('client-dashboard')}
                  className={`nav-link ${activeTab === 'client-dashboard' ? 'active' : ''}`}
                >
                  <Building style={{ width: '18px', height: '18px' }} />
                  Client Board
                </button>
              )}

              {user?.role === 'admin' && (
                <button 
                  onClick={() => setActiveTab('admin-panel')}
                  className={`nav-link ${activeTab === 'admin-panel' ? 'active' : ''}`}
                >
                  <ShieldAlert style={{ width: '18px', height: '18px' }} />
                  Admin Control
                </button>
              )}
            </nav>
          </div>

          {/* Sidebar Footer (User Info & Actions) */}
          <div className="sidebar-footer">
            {token && user ? (
              <div className="user-profile-widget">
                <div className="user-profile-info">
                  <div className="user-avatar">
                    {user.email[0].toUpperCase()}
                  </div>
                  <div className="user-details">
                    <h4>{user.email}</h4>
                    <span className="badge badge-info" style={{ fontSize: '9px', marginTop: '2px' }}>{user.role}</span>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="btn-logout"
                >
                  <LogOut style={{ width: '14px', height: '14px' }} />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex-column" style={{ gap: '8px' }}>
                <button 
                  onClick={() => setActiveTab('login')}
                  className="btn-primary"
                  style={{ width: '100%', padding: '10px' }}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setActiveTab('register')}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '10px' }}
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* WORKSPACE & PAGE VIEW */}
        <main className="workspace">
          
          {/* HEADER (Bar with Notification Bell) */}
          <header className="workspace-header">
            <div className="header-title">
              <h1>
                {activeTab.replace('-', ' ')}
              </h1>
              <p>Unified Matching Dashboard</p>
            </div>

            {/* Notification & Tab Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {token && (
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="btn-secondary"
                    style={{ padding: '10px' }}
                  >
                    <Bell style={{ width: '20px', height: '20px' }} />
                    {notifications.filter(n => !n.is_read).length > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'var(--accent-primary)',
                        borderRadius: '50%'
                      }} />
                    )}
                  </button>

                  {/* Notification Dropdown Container */}
                  {showNotifDropdown && (
                    <div className="notif-popover">
                      <div className="notif-header">
                        <span>Notifications</span>
                        {notifications.some(n => !n.is_read) && (
                          <button onClick={markAllNotifsRead} style={{ fontSize: '10px', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="flex-column" style={{ gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No notifications yet.</p>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              onClick={() => markNotifRead(notif.id)}
                              className={`notif-item ${notif.is_read ? '' : 'unread'}`}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '600', fontSize: '12px', color: 'var(--text-heading)' }}>{notif.title}</span>
                                {!notif.is_read && <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent-primary)', borderRadius: '50%' }} />}
                              </div>
                              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>{notif.message}</p>
                              <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                                {new Date(notif.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* 1. LANDING PAGE VIEW (Day 11) */}
          {activeTab === 'landing' && (
            <div className="flex-column" style={{ gap: '48px' }}>
              {/* Hero Banner */}
              <section className="glass-panel hero-panel">
                <div className="hero-content">
                  <span className="badge badge-info">FastAPI + React Monorepo</span>
                  <h1 className="gradient-text font-display">
                    Premium Elegant <br/>
                    Freelance Matching
                  </h1>
                  <p>
                    Connecting elite project clients with master developers through matching similarity, skill taxonomy layouts, and real-time state machine contract signatures.
                  </p>
                  <div className="hero-actions">
                    <button onClick={() => setActiveTab('job-search')} className="btn-primary">
                      Explore Open Jobs
                      <ChevronRight style={{ width: '16px', height: '16px' }} />
                    </button>
                    {!token && (
                      <button onClick={() => setActiveTab('register')} className="btn-secondary">
                        Get Started
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Visual Cosine Score Ring Widget */}
                <div className="gauge-widget">
                  <div className="gauge-circle">
                    <svg style={{ width: '144px', height: '144px' }}>
                      <circle stroke="rgba(22, 42, 69, 0.06)" strokeWidth="8" fill="transparent" r="58" cx="72" cy="72"/>
                      <circle stroke="var(--accent-primary)" strokeWidth="8" strokeDasharray="364" strokeDashoffset="72" strokeLinecap="round" fill="transparent" r="58" cx="72" cy="72"/>
                    </svg>
                    <div className="gauge-text">
                      <span className="percentage">80%</span>
                      <span className="label">Match Score</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Calculated Cosine TF-IDF Similarity</span>
                </div>
              </section>

              {/* Statistics & Performance Counters */}
              <section className="stats-grid">
                <div className="glass-panel stats-card">
                  <div className="stats-icon indigo">
                    <TrendingUp style={{ width: '24px', height: '24px' }} />
                  </div>
                  <div className="stats-details">
                    <h3>100%</h3>
                    <p>Automated Match Verification</p>
                  </div>
                </div>

                <div className="glass-panel stats-card">
                  <div className="stats-icon purple">
                    <Layers style={{ width: '24px', height: '24px' }} />
                  </div>
                  <div className="stats-details">
                    <h3>Celery + Redis</h3>
                    <p>Fast Async Cache Layers</p>
                  </div>
                </div>

                <div className="glass-panel stats-card">
                  <div className="stats-icon emerald">
                    <Award style={{ width: '24px', height: '24px' }} />
                  </div>
                  <div className="stats-details">
                    <h3>Safe Escrows</h3>
                    <p>Digital Smart Contract Signatures</p>
                  </div>
                </div>
              </section>

              {/* System Skill Taxonomy */}
              <section className="flex-column" style={{ gap: '16px', alignItems: 'flex-start' }}>
                <h3 className="font-display" style={{ fontSize: '18px' }}>System Skill Taxonomy</h3>
                <div className="skills-container">
                  {SYSTEM_SKILLS.map(skill => (
                    <span key={skill} className="badge badge-info">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* 2. LOGIN VIEW (Day 12) */}
          {activeTab === 'login' && (
            <div className="auth-container">
              <div className="glass-panel auth-card">
                <div className="auth-header">
                  <h2>Sign In</h2>
                  <p>Enter your credentials to manage dashboard operations</p>
                </div>
                <form onSubmit={handleLogin} className="flex-column" style={{ gap: '16px' }}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@example.com" 
                      className="input-field" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input 
                      type="password" 
                      required 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="input-field" 
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '8px' }}>
                    Access Dashboard
                  </button>
                </form>
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  New to EliteMatch?{' '}
                  <button onClick={() => setActiveTab('register')} style={{ color: 'var(--text-heading)', fontWeight: 'bold' }}>
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. REGISTER VIEW (Day 12) */}
          {activeTab === 'register' && (
            <div className="auth-container">
              <div className="glass-panel auth-card">
                <div className="auth-header">
                  <h2>Create Account</h2>
                  <p>Join our matching ecosystem today</p>
                </div>
                <form onSubmit={handleRegister} className="flex-column" style={{ gap: '16px' }}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="name@example.com" 
                      className="input-field" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input 
                      type="password" 
                      required 
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="input-field" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Select Role</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                      <button 
                        type="button"
                        onClick={() => setRegisterRole('freelancer')}
                        className="btn-secondary"
                        style={{
                          background: registerRole === 'freelancer' ? 'rgba(48, 109, 41, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                          borderColor: registerRole === 'freelancer' ? 'var(--accent-primary)' : 'transparent',
                          color: registerRole === 'freelancer' ? 'var(--text-heading)' : 'var(--text-secondary)'
                        }}
                      >
                        Freelancer
                      </button>
                      <button 
                        type="button"
                        onClick={() => setRegisterRole('client')}
                        className="btn-secondary"
                        style={{
                          background: registerRole === 'client' ? 'rgba(48, 109, 41, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                          borderColor: registerRole === 'client' ? 'var(--accent-primary)' : 'transparent',
                          color: registerRole === 'client' ? 'var(--text-heading)' : 'var(--text-secondary)'
                        }}
                      >
                        Client
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '8px' }}>
                    Create Profile
                  </button>
                </form>
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Already registered?{' '}
                  <button onClick={() => setActiveTab('login')} style={{ color: 'var(--text-heading)', fontWeight: 'bold' }}>
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. JOB SEARCH BOARD (Day 13) */}
          {activeTab === 'job-search' && (
            <div className="flex-column" style={{ gap: '24px', alignItems: 'stretch' }}>
              
              {/* Filtering Controls */}
              <div className="glass-panel flex-column" style={{ gap: '16px' }}>
                <div className="search-bar">
                  <Search style={{ width: '20px', height: '20px', color: 'var(--text-muted)', flexShrink: 0 }} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by keywords..." 
                  />
                </div>
                <div className="flex-column" style={{ gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Filter by Required Skills:</span>
                  <div className="skills-container">
                    {SYSTEM_SKILLS.map(skill => (
                      <button
                        key={skill}
                        onClick={() => handleToggleSkillFilter(skill)}
                        className="badge"
                        style={{
                          background: selectedSkills.includes(skill) ? 'rgba(48, 109, 41, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          borderColor: selectedSkills.includes(skill) ? 'var(--accent-primary)' : 'transparent',
                          color: selectedSkills.includes(skill) ? 'var(--text-heading)' : 'var(--text-secondary)'
                        }}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Jobs List Grid */}
              <div className="grid-cols-2">
                {filteredJobs.length === 0 ? (
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', gridColumn: 'span 2', textAlign: 'center', padding: '32px 0' }}>No matching jobs found matching requirements.</p>
                ) : (
                  filteredJobs.map(job => (
                    <div key={job.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px' }}>
                      <div className="flex-column" style={{ gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>
                            {job.title}
                          </h3>
                          <span className="badge badge-success">${parseFloat(job.budget).toLocaleString()}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', textAlign: 'left' }}>{job.description}</p>
                        
                        {/* Skills List */}
                        <div className="skills-container">
                          {job.skills.map(s => (
                            <span key={s.id} className="badge badge-info" style={{ fontSize: '9px', padding: '4px 8px' }}>{s.name}</span>
                          ))}
                        </div>
                      </div>

                      {/* Apply trigger buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          <Clock style={{ width: '14px', height: '14px' }} />
                          <span>Active</span>
                        </div>
                        
                        {token && user?.role === 'freelancer' && (
                          <button 
                            onClick={async () => {
                              setSelectedJob(job);
                              try {
                                const res = await api.get(`/jobs/${job.id}/recommendations`);
                                const matched = res.data.find(r => r.freelancer.user_id === user.id);
                                if (matched) {
                                  setSelectedJob(prev => ({ ...prev, match: matched }));
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="btn-primary"
                            style={{ padding: '8px 16px', fontSize: '12px' }}
                          >
                            Apply Now
                          </button>
                        )}
                        {!token && (
                          <button onClick={() => setActiveTab('login')} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                            Login to Bid
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 5. FREELANCE HUB VIEW (Day 13 & 14) */}
          {activeTab === 'freelancer-dashboard' && user?.role === 'freelancer' && (
            <div className="flex-column" style={{ gap: '32px' }}>
              
              {/* Profile Config section */}
              <section className="glass-panel flex-column" style={{ gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="font-display" style={{ fontSize: '18px' }}>Freelancer Profile Info</h3>
                  <button 
                    onClick={() => setIsEditingProfile(!isEditingProfile)} 
                    className="btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '12px' }}
                  >
                    <Edit3 style={{ width: '14px', height: '14px' }} />
                    {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="flex-column" style={{ gap: '16px' }}>
                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label>Professional Title</label>
                        <input 
                          type="text" 
                          required
                          value={freelancerProfile.title}
                          onChange={(e) => setFreelancerProfile({ ...freelancerProfile, title: e.target.value })}
                          className="input-field" 
                        />
                      </div>
                      <div className="form-group">
                        <label>Hourly Rate ($)</label>
                        <input 
                          type="number" 
                          required
                          value={freelancerProfile.hourly_rate}
                          onChange={(e) => setFreelancerProfile({ ...freelancerProfile, hourly_rate: parseFloat(e.target.value) })}
                          className="input-field" 
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Bio Description</label>
                      <textarea 
                        required
                        rows="3"
                        value={freelancerProfile.bio}
                        onChange={(e) => setFreelancerProfile({ ...freelancerProfile, bio: e.target.value })}
                        className="input-field"
                        style={{ resize: 'none' }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Skills Selected:</label>
                      <div className="skills-container" style={{ marginTop: '4px' }}>
                        {SYSTEM_SKILLS.map(s => {
                          const active = freelancerProfile.skills.includes(s);
                          return (
                            <button
                              type="button"
                              key={s}
                              onClick={() => {
                                const list = active 
                                  ? freelancerProfile.skills.filter(i => i !== s) 
                                  : [...freelancerProfile.skills, s];
                                setFreelancerProfile({ ...freelancerProfile, skills: list });
                              }}
                              className="badge"
                              style={{
                                background: active ? 'rgba(48, 109, 41, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                borderColor: active ? 'var(--accent-primary)' : 'transparent',
                                color: active ? 'var(--text-heading)' : 'var(--text-secondary)'
                              }}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '12px', alignSelf: 'flex-start' }}>
                      Save Profile Changes
                    </button>
                  </form>
                ) : (
                  <div className="flex-column" style={{ gap: '12px', alignItems: 'flex-start' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-heading)' }}>{freelancerProfile.title || "Set profile title..."}</h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{freelancerProfile.bio || "Write profile bio..."}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Hourly rate:</span>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--success)' }}>${freelancerProfile.hourly_rate}/hr</span>
                    </div>
                    <div className="skills-container">
                      {freelancerProfile.skills.map(s => (
                        <span key={s} className="badge badge-info" style={{ fontSize: '9px', padding: '4px 8px' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Grid split for contracts and proposals */}
              <div className="grid-cols-2">
                
                {/* Active/Completed Contracts */}
                <section className="flex-column" style={{ gap: '16px' }}>
                  <h3 className="font-display" style={{ fontSize: '16px' }}>My Contracts Escrow</h3>
                  <div className="flex-column" style={{ gap: '12px' }}>
                    {myContracts.length === 0 ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No contracts established yet.</p>
                    ) : (
                      myContracts.map(c => (
                        <div key={c.id} className="glass-panel flex-column" style={{ gap: '12px', borderLeft: '4px solid var(--accent-primary)', padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600', fontSize: '13px' }}>Contract: {c.id.slice(0,8)}...</span>
                            <span className={`badge ${c.status === 'active' ? 'badge-info' : 'badge-success'}`}>{c.status}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Escrow Budget:</span>
                            <span style={{ fontWeight: '700', color: 'var(--success)' }}>${parseFloat(c.budget).toLocaleString()}</span>
                          </div>
                          {c.status === 'active' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-heading)' }}>
                              <RefreshCw style={{ width: '12px', height: '12px' }} className="animate-spin" />
                              <span>Work is in progress...</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Submitted Proposals */}
                <section className="flex-column" style={{ gap: '16px' }}>
                  <h3 className="font-display" style={{ fontSize: '16px' }}>Submitted Proposals</h3>
                  <div className="flex-column" style={{ gap: '12px' }}>
                    {myProposals.length === 0 ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No proposals submitted yet.</p>
                    ) : (
                      myProposals.map(p => (
                        <div key={p.id} className="glass-panel flex-column" style={{ gap: '12px', padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600', fontSize: '13px' }}>Proposal</span>
                            <span className={`badge ${p.status === 'pending' ? 'badge-warning' : p.status === 'accepted' ? 'badge-success' : 'badge-danger'}`}>{p.status}</span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>"{p.cover_letter}"</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Requested Rate:</span>
                            <span style={{ fontWeight: '700', color: 'var(--success)' }}>${parseFloat(p.rate)}/hr</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* 6. CLIENT DASHBOARD VIEW (Day 13 & 14) */}
          {activeTab === 'client-dashboard' && user?.role === 'client' && (
            <div className="flex-column" style={{ gap: '32px' }}>
              
              {/* Dashboard Action Header */}
              <section className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(48, 109, 41, 0.05) 0%, rgba(13, 83, 14, 0.05) 100%)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h2 className="font-display" style={{ fontSize: '18px' }}>Manage Client Operations</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Post new project requirements and evaluate candidate bids</p>
                </div>
                <button onClick={() => setShowNewJobModal(true)} className="btn-primary" style={{ padding: '10px 20px', fontSize: '12px' }}>
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Post New Job
                </button>
              </section>

              {/* Company Details */}
              <section className="glass-panel flex-column" style={{ gap: '16px' }}>
                <h3 className="font-display" style={{ fontSize: '16px' }}>Company Profile Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</span>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginTop: '4px' }}>{clientProfile.company_name || "Set company name..."}</h4>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Industry</span>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginTop: '4px' }}>{clientProfile.industry || "Set industry..."}</h4>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Website</span>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginTop: '4px' }}>{clientProfile.website || "Set website URL..."}</h4>
                  </div>
                </div>
              </section>

              {/* Grid split for client jobs and contracts */}
              <div className="grid-cols-2">
                
                {/* Active Client Jobs & Proposals */}
                <section className="flex-column" style={{ gap: '16px' }}>
                  <h3 className="font-display" style={{ fontSize: '16px' }}>Active Posted Jobs</h3>
                  <div className="flex-column" style={{ gap: '16px' }}>
                    {myPostedJobs.length === 0 ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No jobs posted yet.</p>
                    ) : (
                      myPostedJobs.map(job => (
                        <div key={job.id} className="glass-panel flex-column" style={{ gap: '16px', padding: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-heading)' }}>{job.title}</h4>
                            <span className="badge badge-info" style={{ fontSize: '9px' }}>{job.status}</span>
                          </div>
                          
                          {job.status === 'open' && (
                            <div className="flex-column" style={{ gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', alignItems: 'stretch' }}>
                              <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>Bids Received:</span>
                              {(jobProposals[job.id] || []).length === 0 ? (
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No proposals received.</p>
                              ) : (
                                (jobProposals[job.id] || []).map(prop => (
                                  <div key={prop.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(13, 83, 14, 0.02)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>"{prop.cover_letter}"</p>
                                      <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '700' }}>${parseFloat(prop.rate)}/hr bid</span>
                                    </div>
                                    <button 
                                      onClick={() => handleHireFreelancer(prop.id)}
                                      className="btn-primary"
                                      style={{ padding: '6px 12px', fontSize: '10px', flexShrink: 0 }}
                                    >
                                      Hire
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Contracts and Escrows */}
                <section className="flex-column" style={{ gap: '16px' }}>
                  <h3 className="font-display" style={{ fontSize: '16px' }}>Escrowed Contracts</h3>
                  <div className="flex-column" style={{ gap: '16px' }}>
                    {myContracts.length === 0 ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No active contracts.</p>
                    ) : (
                      myContracts.map(c => (
                        <div key={c.id} className="glass-panel flex-column" style={{ gap: '12px', padding: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '700', fontSize: '14px' }}>Contract: {c.id.slice(0, 8)}...</span>
                            <span className={`badge ${c.status === 'active' ? 'badge-info' : 'badge-success'}`}>{c.status}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Escrow Release Value:</span>
                            <span style={{ fontWeight: '700', color: 'var(--success)' }}>${parseFloat(c.budget).toLocaleString()}</span>
                          </div>
                          
                          {c.status === 'active' && (
                            <button 
                              onClick={() => handleCompleteContract(c.id)}
                              className="btn-secondary"
                              style={{
                                width: '100%',
                                justifyContent: 'center',
                                padding: '10px',
                                fontSize: '12px',
                                background: 'rgba(48, 109, 41, 0.05)',
                                borderColor: 'rgba(48, 109, 41, 0.15)',
                                color: 'var(--success)'
                              }}
                            >
                              Release Escrow & Complete
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* 7. ADMIN PANEL VIEW (Day 15) */}
          {activeTab === 'admin-panel' && user?.role === 'admin' && (
            <div className="flex-column" style={{ gap: '32px' }}>
              
              {/* KPI Stats cards */}
              <section className="stats-grid">
                <div className="glass-panel stats-card">
                  <div className="stats-details">
                    <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '10px', fontWeight: '700' }}>Registered Users</p>
                    <h2 style={{ fontSize: '28px', color: 'var(--text-heading)', marginTop: '6px' }}>{adminStats.users}</h2>
                  </div>
                </div>
                <div className="glass-panel stats-card">
                  <div className="stats-details">
                    <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '10px', fontWeight: '700' }}>Total Posted Jobs</p>
                    <h2 style={{ fontSize: '28px', color: 'var(--accent-primary)', marginTop: '6px' }}>{adminStats.jobs}</h2>
                  </div>
                </div>
                <div className="glass-panel stats-card">
                  <div className="stats-details">
                    <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '10px', fontWeight: '700' }}>Contracts Released</p>
                    <h2 style={{ fontSize: '28px', color: 'var(--success)', marginTop: '6px' }}>{adminStats.contracts}</h2>
                  </div>
                </div>
              </section>

              {/* Taxonomy Skill Form */}
              <section className="glass-panel flex-column" style={{ gap: '16px', maxWidth: '520px' }}>
                <h3 className="font-display" style={{ fontSize: '16px' }}>Add Global Skill Taxonomy</h3>
                <form onSubmit={handleCreateSkill} style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    type="text" 
                    required 
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Enter skill name (e.g. Next.js)..." 
                    className="input-field"
                  />
                  <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '10px 20px', fontSize: '12px' }}>
                    Create Skill
                  </button>
                </form>
              </section>
            </div>
          )}

        </main>
      </div>

      {/* NEW JOB MODAL (Client) */}
      {showNewJobModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title-row">
              <h3>Post New Project Requirement</h3>
              <button onClick={() => setShowNewJobModal(false)} style={{ fontSize: '16px', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleCreateJob} className="flex-column" style={{ gap: '16px' }}>
              <div className="form-group">
                <label>Project Title</label>
                <input 
                  type="text" 
                  required 
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="e.g. Docker Compose Setup for Backend API" 
                  className="input-field" 
                />
              </div>
              <div className="form-group">
                <label>Project Description</label>
                <textarea 
                  required 
                  rows="4"
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Provide detailed description of project deliverables..." 
                  className="input-field"
                  style={{ resize: 'none' }}
                />
              </div>
              <div className="form-group">
                <label>Project Budget ($)</label>
                <input 
                  type="number" 
                  required 
                  value={newJob.budget}
                  onChange={(e) => setNewJob({ ...newJob, budget: parseFloat(e.target.value) })}
                  className="input-field" 
                />
              </div>
              <div className="form-group">
                <label>Tag Required Skills:</label>
                <div className="skills-container" style={{ marginTop: '4px' }}>
                  {SYSTEM_SKILLS.map(s => {
                    const active = newJob.skills.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => {
                          const list = active 
                            ? newJob.skills.filter(i => i !== s) 
                            : [...newJob.skills, s];
                          setNewJob({ ...newJob, skills: list });
                        }}
                        className="badge"
                        style={{
                          background: active ? 'rgba(48, 109, 41, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          borderColor: active ? 'var(--accent-primary)' : 'transparent',
                          color: active ? 'var(--text-heading)' : 'var(--text-secondary)',
                          fontSize: '10px'
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
                Publish Project Requirement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BID / PROPOSAL SUBMISSION & MATCHING VISUALIZATION MODAL (Freelancer) */}
      {selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title-row">
              <h3>Apply for Project Bidding</h3>
              <button onClick={() => setSelectedJob(null)} style={{ fontSize: '16px', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {/* Intelligent Compatibility Match Analysis Breakdown */}
            {selectedJob.match && (
              <div className="glass-panel flex-column" style={{ gap: '12px', background: 'rgba(48, 109, 41, 0.03)', borderColor: 'rgba(48, 109, 41, 0.15)', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-heading)', fontWeight: '700', fontSize: '13px' }}>
                  <TrendingUp style={{ width: '16px', height: '16px' }} />
                  <span>Intelligent Similarity Match Analysis</span>
                </div>
                
                {/* Visual bar chart breakdown */}
                <div className="flex-column" style={{ gap: '10px' }}>
                  <div className="progress-container">
                    <div className="progress-label-row">
                      <span>Text Similarity Fit (40%)</span>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{(selectedJob.match.breakdown.text_similarity * 100).toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill indigo" style={{ width: `${selectedJob.match.breakdown.text_similarity * 100}%` }} />
                    </div>
                  </div>

                  <div className="progress-container">
                    <div className="progress-label-row">
                      <span>Skill Taxonomy Match (40%)</span>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{(selectedJob.match.breakdown.skill_match * 100).toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill purple" style={{ width: `${selectedJob.match.breakdown.skill_match * 100}%` }} />
                    </div>
                  </div>

                  <div className="progress-container">
                    <div className="progress-label-row">
                      <span>Budget Fit (20%)</span>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{(selectedJob.match.breakdown.budget_fit * 100).toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill emerald" style={{ width: `${selectedJob.match.breakdown.budget_fit * 100}%` }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Overall Match Compatibility:</span>
                    <span style={{ color: 'var(--text-heading)', fontWeight: '800', fontSize: '14px' }}>{(selectedJob.match.match_score * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitProposal} className="flex-column" style={{ gap: '16px' }}>
              <div className="form-group">
                <label>Bidding Rate ($ / hr)</label>
                <input 
                  type="number" 
                  required 
                  value={proposalRate}
                  onChange={(e) => setProposalRate(parseFloat(e.target.value))}
                  className="input-field" 
                />
              </div>
              <div className="form-group">
                <label>Proposal Cover Letter</label>
                <textarea 
                  required 
                  rows="4"
                  value={proposalCover}
                  onChange={(e) => setProposalCover(e.target.value)}
                  placeholder="Explain why you are the best fit for this project..." 
                  className="input-field"
                  style={{ resize: 'none' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
                Submit Bid Proposal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POST CONTRACT REVIEW MODAL (Client) */}
      {showReviewModal && selectedContract && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="auth-header" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--success)' }}>Release Escrow & Review</h3>
              <p>Work is completed! Provide rating feedback to finalise contract release.</p>
            </div>
            <form onSubmit={handleSubmitReview} className="flex-column" style={{ gap: '16px' }}>
              <div className="form-group">
                <label>Select Rating (1 to 5 Stars)</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: reviewRating >= star ? '#F59E0B' : 'rgba(13, 83, 14, 0.1)',
                        transition: 'transform 0.1s'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Comments / Feedback</label>
                <textarea 
                  required
                  rows="3"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Write a brief review detailing freelancer execution..." 
                  className="input-field"
                  style={{ resize: 'none' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
                Submit Review & Finalize
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
