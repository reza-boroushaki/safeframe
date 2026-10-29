/*! Copyright Mobkoi 2026 (v5.5.1) */
const O = {
  sticky: !1,
  enterOnce: !1,
  viewedOnce: !1,
  viewableOnce: !1
}, E = {
  onEnter: [],
  onExit: [],
  onViewed: []
}, U = {
  startsAt: null,
  endsAt: null,
  eligibilityMode: "all",
  conditions: {
    mode: "all",
    items: [{ type: "viewed", phase: "phase-1", operator: "gte", value: 1 }]
  }
}, B = {
  startsAt: null,
  endsAt: null,
  eligibilityMode: "all",
  conditions: {
    mode: "all",
    items: [{ type: "viewed", phase: "phase-2", operator: "gte", value: 1 }]
  }
}, K = {
  creativeId: "",
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
  tracking: {
    enabled: !1,
    impressionId: null,
    commonQuery: {},
    allowedHosts: ["events.mobkoi.com"]
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
    requireViewable: !0,
    root: null
  },
  phases: [
    {
      id: "phase-1",
      order: 1,
      priority: 0,
      enabled: !0,
      target: { pageName: "p1", sceneName: null, phaseKey: null },
      activation: null,
      behaviour: O,
      tracking: E,
      metadata: {}
    },
    {
      id: "phase-2",
      order: 2,
      priority: 0,
      enabled: !0,
      target: { pageName: "p2", sceneName: null, phaseKey: null },
      activation: U,
      behaviour: O,
      tracking: E,
      metadata: {}
    },
    {
      id: "phase-3",
      order: 3,
      priority: 0,
      enabled: !0,
      target: { pageName: "p3", sceneName: null, phaseKey: null },
      activation: B,
      behaviour: O,
      tracking: E,
      metadata: {}
    }
  ],
  onPhase: null,
  onPhaseExit: null,
  onError: null,
  getExternalCondition: null
};
class _ {
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
    return this.add(new _(e));
  }
  add(e) {
    return e.parent = this, e;
  }
}
const H = new _("MOBKOI");
class x extends Error {
  constructor(e, t = void 0) {
    super(e), this.name = new.target.name, this.cause = typeof t == "string" ? new x(t, void 0) : t;
  }
  toString() {
    return super.toString() + (this.cause ? `
	because of:
` + this.cause.toString() : "");
  }
}
const G = H.enter("Celtra");
class w extends x {
}
function P(g) {
  return !!(g && typeof g.find == "function");
}
function I(g) {
  return globalThis[g];
}
class z {
  resolve(e = {}) {
    const t = this.resolveCreative(e.creative);
    if (!t)
      throw new w('Celtra context: "creative" not found');
    const s = this.resolveScreen(t, e.screen);
    if (!s)
      throw new w('Celtra context: "screen" is missing or not a Celtra screen');
    const i = this.resolveUnit(t, e.unit, s);
    if (!i)
      throw new w('Celtra context: "unit" not found');
    const r = this.resolveCtx(e.ctx, s);
    return { creative: t, unit: i, screen: s, ctx: r };
  }
  resolveCreative(e) {
    return e ?? I("creative");
  }
  resolveScreen(e, t) {
    if (P(t))
      return t;
    if (typeof e?.getScreen == "function") {
      const i = e.getScreen();
      if (P(i))
        return i;
    }
    const s = I("screen");
    return P(s) ? s : void 0;
  }
  resolveUnit(e, t, s) {
    return t ?? e?.getUnit?.() ?? s?.getUnit?.() ?? I("unit");
  }
  resolveCtx(e, t) {
    const s = e ?? I("ctx") ?? I("mbkCtx");
    return s || !t || typeof ActionContext > "u" ? s : new ActionContext(t, {
      certainlyNotCausedByUserBehavior: !1,
      consideredUserInitiatedByBrowser: !1
    });
  }
}
const Q = new z(), p = class p {
  static deepMerge(e, t) {
    const s = { ...e };
    for (const i of Object.keys(t)) {
      const r = t[i], o = e[i];
      r !== void 0 && (p.isPlainObject(o) && p.isPlainObject(r) ? s[i] = p.deepMerge(
        o,
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
      if (s.length === 0 || p.forbiddenPathSegment(s) || !/^[A-Za-z0-9_$-]+$/.test(s))
        return null;
    return t;
  }
  /** Read an own property chain. Returns {@link ObjectUtil.missing} when any segment is absent. */
  static readPath(e, t) {
    let s = e;
    for (const i of t) {
      if (p.forbiddenPathSegment(i) || s === null || typeof s != "object" && typeof s != "function" || !Object.prototype.hasOwnProperty.call(s, i))
        return p.missing;
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
p.missing = /* @__PURE__ */ Symbol("missing");
let h = p;
const v = class v {
  constructor() {
    this.contextResolver = Q;
  }
  init(e) {
    const t = G.enter(this.name), s = this.contextResolver.resolve(e), i = s.unit ?? s.screen, r = v.registry.get(i);
    if (r)
      return t.debug("already initialized"), r;
    const o = h.deepMerge(this.defaultConfig, e), a = this.create(s, o);
    return v.registry.set(i, a), a.start(), a;
  }
};
v.registry = /* @__PURE__ */ new WeakMap();
let k = v;
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
      return s === null ? h.missing : h.readPath(t.state.values, s);
    }
    if (e.type === "event-count")
      return t.state.eventCounts[e.event] ?? 0;
    if (e.type === "query") {
      const s = t.getQueryValue(e.key);
      return s === void 0 ? h.missing : this.coerceScalar(s);
    }
    if (e.type === "storage") {
      const s = t.getStoredValue(e.key);
      return s === void 0 ? h.missing : this.coerceScalar(s);
    }
    if (e.type === "external") {
      const s = t.getExternalValue(e.name);
      return s === void 0 ? h.missing : s;
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
    const i = t !== h.missing && t !== void 0;
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
      const r = this.toNumber(t), o = typeof s == "number" ? s : Number.NaN;
      return !Number.isFinite(r) || !Number.isFinite(o) ? !1 : e === "gt" ? r > o : e === "gte" ? r >= o : e === "lt" ? r < o : r <= o;
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
    const r = typeof s == "string" ? this.coerceScalar(s) : s, o = typeof i == "string" ? this.coerceScalar(i) : i;
    return r === o;
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
    return e === h.missing ? "<missing>" : e === null ? "null" : typeof e == "string" ? `"${e}"` : typeof e == "number" || typeof e == "boolean" ? String(e) : "<object>";
  }
  label(e) {
    return e.type === "state" ? `state(${e.path})` : e.type === "event-count" ? `event-count(${e.event})` : e.type === "query" ? `query(${e.key})` : e.type === "storage" ? `storage(${e.key})` : e.type === "external" ? `external(${e.name})` : `viewed(${e.phase ?? "*"})`;
  }
  segmentsFor(e) {
    const t = this.paths.get(e);
    if (t !== void 0)
      return t;
    const s = h.parsePath(e);
    return this.paths.set(e, s), s;
  }
}
class n extends w {
  constructor(e, t, s = null, i) {
    super(t, i), this.code = e, this.details = s;
  }
  static config(e, t, s, i = null) {
    return new n(e, `${t}: ${s}`, { path: t, ...i });
  }
  static from(e, t, s = null) {
    if (e instanceof n)
      return e;
    const i = e instanceof Error ? e.message : "Unknown error";
    return new n(t, i, s, e);
  }
  toDetail() {
    return {
      name: "PhaseOrchestratorError",
      code: this.code,
      message: this.message,
      details: this.details
    };
  }
}
const T = /* @__PURE__ */ new Set(["exists", "not-exists"]), J = /* @__PURE__ */ new Set(["in", "not-in"]), W = /* @__PURE__ */ new Set(["gt", "gte", "lt", "lte"]), S = /* @__PURE__ */ new Set([
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "not-in",
  "exists",
  "not-exists"
]), $ = /* @__PURE__ */ new Set(["state", "event-count", "query", "storage", "external", "viewed"]), Z = /^\d{4}-\d{2}-\d{2}[Tt]\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?([Zz]|[+-]\d{2}:\d{2})$/, j = [
  "creative_id",
  "phase_id",
  "previous_phase_id",
  "scene_name",
  "reason",
  "timestamp",
  "impression_id",
  "event_name"
], C = /\{([^{}]*)\}/g, b = class b {
  resolve(e) {
    if (!h.isPlainObject(e))
      throw n.config("INVALID_CONFIG", "config", "must be an object.");
    const t = e.creativeId;
    if (typeof t != "string" || t.trim().length === 0)
      throw n.config("INVALID_CONFIG", "config.creativeId", "must be a non-empty string.");
    const s = this.readBoolean(e.debug, !1, "config.debug"), i = e.tagservice === !0, r = e.progression ?? "forward-only";
    if (r !== "forward-only" && r !== "dynamic")
      throw n.config(
        "INVALID_CONFIG",
        "config.progression",
        'must be either "forward-only" or "dynamic".'
      );
    const o = this.readStorage(e.storage, t), a = this.readTracking(e.tracking), l = this.readConsent(e.consent), u = this.readViewability(e.viewability), c = e.phases;
    if (!Array.isArray(c))
      throw n.config("INVALID_CONFIG", "config.phases", "must be an array.");
    if (c.length < b.minPhases || c.length > b.maxPhases)
      throw n.config(
        "INVALID_PHASE_COUNT",
        "config.phases",
        `must contain between ${b.minPhases} and ${b.maxPhases} phases (received ${c.length}).`,
        { count: c.length }
      );
    const d = { allowedHosts: a.allowedHosts, requireHttps: !s }, m = c.map((M, q) => this.readPhase(M, q, d));
    this.assertUniquePhases(m), this.assertViewedReferences(m);
    const N = this.readFallback(e.fallbackPhaseId, m);
    return Object.freeze({
      version: 1,
      creativeId: t,
      debug: s,
      tagservice: i,
      progression: r,
      fallbackPhaseId: N,
      storage: o,
      tracking: a,
      consent: l,
      viewability: u,
      phases: m
    });
  }
  readStorageMode(e) {
    const t = e ?? "memory";
    if (t === "memory" || t === "session" || t === "local")
      return t;
    throw n.config(
      "INVALID_CONFIG",
      "config.storage.mode",
      'must be "memory", "session" or "local".'
    );
  }
  readBoolean(e, t, s) {
    const i = e ?? t;
    if (typeof i != "boolean")
      throw n.config("INVALID_CONFIG", s, "must be a boolean.");
    return i;
  }
  readStorage(e, t) {
    const s = e ?? {};
    if (!h.isPlainObject(s))
      throw n.config("INVALID_CONFIG", "config.storage", "must be an object.");
    const i = this.readStorageMode(s.mode), r = this.readBoolean(s.allowed, !1, "config.storage.allowed"), o = s.key, a = typeof o == "string" && o.length > 0 ? o : `mobkoi-phase:${t}`;
    if (o !== void 0 && o !== "" && typeof o != "string")
      throw n.config("INVALID_CONFIG", "config.storage.key", "must be a non-empty string.");
    const l = s.ttlDays;
    let u = 30;
    if (l === null)
      u = null;
    else if (l !== void 0) {
      if (typeof l != "number" || !Number.isFinite(l) || l <= 0)
        throw n.config(
          "INVALID_CONFIG",
          "config.storage.ttlDays",
          "must be a positive number of days, or null for no expiry."
        );
      u = l;
    }
    return { mode: i, key: a, allowed: r, ttlDays: u };
  }
  readTracking(e) {
    const t = e ?? { enabled: !1 };
    if (!h.isPlainObject(t))
      throw n.config("INVALID_CONFIG", "config.tracking", "must be an object.");
    const s = this.readBoolean(t.enabled, !1, "config.tracking.enabled"), i = t.impressionId;
    if (i != null && typeof i != "string")
      throw n.config("INVALID_CONFIG", "config.tracking.impressionId", "must be a string.");
    const r = typeof i == "string" ? i : null, o = t.allowedHosts ?? [];
    if (!Array.isArray(o))
      throw n.config(
        "INVALID_CONFIG",
        "config.tracking.allowedHosts",
        "must be an array of hostnames."
      );
    const a = o.map((c, d) => {
      if (typeof c != "string" || c.trim().length === 0)
        throw n.config(
          "INVALID_CONFIG",
          `config.tracking.allowedHosts[${d}]`,
          "must be a non-empty hostname string."
        );
      return c.toLowerCase();
    }), l = t.commonQuery ?? {};
    if (!h.isPlainObject(l))
      throw n.config("INVALID_CONFIG", "config.tracking.commonQuery", "must be an object.");
    const u = {};
    for (const [c, d] of Object.entries(l)) {
      if (typeof d != "string" && typeof d != "number" && typeof d != "boolean")
        throw n.config(
          "INVALID_CONFIG",
          `config.tracking.commonQuery.${c}`,
          "must be a string, number or boolean."
        );
      u[c] = d;
    }
    return { enabled: s, impressionId: r, commonQuery: u, allowedHosts: a };
  }
  readConsent(e) {
    const t = e ?? {};
    if (!h.isPlainObject(t))
      throw n.config("INVALID_CONFIG", "config.consent", "must be an object.");
    return {
      measurement: this.readBoolean(t.measurement, !0, "config.consent.measurement"),
      personalisation: this.readBoolean(t.personalisation, !1, "config.consent.personalisation"),
      storage: this.readBoolean(t.storage, !1, "config.consent.storage")
    };
  }
  readViewability(e) {
    const t = e ?? {};
    if (!h.isPlainObject(t))
      throw n.config("INVALID_CONFIG", "config.viewability", "must be an object.");
    const s = this.readBoolean(t.enabled, !0, "config.viewability.enabled"), i = t.minPercent ?? 50;
    if (typeof i != "number" || !Number.isFinite(i) || i < 0 || i > 100)
      throw n.config(
        "INVALID_CONFIG",
        "config.viewability.minPercent",
        "must be a number from 0 to 100."
      );
    const r = t.minDurationMs ?? 1e3;
    if (typeof r != "number" || !Number.isFinite(r) || r <= 0)
      throw n.config(
        "INVALID_CONFIG",
        "config.viewability.minDurationMs",
        "must be a positive number of milliseconds."
      );
    const o = this.readBoolean(t.requireViewable, !0, "config.viewability.requireViewable"), a = t.root ?? null;
    if (a !== null && !(a instanceof HTMLElement))
      throw n.config(
        "INVALID_CONFIG",
        "config.viewability.root",
        "must be an element or null."
      );
    return { enabled: s, minPercent: i, minDurationMs: r, requireViewable: o, root: a };
  }
  readFallback(e, t) {
    if (e == null)
      return null;
    if (typeof e != "string")
      throw n.config("INVALID_CONFIG", "config.fallbackPhaseId", "must be a string.");
    if (!t.some((s) => s.id === e))
      throw n.config(
        "INVALID_CONFIG",
        "config.fallbackPhaseId",
        "must match the id of a configured phase.",
        { fallbackPhaseId: e }
      );
    return e;
  }
  assertUniquePhases(e) {
    const t = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
    for (const i of e) {
      if (t.has(i.id))
        throw n.config(
          "DUPLICATE_PHASE_ID",
          `phases[${i.index}].id`,
          "is duplicated.",
          { phaseId: i.id }
        );
      if (t.add(i.id), s.has(i.order))
        throw n.config(
          "DUPLICATE_PHASE_ORDER",
          `phases[${i.index}].order`,
          "is duplicated. Phase orders must be unique so progression is unambiguous.",
          { phaseId: i.id, order: i.order }
        );
      s.add(i.order);
    }
  }
  assertViewedReferences(e) {
    const t = new Set(e.map((s) => s.id));
    for (const s of e)
      (s.conditions?.items ?? []).forEach((r, o) => {
        if (!(r.type !== "viewed" || r.phase === null) && !t.has(r.phase))
          throw n.config(
            "INVALID_CONDITION",
            `phases[${s.index}].activation.conditions.items[${o}].phase`,
            "must match the id of a configured phase.",
            { phaseId: s.id, referencedPhaseId: r.phase }
          );
      });
  }
  readPhase(e, t, s) {
    const i = `phases[${t}]`;
    if (!h.isPlainObject(e))
      throw n.config("INVALID_CONFIG", i, "must be an object.");
    const r = e.id;
    if (typeof r != "string" || r.trim().length === 0)
      throw n.config("INVALID_CONFIG", `${i}.id`, "must be a non-empty string.");
    const o = e.order;
    if (typeof o != "number" || !Number.isInteger(o))
      throw n.config("INVALID_CONFIG", `${i}.order`, "must be an integer.");
    const a = e.priority ?? 0;
    if (typeof a != "number" || !Number.isFinite(a))
      throw n.config("INVALID_CONFIG", `${i}.priority`, "must be a finite number.");
    const l = this.readBoolean(e.enabled, !0, `${i}.enabled`), u = this.readTarget(e.target, i), c = this.readActivation(e.activation, i, r), d = this.readBehaviour(e.behaviour, i), m = this.readPhaseTracking(e.tracking, i, s), N = this.readMetadata(e.metadata, i);
    return Object.freeze({
      id: r,
      order: o,
      priority: a,
      enabled: l,
      target: Object.freeze(u),
      index: t,
      startsAtMs: c.startsAtMs,
      endsAtMs: c.endsAtMs,
      activationSource: Object.freeze(c.source),
      eligibilityMode: c.eligibilityMode,
      conditions: c.conditions,
      behaviour: Object.freeze(d),
      tracking: Object.freeze(m),
      metadata: Object.freeze(N)
    });
  }
  readTarget(e, t) {
    if (!h.isPlainObject(e))
      throw n.config(
        "INVALID_CONFIG",
        `${t}.target`,
        'must be an object with at least one of "pageName", "sceneName" or "phaseKey".'
      );
    const s = this.readTargetField(e.pageName, `${t}.target.pageName`), i = this.readTargetField(e.sceneName, `${t}.target.sceneName`), r = this.readTargetField(e.phaseKey, `${t}.target.phaseKey`);
    if (s === null && i === null && r === null)
      throw n.config(
        "INVALID_CONFIG",
        `${t}.target`,
        'must define at least one of "pageName", "sceneName" or "phaseKey".'
      );
    return { pageName: s, sceneName: i, phaseKey: r };
  }
  readTargetField(e, t) {
    if (e == null)
      return null;
    if (typeof e != "string" || e.trim().length === 0)
      throw n.config("INVALID_CONFIG", t, "must be a non-empty string when present.");
    return e;
  }
  readActivation(e, t, s) {
    if (e == null)
      return {
        startsAtMs: null,
        endsAtMs: null,
        eligibilityMode: "all",
        conditions: null,
        source: { startsAt: null, endsAt: null }
      };
    if (!h.isPlainObject(e))
      throw n.config("INVALID_CONFIG", `${t}.activation`, "must be an object.");
    const i = e.startsAt === void 0 || e.startsAt === null ? null : this.parseTimestamp(e.startsAt, `${t}.activation.startsAt`), r = e.endsAt === void 0 || e.endsAt === null ? null : this.parseTimestamp(e.endsAt, `${t}.activation.endsAt`);
    if (i !== null && r !== null && r <= i)
      throw n.config(
        "INVALID_DATE_RANGE",
        `${t}.activation`,
        "endsAt must be strictly later than startsAt (startsAt is inclusive, endsAt is exclusive).",
        { phaseId: s }
      );
    return {
      startsAtMs: i,
      endsAtMs: r,
      eligibilityMode: this.readCombineMode(e.eligibilityMode, `${t}.activation.eligibilityMode`, "all"),
      conditions: this.readConditionGroup(e.conditions, `${t}.activation.conditions`),
      source: {
        startsAt: typeof e.startsAt == "string" ? e.startsAt : null,
        endsAt: typeof e.endsAt == "string" ? e.endsAt : null
      }
    };
  }
  readBehaviour(e, t) {
    const s = e ?? {};
    if (!h.isPlainObject(s))
      throw n.config("INVALID_CONFIG", `${t}.behaviour`, "must be an object.");
    return {
      sticky: this.readBoolean(s.sticky, !1, `${t}.behaviour.sticky`),
      enterOnce: this.readBoolean(s.enterOnce, !1, `${t}.behaviour.enterOnce`),
      viewedOnce: this.readBoolean(s.viewedOnce, !1, `${t}.behaviour.viewedOnce`),
      viewableOnce: this.readBoolean(s.viewableOnce, !1, `${t}.behaviour.viewableOnce`)
    };
  }
  readPhaseTracking(e, t, s) {
    const i = e ?? {};
    if (!h.isPlainObject(i))
      throw n.config("INVALID_CONFIG", `${t}.tracking`, "must be an object.");
    return {
      onEnter: this.readUrlList(i.onEnter, `${t}.tracking.onEnter`, s),
      onExit: this.readUrlList(i.onExit, `${t}.tracking.onExit`, s),
      onViewed: this.readUrlList(i.onViewed, `${t}.tracking.onViewed`, s)
    };
  }
  readUrlList(e, t, s) {
    if (e == null)
      return [];
    if (!Array.isArray(e))
      throw n.config("INVALID_CONFIG", t, "must be an array of tracking URL templates.");
    return e.map((r, o) => {
      if (typeof r != "string")
        throw n.config("INVALID_CONFIG", `${t}[${o}]`, "must be a string URL template.");
      return this.assertTrackingTemplate(r, `${t}[${o}]`, s), r;
    }).slice();
  }
  assertTrackingTemplate(e, t, s) {
    if (e.trim().length === 0)
      throw n.config("TRACKING_URL_REJECTED", t, "must be a non-empty URL template.");
    C.lastIndex = 0;
    let i;
    for (; (i = C.exec(e)) !== null; ) {
      const a = i[1] ?? "";
      if (!j.includes(a))
        throw n.config(
          "TRACKING_URL_REJECTED",
          t,
          `contains the unknown placeholder "{${a}}". Approved placeholders: ` + j.map((l) => `{${l}}`).join(", ") + "."
        );
    }
    const r = e.replace(C, "probe");
    let o;
    try {
      o = new URL(r);
    } catch (a) {
      throw new n(
        "TRACKING_URL_REJECTED",
        `${t}: is not an absolute URL. Tracking URLs must include a protocol and host.`,
        { path: t },
        a
      );
    }
    if (o.protocol !== "https:" && !(o.protocol === "http:" && !s.requireHttps))
      throw n.config(
        "TRACKING_URL_REJECTED",
        t,
        `uses the protocol "${o.protocol}". Production tracking URLs must use https:.`
      );
    if (s.allowedHosts.length > 0 && !s.allowedHosts.includes(o.hostname.toLowerCase()))
      throw n.config(
        "TRACKING_URL_REJECTED",
        t,
        `host "${o.hostname}" is not in tracking.allowedHosts.`
      );
  }
  readMetadata(e, t) {
    const s = e ?? {};
    if (!h.isPlainObject(s))
      throw n.config("INVALID_CONFIG", `${t}.metadata`, "must be an object.");
    const i = {};
    for (const [r, o] of Object.entries(s)) {
      if (typeof o != "string" && typeof o != "number" && typeof o != "boolean" && o !== null)
        throw n.config(
          "INVALID_CONFIG",
          `${t}.metadata.${r}`,
          "must be a string, number, boolean or null."
        );
      i[r] = o;
    }
    return i;
  }
  readCombineMode(e, t, s) {
    if (e == null)
      return s;
    if (e !== "all" && e !== "any")
      throw n.config("INVALID_CONFIG", t, 'must be either "all" or "any".');
    return e;
  }
  readConditionGroup(e, t) {
    if (e == null)
      return null;
    if (!h.isPlainObject(e))
      throw n.config("INVALID_CONFIG", t, "must be an object.");
    const s = this.readCombineMode(e.mode, `${t}.mode`, "all"), i = e.items;
    if (!Array.isArray(i))
      throw n.config("INVALID_CONFIG", `${t}.items`, "must be an array of conditions.");
    if (i.length === 0)
      throw n.config(
        "INVALID_CONFIG",
        `${t}.items`,
        'must contain at least one condition. Omit "conditions" entirely to skip the conditions gate.'
      );
    return {
      mode: s,
      items: i.map((r, o) => this.readCondition(r, `${t}.items[${o}]`))
    };
  }
  readCondition(e, t) {
    if (!h.isPlainObject(e))
      throw n.config("INVALID_CONDITION", t, "must be an object.");
    const s = e.type;
    if (typeof s != "string" || !$.has(s))
      throw n.config(
        "INVALID_CONDITION",
        `${t}.type`,
        `unknown condition type. Supported types: ${[...$].join(", ")}.`
      );
    const i = this.readOperator(e.operator, e.value, t), r = e.value, o = r === void 0 ? null : r;
    if (s === "state") {
      const l = this.readRequiredString(e.path, `${t}.path`);
      if (h.parsePath(l) === null)
        throw n.config(
          "UNSAFE_STATE_PATH",
          `${t}.path`,
          "is empty, too long, or not a safe dot path.",
          { path: l }
        );
      return Object.freeze({ type: "state", path: l, operator: i, value: o });
    }
    if (s === "event-count")
      return Object.freeze({
        type: "event-count",
        event: this.readRequiredString(e.event, `${t}.event`),
        operator: i,
        value: o
      });
    if (s === "query")
      return Object.freeze({
        type: "query",
        key: this.readRequiredString(e.key, `${t}.key`),
        operator: i,
        value: o
      });
    if (s === "storage")
      return Object.freeze({
        type: "storage",
        key: this.readRequiredString(e.key, `${t}.key`),
        operator: i,
        value: o
      });
    if (s === "external")
      return Object.freeze({
        type: "external",
        name: this.readRequiredString(e.name, `${t}.name`),
        operator: i,
        value: o
      });
    const a = e.phase;
    if (a != null && (typeof a != "string" || a.trim().length === 0))
      throw n.config(
        "INVALID_CONDITION",
        `${t}.phase`,
        "must be a non-empty phase id, or be omitted to count all phases."
      );
    return Object.freeze({
      type: "viewed",
      phase: typeof a == "string" ? a : null,
      operator: i,
      value: o
    });
  }
  readOperator(e, t, s) {
    if (typeof e != "string" || !S.has(e))
      throw n.config(
        "INVALID_CONDITION",
        `${s}.operator`,
        `unknown operator. Supported operators: ${[...S].join(", ")}.`
      );
    const i = e, r = t !== void 0;
    if (T.has(i) && r)
      throw n.config(
        "INVALID_CONDITION",
        `${s}.value`,
        `must be omitted when operator is "${i}".`
      );
    if (!T.has(i) && !r)
      throw n.config(
        "INVALID_CONDITION",
        `${s}.value`,
        `is required when operator is "${i}".`
      );
    if (J.has(i)) {
      if (!Array.isArray(t) || t.length === 0)
        throw n.config(
          "INVALID_CONDITION",
          `${s}.value`,
          `must be a non-empty array when operator is "${i}".`
        );
      t.forEach((o, a) => {
        if (typeof o != "string" && typeof o != "number" && typeof o != "boolean")
          throw n.config(
            "INVALID_CONDITION",
            `${s}.value[${a}]`,
            "must be a string, number or boolean."
          );
      });
    } else if (W.has(i)) {
      if (typeof t != "number" || !Number.isFinite(t))
        throw n.config(
          "INVALID_CONDITION",
          `${s}.value`,
          `must be a finite number when operator is "${i}".`
        );
    } else if (r && typeof t != "string" && typeof t != "number" && typeof t != "boolean" && t !== null)
      throw n.config(
        "INVALID_CONDITION",
        `${s}.value`,
        "must be a string, number, boolean or null."
      );
    return i;
  }
  readRequiredString(e, t) {
    if (typeof e != "string" || e.trim().length === 0)
      throw n.config("INVALID_CONDITION", t, "must be a non-empty string.");
    return e;
  }
  parseTimestamp(e, t) {
    if (typeof e != "string" || e.trim().length === 0 || !Z.test(e))
      throw n.config(
        "INVALID_DATE",
        t,
        'must be a complete ISO 8601 timestamp including "Z" or an explicit UTC offset.'
      );
    const s = Date.parse(e);
    if (Number.isNaN(s))
      throw n.config("INVALID_DATE", t, "is not a valid calendar date/time.");
    const r = /([Zz]|[+-]\d{2}:\d{2})$/.exec(e)?.[1] ?? "Z";
    let o = 0;
    if (r !== "Z" && r !== "z") {
      const c = r.startsWith("-") ? -1 : 1, d = Number(r.slice(1, 3)), m = Number(r.slice(4, 6));
      o = c * (d * 60 + m) * 6e4;
    }
    const a = new Date(s + o), l = e.split(/[Tt]/)[0] ?? "";
    if ([
      String(a.getUTCFullYear()).padStart(4, "0"),
      String(a.getUTCMonth() + 1).padStart(2, "0"),
      String(a.getUTCDate()).padStart(2, "0")
    ].join("-") !== l)
      throw n.config(
        "INVALID_DATE",
        t,
        `is not a real calendar date (${l} does not exist).`
      );
    return s;
  }
};
b.minPhases = 1, b.maxPhases = 10;
let D = b;
const y = {
  willChange: "mobkoi:phase:will-change",
  change: "mobkoi:phase:change",
  unchanged: "mobkoi:phase:unchanged",
  error: "mobkoi:phase:error",
  event: "mobkoi:event"
};
class X {
  constructor(e, t) {
    this.target = e, this.onDispatchError = t;
  }
  willChange(e, t) {
    return this.dispatch(y.willChange, this.detail(e, t), !0);
  }
  change(e, t) {
    this.dispatch(y.change, this.detail(e, t), !1);
  }
  unchanged(e, t) {
    this.dispatch(y.unchanged, this.detail(e, t), !1);
  }
  error(e) {
    this.dispatch(y.error, e.toDetail(), !1);
  }
  engagement(e) {
    this.dispatch(y.event, e, !1);
  }
  detail(e, t) {
    return {
      creativeId: t.creativeId,
      phaseId: e?.id ?? null,
      previousPhaseId: t.previousPhase?.id ?? null,
      pageName: e?.target.pageName ?? null,
      sceneName: e?.target.sceneName ?? null,
      phaseKey: e?.target.phaseKey ?? null,
      reason: t.reason,
      timestamp: t.timestamp,
      metadata: e?.metadata ?? {}
    };
  }
  dispatch(e, t, s) {
    if (this.target === null || typeof CustomEvent > "u")
      return !0;
    try {
      return this.target.dispatchEvent(new CustomEvent(e, { detail: t, bubbles: !0, cancelable: s }));
    } catch (i) {
      return e !== y.error && this.onDispatchError(i), !0;
    }
  }
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
      if (!i.enabled) {
        t.push({
          phaseId: i.id,
          eligible: !1,
          dateGate: null,
          conditionGate: null,
          blockedByProgression: !1,
          reason: e.context.debug ? "disabled" : "",
          conditions: []
        });
        continue;
      }
      const r = this.dateGate(i, e.now);
      let o = null, a = [];
      if (i.conditions !== null) {
        const m = this.conditions.evaluateGroup(i.conditions, e.context);
        o = m.passed, a = m.results;
      }
      let l = this.combine(r, o, i.eligibilityMode);
      const u = i.behaviour.sticky && e.activePhase?.id === i.id && !l;
      u && (l = !0);
      const c = e.config.progression === "forward-only" && i.order < e.maxEnteredOrder && e.activePhase?.id !== i.id, d = l && !c;
      d && s.push(i), t.push({
        phaseId: i.id,
        eligible: d,
        dateGate: r,
        conditionGate: o,
        blockedByProgression: c,
        reason: e.context.debug ? this.explain(i, r, o, d, c, u) : "",
        conditions: a
      });
    }
    if (s.length > 0)
      return { selectedPhase: s.slice().sort((r, o) => this.compare(r, o))[0] ?? null, candidates: t, usedFallback: !1 };
    if (e.config.fallbackPhaseId !== null) {
      const i = e.config.phases.find((o) => o.id === e.config.fallbackPhaseId), r = i !== void 0 && e.config.progression === "forward-only" && i.order < e.maxEnteredOrder;
      if (i !== void 0 && i.enabled && !r)
        return { selectedPhase: i, candidates: t, usedFallback: !0 };
    }
    return { selectedPhase: e.activePhase, candidates: t, usedFallback: !1 };
  }
  nextBoundary(e, t) {
    let s = null;
    for (const i of e.phases)
      if (i.enabled)
        for (const r of [i.startsAtMs, i.endsAtMs])
          r === null || r <= t || (s === null || r < s) && (s = r);
    return s;
  }
  dateGate(e, t) {
    if (e.startsAtMs === null && e.endsAtMs === null)
      return null;
    const s = e.startsAtMs === null || t >= e.startsAtMs, i = e.endsAtMs === null || t < e.endsAtMs;
    return s && i;
  }
  combine(e, t, s) {
    const i = [];
    return e !== null && i.push(e), t !== null && i.push(t), i.length === 0 ? !0 : s === "all" ? i.every(Boolean) : i.some(Boolean);
  }
  compare(e, t) {
    if (e.priority !== t.priority)
      return t.priority - e.priority;
    if (e.order !== t.order)
      return t.order - e.order;
    const s = e.startsAtMs ?? Number.NEGATIVE_INFINITY, i = t.startsAtMs ?? Number.NEGATIVE_INFINITY;
    return s !== i ? i - s : e.index - t.index;
  }
  explain(e, t, s, i, r, o) {
    const a = [
      `order=${e.order}`,
      `priority=${e.priority}`,
      `date=${t === null ? "n/a" : t ? "pass" : "fail"}`,
      `conditions=${s === null ? "n/a" : s ? "pass" : "fail"}`,
      `mode=${e.eligibilityMode}`
    ];
    return o && a.push("sticky=held-active"), r && a.push("blocked=forward-only"), a.push(`eligible=${i ? "yes" : "no"}`), a.join(" ");
  }
}
const F = 10, A = class A {
  constructor(e, t, s, i) {
    this.config = e, this.onError = t, this.now = s, this.log = i, this.memory = null, this.reportedUnavailable = !1, this.consent = e.consent, this.knownPhaseIds = new Set(e.phases.map((r) => r.id));
  }
  load() {
    const e = this.backend();
    if (e === null)
      return this.memory;
    try {
      const t = e.getItem(this.config.storage.key);
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
        t.setItem(this.config.storage.key, JSON.stringify(e));
      } catch (s) {
        this.onError(n.from(s, "STORAGE_UNAVAILABLE", { mode: this.config.storage.mode }));
      }
  }
  clear() {
    this.memory = null;
    const e = this.backend();
    if (e !== null)
      try {
        e.removeItem(this.config.storage.key);
      } catch (t) {
        this.log.debug("stored progression could not be cleared", t);
      }
  }
  getItem(e) {
    if (e === A.previousPhaseKey)
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
    const t = this.config.storage.ttlDays;
    return t === null ? !1 : this.now() - e.createdAt > t * 24 * 60 * 60 * 1e3;
  }
  permitted() {
    return this.config.storage.mode !== "memory" && this.config.storage.allowed && this.consent.storage;
  }
  backend() {
    if (!this.permitted())
      return null;
    try {
      return this.probe(this.config.storage.mode);
    } catch (e) {
      if (!this.reportedUnavailable) {
        this.reportedUnavailable = !0;
        const t = this.config.storage.mode === "local" ? "Local" : "Session";
        this.onError(new n(
          "STORAGE_UNAVAILABLE",
          `${t} storage is not available; view history will not persist.`,
          { mode: this.config.storage.mode },
          e
        ));
      }
      return null;
    }
  }
  probe(e) {
    const t = e === "local" ? globalThis.localStorage : globalThis.sessionStorage;
    if (!t)
      throw new n(
        "STORAGE_UNAVAILABLE",
        "Storage is not available; view history will not persist.",
        { mode: e }
      );
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
      enteredPhaseIds: t.enteredPhaseIds.slice(0, F),
      previousPhaseId: t.previousPhaseId,
      views: this.sanitiseViews(s ?? {}),
      createdAt: typeof i == "number" ? i : this.now()
    };
  }
  sanitiseViews(e) {
    const t = {};
    let s = 0;
    for (const [i, r] of Object.entries(e))
      s >= F || !this.knownPhaseIds.has(i) || !this.isViewRecord(r) || (t[i] = {
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
A.previousPhaseKey = "previous_phase";
let V = A;
const re = 5e3, ne = /\{([^{}]*)\}/g, oe = /* @__PURE__ */ new Set([
  "creative_id",
  "phase_id",
  "previous_phase_id",
  "scene_name",
  "reason",
  "timestamp",
  "impression_id",
  "event_name"
]);
class ae {
  constructor(e, t, s) {
    this.config = e, this.onError = t, this.now = s, this.fired = /* @__PURE__ */ new Set(), this.pending = /* @__PURE__ */ new Map(), this.destroyed = !1, this.consent = e.consent;
  }
  fire(e, t, s) {
    if (this.destroyed || e.length === 0 || !this.config.tracking.enabled || !this.consent.measurement)
      return;
    if (s !== null) {
      if (this.fired.has(s))
        return;
      this.fired.add(s);
    }
    const i = {
      ...t,
      creative_id: t.creative_id ?? this.config.creativeId,
      impression_id: t.impression_id ?? this.config.tracking.impressionId,
      timestamp: t.timestamp ?? this.now()
    };
    for (const r of e)
      try {
        this.send(this.appendQuery(this.substitute(r, i)));
      } catch (o) {
        this.onError(n.from(o, "TRACKING_ERROR"));
      }
  }
  resetDedupe() {
    this.fired.clear();
  }
  setConsent(e) {
    this.consent = e;
  }
  destroy() {
    this.destroyed = !0;
    for (const e of [...this.pending.keys()])
      this.release(e);
    this.pending.clear(), this.fired.clear();
  }
  substitute(e, t) {
    return e.replace(ne, (s, i) => {
      if (!oe.has(i))
        return "";
      const r = t[i];
      return r == null ? "" : encodeURIComponent(String(r));
    });
  }
  appendQuery(e) {
    const t = Object.entries(this.config.tracking.commonQuery);
    if (t.length === 0)
      return e;
    try {
      const s = new URL(e);
      for (const [i, r] of t)
        s.searchParams.set(i, String(r));
      return s.toString();
    } catch (s) {
      return this.onError(n.from(s, "TRACKING_ERROR")), e;
    }
  }
  send(e) {
    if (typeof Image != "function") {
      this.onError(new n("TRACKING_ERROR", "Image transport is unavailable."));
      return;
    }
    try {
      const t = new Image(1, 1), s = setTimeout(() => this.release(t), re);
      this.pending.set(t, s), t.onload = () => this.release(t), t.onerror = () => this.release(t), t.src = e;
    } catch (t) {
      this.onError(n.from(t, "TRACKING_ERROR"));
    }
  }
  release(e) {
    const t = this.pending.get(e);
    t !== void 0 && clearTimeout(t), this.pending.delete(e), e.onload = null, e.onerror = null;
    try {
      e.src = "";
    } catch (s) {
      this.onError(n.from(s, "TRACKING_ERROR"));
    }
  }
}
class le {
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
const R = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]), f = class f {
  constructor(e, t, s) {
    this.context = e, this.options = t, this.now = () => Date.now(), this.consent = {
      measurement: !0,
      personalisation: !1,
      storage: !0
    }, this.state = this.freshState(), this.activePhase = null, this.lastDecision = null, this.createdAt = null, this.started = !1, this.destroyed = !1, this.listenersAttached = !1, this.countOnDisplay = !1, this.reportedViewability = !1, this.transitionSequence = 0, this.query = null, this.viewability = null, this.onVisibility = () => {
      document.visibilityState === "visible" && this.evaluate("visibility");
    }, this.onFocus = () => {
      this.evaluate("focus");
    }, this.log = G.enter(s), this.events = new X(
      typeof document > "u" ? null : document,
      (i) => this.report(n.from(i, "ADAPTER_ERROR"))
    ), this.resolved = new D().resolve({
      ...this.options,
      creativeId: this.resolveCreativeId(),
      tagservice: this.resolveTagservice(),
      tracking: {
        ...this.options.tracking,
        impressionId: this.resolveImpressionId()
      }
    }), this.selector = new ie(new Y()), this.scheduler = new se(this.now), this.storage = new V(this.resolved, (i) => this.report(i), this.now, this.log), this.tracking = new ae(this.resolved, (i) => this.report(i), this.now), this.consent = {
      measurement: this.resolved.consent.measurement,
      personalisation: this.resolved.consent.personalisation,
      storage: this.resolved.consent.storage
    }, this.restore();
  }
  start() {
    this.destroyed || this.started || (this.started = !0, this.attachListeners(), this.resolved.debug && this.log.debug("tagservice", this.resolved.tagservice), this.evaluate("start"));
  }
  stop() {
    this.started && (this.started = !1, this.scheduler.cancel(), this.detachListeners(), this.viewability?.stop());
  }
  destroy() {
    this.destroyed || (this.stop(), this.destroyed = !0, this.scheduler.cancel(), this.detachListeners(), this.viewability?.stop(), this.tracking.destroy(), this.activePhase = null, this.lastDecision = null, this.state = this.freshState(), this.query = null);
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
      if (typeof e != "object" || e === null || Array.isArray(e)) {
        this.report(new n("INVALID_CONFIG", "setState() requires a plain object.", { method: "setState" }));
        return;
      }
      this.mergeValues(this.state.values, e), (t === null || t.evaluate) && this.evaluate("state");
    }
  }
  emit(e, t = null) {
    if (this.destroyed)
      return;
    if (e.length === 0) {
      this.report(new n("INVALID_CONFIG", "emit() requires a non-empty event name.", { method: "emit" }));
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(this.state.eventCounts, e) && Object.keys(this.state.eventCounts).length >= f.maxEventNames) {
      this.report(new n(
        "INVALID_CONFIG",
        "Event name limit reached; event ignored.",
        { method: "emit", limit: f.maxEventNames }
      ));
      return;
    }
    this.state.eventCounts[e] = (this.state.eventCounts[e] ?? 0) + 1, t !== null && (this.state.lastEvents[e] = this.boundPayload(t)), this.events.engagement({
      creativeId: this.resolved.creativeId,
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
    this.consent = t, this.tracking.setConsent(t), this.storage.setConsent(t), this.evaluate("consent");
  }
  reset(e = null) {
    if (this.destroyed)
      return;
    const t = e?.state ?? !0, s = e?.progression ?? !0, i = e?.tracking ?? !0;
    t && (this.state.values = /* @__PURE__ */ Object.create(null), this.state.eventCounts = /* @__PURE__ */ Object.create(null), this.state.lastEvents = /* @__PURE__ */ Object.create(null)), s && (this.state.maxEnteredOrder = 0, this.activePhase = null, this.state.views = /* @__PURE__ */ Object.create(null)), i && (this.state.enteredPhaseIds = [], this.tracking.resetDedupe()), (s || i) && (this.storage.clear(), this.createdAt = null), this.evaluate("reset");
  }
  getConfig() {
    return this.resolved;
  }
  getLastDecision() {
    return this.lastDecision;
  }
  runEvaluation(e) {
    if (this.destroyed)
      return this.lastDecision ?? this.emptyDecision(e);
    const t = this.now();
    let s;
    try {
      const i = this.selector.select({
        config: this.resolved,
        now: t,
        context: this.conditionContext(),
        maxEnteredOrder: this.state.maxEnteredOrder,
        activePhase: this.activePhase
      });
      s = {
        selectedPhase: i.selectedPhase,
        previousPhase: this.activePhase,
        changed: i.selectedPhase?.id !== this.activePhase?.id,
        reason: e,
        evaluatedAt: t,
        nextEvaluationAt: this.selector.nextBoundary(this.resolved, t),
        candidates: i.candidates,
        usedFallback: i.usedFallback
      }, i.selectedPhase === null && this.report(new n(
        "NO_ELIGIBLE_PHASE",
        "No eligible phase and no usable fallback phase.",
        { reason: e }
      ));
    } catch (i) {
      this.report(n.from(i, "INVALID_CONFIG", { reason: e })), s = {
        ...this.emptyDecision(e),
        selectedPhase: this.activePhase,
        previousPhase: this.activePhase,
        evaluatedAt: t
      };
    }
    if (this.lastDecision = s, this.resolved.debug && this.log.debug(e, s.selectedPhase?.id ?? "none", s.usedFallback ? "fallback" : ""), e === "viewable") {
      const i = s.selectedPhase ?? this.activePhase;
      return i !== null && this.announce(i, this.changeContext(s)), s;
    }
    return s.changed && s.selectedPhase !== null ? this.display(s) : s.selectedPhase !== null && this.events.unchanged(s.selectedPhase, this.changeContext(s)), this.scheduleNext(s.nextEvaluationAt), s;
  }
  display(e) {
    const t = e.selectedPhase;
    if (t === null)
      return;
    const s = ++this.transitionSequence, i = this.changeContext(e);
    if (!this.events.willChange(t, i)) {
      this.report(new n(
        "ADAPTER_ERROR",
        `Phase transition to "${t.id}" was cancelled.`,
        { phaseId: t.id }
      ));
      return;
    }
    this.hidePrevious(e, i);
    let r;
    try {
      r = this.announce(t, i);
    } catch (o) {
      this.report(n.from(o, "ADAPTER_ERROR", { phaseId: t.id }));
      return;
    }
    if (r instanceof Promise) {
      r.then(() => this.commitDisplay(t, e, s)).catch((o) => {
        this.report(n.from(o, "ADAPTER_ERROR", { phaseId: t.id }));
      });
      return;
    }
    this.commitDisplay(t, e, s);
  }
  commitDisplay(e, t, s) {
    if (this.destroyed || s !== this.transitionSequence)
      return;
    const i = this.changeContext(t), r = t.previousPhase;
    r !== null && r.id !== e.id && this.tracking.fire(r.tracking.onExit, this.placeholders(r, i, null), null), this.activePhase = e, e.order > this.state.maxEnteredOrder && (this.state.maxEnteredOrder = e.order), !this.state.enteredPhaseIds.includes(e.id) && this.state.enteredPhaseIds.length < f.maxViews && this.state.enteredPhaseIds.push(e.id), this.tracking.fire(
      e.tracking.onEnter,
      this.placeholders(e, i, null),
      e.behaviour.enterOnce ? `enter:${e.id}` : `enter:${e.id}:${s}`
    ), this.deferViews() ? this.persist() : this.recordView(e, t.evaluatedAt, t.reason), this.events.change(e, i), this.beginViewability();
  }
  announce(e, t) {
    if (this.options.onPhase !== null)
      return this.options.onPhase(e, t);
    if (t.reason === "viewable") {
      this.resolved.debug && this.log.debug("viewable", e.id, this.getState()), this.stop();
      return;
    }
    this.present(e);
  }
  present(e) {
    const t = e.target.pageName;
    if (t === null) {
      if (e.target.sceneName !== null)
        throw new n(
          "ADAPTER_ERROR",
          `Scene "${e.target.sceneName}" needs a scene navigation call in onPhase.`,
          { phaseId: e.id, sceneName: e.target.sceneName }
        );
      return;
    }
    const s = this.host().find(t);
    if (!s)
      throw new n(
        "ADAPTER_ERROR",
        `Celtra screen "${t}" was not found.`,
        { phaseId: e.id, pageName: t }
      );
    const i = this.host();
    if (!i.goToScreenAction || !this.context.ctx)
      throw new n(
        "ADAPTER_ERROR",
        "Celtra screen navigation is not available.",
        { phaseId: e.id, pageName: t }
      );
    i.goToScreenAction(this.context.ctx, { screen: s }, () => {
    });
  }
  hidePrevious(e, t) {
    const s = e.previousPhase, i = e.selectedPhase;
    if (!(s === null || i === null || s.id === i.id || this.options.onPhaseExit === null))
      try {
        const r = this.options.onPhaseExit(s, t);
        r instanceof Promise && r.catch((o) => this.report(n.from(o, "ADAPTER_ERROR", { phaseId: s.id })));
      } catch (r) {
        this.report(n.from(r, "ADAPTER_ERROR", { phaseId: s.id }));
      }
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
        this.failOpen();
      });
      return;
    }
    this.failOpen();
  }
  watch(e) {
    this.viewability?.stop(), this.viewability = new le(
      e,
      this.resolved.viewability.minPercent / 100,
      this.resolved.viewability.minDurationMs,
      () => this.onViewQualified(),
      document
    ), this.viewability.start() || this.failOpen(new n(
      "VIEWABILITY_UNAVAILABLE",
      "IntersectionObserver is not available. Views are counted when a phase is displayed."
    ));
  }
  failOpen(e = null) {
    if (this.reportedViewability)
      return;
    this.reportedViewability = !0, this.countOnDisplay = !0, this.report(e ?? new n(
      "VIEWABILITY_ROOT_MISSING",
      "viewabilityRoot did not resolve to an element. Views are counted when a phase is displayed.",
      { root: "unit.node" }
    ));
    const t = this.activePhase;
    t !== null && this.recordView(t, this.now(), "viewable") && this.evaluate("viewable");
  }
  onViewQualified() {
    const e = this.activePhase;
    e === null || this.destroyed || (this.viewability?.stop(), this.recordView(e, this.now(), "viewable") && this.evaluate("viewable"));
  }
  recordView(e, t, s) {
    const i = this.state.views[e.id];
    if (e.behaviour.viewableOnce && (i?.count ?? 0) >= 1)
      return !1;
    if (i !== void 0)
      i.count += 1, i.lastAt = t;
    else if (Object.keys(this.state.views).length < f.maxViews)
      this.state.views[e.id] = { count: 1, lastAt: t };
    else
      return !1;
    this.persist();
    const r = this.lastDecision ?? this.emptyDecision(s);
    return this.tracking.fire(
      e.tracking.onViewed,
      { ...this.placeholders(e, this.changeContext(r), "phase_viewed"), reason: s },
      e.behaviour.viewedOnce ? `viewed:${e.id}` : `viewed:${e.id}:${this.transitionSequence}`
    ), !0;
  }
  deferViews() {
    return this.resolved.viewability.enabled && this.resolved.viewability.requireViewable && !this.countOnDisplay;
  }
  currentRoot() {
    return this.resolved.viewability.root ?? this.context.unit.node ?? null;
  }
  persist() {
    this.createdAt === null && (this.createdAt = this.now());
    const e = {
      maxEnteredOrder: this.state.maxEnteredOrder,
      enteredPhaseIds: this.state.enteredPhaseIds.slice(0, f.maxViews),
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
      debug: this.resolved.debug
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
    if (this.options.getExternalCondition !== null)
      try {
        const s = this.options.getExternalCondition(e);
        if (s !== void 0)
          return s;
      } catch (s) {
        this.report(n.from(s, "ADAPTER_ERROR", { externalCondition: e }));
      }
    const t = this.state.values.external;
    if (typeof t == "object" && t !== null && !Array.isArray(t) && Object.prototype.hasOwnProperty.call(t, e))
      return t[e];
  }
  placeholders(e, t, s) {
    return {
      creative_id: this.resolved.creativeId,
      phase_id: e.id,
      previous_phase_id: t.previousPhase?.id ?? null,
      scene_name: e.target.sceneName,
      reason: t.reason,
      timestamp: t.timestamp,
      impression_id: this.resolved.tracking.impressionId,
      event_name: s
    };
  }
  changeContext(e) {
    return {
      creativeId: this.resolved.creativeId,
      previousPhase: e.previousPhase,
      reason: e.reason,
      timestamp: e.evaluatedAt,
      decision: e
    };
  }
  report(e) {
    if (this.events.error(e), this.options.onError !== null) {
      try {
        this.options.onError(e);
      } catch (t) {
        this.log.error("onError failed", t);
      }
      return;
    }
    this.log.error(e.code, e.message, e.details);
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
  resolveCreativeId() {
    if (this.options.creativeId.trim().length > 0)
      return this.options.creativeId;
    const e = this.context.creative;
    for (const t of ["id", "creativeId", "name"]) {
      if (!Object.prototype.hasOwnProperty.call(e, t))
        continue;
      const s = e[t];
      if (typeof s == "string" && s.trim().length > 0)
        return s;
    }
    return "mobkoi-creative";
  }
  resolveImpressionId() {
    const e = this.options.tracking.impressionId;
    if (typeof e == "string" && e.length > 0)
      return e;
    const t = this.context.creative.runtimeParams?.impressionId;
    return typeof t == "string" ? t : null;
  }
  resolveTagservice() {
    return typeof this.options.tagservice == "boolean" ? this.options.tagservice : this.context.creative.runtimeParams?.isTagservice === !0;
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
      if (R.has(s) || Object.keys(e).length >= f.maxStateKeys && !(s in e))
        continue;
      if (typeof i == "object" && i !== null && !Array.isArray(i)) {
        const o = e[s], a = typeof o == "object" && o !== null && !Array.isArray(o) ? o : /* @__PURE__ */ Object.create(null);
        let l = 0;
        for (const [u, c] of Object.entries(i)) {
          if (R.has(u))
            continue;
          if (l += 1, l > f.maxStateKeys)
            break;
          const d = this.scalar(c);
          d !== void 0 && (a[u] = d);
        }
        e[s] = a;
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
      if (s += 1, s > f.maxPayloadFields)
        break;
      const o = this.scalar(r);
      o !== void 0 && (t[i] = o);
    }
    return t;
  }
  scalar(e) {
    if (e === null)
      return null;
    if (typeof e == "string")
      return e.length > f.maxStringLength ? e.slice(0, f.maxStringLength) : e;
    if (typeof e == "number")
      return Number.isFinite(e) ? e : void 0;
    if (typeof e == "boolean")
      return e;
  }
};
f.maxEventNames = 32, f.maxPayloadFields = 8, f.maxStateKeys = 64, f.maxViews = 10, f.maxStringLength = 256;
let L = f;
class ce extends k {
  constructor() {
    super(...arguments), this.name = "PhaseOrchestrator", this.defaultConfig = K;
  }
  create(e, t) {
    return new L(e, t, this.name);
  }
}
const de = (g) => new ce().init(g);
export {
  de as setup
};
