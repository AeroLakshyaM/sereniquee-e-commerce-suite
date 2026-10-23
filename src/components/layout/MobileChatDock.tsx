import { useEffect } from 'react';

type SavedPosition = { left: number; top: number };
const POSITION_KEY = 'sereniquee-mobile-chat-position';

function readPosition(): SavedPosition | null {
  try {
    const value = localStorage.getItem(POSITION_KEY);
    if (!value) return null;
    const position = JSON.parse(value) as SavedPosition;
    return Number.isFinite(position.left) && Number.isFinite(position.top) ? position : null;
  } catch {
    return null;
  }
}

function findToggle(): HTMLElement | null {
  const host = document.querySelector('#n8n-chat');
  return host?.querySelector<HTMLElement>('.chat-window-toggle')
    ?? host?.shadowRoot?.querySelector<HTMLElement>('.chat-window-toggle')
    ?? document.querySelector<HTMLElement>('.chat-window-toggle');
}

export function MobileChatDock() {
  useEffect(() => {
    document.body.classList.add('mobile-store-mode');
    let attached: HTMLElement | null = null;
    let moved = false;
    let pointerStart: { x: number; y: number; left: number; top: number; pointerId: number } | null = null;

    const applyPosition = (element: HTMLElement, position: SavedPosition) => {
      const maxLeft = Math.max(8, window.innerWidth - element.offsetWidth - 8);
      const maxTop = Math.max(8, window.innerHeight - element.offsetHeight - 8);
      element.style.setProperty('position', 'fixed', 'important');
      element.style.setProperty('left', `${Math.min(Math.max(8, position.left), maxLeft)}px`, 'important');
      element.style.setProperty('top', `${Math.min(Math.max(8, position.top), maxTop)}px`, 'important');
      element.style.setProperty('right', 'auto', 'important');
      element.style.setProperty('bottom', 'auto', 'important');
      element.style.setProperty('touch-action', 'none', 'important');
      element.style.setProperty('z-index', '10001', 'important');
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType !== 'touch') return;
      const rect = attached?.getBoundingClientRect();
      if (!rect) return;
      pointerStart = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, pointerId: event.pointerId };
      moved = false;
      try { attached?.setPointerCapture(event.pointerId); } catch { /* Pointer capture is not available in every embedded browser. */ }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!attached || !pointerStart || event.pointerId !== pointerStart.pointerId) return;
      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      moved = true;
      event.preventDefault();
      const left = Math.min(Math.max(8, pointerStart.left + dx), window.innerWidth - attached.offsetWidth - 8);
      const top = Math.min(Math.max(8, pointerStart.top + dy), window.innerHeight - attached.offsetHeight - 8);
      applyPosition(attached, { left, top });
      try { localStorage.setItem(POSITION_KEY, JSON.stringify({ left, top })); } catch { /* The dock remains movable if storage is unavailable. */ }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (pointerStart?.pointerId === event.pointerId) pointerStart = null;
      if (moved) window.setTimeout(() => { moved = false; }, 0);
    };

    const onClickCapture = (event: MouseEvent) => {
      if (!moved) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const attach = () => {
      const next = findToggle();
      if (!next || next === attached) return;
      if (attached) {
        attached.removeEventListener('pointerdown', onPointerDown, true);
        attached.removeEventListener('click', onClickCapture, true);
      }
      attached = next;
      const saved = readPosition();
      if (saved) applyPosition(attached, saved);
      attached.addEventListener('pointerdown', onPointerDown, true);
      attached.addEventListener('click', onClickCapture, true);
    };

    let observingChatHost = false;
    const observer = new MutationObserver(() => {
      attach();
      const host = document.querySelector('#n8n-chat');
      if (host && !observingChatHost) {
        observer.disconnect();
        observer.observe(host, { childList: true, subtree: true });
        observingChatHost = true;
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    attach();
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('resize', attach);

    return () => {
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('resize', attach);
      if (attached) {
        attached.removeEventListener('pointerdown', onPointerDown, true);
        attached.removeEventListener('click', onClickCapture, true);
        attached.style.removeProperty('left');
        attached.style.removeProperty('top');
        attached.style.removeProperty('right');
        attached.style.removeProperty('bottom');
        attached.style.removeProperty('position');
        attached.style.removeProperty('touch-action');
        attached.style.removeProperty('z-index');
      }
      document.body.classList.remove('mobile-store-mode');
    };
  }, []);

  return null;
}
