(() => {
  'use strict';

  // Links originais recuperados em novembro/2026 e salvos localmente.
  const CLASSIC_PHOTOS = [
    'images/original-01-muvuca.jpg',
    'images/original-03-sorvete.jpg',
    'images/original-04-g-magazine.jpg',
    'images/original-05-entrevista.jpeg',
    'images/original-08-blogspot.jpg',
    'images/original-09-dupla.jpg'
  ].map((path) => chrome.runtime.getURL(path));
  const LICENSED_PHOTOS = [
    'images/vampeta-2005.jpg',
    'images/vampeta-2010.jpg',
    'images/vampeta-2012-evento.jpg',
    'images/vampeta-2012-retrato.jpg'
  ].map((path) => chrome.runtime.getURL(path));

  const DEFAULTS = { enabled: true, intensity: 100, backgrounds: false, disabledHosts: [], photoMode: 'classic' };
  let config = { ...DEFAULTS };
  let decisions = new WeakMap();
  const replacedImages = new Map();
  const replacedBackgrounds = new Map();
  const pendingNodes = new Set();
  let scanScheduled = false;

  const isActive = () => config.enabled && !config.disabledHosts.includes(location.hostname);
  const randomPhoto = () => {
    const photos = config.photoMode === 'licensed' ? LICENSED_PHOTOS :
      config.photoMode === 'mixed' ? [...CLASSIC_PHOTOS, ...LICENSED_PHOTOS] : CLASSIC_PHOTOS;
    return photos[Math.floor(Math.random() * photos.length)];
  };
  const pick = () => Math.random() * 100 < config.intensity;

  function rememberAttribute(element, name) {
    return element.getAttribute(name);
  }

  function restoreAttribute(element, name, value) {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }

  function ensureImage(element) {
    if (!(element instanceof HTMLImageElement)) return;
    const existing = replacedImages.get(element);
    if (existing) {
      // React, feeds infinitos e scripts podem redefinir src/srcset.
      const currentSrc = element.getAttribute('src');
      if (currentSrc !== existing.photo) {
        existing.src = currentSrc;
        element.setAttribute('src', existing.photo);
      }
      if (element.hasAttribute('srcset')) {
        existing.srcset = rememberAttribute(element, 'srcset');
        element.removeAttribute('srcset');
      }
      if (element.hasAttribute('sizes')) {
        existing.sizes = rememberAttribute(element, 'sizes');
        element.removeAttribute('sizes');
      }
      for (const source of existing.sources) {
        if (source.element.hasAttribute('srcset')) {
          source.srcset = rememberAttribute(source.element, 'srcset');
          source.element.removeAttribute('srcset');
        }
      }
      return;
    }

    if (decisions.has(element)) return;
    if (!element.hasAttribute('src') && !element.hasAttribute('srcset')) return;
    decisions.set(element, pick());
    if (!decisions.get(element)) return;

    const picture = element.parentElement?.tagName === 'PICTURE' ? element.parentElement : null;
    const sources = picture
      ? [...picture.querySelectorAll('source')].map((source) => ({
          element: source,
          srcset: rememberAttribute(source, 'srcset')
        }))
      : [];
    const state = {
      src: rememberAttribute(element, 'src'),
      srcset: rememberAttribute(element, 'srcset'),
      sizes: rememberAttribute(element, 'sizes'),
      sources,
      photo: randomPhoto()
    };

    replacedImages.set(element, state);
    for (const source of sources) source.element.removeAttribute('srcset');
    element.removeAttribute('srcset');
    element.removeAttribute('sizes');
    element.setAttribute('src', state.photo);
  }

  function ensureBackground(element) {
    if (!config.backgrounds || !(element instanceof HTMLElement)) return;
    // CSS de fundo é opcional por envolver mais elementos do DOM.
    if (element === document.documentElement) return;
    const existing = replacedBackgrounds.get(element);
    if (existing) return;
    if (decisions.has(element)) return;
    const computed = getComputedStyle(element).backgroundImage;
    if (!computed || computed === 'none' || !computed.includes('url(')) return;
    decisions.set(element, pick());
    if (!decisions.get(element)) return;

    replacedBackgrounds.set(element, {
      value: element.style.getPropertyValue('background-image'),
      priority: element.style.getPropertyPriority('background-image')
    });
    element.style.setProperty('background-image', `url("${randomPhoto()}")`, 'important');
  }

  function visit(root) {
    if (!isActive() || !root) return;
    if (root instanceof HTMLImageElement) ensureImage(root);
    if (root.querySelectorAll) {
      for (const image of root.querySelectorAll('img')) ensureImage(image);
    }
    if (config.backgrounds) {
      if (root instanceof HTMLElement) ensureBackground(root);
      if (root.querySelectorAll) {
        for (const element of root.querySelectorAll('*')) ensureBackground(element);
      }
    }
  }

  function queueVisit(root) {
    if (!isActive()) return;
    pendingNodes.add(root);
    if (scanScheduled) return;
    scanScheduled = true;
    setTimeout(() => {
      scanScheduled = false;
      const nodes = [...pendingNodes];
      pendingNodes.clear();
      for (const node of nodes) visit(node);
    }, 50);
  }

  function restoreAll() {
    pendingNodes.clear();
    for (const [element, original] of replacedImages) {
      restoreAttribute(element, 'src', original.src);
      restoreAttribute(element, 'srcset', original.srcset);
      restoreAttribute(element, 'sizes', original.sizes);
      for (const source of original.sources) {
        restoreAttribute(source.element, 'srcset', source.srcset);
      }
    }
    replacedImages.clear();
    for (const [element, original] of replacedBackgrounds) {
      if (original.value) element.style.setProperty('background-image', original.value, original.priority);
      else element.style.removeProperty('background-image');
    }
    replacedBackgrounds.clear();
    decisions = new WeakMap();
  }

  function applyConfig(next) {
    const previous = config;
    config = {
      enabled: next.enabled !== false,
      intensity: Math.max(0, Math.min(100, Number(next.intensity) || 0)),
      backgrounds: next.backgrounds === true,
      disabledHosts: Array.isArray(next.disabledHosts) ? next.disabledHosts : [],
      photoMode: ['classic', 'licensed', 'mixed'].includes(next.photoMode) ? next.photoMode : 'classic'
    };
    // Reavaliar fotos e restaurar o original ao desligar ou mudar intensidade.
    const changed = previous.enabled !== config.enabled ||
      previous.intensity !== config.intensity ||
      previous.backgrounds !== config.backgrounds ||
      previous.photoMode !== config.photoMode ||
      previous.disabledHosts.includes(location.hostname) !== config.disabledHosts.includes(location.hostname);
    if (changed) restoreAll();
    if (isActive()) queueVisit(document.documentElement);
  }

  const observer = new MutationObserver((mutations) => {
    if (!isActive()) return;
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) queueVisit(node);
        }
      } else if (mutation.target instanceof HTMLImageElement) {
        queueVisit(mutation.target);
      } else if (mutation.target instanceof HTMLSourceElement && mutation.target.parentElement?.tagName === 'PICTURE') {
        queueVisit(mutation.target.parentElement.querySelector('img'));
      } else if (config.backgrounds && mutation.target instanceof HTMLElement) {
        queueVisit(mutation.target);
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['src', 'srcset', 'sizes', 'style', 'class']
  });

  chrome.storage.local.get(DEFAULTS, applyConfig);
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    const next = { ...config };
    for (const [key, change] of Object.entries(changes)) {
      if (key in DEFAULTS) next[key] = change.newValue ?? DEFAULTS[key];
    }
    applyConfig(next);
  });
})();
