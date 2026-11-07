import { useEffect } from 'react';
import type { PageData } from '../types';

declare global { interface Window { initializeReference?: () => void; referenceStarted?: boolean; lenis?: { start: () => void; stop: () => void }; } }

/** Renders trusted, bundled site markup. */
export function ReferencePage({ page }: { page: PageData }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/reference-runtime.js';
    script.onload = () => {
      if (!window.referenceStarted) {
        window.referenceStarted = true;
        window.initializeReference?.();
      }
    };
    if (document.getElementById('swirl-scene') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const effect = document.createElement('script');
      effect.src = '/unicornStudio.umd.js';
      effect.onload = () => document.body.appendChild(script);
      effect.onerror = () => document.body.appendChild(script);
      document.body.appendChild(effect);
    } else document.body.appendChild(script);
    const onSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      if (!form.matches('[data-demo-form]')) return;
      event.preventDefault();
      if (!form.reportValidity()) return;
      let result = form.querySelector<HTMLParagraphElement>('[data-form-result]');
      if (!result) { result = document.createElement('p'); result.dataset.formResult = ''; result.setAttribute('role', 'status'); form.appendChild(result); }
      result.textContent = 'Your details passed validation. Demonstration mode: no information was sent.';
    };
    document.addEventListener('submit', onSubmit, true);
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        document.body.classList.remove('menuIsOpen', 'submenu-active');
        window.lenis?.start();
        document.querySelectorAll('[data-toggle-menu]').forEach(e => e.setAttribute('aria-expanded', 'false'));
        (document.querySelector('[data-toggle-menu]') as HTMLButtonElement | null)?.focus();
      }
      if (event.key === 'Tab' && document.body.classList.contains('menuIsOpen')) {
        const menu = document.querySelector('[data-menu]');
        const focusable = [...(menu?.querySelectorAll<HTMLElement>('a[href],button,input') ?? [])].filter(e => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden');
        const first = focusable[0], last = focusable.at(-1);
        if (first && last && event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (first && last && !event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', keyboard);
    const controls = () => {
      const open = document.body.classList.contains('menuIsOpen');
      document.querySelectorAll('[data-toggle-menu]').forEach(e => e.setAttribute('aria-expanded', String(open)));
      document.querySelectorAll('[data-toggle-mobile-sub-menu]').forEach(e => e.setAttribute('aria-expanded', String(e.classList.contains('submenu-active'))));
    };
    const observer = new MutationObserver(controls);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
    document.querySelectorAll<HTMLVideoElement>('video').forEach(video => {
      video.addEventListener('error', () => {
        const message = document.createElement('p'); message.className = 'demo-note'; message.setAttribute('role', 'status');
        message.textContent = 'This source video is unavailable in the preview.';
        if (!video.parentElement?.querySelector('[role="status"]')) video.after(message);
      });
    });
    return () => { document.removeEventListener('submit', onSubmit, true); document.removeEventListener('keydown', keyboard); observer.disconnect(); };
  }, []);
  return <>
    <a className="skip-link screen-reader-text" href="#content">Skip to content</a>
    <SourceHeader html={page.header} />
    <div className="source-content" dangerouslySetInnerHTML={{ __html: page.main }} />
    <SourceFooter html={page.footer} />
  </>;
}
function SourceHeader({ html }: { html: string }) { return <div className="source-header" dangerouslySetInnerHTML={{ __html: html }} />; }
function SourceFooter({ html }: { html: string }) { return <div className="source-footer" dangerouslySetInnerHTML={{ __html: html }} />; }
