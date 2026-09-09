/*! Copyright Mobkoi 2026 (v5.5.1) */
const C = {
  container: "SwipeContainer",
  content: "SwipeContent",
  scene: "Animation",
  sections: 3,
  instructionGroup: "Instructions-group",
  instructionScene: "Instructions",
  dragSensitivity: 1,
  easingDuration: 600,
  directionThreshold: 10,
  momentumMultiplier: 300,
  instructionThreshold: 0,
  engagementThreshold: 50,
  edgeTolerance: 5,
  directionTolerance: 50
};
class p {
  constructor(t) {
    this.name = t;
  }
  get prefix() {
    const t = this.name ? `[${this.name}]` : "";
    return this.parent ? this.parent.prefix + t : t;
  }
  log(...t) {
    console.debug(this.prefix, ...t);
  }
  debug(...t) {
    return this.log(...t);
  }
  warn(...t) {
    console.warn(this.prefix, ...t);
  }
  error(...t) {
    console.error(this.prefix, ...t);
  }
  enter(t) {
    return this.add(new p(t));
  }
  add(t) {
    return t.parent = this, t;
  }
}
const T = new p("MOBKOI"), S = T.enter("Celtra");
function f(i) {
  return !!(i && typeof i.find == "function");
}
function a(i) {
  return globalThis[i];
}
class O {
  resolve(t = {}) {
    const e = this.resolveCreative(t.creative);
    if (!e)
      throw new Error('Celtra context: "creative" not found');
    const s = this.resolveScreen(e, t.screen);
    if (!s)
      throw new Error('Celtra context: "screen" is missing or not a Celtra screen');
    const n = this.resolveUnit(e, t.unit, s);
    if (!n)
      throw new Error('Celtra context: "unit" not found');
    const r = this.resolveCtx(t.ctx, s);
    return { creative: e, unit: n, screen: s, ctx: r };
  }
  resolveCreative(t) {
    return t ?? a("creative");
  }
  resolveScreen(t, e) {
    if (f(e))
      return e;
    if (typeof t?.getScreen == "function") {
      const n = t.getScreen();
      if (f(n))
        return n;
    }
    const s = a("screen");
    return f(s) ? s : void 0;
  }
  resolveUnit(t, e, s) {
    return e ?? t?.getUnit?.() ?? s?.getUnit?.() ?? a("unit");
  }
  resolveCtx(t, e) {
    const s = t ?? a("ctx") ?? a("mbkCtx");
    return s || !e || typeof ActionContext > "u" ? s : new ActionContext(e, {
      certainlyNotCausedByUserBehavior: !1,
      consideredUserInitiatedByBrowser: !1
    });
  }
}
const P = new O();
class h {
  static deepMerge(t, e) {
    const s = { ...t };
    for (const n of Object.keys(e)) {
      const r = e[n], o = t[n];
      r !== void 0 && (h.isPlainObject(o) && h.isPlainObject(r) ? s[n] = h.deepMerge(
        o,
        r
      ) : s[n] = r);
    }
    return s;
  }
  static isPlainObject(t) {
    return typeof t == "object" && t !== null && !Array.isArray(t) && Object.getPrototypeOf(t) === Object.prototype;
  }
}
const l = class l {
  constructor() {
    this.contextResolver = P;
  }
  init(t) {
    const e = S.enter(this.name), s = this.contextResolver.resolve(t), n = s.unit ?? s.screen, r = l.registry.get(n);
    if (r)
      return e.debug(`${this.name} already initialized`), r;
    const o = h.deepMerge(this.defaultConfig, t), c = this.create(s, o);
    return l.registry.set(n, c), c.start(), c;
  }
};
l.registry = /* @__PURE__ */ new WeakMap();
let m = l;
const v = (i) => {
  const t = i.style.transform || getComputedStyle(i).transform || "", e = t.match(/translate3d\(\s*(-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px/i);
  if (e) return { x: parseFloat(e[1] ?? "0"), y: parseFloat(e[2] ?? "0") };
  const s = t.match(/translate\(\s*(-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px/i);
  if (s) return { x: parseFloat(s[1] ?? "0"), y: parseFloat(s[2] ?? "0") };
  const n = t.match(/matrix\(([^)]+)\)/i);
  if (n) {
    const r = (n[1] ?? "").split(",").map((o) => parseFloat(o.trim()));
    return { x: r[4] ?? 0, y: r[5] ?? 0 };
  }
  return { x: 0, y: 0 };
}, x = {
  name: "horizontal",
  defaultTouchAction: "pan-y",
  // let vertical page-scroll pass through natively
  getPrimary: (i) => i,
  getCross: (i, t) => t,
  getTranslate: (i) => v(i).x,
  setTranslate: (i, t) => {
    i.style.transform = `translate3d(${t}px, 0, 0)`;
  },
  measureViewport: (i) => i.offsetWidth || i.parentElement?.offsetWidth || 320,
  measureContent: (i) => i.getBoundingClientRect().width
}, k = {
  name: "vertical",
  defaultTouchAction: "pan-x",
  // let horizontal scroll pass through natively
  getPrimary: (i, t) => t,
  getCross: (i) => i,
  getTranslate: (i) => v(i).y,
  setTranslate: (i, t) => {
    i.style.transform = `translate3d(0, ${t}px, 0)`;
  },
  measureViewport: (i) => i.offsetHeight || i.parentElement?.offsetHeight || 320,
  measureContent: (i) => i.getBoundingClientRect().height
};
class b {
  constructor() {
    this.listeners = {};
  }
  on(t, e) {
    const s = this.listeners[t] ?? /* @__PURE__ */ new Set();
    return s.add(e), this.listeners[t] = s, () => this.off(t, e);
  }
  off(t, e) {
    this.listeners[t]?.delete(e);
  }
  emit(t, e) {
    this.listeners[t]?.forEach((s) => s(e));
  }
  removeAllListeners() {
    this.listeners = {};
  }
}
const I = (i) => Math.pow(i - 1, 3) + 1, d = (i, t, e) => Math.min(Math.max(i, t), e);
class u extends b {
  constructor(t, e, s = {}) {
    super(), this.active = !1, this.startPrimary = 0, this.startCross = 0, this.startOffset = 0, this.currentOffset = 0, this.lockedTo = null, this.axisLockFired = !1, this.minScroll = 0, this.maxScroll = 0, this.viewportSize = 0, this.samples = [], this.rafId = 0, this.activePointerId = null, this.container = t, this.content = e, this.axis = s.axis ?? x, this.dragSensitivity = s.dragSensitivity ?? 1, this.easingDuration = s.easingDuration ?? 600, this.axisLockThreshold = s.axisLockThreshold ?? 10, this.getBoundsOverride = s.getBounds, this.container.style.touchAction = s.touchAction ?? this.axis.defaultTouchAction, this.content.style.willChange = "transform", this.onPointerDown = this.onPointerDown.bind(this), this.onPointerMove = this.onPointerMove.bind(this), this.onPointerUp = this.onPointerUp.bind(this), this.recalculateBounds(), console.log("[SwipeDetector] init", {
      axis: this.axis.name,
      containerTag: this.container?.tagName,
      contentTag: this.content?.tagName,
      containerSize: this.viewportSize,
      minScroll: this.minScroll,
      maxScroll: this.maxScroll,
      contentRect: this.content?.getBoundingClientRect?.(),
      containerRect: this.container?.getBoundingClientRect?.(),
      touchAction: this.container.style.touchAction
    }), this.enable();
  }
  /** Convenience factory: `SwipeDetector.horizontal(container, content, options)`. */
  static horizontal(t, e, s = {}) {
    return new u(t, e, { ...s, axis: x });
  }
  /** Convenience factory: `SwipeDetector.vertical(container, content, options)`. */
  static vertical(t, e, s = {}) {
    return new u(t, e, { ...s, axis: k });
  }
  /** (Re)attaches the pointerdown listener. Called automatically by the constructor. */
  enable() {
    this.container.addEventListener("pointerdown", this.onPointerDown);
  }
  /** Detaches all listeners and stops any running animation, without discarding subscribers. */
  disable() {
    this.container.removeEventListener("pointerdown", this.onPointerDown), this.detachMoveListeners(), this.stopAnimation();
  }
  /** Fully tears down the detector: disables it and clears all event subscribers. */
  destroy() {
    this.disable(), this.removeAllListeners();
  }
  /** Re-measure container/content size along the drag axis, e.g. after a resize. */
  recalculateBounds() {
    const t = this.getBoundsOverride?.();
    if (this.viewportSize = this.axis.measureViewport(this.container), t) {
      this.minScroll = t.min, this.maxScroll = t.max, console.log("[SwipeDetector] recalculateBounds (override)", {
        viewportSize: this.viewportSize,
        minScroll: this.minScroll,
        maxScroll: this.maxScroll
      });
      return;
    }
    const e = this.axis.measureContent(this.content);
    this.maxScroll = 0, this.minScroll = Math.min(0, -(e - this.viewportSize)), console.log("[SwipeDetector] recalculateBounds", {
      contentSize: e,
      viewportSize: this.viewportSize,
      minScroll: this.minScroll,
      maxScroll: this.maxScroll,
      canScroll: this.minScroll < 0
    });
  }
  /** Animates to a given 0-based index, assuming `sectionCount` equal-size sections. */
  scrollToIndex(t, e) {
    if (e <= 0) return;
    const s = d(t, 0, e - 1), n = Math.max(e - 1, 1), r = this.minScroll * (s / n);
    this.animateTo(r);
  }
  /** Current progress snapshot, useful for reading state without waiting for an event. */
  get progress() {
    return this.buildProgress();
  }
  buildProgress() {
    const t = Math.abs(this.currentOffset), e = Math.abs(this.minScroll);
    return {
      offset: t,
      max: e,
      viewport: this.viewportSize,
      rawOffset: this.currentOffset,
      percent: e > 0 ? d(t / e, 0, 1) : 0
    };
  }
  onPointerDown(t) {
    if (t.pointerType === "mouse" && t.button !== 0) {
      console.log("[SwipeDetector] pointerdown ignored (non-primary mouse button)", t.button);
      return;
    }
    this.stopAnimation(), this.recalculateBounds(), this.active = !0, this.lockedTo = null, this.axisLockFired = !1, this.activePointerId = t.pointerId, this.startPrimary = this.axis.getPrimary(t.clientX, t.clientY), this.startCross = this.axis.getCross(t.clientX, t.clientY), this.currentOffset = this.axis.getTranslate(this.content), this.startOffset = this.currentOffset, this.samples = [], this.pushSample(performance.now(), this.currentOffset), console.log("[SwipeDetector] pointerdown", {
      pointerType: t.pointerType,
      pointerId: t.pointerId,
      clientX: t.clientX,
      clientY: t.clientY,
      startPrimary: this.startPrimary,
      startOffset: this.startOffset,
      minScroll: this.minScroll,
      maxScroll: this.maxScroll,
      contentTransform: this.content.style.transform
    }), this.emit("dragstart", { offset: this.currentOffset }), window.addEventListener("pointermove", this.onPointerMove), window.addEventListener("pointerup", this.onPointerUp), window.addEventListener("pointercancel", this.onPointerUp);
  }
  onPointerMove(t) {
    if (!this.active || t.pointerId !== this.activePointerId) return;
    const e = this.axis.getPrimary(t.clientX, t.clientY) - this.startPrimary, s = this.axis.getCross(t.clientX, t.clientY) - this.startCross;
    if (this.lockedTo || (Math.abs(s) > Math.abs(e) && Math.abs(s) > this.axisLockThreshold ? this.lockedTo = "cross" : Math.abs(e) > this.axisLockThreshold && (this.lockedTo = "primary"), this.lockedTo && !this.axisLockFired && (this.axisLockFired = !0, console.log("[SwipeDetector] axislock", {
      lockedTo: this.lockedTo,
      dPrimary: e,
      dCross: s,
      threshold: this.axisLockThreshold
    }), this.emit("axislock", { axis: this.lockedTo }))), this.lockedTo !== "primary")
      return;
    t.cancelable && t.preventDefault();
    const n = this.startOffset + e * this.dragSensitivity, r = d(n, this.minScroll, this.maxScroll);
    console.log("[SwipeDetector] pointermove", {
      dPrimary: e,
      rawOffset: n,
      nextOffset: r,
      clamped: n !== r,
      minScroll: this.minScroll,
      maxScroll: this.maxScroll,
      transform: `translate3d(${r}px, 0, 0)`
    }), this.currentOffset = r, this.axis.setTranslate(this.content, r), this.pushSample(performance.now(), r), this.emit("dragmove", this.buildProgress());
  }
  onPointerUp(t) {
    if (!this.active || t.pointerId !== this.activePointerId || (this.active = !1, this.detachMoveListeners(), console.log("[SwipeDetector] pointerup", {
      lockedTo: this.lockedTo,
      currentOffset: this.currentOffset,
      contentTransform: this.content.style.transform
    }), this.lockedTo === "cross")) return;
    const e = this.computeVelocity(), s = Math.abs(e) > 0.1 ? this.currentOffset + e * 300 : this.currentOffset;
    this.emit("dragend", { ...this.buildProgress(), velocity: e }), this.animateTo(s);
  }
  detachMoveListeners() {
    window.removeEventListener("pointermove", this.onPointerMove), window.removeEventListener("pointerup", this.onPointerUp), window.removeEventListener("pointercancel", this.onPointerUp);
  }
  pushSample(t, e) {
    this.samples.push({ t, offset: e }), this.samples.length > 5 && this.samples.shift();
  }
  computeVelocity() {
    if (this.samples.length < 2) return 0;
    const t = this.samples[0], e = this.samples[this.samples.length - 1], s = e.t - t.t;
    return s <= 0 ? 0 : (e.offset - t.offset) / s;
  }
  animateTo(t) {
    const e = d(t, this.minScroll, this.maxScroll), s = this.currentOffset, n = e - s, r = performance.now();
    this.stopAnimation();
    const o = (c) => {
      const w = c - r, g = Math.min(w / this.easingDuration, 1), y = I(g);
      this.currentOffset = s + n * y, this.axis.setTranslate(this.content, this.currentOffset), this.emit("settle", this.buildProgress()), g < 1 ? this.rafId = requestAnimationFrame(o) : (this.rafId = 0, this.emit("settled", this.buildProgress()));
    };
    this.rafId = requestAnimationFrame(o);
  }
  stopAnimation() {
    this.rafId && cancelAnimationFrame(this.rafId), this.rafId = 0;
  }
}
class A {
  static lerp(t, e, s) {
    return t + (e - t) * s;
  }
  static map(t, e, s, n, r) {
    return s + (n - s) * ((r - t) / (e - t));
  }
  static clamp(t, e, s) {
    return Math.min(Math.max(s, t), e);
  }
}
class E {
  constructor(t, e) {
    this.context = t, this.options = e, this.started = !1, this.trackedEvents = /* @__PURE__ */ new Set(), this.trackingCtx = null, this.instructionsDismissed = !1, this.engagementFired = !1, this.log = S.enter("AIO");
  }
  start() {
    if (this.started)
      return;
    this.started = !0;
    const { screen: t } = this.context;
    if (t.hasAppearedAtLeastOnce || typeof t.once != "function") {
      this.init();
      return;
    }
    t.once("appeared", () => this.init());
  }
  init() {
    const t = this.context.screen.getNode(this.options.container), e = this.context.screen.find(this.options.instructionGroup), s = e?.getNode?.() ?? e?.node;
    if (console.log("[AIO] init nodes", {
      containerName: this.options.container,
      contentName: this.options.instructionGroup,
      container: t,
      contentView: e,
      content: s,
      sameNode: t === s,
      containerWidth: t?.offsetWidth,
      contentWidth: s?.getBoundingClientRect?.().width,
      containerRect: t?.getBoundingClientRect?.(),
      contentRect: s?.getBoundingClientRect?.()
    }), !t || !s) {
      console.log("[AIO] abort: container or content missing");
      return;
    }
    this.detector = u.horizontal(t, s, {
      dragSensitivity: this.options.dragSensitivity ?? 1,
      easingDuration: this.options.easingDuration ?? 600,
      // Celtra often sizes the strip to the viewport; real width is N sections.
      getBounds: () => {
        const n = t.offsetWidth || t.parentElement?.offsetWidth || 320, r = Math.max(1, this.options.sections), o = -((r - 1) * n);
        return console.log("[AIO] getBounds", { viewport: n, sections: r, min: o, max: 0 }), { min: o, max: 0 };
      }
    }), console.log("[AIO] detector ready", this.options), this.detector.on("dragstart", () => {
      this.instructionsDismissed = !1, this.engagementFired = !1;
    }), this.detector.on("dragmove", (n) => this.handleProgress(n)), this.detector.on("settle", (n) => this.handleProgress(n)), this.trackingCtx = new ActionContext(this.context.screen, {
      certainlyNotCausedByUserBehavior: !1,
      consideredUserInitiatedByBrowser: !1
    });
  }
  destroy() {
    this.detector?.destroy();
  }
  handleProgress(t) {
    console.log("SWIPE PROGRESS*****:", t), this.syncScene(t.percent), this.maybeDismissInstructions(t.offset), this.maybeFireEngagement(t.offset), this.trackScrollEvents(t);
  }
  syncScene(t) {
    const e = this.context.screen.find(this.options.scene);
    if (console.log("SWIPE SCENE*****:", e), !e)
      throw new Error(`Scene "${this.options.scene}" not found`);
    e?.renderAtProgress?.(t * 100);
  }
  maybeDismissInstructions(t) {
    if (console.log("SWIPE MAYBE DISMISS INSTRUCTIONS*****:", t), this.instructionsDismissed || t < this.options.instructionThreshold) return;
    this.instructionsDismissed = !0;
    const e = this.context.screen.find(this.options.instructionScene);
    if (!e)
      throw new Error(`Scene "${this.options.instructionScene}" not found`);
    e?.stopSceneAction?.(this.trackingCtx, {}, () => {
    }), e?.resetSceneAction?.(this.trackingCtx, {}, () => {
    });
    const s = this.context.screen.find(this.options.instructionGroup);
    console.log("SWIPE GROUP*****:", s), s?.hideAction?.(this.trackingCtx, {}, () => {
    });
  }
  maybeFireEngagement(t) {
    this.engagementFired || t < this.options.engagementThreshold || (this.engagementFired = !0);
  }
  trackScrollEvents({ offset: t, max: e, viewport: s }) {
    t <= 5 && this.trackOnce("user_scrolled_to_left_edge"), t >= e - 5 && this.trackOnce("user_scrolled_to_right_edge"), t > 50 && this.trackOnce("user_scrolled_left"), t < e - 50 && this.trackedEvents.has("user_scrolled_to_right_edge") && this.trackOnce("user_scrolled_right");
    const n = A.clamp(Math.round(t / s) + 1, 1, this.options.sections);
    this.trackOnce(`user_scrolled_to_item${n}`);
  }
  trackOnce(t) {
    this.trackedEvents.has(t) || (this.trackedEvents.add(t), console.log("TRACKING:", t), Creative && this.trackingCtx && Creative.trackCustomEventAction(this.trackingCtx, { name: t }, () => {
    }));
  }
}
class M extends m {
  constructor() {
    super(...arguments), this.name = "AIO", this.defaultConfig = C;
  }
  create(t, e) {
    return new E(t, e);
  }
}
const B = (i) => new M().init(i);
export {
  B as setup
};
