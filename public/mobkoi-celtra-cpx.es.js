/*! Copyright Mobkoi 2026 (v5.5.1) */
class I {
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
class B {
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
class F {
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
class C {
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
    return this.add(new C(e));
  }
  add(e) {
    return e.parent = this, e;
  }
}
const _ = new C("MOBKOI");
function H() {
  const r = /* @__PURE__ */ new Date();
  return `${r.getDate()}/${r.getMonth() + 1}/${r.getFullYear()}`;
}
class M {
  /**
   * Creates a new failure data collector.
   * 
   * Immediately collects all diagnostic information from the current
   * runtime environment.
   * 
   * @param parentLog - Parent logger for scoped logging
   */
  constructor(e) {
    this.logger = e.enter("FailureData"), this.safeFrameUtil = new F(this.logger);
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
        unixDate: H()
      },
      env: {
        celAmpDetected: i.ampDetected,
        celSfDetected: i.safeFrameDetected,
        celAdapter: i.constructor.name,
        ampContextExists: B.contextExists(),
        sfApiExists: this.safeFrameUtil.apiExists(),
        sf_CfgExists: this.safeFrameUtil.configExists()
      },
      location: {
        topAncestor: I.getTopAncestor(),
        winHref: globalThis.window !== void 0 && globalThis.location?.href || "unknown",
        referrer: I.getReferrer(),
        ancestors: I.getAncestors()
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
class R extends $ {
  constructor(e, t) {
    super(e), this.actionContext = t;
  }
}
class A {
  constructor(e) {
    this.name = "celtra", this.log = e.enter("MbkCeltraChannel");
  }
  static actionContextOf(e) {
    return e instanceof R ? e.actionContext : void 0;
  }
  emit(e, t) {
    if (!e.legacyEvent)
      return !1;
    const i = typeof Creative < "u" ? Creative : void 0;
    if (typeof i?.trackCustomEventAction != "function")
      return this.log.debug("Creative API unavailable, no Celtra event for", e.legacyEvent), !1;
    const s = A.actionContextOf(t);
    if (!s)
      return this.log.warn("No ActionContext on the cause of", e.legacyEvent), !1;
    const n = e.legacyEvent;
    return i.trackCustomEventAction(s, { name: n }, () => this.log.debug("Celtra event accepted:", n)), !0;
  }
}
class N {
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
class o {
  /** Query parameters for one signal. Undefined values are omitted rather than sent empty. */
  static of(e, t) {
    const i = { k: e.verb, vs1: e.role };
    return o.set(i, "vs2", e.legacyEvent), o.set(i, "vs3", e.name), o.set(i, "vs4", c.path(e.scope) || void 0), o.set(i, "vs5", e.mode), o.set(i, "vi1", e.index), o.set(i, "vi2", e.ms), o.set(i, "vi3", e.from), o.set(i, "vi4", e.to), o.set(i, "vi5", e.completed === void 0 ? void 0 : Number(e.completed)), o.set(i, "vf1", e.percent), o.set(i, "vf2", e.modeMs), o.set(i, "iid", t), i;
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
    return `${s}${n}${o.toQueryString(o.of(t, i))}`;
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
  log: () => new C("mbk")
};
let b = l;
class X {
  constructor(e, t) {
    this.config = e, this.name = "beacon", this.log = t.enter("MbkBeaconChannel");
  }
  emit(e) {
    const t = this.config.endpoint;
    if (!t)
      return this.log.debug(`No ${b.endpointParam}, raw signal not sent`), !1;
    const i = globalThis.navigator?.sendBeacon;
    if (typeof i != "function")
      return this.log.debug("sendBeacon unavailable"), !1;
    const s = o.url(t, e, this.config.impressionId), n = i.call(globalThis.navigator, s);
    return this.log.debug(n ? "queued" : "refused", s), n;
  }
}
const P = class P {
};
P.mapping = [
  { kind: { verb: "click", role: "cta" }, legacyEvent: () => "clickSite" },
  { kind: { verb: "click", role: "unit" }, legacyEvent: () => "clickSite" }
];
let j = P;
class U {
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
        const { legacyEvent: i, ...s } = e, n = t(s);
        if (typeof n != "string" || !n) {
          this.log.warn(`Resolver for ${c.of(e)} produced no name`, n);
          return;
        }
        return n;
      } catch (i) {
        this.log.warn(`Resolver for ${c.of(e)} failed, no Celtra event emitted`, i);
        return;
      }
  }
}
class z {
  constructor(e, t) {
    this.config = e, this.name = "pixel", this.pending = /* @__PURE__ */ new Set(), this.log = t.enter("MbkPixelChannel");
  }
  emit(e) {
    const t = this.config.endpoint;
    if (!t)
      return !1;
    if (typeof Image != "function")
      return this.log.debug("Image unavailable"), !1;
    const i = o.url(t, e, this.config.impressionId), s = new Image();
    this.pending.add(s);
    const n = () => this.pending.delete(s);
    return s.onload = n, s.onerror = n, s.src = i, this.log.debug("sent", i), !0;
  }
}
class K {
  constructor(e, t) {
    this.config = e, this.log = t.enter("MbkTrackErrorReporter");
  }
  report(e, t, i) {
    this.log.warn(`Channel "${e}" failed for ${c.of(t)}`, i);
    const s = this.config.errorEndpoint;
    if (s)
      try {
        const n = [
          `error=${encodeURIComponent(`mbkTrack:${e}`)}`,
          `reason=${encodeURIComponent(String(i?.message ?? i))}`,
          `k=${encodeURIComponent(t.verb)}`
        ], a = this.config.impressionId;
        a && n.push(`iid=${encodeURIComponent(a)}`);
        const u = `${s}${s.includes("?") ? "&" : "?"}${n.join("&")}`;
        globalThis.navigator?.sendBeacon?.(u);
      } catch (n) {
        this.log.debug("Could not report the channel failure", n);
      }
  }
}
const h = class h {
  constructor(e) {
    this.tracks = /* @__PURE__ */ new Map(), this.emitted = /* @__PURE__ */ new Set(), this.states = /* @__PURE__ */ new Map(), this.config = new b(e), this.log = this.config.log.enter("MbkImpression"), this.startedAt = h.now(), this.beacon = new X(this.config, this.log), this.pixel = new z(this.config, this.log), this.reporter = new K(this.config, this.log), this.coreLegacyEvents = new U(this.log, "core", j.mapping);
  }
  /** The one impression of this creative, created on first use. */
  static shared(e) {
    const t = h.storage(), i = t[h.storageKey];
    if (i)
      return i.configure(e), i;
    const s = new h(e);
    return t[h.storageKey] = s, s;
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
    const e = globalThis;
    return e.unit ? e.unit : (e[h.windowStorageKey] || (e[h.windowStorageKey] = {}), e[h.windowStorageKey]);
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
h.storageKey = "mbkImpression", h.windowStorageKey = "__mbkTrackStorage";
let w = h;
class x {
  constructor(e, t) {
    this.impression = e, this.key = t, this.log = e.log.enter(`${this.constructor.name}(${t})`), this.legacyEvents = new U(this.log, t, []);
  }
  /**
   * The track of that script, created on first use, completed with its dictionary.
   *
   * The instance is read and dropped: nothing here keeps a reference to a partially constructed
   * object.
   */
  static shared(e, t) {
    const i = w.shared(t);
    return i.track(e.trackingKey, () => new x(i, e.trackingKey), x).declare(e.legacyEventsMapping);
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
    return t || this.log.debug(`No resolver for ${c.of(e)}, raw signal only`), t;
  }
}
class y extends x {
  /**
   * @throws when the same script is already tracked as a plain {@link MbkTrack}. See
   *   {@link MbkImpression.track}.
   */
  static shared(e, t) {
    const i = w.shared(t);
    return i.track(
      e.trackingKey,
      () => new y(i, e.trackingKey, t.initiator),
      y
    ).declare(e.legacyEventsMapping);
  }
  constructor(e, t, i) {
    super(e, t), this.contexts = new N(t, this.log, i), this.celtra = new A(this.log);
  }
  /**
   * A Celtra context, carrying the `ActionContext` this cause's legacy events are fired with: the
   * one the call site forwarded from its handler, else a fresh user-initiated one when the cause is
   * a gesture, else this script's common passive one.
   */
  context(e) {
    const t = e.actionContext ?? this.contexts.forCause(e.userInitiated);
    return new R(e, t);
  }
  /** The legacy event first, unchanged, then the raw channels. */
  emitChannels(e, t) {
    this.impression.send(this.celtra, e, t), super.emitChannels(e, t);
  }
}
class G {
  constructor(e, t) {
    this.trackingKey = "cpx", this.unitLegacy = { verb: "legacy", role: "unit" }, this.legacyEventsMapping = [], this.log = t.enter("CpxExposureTracking"), this.track = y.shared(this, {}), this.exposure = this.buildExposureContext(e);
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
class v {
  /**
   * Deep merges properties from source object into target object.
   * 
   * Recursively merges nested objects. Does not merge RegExp or Date objects.
   * Modifies the target object in place.
   * 
   * @param from - Source object with properties to merge
   * @param to - Target object to merge into (modified in place)
   * 
   * @example
   * const target = { a: 1, b: { x: 10 } }
   * const source = { b: { y: 20 }, c: 3 }
   * ObjectUtil.mergeObj(source, target)
   * // target is now { a: 1, b: { x: 10, y: 20 }, c: 3 }
   */
  static mergeObj(e, t) {
    function i(s) {
      return s && typeof s == "object" && Object.prototype.toString.call(
        s
      ) !== "[object RegExp]" && Object.prototype.toString.call(s) !== "[object Date]";
    }
    if (typeof e == "object" && e !== void 0) {
      for (const s in e)
        if (Object.prototype.hasOwnProperty.call(e, s))
          if (i(t[s]) && i(e[s]))
            for (const n in e[s])
              Object.prototype.hasOwnProperty.call(e[s], n) && (t[s][n] = e[s][n]);
          else
            t[s] = e[s];
    }
  }
}
class q {
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
    this.evs = t, this.exposure = s, this.segments = [], this.canRun = !0, this.hasInit = !1, this.log = i.enter("MbkTimeStateTracker"), this.config = { countingMode: "cumulative", interval: 200 }, v.mergeObj(e, this.config), this.cache = {
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
class W {
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
    s && typeof s == "object" && Object.keys(s).map((a) => {
      n[a] = s[a];
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
function g(r) {
  return r && typeof r == "object" && Object.prototype.toString.call(r) !== "[object RegExp]" && Object.prototype.toString.call(r) !== "[object Date]";
}
function O(r, e) {
  if (!(!g(r) || !g(e)))
    for (const t in r)
      Object.prototype.hasOwnProperty.call(r, t) && (g(e[t]) && g(r[t]) ? O(r[t], e[t]) : e[t] = r[t]);
}
const E = {
  fps: 10,
  threshold: { standard: 0.5, large: 0.3 }
};
class Q {
  constructor(e, t, i) {
    this.mode = null, this.threshold = null, this.state = null, this.previousState = !1, this.active = !1, this.config = E, this.hasInit = !1;
    const s = i === void 0, n = s ? {} : e, a = s ? e : t, u = s ? t : i;
    this.log = u.enter("MbkIsViewable"), this.safeFrameUtil = new F(this.log), this.config = {
      ...E,
      threshold: { ...E.threshold }
    }, this.mergeObj(n, this.config), this.callbacks = Array.isArray(a) ? a : [a], this.calculateThreshold = this.calculateThreshold.bind(this), this.init = this.init.bind(this), this.read = this.read.bind(this), this.threshold = this.calculateThreshold();
    const p = this.resolveUnit(), d = p?.currentVariant ?? p;
    d?.on && d.on("resize", () => {
      this.threshold = this.calculateThreshold();
    });
  }
  /**
   * Resolves the CreativeUnit for viewability detection.
   * Prefers config.unit (passed from CpxTracker.setup) over globalThis.unit
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
   * Merges configuration objects.
   *
   * Deep merges properties from source to target, preserving nested objects.
   * Does not merge RegExp or Date objects.
   *
   * @param from - Source object with new values
   * @param to - Target object to merge into
   * @private
   */
  mergeObj(e, t) {
    O(e, t);
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
      case "mraidExposureChange":
        this.updateState(Math.max(Math.min(e > 1 ? e / 100 : e, 1), 0) >= (this.threshold || 0));
        break;
      case "mraidIsViewable":
        this.updateState(!!e);
        break;
      default:
        this.updateState(!1);
    }
  }
}
const Y = _.enter("Celtra");
function Z() {
  return typeof unit < "u" && unit ? unit : typeof window < "u" ? (window.__mbkCpxStorage || (window.__mbkCpxStorage = {}), window.__mbkCpxStorage) : {};
}
const m = {
  pollTime: 200,
  // timepoint for each trackingevent
  events: [
    { value: 3e3, label: "mbkBillingPoint" },
    // BILLING POINT EVENT - DISABLED FOR MEASUREMENT ONLY
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
class f {
  /**
   * Creates a new CPX tracker instance.
   * 
   * Note: Use getInstance() instead of calling constructor directly to ensure singleton behavior.
   * 
   * @param contextOrComponent - Either a CpxContext object { creative, unit, screen } or a component/screen (backward compatible)
   * @param configuration - CPX configuration options (polling interval, events, thresholds, etc.)
   */
  constructor(e, t) {
    if (this.contextOrComponent = e, this.configuration = t, this.log = Y.enter("CpxTracker"), e && typeof e == "object" && "creative" in e && "unit" in e && "screen" in e) {
      const s = e;
      this.creative = s.creative, this.unit = s.unit, this.screen = s.screen, s.ctx ? this.mbkCtx = s.ctx : console.warn("CPX: ctx not provided in context object. Tracking may not work correctly."), this.contextOrComponent = s.screen, typeof window < "u" && this.mbkCtx && (window.mbkCtx = this.mbkCtx);
    } else
      this.contextOrComponent = e, typeof creative < "u" && creative && (this.creative = creative), typeof unit < "u" && unit && (this.unit = unit), e && (this.screen = e), typeof mbkCtx < "u" && mbkCtx ? this.mbkCtx = mbkCtx : typeof ctx < "u" && ctx && (this.mbkCtx = ctx);
    this.configuration = { ...t }, this.exposureTracking = new G(this.mbkCtx, this.log), this.stateHandler = this.createStateHandler(), this.supertimer = new W(
      this.stateHandler.handle.bind(this.stateHandler),
      this.configuration.pollTime,
      this.log,
      {
        type: "interval",
        onEnd: () => {
          this.viewableObserver.stop(), this.stateHandler.stop();
        },
        selfStart: !1
      }
    ), this.viewableObserver = new Q(
      {
        onFailure: () => this.onViewableFailure(),
        onLegacyEvent: (s) => this.exposureTracking.emitLegacy(s),
        threshold: {
          standard: this.configuration.threshold.standard,
          large: this.configuration.threshold.large
        },
        unit: this.unit
      },
      [
        this.stateHandler.update.bind(this.stateHandler),
        (s) => this.onViewableChange(s)
      ],
      this.log
    ), typeof window < "u" && (window.mbkStateHandler = this.stateHandler), e && !("creative" in e) && typeof unit < "u" && unit && unit.hasAppearedAtLeastOnce && (this.log.debug("CPX: Legacy auto-init detected"), this.initialize());
  }
  /**
   * Automatically sets up the CPX tracker by scanning the environment for Celtra globals.
   * This is the recommended entry point for external loading scenarios.
   * 
   * It will:
   * 1. Prefer explicitly passed `creative`, `unit`, `screen` (recommended for reliability).
   * 2. Fall back to detecting `creative`, `unit`, `screen`, and `ctx` from the global scope.
   * 3. Merge provided config with defaults.
   * 4. Create a valid `ActionContext` if missing.
   * 5. Initialize the tracker singleton.
   * 
   * @param options - Configuration options. For best reliability, pass `creative`, `unit`, and `screen`
   *                  explicitly in options. If not provided, the function will attempt to find them
   *                  in the global scope as a fallback.
   * @returns The initialized CpxTracker instance
   * 
   * @example
   * // Recommended: Explicit passing (most reliable)
   * CpxTracker.setup({
   *   creative: creative,
   *   unit: unit,
   *   screen: screen,
   *   countingMode: "continuous"
   * });
   * 
   * @example
   * // Fallback: Auto-discovery from globals (less reliable)
   * CpxTracker.setup({ countingMode: "continuous" });
   */
  static setup(e = {}) {
    const t = { ...m }, { creative: i, unit: s, screen: n, ctx: a, ...u } = e;
    u.events && Array.isArray(u.events) && (t.events = u.events);
    const p = { ...u };
    delete p.events, v.mergeObj(p, t);
    const d = typeof window < "u" ? window : void 0, k = i || d?.creative, D = s || d?.unit, S = n || d?.screen, V = a || d?.ctx || d?.mbkCtx;
    console.debug(!!(i || s || n) ? "CPX: Using explicitly passed globals (recommended)" : "CPX: Falling back to global scope discovery"), k && (k.config = t);
    const T = {
      creative: k,
      unit: D,
      screen: S,
      ctx: V
      // ctx is optional - setup will work without it (ActionContext will be created if available)
    };
    if (S && !T.ctx && typeof ActionContext < "u")
      try {
        T.ctx = new ActionContext(S, {
          certainlyNotCausedByUserBehavior: !1,
          consideredUserInitiatedByBrowser: !1
        }), console.debug("CPX: Auto-created ActionContext in setup()");
      } catch (L) {
        console.warn("CPX: Failed to auto-create ActionContext in setup()", L);
      }
    return f.getInstance(T, t);
  }
  /**
   * Gets or creates the singleton CPX tracker instance for the current ad unit.
   * 
   * Ensures only one tracker exists per ad unit. If a tracker already exists,
   * it returns the existing instance and ignores the provided configuration.
   * 
   * Accepts either:
   * - A CpxContext object: { creative, unit, screen } (recommended for external loads)
   * - A component/screen object (backward compatible)
   * 
   * Special case: If the existing instance was created with an undefined component
   * (e.g., when loaded externally), and a valid component/context is now provided, it will
   * update the instance with the new values.
   * 
   * @param contextOrComponent - Either a CpxContext object { creative, unit, screen } or a component/screen (backward compatible)
   * @param configuration - CPX configuration (only used on first call). Default: defaultCpxConfig
   * @returns The CPX tracker instance, or the existing instance if already created
   * 
   * @example
   * // Using context object (recommended)
   * const tracker1 = CpxTracker.getInstance({ creative, unit, screen: screenRef }, config)
   * 
   * @example
   * // Backward compatible: component only
   * const tracker2 = CpxTracker.getInstance(this)
   * 
   * @example
   * // Subsequent calls return same instance (config ignored)
   * const tracker3 = CpxTracker.getInstance({ creative, unit, screen }, customConfig) // tracker3 === tracker1
   */
  static getInstance(e, t = m) {
    const i = Z(), s = i.mbkCpxTracker;
    if (s) {
      const n = e && typeof e == "object" && "creative" in e;
      if (!s.contextOrComponent && e) {
        if (t && t !== m && (v.mergeObj(t, s.configuration), s.stateHandler = s.createStateHandler()), n) {
          const a = e;
          s.creative = a.creative, s.unit = a.unit, s.screen = a.screen, a.ctx && (s.mbkCtx = a.ctx, typeof window < "u" && (window.mbkCtx = a.ctx)), s.contextOrComponent = a.screen, a.ctx && s.exposureTracking.updateActionContext(a.ctx);
        } else
          s.contextOrComponent = e, s.screen = e;
        console.debug("CPX: Updated context/component for existing instance"), f.tryInitialize(s, e);
      } else if (n) {
        const a = e;
        t && t !== m && (v.mergeObj(t, s.configuration), s.stateHandler = s.createStateHandler(), console.debug("CPX: Updated configuration for existing instance")), a.ctx && (s.mbkCtx = a.ctx, typeof window < "u" && (window.mbkCtx = a.ctx), s.exposureTracking.updateActionContext(a.ctx), console.debug("CPX: Updated mbkCtx for existing instance")), console.warn("CPX already instantiated");
      } else
        console.warn("CPX already instantiated");
    } else
      i.mbkCpxTracker = new f(e, t), f.tryInitialize(i.mbkCpxTracker, e);
    return i.mbkCpxTracker;
  }
  /**
   * Attempts to initialize the tracker based on unit or component state.
   * Handles both normal Celtra context (with unit) and external loads (without unit).
   * 
   * @private
   */
  static tryInitialize(e, t) {
    let i = e.unit, s = e.screen;
    if (t && typeof t == "object" && "unit" in t) {
      const n = t;
      i = n.unit, s = n.screen;
    } else t && !i && (i = typeof unit < "u" ? unit : void 0, s = t);
    if (i) {
      i.hasAppearedAtLeastOnce ? e.initialize() : i.once("appeared", () => e.initialize());
      return;
    }
    if (s) {
      if (s.hasAppearedAtLeastOnce === !0) {
        e.initialize();
        return;
      }
      if (typeof s.once == "function") {
        s.once("appeared", () => e.initialize());
        return;
      }
      console.debug("CPX: Unit not available, initializing immediately with screen"), e.initialize();
    }
  }
  /**
   * Initializes the CPX tracker components.
   * 
   * Called automatically when the ad unit appears. Sets up:
   * - State handler for time tracking
   * - SuperTimer for polling
   * - Viewability observer
   * - ActionContext for passive tracking
   * 
   * Can be called manually when unit is not available (external loads).
   * 
   * @public
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
      const e = this.screen || this.contextOrComponent;
      if (e && typeof ActionContext < "u")
        try {
          this.exposureTracking.updateActionContext(new ActionContext(e, {
            certainlyNotCausedByUserBehavior: !1,
            consideredUserInitiatedByBrowser: !1
          }));
        } catch {
          console.warn("CPX: Failed to create ActionContext for exposure tracking. mbkCtx should be provided in context object.");
        }
      else
        console.warn("CPX: No component or ActionContext available for exposure tracking");
    }, 0);
  }
  createStateHandler() {
    return new q(
      {
        interval: this.configuration.pollTime,
        countingMode: this.configuration.countingMode
      },
      this.configuration.events,
      this.log,
      this.exposureTracking,
      () => this.supertimer.done()
    );
  }
  /**
   * Handles viewability detection failure.
   * 
   * Called when no valid viewability detection method is found.
   * Stops tracking, collects diagnostic data, and attempts to cancel timers.
   * 
   * @private
   */
  onViewableFailure() {
    this.log.warn("CPX: Viewability detection failed. Falling back to assumed viewability."), this.failData = new M(this.log);
  }
  /**
   * Handles changes in viewability state.
   * 
   * Pauses the timer when ad is not viewable, resumes when viewable.
   * This enables cumulative time tracking while preventing time accumulation
   * when the ad is not visible.
   * 
   * @param viewable - True if ad is currently viewable, false otherwise
   * @private
   */
  onViewableChange(e) {
    this.supertimer && (e && this.supertimer.isPaused() && this.supertimer.resume(), !e && !this.supertimer.isPaused() && this.supertimer.pause());
  }
  /**
   * Returns failure data if viewability detection failed.
   */
  readFailure() {
    return this.failData ? this.failData.data : null;
  }
}
const ee = f.setup.bind(f);
typeof window < "u" && (window.CpxTracker = f);
export {
  f as CpxTracker,
  ee as setup
};
