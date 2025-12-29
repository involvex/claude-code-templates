/**
 * Universal Navigation for Claude Code Dashboards
 * Handles navigation between dashboards and scope switching
 */

class UniversalNavigation {
  constructor() {
    this.currentPort = window.location.port || '80';
    this.currentScope = this.getScopeFromURL() || 'all';
    this.dashboardMap = {
      3333: 'analytics',
      3335: 'chats',
      3336: 'plugins',
      3337: 'skills',
      3338: 'hooks',
    };

    this.init();
  }

  /**
   * Initialize navigation
   */
  async init() {
    await this.loadNavigationHTML();
    this.setupEventListeners();
    this.setActiveLink();
    this.setScopeValue();
    this.checkDashboardStatus();
    document.body.classList.add('has-universal-nav');
  }

  /**
   * Load navigation HTML into the page
   */
  async loadNavigationHTML() {
    try {
      const response = await fetch('/shared/navigation.html');
      const html = await response.text();

      // Insert at the beginning of body
      const navContainer = document.createElement('div');
      navContainer.innerHTML = html;
      document.body.insertBefore(navContainer.firstElementChild, document.body.firstChild);

      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/shared/navigation.css';
      document.head.appendChild(link);
    } catch (error) {
      console.warn('Failed to load universal navigation:', error);
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Scope switcher
    const scopeSwitcher = document.getElementById('scopeSwitcher');
    if (scopeSwitcher) {
      scopeSwitcher.addEventListener('change', (e) => {
        this.handleScopeChange(e.target.value);
      });
    }

    // Mobile menu toggle
    const mobileToggle = document.querySelector('.nav-mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
      });

      // Close menu when clicking a link
      navLinks.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
          mobileToggle.classList.remove('active');
          navLinks.classList.remove('active');
        });
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!mobileToggle.contains(e.target) && !navLinks.contains(e.target)) {
          mobileToggle.classList.remove('active');
          navLinks.classList.remove('active');
        }
      });
    }

    // Intercept navigation to add scope parameter and check availability
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', async (e) => {
        // Don't navigate if offline
        if (link.classList.contains('offline')) {
          e.preventDefault();
          alert(
            'This dashboard is not currently running. Start it first with the appropriate CLI command.'
          );
          return;
        }

        // Add scope parameter if needed
        if (this.currentScope && this.currentScope !== 'all') {
          e.preventDefault();
          const url = new URL(link.href);
          url.searchParams.set('scope', this.currentScope);
          window.location.href = url.toString();
        }
      });
    });
  }

  /**
   * Set active link based on current port
   */
  setActiveLink() {
    const currentDashboard = this.dashboardMap[this.currentPort];

    document.querySelectorAll('.nav-link').forEach((link) => {
      const dashboard = link.dataset.dashboard;
      if (dashboard === currentDashboard) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * Set scope select value
   */
  setScopeValue() {
    const scopeSwitcher = document.getElementById('scopeSwitcher');
    if (scopeSwitcher) {
      scopeSwitcher.value = this.currentScope;
    }
  }

  /**
   * Get scope from URL parameters
   */
  getScopeFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('scope');
  }

  /**
   * Handle scope change
   */
  handleScopeChange(newScope) {
    this.currentScope = newScope;

    // Update URL without reload
    const url = new URL(window.location);
    if (newScope && newScope !== 'all') {
      url.searchParams.set('scope', newScope);
    } else {
      url.searchParams.delete('scope');
    }
    window.history.pushState({}, '', url);

    // Notify dashboard to reload data with new scope
    this.notifyDashboard(newScope);
  }

  /**
   * Notify dashboard of scope change
   */
  notifyDashboard(scope) {
    // Dispatch custom event that dashboards can listen to
    const event = new CustomEvent('scopeChanged', {
      detail: { scope },
    });
    window.dispatchEvent(event);

    // Also trigger a reload for simpler dashboards
    if (window.loadAllData) {
      window.loadAllData();
    }
    if (window.reloadDashboard) {
      window.reloadDashboard();
    }
    if (window.fetchData) {
      window.fetchData();
    }
  }

  /**
   * Check status of other dashboards
   */
  async checkDashboardStatus() {
    const ports = ['3333', '3335', '3336', '3337', '3338'];

    for (const port of ports) {
      if (port === this.currentPort) continue;

      const link = document.querySelector(`[data-dashboard="${this.dashboardMap[port]}"]`);
      if (!link) continue;

      try {
        // Try to fetch from the dashboard
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(`http://localhost:${port}/`, {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // If we get a response, mark as online
        if (response.ok || response.status === 404 || response.status === 200) {
          link.classList.remove('offline');
          link.title = link.title.replace(' (Offline)', '');
        } else {
          throw new Error('Server not responding');
        }
      } catch (error) {
        // Mark as offline
        link.classList.add('offline');
        if (!link.title.includes('(Offline)')) {
          link.title = `${link.title} (Offline)`;
        }
      }
    }
  }

  /**
   * Get current scope
   */
  getCurrentScope() {
    return this.currentScope;
  }

  /**
   * Update scope programmatically
   */
  updateScope(scope) {
    const scopeSwitcher = document.getElementById('scopeSwitcher');
    if (scopeSwitcher) {
      scopeSwitcher.value = scope;
      this.handleScopeChange(scope);
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.universalNav = new UniversalNavigation();
  });
} else {
  window.universalNav = new UniversalNavigation();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UniversalNavigation;
}
