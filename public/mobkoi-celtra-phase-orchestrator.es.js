/*! Copyright Mobkoi 2026 (v5.5.1) */
const $ = {
  viewableOnce: !1
}, z = {
  conditions: {
    mode: "all",
    items: [{ type: "viewed", phase: "phase-1", operator: "gte", value: 1 }]
  }
}, H = {
  conditions: {
    mode: "all",
    items: [{ type: "viewed", phase: "phase-2", operator: "gte", value: 1 }]
  }
}, W = {
  debug: !0,
  tagservice: null,
  progression: "forward-only",
  fallbackPhaseId: "phase-1",
  storage: {
    mode: "local",
    key: "",
    allowed: !0,
    ttlDays: 45
  },
  consent: {
    measurement: !0,
    personalisation: !1,
    storage: !0
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
      activation: null,
      behaviour: $
    },
    {
      id: "phase-2",
      order: 2,
      target: { pageName: "p2" },
      activation: z,
      behaviour: $
    },
    {
      id: "phase-3",
      order: 3,
      target: { pageName: "p3" },
      activation: H,
      behaviour: $
    }
  ]
};
class S {
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
    return this.add(new S(e));
  }
  add(e) {
    return e.parent = this, e;
  }
}
const X = new S("MOBKOI");
class V extends Error {
  constructor(e, t = void 0) {
    super(e), this.name = new.target.name, this.cause = typeof t == "string" ? new V(t, void 0) : t;
  }
  toString() {
    return super.toString() + (this.cause ? `
	because of:
` + this.cause.toString() : "");
  }
}
const M = X.enter("Celtra");
class P extends V {
}
function j(o) {
  return !!(o && typeof o.find == "function");
}
function y(o) {
  return globalThis[o];
}
class J {
  resolve(e = {}) {
    const t = this.resolveCreative(e.creative);
    if (!t)
      throw new P('Celtra context: "creative" not found');
    const s = this.resolveScreen(t, e.screen);
    if (!s)
      throw new P('Celtra context: "screen" is missing or not a Celtra screen');
    const i = this.resolveUnit(t, e.unit, s);
    if (!i)
      throw new P('Celtra context: "unit" not found');
    const r = this.resolveCtx(e.ctx, s);
    return { creative: t, unit: i, screen: s, ctx: r };
  }
  resolveCreative(e) {
    return e ?? y("creative");
  }
  resolveScreen(e, t) {
    if (j(t))
      return t;
    if (typeof e?.getScreen == "function") {
      const i = e.getScreen();
      if (j(i))
        return i;
    }
    const s = y("screen");
    return j(s) ? s : void 0;
  }
  resolveUnit(e, t, s) {
    return t ?? e?.getUnit?.() ?? s?.getUnit?.() ?? y("unit");
  }
  resolveCtx(e, t) {
    const s = e ?? y("ctx") ?? y("mbkCtx");
    return s || !t || typeof ActionContext > "u" ? s : new ActionContext(t, {
      certainlyNotCausedByUserBehavior: !1,
      consideredUserInitiatedByBrowser: !1
    });
  }
}
const Z = new J(), d = class d {
  static deepMerge(e, t) {
    const s = { ...e };
    for (const i of Object.keys(t)) {
      const r = t[i], n = e[i];
      r !== void 0 && (d.isPlainObject(n) && d.isPlainObject(r) ? s[i] = d.deepMerge(
        n,
        r
      ) : s[i] = r);
    }
    return s;
  }
  /**
   * Split a dot path into own-property segments.
   * Returns null when the path is empty, too long, or could reach the prototype chain.
   */
  static parsePath(e) {
    if (typeof e != "string" || e.length === 0 || e.length > 200)
      return null;
    const t = e.split(".");
    for (const s of t)
      if (s.length === 0 || d.forbiddenPathSegment(s) || !/^[A-Za-z0-9_$-]+$/.test(s))
        return null;
    return t;
  }
  /** Read an own property chain. Returns {@link ObjectUtil.missing} when any segment is absent. */
  static readPath(e, t) {
    let s = e;
    for (const i of t) {
      if (d.forbiddenPathSegment(i) || s === null || typeof s != "object" && typeof s != "function" || !Object.prototype.hasOwnProperty.call(s, i))
        return d.missing;
      s = s[i];
    }
    return s;
  }
  static isPlainObject(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e) && Object.getPrototypeOf(e) === Object.prototype;
  }
  static forbiddenPathSegment(e) {
    return e === "__proto__" || e === "prototype" || e === "constructor";
  }
};
d.missing = /* @__PURE__ */ Symbol("missing");
let f = d;
const w = class w {
  constructor() {
    this.contextResolver = Z;
  }
  init(e) {
    const t = M.enter(this.name), s = this.contextResolver.resolve(e), i = s.unit ?? s.screen, r = w.registry.get(i);
    if (r)
      return t.debug("already initialized"), r;
    const n = f.deepMerge(this.defaultConfig, e), u = this.create(s, n);
    return w.registry.set(i, u), u.start(), u;
  }
};
w.registry = /* @__PURE__ */ new WeakMap();
let N = w;
class Y {
  constructor() {
    this.paths = /* @__PURE__ */ new Map();
  }
  evaluateGroup(e, t) {
    const s = e.items.map((r) => this.evaluate(r, t));
    return { passed: e.mode === "all" ? s.every((r) => r.passed) : s.some((r) => r.passed), results: s };
  }
  evaluate(e, t) {
    const s = this.readActual(e, t), i = this.applyOperator(e.operator, s, e.value);
    if (!t.debug)
      return { passed: i, reason: "" };
    const r = e.operator === "exists" || e.operator === "not-exists" ? "" : ` ${this.describe(e.value)}`;
    return {
      passed: i,
      reason: `${this.label(e)} = ${this.describe(s)} ${e.operator}${r} -> ${i ? "pass" : "fail"}`
    };
  }
  readActual(e, t) {
    if (e.type === "state") {
      const s = this.segmentsFor(e.path);
      return s === null ? f.missing : f.readPath(t.state.values, s);
    }
    if (e.type === "event-count")
      return t.state.eventCounts[e.event] ?? 0;
    if (e.type === "query") {
      const s = t.getQueryValue(e.key);
      return s === void 0 ? f.missing : this.coerceScalar(s);
    }
    if (e.type === "storage") {
      const s = t.getStoredValue(e.key);
      return s === void 0 ? f.missing : this.coerceScalar(s);
    }
    if (e.type === "external") {
      const s = t.getExternalValue(e.name);
      return s === void 0 ? f.missing : s;
    }
    if (e.phase === null) {
      let s = 0;
      for (const i of Object.values(t.state.views))
        s += i.count;
      return s;
    }
    return t.state.views[e.phase]?.count ?? 0;
  }
  applyOperator(e, t, s) {
    const i = t !== f.missing && t !== void 0;
    if (e === "exists")
      return i && t !== null;
    if (e === "not-exists")
      return !i || t === null;
    if (e === "eq")
      return i && this.looseEquals(t, s);
    if (e === "neq")
      return !i || !this.looseEquals(t, s);
    if (e === "gt" || e === "gte" || e === "lt" || e === "lte") {
      if (!i)
        return !1;
      const r = this.toNumber(t), n = typeof s == "number" ? s : Number.NaN;
      return !Number.isFinite(r) || !Number.isFinite(n) ? !1 : e === "gt" ? r > n : e === "gte" ? r >= n : e === "lt" ? r < n : r <= n;
    }
    return e === "in" ? i && Array.isArray(s) && s.some((r) => this.looseEquals(t, r)) : !i || !(Array.isArray(s) && s.some((r) => this.looseEquals(t, r)));
  }
  looseEquals(e, t) {
    if (e === t)
      return !0;
    if (e === null || t === null || typeof e == "object" || typeof t == "object")
      return !1;
    const s = this.asPrimitive(e), i = this.asPrimitive(t);
    if (s === void 0 || i === void 0)
      return !1;
    const r = typeof s == "string" ? this.coerceScalar(s) : s, n = typeof i == "string" ? this.coerceScalar(i) : i;
    return r === n;
  }
  asPrimitive(e) {
    if (typeof e == "string" || typeof e == "number" || typeof e == "boolean")
      return e;
  }
  coerceScalar(e) {
    return e === "true" ? !0 : e === "false" ? !1 : e.trim() !== "" && Number.isFinite(Number(e)) ? Number(e) : e;
  }
  toNumber(e) {
    return typeof e == "number" ? e : typeof e == "boolean" ? e ? 1 : 0 : typeof e == "string" ? Number(e) : Number.NaN;
  }
  describe(e) {
    return e === f.missing ? "<missing>" : e === null ? "null" : typeof e == "string" ? `"${e}"` : typeof e == "number" || typeof e == "boolean" ? String(e) : "<object>";
  }
  label(e) {
    return e.type === "state" ? `state(${e.path})` : e.type === "event-count" ? `event-count(${e.event})` : e.type === "query" ? `query(${e.key})` : e.type === "storage" ? `storage(${e.key})` : e.type === "external" ? `external(${e.name})` : `viewed(${e.phase ?? "*"})`;
  }
  segmentsFor(e) {
    const t = this.paths.get(e);
    if (t !== void 0)
      return t;
    const s = f.parsePath(e);
    return this.paths.set(e, s), s;
  }
}
const E = {
  willChange: "mobkoi:phase:will-change",
  change: "mobkoi:phase:change",
  unchanged: "mobkoi:phase:unchanged",
  event: "mobkoi:event"
};
class _ {
  constructor(e, t) {
    this.target = e, this.onDispatchError = t;
  }
  willChange(e, t) {
    return this.dispatch(E.willChange, this.detail(e, t), !0);
  }
  change(e, t) {
    this.dispatch(E.change, this.detail(e, t), !1);
  }
  unchanged(e, t) {
    this.dispatch(E.unchanged, this.detail(e, t), !1);
  }
  engagement(e) {
    this.dispatch(E.event, e, !1);
  }
  detail(e, t) {
    return {
      creativeId: t.creativeId,
      phaseId: e?.id ?? null,
      previousPhaseId: t.previousPhase?.id ?? null,
      pageName: e?.target.pageName ?? null,
      reason: t.reason,
      timestamp: t.timestamp
    };
  }
  dispatch(e, t, s) {
    if (this.target === null || typeof CustomEvent > "u")
      return !0;
    try {
      return this.target.dispatchEvent(new CustomEvent(e, { detail: t, bubbles: !0, cancelable: s }));
    } catch (i) {
      return this.onDispatchError(i), !0;
    }
  }
}
class b extends P {
}
const ee = 2147483647, te = 2e9;
class se {
  constructor(e) {
    this.now = e, this.handle = null, this.target = null, this.callback = null;
  }
  scheduleAt(e, t) {
    this.cancel(), this.target = e, this.callback = t, e !== null && this.arm();
  }
  cancel() {
    this.handle !== null && (clearTimeout(this.handle), this.handle = null), this.target = null, this.callback = null;
  }
  arm() {
    const e = this.callback;
    if (this.target === null || e === null)
      return;
    const t = this.target - this.now();
    if (t <= 0) {
      this.handle = setTimeout(() => {
        this.handle = null, this.target = null, e();
      }, 0);
      return;
    }
    if (t > ee) {
      this.handle = setTimeout(() => {
        this.handle = null, this.arm();
      }, te);
      return;
    }
    this.handle = setTimeout(() => {
      this.handle = null, this.target = null, e();
    }, t);
  }
}
class ie {
  constructor(e) {
    this.conditions = e;
  }
  select(e) {
    const t = [], s = [];
    for (const i of e.config.phases) {
      let r = null, n = [];
      const u = i.activation?.conditions ?? null;
      if (u !== null) {
        const v = this.conditions.evaluateGroup(u, e.context);
        r = v.passed, n = v.results;
      }
      const x = r !== !1, p = e.config.progression === "forward-only" && i.order < e.maxEnteredOrder && e.activePhase?.id !== i.id, m = x && !p;
      m && s.push(i), t.push({
        phaseId: i.id,
        eligible: m,
        dateGate: null,
        conditionGate: r,
        blockedByProgression: p,
        reason: e.context.debug ? this.explain(i, r, m, p) : "",
        conditions: n
      });
    }
    if (s.length > 0)
      return { selectedPhase: s.slice().sort((r, n) => this.compare(r, n, e.config.phases))[0] ?? null, candidates: t, usedFallback: !1 };
    if (e.config.fallbackPhaseId !== null) {
      const i = e.config.phases.find((n) => n.id === e.config.fallbackPhaseId), r = i !== void 0 && e.config.progression === "forward-only" && i.order < e.maxEnteredOrder;
      if (i !== void 0 && !r)
        return { selectedPhase: i, candidates: t, usedFallback: !0 };
    }
    return { selectedPhase: e.activePhase, candidates: t, usedFallback: !1 };
  }
  compare(e, t, s) {
    return e.order !== t.order ? t.order - e.order : s.indexOf(e) - s.indexOf(t);
  }
  explain(e, t, s, i) {
    const r = [
      `order=${e.order}`,
      `conditions=${t === null ? "n/a" : t ? "pass" : "fail"}`
    ];
    return i && r.push("blocked=forward-only"), r.push(`eligible=${s ? "yes" : "no"}`), r.join(" ");
  }
}
const U = 10, O = class O {
  constructor(e, t, s) {
    this.options = e, this.now = t, this.log = s, this.memory = null, this.reportedUnavailable = !1, this.consent = e.consent, this.knownPhaseIds = new Set(e.phases.map((i) => i.id));
  }
  load() {
    const e = this.backend();
    if (e === null)
      return this.memory;
    try {
      const t = e.getItem(this.options.storage.key);
      if (t === null)
        return this.memory;
      const s = JSON.parse(t), i = this.readRecord(s);
      return i === null ? this.memory : this.isExpired(i) ? (this.clear(), null) : i;
    } catch (t) {
      return this.log.debug("stored progression could not be read", t), this.memory;
    }
  }
  save(e) {
    this.memory = e;
    const t = this.backend();
    if (t !== null)
      try {
        t.setItem(this.options.storage.key, JSON.stringify(e));
      } catch (s) {
        this.log.warn(s);
      }
  }
  clear() {
    this.memory = null;
    const e = this.backend();
    if (e !== null)
      try {
        e.removeItem(this.options.storage.key);
      } catch (t) {
        this.log.debug("stored progression could not be cleared", t);
      }
  }
  getItem(e) {
    if (e === O.previousPhaseKey)
      return this.load()?.previousPhaseId ?? void 0;
    const t = this.backend();
    if (t !== null)
      try {
        return t.getItem(e) ?? void 0;
      } catch (s) {
        this.log.debug("storage read failed", s);
        return;
      }
  }
  setConsent(e) {
    this.consent = e, this.reportedUnavailable = !1;
  }
  isExpired(e) {
    const t = this.options.storage.ttlDays;
    return t === null ? !1 : this.now() - e.createdAt > t * 24 * 60 * 60 * 1e3;
  }
  permitted() {
    return this.options.storage.mode !== "memory" && this.options.storage.allowed && this.consent.storage;
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
    const s = "__mobkoi_probe__";
    return t.setItem(s, "1"), t.removeItem(s), t;
  }
  readRecord(e) {
    if (!Object.prototype.hasOwnProperty.call(e ?? {}, "maxEnteredOrder") || typeof e != "object" || e === null)
      return null;
    const t = e;
    if (typeof t.maxEnteredOrder != "number" || !Number.isFinite(t.maxEnteredOrder) || !Array.isArray(t.enteredPhaseIds) || !t.enteredPhaseIds.every((r) => typeof r == "string") || t.previousPhaseId !== null && typeof t.previousPhaseId != "string")
      return null;
    const s = t.views;
    if (s !== void 0 && (typeof s != "object" || s === null || Array.isArray(s)))
      return null;
    const i = t.createdAt;
    return i !== void 0 && (typeof i != "number" || !Number.isFinite(i)) ? null : {
      maxEnteredOrder: t.maxEnteredOrder,
      enteredPhaseIds: t.enteredPhaseIds.slice(0, U),
      previousPhaseId: t.previousPhaseId,
      views: this.sanitiseViews(s ?? {}),
      createdAt: typeof i == "number" ? i : this.now()
    };
  }
  sanitiseViews(e) {
    const t = {};
    let s = 0;
    for (const [i, r] of Object.entries(e))
      s >= U || !this.knownPhaseIds.has(i) || !this.isViewRecord(r) || (t[i] = {
        count: Math.min(Math.floor(r.count), Number.MAX_SAFE_INTEGER),
        lastAt: r.lastAt
      }, s += 1);
    return t;
  }
  isViewRecord(e) {
    if (typeof e != "object" || e === null)
      return !1;
    const t = e;
    return typeof t.count == "number" && Number.isFinite(t.count) && t.count >= 0 && typeof t.lastAt == "number" && Number.isFinite(t.lastAt);
  }
};
O.previousPhaseKey = "previous_phase";
let L = O;
class B {
  constructor(e) {
    this.scope = e.scope, this.userInitiated = e.userInitiated;
  }
}
class K extends B {
  constructor(e, t) {
    super(e), this.actionContext = t;
  }
}
class F {
  constructor(e) {
    this.name = "celtra", this.log = e.enter("MbkCeltraChannel");
  }
  static actionContextOf(e) {
    return e instanceof K ? e.actionContext : void 0;
  }
  emit(e, t) {
    if (!e.legacyEvent)
      return !1;
    const s = typeof Creative < "u" ? Creative : void 0;
    if (typeof s?.trackCustomEventAction != "function")
      return this.log.debug("Creative API unavailable, no Celtra event for", e.legacyEvent), !1;
    const i = F.actionContextOf(t);
    if (!i)
      return this.log.warn("No ActionContext on the cause of", e.legacyEvent), !1;
    const r = e.legacyEvent;
    return s.trackCustomEventAction(i, { name: r }, () => this.log.debug("Celtra event accepted:", r)), !0;
  }
}
class re {
  constructor(e, t, s) {
    this.key = e, this.initiator = s, this.log = t.enter(`MbkCeltraContexts(${e})`);
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
    const s = this.create(!1);
    return s && (this.passive = s), s;
  }
  create(e) {
    const t = globalThis, s = this.initiator ?? t.screen ?? t.unit;
    if (typeof t.ActionContext == "function" && s)
      try {
        return new t.ActionContext(s, {
          certainlyNotCausedByUserBehavior: !e,
          consideredUserInitiatedByBrowser: e
        });
      } catch (i) {
        this.log.warn("Could not create an ActionContext, falling back to the ambient one", i);
      }
    return t.mbkCtx ?? t.ctx;
  }
}
class h {
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
      h.of(e),
      h.instance(e),
      h.path(e.scope),
      e.percent,
      e.from,
      e.to,
      e.completed,
      e.mode,
      e.legacyEvent
    ].map((s) => s === void 0 ? "" : String(s)).join("|");
  }
  /**
   * What the signal is about: the role, which instance, and where. Everything but what happened to
   * it, which is the verb and the values.
   *
   * This is what a state is keyed on: two players hold two independent states, and a `play` followed
   * by a `pause` is one subject changing rather than two things happening.
   */
  static subject(e) {
    return [e.role, h.instance(e), h.path(e.scope)].join("|");
  }
  /** `"2"`, `"vidPlayer1"`, or `""` for a singleton such as the unit. */
  static instance(e) {
    return e.index !== void 0 ? String(e.index) : e.name ?? "";
  }
  /** Containment as one string, outermost first: `"panel:2>section:3"`. */
  static path(e) {
    const t = [];
    for (let s = e; s; s = s.scope) {
      const i = h.instance(s);
      t.unshift(i ? `${s.role}:${i}` : s.role);
    }
    return t.join(">");
  }
}
class l {
  /** Query parameters for one signal. Undefined values are omitted rather than sent empty. */
  static of(e, t) {
    const s = { k: e.verb, vs1: e.role };
    return l.set(s, "vs2", e.legacyEvent), l.set(s, "vs3", e.name), l.set(s, "vs4", h.path(e.scope) || void 0), l.set(s, "vs5", e.mode), l.set(s, "vi1", e.index), l.set(s, "vi2", e.ms), l.set(s, "vi3", e.from), l.set(s, "vi4", e.to), l.set(s, "vi5", e.completed === void 0 ? void 0 : Number(e.completed)), l.set(s, "vf1", e.percent), l.set(s, "vf2", e.modeMs), l.set(s, "iid", t), s;
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
  static url(e, t, s) {
    const i = e.includes("{{event}}") ? e.replace("{{event}}", encodeURIComponent(t.legacyEvent ?? t.verb)) : e, r = i.includes("?") ? "&" : "?";
    return `${i}${r}${l.toQueryString(l.of(t, s))}`;
  }
  static set(e, t, s) {
    s != null && s !== "" && (e[t] = s);
  }
}
const g = class g {
  constructor(e) {
    this.options = e;
  }
  get endpoint() {
    return this.options.endpoint ?? this.runtimeParam(g.endpointParam) ?? g.defaults.endpoint;
  }
  get errorEndpoint() {
    return this.options.errorEndpoint ?? this.runtimeParam(g.errorEndpointParam);
  }
  get impressionId() {
    return this.options.impressionId ? this.options.impressionId : (typeof creative < "u" ? creative : void 0)?.sessionId;
  }
  get pixelFallback() {
    return this.options.pixelFallback ?? g.defaults.pixelFallback;
  }
  get log() {
    return this.options.log ?? g.defaults.log();
  }
  /** Completes the configuration in place. Later values win, undefined ones leave the current one. */
  update(e) {
    const t = Object.keys(e).reduce((s, i) => {
      const r = e[i];
      return r !== void 0 && (s[i] = r), s;
    }, {});
    this.options = { ...this.options, ...t };
  }
  runtimeParam(e) {
    const s = (typeof creative < "u" ? creative : void 0)?.runtimeParams?.[e];
    return typeof s == "string" && s ? s : void 0;
  }
};
g.endpointParam = "externalSignalTrackerURI", g.errorEndpointParam = "externalClientErrorURI", g.defaults = {
  endpoint: "https://events.mobkoi.com/engagement",
  pixelFallback: !0,
  log: () => new S("mbk")
};
let k = g;
class ne {
  constructor(e, t) {
    this.config = e, this.name = "beacon", this.log = t.enter("MbkBeaconChannel");
  }
  emit(e) {
    const t = this.config.endpoint;
    if (!t)
      return this.log.debug(`No ${k.endpointParam}, raw signal not sent`), !1;
    const s = globalThis.navigator?.sendBeacon;
    if (typeof s != "function")
      return this.log.debug("sendBeacon unavailable"), !1;
    const i = l.url(t, e, this.config.impressionId), r = s.call(globalThis.navigator, i);
    return this.log.debug(r ? "queued" : "refused", i), r;
  }
}
const D = class D {
};
D.mapping = [
  { kind: { verb: "click", role: "cta" }, legacyEvent: () => "clickSite" },
  { kind: { verb: "click", role: "unit" }, legacyEvent: () => "clickSite" }
];
let T = D;
class Q {
  constructor(e, t, s) {
    this.key = t, this.resolvers = /* @__PURE__ */ new Map(), this.log = e.enter(`MbkLegacyEvents(${t})`), this.declare(s);
  }
  /** Adds or replaces resolvers. Later declaration wins for the same kind. */
  declare(e) {
    for (const t of e) {
      if (!t?.kind || typeof t.legacyEvent != "function") {
        this.log.warn("Ignoring malformed legacy mapping", t);
        continue;
      }
      this.resolvers.set(h.of(t.kind), t.legacyEvent);
    }
    return this;
  }
  has(e) {
    return this.resolvers.has(h.of(e));
  }
  /**
   * @returns the Celtra event name for this signal, or `undefined` when no resolver is registered
   *   for its kind or when the registered one threw.
   */
  resolve(e) {
    const t = this.resolvers.get(h.of(e));
    if (t)
      try {
        const { legacyEvent: s, ...i } = e, r = t(i);
        if (typeof r != "string" || !r) {
          this.log.warn(`Resolver for ${h.of(e)} produced no name`, r);
          return;
        }
        return r;
      } catch (s) {
        this.log.warn(`Resolver for ${h.of(e)} failed, no Celtra event emitted`, s);
        return;
      }
  }
}
class oe {
  constructor(e, t) {
    this.config = e, this.name = "pixel", this.pending = /* @__PURE__ */ new Set(), this.log = t.enter("MbkPixelChannel");
  }
  emit(e) {
    const t = this.config.endpoint;
    if (!t)
      return !1;
    if (typeof Image != "function")
      return this.log.debug("Image unavailable"), !1;
    const s = l.url(t, e, this.config.impressionId), i = new Image();
    this.pending.add(i);
    const r = () => this.pending.delete(i);
    return i.onload = r, i.onerror = r, i.src = s, this.log.debug("sent", s), !0;
  }
}
class ae {
  constructor(e, t) {
    this.config = e, this.log = t.enter("MbkTrackErrorReporter");
  }
  report(e, t, s) {
    this.log.warn(`Channel "${e}" failed for ${h.of(t)}`, s);
    const i = this.config.errorEndpoint;
    if (i)
      try {
        const r = [
          `error=${encodeURIComponent(`mbkTrack:${e}`)}`,
          `reason=${encodeURIComponent(String(s?.message ?? s))}`,
          `k=${encodeURIComponent(t.verb)}`
        ], n = this.config.impressionId;
        n && r.push(`iid=${encodeURIComponent(n)}`);
        const u = `${i}${i.includes("?") ? "&" : "?"}${r.join("&")}`;
        globalThis.navigator?.sendBeacon?.(u);
      } catch (r) {
        this.log.debug("Could not report the channel failure", r);
      }
  }
}
class G extends V {
}
class le {
  constructor(e, t, s) {
    this.impression = e, this.document = t, this.flushables = /* @__PURE__ */ new Set(), this.flushed = /* @__PURE__ */ new Set(), this.hidden = !1, this.started = !1, this.onVisibilityChange = () => {
      this.document.visibilityState === "hidden" ? this.hide("visibilitychange") : this.show("visibilitychange");
    }, this.onPageHide = () => {
      this.hide("pagehide");
    }, this.onPageShow = (i) => {
      i.persisted && this.document.visibilityState === "visible" && this.show("pageshow");
    }, this.log = s.enter("MbkVisibilityLifecycle");
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
    for (const s of [...this.flushables])
      this.flush(s, t, e);
  }
  /** The return to visible resumes every segment a flush closed, all at one instant. */
  show(e) {
    this.hidden = !1;
    const t = this.impression.elapsedMs();
    for (const s of [...this.flushed])
      this.flushed.delete(s), this.log.debug(`${e}: resuming a segment at ${t}ms`), this.invoke(s, "resume", t);
  }
  flush(e, t, s) {
    if (this.flushed.has(e)) {
      this.log.debug(`${s}: segment already flushed, skipping`);
      return;
    }
    this.flushed.add(e), this.log.debug(`${s}: flushing a segment at ${t}ms`), this.invoke(e, "flush", t);
  }
  /** One script's hook, isolated: it can fail without keeping the others from closing theirs. */
  invoke(e, t, s) {
    try {
      e[t](s);
    } catch (i) {
      this.log.error(new G(`Segment ${t} hook failed at ${s}ms`, i));
    }
  }
}
const a = class a {
  constructor(e) {
    this.tracks = /* @__PURE__ */ new Map(), this.emitted = /* @__PURE__ */ new Set(), this.states = /* @__PURE__ */ new Map(), this.config = new k(e), this.log = this.config.log.enter("MbkImpression"), this.startedAt = a.now(), this.beacon = new ne(this.config, this.log), this.pixel = new oe(this.config, this.log), this.reporter = new ae(this.config, this.log), this.coreLegacyEvents = new Q(this.log, "core", T.mapping), this.visibility = new le(this, globalThis.document, this.log);
  }
  /** The one impression of this creative, created on first use. */
  static shared(e) {
    const t = a.storage(), s = t[a.storageKey];
    if (s)
      return s.configure(e), s;
    const i = new a(e);
    return t[a.storageKey] = i, i;
  }
  /** Releases and drops it. For tests, and for a creative that reloads its scripts. */
  static reset() {
    const e = a.storage();
    e[a.storageKey]?.release(), delete e[a.storageKey];
  }
  /**
   * Stash on `unit` when available, else on the window, following the precedent set by
   * `CreativeScript` / `setup()` is the precedent for a per-creative singleton.
   */
  static storage() {
    const e = globalThis;
    return e.unit ? e.unit : (e[a.windowStorageKey] || (e[a.windowStorageKey] = {}), e[a.windowStorageKey]);
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
  track(e, t, s) {
    const i = this.tracks.get(e);
    if (i) {
      if (!(i instanceof s))
        throw new G(
          `"${e}" is already tracked as a ${i.constructor.name}, not a ${s.name}. Every instance of one script must pick the same specialisation.`
        );
      return i;
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
    return this.emitted.size > 0 || this.states.size > 0 ? (this.log.debug("Impression start not moved: signals were already emitted"), !1) : (this.startedAt = a.now(), !0);
  }
  /** Milliseconds since the start of the impression. */
  elapsedMs() {
    return Math.round(a.now() - this.startedAt);
  }
  /**
   * Clears deduplication for one media player so a new DOM instance can re-emit quartiles and
   * play/pause states after Celtra swaps the <video> on in-creative page navigation.
   */
  forgetMedia(e) {
    const t = `:media|${e}|`, s = `media|${e}`;
    for (const i of [...this.emitted])
      i.includes(t) && this.emitted.delete(i);
    for (const i of [...this.states.keys()])
      i.startsWith(s) && this.states.delete(i);
  }
  /**
   * Whether this signal goes out under that emission, recording what it needs to for the next one.
   *
   * Everything is recorded **synchronously**, before any channel: this is the CustomWipeable defect,
   * where the flag was pushed inside the asynchronous tracking callback so two calls could both pass.
   */
  admits(e, t) {
    const s = h.signature(e);
    switch (t) {
      case "repeated":
        return !0;
      case "once":
        return this.emitted.has(s) ? (this.log.debug("Already emitted, skipping", s), !1) : (this.emitted.add(s), !0);
      case "state": {
        const i = h.subject(e);
        return this.states.get(i) === s ? (this.log.debug("Unchanged, skipping", s), !1) : (this.states.set(i, s), !0);
      }
    }
  }
  /** The raw channels: the beacon, then the image pixel when the beacon did not take it. */
  emitRaw(e, t) {
    !this.send(this.beacon, e, t) && this.config.pixelFallback && this.send(this.pixel, e, t);
  }
  /** One channel, isolated: it can fail without touching the others. */
  send(e, t, s) {
    try {
      return e.emit(t, s);
    } catch (i) {
      return this.reporter.report(e.name, t, i), !1;
    }
  }
};
a.storageKey = "mbkImpression", a.windowStorageKey = "__mbkTrackStorage";
let C = a;
class A {
  constructor(e, t) {
    this.impression = e, this.key = t, this.log = e.log.enter(`${this.constructor.name}(${t})`), this.legacyEvents = new Q(this.log, t, []);
  }
  /**
   * The track of that script, created on first use, completed with its dictionary.
   *
   * The instance is read and dropped: nothing here keeps a reference to a partially constructed
   * object.
   */
  static shared(e, t) {
    const s = C.shared(t);
    return s.track(e.trackingKey, () => new A(s, e.trackingKey), A).declare(e.legacyEventsMapping);
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
    return new B(e);
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
  emit(e, t, s) {
    const i = { ...e, ms: this.impression.elapsedMs() };
    !i.scope && t.scope && (i.scope = t.scope), this.impression.admits(i, s) && (i.legacyEvent = e.legacyEvent ?? this.resolveLegacyEvent(i), this.log.debug("emit", i), this.emitChannels(i, t));
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
    return t || this.log.debug(`No resolver for ${h.of(e)}, raw signal only`), t;
  }
}
class I extends A {
  /**
   * @throws when the same script is already tracked as a plain {@link MbkTrack}. See
   *   {@link MbkImpression.track}.
   */
  static shared(e, t) {
    const s = C.shared(t), i = s.track(
      e.trackingKey,
      () => new I(s, e.trackingKey, t.initiator),
      I
    );
    return i.contexts.useInitiator(t.initiator), i.declare(e.legacyEventsMapping);
  }
  constructor(e, t, s) {
    super(e, t), this.contexts = new re(t, this.log, s), this.celtra = new F(this.log);
  }
  /**
   * A Celtra context, carrying the `ActionContext` this cause's legacy events are fired with: the
   * one the call site forwarded from its handler, else a fresh user-initiated one when the cause is
   * a gesture, else this script's common passive one.
   */
  context(e) {
    const t = e.actionContext ?? this.contexts.forCause(e.userInitiated);
    return new K(e, t);
  }
  /** The legacy event first, unchanged, then the raw channels. */
  emitChannels(e, t) {
    this.impression.send(this.celtra, e, t), super.emitChannels(e, t);
  }
}
class he {
  constructor(e, t) {
    this.trackingKey = "phase", this.unitLegacy = { verb: "legacy", role: "unit" }, this.legacyEventsMapping = [], this.track = I.shared(this, {}), this.log = t.enter("PhaseTracking"), this.impression = this.track.context({
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
class ce {
  constructor(e, t, s, i, r) {
    this.root = e, this.minRatio = t, this.minDurationMs = s, this.onQualified = i, this.documentRef = r, this.observer = null, this.timer = null, this.lastRatio = 0, this.onVisibility = () => this.syncVisibility();
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
const R = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]), c = class c {
  constructor(e, t, s) {
    this.context = e, this.options = t, this.scriptName = s, this.log = M.enter(this.scriptName), this.now = () => Date.now(), this.consent = {
      measurement: !0,
      personalisation: !1,
      storage: !0
    }, this.state = this.freshState(), this.activePhase = null, this.lastDecision = null, this.createdAt = null, this.started = !1, this.destroyed = !1, this.listenersAttached = !1, this.countOnDisplay = !1, this.reportedViewability = !1, this.transitionSequence = 0, this.query = null, this.viewability = null, this.onVisibility = () => {
      document.visibilityState === "visible" && this.evaluate("visibility");
    }, this.onFocus = () => {
      this.evaluate("focus");
    }, this.events = new _(
      typeof document > "u" ? null : document,
      (i) => this.log.warn(i)
    ), this.options.storage.key.length === 0 && (this.options.storage.key = `mobkoi-phase:${this.creativeId}`), this.selector = new ie(new Y()), this.scheduler = new se(this.now), this.storage = new L(this.options, this.now, this.log), this.tracking = new he(this.context.ctx, this.log), this.consent = {
      measurement: this.options.consent.measurement,
      personalisation: this.options.consent.personalisation,
      storage: this.options.consent.storage
    }, this.restore();
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
    this.attachListeners(), this.options.debug && this.log.debug("tagservice", this.tagservice), this.evaluate("start");
  }
  stop() {
    this.started && (this.started = !1, this.scheduler.cancel(), this.detachListeners(), this.viewability?.stop());
  }
  destroy() {
    this.destroyed || (this.stop(), this.destroyed = !0, this.scheduler.cancel(), this.detachListeners(), this.viewability?.stop(), this.activePhase = null, this.lastDecision = null, this.state = this.freshState(), this.query = null);
  }
  get creativeId() {
    return this.context.creative.id || "mobkoi-creative";
  }
  get tagservice() {
    return typeof this.options.tagservice == "boolean" ? this.options.tagservice : this.context.creative.runtimeParams?.isTagservice === !0;
  }
  evaluate(e = "manual") {
    return this.runEvaluation(e);
  }
  getActivePhase() {
    return this.activePhase;
  }
  getState() {
    const e = {};
    for (const [t, s] of Object.entries(this.state.views))
      e[t] = { count: s.count, lastAt: s.lastAt };
    return {
      values: { ...this.state.values },
      eventCounts: { ...this.state.eventCounts },
      lastEvents: { ...this.state.lastEvents },
      maxEnteredOrder: this.state.maxEnteredOrder,
      enteredPhaseIds: [...this.state.enteredPhaseIds],
      views: e
    };
  }
  setState(e, t = null) {
    if (!this.destroyed) {
      if (typeof e != "object" || e === null || Array.isArray(e))
        throw new b("setState() requires a plain object.");
      this.mergeValues(this.state.values, e), (t === null || t.evaluate) && this.evaluate("state");
    }
  }
  emit(e, t = null) {
    if (this.destroyed)
      return;
    if (e.length === 0)
      throw new b("emit() requires a non-empty event name.");
    if (!Object.prototype.hasOwnProperty.call(this.state.eventCounts, e) && Object.keys(this.state.eventCounts).length >= c.maxEventNames) {
      this.log.warn("Event name limit reached; event ignored.");
      return;
    }
    this.state.eventCounts[e] = (this.state.eventCounts[e] ?? 0) + 1, t !== null && (this.state.lastEvents[e] = this.boundPayload(t)), this.events.engagement({
      creativeId: this.creativeId,
      eventName: e,
      count: this.state.eventCounts[e] ?? 0,
      phaseId: this.activePhase?.id ?? null,
      timestamp: this.now()
    }), this.evaluate("event");
  }
  setConsent(e) {
    if (this.destroyed)
      return;
    const t = {
      measurement: e.measurement ?? this.consent.measurement,
      personalisation: e.personalisation ?? this.consent.personalisation,
      storage: e.storage ?? this.consent.storage
    };
    this.consent = t, this.storage.setConsent(t), this.evaluate("consent");
  }
  reset(e = null) {
    if (this.destroyed)
      return;
    const t = e?.state ?? !0, s = e?.progression ?? !0, i = e?.tracking ?? !0;
    t && (this.state.values = /* @__PURE__ */ Object.create(null), this.state.eventCounts = /* @__PURE__ */ Object.create(null), this.state.lastEvents = /* @__PURE__ */ Object.create(null)), s && (this.state.maxEnteredOrder = 0, this.activePhase = null, this.state.views = /* @__PURE__ */ Object.create(null)), i && (this.state.enteredPhaseIds = []), (s || i) && (this.storage.clear(), this.createdAt = null), this.evaluate("reset");
  }
  getLastDecision() {
    return this.lastDecision;
  }
  runEvaluation(e) {
    if (this.destroyed)
      return this.lastDecision ?? this.emptyDecision(e);
    const t = this.now(), s = this.selector.select({
      config: this.options,
      context: this.conditionContext(),
      maxEnteredOrder: this.state.maxEnteredOrder,
      activePhase: this.activePhase
    });
    if (s.selectedPhase === null)
      throw new b("No eligible phase and no usable fallback phase.");
    const i = {
      selectedPhase: s.selectedPhase,
      previousPhase: this.activePhase,
      changed: s.selectedPhase.id !== this.activePhase?.id,
      reason: e,
      evaluatedAt: t,
      nextEvaluationAt: null,
      candidates: s.candidates,
      usedFallback: s.usedFallback
    };
    if (this.lastDecision = i, this.options.debug && this.log.debug(e, i.selectedPhase?.id ?? "none", i.usedFallback ? "fallback" : ""), e === "viewable") {
      const r = i.selectedPhase ?? this.activePhase;
      return r !== null && this.announce(r, this.changeContext(i)), i;
    }
    return i.changed && i.selectedPhase !== null ? this.display(i) : i.selectedPhase !== null && this.events.unchanged(i.selectedPhase, this.changeContext(i)), this.scheduleNext(i.nextEvaluationAt), i;
  }
  display(e) {
    const t = e.selectedPhase;
    if (t === null)
      return;
    const s = ++this.transitionSequence, i = this.changeContext(e);
    if (!this.events.willChange(t, i)) {
      this.log.warn(`Phase transition to "${t.id}" was cancelled.`);
      return;
    }
    this.announce(t, i), this.commitDisplay(t, e, s);
  }
  commitDisplay(e, t, s) {
    if (this.destroyed || s !== this.transitionSequence)
      return;
    const i = this.changeContext(t);
    this.activePhase = e, e.order > this.state.maxEnteredOrder && (this.state.maxEnteredOrder = e.order), !this.state.enteredPhaseIds.includes(e.id) && this.state.enteredPhaseIds.length < c.maxViews && this.state.enteredPhaseIds.push(e.id), this.tracking.enter(e.id), this.deferViews() ? this.persist() : this.recordView(e, t.evaluatedAt), this.events.change(e, i), this.beginViewability();
  }
  announce(e, t) {
    if (t.reason === "viewable") {
      this.options.debug && this.log.debug("viewable", e.id, this.getState()), this.stop();
      return;
    }
    this.present(e);
  }
  present(e) {
    const t = e.target.pageName, s = this.host().find(t);
    if (!s)
      throw new b(`Celtra screen "${t}" was not found.`);
    const i = this.host();
    if (!i.goToScreenAction || !this.context.ctx)
      throw new b("Celtra screen navigation is not available.");
    i.goToScreenAction(this.context.ctx, { screen: s }, () => {
    });
  }
  beginViewability() {
    if (!this.deferViews())
      return;
    const e = this.currentRoot();
    if (e !== null) {
      this.watch(e);
      return;
    }
    const t = this.context.unit.getNode;
    if (typeof t == "function") {
      t.call(this.context.unit, () => {
        if (!this.started || this.destroyed || this.countOnDisplay)
          return;
        const s = this.currentRoot();
        if (s !== null) {
          this.watch(s);
          return;
        }
        this.failOpen("unit.node did not resolve to an element. Views are counted when a phase is displayed.");
      });
      return;
    }
    this.failOpen("unit.node did not resolve to an element. Views are counted when a phase is displayed.");
  }
  watch(e) {
    this.viewability?.stop(), this.viewability = new ce(
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
    const s = this.state.views[e.id];
    if (e.behaviour.viewableOnce && (s?.count ?? 0) >= 1)
      return !1;
    if (s !== void 0)
      s.count += 1, s.lastAt = t;
    else if (Object.keys(this.state.views).length < c.maxViews)
      this.state.views[e.id] = { count: 1, lastAt: t };
    else
      return !1;
    return this.persist(), this.tracking.viewed(e.id), !0;
  }
  deferViews() {
    return this.options.viewability.enabled && this.options.viewability.requireViewable && !this.countOnDisplay;
  }
  currentRoot() {
    return this.context.unit.node ?? null;
  }
  persist() {
    this.createdAt === null && (this.createdAt = this.now());
    const e = {
      maxEnteredOrder: this.state.maxEnteredOrder,
      enteredPhaseIds: this.state.enteredPhaseIds.slice(0, c.maxViews),
      previousPhaseId: this.activePhase?.id ?? null,
      views: this.state.views,
      createdAt: this.createdAt
    };
    this.storage.save(e);
  }
  restore() {
    const e = this.storage.load();
    e !== null && (this.state.maxEnteredOrder = e.maxEnteredOrder, this.state.enteredPhaseIds = e.enteredPhaseIds.slice(), this.state.views = { ...e.views }, this.createdAt = e.createdAt);
  }
  scheduleNext(e) {
    this.destroyed || !this.started || this.scheduler.scheduleAt(e, () => this.evaluate("schedule"));
  }
  conditionContext() {
    return {
      state: this.state,
      getQueryValue: (e) => this.queryValue(e),
      getStoredValue: (e) => this.storage.getItem(e),
      getExternalValue: (e) => this.externalValue(e),
      debug: this.options.debug
    };
  }
  queryValue(e) {
    if (this.query === null) {
      const t = typeof location > "u" ? "" : location.search;
      this.query = new URLSearchParams(t);
    }
    return this.query.get(e) ?? void 0;
  }
  externalValue(e) {
    const t = this.state.values.external;
    if (typeof t == "object" && t !== null && !Array.isArray(t) && Object.prototype.hasOwnProperty.call(t, e))
      return t[e];
  }
  changeContext(e) {
    return {
      creativeId: this.creativeId,
      previousPhase: e.previousPhase,
      reason: e.reason,
      timestamp: e.evaluatedAt
    };
  }
  attachListeners() {
    this.listenersAttached || (document.addEventListener("visibilitychange", this.onVisibility), window.addEventListener("focus", this.onFocus), this.listenersAttached = !0);
  }
  detachListeners() {
    this.listenersAttached && (document.removeEventListener("visibilitychange", this.onVisibility), window.removeEventListener("focus", this.onFocus), this.listenersAttached = !1);
  }
  host() {
    return this.context.unit;
  }
  freshState() {
    return {
      values: /* @__PURE__ */ Object.create(null),
      eventCounts: /* @__PURE__ */ Object.create(null),
      lastEvents: /* @__PURE__ */ Object.create(null),
      maxEnteredOrder: 0,
      enteredPhaseIds: [],
      views: /* @__PURE__ */ Object.create(null)
    };
  }
  emptyDecision(e) {
    return {
      selectedPhase: null,
      previousPhase: null,
      changed: !1,
      reason: e,
      evaluatedAt: this.now(),
      nextEvaluationAt: null,
      candidates: [],
      usedFallback: !1
    };
  }
  mergeValues(e, t) {
    for (const [s, i] of Object.entries(t)) {
      if (R.has(s) || Object.keys(e).length >= c.maxStateKeys && !(s in e))
        continue;
      if (typeof i == "object" && i !== null && !Array.isArray(i)) {
        const n = e[s], u = typeof n == "object" && n !== null && !Array.isArray(n) ? n : /* @__PURE__ */ Object.create(null);
        let x = 0;
        for (const [p, m] of Object.entries(i)) {
          if (R.has(p))
            continue;
          if (x += 1, x > c.maxStateKeys)
            break;
          const v = this.scalar(m);
          v !== void 0 && (u[p] = v);
        }
        e[s] = u;
        continue;
      }
      const r = this.scalar(i);
      r !== void 0 && (e[s] = r);
    }
  }
  boundPayload(e) {
    const t = {};
    let s = 0;
    for (const [i, r] of Object.entries(e)) {
      if (R.has(i))
        continue;
      if (s += 1, s > c.maxPayloadFields)
        break;
      const n = this.scalar(r);
      n !== void 0 && (t[i] = n);
    }
    return t;
  }
  scalar(e) {
    if (e === null)
      return null;
    if (typeof e == "string")
      return e.length > c.maxStringLength ? e.slice(0, c.maxStringLength) : e;
    if (typeof e == "number")
      return Number.isFinite(e) ? e : void 0;
    if (typeof e == "boolean")
      return e;
  }
};
c.maxEventNames = 32, c.maxPayloadFields = 8, c.maxStateKeys = 64, c.maxViews = 10, c.maxStringLength = 256;
let q = c;
class ue extends N {
  constructor() {
    super(...arguments), this.name = "PhaseOrchestrator", this.defaultConfig = W;
  }
  create(e, t) {
    return new q(e, t, this.name);
  }
}
const de = (o) => new ue().init(o);
export {
  de as setup
};
