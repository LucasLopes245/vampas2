const DEFAULTS = { enabled: true, intensity: 100, backgrounds: false, disabledHosts: [], photoMode: 'classic' };
const enabled = document.getElementById('enabled');
const intensity = document.getElementById('intensity');
const intensityLabel = document.getElementById('intensityLabel');
const backgrounds = document.getElementById('backgrounds');
const photoMode = document.getElementById('photoMode');
const disableSite = document.getElementById('disableSite');
const siteLabel = document.getElementById('siteLabel');
const statusLabel = document.getElementById('status');

let hostname = null;
let disabledHosts = [];

function updateUI() {
  statusLabel.textContent = enabled.checked ? 'Ativada' : 'Desativada';
  statusLabel.style.color = enabled.checked ? '#8beba3' : '#b0bcb1';
  intensityLabel.textContent = `${intensity.value}%`;
  intensity.disabled = !enabled.checked;
  backgrounds.disabled = !enabled.checked;
  photoMode.disabled = !enabled.checked;
  disableSite.disabled = !hostname || !enabled.checked;
  if (hostname) disableSite.checked = disabledHosts.includes(hostname);
}

async function initialize() {
  const settings = await chrome.storage.local.get(DEFAULTS);
  enabled.checked = settings.enabled !== false;
  intensity.value = settings.intensity ?? 100;
  backgrounds.checked = settings.backgrounds === true;
  photoMode.value = settings.photoMode ?? 'classic';
  disabledHosts = Array.isArray(settings.disabledHosts) ? settings.disabledHosts : [];

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    try {
      const url = new URL(tab.url);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        hostname = url.hostname;
        siteLabel.textContent = hostname;
      } else {
        siteLabel.textContent = 'Indisponível nesta página';
      }
    } catch {
      siteLabel.textContent = 'Endereço indisponível';
    }
  } else {
    siteLabel.textContent = 'Abra um site para usar';
  }
  updateUI();
}

enabled.addEventListener('change', () => {
  chrome.storage.local.set({ enabled: enabled.checked });
  updateUI();
});
intensity.addEventListener('input', () => {
  intensityLabel.textContent = `${intensity.value}%`;
});
intensity.addEventListener('change', () => {
  chrome.storage.local.set({ intensity: Number(intensity.value) });
});
backgrounds.addEventListener('change', () => {
  chrome.storage.local.set({ backgrounds: backgrounds.checked });
});
photoMode.addEventListener('change', () => {
  chrome.storage.local.set({ photoMode: photoMode.value });
});
disableSite.addEventListener('change', () => {
  if (!hostname) return;
  disabledHosts = disableSite.checked
    ? [...new Set([...disabledHosts, hostname])]
    : disabledHosts.filter((site) => site !== hostname);
  chrome.storage.local.set({ disabledHosts });
});

initialize().catch((error) => {
  console.error('Não foi possível carregar as preferências:', error);
  siteLabel.textContent = 'Erro ao detectar o site';
});
