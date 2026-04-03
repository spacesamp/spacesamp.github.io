/* ====================================
   SPACESAMP — 交互逻辑
   包含：星空粒子、滚动动画、导航交互
   ==================================== */

(function () {
  'use strict';

  // ---- 星空粒子动画引擎 ----
  // NOTE: 使用 Canvas 2D 渲染星空效果提供沉浸感，粒子密度根据屏幕尺寸自适应
  function initStarField() {
    const canvas = document.getElementById('star-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    let animationId;

    /**
     * 设置 canvas 尺寸并初始化星空粒子
     */
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createStars();
    }

    /**
     * 根据屏幕面积生成适量的装饰粒子（浅色主题下使用较低密度）
     */
    function createStars() {
      // NOTE: 浅色背景下降低粒子密度，避免视觉噪音
      const count = Math.floor((canvas.width * canvas.height) / 10000);
      stars = [];
      // 浅色主题下使用科技蓝和淡紫色的粒子
      const colors = [
        { r: 0, g: 151, b: 167 },   // 科技青
        { r: 94, g: 53, b: 177 },    // 淡紫
        { r: 0, g: 184, b: 212 },    // 明亮青
        { r: 124, g: 77, b: 255 },   // 薰衣草紫
      ];
      for (let i = 0; i < count; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.3 + 0.05,
          speed: Math.random() * 0.2 + 0.03,
          // 每颗星的闪烁相位不同
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          color: color,
        });
      }
    }

    /**
     * 绘制动画帧：粒子闪烁 + 缓慢上移（营造太空漂浮感）
     */
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now() * 0.001;

      for (const star of stars) {
        // 闪烁效果通过正弦函数改变透明度
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase);
        const currentOpacity = star.opacity * (0.6 + twinkle * 0.4);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${currentOpacity})`;
        ctx.fill();

        // 缓慢上移模拟太空漂浮
        star.y -= star.speed;
        if (star.y < -5) {
          star.y = canvas.height + 5;
          star.x = Math.random() * canvas.width;
        }
      }

      animationId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();

    // 页面不可见时暂停动画以节省性能
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        draw();
      }
    });
  }

  // ---- 导航栏滚动效果 ----
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      // 滚动超过 80px 时添加毛玻璃背景
      if (scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      lastScrollY = scrollY;
    }, { passive: true });
  }

  // ---- 移动端汉堡菜单 ----
  function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // 点击菜单链接后自动关闭菜单
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // ---- 平滑锚点滚动 ----
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        const navHeight = document.getElementById('navbar')?.offsetHeight || 0;
        const targetPosition = target.offsetTop - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      });
    });
  }

  // ---- IntersectionObserver 滚动渐显动画 ----
  function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // 已触发后取消观察以提高性能
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  // ---- 数字计数器动画 ----
  // NOTE: 仅在元素进入视口时触发一次，避免重复计数
  function initCounterAnimations() {
    const counters = document.querySelectorAll('[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'), 10);
            animateCounter(el, target);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  /**
   * 从 0 递增到目标数值的计数动画
   * @param el - 目标 DOM 元素
   * @param target - 目标数值
   */
  function animateCounter(el, target) {
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // 使用 easeOutCubic 缓动函数让动画更自然
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      el.textContent = current + (target >= 50 ? '+' : '');

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ---- 产品卡片鼠标光晕跟踪 ----
  // NOTE: 跟踪鼠标位置在产品卡片上产生跟随式光晕效果
  function initCardGlow() {
    const cards = document.querySelectorAll('.product-card');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
      });
    });
  }

  // ---- 初始化所有模块 ----
  document.addEventListener('DOMContentLoaded', () => {
    initStarField();
    initNavbar();
    initHamburger();
    initSmoothScroll();
    initRevealAnimations();
    initCounterAnimations();
    initCardGlow();
  });
})();
