import { useEffect, useState } from 'react';

export type PwaCapability = {
  manifest: boolean;
  installed: boolean;
  offlineReady: boolean;
};

function detect(): PwaCapability {
  if (typeof window === 'undefined') {
    return { manifest: false, installed: false, offlineReady: false };
  }

  const manifest = document.querySelector('link[rel="manifest"]') !== null;

  const installed =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  const offlineReady = 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;

  return { manifest, installed, offlineReady };
}

export function usePwaCapability(): PwaCapability {
  const [capability, setCapability] = useState<PwaCapability>({
    manifest: false,
    installed: false,
    offlineReady: false,
  });

  useEffect(() => {
    setCapability(detect());

    if (!('serviceWorker' in navigator)) {
      return;
    }

    let active = true;
    const update = () => {
      if (active) setCapability(detect());
    };

    navigator.serviceWorker.addEventListener('controllerchange', update);
    navigator.serviceWorker.ready.then(update).catch(update);

    return () => {
      active = false;
      navigator.serviceWorker.removeEventListener('controllerchange', update);
    };
  }, []);

  return capability;
}

export function describePwaCapability(capability: PwaCapability): {
  label: string;
  tone: 'active' | 'pending' | 'unavailable';
  detail: string;
} {
  if (capability.installed && capability.offlineReady) {
    return {
      label: 'Installed',
      tone: 'active',
      detail: 'Running as an installed app with offline support',
    };
  }
  if (capability.installed) {
    return { label: 'Installed', tone: 'active', detail: 'Running as an installed app' };
  }
  if (capability.manifest) {
    return {
      label: 'Installable',
      tone: 'pending',
      detail: 'This app can be installed, but offline support is not enabled',
    };
  }
  return {
    label: 'Not installable',
    tone: 'unavailable',
    detail: 'No web app manifest is declared',
  };
}
