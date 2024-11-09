// Debug utilities for PaperPilot extension
export const DEBUG = {
  enabled: true,
  logLevel: 'debug' as const,
  
  log: (message: string, data?: unknown) => {
    if (!DEBUG.enabled) return;
    console.log(`[PaperPilot] ${message}`, data || '');
  },

  error: (message: string, error?: unknown) => {
    if (!DEBUG.enabled) return;
    console.error(`[PaperPilot Error] ${message}`, error || '');
  },

  trace: (message: string) => {
    if (!DEBUG.enabled) return;
    console.trace(`[PaperPilot Trace] ${message}`);
  }
};

// Inject debug panel into page
export function injectDebugPanel() {
  if (!DEBUG.enabled) return;

  const panel = document.createElement('div');
  panel.id = 'paperpilot-debug';
  panel.style.cssText = `
    position: fixed;
    bottom: 0;
    right: 0;
    width: 300px;
    height: auto;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px;
    font-family: monospace;
    font-size: 12px;
    z-index: 10000;
    overflow: auto;
    max-height: 50vh;
  `;

  document.body.appendChild(panel);
  return panel;
} 