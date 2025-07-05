// Advanced security protection against DevTools and console access
export class SecurityProtection {
  private static instance: SecurityProtection;
  private devToolsOpen = false;
  private consoleBlocked = false;
  private intervalId: number | null = null;

  private constructor() {
    this.initProtection();
  }

  public static getInstance(): SecurityProtection {
    if (!SecurityProtection.instance) {
      SecurityProtection.instance = new SecurityProtection();
    }
    return SecurityProtection.instance;
  }

  private initProtection() {
    // DevTools detection
    this.detectDevTools();
    
    // Console blocking
    this.blockConsole();
    
    // Context menu blocking
    this.blockContextMenu();
    
    // Key combination blocking
    this.blockKeyboardShortcuts();
    
    // Console warning
    this.addConsoleWarning();
    
    // Anti-debug techniques
    this.antiDebug();
  }

  private detectDevTools() {
    const threshold = 160;
    
    this.intervalId = window.setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!this.devToolsOpen) {
          this.devToolsOpen = true;
          this.onDevToolsOpen();
        }
      } else {
        this.devToolsOpen = false;
      }
    }, 100); // Daha sık kontrol

    // Console open detection
    let devtools = false;
    Object.defineProperty(console, '_commandLineAPI', {
      get: () => {
        devtools = true;
        this.onDevToolsOpen();
        return {};
      }
    });

    // Screen size monitoring
    let startTime = Date.now();
    setInterval(() => {
      if (Date.now() - startTime > 500) {
        if (window.outerHeight - window.innerHeight > threshold ||
            window.outerWidth - window.innerWidth > threshold) {
          this.onDevToolsOpen();
        }
      }
    }, 100);

    // Firebug detection
    if (window.console && (window.console as any).firebug) {
      this.onDevToolsOpen();
    }

    // Chrome devtools detection via timing
    setInterval(() => {
      const before = Date.now();
      debugger;
      const after = Date.now();
      if (after - before > 100) {
        this.onDevToolsOpen();
      }
    }, 1000);
  }

  private onDevToolsOpen() {
    // Redirect to login page
    window.location.href = '/admin/login';
    
    // Clear all data
    sessionStorage.clear();
    localStorage.clear();
    
    // Show alert
    alert('Güvenlik ihlali tespit edildi. Oturum sonlandırılıyor.');
  }

  private blockConsole() {
    if (this.consoleBlocked) return;
    
    // Complete console hijacking
    const fakeConsole = {
      log: () => this.showSecurityWarning(),
      error: () => this.showSecurityWarning(),
      warn: () => this.showSecurityWarning(),
      info: () => this.showSecurityWarning(),
      debug: () => this.showSecurityWarning(),
      trace: () => this.showSecurityWarning(),
      dir: () => this.showSecurityWarning(),
      dirxml: () => this.showSecurityWarning(),
      table: () => this.showSecurityWarning(),
      group: () => this.showSecurityWarning(),
      groupEnd: () => this.showSecurityWarning(),
      time: () => this.showSecurityWarning(),
      timeEnd: () => this.showSecurityWarning(),
      clear: () => this.showSecurityWarning(),
      count: () => this.showSecurityWarning(),
      assert: () => this.showSecurityWarning(),
      profile: () => this.showSecurityWarning(),
      profileEnd: () => this.showSecurityWarning()
    };
    
    // Replace console object completely
    Object.defineProperty(window, 'console', {
      get: () => fakeConsole,
      set: () => this.showSecurityWarning()
    });
    
    // Block dangerous functions
    (window as any).eval = () => {
      this.onDevToolsOpen();
      throw new Error('eval() blocked for security');
    };
    
    (window as any).Function = () => {
      this.onDevToolsOpen();
      throw new Error('Function constructor blocked');
    };
    
    // Block setTimeout/setInterval with strings
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    
    window.setTimeout = (handler: any, timeout?: number, ...args: any[]) => {
      if (typeof handler === 'string') {
        this.onDevToolsOpen();
        throw new Error('String-based setTimeout blocked');
      }
      return originalSetTimeout(handler, timeout, ...args);
    };
    
    window.setInterval = (handler: any, timeout?: number, ...args: any[]) => {
      if (typeof handler === 'string') {
        this.onDevToolsOpen();
        throw new Error('String-based setInterval blocked');
      }
      return originalSetInterval(handler, timeout, ...args);
    };
    
    this.consoleBlocked = true;
  }
  
  private showSecurityWarning() {
    alert('🚨 GÜVENLİK UYARISI: Yetkisiz konsol erişimi tespit edildi!');
    this.onDevToolsOpen();
  }

  private blockContextMenu() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  }

  private blockKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (e.keyCode === 123 || // F12
          (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
          (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
          (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
          (e.ctrlKey && e.shiftKey && e.keyCode === 67) || // Ctrl+Shift+C
          (e.ctrlKey && e.shiftKey && e.keyCode === 75)) { // Ctrl+Shift+K
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });
  }

  private addConsoleWarning() {
    // CSS styling for console warning
    const style = `
      color: #ff0000;
      font-size: 50px;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    `;
    
    try {
      console.log('%c⚠️ DUR!', style);
      console.log('%cBu bir güvenlik özelliğidir. Yetkisiz erişim girişimleri kayıt altına alınır.', 'color: #ff0000; font-size: 16px; font-weight: bold;');
      console.log('%cBu konsolu kullanarak sisteme zarar vermeye çalışmayın.', 'color: #ff0000; font-size: 16px;');
    } catch (e) {
      // Console is blocked
    }
  }

  private antiDebug() {
    // Debugger statement in infinite loop
    setInterval(() => {
      try {
        debugger;
      } catch (e) {
        // Debugger blocked
      }
    }, 100);

    // Block document manipulation
    const originalQuerySelector = document.querySelector;
    const originalQuerySelectorAll = document.querySelectorAll;
    const originalGetElementById = document.getElementById;
    
    document.querySelector = function(selector: string) {
      if (selector.includes('admin') || selector.includes('password') || selector.includes('token')) {
        console.log('🚫 Suspicious DOM query blocked:', selector);
        return null;
      }
      return originalQuerySelector.call(this, selector);
    };
    
    document.querySelectorAll = function(selector: string) {
      if (selector.includes('admin') || selector.includes('password') || selector.includes('token')) {
        console.log('🚫 Suspicious DOM query blocked:', selector);
        return [] as any;
      }
      return originalQuerySelectorAll.call(this, selector);
    };
    
    // Block localStorage/sessionStorage access via console
    Object.defineProperty(window, 'localStorage', {
      get: () => {
        this.showSecurityWarning();
        return {};
      }
    });
    
    Object.defineProperty(window, 'sessionStorage', {
      get: () => {
        this.showSecurityWarning();
        return {};
      }
    });

    // Block inspect element programmatically
    document.addEventListener('selectstart', (e) => {
      if (e.target && (e.target as Element).tagName === 'INPUT') return;
      e.preventDefault();
    });
    
    // Block text selection on admin elements
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });

    // Monitor for script injection attempts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as Element;
            if (element.tagName === 'SCRIPT' || element.tagName === 'IFRAME') {
              console.log('🚫 Script injection attempt blocked');
              element.remove();
              this.onDevToolsOpen();
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  public destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// Initialize security protection
export const initSecurity = () => {
  if (window.location.pathname.startsWith('/admin')) {
    SecurityProtection.getInstance();
  }
};