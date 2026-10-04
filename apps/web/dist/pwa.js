import { useEffect, useState } from 'react';
function detect() {
    if (typeof window === 'undefined') {
        return { manifest: false, installed: false, offlineReady: false };
    }
    const manifest = document.querySelector('link[rel="manifest"]') !== null;
    const installed = window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        navigator.standalone === true;
    const offlineReady = 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
    return { manifest, installed, offlineReady };
}
export function usePwaCapability() {
    const [capability, setCapability] = useState({
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
            if (active)
                setCapability(detect());
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
export function describePwaCapability(capability) {
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
//# sourceMappingURL=pwa.js.map