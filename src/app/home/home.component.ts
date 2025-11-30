import { Component, AfterViewInit, OnDestroy, ChangeDetectionStrategy, Renderer2, inject, NgZone, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { fromEvent, Subject, animationFrameScheduler } from 'rxjs';
import { takeUntil, auditTime } from 'rxjs/operators';

@Component({
  selector: 'app-artifex-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnDestroy {

  private renderer = inject(Renderer2);
  private destroy$ = new Subject<void>();
  private document = inject(DOCUMENT);

  /* Cached elements */
  private progressBar: HTMLDivElement | null = null;
  private headerEl: HTMLElement | null = null;
  private backToTopBtn: HTMLButtonElement | null = null;
  private cursorEl: HTMLDivElement | null = null;

  // Lightbox
  private images: HTMLImageElement[] = [];
  private lightbox!: HTMLDivElement | null;
  private lightboxImg!: HTMLImageElement | null;
  private closeBtn!: HTMLElement | null;
  private prevBtn!: HTMLElement | null;
  private nextBtn!: HTMLElement | null;
  private currentIndex = 0;
  
  public  currentDateTime = new Date();

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private ngZone: NgZone) { }

  ngAfterViewInit(): void {
    this.progressBar = this.document.getElementById('progress-bar') as HTMLDivElement | null;
    this.headerEl = this.document.querySelector('header');
    this.backToTopBtn = this.document.getElementById('backToTop') as HTMLButtonElement | null;
    this.cursorEl = this.document.querySelector('.cursor') as HTMLDivElement | null;

    if (isPlatformBrowser(this.platformId)) {


      this.ngZone.runOutsideAngular(() => {
        this.setupSmoothScroll();
        this.setupIntersectionReveal();
        this.setupLightbox();
        this.setupScrollStreams();
        this.setupBackToTop();
        this.setupCursor();
        this.setupLoaderLogoHero();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ---------------- Smooth Scroll ---------------- */
  private setupSmoothScroll() {
    const anchors = Array.from(this.document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const prefersReduced = this.prefersReducedMotion();
    anchors.forEach(anchor => {
      this.renderer.listen(anchor, 'click', (e: Event) => {
        const targetSel = anchor.getAttribute('href');
        if (!targetSel) return;
        const target = this.document.querySelector<HTMLElement>(targetSel);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------------- Reveal on Intersect ---------------- */
  private setupIntersectionReveal() {
    const elements = Array.from(this.document.querySelectorAll<HTMLElement>('.works, .about, .contact'));
    if (!('IntersectionObserver' in window) || elements.length === 0) return;

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) (entry.target as HTMLElement).classList.add('visible');
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    elements.forEach(el => io.observe(el));
  }

  /* ---------------- Lightbox ---------------- */
  private setupLightbox() {
    this.images = Array.from(this.document.querySelectorAll<HTMLImageElement>('.card img'));
    this.lightbox = this.document.getElementById('lightbox') as HTMLDivElement | null;
    this.lightboxImg = this.document.getElementById('lightbox-img') as HTMLImageElement | null;
    this.closeBtn = this.document.querySelector('.close');
    this.prevBtn = this.document.querySelector('.prev');
    this.nextBtn = this.document.querySelector('.next');

    const updateLightbox = () => {
      if (!this.lightboxImg) return;
      const img = this.images[this.currentIndex];
      if (img) this.lightboxImg.src = img.src;
    };

    if (this.lightbox && this.lightboxImg && this.closeBtn && this.prevBtn && this.nextBtn && this.images.length) {
      this.images.forEach((img, index) => {
        this.renderer.listen(img, 'click', () => {
          this.lightbox!.classList.add('open');
          this.currentIndex = index;
          updateLightbox();
          (this.closeBtn as HTMLElement).focus?.();
        });
      });

      this.renderer.listen(this.nextBtn, 'click', () => {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        updateLightbox();
      });

      this.renderer.listen(this.prevBtn, 'click', () => {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        updateLightbox();
      });

      this.renderer.listen(this.closeBtn, 'click', () => {
        this.lightbox!.classList.remove('open');
      });

      fromEvent<MouseEvent>(window, 'click', { passive: true } as AddEventListenerOptions)
        .pipe(takeUntil(this.destroy$))
        .subscribe(e => { if (e.target === this.lightbox) this.lightbox!.classList.remove('open'); });

      fromEvent<KeyboardEvent>(window, 'keydown', { passive: true } as AddEventListenerOptions)
        .pipe(takeUntil(this.destroy$))
        .subscribe(e => {
          if (this.lightbox!.classList.contains('open')) {
            if (e.key === 'ArrowRight') (this.nextBtn as HTMLElement).dispatchEvent(new Event('click'));
            else if (e.key === 'ArrowLeft') (this.prevBtn as HTMLElement).dispatchEvent(new Event('click'));
            else if (e.key === 'Escape') this.lightbox!.classList.remove('open');
          }
        });
    }
  }

  /* ---------------- Scroll-driven UI ---------------- */
  private setupScrollStreams() {
    fromEvent<Event>(window, 'scroll', { passive: true } as AddEventListenerOptions)
      .pipe(takeUntil(this.destroy$), auditTime(0, animationFrameScheduler))
      .subscribe(() => {
        this.updateProgressBar();
        this.toggleHeaderShrink();
        this.updateBackToTopVisibility();
      });

    // Initial paint
    this.updateProgressBar();
    this.toggleHeaderShrink();
    this.updateBackToTopVisibility();
  }

  private updateProgressBar() {
    if (!this.progressBar) return;
    const docEl = this.document.documentElement;
    const body = this.document.body as HTMLElement;
    const scrollTop = docEl.scrollTop || body.scrollTop;
    const scrollHeight = docEl.scrollHeight - docEl.clientHeight;
    const scrolled = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    this.progressBar.style.width = `${scrolled}%`;
  }

  private toggleHeaderShrink() {
    if (!this.headerEl) return;
    if (window.scrollY > 50) this.headerEl.classList.add('shrink');
    else this.headerEl.classList.remove('shrink');
  }

  /* ---------------- Back to Top ---------------- */
  private setupBackToTop() {
    if (!this.backToTopBtn) return;
    this.renderer.listen(this.backToTopBtn, 'click', () => {
      window.scrollTo({ top: 0, behavior: this.prefersReducedMotion() ? 'auto' : 'smooth' });
    });
  }

  private updateBackToTopVisibility() {
    if (!this.backToTopBtn) return;
    if (window.scrollY > 400) this.backToTopBtn.classList.add('show');
    else this.backToTopBtn.classList.remove('show');
  }

  /* ---------------- Cursor ---------------- */
  private mouseX = 0; private mouseY = 0; private cursorX = 0; private cursorY = 0;

  private setupCursor() {
    if (!this.cursorEl) return;

    fromEvent<MouseEvent>(this.document, 'mousemove', { passive: true } as AddEventListenerOptions)
      .pipe(takeUntil(this.destroy$))
      .subscribe(e => { this.mouseX = e.clientX; this.mouseY = e.clientY; });

    if (this.prefersReducedMotion()) return;

    const tick = () => {
      if (!this.cursorEl) return;
      this.cursorX += (this.mouseX - this.cursorX) * 0.2;
      this.cursorY += (this.mouseY - this.cursorY) * 0.2;
      this.cursorEl.style.transform = `translate(${this.cursorX - 7}px, ${this.cursorY - 7}px)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------------- Loader + Logo + Hero ---------------- */
  /* ---------------- Loader + Logo + Hero ---------------- */
private setupLoaderLogoHero() {
  const loader = this.document.getElementById('loader');
  const headerLogo = this.document.getElementById('header-logo');
  const heroText = this.document.querySelector<HTMLElement>('.hero-content');

  if (!loader || !headerLogo || !heroText) return;

  const run = () => {
    // Move logo up
    setTimeout(() => loader.classList.add('move-up'));
    // Fade out loader
    setTimeout(() => loader.classList.add('fade-out'));

    // Header logo pop animation
    setTimeout(() => {
      (headerLogo as HTMLElement).style.transition = 'transform .4s ease,color .4s ease';
      (headerLogo as HTMLElement).style.transform = 'scale(1.1)';
      (headerLogo as HTMLElement).style.color = 'white';
      setTimeout(() => {
        (headerLogo as HTMLElement).style.transform = 'scale(1)';
      });
    });

    // Reveal hero text
    setTimeout(() => heroText.classList.add('show-hero'));
  };

  // Just run it directly after view init
  run();
}


  /* ---------------- Utils ---------------- */
  private prefersReducedMotion(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
