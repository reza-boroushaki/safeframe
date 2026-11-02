/*! Copyright Mobkoi 2026 (v5.5.1) */
const M = {
  conditions: {
    mode: "all",
    items: [{ type: "viewed", phase: "phase-1", operator: "gte", value: 1 }]
  }
}, B = {
  conditions: {
    mode: "all",
    items: [{ type: "viewed", phase: "phase-2", operator: "gte", value: 1 }]
  }
}, D = {
  fallbackPhaseId: "phase-1",
  storage: {
    mode: "local",
    ttlDays: 45
  },
  viewability: {
    enabled: !0,
    minPercent: 50,
    minDurationMs: 1e3,
    requireViewable: !0
  },
  phases: [
    {
      id: "phase-1",
      order: 1,
      target: { pageName: "p1" },
      activation: null
    },
    {
      id: "phase-2",
      order: 2,
      target: { pageName: "p2" },
      activation: M
    },
    {
      id: "phase-3",
      order: 3,
      target: { pageName: "p3" },
      activation: B
    }
  ]
};
class q {
  constructor(t) {
    this.log = t.enter("SafeFrameUtil");
  }
  check() {
    const t = {}, e = typeof window < "u" && window.location && typeof window.location.href == "string" ? window.location.href : "", i = typeof creative < "u" && creative?.adapter && creative.adapter.safeFrameDetected || !1, s = /googlesyndication/i.test(e) || /safeframe/i.test(e);
    if (t.detected = !!(i || s), typeof window < "u")
      try {
        t.apiObject = typeof window.$sf < "u" ? window.$sf : window.parent.$sf;
      } catch (r) {
        this.log.debug("SafeFrameUtil", "cannot access window.parent.$sf", r), t.apiObject = typeof window.$sf < "u" ? window.$sf : void 0;
      }
    else
      t.apiObject = void 0;
    return t.usable = t.apiObject && t.apiObject.ext && (typeof t.apiObject.ext.inViewPercentage == "function" || typeof t.apiObject.ext.geom == "function"), t.passed = t.detected && t.apiObject && t.usable, t;
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
    } catch (t) {
      return this.log.debug("SafeFrameUtil", "no apiExists", t), !1;
    }
  }
  configExists() {
    try {
      const t = window.sf_ || window.parent.sf_;
      return typeof t == "object" && t.cfg && typeof t.cfg.reportCreativeGeometry < "u" ? "true-geom:" + t.cfg.reportCreativeGeometry : typeof t == "object";
    } catch (t) {
      return this.log.debug("SafeFrameUtil", "no configExists", t), !1;
    }
  }
}
class E {
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
    return this.add(new E(t));
  }
  add(t) {
    return t.parent = this, t;
  }
}
const K = new E("MOBKOI");
class k extends Error {
  constructor(t, e = void 0) {
    super(t), this.name = new.target.name, this.cause = typeof e == "string" ? new k(e, void 0) : e;
  }
  toString() {
    return super.toString() + (this.cause ? `
	because of:
` + this.cause.toString() : "");
  }
}
const F = K.enter("Celtra");
class g extends k {
}
function C(n) {
  return !!(n && typeof n.find == "function");
}
function f(n) {
  return globalThis[n];
}
class z {
  resolve(t = {}) {
    const e = this.resolveCreative(t.creative);
    if (!e)
      throw new g('Celtra context: "creative" not found');
    const i = this.resolveScreen(e, t.screen);
    if (!i)
      throw new g('Celtra context: "screen" is missing or not a Celtra screen');
    const s = this.resolveUnit(e, t.unit, i);
    if (!s)
      throw new g('Celtra context: "unit" not found');
    const r = this.resolveCtx(t.ctx, i);
    return { creative: e, unit: s, screen: i, ctx: r };
  }
  resolveCreative(t) {
    return t ?? f("creative");
  }
  resolveScreen(t, e) {
    if (C(e))
      return e;
    if (typeof t?.getScreen == "function") {
      const s = t.getScreen();
      if (C(s))
        return s;
    }
    const i = f("screen");
    return C(i) ? i : void 0;
  }
  resolveUnit(t, e, i) {
    return e ?? t?.getUnit?.() ?? i?.getUnit?.() ?? f("unit");
  }
  resolveCtx(t, e) {
    const i = t ?? f("ctx") ?? f("mbkCtx");
    return i || !e || typeof ActionContext > "u" ? i : new ActionContext(e, {
      certainlyNotCausedByUserBehavior: !1,
      consideredUserInitiatedByBrowser: !1
    });
  }
}
const G = new z(), l = class l {
  static deepMerge(t, e) {
    const i = { ...t };
    for (const s of Object.keys(e)) {
      const r = e[s], c = t[s];
      r !== void 0 && (l.isPlainObject(c) && l.isPlainObject(r) ? i[s] = l.deepMerge(
        c,
        r
      ) : i[s] = r);
    }
    return i;
  }
  /**
   * Split a dot path into own-property segments.
   * Returns null when the path is empty, too long, or could reach the prototype chain.
   */
  static parsePath(t) {
    if (typeof t != "string" || t.length === 0 || t.length > 200)
      return null;
    const e = t.split(".");
    for (const i of e)
      if (i.length === 0 || l.forbiddenPathSegment(i) || !/^[A-Za-z0-9_$-]+$/.test(i))
        return null;
    return e;
  }
  /** Read an own property chain. Returns {@link ObjectUtil.missing} when any segment is absent. */
  static readPath(t, e) {
    let i = t;
    for (const s of e) {
      if (l.forbiddenPathSegment(s) || i === null || typeof i != "object" && typeof i != "function" || !Object.prototype.hasOwnProperty.call(i, s))
        return l.missing;
      i = i[s];
    }
    return i;
  }
  static isPlainObject(t) {
    return typeof t == "object" && t !== null && !Array.isArray(t) && Object.getPrototypeOf(t) === Object.prototype;
  }
  static forbiddenPathSegment(t) {
    return t === "__proto__" || t === "prototype" || t === "constructor";
  }
};
l.missing = /* @__PURE__ */ Symbol("missing");
let m = l;
const p = class p {
  constructor() {
    this.contextResolver = G;
  }
  init(t) {
    const e = F.enter(this.name), i = this.contextResolver.resolve(t), s = i.unit ?? i.screen, r = p.registry.get(s);
    if (r)
      return e.debug("already initialized"), r;
    const c = m.deepMerge(this.defaultConfig, t), u = this.create(i, c);
    return p.registry.set(s, u), u.start(), u;
  }
};
p.registry = /* @__PURE__ */ new WeakMap();
let S = p;
class H {
  evaluateGroup(t, e) {
    return t.items.every((i) => this.passed(i, e));
  }
  passed(t, e) {
    return (e.views[t.phase]?.count ?? 0) >= t.value;
  }
}
class V extends g {
}
class Q {
  constructor(t) {
    this.conditions = t;
  }
  select(t) {
    const e = [];
    for (const s of t.phases)
      this.isEligible(s, t) && e.push(s);
    if (e.length > 0)
      return e.slice().sort((r, c) => this.compare(r, c, t.phases))[0] ?? null;
    const i = this.fallback(t);
    return i !== null && i.order >= t.maxEnteredOrder ? i : t.activePhase;
  }
  isEligible(t, e) {
    const i = t.activation?.conditions ?? null, s = i === null || this.conditions.evaluateGroup(i, e.state), r = t.order < e.maxEnteredOrder && e.activePhase?.id !== t.id;
    return s && !r;
  }
  fallback(t) {
    return t.phases.find((e) => e.id === t.fallbackPhaseId) ?? null;
  }
  compare(t, e, i) {
    return t.order !== e.order ? e.order - t.order : i.indexOf(t) - i.indexOf(e);
  }
}
const W = 10;
class J {
  constructor(t, e, i, s) {
    this.options = t, this.now = e, this.log = i, this.key = s, this.memory = null, this.reportedUnavailable = !1, this.knownPhaseIds = new Set(t.phases.map((r) => r.id));
  }
  load() {
    const t = this.backend();
    if (t === null)
      return this.memory;
    try {
      const e = t.getItem(this.key);
      if (e === null)
        return this.memory;
      const i = JSON.parse(e), s = this.readRecord(i);
      return s === null ? this.memory : this.isExpired(s) ? (this.clear(), null) : s;
    } catch (e) {
      return this.log.debug("stored progression could not be read", e), this.memory;
    }
  }
  save(t) {
    this.memory = t;
    const e = this.backend();
    if (e !== null)
      try {
        e.setItem(this.key, JSON.stringify(t));
      } catch (i) {
        this.log.warn(i);
      }
  }
  clear() {
    this.memory = null;
    const t = this.backend();
    if (t !== null)
      try {
        t.removeItem(this.key);
      } catch (e) {
        this.log.debug("stored progression could not be cleared", e);
      }
  }
  isExpired(t) {
    const e = this.options.storage.ttlDays;
    return e === null ? !1 : this.now() - t.createdAt > e * 24 * 60 * 60 * 1e3;
  }
  permitted() {
    return this.options.storage.mode !== "memory";
  }
  backend() {
    if (!this.permitted())
      return null;
    try {
      const t = this.probe(this.options.storage.mode);
      return t === null && !this.reportedUnavailable && (this.reportedUnavailable = !0, this.log.warn("Storage is not available; view history will not persist.")), t;
    } catch (t) {
      return this.reportedUnavailable || (this.reportedUnavailable = !0, this.log.warn("Storage is not available; view history will not persist.", t)), null;
    }
  }
  probe(t) {
    const e = t === "local" ? globalThis.localStorage : globalThis.sessionStorage;
    if (!e)
      return null;
    const i = "__mobkoi_probe__";
    return e.setItem(i, "1"), e.removeItem(i), e;
  }
  readRecord(t) {
    if (!Object.prototype.hasOwnProperty.call(t ?? {}, "maxEnteredOrder") || typeof t != "object" || t === null)
      return null;
    const e = t;
    if (typeof e.maxEnteredOrder != "number" || !Number.isFinite(e.maxEnteredOrder))
      return null;
    const i = e.views;
    if (i !== void 0 && (typeof i != "object" || i === null || Array.isArray(i)))
      return null;
    const s = e.createdAt;
    return s !== void 0 && (typeof s != "number" || !Number.isFinite(s)) ? null : {
      maxEnteredOrder: e.maxEnteredOrder,
      views: this.sanitiseViews(i ?? {}),
      createdAt: typeof s == "number" ? s : this.now()
    };
  }
  sanitiseViews(t) {
    const e = {};
    let i = 0;
    for (const [s, r] of Object.entries(t))
      i >= W || !this.knownPhaseIds.has(s) || !this.isViewRecord(r) || (e[s] = {
        count: Math.min(Math.floor(r.count), Number.MAX_SAFE_INTEGER),
        lastAt: r.lastAt
      }, i += 1);
    return e;
  }
  isViewRecord(t) {
    if (typeof t != "object" || t === null)
      return !1;
    const e = t;
    return typeof e.count == "number" && Number.isFinite(e.count) && e.count >= 0 && typeof e.lastAt == "number" && Number.isFinite(e.lastAt);
  }
}
class N {
  constructor(t) {
    this.scope = t.scope, this.userInitiated = t.userInitiated;
  }
}
class T extends N {
  constructor(t, e) {
    super(t), this.actionContext = e;
  }
}
class A {
  constructor(t) {
    this.name = "celtra", this.log = t.enter("MbkCeltraChannel");
  }
  static actionContextOf(t) {
    return t instanceof T ? t.actionContext : void 0;
  }
  emit(t, e) {
    if (!t.legacyEvent)
      return !1;
    const i = typeof Creative < "u" ? Creative : void 0;
    if (typeof i?.trackCustomEventAction != "function")
      return this.log.debug("Creative API unavailable, no Celtra event for", t.legacyEvent), !1;
    const s = A.actionContextOf(e);
    if (!s)
      return this.log.warn("No ActionContext on the cause of", t.legacyEvent), !1;
    const r = t.legacyEvent;
    return i.trackCustomEventAction(s, { name: r }, () => this.log.debug("Celtra event accepted:", r)), !0;
  }
}
class X {
  constructor(t, e, i) {
    this.key = t, this.initiator = i, this.log = e.enter(`MbkCeltraContexts(${t})`);
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
    const i = this.create(!1);
    return i && (this.passive = i), i;
  }
  create(t) {
    const e = globalThis, i = this.initiator ?? e.screen ?? e.unit;
    if (typeof e.ActionContext == "function" && i)
      try {
        return new e.ActionContext(i, {
          certainlyNotCausedByUserBehavior: !t,
          consideredUserInitiatedByBrowser: t
        });
      } catch (s) {
        this.log.warn("Could not create an ActionContext, falling back to the ambient one", s);
      }
    return e.mbkCtx ?? e.ctx;
  }
}
class h {
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
      h.of(t),
      h.instance(t),
      h.path(t.scope),
      t.percent,
      t.from,
      t.to,
      t.completed,
      t.mode,
      t.legacyEvent
    ].map((i) => i === void 0 ? "" : String(i)).join("|");
  }
  /**
   * What the signal is about: the role, which instance, and where. Everything but what happened to
   * it, which is the verb and the values.
   *
   * This is what a state is keyed on: two players hold two independent states, and a `play` followed
   * by a `pause` is one subject changing rather than two things happening.
   */
  static subject(t) {
    return [t.role, h.instance(t), h.path(t.scope)].join("|");
  }
  /** `"2"`, `"vidPlayer1"`, or `""` for a singleton such as the unit. */
  static instance(t) {
    return t.index !== void 0 ? String(t.index) : t.name ?? "";
  }
  /** Containment as one string, outermost first: `"panel:2>section:3"`. */
  static path(t) {
    const e = [];
    for (let i = t; i; i = i.scope) {
      const s = h.instance(i);
      e.unshift(s ? `${i.role}:${s}` : i.role);
    }
    return e.join(">");
  }
}
class a {
  /** Query parameters for one signal. Undefined values are omitted rather than sent empty. */
  static of(t, e) {
    const i = { k: t.verb, vs1: t.role };
    return a.set(i, "vs2", t.legacyEvent), a.set(i, "vs3", t.name), a.set(i, "vs4", h.path(t.scope) || void 0), a.set(i, "vs5", t.mode), a.set(i, "vi1", t.index), a.set(i, "vi2", t.ms), a.set(i, "vi3", t.from), a.set(i, "vi4", t.to), a.set(i, "vi5", t.completed === void 0 ? void 0 : Number(t.completed)), a.set(i, "vf1", t.percent), a.set(i, "vf2", t.modeMs), a.set(i, "iid", e), i;
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
  static url(t, e, i) {
    const s = t.includes("{{event}}") ? t.replace("{{event}}", encodeURIComponent(e.legacyEvent ?? e.verb)) : t, r = s.includes("?") ? "&" : "?";
    return `${s}${r}${a.toQueryString(a.of(e, i))}`;
  }
  static set(t, e, i) {
    i != null && i !== "" && (t[e] = i);
  }
}
const d = class d {
  constructor(t) {
    this.options = t;
  }
  get endpoint() {
    return this.options.endpoint ?? this.runtimeParam(d.endpointParam) ?? d.defaults.endpoint;
  }
  get errorEndpoint() {
    return this.options.errorEndpoint ?? this.runtimeParam(d.errorEndpointParam);
  }
  get impressionId() {
    return this.options.impressionId ? this.options.impressionId : (typeof creative < "u" ? creative : void 0)?.sessionId;
  }
  get pixelFallback() {
    return this.options.pixelFallback ?? d.defaults.pixelFallback;
  }
  get log() {
    return this.options.log ?? d.defaults.log();
  }
  /** Completes the configuration in place. Later values win, undefined ones leave the current one. */
  update(t) {
    const e = Object.keys(t).reduce((i, s) => {
      const r = t[s];
      return r !== void 0 && (i[s] = r), i;
    }, {});
    this.options = { ...this.options, ...e };
  }
  runtimeParam(t) {
    const i = (typeof creative < "u" ? creative : void 0)?.runtimeParams?.[t];
    return typeof i == "string" && i ? i : void 0;
  }
};
d.endpointParam = "externalSignalTrackerURI", d.errorEndpointParam = "externalClientErrorURI", d.defaults = {
  endpoint: "https://events.mobkoi.com/engagement",
  pixelFallback: !0,
  log: () => new E("mbk")
};
let v = d;
class Z {
  constructor(t, e) {
    this.config = t, this.name = "beacon", this.log = e.enter("MbkBeaconChannel");
  }
  emit(t) {
    const e = this.config.endpoint;
    if (!e)
      return this.log.debug(`No ${v.endpointParam}, raw signal not sent`), !1;
    const i = globalThis.navigator?.sendBeacon;
    if (typeof i != "function")
      return this.log.debug("sendBeacon unavailable"), !1;
    const s = a.url(e, t, this.config.impressionId), r = i.call(globalThis.navigator, s);
    return this.log.debug(r ? "queued" : "refused", s), r;
  }
}
const $ = class $ {
};
$.mapping = [
  { kind: { verb: "click", role: "cta" }, legacyEvent: () => "clickSite" },
  { kind: { verb: "click", role: "unit" }, legacyEvent: () => "clickSite" }
];
let I = $;
class U {
  constructor(t, e, i) {
    this.key = e, this.resolvers = /* @__PURE__ */ new Map(), this.log = t.enter(`MbkLegacyEvents(${e})`), this.declare(i);
  }
  /** Adds or replaces resolvers. Later declaration wins for the same kind. */
  declare(t) {
    for (const e of t) {
      if (!e?.kind || typeof e.legacyEvent != "function") {
        this.log.warn("Ignoring malformed legacy mapping", e);
        continue;
      }
      this.resolvers.set(h.of(e.kind), e.legacyEvent);
    }
    return this;
  }
  has(t) {
    return this.resolvers.has(h.of(t));
  }
  /**
   * @returns the Celtra event name for this signal, or `undefined` when no resolver is registered
   *   for its kind or when the registered one threw.
   */
  resolve(t) {
    const e = this.resolvers.get(h.of(t));
    if (e)
      try {
        const { legacyEvent: i, ...s } = t, r = e(s);
        if (typeof r != "string" || !r) {
          this.log.warn(`Resolver for ${h.of(t)} produced no name`, r);
          return;
        }
        return r;
      } catch (i) {
        this.log.warn(`Resolver for ${h.of(t)} failed, no Celtra event emitted`, i);
        return;
      }
  }
}
class Y {
  constructor(t, e) {
    this.config = t, this.name = "pixel", this.pending = /* @__PURE__ */ new Set(), this.log = e.enter("MbkPixelChannel");
  }
  emit(t) {
    const e = this.config.endpoint;
    if (!e)
      return !1;
    if (typeof Image != "function")
      return this.log.debug("Image unavailable"), !1;
    const i = a.url(e, t, this.config.impressionId), s = new Image();
    this.pending.add(s);
    const r = () => this.pending.delete(s);
    return s.onload = r, s.onerror = r, s.src = i, this.log.debug("sent", i), !0;
  }
}
class _ {
  constructor(t, e) {
    this.config = t, this.log = e.enter("MbkTrackErrorReporter");
  }
  report(t, e, i) {
    this.log.warn(`Channel "${t}" failed for ${h.of(e)}`, i);
    const s = this.config.errorEndpoint;
    if (s)
      try {
        const r = [
          `error=${encodeURIComponent(`mbkTrack:${t}`)}`,
          `reason=${encodeURIComponent(String(i?.message ?? i))}`,
          `k=${encodeURIComponent(e.verb)}`
        ], c = this.config.impressionId;
        c && r.push(`iid=${encodeURIComponent(c)}`);
        const u = `${s}${s.includes("?") ? "&" : "?"}${r.join("&")}`;
        globalThis.navigator?.sendBeacon?.(u);
      } catch (r) {
        this.log.debug("Could not report the channel failure", r);
      }
  }
}
class L extends k {
}
class tt {
  constructor(t, e, i) {
    this.impression = t, this.document = e, this.flushables = /* @__PURE__ */ new Set(), this.flushed = /* @__PURE__ */ new Set(), this.hidden = !1, this.started = !1, this.onVisibilityChange = () => {
      this.document.visibilityState === "hidden" ? this.hide("visibilitychange") : this.show("visibilitychange");
    }, this.onPageHide = () => {
      this.hide("pagehide");
    }, this.onPageShow = (s) => {
      s.persisted && this.document.visibilityState === "visible" && this.show("pageshow");
    }, this.log = i.enter("MbkVisibilityLifecycle");
  }
  /**
   * Flushes that segment on every transition to hidden from now on, and resumes it on every return.
   *
   * Starts listening on the first registration, so a creative with no open segment pays for nothing.
   * A segment registered while the page is already hidden is flushed at once, so that it does not
   * count hidden time until the next return to visible. Registering the same segment again does
   * nothing.
   */
  register(t) {
    if (this.start(), this.flushables.has(t)) {
      this.log.debug("Segment already registered");
      return;
    }
    this.flushables.add(t), this.hidden && this.flush(t, this.impression.elapsedMs(), "register");
  }
  /** Stops flushing and resuming that segment. Its current state is the script's to close. */
  unregister(t) {
    this.flushables.delete(t), this.flushed.delete(t);
  }
  /** Listens to the page lifecycle. Does nothing when already listening. */
  start() {
    this.started || (this.started = !0, this.hidden = this.document.visibilityState === "hidden", this.document.addEventListener("visibilitychange", this.onVisibilityChange), this.document.defaultView?.addEventListener("pagehide", this.onPageHide), this.document.defaultView?.addEventListener("pageshow", this.onPageShow), this.log.debug("Listening to the page lifecycle", this.hidden ? "hidden" : "visible"));
  }
  /** Stops listening. The segments stay registered, and a later {@link start} picks them up again. */
  stop() {
    this.started && (this.document.removeEventListener("visibilitychange", this.onVisibilityChange), this.document.defaultView?.removeEventListener("pagehide", this.onPageHide), this.document.defaultView?.removeEventListener("pageshow", this.onPageShow), this.started = !1, this.log.debug("Stopped listening to the page lifecycle"));
  }
  /** The first transition to hidden flushes every open segment, all at one instant. */
  hide(t) {
    this.hidden = !0;
    const e = this.impression.elapsedMs();
    for (const i of [...this.flushables])
      this.flush(i, e, t);
  }
  /** The return to visible resumes every segment a flush closed, all at one instant. */
  show(t) {
    this.hidden = !1;
    const e = this.impression.elapsedMs();
    for (const i of [...this.flushed])
      this.flushed.delete(i), this.log.debug(`${t}: resuming a segment at ${e}ms`), this.invoke(i, "resume", e);
  }
  flush(t, e, i) {
    if (this.flushed.has(t)) {
      this.log.debug(`${i}: segment already flushed, skipping`);
      return;
    }
    this.flushed.add(t), this.log.debug(`${i}: flushing a segment at ${e}ms`), this.invoke(t, "flush", e);
  }
  /** One script's hook, isolated: it can fail without keeping the others from closing theirs. */
  invoke(t, e, i) {
    try {
      t[e](i);
    } catch (s) {
      this.log.error(new L(`Segment ${e} hook failed at ${i}ms`, s));
    }
  }
}
const o = class o {
  constructor(t) {
    this.tracks = /* @__PURE__ */ new Map(), this.emitted = /* @__PURE__ */ new Set(), this.states = /* @__PURE__ */ new Map(), this.config = new v(t), this.log = this.config.log.enter("MbkImpression"), this.startedAt = o.now(), this.beacon = new Z(this.config, this.log), this.pixel = new Y(this.config, this.log), this.reporter = new _(this.config, this.log), this.coreLegacyEvents = new U(this.log, "core", I.mapping), this.visibility = new tt(this, globalThis.document, this.log);
  }
  /** The one impression of this creative, created on first use. */
  static shared(t) {
    const e = o.storage(), i = e[o.storageKey];
    if (i)
      return i.configure(t), i;
    const s = new o(t);
    return e[o.storageKey] = s, s;
  }
  /** Releases and drops it. For tests, and for a creative that reloads its scripts. */
  static reset() {
    const t = o.storage();
    t[o.storageKey]?.release(), delete t[o.storageKey];
  }
  /**
   * Stash on `unit` when available, else on the window, following the precedent set by
   * `CreativeScript` / `setup()` is the precedent for a per-creative singleton.
   */
  static storage() {
    const t = globalThis;
    return t.unit ? t.unit : (t[o.windowStorageKey] || (t[o.windowStorageKey] = {}), t[o.windowStorageKey]);
  }
  static now() {
    const t = globalThis.performance;
    return typeof t?.now == "function" ? t.now() : Date.now();
  }
  /** Completes the configuration. Later values win. */
  configure(t) {
    this.config.update(t);
  }
  /** Flushes that open segment whenever the creative stops being observed, and resumes it after. */
  register(t) {
    this.visibility.register(t);
  }
  /** Stops flushing and resuming that segment. */
  unregister(t) {
    this.visibility.unregister(t);
  }
  /** Stops listening to the page lifecycle, so a dropped impression leaves nothing behind. */
  release() {
    this.visibility.stop();
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
  track(t, e, i) {
    const s = this.tracks.get(t);
    if (s) {
      if (!(s instanceof i))
        throw new L(
          `"${t}" is already tracked as a ${s.constructor.name}, not a ${i.name}. Every instance of one script must pick the same specialisation.`
        );
      return s;
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
    return this.emitted.size > 0 || this.states.size > 0 ? (this.log.debug("Impression start not moved: signals were already emitted"), !1) : (this.startedAt = o.now(), !0);
  }
  /** Milliseconds since the start of the impression. */
  elapsedMs() {
    return Math.round(o.now() - this.startedAt);
  }
  /**
   * Clears deduplication for one media player so a new DOM instance can re-emit quartiles and
   * play/pause states after Celtra swaps the <video> on in-creative page navigation.
   */
  forgetMedia(t) {
    const e = `:media|${t}|`, i = `media|${t}`;
    for (const s of [...this.emitted])
      s.includes(e) && this.emitted.delete(s);
    for (const s of [...this.states.keys()])
      s.startsWith(i) && this.states.delete(s);
  }
  /**
   * Whether this signal goes out under that emission, recording what it needs to for the next one.
   *
   * Everything is recorded **synchronously**, before any channel: this is the CustomWipeable defect,
   * where the flag was pushed inside the asynchronous tracking callback so two calls could both pass.
   */
  admits(t, e) {
    const i = h.signature(t);
    switch (e) {
      case "repeated":
        return !0;
      case "once":
        return this.emitted.has(i) ? (this.log.debug("Already emitted, skipping", i), !1) : (this.emitted.add(i), !0);
      case "state": {
        const s = h.subject(t);
        return this.states.get(s) === i ? (this.log.debug("Unchanged, skipping", i), !1) : (this.states.set(s, i), !0);
      }
    }
  }
  /** The raw channels: the beacon, then the image pixel when the beacon did not take it. */
  emitRaw(t, e) {
    !this.send(this.beacon, t, e) && this.config.pixelFallback && this.send(this.pixel, t, e);
  }
  /** One channel, isolated: it can fail without touching the others. */
  send(t, e, i) {
    try {
      return t.emit(e, i);
    } catch (s) {
      return this.reporter.report(t.name, e, s), !1;
    }
  }
};
o.storageKey = "mbkImpression", o.windowStorageKey = "__mbkTrackStorage";
let b = o;
class w {
  constructor(t, e) {
    this.impression = t, this.key = e, this.log = t.log.enter(`${this.constructor.name}(${e})`), this.legacyEvents = new U(this.log, e, []);
  }
  /**
   * The track of that script, created on first use, completed with its dictionary.
   *
   * The instance is read and dropped: nothing here keeps a reference to a partially constructed
   * object.
   */
  static shared(t, e) {
    const i = b.shared(e);
    return i.track(t.trackingKey, () => new w(i, t.trackingKey), w).declare(t.legacyEventsMapping);
  }
  /** Adds this script's Celtra event names. A later declaration wins for the same kind. */
  declare(t) {
    return this.legacyEvents.declare(t), this;
  }
  /**
   * Closes that open segment whenever the creative stops being observed, and reopens it after.
   *
   * This is the whole of what a script does about the tab being hidden, the app backgrounded or the
   * page left: the impression holds the one listener, and calls every registered segment at the same
   * instant of its clock. The segment emits its own closing, through this track, from
   * {@link MbkFlushable.flush}.
   */
  register(t) {
    this.impression.register(t);
  }
  /** Stops closing and reopening that segment, when the script ends it for good. */
  unregister(t) {
    this.impression.unregister(t);
  }
  /** A context of the kind this specialisation builds: what caused the signals, and where. */
  context(t) {
    return new N(t);
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
  emit(t, e, i) {
    const s = { ...t, ms: this.impression.elapsedMs() };
    !s.scope && e.scope && (s.scope = e.scope), this.impression.admits(s, i) && (s.legacyEvent = t.legacyEvent ?? this.resolveLegacyEvent(s), this.log.debug("emit", s), this.emitChannels(s, e));
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
    return e || this.log.debug(`No resolver for ${h.of(t)}, raw signal only`), e;
  }
}
class y extends w {
  /**
   * @throws when the same script is already tracked as a plain {@link MbkTrack}. See
   *   {@link MbkImpression.track}.
   */
  static shared(t, e) {
    const i = b.shared(e), s = i.track(
      t.trackingKey,
      () => new y(i, t.trackingKey, e.initiator),
      y
    );
    return s.contexts.useInitiator(e.initiator), s.declare(t.legacyEventsMapping);
  }
  constructor(t, e, i) {
    super(t, e), this.contexts = new X(e, this.log, i), this.celtra = new A(this.log);
  }
  /**
   * A Celtra context, carrying the `ActionContext` this cause's legacy events are fired with: the
   * one the call site forwarded from its handler, else a fresh user-initiated one when the cause is
   * a gesture, else this script's common passive one.
   */
  context(t) {
    const e = t.actionContext ?? this.contexts.forCause(t.userInitiated);
    return new T(t, e);
  }
  /** The legacy event first, unchanged, then the raw channels. */
  emitChannels(t, e) {
    this.impression.send(this.celtra, t, e), super.emitChannels(t, e);
  }
}
class et {
  constructor(t, e) {
    this.trackingKey = "phase", this.unitLegacy = { verb: "legacy", role: "unit" }, this.legacyEventsMapping = [], this.track = y.shared(this, {}), this.log = e.enter("PhaseTracking"), this.impression = this.track.context({
      scope: void 0,
      userInitiated: !1,
      actionContext: t
    });
  }
  enter(t) {
    this.emit(`int_${this.token(t)}`);
  }
  viewed(t) {
    this.emit(`view_${this.token(t)}`);
  }
  emit(t) {
    this.log.debug(t), this.track.once({ ...this.unitLegacy, legacyEvent: t }, this.impression);
  }
  token(t) {
    return t.replace(/[^a-zA-Z0-9]+/g, "_");
  }
}
class it {
  static lerp(t, e, i) {
    return t + (e - t) * i;
  }
  static map(t, e, i, s, r) {
    return i + (s - i) * ((r - t) / (e - t));
  }
  static clamp(t, e, i) {
    return Math.min(Math.max(i, t), e);
  }
}
const j = {
  fps: 10,
  threshold: { standard: 0.5, large: 0.3 }
};
class st {
  constructor(t, e, i) {
    this.mode = null, this.threshold = null, this.state = null, this.previousState = !1, this.active = !1, this.config = j, this.hasInit = !1;
    const s = i === void 0, r = s ? {} : t, c = s ? t : e, u = s ? e : i;
    this.log = u.enter("MbkIsViewable"), this.safeFrameUtil = new q(this.log), this.config = m.deepMerge(j, r), this.callbacks = Array.isArray(c) ? c : [c], this.calculateThreshold = this.calculateThreshold.bind(this), this.init = this.init.bind(this), this.read = this.read.bind(this), this.threshold = this.calculateThreshold();
    const P = this.resolveUnit(), R = P?.currentVariant ?? P;
    R?.on && R.on("resize", () => {
      this.threshold = this.calculateThreshold();
    });
  }
  /**
   * Resolves the CreativeUnit for viewability detection.
   * Prefers config.unit (passed from Cpx.setup) over globalThis.unit
   */
  resolveUnit() {
    return this.config.unit ?? globalThis.unit;
  }
  setupWebInView(t) {
    return t?.inView?.active ? (this.mode = "webInView", this.start = () => {
      this.active || t.inView.on("areaInViewRatioChanged", this.calcState.bind(this)), this.calcState(t.inView.areaInViewRatio), this.active = !0;
    }, this.stop = () => {
      t.inView.off("areaInViewRatioChanged", this.calcState.bind(this)), this.active = !1;
    }, !0) : !1;
  }
  setupMraid(t) {
    if (!t || typeof t != "object" || typeof t.getVersion != "function")
      return !1;
    const e = Number.parseInt(t.getVersion(), 10);
    return this.mode = e >= 3 ? "mraidExposureChange" : "mraidIsViewable", this.start = () => {
      !this.active && (this.mode === "mraidExposureChange" || this.mode === "mraidIsViewable") && (this.mode === "mraidExposureChange" ? t.addEventListener("exposureChange", this.calcState.bind(this)) : t.addEventListener("viewableChange", this.calcState.bind(this))), this.active || (this.intervalCount = 0, this.interval = setInterval(() => {
        this.calcState(t.isViewable()), ++this.intervalCount >= 60 && clearInterval(this.interval);
      }, 500)), this.calcState(t.isViewable()), this.active = !0;
    }, this.stop = () => {
      this.mode === "mraidExposureChange" ? t.removeEventListener("exposureChange", this.calcState.bind(this)) : t.removeEventListener("viewableChange", this.calcState.bind(this)), this.interval && clearInterval(this.interval), this.active = !1;
    }, !0;
  }
  setupSafeFrame() {
    return this.safeFrameUtil.check().passed ? (this.mode = "safeFrame", this.start = () => {
      const e = this.safeFrameUtil.check().apiObject;
      if (!this.active) {
        if (typeof e.ext.inViewPercentage == "function")
          this.interval = setInterval(
            () => this.calcState(e.ext.inViewPercentage()),
            1e3 / this.config.fps
          ), this.calcState(e.ext.inViewPercentage());
        else if (typeof e.ext.geom == "function") {
          const i = () => {
            const s = e.ext.geom().self;
            return s.iv || s.h * s.yiv * (s.w * s.xiv) / (s.h * s.w);
          };
          this.interval = setInterval(() => this.calcState(i()), 1e3 / this.config.fps), this.calcState(i());
        }
        this.active = !0;
      }
    }, this.stop = () => {
      clearInterval(this.interval), this.active = !1;
    }, !0) : !1;
  }
  setupDetectionFailed() {
    if (console.log("No valid viewability detector found!"), this.config.onLegacyEvent)
      try {
        this.config.onLegacyEvent("cpx-detectionFailed");
      } catch (t) {
        this.log.debug("Failed to track detection failure event", t);
      }
    this.mode = "detectionFailed", this.start = () => {
      this.active || (this.state = !0, this.previousState = !1, this.callbacks.forEach((t) => {
        t && typeof t == "function" && t(!0);
      }), this.active = !0);
    }, this.stop = () => {
      this.active = !1;
    }, this.config.onFailure && typeof this.config.onFailure == "function" && this.config.onFailure();
  }
  /**
   * Initializes the viewability detector.
   *
   * Auto-detects the best available API and configures start/stop methods
   * accordingly. Detection priority:
   * 1. Celtra webInView
   * 2. MRAID (mobile app)
   * 3. SafeFrame (publisher)
   * 4. None available → detectionFailed
   *
   * Only runs once - subsequent calls are ignored.
   *
   * @returns this (for method chaining)
   *
   * @example
   * detector.init().start() // Chain initialization and start
   */
  init() {
    if (this.hasInit)
      return this;
    const t = this.resolveUnit(), e = globalThis.mraid;
    return this.setupWebInView(t) || this.setupMraid(e) || this.setupSafeFrame() || this.setupDetectionFailed(), this.hasInit = !0, this;
  }
  /**
   * Reads the current state of the viewability detector.
   *
   * @returns Object containing all detector state:
   *   - active: Whether detector is currently running
   *   - config: Current configuration
   *   - hasInit: Whether init() has been called
   *   - mode: Detection mode being used
   *   - state: Current viewability state (true/false)
   *   - previousState: Previous viewability state
   *   - threshold: Currently applied threshold value
   */
  read() {
    return {
      active: this.active,
      config: this.config,
      hasInit: this.hasInit,
      mode: this.mode,
      state: this.state,
      previousState: this.previousState,
      threshold: this.threshold
    };
  }
  /**
   * Starts viewability monitoring.
   *
   * This method is replaced during init() with mode-specific implementation.
   * Do not call before init().
   */
  start() {
  }
  /**
   * Stops viewability monitoring.
   *
   * This method is replaced during init() with mode-specific implementation.
   * Clears any active intervals/listeners.
   */
  stop() {
  }
  /**
   * Updates the viewability state and fires callbacks if changed.
   *
   * @param val - New viewability state (true/false/undefined)
   * @returns null if val is undefined
   * @private
   */
  updateState(t) {
    if (t === void 0)
      return null;
    this.previousState = this.state || !1, this.state = t, this.previousState !== this.state && this.callbacks.forEach((e) => {
      e && typeof e == "function" && e(this.state);
    });
  }
  /**
   * Calculates the appropriate viewability threshold based on ad size.
   *
   * IAB standards use different thresholds for large vs. standard ads:
   * - Standard ads (≤242,500px²): 50% visible required
   * - Large ads (>242,500px²): 30% visible required
   *
   * @returns The threshold value (0.3 for large, 0.5 for standard)
   * @private
   *
   * @example
   * // 300x250 = 75,000px² → standard threshold (0.5)
   * // 970x250 = 242,500px² → standard threshold (0.5)
   * // 300x600 = 180,000px² → standard threshold (0.5)
   * // 970x250 = 242,500px² → standard threshold (0.5)
   * // But 971x250 = 242,750px² → large threshold (0.3)
   */
  calculateThreshold() {
    const t = this.resolveUnit(), e = t?.size?.width, i = t?.size?.height;
    return typeof e == "number" && typeof i == "number" ? e * i > 242500 ? this.config.threshold.large : this.config.threshold.standard : this.config.threshold.standard;
  }
  /**
   * Calculates viewability state from a raw value.
   *
   * Handles different value formats based on detection mode:
   * - webInView/safeFrame/mraidExposureChange: Numeric ratio (0-1 or 0-100)
   * - mraidIsViewable: Boolean value
   *
   * Normalizes values to 0-1 range and compares against threshold.
   *
   * @param val - Raw viewability value from API
   * @private
   */
  calcState(t) {
    switch (this.mode) {
      case "webInView":
      case "safeFrame":
      case "mraidExposureChange": {
        const e = t > 1 ? t / 100 : t;
        this.updateState(it.clamp(0, 1, e) >= (this.threshold || 0));
        break;
      }
      case "mraidIsViewable":
        this.updateState(!!t);
        break;
      default:
        this.updateState(!1);
    }
  }
}
class rt {
  constructor(t, e, i, s, r, c) {
    this.unit = t, this.minRatio = e, this.minDurationMs = i, this.onQualified = s, this.documentRef = r, this.log = c, this.detector = null, this.observer = null, this.timer = null, this.lastRatio = 0, this.hostViewable = !1, this.qualified = !1, this.onVisibility = () => this.syncVisibility();
  }
  start() {
    return this.detector !== null || this.observer !== null ? !0 : this.startHost() ? (this.documentRef.addEventListener("visibilitychange", this.onVisibility), !0) : this.startObserver();
  }
  stop() {
    this.disarm(), this.qualified = !1, this.lastRatio = 0, this.hostViewable = !1, this.detector?.stop(), this.detector = null, this.observer?.disconnect(), this.observer = null, this.documentRef.removeEventListener("visibilitychange", this.onVisibility);
  }
  startHost() {
    const t = new st(
      {
        unit: this.unit,
        threshold: { standard: this.minRatio, large: this.minRatio }
      },
      (e) => this.onHostViewable(e),
      this.log
    );
    return t.init(), t.mode === "detectionFailed" ? !1 : (this.detector = t, this.detector.start(), !0);
  }
  startObserver() {
    const t = this.unit.node;
    return !(t instanceof Element) || typeof IntersectionObserver != "function" ? !1 : (this.observer = new IntersectionObserver((e) => {
      const i = e[e.length - 1];
      this.lastRatio = i?.intersectionRatio ?? 0, this.syncSample();
    }, { threshold: [0, this.minRatio, 1] }), this.observer.observe(t), this.documentRef.addEventListener("visibilitychange", this.onVisibility), !0);
  }
  onHostViewable(t) {
    this.hostViewable = t, this.syncSample();
  }
  syncVisibility() {
    if (this.documentRef.visibilityState === "hidden") {
      this.disarm();
      return;
    }
    this.syncSample();
  }
  get meetsThreshold() {
    return this.observer !== null ? this.lastRatio >= this.minRatio : this.hostViewable;
  }
  syncSample() {
    const t = this.documentRef.visibilityState !== "hidden";
    if (this.meetsThreshold && t) {
      this.arm();
      return;
    }
    this.disarm();
  }
  arm() {
    this.qualified || this.timer !== null || (this.timer = setTimeout(() => {
      this.timer = null, this.meetsThreshold && this.documentRef.visibilityState !== "hidden" && (this.qualified = !0, this.onQualified());
    }, this.minDurationMs));
  }
  disarm() {
    this.timer !== null && (clearTimeout(this.timer), this.timer = null);
  }
}
const x = class x {
  constructor(t, e, i) {
    this.context = t, this.options = e, this.scriptName = i, this.log = F.enter(this.scriptName), this.now = () => Date.now(), this.selector = new Q(new H()), this.storage = new J(
      this.options,
      this.now,
      this.log,
      `mobkoi-phase:${this.creativeId}`
    ), this.tracking = new et(this.context.ctx, this.log), this.state = this.freshState(), this.activePhase = null, this.createdAt = null, this.started = !1, this.destroyed = !1, this.countOnDisplay = !1, this.reportedViewability = !1, this.viewability = null, this.restore();
  }
  start() {
    if (this.destroyed || this.started)
      return;
    this.started = !0;
    const { unit: t, screen: e } = this.context;
    if (t.hasAppearedAtLeastOnce) {
      this.begin();
      return;
    }
    if (typeof t.once == "function") {
      t.once("appeared", () => this.onAppeared());
      return;
    }
    if (e.hasAppearedAtLeastOnce) {
      this.begin();
      return;
    }
    if (typeof e.once == "function") {
      e.once("appeared", () => this.onAppeared());
      return;
    }
    this.begin();
  }
  onAppeared() {
    this.destroyed || this.started && this.begin();
  }
  begin() {
    this.evaluate("start");
  }
  stop() {
    this.started && (this.started = !1, this.viewability?.stop());
  }
  destroy() {
    this.destroyed || (this.stop(), this.destroyed = !0, this.viewability?.stop(), this.activePhase = null, this.state = this.freshState());
  }
  get creativeId() {
    return this.context.creative.id || "mobkoi-creative";
  }
  get waitForViewable() {
    return this.options.viewability.enabled && this.options.viewability.requireViewable && !this.countOnDisplay;
  }
  evaluate(t) {
    if (this.destroyed)
      return;
    if (t === "viewable") {
      this.activePhase !== null && this.log.debug("viewable", this.activePhase.id, this.state.views), this.stop();
      return;
    }
    const e = this.selector.select({
      phases: this.options.phases,
      state: this.state,
      maxEnteredOrder: this.state.maxEnteredOrder,
      activePhase: this.activePhase,
      fallbackPhaseId: this.options.fallbackPhaseId
    });
    if (e === null)
      throw new V("No eligible phase and no usable fallback phase.");
    this.log.debug(t, e.id), e.id !== this.activePhase?.id && this.display(e);
  }
  display(t) {
    this.present(t), !this.destroyed && (this.activePhase = t, t.order > this.state.maxEnteredOrder && (this.state.maxEnteredOrder = t.order), this.tracking.enter(t.id), this.waitForViewable ? this.persist() : this.recordView(t, this.now()), this.beginViewability());
  }
  present(t) {
    const e = t.target.pageName, i = this.context.unit, s = i.find(e);
    if (!s)
      throw new V(`Celtra screen "${e}" was not found.`);
    if (!i.goToScreenAction || !this.context.ctx)
      throw new V("Celtra screen navigation is not available.");
    i.goToScreenAction(this.context.ctx, { screen: s }, () => {
    });
  }
  beginViewability() {
    if (this.waitForViewable) {
      if (this.watch())
        return;
      this.requestNode();
    }
  }
  requestNode() {
    const t = this.context.unit.getNode;
    if (typeof t != "function") {
      this.failOpen("No host viewability API and unit.node did not resolve. Views are counted when a phase is displayed.");
      return;
    }
    let e = !1;
    const i = (r) => {
      e = !0, this.assignNode(r), this.started && !this.destroyed && this.waitForViewable && (this.watch() || this.failOpen("No host viewability API and unit.node did not resolve. Views are counted when a phase is displayed."));
    }, s = t.call(this.context.unit, i);
    e || (this.assignNode(s), this.watch());
  }
  assignNode(t) {
    this.context.unit.node instanceof Element || t instanceof HTMLElement && (this.context.unit.node = t);
  }
  watch() {
    return this.viewability?.stop(), this.viewability = new rt(
      this.context.unit,
      this.options.viewability.minPercent / 100,
      this.options.viewability.minDurationMs,
      () => this.onViewQualified(),
      document,
      this.log
    ), this.viewability.start() ? !0 : (this.viewability = null, !1);
  }
  failOpen(t) {
    if (this.reportedViewability)
      return;
    this.reportedViewability = !0, this.countOnDisplay = !0, this.log.warn(t);
    const e = this.activePhase;
    e !== null && this.recordView(e, this.now()) && this.evaluate("viewable");
  }
  onViewQualified() {
    const t = this.activePhase;
    t === null || this.destroyed || (this.viewability?.stop(), this.recordView(t, this.now()) && this.evaluate("viewable"));
  }
  recordView(t, e) {
    const i = this.state.views[t.id];
    if (i !== void 0)
      i.count += 1, i.lastAt = e;
    else if (Object.keys(this.state.views).length < x.maxViews)
      this.state.views[t.id] = { count: 1, lastAt: e };
    else
      return !1;
    return this.persist(), this.tracking.viewed(t.id), !0;
  }
  persist() {
    this.createdAt === null && (this.createdAt = this.now());
    const t = {
      maxEnteredOrder: this.state.maxEnteredOrder,
      views: this.state.views,
      createdAt: this.createdAt
    };
    this.storage.save(t);
  }
  restore() {
    const t = this.storage.load();
    t !== null && (this.state.maxEnteredOrder = t.maxEnteredOrder, this.state.views = { ...t.views }, this.createdAt = t.createdAt);
  }
  freshState() {
    return {
      maxEnteredOrder: 0,
      views: /* @__PURE__ */ Object.create(null)
    };
  }
};
x.maxViews = 10;
let O = x;
class nt extends S {
  constructor() {
    super(...arguments), this.name = "PhaseOrchestrator", this.defaultConfig = D;
  }
  create(t, e) {
    return new O(t, e, this.name);
  }
}
const ot = (n) => new nt().init(n);
export {
  ot as setup
};
