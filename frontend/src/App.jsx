import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Briefcase, Search, Bell, LogOut, Plus, Star, CheckCircle2,
  AlertCircle, TrendingUp, FileText, ChevronRight, User,
  Building, Globe, Clock, Shield, Zap, Award, BarChart3,
  ArrowRight, Menu, X, Check, Edit3, Send, MessageCircle, CreditCard
} from 'lucide-react';
import api, { clearAuth, getWsUrl } from './api';
import './index.css';

/* ─── Constants ─── */
const SKILLS = ["Python","JavaScript","React","Node.js","PostgreSQL","UI/UX Design","Mobile Dev","Data Science","DevOps","TypeScript","Vue.js","Machine Learning","PHP","Swift","Kotlin","Go","Rust","Docker","AWS","Figma"];

const CATEGORIES = [
  { icon: '💻', label: 'Development' },
  { icon: '🎨', label: 'Design' },
  { icon: '📊', label: 'Marketing' },
  { icon: '✍️', label: 'Writing' },
  { icon: '📱', label: 'Mobile' },
  { icon: '🔒', label: 'Security' },
  { icon: '📈', label: 'Finance' },
  { icon: '🎬', label: 'Video' },
];

/* ─── Toast ─── */
function Toast({ alert }) {
  if (!alert) return null;
  return (
    <div className={`toast ${alert.type}`}>
      {alert.type === 'success'
        ? <CheckCircle2 className="toast-icon" style={{ color: 'var(--success)' }} />
        : <AlertCircle  className="toast-icon" style={{ color: 'var(--danger)' }} />
      }
      <span className="toast-msg">{alert.message}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════════════════════ */
function LandingPage({ onHire, onFindWork }) {
  const featureCards = [
    {
      icon: <Search size={22} />,
      title: 'AI-Powered Matching',
      desc: 'We surface the best-fit talent based on skills, experience, and prior work.',
      tone: 'violet',
    },
    {
      icon: <Shield size={22} />,
      title: 'Secure Collaboration',
      desc: 'Built-in safeguards for payments, approvals, and trusted project delivery.',
      tone: 'blue',
    },
    {
      icon: <Zap size={22} />,
      title: 'Fast Hiring Flow',
      desc: 'Post, match, and start working in minutes with a focused hiring workflow.',
      tone: 'indigo',
    },
  ];

  const processSteps = [
    { n: '1', title: 'Post a Project', desc: 'Describe the work and specialized requirements.' },
    { n: '2', title: 'Get Matched', desc: 'Review the best freelancers and technical experts.' },
    { n: '3', title: 'Collaborate', desc: 'Chat, share files, and track progress together.' },
    { n: '4', title: 'Complete & Pay', desc: 'Approve the work and release secure payments.' },
  ];

  const stats = [
    { value: '10K+', label: 'Freelancers' },
    { value: '5K+', label: 'Clients' },
    { value: '50K+', label: 'Projects Completed' },
    { value: '98%', label: 'Satisfaction Rate' },
  ];

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="landing-brand">
          <div className="landing-brand-mark">
            <Briefcase size={18} color="#f4efff" />
          </div>
          <span>EliteMatch</span>
        </div>

        <nav className="landing-links" aria-label="Primary">
          <a href="#how-it-works">How It Works</a>
          <a href="#clients">For Clients</a>
          <a href="#freelancers">For Freelancers</a>
          <a href="#pricing">Pricing</a>
          <a href="#resources">Resources</a>
        </nav>

        <button className="landing-cta" onClick={onHire}>Get Started</button>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <p className="landing-kicker">EliteMatch connects specialized talent with fast-moving teams</p>
            <h1 className="landing-title">
              Find Talent.
              <br />
              Get Work. <span>Grow Together.</span>
            </h1>
            <p className="landing-subtitle">
              EliteMatch connects businesses with top specialized mathematical and technical talent using AI-powered matching for smarter, faster, and hassle-free hiring.
            </p>
            <div className="landing-actions">
              <button className="landing-primary-btn" onClick={onHire}>
                Hire Top Talent
                <span className="landing-btn-arrow"><ArrowRight size={18} /></span>
              </button>
              <button className="landing-secondary-btn" onClick={onFindWork}>
                Find Work
              </button>
            </div>
            <div className="landing-stats" aria-label="Platform statistics">
              {stats.map((stat) => (
                <div key={stat.label} className="landing-stat">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-hero-visual" aria-hidden="true">
            <div className="visual-orbit visual-orbit-one" />
            <div className="visual-orbit visual-orbit-two" />
            <div className="glass-card glass-card-back" />
            <div className="glass-card glass-card-top">
              <div className="glass-window" />
            </div>
            <div className="glass-card profile-card profile-card-main">
              <div className="profile-ring">
                <User size={30} />
              </div>
              <div className="profile-lines">
                <span />
                <span />
                <span />
              </div>
              <div className="mini-badge">&lt;/&gt;</div>
            </div>
            <div className="glass-card profile-card profile-card-side">
              <div className="profile-avatar">+</div>
              <div className="profile-lines compact">
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="glass-card profile-card profile-card-small">
              <div className="profile-avatar alt">×</div>
              <div className="profile-lines compact">
                <span />
                <span />
              </div>
            </div>
            <div className="glass-node glass-node-top" />
            <div className="glass-node glass-node-left" />
            <div className="glass-node glass-node-bottom" />
            <div className="glass-node glass-node-right" />
          </div>
        </section>

        <section className="section-shell section-features">
          <div className="section-heading">
            <h2>Why EliteMatch?</h2>
            <p>Specialized talent, secure collaboration, and seamless workflows for high-trust hiring.</p>
          </div>
          <div className="feature-grid">
            {featureCards.map((card) => (
              <article key={card.title} className={`feature-panel ${card.tone}`}>
                <div className="feature-icon-wrap">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </article>
            ))}
          </div>
          <div className="center-action">
            <button className="landing-secondary-btn dark">Explore More <ArrowRight size={16} /></button>
          </div>
        </section>

        <section className="section-shell section-how" id="how-it-works">
          <div className="section-heading">
            <h2>How EliteMatch Works</h2>
            <p>A simple process for connecting specialized talent and clients.</p>
          </div>
          <div className="process-grid">
            {processSteps.map((step) => (
              <article key={step.n} className="process-step">
                <div className="process-step-number">{step.n}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            ))}
          </div>

          <div className="trust-panel">
            <div className="trust-copy">
              <p className="trust-copy-title">Trusted by thousands worldwide</p>
              <p>Join a growing community of clients and freelancers choosing a more focused marketplace.</p>
              <button className="trust-btn" onClick={onHire}>Join EliteMatch <ArrowRight size={16} /></button>
            </div>
            <div className="trust-metrics">
              <div>
                <Building size={22} />
                <strong>10K+</strong>
                <span>Active Freelancers</span>
              </div>
              <div>
                <Globe size={22} />
                <strong>5K+</strong>
                <span>Happy Clients</span>
              </div>
              <div>
                <Clock size={22} />
                <strong>50K+</strong>
                <span>Projects Completed</span>
              </div>
              <div>
                <Star size={22} />
                <strong>4.9/5</strong>
                <span>Average Rating</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell section-audience">
  <div className="audience-copy" id="clients">
    <h2>For Clients & Freelancers</h2>

    <p>
      Whether you need skilled professionals or want to showcase your
      professional skills, EliteMatch is the perfect place to grow and
      succeed.
    </p>

    <div className="audience-actions">
      <button className="audience-btn primary" onClick={onHire}>
        I’m a Client <ArrowRight size={16} />
      </button>

      <button className="audience-btn" onClick={onFindWork}>
        I’m a Freelancer <ArrowRight size={16} />
      </button>
    </div>
  </div>

  {/* Modify this card with some content */}
  <div className="audience-visual" id="freelancers" aria-hidden="true">

    {/* Make it prettier */}
    <div className="audience-screen">
      <div className="screen-topbar">
        <span />
        <span />
        <span />
      </div>

      <div className="screen-chart">
        <div />
        <div />
        <div />
        <div />
      </div>

      <div className="screen-card-row">
        <div className="screen-chip">
          <strong>48h</strong>
          <span>Average match time</span>
        </div>

        <div className="screen-chip">
          <strong>4.9/5</strong>
          <span>Top freelancer rating</span>
        </div>
      </div>

      <div className="screen-insight">
        <div>
          <strong>1,240</strong>
          <span>Projects matched this month</span>
        </div>

        <div className="screen-mini-progress">
          <span style={{ width: "82%" }} />
        </div>
      </div>
    </div>

  </div>
</section>

      <footer className="landing-footer">
        <div className="footer-top">
          <div>
            <div className="footer-brand">Elite Match</div>
            <p>The smart freelance marketplace for specialized talent, collaboration, and growth.</p>
          </div>
          <div>
            <h4>Platform</h4>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#resources">Resources</a>
            <a href="#">Help Center</a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Cookie Policy</a>
          </div>
          <div>
            <h4>Stay Connected</h4>
            <div className="social-row">
              <span>t</span>
              <span>in</span>
              <span>ig</span>
              <span>gh</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 Elite Match. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AUTH PAGE
═══════════════════════════════════════════════════════════ */
function AuthPage({ initialTab = 'login', initialRole = 'client', onSuccess, onBack }) {
  const [tab, setTab] = useState(initialTab); // 'login' | 'register'
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('access_token',  res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      onSuccess(res.data.access_token);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/auth/register', { email, password, role });
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('access_token',  res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      onSuccess(res.data.access_token);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-logo">
            <div className="auth-left-logo-icon">
              <Briefcase size={22} color="#fff" />
            </div>
            <span className="auth-left-logo-text">EliteMatch</span>
          </div>
          <h2 className="auth-left-title">
            Where Great<br />Work <span className="auth-left-title-accent">Happens</span>
          </h2>
          <p className="auth-left-sub">
            Connect with top-tier talent or find your next great project. EliteMatch makes it simple, secure, and professional.
          </p>
          <div className="auth-testimonial">
            <p className="auth-testimonial-text">
              "EliteMatch helped us find a world-class developer in 48 hours. The quality of talent on this platform is unmatched."
            </p>
            <div className="auth-testimonial-author">
              <div className="auth-testimonial-avatar">S</div>
              <div>
                <div className="auth-testimonial-name">Sarah Chen</div>
                <div className="auth-testimonial-role">CTO, NovaTech</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-tab-switcher">
            <button className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
            <button className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Create Account</button>
          </div>

          {tab === 'login' ? (
            <>
              <h1 className="auth-heading">Welcome back</h1>
              <p className="auth-sub">Sign in to your EliteMatch account</p>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px', padding: '10px 14px', background: '#fef2f2', borderRadius: 'var(--radius)', border: '1px solid #fecaca' }}>{error}</div>}
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
              <div className="auth-switch">
                Don't have an account?{' '}
                <button className="auth-switch-link" onClick={() => setTab('register')}>Create one for free</button>
              </div>
            </>
          ) : (
            <>
              <h1 className="auth-heading">Create your account</h1>
              <p className="auth-sub">Join EliteMatch — it's free to get started</p>
              <div className="auth-role-selector">
                <div className={`auth-role-card ${role === 'client' ? 'selected' : ''}`} onClick={() => setRole('client')}>
                  <div className="auth-role-icon">🏢</div>
                  <div className="auth-role-label">I'm a Client</div>
                  <div className="auth-role-desc">Hiring for a project</div>
                </div>
                <div className={`auth-role-card ${role === 'freelancer' ? 'selected' : ''}`} onClick={() => setRole('freelancer')}>
                  <div className="auth-role-icon">💼</div>
                  <div className="auth-role-label">I'm a Freelancer</div>
                  <div className="auth-role-desc">Looking for work</div>
                </div>
              </div>
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password <span style={{color:'var(--text-muted)',fontWeight:400}}>(min. 8 characters)</span></label>
                  <input className="form-input" type="password" placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
                </div>
                {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px', padding: '10px 14px', background: '#fef2f2', borderRadius: 'var(--radius)', border: '1px solid #fecaca' }}>{error}</div>}
                <button className="btn btn-green" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
                  {loading ? 'Creating account…' : `Create ${role === 'client' ? 'Client' : 'Freelancer'} Account`}
                </button>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
              <div className="auth-switch">
                Already have an account?{' '}
                <button className="auth-switch-link" onClick={() => setTab('login')}>Sign in</button>
              </div>
            </>
          )}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR (dashboard)
═══════════════════════════════════════════════════════════ */
function Navbar({ user, notifications, onNotifClick, showNotif, onMarkAll, onMarkOne, onLogoClick }) {
  const unread = notifications.filter(n => !n.is_read).length;
  const initials = user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={onLogoClick}>
        <div className="navbar-logo-icon">
          <Briefcase size={20} color="#fff" />
        </div>
        <span className="navbar-logo-text">EliteMatch</span>
      </div>
      <div className="navbar-spacer" />
      <div className="navbar-links">
        <div className="navbar-user">
          <div style={{ position: 'relative' }}>
            <button className="navbar-notif-btn" onClick={onNotifClick}>
              <Bell size={18} />
              {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
            </button>
            {showNotif && (
              <div className="notif-dropdown">
                <div className="notif-dropdown-header">
                  <h4>Notifications</h4>
                  <button className="btn btn-ghost btn-sm" onClick={onMarkAll}>Mark all read</button>
                </div>
                {notifications.length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>You're all caught up!</div>
                )}
                {notifications.slice(0, 8).map(n => (
                  <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`} onClick={() => onMarkOne(n.id)}>
                    <div className="notif-item-title">{n.title}</div>
                    <div className="notif-item-body">{n.body}</div>
                  </div>
                ))}
                {notifications.length > 0 && (
                  <button className="notif-mark-all-btn" onClick={onMarkAll}>Mark all as read</button>
                )}
              </div>
            )}
          </div>
          <div className="navbar-avatar">{initials}</div>
          <span style={{ fontSize: '14px', color: 'var(--navy-100)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</span>
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════ */
function Sidebar({ user, activeTab, setActiveTab, onLogout }) {
  const clientLinks = [
    { id: 'dashboard', icon: <BarChart3 size={18} />, label: 'Dashboard' },
    { id: 'messages',  icon: <MessageCircle size={18} />, label: 'Messages' },
    { id: 'post-job',  icon: <Plus size={18} />,      label: 'Post a Job' },
    { id: 'my-jobs',   icon: <Briefcase size={18} />, label: 'My Projects' },
    { id: 'contracts', icon: <FileText size={18} />,  label: 'Contracts' },
  ];
  const freelancerLinks = [
    { id: 'dashboard',    icon: <BarChart3 size={18} />,    label: 'Dashboard' },
    { id: 'messages',     icon: <MessageCircle size={18} />, label: 'Messages' },
    { id: 'find-projects',icon: <Search size={18} />,       label: 'Find Projects' },
    { id: 'proposals',   icon: <Send size={18} />,          label: 'My Proposals' },
    { id: 'contracts',   icon: <FileText size={18} />,      label: 'Contracts' },
  ];
  const links = user?.role === 'client' ? clientLinks : freelancerLinks;
  const initials = user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">{user?.role === 'client' ? 'Client' : 'Freelancer'} Menu</div>
        {links.map(l => (
          <button key={l.id} className={`sidebar-nav-btn ${activeTab === l.id ? 'active' : ''}`} onClick={() => setActiveTab(l.id)}>
            {l.icon} {l.label}
          </button>
        ))}
      </div>
      <div className="sidebar-divider" />
      <div className="sidebar-section">
        <button className={`sidebar-nav-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={18} /> My Profile
        </button>
      </div>
      <div className="sidebar-spacer" />
      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">{initials}</div>
          <div>
            <div className="sidebar-user-name" style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={onLogout}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════
   CLIENT DASHBOARD
═══════════════════════════════════════════════════════════ */
function ClientDashboard({ jobs, contracts, proposals, onHire, onComplete, onViewJob, triggerAlert }) {
  const activeContracts  = contracts.filter(c => c.status === 'active');
  const doneContracts    = contracts.filter(c => c.status === 'completed');
  const openJobs         = jobs.filter(j => j.status === 'open');
  const totalProposals   = Object.values(proposals).flat().length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Client Dashboard</h1>
        <p className="page-subtitle">Overview of your projects and hiring activity</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green"><Briefcase size={18} /></div>
          <div className="stat-label">Active Projects</div>
          <div className="stat-value">{openJobs.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><FileText size={18} /></div>
          <div className="stat-label">Proposals Received</div>
          <div className="stat-value">{totalProposals}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon navy"><TrendingUp size={18} /></div>
          <div className="stat-label">Active Contracts</div>
          <div className="stat-value">{activeContracts.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold"><Award size={18} /></div>
          <div className="stat-label">Completed</div>
          <div className="stat-value">{doneContracts.length}</div>
        </div>
      </div>

      {/* Active jobs with proposals */}
      <div className="card card-padding" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700' }}>Open Projects & Proposals</h2>
        </div>
        {openJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No open projects</div>
            <div className="empty-state-desc">Post your first project to start receiving proposals from talented freelancers.</div>
          </div>
        ) : (
          openJobs.map(job => {
            const jobProposals = proposals[job.id] || [];
            return (
              <div key={job.id} style={{ marginBottom: '16px', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer' }} onClick={() => onViewJob(job)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{job.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Budget: <strong style={{ color: 'var(--green-600)' }}>${parseFloat(job.budget).toLocaleString()}</strong></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-blue">{jobProposals.length} proposals</span>
                    <span className="badge badge-green">Open</span>
                  </div>
                </div>
                <div className="skills-wrap" style={{ marginTop: '10px' }}>
                  {(job.skills || []).slice(0, 5).map(s => <span key={s.name} className="skill-tag">{s.name}</span>)}
                </div>
                {jobProposals.length > 0 && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Proposals</div>
                    {jobProposals.slice(0, 3).map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>{p.freelancer_email || 'Freelancer'}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.cover_letter?.slice(0, 80)}…</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: '800', color: 'var(--green-600)', fontSize: '15px' }}>${p.rate}/hr</span>
                          {p.status === 'pending' && (
                            <button className="btn btn-green btn-sm" onClick={e => { e.stopPropagation(); onHire(p.id); }}>Hire</button>
                          )}
                          {p.status === 'accepted' && <span className="badge badge-green">Hired</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Active Contracts */}
      {activeContracts.length > 0 && (
        <div className="card card-padding">
          <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>Active Contracts</h2>
          <table className="data-table">
            <thead>
              <tr><th>Project</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {activeContracts.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: '600' }}>{c.job_title || 'Contract'}</td>
                  <td><span className="badge badge-navy">In Progress</span></td>
                  <td>
                    <button className="btn btn-green btn-sm" onClick={() => onComplete(c.id)}>Mark Complete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   POST JOB FORM (Client)
═══════════════════════════════════════════════════════════ */
function PostJobForm({ onSuccess, triggerAlert }) {
  const [form, setForm] = useState({ title: '', description: '', budget: 1000, skills: [] });
  const [loading, setLoading] = useState(false);

  const toggleSkill = (s) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(s) ? prev.skills.filter(x => x !== s) : [...prev.skills, s]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const created = await api.post('/jobs', form);
      await api.post(`/jobs/${created.data.id}/status?new_status=open`);
      triggerAlert('success', 'Project published successfully! Freelancers can now submit proposals.');
      onSuccess();
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to publish project.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Post a New Project</h1>
        <p className="page-subtitle">Describe your needs and start receiving proposals from qualified freelancers</p>
      </div>
      <div className="card card-padding" style={{ maxWidth: '720px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input className="form-input" placeholder="e.g. Build a React dashboard for my SaaS app" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required minLength={5} />
          </div>
          <div className="form-group">
            <label className="form-label">Project Description *</label>
            <textarea className="form-input form-textarea" rows={6} placeholder="Describe the project in detail — goals, deliverables, timeline, and any specific requirements…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required minLength={10} />
          </div>
          <div className="form-group">
            <label className="form-label">Budget (USD) *</label>
            <input className="form-input" type="number" min={50} value={form.budget} onChange={e => setForm({ ...form, budget: parseFloat(e.target.value) })} required />
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Set the total project budget. Freelancers will propose their rates.</div>
          </div>
          <div className="form-group">
            <label className="form-label">Required Skills</label>
            <div className="skills-wrap">
              {SKILLS.map(s => (
                <span key={s} className={`skill-tag skill-tag-selectable ${form.skills.includes(s) ? 'selected' : ''}`} onClick={() => toggleSkill(s)}>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-green btn-lg" type="submit" disabled={loading}>
              {loading ? 'Publishing…' : <><Zap size={18} /> Publish Project</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FIND PROJECTS (Freelancer)
═══════════════════════════════════════════════════════════ */
function FindProjects({ triggerAlert, onProposalSent }) {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [rate, setRate] = useState(50);
  const [cover, setCover] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get('/jobs')
       .then(r => setJobs(r.data.filter(j => j.status === 'open')))
       .catch(() => {})
       .finally(() => setFetching(false));
  }, []);

  const filtered = jobs.filter(j =>
    (j.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (j.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const handlePropose = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/proposals', { job_id: selectedJob.id, rate, cover_letter: cover });
      triggerAlert('success', 'Proposal submitted! The client will review it shortly.');
      setSelectedJob(null); setCover(''); onProposalSent?.();
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to submit proposal.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Find Projects</h1>
        <p className="page-subtitle">Browse open projects and submit your proposals</p>
      </div>

      <div className="search-bar-wrap">
        <Search size={18} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
        <input className="search-input" placeholder="Search projects by title, skill, or keyword…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {fetching ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No projects found</div>
          <div className="empty-state-desc">Try a different search term or check back later for new opportunities.</div>
        </div>
      ) : (

      <div style={{ display: 'grid', gap: '16px' }}>
        {filtered.map(job => (
          <div className="job-card" key={job.id}>
            <div className="job-card-header">
              <div>
                <div className="job-card-title">{job.title}</div>
                <div className="job-card-meta">
                  <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Posted recently
                </div>
              </div>
              <div className="job-card-budget">${parseFloat(job.budget).toLocaleString()}</div>
            </div>
            <p className="job-card-desc">{job.description.slice(0, 200)}{job.description.length > 200 ? '…' : ''}</p>
            <div className="job-card-footer">
              <div className="skills-wrap">
                {(job.skills || []).slice(0, 4).map(s => <span key={s.name} className="skill-tag">{s.name}</span>)}
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedJob(job)}>
                Submit Proposal <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Proposal Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedJob(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Submit a Proposal</div>
              <button className="modal-close" onClick={() => setSelectedJob(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius)', marginBottom: '20px', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: '700', marginBottom: '4px' }}>{selectedJob.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Budget: ${parseFloat(selectedJob.budget).toLocaleString()}</div>
              </div>
              <form id="proposal-form" onSubmit={handlePropose}>
                <div className="form-group">
                  <label className="form-label">Your Hourly Rate (USD)</label>
                  <input className="form-input" type="number" min={5} value={rate} onChange={e => setRate(parseFloat(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Letter *</label>
                  <textarea className="form-input form-textarea" rows={5} placeholder="Introduce yourself, explain your relevant experience, and why you're the best fit for this project…" value={cover} onChange={e => setCover(e.target.value)} required />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-gray" onClick={() => setSelectedJob(null)}>Cancel</button>
              <button className="btn btn-green" form="proposal-form" type="submit" disabled={loading}>
                {loading ? 'Submitting…' : <><Send size={16} /> Submit Proposal</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FREELANCER DASHBOARD
═══════════════════════════════════════════════════════════ */
function FreelancerDashboard({ proposals, contracts, setTab }) {
  const pending  = proposals.filter(p => p.status === 'pending');
  const accepted = proposals.filter(p => p.status === 'accepted');
  const active   = contracts.filter(c => c.status === 'active');
  const done     = contracts.filter(c => c.status === 'completed');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Freelancer Dashboard</h1>
        <p className="page-subtitle">Track your proposals, contracts, and earnings</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Send size={18} /></div>
          <div className="stat-label">Pending Proposals</div>
          <div className="stat-value">{pending.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Check size={18} /></div>
          <div className="stat-label">Accepted</div>
          <div className="stat-value">{accepted.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon navy"><TrendingUp size={18} /></div>
          <div className="stat-label">Active Contracts</div>
          <div className="stat-value">{active.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold"><Award size={18} /></div>
          <div className="stat-label">Completed</div>
          <div className="stat-value">{done.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card card-padding">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Recent Proposals</h3>
          {proposals.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-desc">You haven't submitted any proposals yet.</div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => setTab('find-projects')}>Browse Projects</button>
            </div>
          ) : (
            proposals.slice(0, 5).map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{p.job_title || 'Project'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>${p.rate}/hr</div>
                </div>
                <span className={`badge badge-${p.status === 'pending' ? 'navy' : p.status === 'accepted' ? 'green' : 'gray'}`}>{p.status}</span>
              </div>
            ))
          )}
        </div>

        <div className="card card-padding">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Active Contracts</h3>
          {active.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <div className="empty-state-icon">📄</div>
              <div className="empty-state-desc">No active contracts yet. Keep submitting proposals!</div>
            </div>
          ) : (
            active.map(c => (
              <div key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{c.job_title || 'Contract'}</div>
                <span className="badge badge-green">Active</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CONTRACTS VIEW (Shared)
═══════════════════════════════════════════════════════════ */
function ContractsView({ contracts, user, onComplete, onReview, triggerAlert }) {
  const [reviewModal, setReviewModal]   = useState(null);
  const [rating, setRating]             = useState(5);
  const [comment, setComment]           = useState('');
  const [chatContract, setChatContract] = useState(null); // contract object shown in chat panel
  const [messages, setMessages]         = useState([]);
  const [msgInput, setMsgInput]         = useState('');
  const [payStatus, setPayStatus]       = useState({});   // { [contractId]: paymentObj }
  const wsRef        = useRef(null);
  const chatBottomRef = useRef(null);

  /* ── Load payment status for all active contracts ── */
  useEffect(() => {
    const fetchPayments = async () => {
      const active = contracts.filter(c => c.status === 'active');
      const results = {};
      for (const c of active) {
        try {
          const res = await api.get(`/payments/${c.id}`);
          results[c.id] = res.data;
        } catch (_) {
          results[c.id] = null; // no payment record yet
        }
      }
      setPayStatus(results);
    };
    if (contracts.length > 0) fetchPayments();
  }, [contracts]);

  /* ── Open Chat ── */
  const openChat = async (contract) => {
    setChatContract(contract);
    // Fetch history
    try {
      const res = await api.get(`/messages/${contract.id}`);
      setMessages(res.data);
    } catch (_) { setMessages([]); }

    // Open WebSocket
    const token = localStorage.getItem('access_token');
    const wsBase = getWsUrl();
    const ws = new WebSocket(`${wsBase}/messages/ws/${contract.id}?token=${token}`);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setMessages(prev => [...prev, msg]);
    };
    ws.onerror = () => {};
    wsRef.current = ws;
  };

  const closeChat = () => {
    wsRef.current?.close();
    wsRef.current = null;
    setChatContract(null);
    setMessages([]);
    setMsgInput('');
  };

  const sendMessage = () => {
    const content = msgInput.trim();
    if (!content || !wsRef.current) return;
    
    if (wsRef.current.readyState !== WebSocket.OPEN) {
      triggerAlert('error', 'Chat is connecting... please wait a moment and try again.');
      return;
    }
    
    wsRef.current.send(JSON.stringify({ content }));
    setMsgInput('');
  };

  /* ── Auto-scroll chat to bottom ── */
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Payment helpers ── */
  const fundContract = async (contractId) => {
    try {
      const res = await api.post(`/payments/checkout-session/${contractId}`);
      window.location.href = res.data.checkout_url; // redirect to Stripe
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Payment failed to initialize.');
    }
  };

  const releaseFunds = async (contractId) => {
    try {
      const res = await api.post(`/payments/release/${contractId}`);
      setPayStatus(prev => ({ ...prev, [contractId]: res.data }));
      triggerAlert('success', 'Funds released! The contract is now marked complete.');
      onComplete && onComplete(contractId);
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Could not release funds.');
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', { contract_id: reviewModal.id, rating, comment });
      triggerAlert('success', 'Review submitted successfully!');
      setReviewModal(null); setComment('');
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to submit review.');
    }
  };

  const paymentBadge = (contractId) => {
    const p = payStatus[contractId];
    if (!p) return <span className="badge badge-gray">Unpaid</span>;
    if (p.status === 'held_in_escrow') return <span className="badge badge-navy">💰 Escrowed</span>;
    if (p.status === 'released')       return <span className="badge badge-green">✅ Paid</span>;
    if (p.status === 'pending')        return <span className="badge badge-gold">Pending</span>;
    return null;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Contracts</h1>
        <p className="page-subtitle">All your project contracts — chat, pay, and track progress</p>
      </div>

      {contracts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <div className="empty-state-title">No contracts yet</div>
          <div className="empty-state-desc">Your contracts will appear here once a project gets started.</div>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr><th>Project</th><th>Status</th><th>Payment</th><th>Started</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {contracts.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: '600' }}>{c.job_title || 'Contract'}</td>
                  <td>
                    <span className={`badge badge-${c.status === 'active' ? 'navy' : c.status === 'completed' ? 'green' : 'gray'}`}>
                      {c.status === 'active' ? 'In Progress' : c.status}
                    </span>
                  </td>
                  <td>{c.status === 'active' ? paymentBadge(c.id) : '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{c.start_date ? new Date(c.start_date).toLocaleDateString() : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {/* Chat button — available for active contracts to both roles */}
                      {c.status === 'active' && (
                        <button className="btn btn-outline-gray btn-sm" onClick={() => openChat(c)}>
                          <MessageCircle size={13} /> Chat
                        </button>
                      )}

                      {/* Payment buttons — client only */}
                      {user?.role === 'client' && c.status === 'active' && (() => {
                        const p = payStatus[c.id];
                        if (!p || p.status === 'pending') {
                          return (
                            <button className="btn btn-gold btn-sm" onClick={() => fundContract(c.id)}>
                              <CreditCard size={13} /> Fund Contract
                            </button>
                          );
                        }
                        if (p.status === 'held_in_escrow') {
                          return (
                            <button className="btn btn-green btn-sm" onClick={() => releaseFunds(c.id)}>
                              <CheckCircle2 size={13} /> Release & Complete
                            </button>
                          );
                        }
                        return null;
                      })()}

                      {/* Legacy complete without payment */}
                      {user?.role === 'client' && c.status === 'active' && !payStatus[c.id] && (
                        <button className="btn btn-outline-gray btn-sm" onClick={() => onComplete(c.id)}>Mark Complete</button>
                      )}

                      {c.status === 'completed' && (
                        <button className="btn btn-outline-gray btn-sm" onClick={() => setReviewModal(c)}>
                          <Star size={13} /> Leave Review
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Chat Slide-in Panel ── */}
      {chatContract && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeChat()}>
          <div className="modal" style={{ maxWidth: '520px', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            {/* Header */}
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div className="modal-title">
                <MessageCircle size={18} style={{ marginRight: '8px', display: 'inline' }} />
                {chatContract.job_title || 'Contract Chat'}
              </div>
              <button className="modal-close" onClick={closeChat}>×</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                  <MessageCircle size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
                  No messages yet — say hello!
                </div>
              )}
              {messages.map((m, i) => {
                const isMine = m.sender_id === user?.id;
                return (
                  <div key={m.id || i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '72%', padding: '10px 14px', borderRadius: '18px',
                      background: isMine ? 'var(--gold)' : 'var(--card-hover)',
                      color: isMine ? '#fff' : 'var(--text)',
                      fontSize: '14px', lineHeight: '1.4',
                    }}>
                      {!isMine && <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px', opacity: 0.7 }}>{m.sender_email || 'Them'}</div>}
                      {m.content}
                      <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.6, textAlign: 'right' }}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
              <input
                className="form-input"
                style={{ flex: 1, margin: 0 }}
                placeholder="Type a message…"
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              />
              <button className="btn btn-green" style={{ padding: '0 16px' }} onClick={sendMessage}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Review Modal ── */}
      {reviewModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setReviewModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Leave a Review</div>
              <button className="modal-close" onClick={() => setReviewModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div className="stars">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`star ${n <= rating ? 'filled' : ''}`} onClick={() => setRating(n)} />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Your Review</label>
                <textarea className="form-input form-textarea" rows={4} placeholder="Share your experience working on this project…" value={comment} onChange={e => setComment(e.target.value)} required />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-gray" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn btn-green" onClick={handleReview}><Star size={16} /> Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROFILE PAGE
═══════════════════════════════════════════════════════════ */
function ProfilePage({ user, clientProfile, freelancerProfile, setClientProfile, setFreelancerProfile, triggerAlert, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localProfile, setLocalProfile] = useState(
    user?.role === 'client' ? clientProfile : freelancerProfile
  );

  const toggleSkill = (s) => {
    const skills = localProfile.skills || [];
    setLocalProfile(prev => ({
      ...prev,
      skills: skills.includes(s) ? skills.filter(x => x !== s) : [...skills, s]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (user.role === 'client') {
        await api.post('/profiles/client', localProfile);
        setClientProfile(localProfile);
      } else {
        await api.post('/profiles/freelancer', localProfile);
        setFreelancerProfile(localProfile);
      }
      setEditing(false);
      triggerAlert('success', 'Profile updated successfully!');
      onSaved?.();
    } catch (err) {
      triggerAlert('error', 'Failed to save profile.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your professional profile and settings</p>
        </div>
        {!editing && <button className="btn btn-outline" onClick={() => setEditing(true)}><Edit3 size={16} /> Edit Profile</button>}
      </div>

      <div className="card card-padding" style={{ maxWidth: '680px' }}>
        {/* Avatar header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--navy-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', color: '#fff' }}>
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '18px' }}>{user?.email}</div>
            <span className={`badge ${user?.role === 'client' ? 'badge-blue' : 'badge-green'}`} style={{ marginTop: '6px', textTransform: 'capitalize' }}>
              {user?.role}
            </span>
          </div>
        </div>

        {!editing ? (
          <div>
            {user?.role === 'client' ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                {[
                  { label: 'Company Name', value: clientProfile?.company_name || '—', icon: <Building size={16} /> },
                  { label: 'Industry', value: clientProfile?.industry || '—', icon: <BarChart3 size={16} /> },
                  { label: 'Website', value: clientProfile?.website || '—', icon: <Globe size={16} /> },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: 'var(--radius)', background: 'var(--gray-50)' }}>
                    <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{f.icon}</div>
                    <div><div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>{f.label}</div><div style={{ fontWeight: '600' }}>{f.value}</div></div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: 'var(--radius)', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Professional Title</div>
                  <div style={{ fontWeight: '600' }}>{freelancerProfile?.title || '—'}</div>
                </div>
                <div style={{ padding: '12px', borderRadius: 'var(--radius)', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Bio</div>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>{freelancerProfile?.bio || '—'}</div>
                </div>
                <div style={{ padding: '12px', borderRadius: 'var(--radius)', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Hourly Rate</div>
                  <div style={{ fontWeight: '800', fontSize: '20px', color: 'var(--green-600)' }}>${freelancerProfile?.hourly_rate}/hr</div>
                </div>
                {freelancerProfile?.skills?.length > 0 && (
                  <div style={{ padding: '12px', borderRadius: 'var(--radius)', background: 'var(--gray-50)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Skills</div>
                    <div className="skills-wrap">
                      {freelancerProfile.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSave}>
            {user?.role === 'client' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input className="form-input" value={localProfile?.company_name || ''} onChange={e => setLocalProfile({ ...localProfile, company_name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <input className="form-input" value={localProfile?.industry || ''} onChange={e => setLocalProfile({ ...localProfile, industry: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input className="form-input" type="url" value={localProfile?.website || ''} onChange={e => setLocalProfile({ ...localProfile, website: e.target.value })} />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Professional Title *</label>
                  <input className="form-input" placeholder="e.g. Full-Stack Developer" value={localProfile?.title || ''} onChange={e => setLocalProfile({ ...localProfile, title: e.target.value })} required minLength={1} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio *</label>
                  <textarea className="form-input form-textarea" rows={4} placeholder="Describe your expertise, experience, and what makes you stand out…" value={localProfile?.bio || ''} onChange={e => setLocalProfile({ ...localProfile, bio: e.target.value })} required minLength={1} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hourly Rate (USD) *</label>
                  <input className="form-input" type="number" min={1} value={localProfile?.hourly_rate || 50} onChange={e => setLocalProfile({ ...localProfile, hourly_rate: parseFloat(e.target.value) })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Skills</label>
                  <div className="skills-wrap">
                    {SKILLS.map(s => (
                      <span key={s} className={`skill-tag skill-tag-selectable ${(localProfile?.skills || []).includes(s) ? 'selected' : ''}`} onClick={() => toggleSkill(s)}>{s}</span>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-green" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save Profile'}</button>
              <button className="btn btn-outline-gray" type="button" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MY JOBS (Client)
═══════════════════════════════════════════════════════════ */
function MyJobs({ jobs }) {
  const statusColor = { draft: 'gray', open: 'blue', in_progress: 'navy', completed: 'green', cancelled: 'red' };
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Projects</h1>
        <p className="page-subtitle">All projects you have posted</p>
      </div>
      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No projects yet</div>
          <div className="empty-state-desc">Post your first project to start receiving proposals.</div>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr><th>Project</th><th>Budget</th><th>Status</th><th>Skills</th></tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id}>
                  <td style={{ fontWeight: '600' }}>{j.title}</td>
                  <td style={{ fontWeight: '700', color: 'var(--green-600)' }}>${parseFloat(j.budget).toLocaleString()}</td>
                  <td><span className={`badge badge-${statusColor[j.status] || 'gray'}`}>{j.status.replace('_', ' ')}</span></td>
                  <td><div className="skills-wrap">{(j.skills || []).slice(0, 3).map(s => <span key={s.name} className="skill-tag">{s.name}</span>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROPOSALS VIEW (Freelancer)
═══════════════════════════════════════════════════════════ */
function ProposalsView({ proposals }) {
  const statusColor = { pending: 'navy', accepted: 'green', rejected: 'red' };
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Proposals</h1>
        <p className="page-subtitle">Track all your submitted proposals</p>
      </div>
      {proposals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-title">No proposals yet</div>
          <div className="empty-state-desc">Start browsing projects and submit your first proposal.</div>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr><th>Project</th><th>Your Rate</th><th>Status</th></tr>
            </thead>
            <tbody>
              {proposals.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{p.job_title || 'Project'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.cover_letter?.slice(0, 70)}…</div>
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--green-600)' }}>${p.rate}/hr</td>
                  <td><span className={`badge badge-${statusColor[p.status] || 'gray'}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage]   = useState('landing'); // landing | auth | app
  const [authConfig, setAuthConfig] = useState({ tab: 'login', role: 'client' });
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [user, setUser]   = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alert, setAlert] = useState(null);

  // Data
  const [clientProfile, setClientProfile] = useState({});
  const [freelancerProfile, setFreelancerProfile] = useState({ title: '', bio: '', hourly_rate: 50, skills: [] });
  const [myJobs, setMyJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [jobProposals, setJobProposals] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Auth change listener
  useEffect(() => {
    const handler = () => {
      const t = localStorage.getItem('access_token');
      setToken(t);
      if (!t) { setUser(null); setPage('landing'); }
    };
    window.addEventListener('auth_change', handler);
    return () => window.removeEventListener('auth_change', handler);
  }, []);

  // Fetch user on token change
  const fetchMe = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('user_role', res.data.role);
      setPage('app');
      fetchProfile(res.data);
    } catch { clearAuth(); }
  }, [token]);

  useEffect(() => { if (token) fetchMe(); }, [token, fetchMe]);

  const fetchProfile = async (u) => {
    try {
      if (u.role === 'client') {
        const r = await api.get('/profiles/client/me');
        if (r.data) setClientProfile(r.data);
      } else if (u.role === 'freelancer') {
        const r = await api.get('/profiles/freelancer/me');
        if (r.data) {
          setFreelancerProfile({ title: r.data.title, bio: r.data.bio, hourly_rate: parseFloat(r.data.hourly_rate), skills: r.data.skills.map(s => s.name) });
        }
      }
    } catch {}
  };

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      if (user.role === 'client') {
        const [rj, rc] = await Promise.all([api.get('/jobs'), api.get('/contracts/me')]);
        setMyJobs(rj.data);
        setContracts(rc.data);
        const openJobs = rj.data.filter(j => j.status === 'open');
        const pMap = {};
        await Promise.all(openJobs.map(async j => {
          try { const r = await api.get(`/proposals/job/${j.id}`); pMap[j.id] = r.data; } catch {}
        }));
        setJobProposals(pMap);
      } else if (user.role === 'freelancer') {
        const [rp, rc] = await Promise.all([api.get('/proposals/me'), api.get('/contracts/me')]);
        setProposals(rp.data);
        setContracts(rc.data);
      }
    } catch {}
  }, [user]);

  useEffect(() => { if (user) fetchDashboardData(); }, [user, activeTab]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try { const r = await api.get('/notifications'); setNotifications(r.data); } catch {}
  }, [token]);

  useEffect(() => {
    if (token) { fetchNotifications(); const iv = setInterval(fetchNotifications, 15000); return () => clearInterval(iv); }
  }, [token, fetchNotifications]);

  const handleAuthSuccess = (accessToken) => {
    setToken(accessToken);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    const rt = localStorage.getItem('refresh_token');
    if (rt) { try { await api.post('/auth/logout', { refresh_token: rt }); } catch {} }
    clearAuth();
    triggerAlert('success', 'Signed out successfully.');
  };

  const handleComplete = async (contractId) => {
    try {
      await api.post(`/contracts/${contractId}/complete`);
      triggerAlert('success', 'Contract marked as complete!');
      fetchDashboardData();
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to complete contract.');
    }
  };

  const handleHire = async (proposalId) => {
    try {
      await api.post('/contracts', { proposal_id: proposalId });
      triggerAlert('success', 'Freelancer hired! Contract is now active.');
      fetchDashboardData();
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to create contract.');
    }
  };

  /* ── Render ── */

  // Landing page
  if (page === 'landing') {
    return (
      <>
        <Toast alert={alert} />
        <nav className="navbar">
          <div className="navbar-logo">
            <div className="navbar-logo-icon"><Briefcase size={20} color="#fff" /></div>
            <span className="navbar-logo-text">EliteMatch</span>
          </div>
          <div className="navbar-spacer" />
          <div className="navbar-links">
            <button className="navbar-link" onClick={() => { setAuthConfig({ tab: 'login', role: 'client' }); setPage('auth'); }}>Sign In</button>
            <button className="btn btn-green btn-sm" onClick={() => { setAuthConfig({ tab: 'register', role: 'client' }); setPage('auth'); }}>Get Started</button>
          </div>
        </nav>
        <LandingPage
          onHire={() => { setAuthConfig({ tab: 'register', role: 'client' }); setPage('auth'); }}
          onFindWork={() => { setAuthConfig({ tab: 'register', role: 'freelancer' }); setPage('auth'); }}
        />
      </>
    );
  }

  // Auth page
  if (page === 'auth') {
    return (
      <>
        <Toast alert={alert} />
        <AuthPage
          initialTab={authConfig.tab}
          initialRole={authConfig.role}
          onSuccess={handleAuthSuccess}
          onBack={() => setPage('landing')}
        />
      </>
    );
  }

  // Dashboard (logged in)
  const renderContent = () => {
    if (user?.role === 'client') {
      switch (activeTab) {
        case 'dashboard': return <ClientDashboard jobs={myJobs} contracts={contracts} proposals={jobProposals} onHire={handleHire} onComplete={handleComplete} onViewJob={() => {}} triggerAlert={triggerAlert} />;
        case 'messages':  return <MessagesView contracts={contracts} user={user} triggerAlert={triggerAlert} />;
        case 'post-job':  return <PostJobForm onSuccess={() => { setActiveTab('my-jobs'); fetchDashboardData(); }} triggerAlert={triggerAlert} />;
        case 'my-jobs':   return <MyJobs jobs={myJobs} />;
        case 'contracts': return <ContractsView contracts={contracts} user={user} onComplete={handleComplete} triggerAlert={triggerAlert} />;
        case 'profile':   return <ProfilePage user={user} clientProfile={clientProfile} freelancerProfile={freelancerProfile} setClientProfile={setClientProfile} setFreelancerProfile={setFreelancerProfile} triggerAlert={triggerAlert} onSaved={fetchDashboardData} />;
        default: return null;
      }
    } else {
      switch (activeTab) {
        case 'dashboard':     return <FreelancerDashboard proposals={proposals} contracts={contracts} setTab={setActiveTab} />;
        case 'messages':      return <MessagesView contracts={contracts} user={user} triggerAlert={triggerAlert} />;
        case 'find-projects': return <FindProjects triggerAlert={triggerAlert} onProposalSent={fetchDashboardData} />;
        case 'proposals':     return <ProposalsView proposals={proposals} />;
        case 'contracts':     return <ContractsView contracts={contracts} user={user} onComplete={handleComplete} triggerAlert={triggerAlert} />;
        case 'profile':       return <ProfilePage user={user} clientProfile={clientProfile} freelancerProfile={freelancerProfile} setClientProfile={setClientProfile} setFreelancerProfile={setFreelancerProfile} triggerAlert={triggerAlert} onSaved={() => fetchProfile(user)} />;
        default: return null;
      }
    }
  };

  return (
    <>
      <Toast alert={alert} />
      <Navbar
        user={user}
        notifications={notifications}
        onNotifClick={() => setShowNotif(v => !v)}
        showNotif={showNotif}
        onMarkAll={async () => { try { await api.post('/notifications/read-all'); fetchNotifications(); } catch {} }}
        onMarkOne={async (id) => { try { await api.post(`/notifications/${id}/read`); fetchNotifications(); } catch {} }}
        onLogoClick={() => { setPage('landing'); setToken(null); clearAuth(); }}
      />
      <div className="dashboard-layout">
        <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
        <main className="main-content" onClick={() => showNotif && setShowNotif(false)}>
          {renderContent()}
        </main>
      </div>
    </>
  );
}
