/*! Copyright Mobkoi 2026 (v5.5.1) */
const R = {
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
class C {
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
    return this.add(new C(t));
  }
  add(t) {
    return t.parent = this, t;
  }
}
const F = new C("MOBKOI"), P = F.enter("Celtra");
function b(n) {
  return !!(n && typeof n.find == "function");
}
function u(n) {
  return globalThis[n];
}
class D {
  resolve(t = {}) {
    const e = this.resolveCreative(t.creative);
    if (!e)
      throw new Error('Celtra context: "creative" not found');
    const s = this.resolveScreen(e, t.screen);
    if (!s)
      throw new Error('Celtra context: "screen" is missing or not a Celtra screen');
    const i = this.resolveUnit(e, t.unit, s);
    if (!i)
      throw new Error('Celtra context: "unit" not found');
    const r = this.resolveCtx(t.ctx, s);
    return { creative: e, unit: i, screen: s, ctx: r };
  }
  resolveCreative(t) {
    return t ?? u("creative");
  }
  resolveScreen(t, e) {
    if (b(e))
      return e;
    if (typeof t?.getScreen == "function") {
      const i = t.getScreen();
      if (b(i))
        return i;
    }
    const s = u("screen");
    return b(s) ? s : void 0;
  }
  resolveUnit(t, e, s) {
    return e ?? t?.getUnit?.() ?? s?.getUnit?.() ?? u("unit");
  }
  resolveCtx(t, e) {
    const s = t ?? u("ctx") ?? u("mbkCtx");
    return s || !e || typeof ActionContext > "u" ? s : new ActionContext(e, {
      certainlyNotCausedByUserBehavior: !1,
      consideredUserInitiatedByBrowser: !1
    });
  }
}
const j = new D();
class f {
  static deepMerge(t, e) {
    const s = { ...t };
    for (const i of Object.keys(e)) {
      const r = e[i], c = t[i];
      r !== void 0 && (f.isPlainObject(c) && f.isPlainObject(r) ? s[i] = f.deepMerge(
        c,
        r
      ) : s[i] = r);
    }
    return s;
  }
  static isPlainObject(t) {
    return typeof t == "object" && t !== null && !Array.isArray(t) && Object.getPrototypeOf(t) === Object.prototype;
  }
}
const g = class g {
  constructor() {
    this.contextResolver = j;
  }
  init(t) {
    const e = P.enter(this.name), s = this.contextResolver.resolve(t), i = s.unit ?? s.screen, r = g.registry.get(i);
    if (r)
      return e.debug(`${this.name} already initialized`), r;
    const c = f.deepMerge(this.defaultConfig, t), d = this.create(s, c);
    return g.registry.set(i, d), d.start(), d;
  }
};
g.registry = /* @__PURE__ */ new WeakMap();
let E = g;
const O = (n) => {
  const t = n.style.transform || getComputedStyle(n).transform || "", e = t.match(/translate3d\(\s*(-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px/i);
  if (e) return { x: parseFloat(e[1] ?? "0"), y: parseFloat(e[2] ?? "0") };
  const s = t.match(/translate\(\s*(-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px/i);
  if (s) return { x: parseFloat(s[1] ?? "0"), y: parseFloat(s[2] ?? "0") };
  const i = t.match(/matrix\(([^)]+)\)/i);
  if (i) {
    const r = (i[1] ?? "").split(",").map((c) => parseFloat(c.trim()));
    return { x: r[4] ?? 0, y: r[5] ?? 0 };
  }
  return { x: 0, y: 0 };
}, S = {
  name: "horizontal",
  defaultTouchAction: "pan-y",
  // let vertical page-scroll pass through natively
  getPrimary: (n) => n,
  getCross: (n, t) => t,
  getTranslate: (n) => O(n).x,
  setTranslate: (n, t) => {
    n.style.transform = `translate3d(${t}px, 0, 0)`;
  },
  measureViewport: (n) => n.offsetWidth || n.parentElement?.offsetWidth || 320,
  measureContent: (n) => n.getBoundingClientRect().width
}, z = {
  name: "vertical",
  defaultTouchAction: "pan-x",
  // let horizontal scroll pass through natively
  getPrimary: (n, t) => t,
  getCross: (n) => n,
  getTranslate: (n) => O(n).y,
  setTranslate: (n, t) => {
    n.style.transform = `translate3d(0, ${t}px, 0)`;
  },
  measureViewport: (n) => n.offsetHeight || n.parentElement?.offsetHeight || 320,
  measureContent: (n) => n.getBoundingClientRect().height
};
class V {
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
const q = (n) => Math.pow(n - 1, 3) + 1, p = (n, t, e) => Math.min(Math.max(n, t), e);
class m extends V {
  constructor(t, e, s = {}) {
    super(), this.active = !1, this.startPrimary = 0, this.startCross = 0, this.startOffset = 0, this.currentOffset = 0, this.lockedTo = null, this.axisLockFired = !1, this.minScroll = 0, this.maxScroll = 0, this.viewportSize = 0, this.samples = [], this.rafId = 0, this.activePointerId = null, this.container = t, this.content = e, this.axis = s.axis ?? S, this.dragSensitivity = s.dragSensitivity ?? 1, this.easingDuration = s.easingDuration ?? 600, this.axisLockThreshold = s.axisLockThreshold ?? 10, this.getBoundsOverride = s.getBounds, this.getViewportSize = s.getViewportSize, this.container.style.touchAction = s.touchAction ?? this.axis.defaultTouchAction, this.content.style.willChange = "transform", this.onPointerDown = this.onPointerDown.bind(this), this.onPointerMove = this.onPointerMove.bind(this), this.onPointerUp = this.onPointerUp.bind(this), this.recalculateBounds(), this.enable();
  }
  /** Convenience factory: `SwipeDetector.horizontal(container, content, options)`. */
  static horizontal(t, e, s = {}) {
    return new m(t, e, { ...s, axis: S });
  }
  /** Convenience factory: `SwipeDetector.vertical(container, content, options)`. */
  static vertical(t, e, s = {}) {
    return new m(t, e, { ...s, axis: z });
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
    if (this.viewportSize = this.getViewportSize?.() ?? this.axis.measureViewport(this.container), t) {
      this.minScroll = t.min, this.maxScroll = t.max;
      return;
    }
    const e = this.axis.measureContent(this.content);
    this.maxScroll = 0, this.minScroll = Math.min(0, -(e - this.viewportSize));
  }
  /** Animates to a given 0-based index, assuming `sectionCount` equal-size sections. */
  scrollToIndex(t, e) {
    if (e <= 0) return;
    const s = p(t, 0, e - 1), i = Math.max(e - 1, 1), r = this.minScroll * (s / i);
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
      percent: e > 0 ? p(t / e, 0, 1) : 0
    };
  }
  onPointerDown(t) {
    t.pointerType === "mouse" && t.button !== 0 || (this.stopAnimation(), this.recalculateBounds(), this.active = !0, this.lockedTo = null, this.axisLockFired = !1, this.activePointerId = t.pointerId, this.startPrimary = this.axis.getPrimary(t.clientX, t.clientY), this.startCross = this.axis.getCross(t.clientX, t.clientY), this.currentOffset = this.axis.getTranslate(this.content), this.startOffset = this.currentOffset, this.samples = [], this.pushSample(performance.now(), this.currentOffset), this.emit("dragstart", { offset: this.currentOffset }), window.addEventListener("pointermove", this.onPointerMove), window.addEventListener("pointerup", this.onPointerUp), window.addEventListener("pointercancel", this.onPointerUp));
  }
  onPointerMove(t) {
    if (!this.active || t.pointerId !== this.activePointerId) return;
    const e = this.axis.getPrimary(t.clientX, t.clientY) - this.startPrimary, s = this.axis.getCross(t.clientX, t.clientY) - this.startCross;
    if (this.lockedTo || (Math.abs(s) > Math.abs(e) && Math.abs(s) > this.axisLockThreshold ? this.lockedTo = "cross" : Math.abs(e) > this.axisLockThreshold && (this.lockedTo = "primary"), this.lockedTo && !this.axisLockFired && (this.axisLockFired = !0, this.emit("axislock", { axis: this.lockedTo }))), this.lockedTo !== "primary")
      return;
    t.cancelable && t.preventDefault();
    const i = this.startOffset + e * this.dragSensitivity, r = p(i, this.minScroll, this.maxScroll);
    this.currentOffset = r, this.axis.setTranslate(this.content, r), this.pushSample(performance.now(), r), this.emit("dragmove", this.buildProgress());
  }
  onPointerUp(t) {
    if (!this.active || t.pointerId !== this.activePointerId || (this.active = !1, this.detachMoveListeners(), this.lockedTo === "cross")) return;
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
    const e = p(t, this.minScroll, this.maxScroll), s = this.currentOffset, i = e - s, r = performance.now();
    this.stopAnimation();
    const c = (d) => {
      const M = d - r, A = Math.min(M / this.easingDuration, 1), U = q(A);
      this.currentOffset = s + i * U, this.axis.setTranslate(this.content, this.currentOffset), this.emit("settle", this.buildProgress()), A < 1 ? this.rafId = requestAnimationFrame(c) : (this.rafId = 0, this.emit("settled", this.buildProgress()));
    };
    this.rafId = requestAnimationFrame(c);
  }
  stopAnimation() {
    this.rafId && cancelAnimationFrame(this.rafId), this.rafId = 0;
  }
}
class N {
  static lerp(t, e, s) {
    return t + (e - t) * s;
  }
  static map(t, e, s, i, r) {
    return s + (i - s) * ((r - t) / (e - t));
  }
  static clamp(t, e, s) {
    return Math.min(Math.max(s, t), e);
  }
}
class $ {
  constructor(t) {
    this.scope = t.scope, this.userInitiated = t.userInitiated;
  }
}
class L extends $ {
  constructor(t, e) {
    super(t), this.actionContext = e;
  }
}
class I {
  constructor(t) {
    this.name = "celtra", this.log = t.enter("MbkCeltraChannel");
  }
  static actionContextOf(t) {
    return t instanceof L ? t.actionContext : void 0;
  }
  emit(t, e) {
    if (!t.legacyEvent)
      return !1;
    const s = typeof Creative < "u" ? Creative : void 0;
    if (typeof s?.trackCustomEventAction != "function")
      return this.log.debug("Creative API unavailable, no Celtra event for", t.legacyEvent), !1;
    const i = I.actionContextOf(e);
    if (!i)
      return this.log.warn("No ActionContext on the cause of", t.legacyEvent), !1;
    const r = t.legacyEvent;
    return s.trackCustomEventAction(i, { name: r }, () => this.log.debug("Celtra event accepted:", r)), !0;
  }
}
class K {
  constructor(t, e, s) {
    this.key = t, this.initiator = s, this.log = e.enter(`MbkCeltraContexts(${t})`);
  }
  /** Completes what the contexts are built from, when the script registers again. */
  useInitiator(t) {
    t && (this.initiator = t);
  }
  /**
   * The context for a cause of that nature: a fresh one when the cause is a user gesture, the
   * memoised passive one otherwise. See the class documentation for why they differ.
   */
  forCause(t) {
    if (t)
      return this.create(!0);
    const e = this.passive;
    if (e)
      return e;
    const s = this.create(!1);
    return s && (this.passive = s), s;
  }
  create(t) {
    const e = globalThis, s = this.initiator ?? e.screen ?? e.unit;
    if (typeof e.ActionContext == "function" && s)
      try {
        return new e.ActionContext(s, {
          certainlyNotCausedByUserBehavior: !t,
          consideredUserInitiatedByBrowser: t
        });
      } catch (i) {
        this.log.warn("Could not create an ActionContext, falling back to the ambient one", i);
      }
    return e.mbkCtx ?? e.ctx;
  }
}
class a {
  /** Dictionary key of a kind, by value: `"view:panel"`. */
  static of(t) {
    return `${t.verb}:${t.role}`;
  }
  /**
   * Deduplication key of one occurrence: everything that identifies it, minus what the library
   * derives, which is the timestamp.
   *
   * A `legacyEvent` counts when the call site supplied one, because it is then part of what the
   * signal says — for a `legacy` signal it is the only thing distinguishing two of them. It is
   * computed before resolution, so a resolved name never reaches here.
   *
   * The emitting script is deliberately not part of it, because deduplication is global to the
   * creative rather than per script.
   */
  static signature(t) {
    return [
      a.of(t),
      a.instance(t),
      a.path(t.scope),
      t.percent,
      t.from,
      t.to,
      t.completed,
      t.mode,
      t.legacyEvent
    ].map((s) => s === void 0 ? "" : String(s)).join("|");
  }
  /**
   * What the signal is about: the role, which instance, and where. Everything but what happened to
   * it, which is the verb and the values.
   *
   * This is what a state is keyed on: two players hold two independent states, and a `play` followed
   * by a `pause` is one subject changing rather than two things happening.
   */
  static subject(t) {
    return [t.role, a.instance(t), a.path(t.scope)].join("|");
  }
  /** `"2"`, `"vidPlayer1"`, or `""` for a singleton such as the unit. */
  static instance(t) {
    return t.index !== void 0 ? String(t.index) : t.name ?? "";
  }
  /** Containment as one string, outermost first: `"panel:2>section:3"`. */
  static path(t) {
    const e = [];
    for (let s = t; s; s = s.scope) {
      const i = a.instance(s);
      e.unshift(i ? `${s.role}:${i}` : s.role);
    }
    return e.join(">");
  }
}
class o {
  /** Query parameters for one signal. Undefined values are omitted rather than sent empty. */
  static of(t, e) {
    const s = { k: t.verb, vs1: t.role };
    return o.set(s, "vs2", t.legacyEvent), o.set(s, "vs3", t.name), o.set(s, "vs4", a.path(t.scope) || void 0), o.set(s, "vs5", t.mode), o.set(s, "vi1", t.index), o.set(s, "vi2", t.ms), o.set(s, "vi3", t.from), o.set(s, "vi4", t.to), o.set(s, "vi5", t.completed === void 0 ? void 0 : Number(t.completed)), o.set(s, "vf1", t.percent), o.set(s, "vf2", t.modeMs), o.set(s, "iid", e), s;
  }
  static toQueryString(t) {
    return Object.keys(t).map((e) => `${encodeURIComponent(e)}=${encodeURIComponent(String(t[e]))}`).join("&");
  }
  /**
   * The URL both the beacon and the pixel send to.
   *
   * A `{{event}}` placeholder is substituted with the resolved Celtra event name, on the model of
   * the existing `externalVideoTrackerURI`, so an endpoint already shaped that way keeps working.
   */
  static url(t, e, s) {
    const i = t.includes("{{event}}") ? t.replace("{{event}}", encodeURIComponent(e.legacyEvent ?? e.verb)) : t, r = i.includes("?") ? "&" : "?";
    return `${i}${r}${o.toQueryString(o.of(e, s))}`;
  }
  static set(t, e, s) {
    s != null && s !== "" && (t[e] = s);
  }
}
const l = class l {
  constructor(t) {
    this.options = t;
  }
  get endpoint() {
    return this.options.endpoint ?? this.runtimeParam(l.endpointParam);
  }
  get errorEndpoint() {
    return this.options.errorEndpoint ?? this.runtimeParam(l.errorEndpointParam);
  }
  get impressionId() {
    return this.options.impressionId ? this.options.impressionId : (typeof creative < "u" ? creative : void 0)?.sessionId;
  }
  get pixelFallback() {
    return this.options.pixelFallback ?? l.defaults.pixelFallback;
  }
  get log() {
    return this.options.log ?? l.defaults.log();
  }
  /** Completes the configuration in place. Later values win, undefined ones leave the current one. */
  update(t) {
    const e = Object.keys(t).reduce((s, i) => {
      const r = t[i];
      return r !== void 0 && (s[i] = r), s;
    }, {});
    this.options = { ...this.options, ...e };
  }
  runtimeParam(t) {
    const s = (typeof creative < "u" ? creative : void 0)?.runtimeParams?.[t];
    return typeof s == "string" && s ? s : void 0;
  }
};
l.endpointParam = "externalSignalTrackerURI", l.errorEndpointParam = "externalClientErrorURI", l.defaults = {
  pixelFallback: !0,
  log: () => new C("mbk")
};
let v = l;
class W {
  constructor(t, e) {
    this.config = t, this.name = "beacon", this.log = e.enter("MbkBeaconChannel");
  }
  emit(t) {
    const e = this.config.endpoint;
    if (!e)
      return this.log.debug(`No ${v.endpointParam}, raw signal not sent`), !1;
    const s = globalThis.navigator?.sendBeacon;
    if (typeof s != "function")
      return this.log.debug("sendBeacon unavailable"), !1;
    const i = o.url(e, t, this.config.impressionId), r = s.call(globalThis.navigator, i);
    return this.log.debug(r ? "queued" : "refused", i), r;
  }
}
const T = class T {
};
T.mapping = [
  { kind: { verb: "click", role: "cta" }, legacyEvent: () => "clickSite" },
  { kind: { verb: "click", role: "unit" }, legacyEvent: () => "clickSite" }
];
let k = T;
class B {
  constructor(t, e, s) {
    this.key = e, this.resolvers = /* @__PURE__ */ new Map(), this.log = t.enter(`MbkLegacyEvents(${e})`), this.declare(s);
  }
  /** Adds or replaces resolvers. Later declaration wins for the same kind. */
  declare(t) {
    for (const e of t) {
      if (!e?.kind || typeof e.legacyEvent != "function") {
        this.log.warn("Ignoring malformed legacy mapping", e);
        continue;
      }
      this.resolvers.set(a.of(e.kind), e.legacyEvent);
    }
    return this;
  }
  has(t) {
    return this.resolvers.has(a.of(t));
  }
  /**
   * @returns the Celtra event name for this signal, or `undefined` when no resolver is registered
   *   for its kind or when the registered one threw.
   */
  resolve(t) {
    const e = this.resolvers.get(a.of(t));
    if (e)
      try {
        const { legacyEvent: s, ...i } = t, r = e(i);
        if (typeof r != "string" || !r) {
          this.log.warn(`Resolver for ${a.of(t)} produced no name`, r);
          return;
        }
        return r;
      } catch (s) {
        this.log.warn(`Resolver for ${a.of(t)} failed, no Celtra event emitted`, s);
        return;
      }
  }
}
class X {
  constructor(t, e) {
    this.config = t, this.name = "pixel", this.pending = /* @__PURE__ */ new Set(), this.log = e.enter("MbkPixelChannel");
  }
  emit(t) {
    const e = this.config.endpoint;
    if (!e)
      return !1;
    if (typeof Image != "function")
      return this.log.debug("Image unavailable"), !1;
    const s = o.url(e, t, this.config.impressionId), i = new Image();
    this.pending.add(i);
    const r = () => this.pending.delete(i);
    return i.onload = r, i.onerror = r, i.src = s, this.log.debug("sent", s), !0;
  }
}
class Y {
  constructor(t, e) {
    this.config = t, this.log = e.enter("MbkTrackErrorReporter");
  }
  report(t, e, s) {
    this.log.warn(`Channel "${t}" failed for ${a.of(e)}`, s);
    const i = this.config.errorEndpoint;
    if (i)
      try {
        const r = [
          `error=${encodeURIComponent(`mbkTrack:${t}`)}`,
          `reason=${encodeURIComponent(String(s?.message ?? s))}`,
          `k=${encodeURIComponent(e.verb)}`
        ], c = this.config.impressionId;
        c && r.push(`iid=${encodeURIComponent(c)}`);
        const d = `${i}${i.includes("?") ? "&" : "?"}${r.join("&")}`;
        globalThis.navigator?.sendBeacon?.(d);
      } catch (r) {
        this.log.debug("Could not report the channel failure", r);
      }
  }
}
const h = class h {
  constructor(t) {
    this.tracks = /* @__PURE__ */ new Map(), this.emitted = /* @__PURE__ */ new Set(), this.states = /* @__PURE__ */ new Map(), this.config = new v(t), this.log = this.config.log.enter("MbkImpression"), this.startedAt = h.now(), this.beacon = new W(this.config, this.log), this.pixel = new X(this.config, this.log), this.reporter = new Y(this.config, this.log), this.coreLegacyEvents = new B(this.log, "core", k.mapping);
  }
  /** The one impression of this creative, created on first use. */
  static shared(t) {
    const e = h.storage(), s = e[h.storageKey];
    if (s)
      return s.configure(t), s;
    const i = new h(t);
    return e[h.storageKey] = i, i;
  }
  /** Drops it. For tests, and for a creative that reloads its scripts. */
  static reset() {
    delete h.storage()[h.storageKey];
  }
  /**
   * Stash on `unit` when available, else on the window, following the precedent set by
   * `CpxTracker.getStorageObject()`.
   */
  static storage() {
    const t = globalThis;
    return t.unit ? t.unit : (t[h.windowStorageKey] || (t[h.windowStorageKey] = {}), t[h.windowStorageKey]);
  }
  static now() {
    const t = globalThis.performance;
    return typeof t?.now == "function" ? t.now() : Date.now();
  }
  /** Completes the configuration. Later values win. */
  configure(t) {
    this.config.update(t);
  }
  /**
   * The track of one script, created on first use.
   *
   * Scripts are identified by their key, so two instances of one template script get the same track,
   * hence the same dictionary and the same contexts.
   *
   * @throws when the same key was already taken by a track of another kind, which would mean two
   *   instances of one script disagreeing on which specialisation they run under.
   */
  track(t, e, s) {
    const i = this.tracks.get(t);
    if (i) {
      if (!(i instanceof s))
        throw new Error(
          `MbkTrack: script "${t}" is already tracked as a ${i.constructor.name}, not a ${s.name}. Every instance of one script must pick the same specialisation.`
        );
      return i;
    }
    const r = e();
    return this.tracks.set(t, r), r;
  }
  /**
   * Marks the start of the impression, which every timestamp is relative to.
   *
   * Called implicitly at construction. Call it explicitly from the first `appeared` the creative
   * sees if that is a better origin; it is ignored once signals have been emitted, so the clock
   * cannot move under data already sent.
   */
  markStart() {
    return this.emitted.size > 0 || this.states.size > 0 ? (this.log.debug("Impression start not moved: signals were already emitted"), !1) : (this.startedAt = h.now(), !0);
  }
  /** Milliseconds since the start of the impression. */
  elapsedMs() {
    return Math.round(h.now() - this.startedAt);
  }
  /**
   * Clears deduplication for one media player so a new DOM instance can re-emit quartiles and
   * play/pause states after Celtra swaps the <video> on in-creative page navigation.
   */
  forgetMedia(t) {
    const e = `:media|${t}|`, s = `media|${t}`;
    for (const i of [...this.emitted])
      i.includes(e) && this.emitted.delete(i);
    for (const i of [...this.states.keys()])
      i.startsWith(s) && this.states.delete(i);
  }
  /**
   * Whether this signal goes out under that emission, recording what it needs to for the next one.
   *
   * Everything is recorded **synchronously**, before any channel: this is the CustomWipeable defect,
   * where the flag was pushed inside the asynchronous tracking callback so two calls could both pass.
   */
  admits(t, e) {
    const s = a.signature(t);
    switch (e) {
      case "repeated":
        return !0;
      case "once":
        return this.emitted.has(s) ? (this.log.debug("Already emitted, skipping", s), !1) : (this.emitted.add(s), !0);
      case "state": {
        const i = a.subject(t);
        return this.states.get(i) === s ? (this.log.debug("Unchanged, skipping", s), !1) : (this.states.set(i, s), !0);
      }
    }
  }
  /** The raw channels: the beacon, then the image pixel when the beacon did not take it. */
  emitRaw(t, e) {
    !this.send(this.beacon, t, e) && this.config.pixelFallback && this.send(this.pixel, t, e);
  }
  /** One channel, isolated: it can fail without touching the others. */
  send(t, e, s) {
    try {
      return t.emit(e, s);
    } catch (i) {
      return this.reporter.report(t.name, e, i), !1;
    }
  }
};
h.storageKey = "mbkImpression", h.windowStorageKey = "__mbkTrackStorage";
let x = h;
class w {
  constructor(t, e) {
    this.impression = t, this.key = e, this.log = t.log.enter(`${this.constructor.name}(${e})`), this.legacyEvents = new B(this.log, e, []);
  }
  /**
   * The track of that script, created on first use, completed with its dictionary.
   *
   * The instance is read and dropped: nothing here keeps a reference to a partially constructed
   * object.
   */
  static shared(t, e) {
    const s = x.shared(e);
    return s.track(t.trackingKey, () => new w(s, t.trackingKey), w).declare(t.legacyEventsMapping);
  }
  /** Adds this script's Celtra event names. A later declaration wins for the same kind. */
  declare(t) {
    return this.legacyEvents.declare(t), this;
  }
  /** A context of the kind this specialisation builds: what caused the signals, and where. */
  context(t) {
    return new $(t);
  }
  /** An occurrence: at most one per distinct value, for the whole impression. */
  once(t, e) {
    this.emit(t, e, "once");
  }
  /** An occurrence where every one counts. */
  repeated(t, e) {
    this.emit(t, e, "repeated");
  }
  /**
   * Reports the subject's state, which goes out only when it differs from the last one reported.
   *
   * The call site reports what is true now, every time, and does not have to know whether that is
   * news: a video already playing that reports playing again has not started twice, and a panel
   * already at 50% that reports 50% again has not crossed anything. `A, B, A` goes out three times,
   * because the subject genuinely changed three times.
   */
  state(t, e) {
    this.emit(t, e, "state");
  }
  /** Resolves the signal, stamps it, and hands it to the channels if the emission admits it. */
  emit(t, e, s) {
    const i = { ...t, ms: this.impression.elapsedMs() };
    !i.scope && e.scope && (i.scope = e.scope), this.impression.admits(i, s) && (i.legacyEvent = t.legacyEvent ?? this.resolveLegacyEvent(i), this.log.debug("emit", i), this.emitChannels(i, e));
  }
  /**
   * The raw channels of the impression.
   *
   * A specialisation adds its own by overriding this and calling `super`, which is how
   * {@link MbkCeltraTrack} fires the legacy Celtra event first.
   */
  emitChannels(t, e) {
    this.impression.emitRaw(t, e);
  }
  /**
   * This script's dictionary first, then the small core set common to every creative.
   *
   * @returns `undefined` when nothing resolves, in which case the raw signal is emitted alone. We
   *   never invent a name: a spurious legacy event would appear in reporting that nobody configured
   *   at placement level.
   */
  resolveLegacyEvent(t) {
    if (t.verb === "legacy") {
      this.log.warn("A legacy signal must carry its legacyEvent", t);
      return;
    }
    const e = this.legacyEvents.resolve(t) ?? this.impression.coreLegacyEvents.resolve(t);
    return e || this.log.debug(`No resolver for ${a.of(t)}, raw signal only`), e;
  }
}
class y extends w {
  /**
   * @throws when the same script is already tracked as a plain {@link MbkTrack}. See
   *   {@link MbkImpression.track}.
   */
  static shared(t, e) {
    const s = x.shared(e);
    return s.track(
      t.trackingKey,
      () => new y(s, t.trackingKey, e.initiator),
      y
    ).declare(t.legacyEventsMapping);
  }
  constructor(t, e, s) {
    super(t, e), this.contexts = new K(e, this.log, s), this.celtra = new I(this.log);
  }
  /**
   * A Celtra context, carrying the `ActionContext` this cause's legacy events are fired with: the
   * one the call site forwarded from its handler, else a fresh user-initiated one when the cause is
   * a gesture, else this script's common passive one.
   */
  context(t) {
    const e = t.actionContext ?? this.contexts.forCause(t.userInitiated);
    return new L(t, e);
  }
  /** The legacy event first, unchanged, then the raw channels. */
  emitChannels(t, e) {
    this.impression.send(this.celtra, t, e), super.emitChannels(t, e);
  }
}
class G {
  constructor(t, e, s) {
    this.context = t, this.options = e, this.scriptName = s, this.trackingKey = "aio", this.legacyEventsMapping = [], this.unitLegacy = { verb: "legacy", role: "unit" }, this.started = !1, this.trackingCtx = null, this.instructionsDismissed = !1, this.engagementFired = !1, this.reachedRightEdge = !1, this.log = P.enter(this.scriptName), this.track = y.shared(this, {});
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
    this.log.debug("initializing");
    const t = this.requireView(this.options.container), e = this.requireView(this.options.content);
    this.scene = this.requireView(this.options.scene);
    const s = this.requireNode(t, this.options.container), i = this.requireNode(e, this.options.content), r = this.screen.node;
    this.detector = m.horizontal(s, i, {
      dragSensitivity: this.options.dragSensitivity,
      easingDuration: this.options.easingDuration,
      getViewportSize: () => r?.offsetWidth || s.parentElement?.offsetWidth || i.offsetWidth
    }), this.detector.on("dragstart", () => {
      this.instructionsDismissed = !1, this.engagementFired = !1;
    }), this.detector.on("dragmove", (c) => this.handleProgress(c)), this.detector.on("settle", (c) => this.handleProgress(c)), this.trackingCtx = this.context.ctx ?? new ActionContext(this.screen, {
      certainlyNotCausedByUserBehavior: !1,
      consideredUserInitiatedByBrowser: !1
    }), this.swipe = this.track.context({
      scope: void 0,
      userInitiated: !0,
      actionContext: this.trackingCtx
    });
  }
  get screen() {
    return this.context.screen;
  }
  requireView(t) {
    const e = this.screen.find(t);
    if (!e)
      throw new Error(`"${t}" not found`);
    return e;
  }
  requireNode(t, e) {
    if (!t.node)
      throw new Error(`"${e}" DOM node not found`);
    return t.node;
  }
  destroy() {
    this.detector?.destroy();
  }
  handleProgress(t) {
    this.syncScene(t.percent), this.maybeDismissInstructions(t.offset), this.maybeFireEngagement(t.offset), this.trackScrollEvents(t);
  }
  syncScene(t) {
    this.scene.renderAtProgress?.(t * 100);
  }
  maybeDismissInstructions(t) {
    if (this.instructionsDismissed || t < this.options.instructionThreshold) return;
    this.instructionsDismissed = !0;
    const e = this.requireView(this.options.instructionScene);
    e.stopSceneAction?.(this.trackingCtx, {}, () => {
    }), e.resetSceneAction?.(this.trackingCtx, {}, () => {
    }), this.requireView(this.options.instructionGroup).hideAction(this.trackingCtx, {}, () => {
    });
  }
  maybeFireEngagement(t) {
    this.engagementFired || t < this.options.engagementThreshold || (this.engagementFired = !0, !this.context.creative.getUserInteracted() && this.logger("user_engaged"));
  }
  trackScrollEvents({ offset: t, max: e, viewport: s }) {
    t <= this.options.edgeTolerance && this.logger("user_scrolled_to_left_edge"), t >= e - this.options.edgeTolerance && (this.reachedRightEdge = !0, this.logger("user_scrolled_to_right_edge")), t > this.options.directionTolerance && this.logger("user_scrolled_left"), t < e - this.options.directionTolerance && this.reachedRightEdge && this.logger("user_scrolled_right");
    const i = N.clamp(Math.round(t / s) + 1, 1, this.options.sections);
    this.logger(`user_scrolled_to_item${i}`);
  }
  logger(t) {
    this.track.once({ ...this.unitLegacy, legacyEvent: t }, this.swipe);
  }
}
class H extends E {
  constructor() {
    super(...arguments), this.name = "AIO", this.defaultConfig = R;
  }
  create(t, e) {
    return new G(t, e, this.name);
  }
}
const Q = (n) => new H().init(n);
export {
  Q as setup
};
