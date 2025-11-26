(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  
  const SCRIPT_TAG = document.currentScript;
  const PRODUCT_ID = SCRIPT_TAG.getAttribute('data-product');
  const API_BASE = 'https://aureo.page/version-test/api/1.1/wf';
  const CHECKOUT_BASE = 'https://aureo.page/version-test/checkout';
  
  let widgetConfig = null;
  let widgetShown = false;
  let sessionId = null;

  // ============================================
  // SESSION MANAGEMENT
  // ============================================
  
  function getSessionId() {
    if (sessionId) return sessionId;
    
    sessionId = sessionStorage.getItem('floatypay_session');
    
    if (!sessionId) {
      sessionId = 'fp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('floatypay_session', sessionId);
    }
    
    return sessionId;
  }

  // ============================================
  // CHECK IF WIDGET SHOULD SHOW
  // ============================================
  
  function shouldShowWidget() {
    const lastSeen = localStorage.getItem(`floatypay_seen_${PRODUCT_ID}`);
    if (lastSeen && Date.now() - lastSeen < 86400000) {
      return false;
    }
    
    const closedThisSession = sessionStorage.getItem(`floatypay_closed_${PRODUCT_ID}`);
    if (closedThisSession) {
      return false;
    }
    
    return true;
  }

  // ============================================
  // FETCH WIDGET CONFIG
  // ============================================
  
  async function fetchWidgetConfig() {
    try {
      const response = await fetch(`${API_BASE}/get-widget-config?product_id=${PRODUCT_ID}`);
      const data = await response.json();
      
      if (data.response && data.response.success === 'yes') {
        if (data.response.image && data.response.image.startsWith('//')) {
          data.response.image = 'https:' + data.response.image;
        }
        return data.response;
      } else {
        console.error('FloatyPay: Invalid product ID');
        return null;
      }
    } catch (error) {
      console.error('FloatyPay: Failed to fetch config', error);
      return null;
    }
  }

  // ============================================
  // TRACK EVENTS
  // ============================================
  
  async function trackEvent(eventType) {
    try {
      await fetch(`${API_BASE}/track-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: PRODUCT_ID,
          event_type: eventType,
          session_id: getSessionId(),
          timestamp: Date.now(),
          page_url: window.location.href,
          user_agent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('FloatyPay: Failed to track event', error);
    }
  }

  // ============================================
  // INJECT CSS
  // ============================================
  
  function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .floatypay-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 999999;
        align-items: center;
        justify-content: center;
        animation: floatypay-fadeIn 0.3s ease;
      }
      
      .floatypay-overlay.visible {
        display: flex;
      }
      
      .floatypay-popup {
        background: white;
        border-radius: 16px;
        padding: 32px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: floatypay-slideUp 0.3s ease;
        text-align: center;
      }
      
      .floatypay-overlay.bottom-right {
        align-items: flex-end;
        justify-content: flex-end;
        padding: 20px;
        background: transparent;
      }
      
      .floatypay-overlay.bottom-right .floatypay-popup {
        max-width: 320px;
        animation: floatypay-slideInRight 0.3s ease;
      }
      
      .floatypay-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: transparent;
        border: none;
        font-size: 28px;
        line-height: 1;
        cursor: pointer;
        color: #999;
        transition: color 0.2s;
        padding: 0;
        width: 32px;
        height: 32px;
      }
      
      .floatypay-close:hover {
        color: #333;
      }
      
      .floatypay-image {
        width: 100%;
        max-width: 200px;
        height: auto;
        border-radius: 12px;
        margin-bottom: 20px;
      }
      
      .floatypay-title {
        font-size: 24px;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0 0 12px 0;
        line-height: 1.3;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      
      .floatypay-price {
        font-size: 32px;
        font-weight: 800;
        color: #3B82F6;
        margin: 0 0 24px 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      
      .floatypay-cta {
        background: #3B82F6;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 16px 32px;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        transition: all 0.2s;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      
      .floatypay-cta:hover {
        background: #2563EB;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
      }
      
      @keyframes floatypay-fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes floatypay-slideUp {
        from { 
          opacity: 0;
          transform: translateY(30px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes floatypay-slideInRight {
        from { 
          opacity: 0;
          transform: translateX(30px);
        }
        to { 
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @media (max-width: 480px) {
        .floatypay-popup {
          padding: 24px;
          max-width: 90%;
        }
        
        .floatypay-title {
          font-size: 20px;
        }
        
        .floatypay-price {
          font-size: 28px;
        }
        
        .floatypay-cta {
          font-size: 16px;
          padding: 14px 28px;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  // ============================================
  // CREATE POPUP HTML
  // ============================================
  
  function createPopup(config) {
    const overlay = document.createElement('div');
    overlay.className = 'floatypay-overlay';
    overlay.id = 'floatypay-widget';
    
    if (config.position === 'bottom-right') {
      overlay.classList.add('bottom-right');
    }
    
    overlay.innerHTML = `
      <div class="floatypay-popup">
        <button class="floatypay-close" aria-label="Close">×</button>
        <img src="${config.image}" alt="${config.title}" class="floatypay-image">
        <h3 class="floatypay-title">${config.title}</h3>
        <p class="floatypay-price">€${config.price}</p>
        <button class="floatypay-cta">Get Now</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    setupEventListeners(overlay, config);
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  
  function setupEventListeners(overlay, config) {
    overlay.querySelector('.floatypay-close').addEventListener('click', () => {
      hidePopup();
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        hidePopup();
      }
    });
    
    overlay.querySelector('.floatypay-cta').addEventListener('click', () => {
      trackEvent('click');
      const checkoutUrl = `${CHECKOUT_BASE}/${PRODUCT_ID}?session=${getSessionId()}`;
      window.location.href = checkoutUrl;
    });
  }

  // ============================================
  // SHOW/HIDE POPUP
  // ============================================
  
  function showPopup() {
    if (widgetShown) return;
    if (!shouldShowWidget()) return;
    
    const overlay = document.getElementById('floatypay-widget');
    if (!overlay) return;
    
    overlay.classList.add('visible');
    widgetShown = true;
    
    trackEvent('impression');
    localStorage.setItem(`floatypay_seen_${PRODUCT_ID}`, Date.now());
  }
  
  function hidePopup() {
    const overlay = document.getElementById('floatypay-widget');
    if (!overlay) return;
    
    overlay.classList.remove('visible');
    sessionStorage.setItem(`floatypay_closed_${PRODUCT_ID}`, 'true');
  }

  // ============================================
  // TRIGGERS
  // ============================================
  
  function setupTriggers(config) {
    switch(config.trigger_type) {
      case 'scroll':
        setupScrollTrigger(config.trigger_value);
        break;
      case 'time':
        setupTimeTrigger(config.trigger_value);
        break;
      case 'exit':
        setupExitTrigger();
        break;
      default:
        setupTimeTrigger(5);
    }
  }
  
  function setupScrollTrigger(percentage) {
    let triggered = false;
    window.addEventListener('scroll', () => {
      if (triggered) return;
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= percentage) {
        showPopup();
        triggered = true;
      }
    });
  }
  
  function setupTimeTrigger(seconds) {
    setTimeout(() => {
      showPopup();
    }, seconds * 1000);
  }
  
  function setupExitTrigger() {
    let triggered = false;
    document.addEventListener('mouseleave', (e) => {
      if (triggered) return;
      if (e.clientY > 10) return;
      showPopup();
      triggered = true;
    });
  }

  // ============================================
  // INIT
  // ============================================
  
  async function init() {
    if (!PRODUCT_ID) {
      console.error('FloatyPay: Missing data-product attribute');
      return;
    }
    
    widgetConfig = await fetchWidgetConfig();
    if (!widgetConfig) return;
    
    injectCSS();
    createPopup(widgetConfig);
    setupTriggers(widgetConfig);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
