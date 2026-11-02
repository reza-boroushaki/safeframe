/*! Copyright Mobkoi 2026 (v5.5.1) */
const T = {
  conditions: {
    mode: "all",
    items: [{ type: "viewed", phase: "phase-1", operator: "gte", value: 1 }]
  }
}, U = {
  conditions: {
    mode: "all",
    items: [{ type: "viewed", phase: "phase-2", operator: "gte", value: 1 }]
  }
}, B = {
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
      activation: T
    },
    {
      id: "phase-3",
      order: 3,
      target: { pageName: "p3" },
      activation: U
    }
  ]
};
class x {
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
    return this.add(new x(e));
  }
  add(e) {
    return e.parent = this, e;
  }
}
const M = new x("MOBKOI");
class E extends Error {
  constructor(e, t = void 0) {
    super(e), this.name = new.target.name, this.cause = typeof t == "string" ? new E(t, void 0) : t;
  }
  toString() {
    return super.toString() + (this.cause ? `
	because of:
` + this.cause.toString() : "");
  }
}
const R = M.enter("Celtra");
class p extends E {
}
function k(n) {
  return !!(n && typeof n.find == "function");
}
function f(n) {
  return globalThis[n];
}
class F {
  resolve(e = {}) {
    const t = this.resolveCreative(e.creative);
    if (!t)
      throw new p('Celtra context: "creative" not found');
    const i = this.resolveScreen(t, e.screen);
    if (!i)
      throw new p('Celtra context: "screen" is missing or not a Celtra screen');
    const s = this.resolveUnit(t, e.unit, i);
    if (!s)
      throw new p('Celtra context: "unit" not found');
    const r = this.resolveCtx(e.ctx, i);
    return { creative: t, unit: s, screen: i, ctx: r };
  }
  resolveCreative(e) {
    return e ?? f("creative");
  }
  resolveScreen(e, t) {
    if (k(t))
      return t;
    if (typeof e?.getScreen == "function") {
      const s = e.getScreen();
      if (k(s))
        return s;
    }
    const i = f("screen");
    return k(i) ? i : void 0;
  }
  resolveUnit(e, t, i) {
    return t ?? e?.getUnit?.() ?? i?.getUnit?.() ?? f("unit");
  }
  resolveCtx(e, t) {
    const i = e ?? f("ctx") ?? f("mbkCtx");
    return i || !t || typeof ActionContext > "u" ? i : new ActionContext(t, {
      certainlyNotCausedByUserBehavior: !1,
      consideredUserInitiatedByBrowser: !1
    });
  }
}
const D = new F(), h = class h {
  static deepMerge(e, t) {
    const i = { ...e };
    for (const s of Object.keys(t)) {
      const r = t[s], d = e[s];
      r !== void 0 && (h.isPlainObject(d) && h.isPlainObject(r) ? i[s] = h.deepMerge(
        d,
        r
      ) : i[s] = r);
    }
    return i;
  }
  /**
   * Split a dot path into own-property segments.
   * Returns null when the path is empty, too long, or could reach the prototype chain.
   */
  static parsePath(e) {
    if (typeof e != "string" || e.length === 0 || e.length > 200)
      return null;
    const t = e.split(".");
    for (const i of t)
      if (i.length === 0 || h.forbiddenPathSegment(i) || !/^[A-Za-z0-9_$-]+$/.test(i))
        return null;
    return t;
  }
  /** Read an own property chain. Returns {@link ObjectUtil.missing} when any segment is absent. */
  static readPath(e, t) {
    let i = e;
    for (const s of t) {
      if (h.forbiddenPathSegment(s) || i === null || typeof i != "object" && typeof i != "function" || !Object.prototype.hasOwnProperty.call(i, s))
        return h.missing;
      i = i[s];
    }
    return i;
  }
  static isPlainObject(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e) && Object.getPrototypeOf(e) === Object.prototype;
  }
  static forbiddenPathSegment(e) {
    return e === "__proto__" || e === "prototype" || e === "constructor";
  }
};
h.missing = /* @__PURE__ */ Symbol("missing");
let A = h;
const g = class g {
  constructor() {
    this.contextResolver = D;
  }
  init(e) {
    const t = R.enter(this.name), i = this.contextResolver.resolve(e), s = i.unit ?? i.screen, r = g.registry.get(s);
    if (r)
      return t.debug("already initialized"), r;
    const d = A.deepMerge(this.defaultConfig, e), u = this.create(i, d);
    return g.registry.set(s, u), u.start(), u;
  }
};
g.registry = /* @__PURE__ */ new WeakMap();
let I = g;
class K {
  evaluateGroup(e, t) {
    return e.items.every((i) => this.passed(i, t));
  }
  passed(e, t) {
    return (t.views[e.phase]?.count ?? 0) >= e.value;
  }
}
class C extends p {
}
class q {
  constructor(e) {
    this.conditions = e;
  }
  select(e) {
    const t = [];
    for (const s of e.phases)
      this.isEligible(s, e) && t.push(s);
    if (t.length > 0)
      return t.slice().sort((r, d) => this.compare(r, d, e.phases))[0] ?? null;
    const i = this.fallback(e);
    return i !== null && i.order >= e.maxEnteredOrder ? i : e.activePhase;
  }
  isEligible(e, t) {
    const i = e.activation?.conditions ?? null, s = i === null || this.conditions.evaluateGroup(i, t.state), r = e.order < t.maxEnteredOrder && t.activePhase?.id !== e.id;
    return s && !r;
  }
  fallback(e) {
    return e.phases.find((t) => t.id === e.fallbackPhaseId) ?? null;
  }
  compare(e, t, i) {
    return e.order !== t.order ? t.order - e.order : i.indexOf(e) - i.indexOf(t);
  }
}
const Q = 10;
class z {
  constructor(e, t, i, s) {
    this.options = e, this.now = t, this.log = i, this.key = s, this.memory = null, this.reportedUnavailable = !1, this.knownPhaseIds = new Set(e.phases.map((r) => r.id));
  }
  load() {
    const e = this.backend();
    if (e === null)
      return this.memory;
    try {
      const t = e.getItem(this.key);
      if (t === null)
        return this.memory;
      const i = JSON.parse(t), s = this.readRecord(i);
      return s === null ? this.memory : this.isExpired(s) ? (this.clear(), null) : s;
    } catch (t) {
      return this.log.debug("stored progression could not be read", t), this.memory;
    }
  }
  save(e) {
    this.memory = e;
    const t = this.backend();
    if (t !== null)
      try {
        t.setItem(this.key, JSON.stringify(e));
      } catch (i) {
        this.log.warn(i);
      }
  }
  clear() {
    this.memory = null;
    const e = this.backend();
    if (e !== null)
      try {
        e.removeItem(this.key);
      } catch (t) {
        this.log.debug("stored progression could not be cleared", t);
      }
  }
  isExpired(e) {
    const t = this.options.storage.ttlDays;
    return t === null ? !1 : this.now() - e.createdAt > t * 24 * 60 * 60 * 1e3;
  }
  permitted() {
    return this.options.storage.mode !== "memory";
  }
  backend() {
    if (!this.permitted())
      return null;
    try {
      const e = this.probe(this.options.storage.mode);
      return e === null && !this.reportedUnavailable && (this.reportedUnavailable = !0, this.log.warn("Storage is not available; view history will not persist.")), e;
    } catch (e) {
      return this.reportedUnavailable || (this.reportedUnavailable = !0, this.log.warn("Storage is not available; view history will not persist.", e)), null;
    }
  }
  probe(e) {
    const t = e === "local" ? globalThis.localStorage : globalThis.sessionStorage;
    if (!t)
      return null;
    const i = "__mobkoi_probe__";
    return t.setItem(i, "1"), t.removeItem(i), t;
  }
  readRecord(e) {
    if (!Object.prototype.hasOwnProperty.call(e ?? {}, "maxEnteredOrder") || typeof e != "object" || e === null)
      return null;
    const t = e;
    if (typeof t.maxEnteredOrder != "number" || !Number.isFinite(t.maxEnteredOrder))
      return null;
    const i = t.views;
    if (i !== void 0 && (typeof i != "object" || i === null || Array.isArray(i)))
      return null;
    const s = t.createdAt;
    return s !== void 0 && (typeof s != "number" || !Number.isFinite(s)) ? null : {
      maxEnteredOrder: t.maxEnteredOrder,
      views: this.sanitiseViews(i ?? {}),
      createdAt: typeof s == "number" ? s : this.now()
    };
  }
  sanitiseViews(e) {
    const t = {};
    let i = 0;
    for (const [s, r] of Object.entries(e))
      i >= Q || !this.knownPhaseIds.has(s) || !this.isViewRecord(r) || (t[s] = {
        count: Math.min(Math.floor(r.count), Number.MAX_SAFE_INTEGER),
        lastAt: r.lastAt
      }, i += 1);
    return t;
  }
  isViewRecord(e) {
    if (typeof e != "object" || e === null)
      return !1;
    const t = e;
    return typeof t.count == "number" && Number.isFinite(t.count) && t.count >= 0 && typeof t.lastAt == "number" && Number.isFinite(t.lastAt);
  }
}
class S {
  constructor(e) {
    this.scope = e.scope, this.userInitiated = e.userInitiated;
  }
}
class j extends S {
  constructor(e, t) {
    super(e), this.actionContext = t;
  }
}
class P {
  constructor(e) {
    this.name = "celtra", this.log = e.enter("MbkCeltraChannel");
  }
  static actionContextOf(e) {
    return e instanceof j ? e.actionContext : void 0;
  }
  emit(e, t) {
    if (!e.legacyEvent)
      return !1;
    const i = typeof Creative < "u" ? Creative : void 0;
    if (typeof i?.trackCustomEventAction != "function")
      return this.log.debug("Creative API unavailable, no Celtra event for", e.legacyEvent), !1;
    const s = P.actionContextOf(t);
    if (!s)
      return this.log.warn("No ActionContext on the cause of", e.legacyEvent), !1;
    const r = e.legacyEvent;
    return i.trackCustomEventAction(s, { name: r }, () => this.log.debug("Celtra event accepted:", r)), !0;
  }
}
class G {
  constructor(e, t, i) {
    this.key = e, this.initiator = i, this.log = t.enter(`MbkCeltraContexts(${e})`);
  }
  /** Completes what the contexts are built from, when the script registers again. */
  useInitiator(e) {
    e && (this.initiator = e);
  }
  /**
   * The context for a cause of that nature: a fresh one when the cause is a user gesture, the
   * memoised passive one otherwise. See the class documentation for why they differ.
   */
  forCause(e) {
    if (e)
      return this.create(!0);
    const t = this.passive;
    if (t)
      return t;
    const i = this.create(!1);
    return i && (this.passive = i), i;
  }
  create(e) {
    const t = globalThis, i = this.initiator ?? t.screen ?? t.unit;
    if (typeof t.ActionContext == "function" && i)
      try {
        return new t.ActionContext(i, {
          certainlyNotCausedByUserBehavior: !e,
          consideredUserInitiatedByBrowser: e
        });
      } catch (s) {
        this.log.warn("Could not create an ActionContext, falling back to the ambient one", s);
      }
    return t.mbkCtx ?? t.ctx;
  }
}
class c {
  /** Dictionary key of a kind, by value: `"view:panel"`. */
  static of(e) {
    return `${e.verb}:${e.role}`;
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
  static signature(e) {
    return [
      c.of(e),
      c.instance(e),
      c.path(e.scope),
      e.percent,
      e.from,
      e.to,
      e.completed,
      e.mode,
      e.legacyEvent
    ].map((i) => i === void 0 ? "" : String(i)).join("|");
  }
  /**
   * What the signal is about: the role, which instance, and where. Everything but what happened to
   * it, which is the verb and the values.
   *
   * This is what a state is keyed on: two players hold two independent states, and a `play` followed
   * by a `pause` is one subject changing rather than two things happening.
   */
  static subject(e) {
    return [e.role, c.instance(e), c.path(e.scope)].join("|");
  }
  /** `"2"`, `"vidPlayer1"`, or `""` for a singleton such as the unit. */
  static instance(e) {
    return e.index !== void 0 ? String(e.index) : e.name ?? "";
  }
  /** Containment as one string, outermost first: `"panel:2>section:3"`. */
  static path(e) {
    const t = [];
    for (let i = e; i; i = i.scope) {
      const s = c.instance(i);
      t.unshift(s ? `${i.role}:${s}` : i.role);
    }
    return t.join(">");
  }
}
class a {
  /** Query parameters for one signal. Undefined values are omitted rather than sent empty. */
  static of(e, t) {
    const i = { k: e.verb, vs1: e.role };
    return a.set(i, "vs2", e.legacyEvent), a.set(i, "vs3", e.name), a.set(i, "vs4", c.path(e.scope) || void 0), a.set(i, "vs5", e.mode), a.set(i, "vi1", e.index), a.set(i, "vi2", e.ms), a.set(i, "vi3", e.from), a.set(i, "vi4", e.to), a.set(i, "vi5", e.completed === void 0 ? void 0 : Number(e.completed)), a.set(i, "vf1", e.percent), a.set(i, "vf2", e.modeMs), a.set(i, "iid", t), i;
  }
  static toQueryString(e) {
    return Object.keys(e).map((t) => `${encodeURIComponent(t)}=${encodeURIComponent(String(e[t]))}`).join("&");
  }
  /**
   * The URL both the beacon and the pixel send to.
   *
   * A `{{event}}` placeholder is substituted with the resolved Celtra event name, on the model of
   * the existing `externalVideoTrackerURI`, so an endpoint already shaped that way keeps working.
   */
  static url(e, t, i) {
    const s = e.includes("{{event}}") ? e.replace("{{event}}", encodeURIComponent(t.legacyEvent ?? t.verb)) : e, r = s.includes("?") ? "&" : "?";
    return `${s}${r}${a.toQueryString(a.of(t, i))}`;
  }
  static set(e, t, i) {
    i != null && i !== "" && (e[t] = i);
  }
}
const l = class l {
  constructor(e) {
    this.options = e;
  }
  get endpoint() {
    return this.options.endpoint ?? this.runtimeParam(l.endpointParam) ?? l.defaults.endpoint;
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
  update(e) {
    const t = Object.keys(e).reduce((i, s) => {
      const r = e[s];
      return r !== void 0 && (i[s] = r), i;
    }, {});
    this.options = { ...this.options, ...t };
  }
  runtimeParam(e) {
    const i = (typeof creative < "u" ? creative : void 0)?.runtimeParams?.[e];
    return typeof i == "string" && i ? i : void 0;
  }
};
l.endpointParam = "externalSignalTrackerURI", l.errorEndpointParam = "externalClientErrorURI", l.defaults = {
  endpoint: "https://events.mobkoi.com/engagement",
  pixelFallback: !0,
  log: () => new x("mbk")
};
let m = l;
class H {
  constructor(e, t) {
    this.config = e, this.name = "beacon", this.log = t.enter("MbkBeaconChannel");
  }
  emit(e) {
    const t = this.config.endpoint;
    if (!t)
      return this.log.debug(`No ${m.endpointParam}, raw signal not sent`), !1;
    const i = globalThis.navigator?.sendBeacon;
    if (typeof i != "function")
      return this.log.debug("sendBeacon unavailable"), !1;
    const s = a.url(t, e, this.config.impressionId), r = i.call(globalThis.navigator, s);
    return this.log.debug(r ? "queued" : "refused", s), r;
  }
}
const $ = class $ {
};
$.mapping = [
  { kind: { verb: "click", role: "cta" }, legacyEvent: () => "clickSite" },
  { kind: { verb: "click", role: "unit" }, legacyEvent: () => "clickSite" }
];
let O = $;
class N {
  constructor(e, t, i) {
    this.key = t, this.resolvers = /* @__PURE__ */ new Map(), this.log = e.enter(`MbkLegacyEvents(${t})`), this.declare(i);
  }
  /** Adds or replaces resolvers. Later declaration wins for the same kind. */
  declare(e) {
    for (const t of e) {
      if (!t?.kind || typeof t.legacyEvent != "function") {
        this.log.warn("Ignoring malformed legacy mapping", t);
        continue;
      }
      this.resolvers.set(c.of(t.kind), t.legacyEvent);
    }
    return this;
  }
  has(e) {
    return this.resolvers.has(c.of(e));
  }
  /**
   * @returns the Celtra event name for this signal, or `undefined` when no resolver is registered
   *   for its kind or when the registered one threw.
   */
  resolve(e) {
    const t = this.resolvers.get(c.of(e));
    if (t)
      try {
        const { legacyEvent: i, ...s } = e, r = t(s);
        if (typeof r != "string" || !r) {
          this.log.warn(`Resolver for ${c.of(e)} produced no name`, r);
          return;
        }
        return r;
      } catch (i) {
        this.log.warn(`Resolver for ${c.of(e)} failed, no Celtra event emitted`, i);
        return;
      }
  }
}
class W {
  constructor(e, t) {
    this.config = e, this.name = "pixel", this.pending = /* @__PURE__ */ new Set(), this.log = t.enter("MbkPixelChannel");
  }
  emit(e) {
    const t = this.config.endpoint;
    if (!t)
      return !1;
    if (typeof Image != "function")
      return this.log.debug("Image unavailable"), !1;
    const i = a.url(t, e, this.config.impressionId), s = new Image();
    this.pending.add(s);
    const r = () => this.pending.delete(s);
    return s.onload = r, s.onerror = r, s.src = i, this.log.debug("sent", i), !0;
  }
}
class J {
  constructor(e, t) {
    this.config = e, this.log = t.enter("MbkTrackErrorReporter");
  }
  report(e, t, i) {
    this.log.warn(`Channel "${e}" failed for ${c.of(t)}`, i);
    const s = this.config.errorEndpoint;
    if (s)
      try {
        const r = [
          `error=${encodeURIComponent(`mbkTrack:${e}`)}`,
          `reason=${encodeURIComponent(String(i?.message ?? i))}`,
          `k=${encodeURIComponent(t.verb)}`
        ], d = this.config.impressionId;
        d && r.push(`iid=${encodeURIComponent(d)}`);
        const u = `${s}${s.includes("?") ? "&" : "?"}${r.join("&")}`;
        globalThis.navigator?.sendBeacon?.(u);
      } catch (r) {
        this.log.debug("Could not report the channel failure", r);
      }
  }
}
class L extends E {
}
class X {
  constructor(e, t, i) {
    this.impression = e, this.document = t, this.flushables = /* @__PURE__ */ new Set(), this.flushed = /* @__PURE__ */ new Set(), this.hidden = !1, this.started = !1, this.onVisibilityChange = () => {
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
  register(e) {
    if (this.start(), this.flushables.has(e)) {
      this.log.debug("Segment already registered");
      return;
    }
    this.flushables.add(e), this.hidden && this.flush(e, this.impression.elapsedMs(), "register");
  }
  /** Stops flushing and resuming that segment. Its current state is the script's to close. */
  unregister(e) {
    this.flushables.delete(e), this.flushed.delete(e);
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
  hide(e) {
    this.hidden = !0;
    const t = this.impression.elapsedMs();
    for (const i of [...this.flushables])
      this.flush(i, t, e);
  }
  /** The return to visible resumes every segment a flush closed, all at one instant. */
  show(e) {
    this.hidden = !1;
    const t = this.impression.elapsedMs();
    for (const i of [...this.flushed])
      this.flushed.delete(i), this.log.debug(`${e}: resuming a segment at ${t}ms`), this.invoke(i, "resume", t);
  }
  flush(e, t, i) {
    if (this.flushed.has(e)) {
      this.log.debug(`${i}: segment already flushed, skipping`);
      return;
    }
    this.flushed.add(e), this.log.debug(`${i}: flushing a segment at ${t}ms`), this.invoke(e, "flush", t);
  }
  /** One script's hook, isolated: it can fail without keeping the others from closing theirs. */
  invoke(e, t, i) {
    try {
      e[t](i);
    } catch (s) {
      this.log.error(new L(`Segment ${t} hook failed at ${i}ms`, s));
    }
  }
}
const o = class o {
  constructor(e) {
    this.tracks = /* @__PURE__ */ new Map(), this.emitted = /* @__PURE__ */ new Set(), this.states = /* @__PURE__ */ new Map(), this.config = new m(e), this.log = this.config.log.enter("MbkImpression"), this.startedAt = o.now(), this.beacon = new H(this.config, this.log), this.pixel = new W(this.config, this.log), this.reporter = new J(this.config, this.log), this.coreLegacyEvents = new N(this.log, "core", O.mapping), this.visibility = new X(this, globalThis.document, this.log);
  }
  /** The one impression of this creative, created on first use. */
  static shared(e) {
    const t = o.storage(), i = t[o.storageKey];
    if (i)
      return i.configure(e), i;
    const s = new o(e);
    return t[o.storageKey] = s, s;
  }
  /** Releases and drops it. For tests, and for a creative that reloads its scripts. */
  static reset() {
    const e = o.storage();
    e[o.storageKey]?.release(), delete e[o.storageKey];
  }
  /**
   * Stash on `unit` when available, else on the window, following the precedent set by
   * `CreativeScript` / `setup()` is the precedent for a per-creative singleton.
   */
  static storage() {
    const e = globalThis;
    return e.unit ? e.unit : (e[o.windowStorageKey] || (e[o.windowStorageKey] = {}), e[o.windowStorageKey]);
  }
  static now() {
    const e = globalThis.performance;
    return typeof e?.now == "function" ? e.now() : Date.now();
  }
  /** Completes the configuration. Later values win. */
  configure(e) {
    this.config.update(e);
  }
  /** Flushes that open segment whenever the creative stops being observed, and resumes it after. */
  register(e) {
    this.visibility.register(e);
  }
  /** Stops flushing and resuming that segment. */
  unregister(e) {
    this.visibility.unregister(e);
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
  track(e, t, i) {
    const s = this.tracks.get(e);
    if (s) {
      if (!(s instanceof i))
        throw new L(
          `"${e}" is already tracked as a ${s.constructor.name}, not a ${i.name}. Every instance of one script must pick the same specialisation.`
        );
      return s;
    }
    const r = t();
    return this.tracks.set(e, r), r;
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
  forgetMedia(e) {
    const t = `:media|${e}|`, i = `media|${e}`;
    for (const s of [...this.emitted])
      s.includes(t) && this.emitted.delete(s);
    for (const s of [...this.states.keys()])
      s.startsWith(i) && this.states.delete(s);
  }
  /**
   * Whether this signal goes out under that emission, recording what it needs to for the next one.
   *
   * Everything is recorded **synchronously**, before any channel: this is the CustomWipeable defect,
   * where the flag was pushed inside the asynchronous tracking callback so two calls could both pass.
   */
  admits(e, t) {
    const i = c.signature(e);
    switch (t) {
      case "repeated":
        return !0;
      case "once":
        return this.emitted.has(i) ? (this.log.debug("Already emitted, skipping", i), !1) : (this.emitted.add(i), !0);
      case "state": {
        const s = c.subject(e);
        return this.states.get(s) === i ? (this.log.debug("Unchanged, skipping", i), !1) : (this.states.set(s, i), !0);
      }
    }
  }
  /** The raw channels: the beacon, then the image pixel when the beacon did not take it. */
  emitRaw(e, t) {
    !this.send(this.beacon, e, t) && this.config.pixelFallback && this.send(this.pixel, e, t);
  }
  /** One channel, isolated: it can fail without touching the others. */
  send(e, t, i) {
    try {
      return e.emit(t, i);
    } catch (s) {
      return this.reporter.report(e.name, t, s), !1;
    }
  }
};
o.storageKey = "mbkImpression", o.windowStorageKey = "__mbkTrackStorage";
let v = o;
class b {
  constructor(e, t) {
    this.impression = e, this.key = t, this.log = e.log.enter(`${this.constructor.name}(${t})`), this.legacyEvents = new N(this.log, t, []);
  }
  /**
   * The track of that script, created on first use, completed with its dictionary.
   *
   * The instance is read and dropped: nothing here keeps a reference to a partially constructed
   * object.
   */
  static shared(e, t) {
    const i = v.shared(t);
    return i.track(e.trackingKey, () => new b(i, e.trackingKey), b).declare(e.legacyEventsMapping);
  }
  /** Adds this script's Celtra event names. A later declaration wins for the same kind. */
  declare(e) {
    return this.legacyEvents.declare(e), this;
  }
  /**
   * Closes that open segment whenever the creative stops being observed, and reopens it after.
   *
   * This is the whole of what a script does about the tab being hidden, the app backgrounded or the
   * page left: the impression holds the one listener, and calls every registered segment at the same
   * instant of its clock. The segment emits its own closing, through this track, from
   * {@link MbkFlushable.flush}.
   */
  register(e) {
    this.impression.register(e);
  }
  /** Stops closing and reopening that segment, when the script ends it for good. */
  unregister(e) {
    this.impression.unregister(e);
  }
  /** A context of the kind this specialisation builds: what caused the signals, and where. */
  context(e) {
    return new S(e);
  }
  /** An occurrence: at most one per distinct value, for the whole impression. */
  once(e, t) {
    this.emit(e, t, "once");
  }
  /** An occurrence where every one counts. */
  repeated(e, t) {
    this.emit(e, t, "repeated");
  }
  /**
   * Reports the subject's state, which goes out only when it differs from the last one reported.
   *
   * The call site reports what is true now, every time, and does not have to know whether that is
   * news: a video already playing that reports playing again has not started twice, and a panel
   * already at 50% that reports 50% again has not crossed anything. `A, B, A` goes out three times,
   * because the subject genuinely changed three times.
   */
  state(e, t) {
    this.emit(e, t, "state");
  }
  /** Resolves the signal, stamps it, and hands it to the channels if the emission admits it. */
  emit(e, t, i) {
    const s = { ...e, ms: this.impression.elapsedMs() };
    !s.scope && t.scope && (s.scope = t.scope), this.impression.admits(s, i) && (s.legacyEvent = e.legacyEvent ?? this.resolveLegacyEvent(s), this.log.debug("emit", s), this.emitChannels(s, t));
  }
  /**
   * The raw channels of the impression.
   *
   * A specialisation adds its own by overriding this and calling `super`, which is how
   * {@link MbkCeltraTrack} fires the legacy Celtra event first.
   */
  emitChannels(e, t) {
    this.impression.emitRaw(e, t);
  }
  /**
   * This script's dictionary first, then the small core set common to every creative.
   *
   * @returns `undefined` when nothing resolves, in which case the raw signal is emitted alone. We
   *   never invent a name: a spurious legacy event would appear in reporting that nobody configured
   *   at placement level.
   */
  resolveLegacyEvent(e) {
    if (e.verb === "legacy") {
      this.log.warn("A legacy signal must carry its legacyEvent", e);
      return;
    }
    const t = this.legacyEvents.resolve(e) ?? this.impression.coreLegacyEvents.resolve(e);
    return t || this.log.debug(`No resolver for ${c.of(e)}, raw signal only`), t;
  }
}
class w extends b {
  /**
   * @throws when the same script is already tracked as a plain {@link MbkTrack}. See
   *   {@link MbkImpression.track}.
   */
  static shared(e, t) {
    const i = v.shared(t), s = i.track(
      e.trackingKey,
      () => new w(i, e.trackingKey, t.initiator),
      w
    );
    return s.contexts.useInitiator(t.initiator), s.declare(e.legacyEventsMapping);
  }
  constructor(e, t, i) {
    super(e, t), this.contexts = new G(t, this.log, i), this.celtra = new P(this.log);
  }
  /**
   * A Celtra context, carrying the `ActionContext` this cause's legacy events are fired with: the
   * one the call site forwarded from its handler, else a fresh user-initiated one when the cause is
   * a gesture, else this script's common passive one.
   */
  context(e) {
    const t = e.actionContext ?? this.contexts.forCause(e.userInitiated);
    return new j(e, t);
  }
  /** The legacy event first, unchanged, then the raw channels. */
  emitChannels(e, t) {
    this.impression.send(this.celtra, e, t), super.emitChannels(e, t);
  }
}
class Z {
  constructor(e, t) {
    this.trackingKey = "phase", this.unitLegacy = { verb: "legacy", role: "unit" }, this.legacyEventsMapping = [], this.track = w.shared(this, {}), this.log = t.enter("PhaseTracking"), this.impression = this.track.context({
      scope: void 0,
      userInitiated: !1,
      actionContext: e
    });
  }
  enter(e) {
    this.emit(`int_${this.token(e)}`);
  }
  viewed(e) {
    this.emit(`view_${this.token(e)}`);
  }
  emit(e) {
    this.log.debug(e), this.track.once({ ...this.unitLegacy, legacyEvent: e }, this.impression);
  }
  token(e) {
    return e.replace(/[^a-zA-Z0-9]+/g, "_");
  }
}
class Y {
  constructor(e, t, i, s, r) {
    this.root = e, this.minRatio = t, this.minDurationMs = i, this.onQualified = s, this.documentRef = r, this.observer = null, this.timer = null, this.lastRatio = 0, this.onVisibility = () => this.syncVisibility();
  }
  start() {
    return this.observer !== null ? !0 : typeof IntersectionObserver != "function" ? !1 : (this.observer = new IntersectionObserver((e) => {
      const t = e[e.length - 1];
      this.lastRatio = t?.intersectionRatio ?? 0, this.syncSample();
    }, { threshold: [0, this.minRatio, 1] }), this.observer.observe(this.root), this.documentRef.addEventListener("visibilitychange", this.onVisibility), !0);
  }
  stop() {
    this.disarm(), this.observer?.disconnect(), this.observer = null, this.documentRef.removeEventListener("visibilitychange", this.onVisibility);
  }
  syncVisibility() {
    if (this.documentRef.visibilityState === "hidden") {
      this.disarm();
      return;
    }
    this.syncSample();
  }
  syncSample() {
    const e = this.documentRef.visibilityState !== "hidden";
    if (this.lastRatio >= this.minRatio && e) {
      this.arm();
      return;
    }
    this.disarm();
  }
  arm() {
    this.timer === null && (this.timer = setTimeout(() => {
      this.timer = null, this.lastRatio >= this.minRatio && this.documentRef.visibilityState !== "hidden" && this.onQualified();
    }, this.minDurationMs));
  }
  disarm() {
    this.timer !== null && (clearTimeout(this.timer), this.timer = null);
  }
}
const y = class y {
  constructor(e, t, i) {
    this.context = e, this.options = t, this.scriptName = i, this.log = R.enter(this.scriptName), this.now = () => Date.now(), this.selector = new q(new K()), this.storage = new z(
      this.options,
      this.now,
      this.log,
      `mobkoi-phase:${this.creativeId}`
    ), this.tracking = new Z(this.context.ctx, this.log), this.state = this.freshState(), this.activePhase = null, this.createdAt = null, this.started = !1, this.destroyed = !1, this.countOnDisplay = !1, this.reportedViewability = !1, this.viewability = null, this.restore();
  }
  start() {
    if (this.destroyed || this.started)
      return;
    this.started = !0;
    const { unit: e, screen: t } = this.context;
    if (e.hasAppearedAtLeastOnce) {
      this.begin();
      return;
    }
    if (typeof e.once == "function") {
      e.once("appeared", () => this.onAppeared());
      return;
    }
    if (t.hasAppearedAtLeastOnce) {
      this.begin();
      return;
    }
    if (typeof t.once == "function") {
      t.once("appeared", () => this.onAppeared());
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
  evaluate(e) {
    if (this.destroyed)
      return;
    if (e === "viewable") {
      this.activePhase !== null && this.log.debug("viewable", this.activePhase.id, this.state.views), this.stop();
      return;
    }
    const t = this.selector.select({
      phases: this.options.phases,
      state: this.state,
      maxEnteredOrder: this.state.maxEnteredOrder,
      activePhase: this.activePhase,
      fallbackPhaseId: this.options.fallbackPhaseId
    });
    if (t === null)
      throw new C("No eligible phase and no usable fallback phase.");
    this.log.debug(e, t.id), t.id !== this.activePhase?.id && this.display(t);
  }
  display(e) {
    this.present(e), !this.destroyed && (this.activePhase = e, e.order > this.state.maxEnteredOrder && (this.state.maxEnteredOrder = e.order), this.tracking.enter(e.id), this.waitForViewable ? this.persist() : this.recordView(e, this.now()), this.beginViewability());
  }
  present(e) {
    const t = e.target.pageName, i = this.context.unit, s = i.find(t);
    if (!s)
      throw new C(`Celtra screen "${t}" was not found.`);
    if (!i.goToScreenAction || !this.context.ctx)
      throw new C("Celtra screen navigation is not available.");
    i.goToScreenAction(this.context.ctx, { screen: s }, () => {
    });
  }
  beginViewability() {
    if (this.waitForViewable) {
      const e = this.currentRoot();
      if (e !== null) {
        this.watch(e);
        return;
      }
      const t = this.context.unit.getNode;
      if (typeof t == "function") {
        t.call(this.context.unit, () => {
          if (this.started && !this.destroyed && this.waitForViewable) {
            const i = this.currentRoot();
            if (i !== null) {
              this.watch(i);
              return;
            }
            this.failOpen("unit.node did not resolve to an element. Views are counted when a phase is displayed.");
          }
        });
        return;
      }
      this.failOpen("unit.node did not resolve to an element. Views are counted when a phase is displayed.");
    }
  }
  watch(e) {
    this.viewability?.stop(), this.viewability = new Y(
      e,
      this.options.viewability.minPercent / 100,
      this.options.viewability.minDurationMs,
      () => this.onViewQualified(),
      document
    ), this.viewability.start() || this.failOpen("IntersectionObserver is not available. Views are counted when a phase is displayed.");
  }
  failOpen(e) {
    if (this.reportedViewability)
      return;
    this.reportedViewability = !0, this.countOnDisplay = !0, this.log.warn(e);
    const t = this.activePhase;
    t !== null && this.recordView(t, this.now()) && this.evaluate("viewable");
  }
  onViewQualified() {
    const e = this.activePhase;
    e === null || this.destroyed || (this.viewability?.stop(), this.recordView(e, this.now()) && this.evaluate("viewable"));
  }
  recordView(e, t) {
    const i = this.state.views[e.id];
    if (i !== void 0)
      i.count += 1, i.lastAt = t;
    else if (Object.keys(this.state.views).length < y.maxViews)
      this.state.views[e.id] = { count: 1, lastAt: t };
    else
      return !1;
    return this.persist(), this.tracking.viewed(e.id), !0;
  }
  currentRoot() {
    return this.context.unit.node ?? null;
  }
  persist() {
    this.createdAt === null && (this.createdAt = this.now());
    const e = {
      maxEnteredOrder: this.state.maxEnteredOrder,
      views: this.state.views,
      createdAt: this.createdAt
    };
    this.storage.save(e);
  }
  restore() {
    const e = this.storage.load();
    e !== null && (this.state.maxEnteredOrder = e.maxEnteredOrder, this.state.views = { ...e.views }, this.createdAt = e.createdAt);
  }
  freshState() {
    return {
      maxEnteredOrder: 0,
      views: /* @__PURE__ */ Object.create(null)
    };
  }
};
y.maxViews = 10;
let V = y;
class _ extends I {
  constructor() {
    super(...arguments), this.name = "PhaseOrchestrator", this.defaultConfig = B;
  }
  create(e, t) {
    return new V(e, t, this.name);
  }
}
const ee = (n) => new _().init(n);
export {
  ee as setup
};
