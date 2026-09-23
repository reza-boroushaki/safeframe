/*! Copyright Mobkoi 2026 (v5.5.1) */
const x = {
  scene: "",
  loop: !1,
  video: "",
  killOnEnd: !1,
  singleDirection: !1,
  scrollOptions: {
    startPercent: 0.15,
    endPercent: 0.9
  },
  safeFramePlayValue: 0.5,
  containerElement: null,
  forceNativeMode: !1
};
class b {
  constructor(e) {
    this.log = e.enter("SafeFrameUtil");
  }
  check() {
    const e = {}, t = typeof window < "u" && window.location && typeof window.location.href == "string" ? window.location.href : "", n = typeof creative < "u" && creative?.adapter && creative.adapter.safeFrameDetected || !1, i = /googlesyndication/i.test(t) || /safeframe/i.test(t);
    if (e.detected = !!(n || i), typeof window < "u")
      try {
        e.apiObject = typeof window.$sf < "u" ? window.$sf : window.parent.$sf;
      } catch (s) {
        this.log.debug("SafeFrameUtil", "cannot access window.parent.$sf", s), e.apiObject = typeof window.$sf < "u" ? window.$sf : void 0;
      }
    else
      e.apiObject = void 0;
    return e.usable = e.apiObject && e.apiObject.ext && (typeof e.apiObject.ext.inViewPercentage == "function" || typeof e.apiObject.ext.geom == "function"), e.passed = e.detected && e.apiObject && e.usable, e;
  }
  /**
   * Returns the SafeFrame API object if available, otherwise null
   * @returns {Object|null} SafeFrame API object if available, otherwise null
   */
  get() {
    return this.check().apiObject || null;
  }
  apiExists() {
    try {
      return !!window.$sf || typeof window.parent.$sf == "object";
    } catch (e) {
      return this.log.debug("SafeFrameUtil", "no apiExists", e), !1;
    }
  }
  configExists() {
    try {
      const e = window.sf_ || window.parent.sf_;
      return typeof e == "object" && e.cfg && typeof e.cfg.reportCreativeGeometry < "u" ? "true-geom:" + e.cfg.reportCreativeGeometry : typeof e == "object";
    } catch (e) {
      return this.log.debug("SafeFrameUtil", "no configExists", e), !1;
    }
  }
}
class y {
  constructor(e) {
    this.name = e;
  }
  get prefix() {
    const e = this.name ? `[${this.name}]` : "";
    return this.parent ? this.parent.prefix + e : e;
  }
  log(...e) {
    console.debug(this.prefix, ...e);
  }
  debug(...e) {
    return this.log(...e);
  }
  warn(...e) {
    console.warn(this.prefix, ...e);
  }
  error(...e) {
    console.error(this.prefix, ...e);
  }
  enter(e) {
    return this.add(new y(e));
  }
  add(e) {
    return e.parent = this, e;
  }
}
const E = new y("MOBKOI"), S = E.enter("Celtra");
class C {
  constructor() {
    this.callbacks = [], this.rafId = null, this.running = !1;
  }
  add(e) {
    this.callbacks.includes(e) || this.callbacks.push(e), this.running || this.start();
  }
  remove(e) {
    const t = this.callbacks.indexOf(e);
    t > -1 && this.callbacks.splice(t, 1), this.callbacks.length === 0 && this.stop();
  }
  start() {
    this.running || (this.running = !0, this.tick());
  }
  stop() {
    this.running = !1, this.rafId !== null && (cancelAnimationFrame(this.rafId), this.rafId = null);
  }
  tick() {
    this.running && (this.callbacks.forEach((e) => {
      try {
        e();
      } catch (t) {
        console.error("Ticker callback error:", t);
      }
    }), this.rafId = requestAnimationFrame(() => this.tick()));
  }
}
const k = [
  "[id^=mobkoi]",
  "mbk-container",
  "#mobkoi-creative",
  '[id*="celtra"]',
  '[class*="celtra"]',
  ".ad-container",
  "#ad-container",
  "[data-ad-container]"
];
class h {
  /**
   * Query an element in ancestor documents, starting at the immediate parent.
   */
  static queryParentDocument(e) {
    try {
      let t = window.parent;
      for (; t && t !== window; ) {
        const n = t.document.querySelector(e);
        if (n)
          return n;
        if (!t.parent || t.parent === t)
          break;
        t = t.parent;
      }
    } catch {
      console.warn("Dom: Cannot access parent document (cross-origin)");
    }
    return null;
  }
  /**
   * Query in the current document, then ancestor documents.
   */
  static querySelector(e) {
    return document.querySelector(e) ?? h.queryParentDocument(e);
  }
  /**
   * Resolve the first matching Element from a selector, Element, or list of either.
   */
  static resolveElement(e) {
    if (!e)
      return null;
    const t = Array.isArray(e) ? e : [e];
    for (const n of t) {
      if (n instanceof Element)
        return n;
      if (typeof n == "string") {
        const i = h.querySelector(n);
        if (i)
          return i;
      }
    }
    return null;
  }
  /**
   * Return the first element matching any of the given selectors (current document only).
   */
  static queryFirst(e) {
    for (const t of e) {
      const n = document.querySelector(t);
      if (n)
        return n;
    }
    return null;
  }
  /**
   * Resolve an ad/creative container element.
   * Prefers explicit selectors, then unitDiv, then common ad fallbacks, then document.body.
   */
  static resolveContainerElement(e, t, n = k) {
    if (e) {
      const s = h.resolveElement(e);
      if (s)
        return s;
      typeof e == "string" ? console.warn(`Dom: containerElement "${e}" not found`) : Array.isArray(e) && console.warn("Dom: containerElement selectors not found", e);
    }
    if (t)
      return t;
    const i = h.queryFirst(n);
    return i || (console.warn("Dom: No container found, using document.body"), document.body);
  }
}
class P {
  constructor() {
    this.events = /* @__PURE__ */ new Map();
  }
  on(e, t) {
    const n = this.events.get(e) ?? [];
    return n.push(t), this.events.set(e, n), this;
  }
  off(e, t) {
    if (!t)
      return this.events.delete(e), this;
    const n = this.events.get(e);
    return n ? (this.events.set(e, n.filter((i) => i !== t)), this) : this;
  }
  emit(e, ...t) {
    const n = this.events.get(e);
    n && n.forEach((i) => {
      i(...t);
    });
  }
}
class O extends P {
  constructor(e) {
    super(), this.element = e, this.values = {
      y: null,
      vh: null,
      vw: null,
      top: null,
      bottom: null,
      left: null,
      right: null,
      width: null,
      height: null,
      pageYOffset: null
    }, this.dirty = {}, this.isDirtyFlag = !1;
  }
  get y() {
    return this.values.y;
  }
  get vh() {
    return this.values.vh;
  }
  get vw() {
    return this.values.vw;
  }
  get pageYOffset() {
    return this.values.pageYOffset;
  }
  update() {
    if (!this.element)
      return;
    const e = this.element.getBoundingClientRect(), t = this.element.ownerDocument.defaultView ?? window, n = {
      left: Math.round(e.left),
      top: Math.round(e.top),
      right: Math.round(e.right),
      bottom: Math.round(e.bottom),
      width: Math.round(e.width),
      height: Math.round(e.height),
      vw: t.innerWidth,
      vh: t.innerHeight,
      pageYOffset: t.pageYOffset || t.scrollY || 0,
      y: Math.round(e.top + e.height / 2 - t.innerHeight / 2)
    };
    for (const i of Object.keys(n)) {
      const s = n[i];
      if (this.values[i] !== s) {
        const r = this.values[i];
        this.values[i] = s, this.dirty[i] = !0, this.isDirtyFlag = !0, this.emit(`change:${i}`, s, r);
      }
    }
  }
  isDirty(e) {
    return e === void 0 ? this.isDirtyFlag : !!this.dirty[e];
  }
  markClean(e) {
    if (e) {
      delete this.dirty[e];
      return;
    }
    this.dirty = {}, this.isDirtyFlag = !1;
  }
}
function M(o) {
  return o ? o.ownerDocument.defaultView ?? window : window;
}
class d {
  static lerp(e, t, n) {
    return e + (t - e) * n;
  }
  static map(e, t, n, i, s) {
    return n + (i - n) * ((s - e) / (t - e));
  }
  static clamp(e, t, n) {
    return Math.min(Math.max(n, e), t);
  }
}
class A {
  constructor(e, t, n, i) {
    this.context = e, this.options = t, this.content = n, this.log = i, this.done = !1, this.lastValue = 0;
  }
  get scene() {
    return this.content.playableScene;
  }
  createCallback(e) {
    return () => {
      if (this.options.killOnEnd && this.done && !this.isEndSceneScrollMode())
        return;
      const t = this.context.unit;
      if (t?.currentScreen && t.currentScreen !== this.content.screen || !e.isDirty())
        return;
      if (e.y === null || e.vh === null) {
        e.markClean();
        return;
      }
      const n = d.lerp(e.vh, -e.vh, 0), i = d.lerp(e.vh, -e.vh, 1);
      if (e.y < n && e.y > i) {
        const s = e.vh - this.options.scrollOptions.startPercent * e.vh, r = (1 - this.options.scrollOptions.endPercent) * e.vh;
        if (this.done && this.isEndSceneScrollMode()) {
          const w = d.clamp(
            0,
            100,
            Math.round(d.map(r, i, 0, 100, e.y))
          );
          this.content.endScene?.renderAtProgress?.(w), e.markClean();
          return;
        }
        const c = this.options.loop ? Math.abs(e.y) : e.y, a = Math.round(d.map(s, Number(r.toFixed(1)), 0, 100, c));
        let l = a;
        this.options.singleDirection && a < this.lastValue && (l = this.lastValue);
        const g = d.clamp(0, 100, l);
        this.content.apply(g), this.content.overlayScene?.renderAtProgress?.(g), this.context.creative?.userParams?.debug === "true" && this.log.debug(
          `scrub percent = ${g}
	=> map(${s}, ${r}, 0, 100, ${c})`
        ), a >= 100 && !this.done && (this.done = !0, this.handleCompletion()), this.lastValue = l;
      }
      e.markClean();
    };
  }
  playSceneOnEnd(e) {
    this.content.playOnEnd(this.context.ctx, e);
  }
  stop() {
    this.pageTransitionTimer && (clearTimeout(this.pageTransitionTimer), this.pageTransitionTimer = void 0);
  }
  handleCompletion() {
    this.isEndSceneScrollMode() || (this.options.nextPage?.active && !this.pageTransitionTimer && (this.pageTransitionTimer = this.schedulePageTransition()), this.options.onEndScene?.active && this.content.endScene?.playSceneAction && this.context.ctx && this.content.endScene.playSceneAction(this.context.ctx, {}, () => {
    }));
  }
  isEndSceneScrollMode() {
    return this.options.onEndScene?.active === !0 && this.options.onEndScene.mode === "scroll" && !!this.content.endScene;
  }
  schedulePageTransition() {
    if (!this.options.nextPage)
      return;
    const e = {
      screen: this.content.nextPageScene
    };
    return Object.assign(e, this.options.nextPage.opts), setTimeout(() => {
      const t = this.context.unit;
      t?.goToScreenAction && this.context.ctx && t.goToScreenAction(this.context.ctx, e, () => {
        this.pageTransitionTimer = void 0;
      });
    }, this.options.nextPage.timeout);
  }
  schedulePageTransitionAfterPlayerEnd(e) {
    e._player?.on("end", () => {
      !this.pageTransitionTimer && this.options.nextPage?.active && (this.pageTransitionTimer = this.schedulePageTransition());
    });
  }
  scheduleEndSceneAfterPlayerEnd(e) {
    e._player?.on("end", () => {
      this.options.onEndScene?.active && this.content.endScene?.playSceneAction && this.context.ctx && this.content.endScene.playSceneAction(this.context.ctx, {}, () => {
      });
    });
  }
}
class T {
  constructor(e, t, n, i, s) {
    this.screen = e, this.scene = t, this.nextPageScene = n, this.endScene = i, this.overlayScene = s;
  }
  get playableScene() {
    return this.scene;
  }
  apply(e) {
    this.scene.renderAtProgress?.(e);
  }
  playOnEnd(e, t) {
    if (!e || !this.scene.playSceneAction) {
      t?.();
      return;
    }
    this.scene.playSceneAction(e, {}, () => {
      t?.();
    });
  }
}
class F {
  constructor(e, t, n, i, s) {
    this.screen = e, this.video = t, this.nextPageScene = n, this.endScene = i, this.overlayScene = s, this.playableScene = null, this.scheduleHideControls();
  }
  apply(e) {
    const t = this.video.getDuration();
    typeof t != "number" || !Number.isFinite(t) || t <= 0 || this.video.setCurrentTime(e / 100 * t);
  }
  playOnEnd(e, t) {
    t?.();
  }
  scheduleHideControls() {
    if (this.screen.hasAppearedAtLeastOnce) {
      this.hideControls();
      return;
    }
    typeof this.screen.once == "function" && this.screen.once("appeared", () => this.hideControls());
  }
  hideControls() {
    const e = this.video.getNode(), t = e instanceof Element ? e.querySelector("div#hideable-controls") : document.querySelector("#hideable-controls");
    t && (t.style.display = "none");
  }
}
class R {
  constructor(e, t) {
    this.context = e, this.options = t, this.started = !1, this.modeHandles = [], this.ticker = new C(), this.log = S.enter("RxScroll"), this.safeFrameUtil = new b(this.log);
  }
  start() {
    if (this.started) {
      this.log.debug("RxScroll already started");
      return;
    }
    this.started = !0, this.waitForReady(() => this.init());
  }
  stop() {
    this.modeHandles.forEach((e) => e.stop()), this.modeHandles = [], this.driver?.stop(), this.started = !1;
  }
  readMode() {
    return this.modeHandles.at(-1)?.mode ?? null;
  }
  init() {
    const e = this.resolveTargets();
    this.driver = new A(this.context, this.options, e, this.log);
    const t = this.safeFrameUtil.check();
    let n;
    if (this.isCeltraNativeMode()) {
      n = this.context.unit.getRxStateObject?.() ?? void 0;
      const s = this.startCeltraNativeMode(this.driver, t.passed, n);
      s && this.modeHandles.push(s);
    } else if (!t.passed) {
      const i = this.startNativeBrowserMode(this.driver);
      this.modeHandles.push(i.handle), n = i.state;
    }
    t.passed ? this.modeHandles.push(this.startSafeFrameMode(this.driver, t.apiObject)) : !this.isCeltraNativeMode() && !n && this.modeHandles.push(this.startFallbackMode(this.driver));
  }
  isCeltraNativeMode() {
    if (this.options.forceNativeMode)
      return !1;
    const e = this.context.unit;
    return !!(e && typeof e.getRxStateObject == "function" && e.getRxStateObject() !== null);
  }
  startCeltraNativeMode(e, t, n) {
    if (!n || t)
      return;
    this.log.debug("RxScroll: Using Celtra native mode");
    const i = e.createCallback(n);
    return n.on?.("change:y", i), {
      mode: "celtra-native",
      stop: () => n.off?.("change:y", i)
    };
  }
  startNativeBrowserMode(e) {
    const t = this.context.unit, n = h.resolveContainerElement(this.options.containerElement, t?.unitDiv);
    this.log.debug("RxScroll: Using native browser mode", n);
    const i = new O(n), s = e.createCallback(i), r = () => {
      i.update(), s();
    };
    this.ticker.add(r);
    const c = M(n), a = () => i.update();
    c.addEventListener("scroll", a, { passive: !0 }), c.addEventListener("resize", a, { passive: !0 });
    let l = !1;
    return c !== window && (l = !0, window.addEventListener("scroll", a, { passive: !0 })), i.update(), {
      state: i,
      handle: {
        mode: "native-browser",
        stop: () => {
          this.ticker.remove(r), c.removeEventListener("scroll", a), c.removeEventListener("resize", a), l && window.removeEventListener("scroll", a);
        }
      }
    };
  }
  startSafeFrameMode(e, t) {
    this.log.debug("RxScroll: Using SafeFrame mode");
    const n = e.scene;
    let i = !1;
    const s = setInterval(() => {
      const r = t?.ext?.inViewPercentage?.();
      typeof r != "number" || r <= this.options.safeFramePlayValue * 100 || e.playSceneOnEnd(() => {
        i || (i = !0, clearInterval(s), n && this.options.nextPage?.active && e.schedulePageTransitionAfterPlayerEnd(n), n && this.options.onEndScene?.active && e.scheduleEndSceneAfterPlayerEnd(n));
      });
    }, 200);
    return {
      mode: "safeframe",
      stop: () => {
        i = !0, clearInterval(s);
      }
    };
  }
  startFallbackMode(e) {
    this.log.debug("RxScroll: Using fallback (screen.appeared) mode");
    const t = this.context.screen, n = e.scene, i = () => {
      e.playSceneOnEnd(() => {
        n && this.options.nextPage?.active && e.schedulePageTransitionAfterPlayerEnd(n), n && this.options.onEndScene?.active && e.scheduleEndSceneAfterPlayerEnd(n);
      });
    };
    return typeof t.once == "function" ? t.once("appeared", i) : t.hasAppearedAtLeastOnce && i(), {
      mode: "fallback",
      stop: () => {
      }
    };
  }
  waitForReady(e) {
    if (typeof this.context.screen.find == "function") {
      e();
      return;
    }
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => {
      setTimeout(e, 100);
    }) : setTimeout(e, 100);
  }
  resolveTargets() {
    if (!this.options.video && !this.options.scene)
      throw new Error('ReactiveScroll: either "video" or "scene" is required');
    return this.options.video ? this.resolveVideoContent() : this.resolveAnimationContent();
  }
  resolveAnimationContent() {
    const { screen: e } = this.context, t = this.options.scene;
    if (!t)
      throw new Error("ReactiveScroll: Scene not found. Make sure the scene name matches.");
    const n = e.find(t);
    if (!n)
      throw new Error(`ReactiveScroll: Scene "${t}" not found. Make sure the scene name matches.`);
    const { nextPageScene: i, endScene: s, overlayScene: r } = this.resolveOptionalScenes();
    return new T(e, n, i, s, r);
  }
  resolveVideoContent() {
    const { screen: e } = this.context, t = this.options.video, n = e.find(t);
    if (!n)
      throw new Error(`ReactiveScroll: Video "${t}" not found.`);
    const { nextPageScene: i, endScene: s, overlayScene: r } = this.resolveOptionalScenes();
    return new F(e, n, i, s, r);
  }
  /** Shared by scene + video: optional nextPage / onEndScene / overlayScene targets. */
  resolveOptionalScenes() {
    const { screen: e, unit: t } = this.context;
    return {
      nextPageScene: this.options.nextPage ? t?.find?.(this.options.nextPage.page) : void 0,
      endScene: this.options.onEndScene ? e.find(this.options.onEndScene.scene) : void 0,
      overlayScene: this.options.overlayScene?.active ? e.find(this.options.overlayScene.scene) : void 0
    };
  }
}
function v(o) {
  return !!(o && typeof o.find == "function");
}
function u(o) {
  return globalThis[o];
}
class j {
  resolve(e = {}) {
    const t = this.resolveCreative(e.creative);
    if (!t)
      throw new Error('Celtra context: "creative" not found');
    const n = this.resolveScreen(t, e.screen);
    if (!n)
      throw new Error('Celtra context: "screen" is missing or not a Celtra screen');
    const i = this.resolveUnit(t, e.unit, n);
    if (!i)
      throw new Error('Celtra context: "unit" not found');
    const s = this.resolveCtx(e.ctx, n);
    return { creative: t, unit: i, screen: n, ctx: s };
  }
  resolveCreative(e) {
    return e ?? u("creative");
  }
  resolveScreen(e, t) {
    if (v(t))
      return t;
    if (typeof e?.getScreen == "function") {
      const i = e.getScreen();
      if (v(i))
        return i;
    }
    const n = u("screen");
    return v(n) ? n : void 0;
  }
  resolveUnit(e, t, n) {
    return t ?? e?.getUnit?.() ?? n?.getUnit?.() ?? u("unit");
  }
  resolveCtx(e, t) {
    const n = e ?? u("ctx") ?? u("mbkCtx");
    return n || !t || typeof ActionContext > "u" ? n : new ActionContext(t, {
      certainlyNotCausedByUserBehavior: !1,
      consideredUserInitiatedByBrowser: !1
    });
  }
}
const B = new j();
class f {
  static deepMerge(e, t) {
    const n = { ...e };
    for (const i of Object.keys(t)) {
      const s = t[i], r = e[i];
      s !== void 0 && (f.isPlainObject(r) && f.isPlainObject(s) ? n[i] = f.deepMerge(
        r,
        s
      ) : n[i] = s);
    }
    return n;
  }
  static isPlainObject(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e) && Object.getPrototypeOf(e) === Object.prototype;
  }
}
const p = class p {
  constructor() {
    this.contextResolver = B;
  }
  init(e) {
    const t = S.enter(this.name), n = this.contextResolver.resolve(e), i = n.unit ?? n.screen, s = p.registry.get(i);
    if (s)
      return t.debug(`${this.name} already initialized`), s;
    const r = f.deepMerge(this.defaultConfig, e), c = this.create(n, r);
    return p.registry.set(i, c), c.start(), c;
  }
};
p.registry = /* @__PURE__ */ new WeakMap();
let m = p;
class D extends m {
  constructor() {
    super(...arguments), this.name = "RxScroll", this.defaultConfig = x;
  }
  create(e, t) {
    const n = e.unit, i = !!(n && typeof n.getRxStateObject == "function" && n.getRxStateObject() !== null);
    console.log("isCeltraNativeMode******", i);
    const s = e.creative?.constructor?.name === "CrossScreenBanner";
    return new R(e, {
      ...t,
      forceNativeMode: s,
      containerElement: s ? ["[id^=mobkoi]", "mbk-container"] : null
    });
  }
}
