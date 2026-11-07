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
    const topic = new URLSearchParams(location.search).get('topic');
    const topicField = document.querySelector<HTMLSelectElement>('.contact-demo [name="topic"]');
    if (topic && topicField && [...topicField.options].some(option => option.value === topic)) {
      topicField.value = topic;
    }

    const onSubmit = async (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.matches('[data-nourish-form]')) return;
      event.preventDefault();
      if (!form.reportValidity() || form.getAttribute('aria-busy') === 'true') return;

      const result = form.querySelector<HTMLElement>('[data-form-result]');
      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      const body = new URLSearchParams();
      new FormData(form).forEach((value, key) => {
        if (typeof value === 'string') body.append(key, value);
      });
      form.setAttribute('aria-busy', 'true');
      if (button) button.disabled = true;
      if (result) {
        result.dataset.state = 'pending';
        result.textContent = 'Submitting…';
      }
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body,
        });
        const { message } = await response.json() as { message: string };
        if (result) {
          result.dataset.state = response.ok ? 'success' : 'error';
          result.textContent = message;
        }
        if (response.ok) form.reset();
      } catch {
        if (result) {
          result.dataset.state = 'error';
          result.textContent = 'We couldn’t connect. Please try again.';
        }
      } finally {
        form.removeAttribute('aria-busy');
        if (button) button.disabled = false;
      }
    };
    document.addEventListener('submit', onSubmit, true);
    const dismissNavigation = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || event.target.closest('.nourish-nav-disclosure')) return;
      document.querySelector<HTMLDetailsElement>('.nourish-nav-disclosure[open]')?.removeAttribute('open');
    };
    document.addEventListener('pointerdown', dismissNavigation);
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const disclosure = document.querySelector<HTMLDetailsElement>('.nourish-nav-disclosure[open]');
        if (disclosure) {
          disclosure.open = false;
          disclosure.querySelector('summary')?.focus();
          return;
        }
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
    return () => { document.removeEventListener('submit', onSubmit, true); document.removeEventListener('keydown', keyboard); document.removeEventListener('pointerdown', dismissNavigation); observer.disconnect(); };
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
