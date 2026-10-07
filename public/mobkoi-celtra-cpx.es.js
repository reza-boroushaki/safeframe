/*! Copyright Mobkoi 2026 (v5.5.1) */
const U = {
  pollTime: 200,
  events: [
    { value: 1, label: "cpx-0s" },
    { value: 1e3, label: "cpx-1s" },
    { value: 3e3, label: "cpx-3s" },
    { value: 5e3, label: "cpx-5s" },
    { value: 1e4, label: "cpx-10s" }
  ],
  countingMode: "cumulative",
  threshold: {
    standard: 0.5,
    large: 0.3
  }
};
class x {
  static getTopAncestor() {
    try {
      const e = document.location.ancestorOrigins;
      return e && e.length > 0 ? e[e.length - 1] : "unknown";
    } catch (e) {
      return console.debug("No topAncestor", e), "unknown";
    }
  }
  static getReferrer() {
    try {
      return window.document.referrer || window.parent.document.referrer;
    } catch (e) {
      return console.debug("No document.referrer", e), "unknown";
    }
  }
  static getAncestors() {
    const e = {};
    return typeof window < "u" && window.location?.ancestorOrigins && window.location.ancestorOrigins.length > 0 && Array.prototype.slice.call(window.location.ancestorOrigins).forEach(function(t, i, s) {
      e[i] = s[i];
    }), e;
  }
}
class j {
  static contextExists() {
    if (typeof window > "u")
      return !1;
    try {
      const e = window.AMP_CONTEXT_DATA ?? window.parent?.AMP_CONTEXT_DATA;
      return typeof e == "object" && e !== null;
    } catch (e) {
      return console.debug("No AMP context", e), !1;
    }
  }
}
class R {
  constructor(e) {
    this.log = e.enter("SafeFrameUtil");
  }
  check() {
    const e = {}, t = typeof window < "u" && window.location && typeof window.location.href == "string" ? window.location.href : "", i = typeof creative < "u" && creative?.adapter && creative.adapter.safeFrameDetected || !1, s = /googlesyndication/i.test(t) || /safeframe/i.test(t);
    if (e.detected = !!(i || s), typeof window < "u")
      try {
        e.apiObject = typeof window.$sf < "u" ? window.$sf : window.parent.$sf;
      } catch (n) {
        this.log.debug("SafeFrameUtil", "cannot access window.parent.$sf", n), e.apiObject = typeof window.$sf < "u" ? window.$sf : void 0;
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
class b {
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
    return this.add(new b(e));
  }
  add(e) {
    return e.parent = this, e;
  }
}
const V = new b("MOBKOI");
function D() {
  const r = /* @__PURE__ */ new Date();
  return `${r.getDate()}/${r.getMonth() + 1}/${r.getFullYear()}`;
}
class B {
  /**
   * Creates a new failure data collector.
   * 
   * Immediately collects all diagnostic information from the current
   * runtime environment.
   * 
   * @param parentLog - Parent logger for scoped logging
   */
  constructor(e) {
    this.logger = e.enter("FailureData"), this.safeFrameUtil = new R(this.logger);
    const t = creative.runtimeParams, i = creative.sdk;
    this.data = {
      celtraIds: {
        folderId: t.folderId,
        placementId: t.placementId
      },
      externalIds: {
        CreativeId: t.externalCreativeId,
        PlacementId: t.externalPlacementId,
        SiteId: t.externalSiteId,
        LineItemId: t.externalLineItemId,
        SiteName: t.externalSiteName,
        SupplierName: t.externalSupplierName
      },
      time: {
        timestamp: t.clientTimestamp,
        timestampOffset: t.clientTimeZoneOffsetInMinutes,
        unixStamp: Date.now(),
        unixDate: D()
      },
      env: {
        celAmpDetected: i.ampDetected,
        celSfDetected: i.safeFrameDetected,
        celAdapter: i.constructor.name,
        ampContextExists: j.contextExists(),
        sfApiExists: this.safeFrameUtil.apiExists(),
        sf_CfgExists: this.safeFrameUtil.configExists()
      },
      location: {
        topAncestor: x.getTopAncestor(),
        winHref: globalThis.window !== void 0 && globalThis.location?.href || "unknown",
        referrer: x.getReferrer(),
        ancestors: x.getAncestors()
      }
    };
  }
  /**
   * Logs the diagnostic data to console
   * 
   * Outputs all collected diagnostic information at debug level.
   * Use this when viewability detection fails to understand why.
   */
  log() {
    this.logger.debug(this.data);
  }
}
class $ {
  constructor(e) {
    this.scope = e.scope, this.userInitiated = e.userInitiated;
  }
}
class F extends $ {
  constructor(e, t) {
    super(e), this.actionContext = t;
  }
}
class T {
  constructor(e) {
    this.name = "celtra", this.log = e.enter("MbkCeltraChannel");
  }
  static actionContextOf(e) {
    return e instanceof F ? e.actionContext : void 0;
  }
  emit(e, t) {
    if (!e.legacyEvent)
      return !1;
    const i = typeof Creative < "u" ? Creative : void 0;
    if (typeof i?.trackCustomEventAction != "function")
      return this.log.debug("Creative API unavailable, no Celtra event for", e.legacyEvent), !1;
    const s = T.actionContextOf(t);
    if (!s)
      return this.log.warn("No ActionContext on the cause of", e.legacyEvent), !1;
    const n = e.legacyEvent;
    return i.trackCustomEventAction(s, { name: n }, () => this.log.debug("Celtra event accepted:", n)), !0;
  }
}
class L {
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
class o {
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
      o.of(e),
      o.instance(e),
      o.path(e.scope),
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
    return [e.role, o.instance(e), o.path(e.scope)].join("|");
  }
  /** `"2"`, `"vidPlayer1"`, or `""` for a singleton such as the unit. */
  static instance(e) {
    return e.index !== void 0 ? String(e.index) : e.name ?? "";
  }
  /** Containment as one string, outermost first: `"panel:2>section:3"`. */
  static path(e) {
    const t = [];
    for (let i = e; i; i = i.scope) {
      const s = o.instance(i);
      t.unshift(s ? `${i.role}:${s}` : i.role);
    }
    return t.join(">");
  }
}
class a {
  /** Query parameters for one signal. Undefined values are omitted rather than sent empty. */
  static of(e, t) {
    const i = { k: e.verb, vs1: e.role };
    return a.set(i, "vs2", e.legacyEvent), a.set(i, "vs3", e.name), a.set(i, "vs4", o.path(e.scope) || void 0), a.set(i, "vs5", e.mode), a.set(i, "vi1", e.index), a.set(i, "vi2", e.ms), a.set(i, "vi3", e.from), a.set(i, "vi4", e.to), a.set(i, "vi5", e.completed === void 0 ? void 0 : Number(e.completed)), a.set(i, "vf1", e.percent), a.set(i, "vf2", e.modeMs), a.set(i, "iid", t), i;
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
    const s = e.includes("{{event}}") ? e.replace("{{event}}", encodeURIComponent(t.legacyEvent ?? t.verb)) : e, n = s.includes("?") ? "&" : "?";
    return `${s}${n}${a.toQueryString(a.of(t, i))}`;
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
  update(e) {
    const t = Object.keys(e).reduce((i, s) => {
      const n = e[s];
      return n !== void 0 && (i[s] = n), i;
    }, {});
    this.options = { ...this.options, ...t };
  }
  runtimeParam(e) {
    const i = (typeof creative < "u" ? creative : void 0)?.runtimeParams?.[e];
    return typeof i == "string" && i ? i : void 0;
  }
};
l.endpointParam = "externalSignalTrackerURI", l.errorEndpointParam = "externalClientErrorURI", l.defaults = {
  pixelFallback: !0,
  log: () => new b("mbk")
};
let m = l;
class M {
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
    const s = a.url(t, e, this.config.impressionId), n = i.call(globalThis.navigator, s);
    return this.log.debug(n ? "queued" : "refused", s), n;
  }
}
const k = class k {
};
k.mapping = [
  { kind: { verb: "click", role: "cta" }, legacyEvent: () => "clickSite" },
  { kind: { verb: "click", role: "unit" }, legacyEvent: () => "clickSite" }
];
let C = k;
class O {
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
      this.resolvers.set(o.of(t.kind), t.legacyEvent);
    }
    return this;
  }
  has(e) {
    return this.resolvers.has(o.of(e));
  }
  /**
   * @returns the Celtra event name for this signal, or `undefined` when no resolver is registered
   *   for its kind or when the registered one threw.
   */
  resolve(e) {
    const t = this.resolvers.get(o.of(e));
    if (t)
      try {
        const { legacyEvent: i, ...s } = e, n = t(s);
        if (typeof n != "string" || !n) {
          this.log.warn(`Resolver for ${o.of(e)} produced no name`, n);
          return;
        }
        return n;
      } catch (i) {
        this.log.warn(`Resolver for ${o.of(e)} failed, no Celtra event emitted`, i);
        return;
      }
  }
}
class N {
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
    const n = () => this.pending.delete(s);
    return s.onload = n, s.onerror = n, s.src = i, this.log.debug("sent", i), !0;
  }
}
class H {
  constructor(e, t) {
    this.config = e, this.log = t.enter("MbkTrackErrorReporter");
  }
  report(e, t, i) {
    this.log.warn(`Channel "${e}" failed for ${o.of(t)}`, i);
    const s = this.config.errorEndpoint;
    if (s)
      try {
        const n = [
          `error=${encodeURIComponent(`mbkTrack:${e}`)}`,
          `reason=${encodeURIComponent(String(i?.message ?? i))}`,
          `k=${encodeURIComponent(t.verb)}`
        ], h = this.config.impressionId;
        h && n.push(`iid=${encodeURIComponent(h)}`);
        const u = `${s}${s.includes("?") ? "&" : "?"}${n.join("&")}`;
        globalThis.navigator?.sendBeacon?.(u);
      } catch (n) {
        this.log.debug("Could not report the channel failure", n);
      }
  }
}
const c = class c {
  constructor(e) {
    this.tracks = /* @__PURE__ */ new Map(), this.emitted = /* @__PURE__ */ new Set(), this.states = /* @__PURE__ */ new Map(), this.config = new m(e), this.log = this.config.log.enter("MbkImpression"), this.startedAt = c.now(), this.beacon = new M(this.config, this.log), this.pixel = new N(this.config, this.log), this.reporter = new H(this.config, this.log), this.coreLegacyEvents = new O(this.log, "core", C.mapping);
  }
  /** The one impression of this creative, created on first use. */
  static shared(e) {
    const t = c.storage(), i = t[c.storageKey];
    if (i)
      return i.configure(e), i;
    const s = new c(e);
    return t[c.storageKey] = s, s;
  }
  /** Drops it. For tests, and for a creative that reloads its scripts. */
  static reset() {
    delete c.storage()[c.storageKey];
  }
  /**
   * Stash on `unit` when available, else on the window, following the precedent set by
   * `CreativeScript` / `setup()` is the precedent for a per-creative singleton.
   */
  static storage() {
    const e = globalThis;
    return e.unit ? e.unit : (e[c.windowStorageKey] || (e[c.windowStorageKey] = {}), e[c.windowStorageKey]);
  }
  static now() {
    const e = globalThis.performance;
    return typeof e?.now == "function" ? e.now() : Date.now();
  }
  /** Completes the configuration. Later values win. */
  configure(e) {
    this.config.update(e);
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
        throw new Error(
          `MbkTrack: script "${e}" is already tracked as a ${s.constructor.name}, not a ${i.name}. Every instance of one script must pick the same specialisation.`
        );
      return s;
    }
    const n = t();
    return this.tracks.set(e, n), n;
  }
  /**
   * Marks the start of the impression, which every timestamp is relative to.
   *
   * Called implicitly at construction. Call it explicitly from the first `appeared` the creative
   * sees if that is a better origin; it is ignored once signals have been emitted, so the clock
   * cannot move under data already sent.
   */
  markStart() {
    return this.emitted.size > 0 || this.states.size > 0 ? (this.log.debug("Impression start not moved: signals were already emitted"), !1) : (this.startedAt = c.now(), !0);
  }
  /** Milliseconds since the start of the impression. */
  elapsedMs() {
    return Math.round(c.now() - this.startedAt);
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
    const i = o.signature(e);
    switch (t) {
      case "repeated":
        return !0;
      case "once":
        return this.emitted.has(i) ? (this.log.debug("Already emitted, skipping", i), !1) : (this.emitted.add(i), !0);
      case "state": {
        const s = o.subject(e);
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
c.storageKey = "mbkImpression", c.windowStorageKey = "__mbkTrackStorage";
let g = c;
class v {
  constructor(e, t) {
    this.impression = e, this.key = t, this.log = e.log.enter(`${this.constructor.name}(${t})`), this.legacyEvents = new O(this.log, t, []);
  }
  /**
   * The track of that script, created on first use, completed with its dictionary.
   *
   * The instance is read and dropped: nothing here keeps a reference to a partially constructed
   * object.
   */
  static shared(e, t) {
    const i = g.shared(t);
    return i.track(e.trackingKey, () => new v(i, e.trackingKey), v).declare(e.legacyEventsMapping);
  }
  /** Adds this script's Celtra event names. A later declaration wins for the same kind. */
  declare(e) {
    return this.legacyEvents.declare(e), this;
  }
  /** A context of the kind this specialisation builds: what caused the signals, and where. */
  context(e) {
    return new $(e);
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
    return t || this.log.debug(`No resolver for ${o.of(e)}, raw signal only`), t;
  }
}
class w extends v {
  /**
   * @throws when the same script is already tracked as a plain {@link MbkTrack}. See
   *   {@link MbkImpression.track}.
   */
  static shared(e, t) {
    const i = g.shared(t);
    return i.track(
      e.trackingKey,
      () => new w(i, e.trackingKey, t.initiator),
      w
    ).declare(e.legacyEventsMapping);
  }
  constructor(e, t, i) {
    super(e, t), this.contexts = new L(t, this.log, i), this.celtra = new T(this.log);
  }
  /**
   * A Celtra context, carrying the `ActionContext` this cause's legacy events are fired with: the
   * one the call site forwarded from its handler, else a fresh user-initiated one when the cause is
   * a gesture, else this script's common passive one.
   */
  context(e) {
    const t = e.actionContext ?? this.contexts.forCause(e.userInitiated);
    return new F(e, t);
  }
  /** The legacy event first, unchanged, then the raw channels. */
  emitChannels(e, t) {
    this.impression.send(this.celtra, e, t), super.emitChannels(e, t);
  }
}
class _ {
  constructor(e, t) {
    this.trackingKey = "cpx", this.unitLegacy = { verb: "legacy", role: "unit" }, this.legacyEventsMapping = [], this.log = t.enter("CpxTracking"), this.track = w.shared(this, {}), this.exposure = this.buildExposureContext(e);
  }
  emitThreshold(e) {
    this.emitLegacy(e);
  }
  emitLegacy(e) {
    this.track.once({ ...this.unitLegacy, legacyEvent: e }, this.exposure);
  }
  updateActionContext(e) {
    this.exposure = this.buildExposureContext(e);
  }
  buildExposureContext(e) {
    return this.track.context({
      scope: void 0,
      userInitiated: !1,
      actionContext: e
    });
  }
}
class d {
  static deepMerge(e, t) {
    const i = { ...e };
    for (const s of Object.keys(t)) {
      const n = t[s], h = e[s];
      n !== void 0 && (d.isPlainObject(h) && d.isPlainObject(n) ? i[s] = d.deepMerge(
        h,
        n
      ) : i[s] = n);
    }
    return i;
  }
  static isPlainObject(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e) && Object.getPrototypeOf(e) === Object.prototype;
  }
}
class z {
  /**
   * Creates a new time state tracker.
   * 
   * @param options - Configuration options
   * @param options.interval - Polling interval in milliseconds (default: 200)
   * @param options.countingMode - "cumulative" or "continuous" (default: "cumulative")
   * @param evs - Array of CPX events with time thresholds and labels
   * @param parentLogger - Parent logger instance for scoped logging
   * @param exposure - CPX exposure emitter (MbkCeltraTrack)
   * @param onComplete - Optional callback fired when all segments completed
   */
  constructor(e = {}, t, i, s, n) {
    this.evs = t, this.exposure = s, this.segments = [], this.canRun = !0, this.hasInit = !1, this.log = i.enter("MbkTimeStateTracker"), this.config = d.deepMerge({ countingMode: "cumulative", interval: 200 }, e), this.cache = {
      intervalTime: this.config.interval,
      currentPeriodTime: 0,
      sumOfPassedSegments: 0,
      currentSegmentIndex: 0,
      state: !1,
      lastState: !1,
      currentSegment: null
    }, this.canRun = !0, this.onComplete = n, this.update = this.update.bind(this), this.handle = this.handle.bind(this);
  }
  /**
   * Updates the viewability state.
   * 
   * Called by viewability observer when state changes. If not viewable,
   * resets lastState to prevent time accumulation until viewable again.
   * 
   * @param s - True if currently viewable, false otherwise
   */
  update(e) {
    this.cache.state = e, e ? e && !this.cache.lastState && (this.cache.lastState = !0) : this.cache.lastState = !1;
  }
  /**
   * Handles a single poll tick for time accumulation.
   */
  handle() {
    if (this.cache.currentSegment === null || !this.canRun)
      return null;
    this.cache.state && this.cache.lastState ? this.cache.currentPeriodTime += this.cache.intervalTime : this.config.countingMode === "continuous" && (this.cache.currentPeriodTime = 0), this.cache.currentSegment !== null && this.cache.currentSegment !== void 0 && this.cache.currentPeriodTime >= this.cache.currentSegment.duration && (this.log.debug("CPX: Firing event", this.cache.currentSegment.label, {
      currentPeriodTime: this.cache.currentPeriodTime,
      segmentDuration: this.cache.currentSegment.duration,
      state: this.cache.state,
      lastState: this.cache.lastState
    }), this.exposure.emitThreshold(this.cache.currentSegment.label), this.cache.currentPeriodTime = Math.max(this.cache.currentPeriodTime - this.cache.currentSegment.duration, 0), this.cache.sumOfPassedSegments += this.cache.currentSegment.duration, this.cache.currentSegmentIndex++, this.cache.currentSegment = this.segments && this.segments[this.cache.currentSegmentIndex] || null), this.cache.currentSegment === null && (this.canRun = !1, this.onComplete && typeof this.onComplete == "function" && this.onComplete()), this.cache.lastState = this.cache.state;
  }
  stop() {
    this.cache.currentSegment !== null && (this.cache.currentSegment = null), this.canRun && (this.canRun = !1);
  }
  init() {
    if (!this.hasInit) {
      const t = (this.evs || this.segments || []).sort((i, s) => i.value - s.value);
      this.segments = t.map((i, s, n) => ({
        duration: s === 0 ? i.value : i.value - n[s - 1].value,
        start: s === 0 ? 0 : n[s - 1].value,
        end: i.value,
        label: i.label
      })), this.cache.currentSegment = this.segments[0];
    }
    this.hasInit = !0;
  }
  readCache() {
    return this.cache;
  }
}
class K {
  /**
   * Creates a new SuperTimer.
   * 
   * @param fn - Function to execute (becomes onTick for interval, onEnd for timeout)
   * @param countdown - Time in milliseconds before execution
   * @param parentLog - Parent logger for scoped logging
   * @param options - Timer configuration options
   */
  constructor(e, t, i, s) {
    this.id = null, this.log = i.enter("SuperTimer");
    const n = {
      type: "timeout",
      onEnd: () => {
      },
      onTick: () => {
      },
      time: t,
      selfStart: !0
    };
    s && typeof s == "object" && Object.keys(s).map((h) => {
      n[h] = s[h];
    }), n.type === "interval" ? n.onTick = e : n.onEnd = e, this._c = {
      type: n.type,
      onEnd: n.onEnd,
      onTick: n.onTick,
      time: n.time,
      selfStart: n.selfStart,
      paused: !1,
      complete: !1,
      hasRun: !1,
      resumed: !1,
      startTime: null,
      nextTime: n.time
    }, this.cancel = this.cancel.bind(this), this.done = this.done.bind(this), this.pause = this.pause.bind(this), this.resume = this.resume.bind(this), this.reset = this.reset.bind(this), this.read = this.read.bind(this), this.isPaused = this.isPaused.bind(this), this.isComplete = this.isComplete.bind(this), this.hasRun = this.hasRun.bind(this), this.settings = this.settings.bind(this), this.init = this.init.bind(this), this._c.selfStart && this.init();
  }
  /**
   * Cancels the timer without calling callbacks.
   * 
   * Clears the underlying timeout/interval. Safe to call multiple times.
   * Does nothing if timer is already complete.
   * 
   * @returns null if already complete
   */
  cancel() {
    if (this._c.complete)
      return null;
    this._c.type === "timeout" || this._c.resumed ? clearTimeout(this.id) : clearInterval(this.id);
  }
  /**
   * Marks the timer as complete and fires onEnd callback.
   * 
   * Clears the underlying timeout/interval, marks as complete, and
   * calls the onEnd callback. Used to manually complete tracking.
   * 
   * @returns null if already complete
   */
  done() {
    if (this._c.complete)
      return null;
    this._c.type === "timeout" || this._c.resumed ? clearTimeout(this.id) : clearInterval(this.id), this._c.complete = !0, this._c.onEnd();
  }
  /**
   * Pauses the timer.
   * 
   * Stops the timer and records remaining time. Can be resumed later
   * to continue from where it left off. Essential for CPX tracking
   * when ad becomes not viewable.
   * 
   * @param resumeIn - Optional: auto-resume after this many milliseconds
   * @returns Remaining time in milliseconds, or null if already paused/complete
   * 
   * @example
   * timer.pause() // Pause indefinitely
   * timer.pause(5000) // Pause for 5 seconds, then auto-resume
   */
  pause(e) {
    return this._c.complete || this._c.paused ? null : (this._c.type === "timeout" ? clearTimeout(this.id) : clearInterval(this.id), this._c.paused = !0, e && setTimeout(this.resume, e), this._c.nextTime -= Date.now() - (this._c.startTime || 0), this._c.nextTime);
  }
  /**
   * Resumes a paused timer.
   * 
   * Continues from where the timer was paused, preserving remaining time.
   * Used when ad becomes viewable again.
   * 
   * @param pauseIn - Optional: auto-pause after this many milliseconds
   * @returns null if not paused or already complete
   * 
   * @example
   * timer.resume() // Resume indefinitely
   * timer.resume(3000) // Resume for 3 seconds, then auto-pause
   */
  resume(e) {
    if (this._c.complete || !this._c.paused)
      return null;
    this._c.paused = !1, this._c.resumed = !0, this._c.startTime = Date.now(), e && setTimeout(this.pause, e), this.id = setTimeout(() => this.wrapper(), this._c.nextTime);
  }
  /**
   * Resets the timer to initial state.
   * 
   * Pauses, cancels, and reinitializes the timer. Optionally runs
   * a preset function before reinitialization.
   * 
   * @param preset - Optional function to run before reinitializing
   */
  reset(e) {
    this.pause(), this.cancel(), this._c.paused = !1, this._c.complete = !1, this._c.resumed = !1, this._c.startTime = null, this._c.nextTime = this._c.time, typeof e == "function" && e(), this.init();
  }
  /**
   * Gets the remaining time until next execution.
   * 
   * Accounts for paused state - returns exact remaining time whether
   * timer is running or paused.
   * 
   * @returns Remaining time in milliseconds, or 0 if complete
   */
  read() {
    return this._c.complete ? 0 : this._c.nextTime - (this._c.paused ? 0 : Date.now() - (this._c.startTime || 0));
  }
  /**
   * Checks if timer is currently paused.
   * 
   * @returns True if paused, false if running or complete
   */
  isPaused() {
    return this._c.paused;
  }
  /**
   * Checks if timer has completed execution.
   * 
   * @returns True if done() was called, false otherwise
   */
  isComplete() {
    return this._c.complete;
  }
  /**
   * Checks if init() has been called.
   * 
   * @returns True if timer was initialized, false otherwise
   */
  hasRun() {
    return this._c.hasRun;
  }
  /**
   * Gets a copy of the timer's internal configuration.
   * 
   * @returns Shallow copy of timer settings and state
   */
  settings() {
    return Object.assign({}, this._c);
  }
  /**
   * Initializes and starts the timer.
   * 
   * Sets up the underlying setTimeout or setInterval based on type.
   * Can only be called once - subsequent calls are ignored.
   * 
   * @throws {Error} If type is not "timeout" or "interval"
   */
  init() {
    if (this._c.hasRun)
      return this.log.warn("supertimer already init()"), null;
    if (this._c.type === "timeout")
      this._c.startTime = Date.now(), this.id = setTimeout(() => this.wrapper(), this._c.time), this._c.hasRun = !0;
    else if (this._c.type === "interval")
      this._c.startTime = Date.now(), this.id = setInterval(() => this.wrapper(), this._c.time), this._c.hasRun = !0;
    else
      throw new Error('Type must be "timeout" or "interval"');
  }
  /**
   * Internal wrapper function executed on each tick/timeout.
   * 
   * Updates timing state, calls appropriate callback (onTick/onEnd),
   * and manages interval continuity after resume.
   * 
   * @private
   */
  wrapper() {
    this._c.startTime = Date.now(), this._c.nextTime = this._c.time;
    try {
      this._c.type === "interval" ? this._c.onTick() : this._c.onEnd(), this._c.type === "timeout" ? this.done() : this._c.resumed && (this._c.resumed = !1, this.id = setInterval(() => this.wrapper(), this._c.time));
    } catch (e) {
      this.log.error("wrapper failed", e);
    }
  }
}
class X {
  static lerp(e, t, i) {
    return e + (t - e) * i;
  }
  static map(e, t, i, s, n) {
    return i + (s - i) * ((n - e) / (t - e));
  }
  static clamp(e, t, i) {
    return Math.min(Math.max(i, e), t);
  }
}
const A = {
  fps: 10,
  threshold: { standard: 0.5, large: 0.3 }
};
class G {
  constructor(e, t, i) {
    this.mode = null, this.threshold = null, this.state = null, this.previousState = !1, this.active = !1, this.config = A, this.hasInit = !1;
    const s = i === void 0, n = s ? {} : e, h = s ? e : t, u = s ? t : i;
    this.log = u.enter("MbkIsViewable"), this.safeFrameUtil = new R(this.log), this.config = d.deepMerge(A, n), this.callbacks = Array.isArray(h) ? h : [h], this.calculateThreshold = this.calculateThreshold.bind(this), this.init = this.init.bind(this), this.read = this.read.bind(this), this.threshold = this.calculateThreshold();
    const E = this.resolveUnit(), I = E?.currentVariant ?? E;
    I?.on && I.on("resize", () => {
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
  setupWebInView(e) {
    return e?.inView?.active ? (this.mode = "webInView", this.start = () => {
      this.active || e.inView.on("areaInViewRatioChanged", this.calcState.bind(this)), this.calcState(e.inView.areaInViewRatio), this.active = !0;
    }, this.stop = () => {
      e.inView.off("areaInViewRatioChanged", this.calcState.bind(this)), this.active = !1;
    }, !0) : !1;
  }
  setupMraid(e) {
    if (!e || typeof e != "object" || typeof e.getVersion != "function")
      return !1;
    const t = Number.parseInt(e.getVersion(), 10);
    return this.mode = t >= 3 ? "mraidExposureChange" : "mraidIsViewable", this.start = () => {
      !this.active && (this.mode === "mraidExposureChange" || this.mode === "mraidIsViewable") && (this.mode === "mraidExposureChange" ? e.addEventListener("exposureChange", this.calcState.bind(this)) : e.addEventListener("viewableChange", this.calcState.bind(this))), this.active || (this.intervalCount = 0, this.interval = setInterval(() => {
        this.calcState(e.isViewable()), ++this.intervalCount >= 60 && clearInterval(this.interval);
      }, 500)), this.calcState(e.isViewable()), this.active = !0;
    }, this.stop = () => {
      this.mode === "mraidExposureChange" ? e.removeEventListener("exposureChange", this.calcState.bind(this)) : e.removeEventListener("viewableChange", this.calcState.bind(this)), this.interval && clearInterval(this.interval), this.active = !1;
    }, !0;
  }
  setupSafeFrame() {
    return this.safeFrameUtil.check().passed ? (this.mode = "safeFrame", this.start = () => {
      const t = this.safeFrameUtil.check().apiObject;
      if (!this.active) {
        if (typeof t.ext.inViewPercentage == "function")
          this.interval = setInterval(
            () => this.calcState(t.ext.inViewPercentage()),
            1e3 / this.config.fps
          ), this.calcState(t.ext.inViewPercentage());
        else if (typeof t.ext.geom == "function") {
          const i = () => {
            const s = t.ext.geom().self;
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
      } catch (e) {
        this.log.debug("Failed to track detection failure event", e);
      }
    this.mode = "detectionFailed", this.start = () => {
      this.active || (this.state = !0, this.previousState = !1, this.callbacks.forEach((e) => {
        e && typeof e == "function" && e(!0);
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
    const e = this.resolveUnit(), t = globalThis.mraid;
    return this.setupWebInView(e) || this.setupMraid(t) || this.setupSafeFrame() || this.setupDetectionFailed(), this.hasInit = !0, this;
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
  updateState(e) {
    if (e === void 0)
      return null;
    this.previousState = this.state || !1, this.state = e, this.previousState !== this.state && this.callbacks.forEach((t) => {
      t && typeof t == "function" && t(this.state);
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
    const e = this.resolveUnit(), t = e?.size?.width, i = e?.size?.height;
    return typeof t == "number" && typeof i == "number" ? t * i > 242500 ? this.config.threshold.large : this.config.threshold.standard : this.config.threshold.standard;
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
  calcState(e) {
    switch (this.mode) {
      case "webInView":
      case "safeFrame":
      case "mraidExposureChange": {
        const t = e > 1 ? e / 100 : e;
        this.updateState(X.clamp(0, 1, t) >= (this.threshold || 0));
        break;
      }
      case "mraidIsViewable":
        this.updateState(!!e);
        break;
      default:
        this.updateState(!1);
    }
  }
}
const P = V.enter("Celtra");
class q {
  constructor(e, t, i) {
    this.context = e, this.options = t, this.scriptName = i, this.started = !1, this.log = P.enter(this.scriptName), this.creative = e.creative, this.unit = e.unit, this.screen = e.screen, this.mbkCtx = e.ctx, typeof window < "u" && this.mbkCtx && (window.mbkCtx = this.mbkCtx), this.exposureTracking = new _(this.mbkCtx, this.log), this.stateHandler = this.createStateHandler(), this.supertimer = new K(
      this.stateHandler.handle.bind(this.stateHandler),
      this.options.pollTime,
      this.log,
      {
        type: "interval",
        onEnd: () => {
          this.viewableObserver.stop(), this.stateHandler.stop();
        },
        selfStart: !1
      }
    ), this.viewableObserver = new G(
      {
        onFailure: () => this.onViewableFailure(),
        onLegacyEvent: (s) => this.exposureTracking.emitLegacy(s),
        threshold: {
          standard: this.options.threshold.standard,
          large: this.options.threshold.large
        },
        unit: this.unit
      },
      [
        this.stateHandler.update.bind(this.stateHandler),
        (s) => this.onViewableChange(s)
      ],
      this.log
    ), typeof window < "u" && (window.mbkStateHandler = this.stateHandler);
  }
  /** Starts tracking once the unit/screen has appeared. */
  start() {
    if (this.started)
      return;
    this.started = !0;
    const { unit: e, screen: t } = this.context;
    if (e?.hasAppearedAtLeastOnce) {
      this.initialize();
      return;
    }
    if (e && typeof e.once == "function") {
      e.once("appeared", () => this.initialize());
      return;
    }
    if (t.hasAppearedAtLeastOnce || typeof t.once != "function") {
      this.initialize();
      return;
    }
    t.once("appeared", () => this.initialize());
  }
  /**
   * Initializes tracker components (time segments, timer, viewability).
   * Called automatically from {@link start} when the unit appears.
   */
  initialize() {
    if (this.stateHandler.hasInit && this.stateHandler.readCache().currentSegment === null && this.stateHandler.segments.length > 0) {
      this.log.debug("CPX: Already completed tracking, skipping initialization");
      return;
    }
    if (this.stateHandler.hasInit) {
      this.supertimer.hasRun() && this.supertimer.isPaused() ? this.supertimer.resume() : this.supertimer.hasRun() || this.supertimer.init();
      return;
    }
    this.stateHandler.init(), this.supertimer.hasRun() || this.supertimer.init(), this.viewableObserver.init().start(), this.viewableObserver.mode === "detectionFailed" && this.viewableObserver.state === !0 && (this.supertimer.isPaused() ? this.supertimer.resume() : this.supertimer.hasRun() || this.supertimer.init()), setTimeout(() => {
      if (this.mbkCtx) {
        this.exposureTracking.updateActionContext(this.mbkCtx);
        return;
      }
      if (this.screen && typeof ActionContext < "u")
        try {
          this.exposureTracking.updateActionContext(new ActionContext(this.screen, {
            certainlyNotCausedByUserBehavior: !1,
            consideredUserInitiatedByBrowser: !1
          }));
        } catch {
          this.log.warn("CPX: Failed to create ActionContext for exposure tracking. ctx should be provided.");
        }
      else
        this.log.warn("CPX: No screen or ActionContext available for exposure tracking");
    }, 0);
  }
  createStateHandler() {
    return new z(
      {
        interval: this.options.pollTime,
        countingMode: this.options.countingMode
      },
      this.options.events,
      this.log,
      this.exposureTracking,
      () => this.supertimer.done()
    );
  }
  onViewableFailure() {
    this.log.warn("CPX: Viewability detection failed. Falling back to assumed viewability."), this.failData = new B(this.log);
  }
  onViewableChange(e) {
    this.supertimer && (e && this.supertimer.isPaused() && this.supertimer.resume(), !e && !this.supertimer.isPaused() && this.supertimer.pause());
  }
  readFailure() {
    return this.failData ? this.failData.data : null;
  }
}
function y(r) {
  return !!(r && typeof r.find == "function");
}
function f(r) {
  return globalThis[r];
}
class W {
  resolve(e = {}) {
    const t = this.resolveCreative(e.creative);
    if (!t)
      throw new Error('Celtra context: "creative" not found');
    const i = this.resolveScreen(t, e.screen);
    if (!i)
      throw new Error('Celtra context: "screen" is missing or not a Celtra screen');
    const s = this.resolveUnit(t, e.unit, i);
    if (!s)
      throw new Error('Celtra context: "unit" not found');
    const n = this.resolveCtx(e.ctx, i);
    return { creative: t, unit: s, screen: i, ctx: n };
  }
  resolveCreative(e) {
    return e ?? f("creative");
  }
  resolveScreen(e, t) {
    if (y(t))
      return t;
    if (typeof e?.getScreen == "function") {
      const s = e.getScreen();
      if (y(s))
        return s;
    }
    const i = f("screen");
    return y(i) ? i : void 0;
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
const Q = new W(), p = class p {
  constructor() {
    this.contextResolver = Q;
  }
  init(e) {
    const t = P.enter(this.name), i = this.contextResolver.resolve(e), s = i.unit ?? i.screen, n = p.registry.get(s);
    if (n)
      return t.debug(`${this.name} already initialized`), n;
    const h = d.deepMerge(this.defaultConfig, e), u = this.create(i, h);
    return p.registry.set(s, u), u.start(), u;
  }
};
p.registry = /* @__PURE__ */ new WeakMap();
let S = p;
class Y extends S {
  constructor() {
    super(...arguments), this.name = "CPX", this.defaultConfig = U;
  }
  create(e, t) {
    return new q(e, t, this.name);
  }
}
const Z = (r) => new Y().init(r);
export {
  Z as setup
};
