/*! Copyright Mobkoi 2026 (v5.5.1) */
class D {
  constructor(t) {
    this.log = t.enter("SafeFrameUtil");
  }
  check() {
    const t = {}, e = typeof window < "u" && window.location && typeof window.location.href == "string" ? window.location.href : "", i = typeof creative < "u" && creative?.adapter && creative.adapter.safeFrameDetected || !1, n = /googlesyndication/i.test(e) || /safeframe/i.test(e);
    if (t.detected = !!(i || n), typeof window < "u")
      try {
        t.apiObject = typeof window.$sf < "u" ? window.$sf : window.parent.$sf;
      } catch (o) {
        this.log.debug("SafeFrameUtil", "cannot access window.parent.$sf", o), t.apiObject = typeof window.$sf < "u" ? window.$sf : void 0;
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
class V {
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
    return this.add(new V(t));
  }
  add(t) {
    return t.parent = this, t;
  }
}
const W = new V("MOBKOI"), y = W.enter("Celtra"), S = y.enter("VideoControllerOptions"), F = {
  video: "vidPlayer",
  btnSound: "btnSound",
  icoIsMuted: "icoIsMuted",
  icoIsUnmuted: "icoIsUnmuted",
  btnPlay: "btnPlay",
  btnReplay: "btnReplay",
  countdown: "countdown",
  soundControl: !0,
  countdownActive: !0,
  clicktoplay: !1,
  scriptedPlay: !0,
  loadSpinner: !0,
  showPlayBtnOnCtp: !0,
  showPlayBtnOnEnd: !0,
  showCountdownOnEnd: !1,
  showSoundBtnOnEnd: !1,
  loopVideo: !1,
  mbkCustomEvents: []
};
function H(r) {
  S.debug("initializeOptions()", r), S.debug("options.videoCountdown:", r.videoCountdown);
  const t = r.debug ?? (typeof creative < "u" && creative.userParams?.thisDebug === "true"), e = {
    ...F,
    debug: t,
    ...r,
    mbkCustomEvents: r.mbkCustomEvents ? [...r.mbkCustomEvents] : []
  };
  return S.debug("initializeOptions returning:", e), S.debug("result.videoCountdown:", e.videoCountdown), e;
}
function U(r, t) {
  return Object.prototype.hasOwnProperty.call(r, t);
}
function p(r, t) {
  if (U(r, t)) {
    const e = r[t];
    return typeof e == "string" ? e === "true" : e;
  }
  return null;
}
class w extends Error {
  constructor(t, e) {
    super(t), this.cause = e;
  }
}
class R {
  constructor(t, e, i, n) {
    this.scope = t, this.options = e, this.actionCtx = n, this.elements = {}, this.log = i.enter("VideoElementManager");
  }
  get playButton() {
    return this.scope.find(this.options.btnPlay);
  }
  get replayButton() {
    return this.scope.find(this.options.btnReplay);
  }
  get unmutedButton() {
    return this.scope.find(this.options.icoIsUnmuted);
  }
  get mutedButton() {
    return this.scope.find(this.options.icoIsMuted);
  }
  get soundButton() {
    return this.scope.find(this.options.btnSound);
  }
  get countdown() {
    return this.scope.find(this.options.countdown);
  }
  /**
   * Gets a screen object by name, caching it for future use
   * @param name - The name of the screen object to get
   * @returns The screen object
   */
  getScreenObject(t) {
    if (this.elements[t])
      return this.elements[t];
    const e = this.scope.find(t);
    return e instanceof ScreenObject && (this.elements[t] = e), this.elements[t];
  }
  get celtraVideo() {
    if (!this._celtraVideo) {
      const t = this.options.video, e = this.getScreenObject(t);
      if (!e)
        throw new w(`FAILED to find Celtra video component "${t}"; Check your Celtra component names.`);
      this._celtraVideo = e;
    }
    return this._celtraVideo;
  }
  /**
   * Checks if a screen object exists and is valid.
   *
   * @param optionName - The option key that holds the screen object name
   * @returns Whether the screen object exists and is valid
   */
  hasScreenObject(t) {
    const e = this.options[t];
    return e && this.scope.find(e) instanceof ScreenObject ? !0 : (this.options.debug && this.log.warn(`warning: cannot find ScreenObject ${t}`), !1);
  }
  hasPlayButton() {
    return this.hasScreenObject("btnPlay");
  }
  showPlayButton() {
    this.log.debug("showPlayButton()"), this.hasPlayButton() && this.playButton.showAction(this.actionCtx, {}, noop);
  }
  hidePlayButton() {
    this.log.debug("hidePlayButton()"), this.hasPlayButton() && this.playButton.hideAction(this.actionCtx, {}, noop);
  }
  /**
   * Gets the native video controls element
   * @returns The native controls element
   */
  getNativeControls() {
    const t = this.scope.find(this.options.video);
    return t ? t.getNode().querySelector("div#hideable-controls") : null;
  }
  /**
   * Hides the native video controls
   */
  hideNativeControls() {
    const t = this.getNativeControls();
    t ? t.style.display = "none" : defer(() => this.hideNativeControls());
  }
}
const q = 1e4;
class T extends Error {
  constructor(t) {
    super(t), this.name = "VideoElementWaitTimeoutError";
  }
}
class g {
  /**
   * Look for a <video> inside a container.
   */
  static findInto(t) {
    return t ? t instanceof HTMLVideoElement ? t : t.querySelector("video") : null;
  }
  /**
   * Wait for <video> to be inside a container.
   */
  static expectInto(t, e = {}) {
    if (!t)
      return g.cancellableRejectedPromise(new Error("Cannot wait for video element without a container"));
    const i = g.findInto(t);
    if (i)
      return Object.assign(Promise.resolve(i), { cancel: noop });
    e.onWaiting?.();
    let n, o, s = !0, a = noop;
    const d = () => {
      s = !1, n && (n.disconnect(), n = void 0), o && (clearTimeout(o), o = void 0);
    }, f = new Promise((v, P) => {
      a = () => {
        s && (d(), P(new Error("Video element wait cancelled")));
      };
      const z = () => {
        if (!s)
          return;
        const j = g.findInto(t);
        j && (d(), v(j));
      };
      typeof MutationObserver < "u" && (n = new MutationObserver(z), n.observe(t, { childList: !0, subtree: !0 }));
      const B = e.timeoutMs ?? q;
      o = setTimeout(() => {
        s && (d(), P(new T(`Timed out waiting ${B}ms for <video> element inside #${t.id}`)));
      }, B);
    });
    return Object.assign(f, { cancel: a });
  }
  /**
   * Wait for a Celtra view/page to appear before starting the DOM video wait.
   * This prevents inactive pages from timing out before Celtra inserts their <video>.
   */
  static expectIntoWhenAppeared(t, e, i = {}) {
    if (!t || t.hasAppearedAtLeastOnce)
      return g.expectInto(e, i);
    const n = typeof t.on == "function" ? t.on.bind(t) : typeof t.once == "function" ? t.once.bind(t) : void 0;
    if (!n)
      return g.expectInto(e, i);
    let o = !0, s, a = noop;
    const d = new Promise((f, v) => {
      a = () => {
        o && (o = !1, s?.cancel(), v(new Error("Video element wait cancelled")));
      }, n("appeared", () => {
        o && (s = g.expectInto(e, i), s.then(f).catch(v));
      });
    });
    return Object.assign(d, { cancel: a });
  }
  static cancellableRejectedPromise(t) {
    return Object.assign(Promise.reject(t), { cancel: noop });
  }
}
class K {
  constructor(t, e, i, n, o) {
    this.elementManager = t, this.options = e, this.onViewportChange = i, this.activationView = o, this.isInViewport = !1, this.setupId = 0, this.log = n.enter("VideoViewportObserver");
  }
  get inViewport() {
    return this.isInViewport;
  }
  /**
   * Sets up the IntersectionObserver to monitor video visibility in the viewport
   */
  setupViewportObserver() {
    const t = ++this.setupId, e = this.elementManager.getScreenObject(this.options.video);
    if (!e)
      return;
    const i = e.getNode();
    g.expectIntoWhenAppeared(this.activationView, i, {
      onWaiting: () => {
        this.log.warn("Video element not found for viewport observer, waiting for it to be inserted");
      }
    }).then((n) => {
      t === this.setupId && this.setupVisibilityObserver(n);
    }).catch((n) => {
      this.log.error(n);
    });
  }
  setupVisibilityObserver(t) {
    this.visibilityObserver?.disconnect(), this.visibilityObserver = new IntersectionObserver((e) => {
      e.forEach((i) => {
        const n = this.isInViewport;
        this.isInViewport = i.isIntersecting, n !== this.isInViewport && (this.log.debug("Viewport change detected:", this.isInViewport ? "in viewport" : "out of viewport"), this.onViewportChange(this.isInViewport));
      });
    }, {
      threshold: 0.1,
      // Lower threshold to detect visibility changes earlier
      rootMargin: "0px"
      // No margin around the viewport
    }), this.visibilityObserver.observe(t), this.log.debug("Viewport observer set up for video element");
  }
  disconnect() {
    this.setupId++, this.visibilityObserver && (this.visibilityObserver.disconnect(), this.visibilityObserver = void 0);
  }
}
class G {
  constructor(t) {
    this.log = t.enter("VideoSafeFrameHandler"), this.safeframeUtil = new D(this.log);
  }
  /**
   * Attempts to setup SafeFrame monitoring for video playback
   * @param video - The CeltraVideo object
   * @param actionCtx - Celtra ActionContext
   * @param playSuccessCheck - Callback for play success
   */
  setupSafeFrameMonitoring(t, e, i) {
    const n = this.safeframeUtil.get(), o = n?.ext?.inViewPercentage;
    if (n && typeof o == "function")
      try {
        let s = null;
        this.sfInterval = setInterval(() => {
          o() > 0.05 && s !== "ended" ? t.playAction(e, {}, i) : t.pauseAction(e, {}, i);
        }, 250), ["playing", "ended"].forEach((a) => {
          t.on(a, () => {
            s = a;
          });
        });
      } catch (s) {
        this.log.warn("sfInterval failed", s);
      }
  }
  stopMonitoring() {
    this.sfInterval && (clearInterval(this.sfInterval), this.sfInterval = void 0);
  }
}
class Q {
  constructor(t, e, i, n, o, s, a, d) {
    this.scope = t, this.elementManager = e, this.options = i, this.safeframeHandler = n, this.actionCtx = o, this.setStatus = s, this.controller = d, this.playSuccessFlag = !1, this.log = a.enter("VideoPlaybackController");
  }
  /**
   * Attempts to play the video if autoplay is allowed
   */
  playIfAllowed() {
    if (this.setStatus("checking autoplay status"), p(
      this.options,
      "clicktoplay"
    ) || creative.userParams?.disableautoplay === "true" || creative.userParams?.disableautoplay === !0) {
      this.setStatus("autoplay disabled");
      const t = this.scope.find(this.options.video);
      t.autoplay && t.pauseAction(this.actionCtx, {}, noop);
      const e = p(this.options, "showPlayBtnOnCtp");
      return this.log.debug("showPlayBtnOnCtp=", e), e && this.elementManager.showPlayButton(), !1;
    } else {
      this.setStatus("attempting autoplay");
      const t = () => {
        this.playSuccessFlag || (this.controller && typeof this.controller.playCheck == "function" ? this.controller.playCheck() : this.playCheck(), this.playSuccessFlag = !0);
      };
      try {
        const e = this.controller && typeof this.controller.getScreenObject == "function" ? this.controller.getScreenObject(this.options.video) : this.elementManager.getScreenObject(this.options.video);
        e.muted || e.muteAction(this.actionCtx, {}, noop), e._player.on("autoplayrejected", () => {
          this.log.debug("autoplayrejected"), this.options.scriptedPlay || (this.elementManager.showPlayButton(), this.options.autoplayrejected = !0);
        }), e.hasAppearedAtLeastOnce ? e.playAction(this.actionCtx, {}, t) : e.once("appeared", () => {
          e.playAction(this.actionCtx, {}, t);
        }), this.safeframeHandler.setupSafeFrameMonitoring(e, this.actionCtx, t);
      } catch (e) {
        this.log.error("play attempt failed", e), this.setStatus("play attempt failed - status : " + (this.controller?.status || "unknown"), "warning"), this.elementManager.showPlayButton();
      }
      return !0;
    }
  }
  /**
   * Checks if the video is ready to play and handles playback state
   */
  playCheck() {
    const t = this.controller && typeof this.controller.getScreenObject == "function" ? this.controller.getScreenObject(this.options.video) : this.elementManager.getScreenObject(this.options.video), e = t.getNode(), i = typeof screen < "u" ? screen : this.scope, n = () => {
      this.controller && typeof this.controller.fireChecks == "function" ? this.controller.fireChecks() : this.fireChecks();
    };
    if (!e) {
      this.log.debug("Video node not found for playback checks, waiting for playing event"), t.on("playing", () => this.playCheck());
      return;
    }
    if (!i.hasAppearedAtLeastOnce && typeof i.on == "function") {
      i.on("appeared", () => {
        g.findInto(e) ? n() : this.waitForVideoElement(e, () => n());
      });
      return;
    }
    this.waitForVideoElement(e, n, i);
  }
  /**
   * Handles video playback checks and UI state based on video events
   */
  fireChecks() {
    const t = this.controller && typeof this.controller.getScreenObject == "function" ? this.controller.getScreenObject(this.options.video) : this.elementManager.getScreenObject(this.options.video), e = t.getNode();
    if (!e) {
      this.log.debug("Video node not found for playback checks");
      return;
    }
    this.waitForVideoElement(e, (i) => this.setupPlaybackChecks(t, i), this.scope);
  }
  waitForVideoElement(t, e, i) {
    if (this.videoElementWait)
      return;
    const n = g.expectIntoWhenAppeared(i, t, {
      onWaiting: () => {
        this.log.debug("Video element not found for playback checks, waiting for it to be inserted");
      }
    });
    this.videoElementWait = n, n.then((o) => {
      this.videoElementWait = void 0, e(o);
    }).catch((o) => {
      this.videoElementWait = void 0, o instanceof T && this.log.warn("Video element not found for playback checks before timeout");
    });
  }
  clearVideoElementWait() {
    this.videoElementWait && (this.videoElementWait.cancel(), this.videoElementWait = void 0);
  }
  setupPlaybackChecks(t, e) {
    this.clearVideoElementWait();
    const i = { timeupdate: 0 };
    t.on("timeupdate", () => {
      i.timeupdate++;
    });
    const n = typeof screen < "u" ? screen : this.scope;
    e.addEventListener("canplay", () => {
      this.log.debug("canplay"), this.elementManager.hidePlayButton(), n.unpauseCountdown && n.unpauseCountdown();
    }), e.addEventListener("waiting", () => {
      n.pauseCountdown && n.pauseCountdown();
    }), setTimeout(() => {
      i.timeupdate || (this.elementManager.hasPlayButton() && this.elementManager.playButton.showAction(this.actionCtx, {}, noop), n.pauseCountdown && n.pauseCountdown());
    }, 1500);
  }
  /**
   * Removes the loading spinner from the video player
   */
  removeSpinner() {
    const t = this.scope.find(this.options.video);
    t._player ? (t._player._controlsController._spinnerHide(), t._player._controlsController._spinnerShow = noop, t._player._controlsController._spinnerShown = !1) : defer(() => this.removeSpinner());
  }
  /**
   * Sets up indefinite playback (looping) for the video
   */
  setIndefinitePlay() {
    const t = this.scope.find(this.options.video);
    t.indefinitely = !0, this.options.countdownActive && t.on("pause", (e) => {
      if (e >= t.getDuration())
        try {
          this.scope.resetCountdown?.();
        } catch {
          this.setStatus("countdown reset failed", "warning");
        }
    });
  }
}
class N {
  constructor(t) {
    this.scope = t.scope, this.userInitiated = t.userInitiated;
  }
}
class $ extends N {
  constructor(t, e) {
    super(t), this.actionContext = e;
  }
}
class A {
  constructor(t) {
    this.name = "celtra", this.log = t.enter("MbkCeltraChannel");
  }
  static actionContextOf(t) {
    return t instanceof $ ? t.actionContext : void 0;
  }
  emit(t, e) {
    if (!t.legacyEvent)
      return !1;
    const i = typeof Creative < "u" ? Creative : void 0;
    if (typeof i?.trackCustomEventAction != "function")
      return this.log.debug("Creative API unavailable, no Celtra event for", t.legacyEvent), !1;
    const n = A.actionContextOf(e);
    if (!n)
      return this.log.warn("No ActionContext on the cause of", t.legacyEvent), !1;
    const o = t.legacyEvent;
    return i.trackCustomEventAction(n, { name: o }, () => this.log.debug("Celtra event accepted:", o)), !0;
  }
}
class J {
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
      } catch (n) {
        this.log.warn("Could not create an ActionContext, falling back to the ambient one", n);
      }
    return e.mbkCtx ?? e.ctx;
  }
}
class l {
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
      l.of(t),
      l.instance(t),
      l.path(t.scope),
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
    return [t.role, l.instance(t), l.path(t.scope)].join("|");
  }
  /** `"2"`, `"vidPlayer1"`, or `""` for a singleton such as the unit. */
  static instance(t) {
    return t.index !== void 0 ? String(t.index) : t.name ?? "";
  }
  /** Containment as one string, outermost first: `"panel:2>section:3"`. */
  static path(t) {
    const e = [];
    for (let i = t; i; i = i.scope) {
      const n = l.instance(i);
      e.unshift(n ? `${i.role}:${n}` : i.role);
    }
    return e.join(">");
  }
}
class c {
  /** Query parameters for one signal. Undefined values are omitted rather than sent empty. */
  static of(t, e) {
    const i = { k: t.verb, vs1: t.role };
    return c.set(i, "vs2", t.legacyEvent), c.set(i, "vs3", t.name), c.set(i, "vs4", l.path(t.scope) || void 0), c.set(i, "vs5", t.mode), c.set(i, "vi1", t.index), c.set(i, "vi2", t.ms), c.set(i, "vi3", t.from), c.set(i, "vi4", t.to), c.set(i, "vi5", t.completed === void 0 ? void 0 : Number(t.completed)), c.set(i, "vf1", t.percent), c.set(i, "vf2", t.modeMs), c.set(i, "iid", e), i;
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
    const n = t.includes("{{event}}") ? t.replace("{{event}}", encodeURIComponent(e.legacyEvent ?? e.verb)) : t, o = n.includes("?") ? "&" : "?";
    return `${n}${o}${c.toQueryString(c.of(e, i))}`;
  }
  static set(t, e, i) {
    i != null && i !== "" && (t[e] = i);
  }
}
const m = class m {
  constructor(t) {
    this.options = t;
  }
  get endpoint() {
    return this.options.endpoint ?? this.runtimeParam(m.endpointParam);
  }
  get errorEndpoint() {
    return this.options.errorEndpoint ?? this.runtimeParam(m.errorEndpointParam);
  }
  get impressionId() {
    return this.options.impressionId ? this.options.impressionId : (typeof creative < "u" ? creative : void 0)?.sessionId;
  }
  get pixelFallback() {
    return this.options.pixelFallback ?? m.defaults.pixelFallback;
  }
  get log() {
    return this.options.log ?? m.defaults.log();
  }
  /** Completes the configuration in place. Later values win, undefined ones leave the current one. */
  update(t) {
    const e = Object.keys(t).reduce((i, n) => {
      const o = t[n];
      return o !== void 0 && (i[n] = o), i;
    }, {});
    this.options = { ...this.options, ...e };
  }
  runtimeParam(t) {
    const i = (typeof creative < "u" ? creative : void 0)?.runtimeParams?.[t];
    return typeof i == "string" && i ? i : void 0;
  }
};
m.endpointParam = "externalSignalTrackerURI", m.errorEndpointParam = "externalClientErrorURI", m.defaults = {
  pixelFallback: !0,
  log: () => new V("mbk")
};
let k = m;
class X {
  constructor(t, e) {
    this.config = t, this.name = "beacon", this.log = e.enter("MbkBeaconChannel");
  }
  emit(t) {
    const e = this.config.endpoint;
    if (!e)
      return this.log.debug(`No ${k.endpointParam}, raw signal not sent`), !1;
    const i = globalThis.navigator?.sendBeacon;
    if (typeof i != "function")
      return this.log.debug("sendBeacon unavailable"), !1;
    const n = c.url(e, t, this.config.impressionId), o = i.call(globalThis.navigator, n);
    return this.log.debug(o ? "queued" : "refused", n), o;
  }
}
const M = class M {
};
M.mapping = [
  { kind: { verb: "click", role: "cta" }, legacyEvent: () => "clickSite" },
  { kind: { verb: "click", role: "unit" }, legacyEvent: () => "clickSite" }
];
let O = M;
class L {
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
      this.resolvers.set(l.of(e.kind), e.legacyEvent);
    }
    return this;
  }
  has(t) {
    return this.resolvers.has(l.of(t));
  }
  /**
   * @returns the Celtra event name for this signal, or `undefined` when no resolver is registered
   *   for its kind or when the registered one threw.
   */
  resolve(t) {
    const e = this.resolvers.get(l.of(t));
    if (e)
      try {
        const { legacyEvent: i, ...n } = t, o = e(n);
        if (typeof o != "string" || !o) {
          this.log.warn(`Resolver for ${l.of(t)} produced no name`, o);
          return;
        }
        return o;
      } catch (i) {
        this.log.warn(`Resolver for ${l.of(t)} failed, no Celtra event emitted`, i);
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
    const i = c.url(e, t, this.config.impressionId), n = new Image();
    this.pending.add(n);
    const o = () => this.pending.delete(n);
    return n.onload = o, n.onerror = o, n.src = i, this.log.debug("sent", i), !0;
  }
}
class Z {
  constructor(t, e) {
    this.config = t, this.log = e.enter("MbkTrackErrorReporter");
  }
  report(t, e, i) {
    this.log.warn(`Channel "${t}" failed for ${l.of(e)}`, i);
    const n = this.config.errorEndpoint;
    if (n)
      try {
        const o = [
          `error=${encodeURIComponent(`mbkTrack:${t}`)}`,
          `reason=${encodeURIComponent(String(i?.message ?? i))}`,
          `k=${encodeURIComponent(e.verb)}`
        ], s = this.config.impressionId;
        s && o.push(`iid=${encodeURIComponent(s)}`);
        const a = `${n}${n.includes("?") ? "&" : "?"}${o.join("&")}`;
        globalThis.navigator?.sendBeacon?.(a);
      } catch (o) {
        this.log.debug("Could not report the channel failure", o);
      }
  }
}
const h = class h {
  constructor(t) {
    this.tracks = /* @__PURE__ */ new Map(), this.emitted = /* @__PURE__ */ new Set(), this.states = /* @__PURE__ */ new Map(), this.config = new k(t), this.log = this.config.log.enter("MbkImpression"), this.startedAt = h.now(), this.beacon = new X(this.config, this.log), this.pixel = new Y(this.config, this.log), this.reporter = new Z(this.config, this.log), this.coreLegacyEvents = new L(this.log, "core", O.mapping);
  }
  /** The one impression of this creative, created on first use. */
  static shared(t) {
    const e = h.storage(), i = e[h.storageKey];
    if (i)
      return i.configure(t), i;
    const n = new h(t);
    return e[h.storageKey] = n, n;
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
  track(t, e, i) {
    const n = this.tracks.get(t);
    if (n) {
      if (!(n instanceof i))
        throw new Error(
          `MbkTrack: script "${t}" is already tracked as a ${n.constructor.name}, not a ${i.name}. Every instance of one script must pick the same specialisation.`
        );
      return n;
    }
    const o = e();
    return this.tracks.set(t, o), o;
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
   * Whether this signal goes out under that emission, recording what it needs to for the next one.
   *
   * Everything is recorded **synchronously**, before any channel: this is the CustomWipeable defect,
   * where the flag was pushed inside the asynchronous tracking callback so two calls could both pass.
   */
  admits(t, e) {
    const i = l.signature(t);
    switch (e) {
      case "repeated":
        return !0;
      case "once":
        return this.emitted.has(i) ? (this.log.debug("Already emitted, skipping", i), !1) : (this.emitted.add(i), !0);
      case "state": {
        const n = l.subject(t);
        return this.states.get(n) === i ? (this.log.debug("Unchanged, skipping", i), !1) : (this.states.set(n, i), !0);
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
    } catch (n) {
      return this.reporter.report(t.name, e, n), !1;
    }
  }
};
h.storageKey = "mbkImpression", h.windowStorageKey = "__mbkTrackStorage";
let x = h;
class E {
  constructor(t, e) {
    this.impression = t, this.key = e, this.log = t.log.enter(`${this.constructor.name}(${e})`), this.legacyEvents = new L(this.log, e, []);
  }
  /**
   * The track of that script, created on first use, completed with its dictionary.
   *
   * The instance is read and dropped: nothing here keeps a reference to a partially constructed
   * object.
   */
  static shared(t, e) {
    const i = x.shared(e);
    return i.track(t.trackingKey, () => new E(i, t.trackingKey), E).declare(t.legacyEventsMapping);
  }
  /** Adds this script's Celtra event names. A later declaration wins for the same kind. */
  declare(t) {
    return this.legacyEvents.declare(t), this;
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
    const n = { ...t, ms: this.impression.elapsedMs() };
    !n.scope && e.scope && (n.scope = e.scope), this.impression.admits(n, i) && (n.legacyEvent = t.legacyEvent ?? this.resolveLegacyEvent(n), this.log.debug("emit", n), this.emitChannels(n, e));
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
    return e || this.log.debug(`No resolver for ${l.of(t)}, raw signal only`), e;
  }
}
class C extends E {
  constructor(t, e, i) {
    super(t, e), this.contexts = new J(e, this.log, i), this.celtra = new A(this.log);
  }
  /**
   * @throws when the same script is already tracked as a plain {@link MbkTrack}. See
   *   {@link MbkImpression.track}.
   */
  static shared(t, e) {
    const i = x.shared(e);
    return i.track(
      t.trackingKey,
      () => new C(i, t.trackingKey, e.initiator),
      C
    ).declare(t.legacyEventsMapping);
  }
  /**
   * A Celtra context, carrying the `ActionContext` this cause's legacy events are fired with: the
   * one the call site forwarded from its handler, else a fresh user-initiated one when the cause is
   * a gesture, else this script's common passive one.
   */
  context(t) {
    const e = t.actionContext ?? this.contexts.forCause(t.userInitiated);
    return new $(t, e);
  }
  /** The legacy event first, unchanged, then the raw channels. */
  emitChannels(t, e) {
    this.impression.send(this.celtra, t, e), super.emitChannels(t, e);
  }
}
class _ {
  constructor(t, e, i, n, o, s, a) {
    this.scope = t, this.elementManager = e, this.options = i, this.actionCtx = n, this.setStatus = o, this.state = s, this.trackingKey = "video", this.mediaPlay = { verb: "play", role: "media" }, this.mediaPause = { verb: "pause", role: "media" }, this.mediaLegacy = { verb: "legacy", role: "media" }, this.legacyEventsMapping = [], this.log = a.enter("VideoEventHandlers"), this.track = C.shared(this, {}), this.playback = this.track.context({ scope: void 0, userInitiated: !1, actionContext: this.actionCtx });
  }
  onPlaying(t) {
    this.trackPlayback(this.mediaPlay, t), this.state.hasVideoPlayed = !0, this.state.hasVideoCompleted = !1, this.elementManager.hidePlayButton(), this.elementManager.hasScreenObject("btnReplay") && this.elementManager.replayButton.hideAction(this.actionCtx, {}, noop), p(this.options, "soundControl") && this.elementManager.hasScreenObject("btnSound") && this.elementManager.soundButton.showAction(this.actionCtx, {}, noop), p(this.options, "countdownActive") && this.elementManager.hasScreenObject("countdown") && this.elementManager.countdown.showAction(this.actionCtx, {}, noop), this.setStatus("playing");
  }
  onPause(t) {
    this.trackPlayback(this.mediaPause, t), t && this.elementManager.showPlayButton(), this.setStatus("paused");
  }
  onMute() {
    if (p(this.options, "soundControl")) {
      const t = this.elementManager.unmutedButton, e = this.elementManager.mutedButton;
      t && typeof t.hideAction == "function" && t.hideAction(this.actionCtx, {}, noop), e && typeof e.showAction == "function" && e.showAction(this.actionCtx, {}, noop);
    }
    this.setStatus("muted");
  }
  onUnmute() {
    if (p(this.options, "soundControl")) {
      const t = this.elementManager.unmutedButton, e = this.elementManager.mutedButton;
      t && typeof t.showAction == "function" && t.showAction(this.actionCtx, {}, noop), e && typeof e.hideAction == "function" && e.hideAction(this.actionCtx, {}, noop);
    }
    this.setStatus("unmuted");
  }
  onEnded() {
    this.state.hasVideoCompleted = !0, this.elementManager.hasScreenObject("btnReplay") && this.elementManager.replayButton.showAction(this.actionCtx, {}, noop), p(this.options, "showPlayBtnOnEnd") ? this.elementManager.showPlayButton() : this.elementManager.hidePlayButton(), this.elementManager.hasScreenObject("btnSound") && (p(this.options, "showSoundBtnOnEnd") ? this.elementManager.soundButton.showAction(this.actionCtx, {}, noop) : this.elementManager.soundButton.hideAction(this.actionCtx, {}, noop)), this.elementManager.hasScreenObject("countdown") && (p(this.options, "showCountdownOnEnd") ? this.elementManager.countdown.showAction(this.actionCtx, {}, noop) : this.elementManager.countdown.hideAction(this.actionCtx, {}, noop)), this.setStatus("ended");
  }
  toggleSound() {
    const t = this.scope.find(String(this.options.video));
    t.muted ? (this.options.debug && this.log.debug("Unmuting video"), t.unMuteAction(this.actionCtx, {}, noop), this.logger("mbk_video_unmuted")) : (this.options.debug && this.log.debug("Muting video"), t.muteAction(this.actionCtx, {}, noop), this.logger("mbk_video_muted"));
  }
  logger(t) {
    this.options.mbkCustomEvents.indexOf(t) === -1 ? (this.options.debug && this.log.debug(`[Event] - ${t}`), this.options.mbkCustomEvents.push(t), this.track.once({ ...this.mediaLegacy, name: this.options.video, legacyEvent: t }, this.playback)) : this.options.debug && this.log.debug("event already exist", this.options.mbkCustomEvents);
  }
  /**
   * One playback signal, with its cause.
   *
   * A user-initiated context is built for each gesture rather than reused, because the flag it
   * carries is a claim about the browser's user-activation window. The automatic ones share the
   * playback context.
   */
  trackPlayback(t, e) {
    const i = { scope: void 0, userInitiated: !0, actionContext: void 0 }, n = e ? this.track.context(i) : this.playback;
    this.track.state({ ...t, name: this.options.video }, n);
  }
}
class tt {
  constructor(t, e, i, n) {
    this.elementManager = t, this.options = e, this.actionCtx = i, this.trackingKey = "video", this.mediaProgress = { verb: "progress", role: "media" }, this.quartileEventMap = {
      videoStart: "video_start",
      videoFirstQuartile: "video_p25",
      videoMidpoint: "video_p50",
      videoThirdQuartile: "video_p75",
      videoComplete: "video_complete"
    }, this.legacyEventsMapping = [
      { kind: this.mediaProgress, legacyEvent: (o) => this.legacyQuartileEvent(o.percent) }
    ], this.quartilePercents = {
      videoStart: 0,
      videoFirstQuartile: 25,
      videoMidpoint: 50,
      videoThirdQuartile: 75,
      videoComplete: 100
    }, this.log = n.enter("VideoQuartileTracker"), this.quartileEvents = this.createQuartileEvents(), this.track = C.shared(this, {}), this.playback = this.track.context({ scope: void 0, userInitiated: !1, actionContext: this.actionCtx });
  }
  setupQuartileListeners() {
    const t = this.elementManager.getScreenObject(this.options.video);
    if (!t?._player) {
      this.log.warn("Video player not found for quartile tracking");
      return;
    }
    const e = document.createElement("div");
    document.body.appendChild(e), Object.keys(this.quartileEventMap).forEach((i) => {
      const n = this.quartileEventMap[i];
      t._player.on(i, () => {
        if (!this.quartileEvents[n])
          if (this.log.debug(`Tracking: ${n}`), this.quartileEvents[n] = !0, this.track.once(
            { ...this.mediaProgress, name: this.options.video, percent: this.quartilePercents[i] },
            this.playback
          ), this.options.tagservice) {
            const o = new Image();
            o.src = this.buildTrackingUrl(n), e.appendChild(o);
          } else
            this.postToParent(n);
      });
    });
  }
  buildTrackingUrl(t) {
    return creative.runtimeParams.externalVideoTrackerURI.replace("{{event}}", t);
  }
  postToParent(t) {
    const e = (d) => typeof d == "string" && d.length > 0 && d !== "null" ? d : void 0, i = globalThis.location, n = e(i?.origin), o = e(i?.href), s = o ? e(new URL(o).origin) : void 0, a = this.options.postMessageTargetOrigin ?? n ?? s ?? "*";
    globalThis.parent.parent.postMessage({ type: t, data: {} }, a);
  }
  /**
   * The Celtra event name for a media progress, derived from the two maps above rather than from a
   * third table, so the names cannot drift.
   *
   * @throws when the percentage is not a quartile, which produces no Celtra event rather than an
   *   invented one. The raw signal still carries the exact percentage.
   */
  legacyQuartileEvent(t) {
    const e = Object.keys(this.quartilePercents).find((i) => this.quartilePercents[i] === t);
    if (!e)
      throw new Error(`No Celtra event for a media progress at ${t}%`);
    return this.quartileEventMap[e];
  }
  createQuartileEvents() {
    const t = {};
    return Object.values(this.quartileEventMap).forEach((e) => {
      t[e] = !1;
    }), t;
  }
}
class et {
  constructor(t, e, i, n, o, s, a) {
    this.elementManager = t, this.options = e, this.actionCtx = i, this.onSceneEnd = n, this.controller = s, this.unit = a, this.log = o.enter("VideoInstructionScene");
  }
  /**
   * Checks if an instruction scene is configured
   */
  hasInstructionScene() {
    return !!(this.options.instructionScene && this.options.instructionScene.trim() !== "");
  }
  /**
   * Sets up the instruction scene playback behavior
   */
  setupInstructionScenePlayback(t) {
    if (!t) {
      this.controller && typeof this.controller.setStatus == "function" ? this.controller.setStatus("Instruction scene not found", "warning") : this.log.warn("Instruction scene not found");
      return;
    }
    this.controller.pause(), t._player.addEventListener("end", () => {
      this.log.debug(`${t.name}_ended`), this.onSceneEnd();
    });
  }
  /**
   * Handles the instruction scene playback logic
   */
  playAfterScene() {
    if (!this.hasInstructionScene())
      return;
    const t = this.unit || (typeof unit < "u" ? unit : null);
    if (!t) {
      this.log.warn("Unit object not found for instruction scene");
      return;
    }
    const e = t.find(this.options.instructionScene);
    this.log.debug("Setting up instruction scene playback:", e), this.controller && typeof this.controller.setupInstructionScenePlayback == "function" ? this.controller.setupInstructionScenePlayback(e) : this.setupInstructionScenePlayback(e);
  }
}
const b = y.enter("VideoCountdown");
class it {
  constructor(t, e, i) {
    this.parentElement = t, this.options = i, this.currentTime = 0, this.isVisible = !1, this.isPaused = !1, this.interval = null, this.intervalValue = 0, b.debug("Constructor called", {
      parentElement: t,
      duration: e,
      options: i,
      parentTag: t?.tagName
    }), this.duration = e, this.mode = i.mode, this.size = this.getSizeInPixels(i.size), this.mode === "kinetic" && (this.duration = 0.95 * this.duration), this.container = this.createContainer(), b.debug("Container created", this.container), this.svg = this.createSVG(), b.debug("SVG created", this.svg), this.progressCircle = this.createProgressCircle(), this.textElement = this.createTextElement(), this.svg.appendChild(this.createBackgroundCircle()), this.svg.appendChild(this.progressCircle), this.mode === "countdown" && (this.svg.appendChild(this.textElement), b.debug("Text element added")), this.container.appendChild(this.svg), b.debug("SVG appended to container"), this.parentElement.appendChild(this.container), b.debug("Container appended to parent. Parent children:", this.parentElement.children.length), this.updateProgress(), b.debug("Progress updated. Container in DOM:", document.contains(this.container));
  }
  getSizeInPixels(t) {
    switch (t) {
      case "small":
        return 26;
      case "normal":
        return 32;
      case "big":
        return 40;
      default:
        return 32;
    }
  }
  createContainer() {
    const t = document.createElement("div");
    return t.className = "mbk-countdown", t.style.cssText = `
      position: absolute;
      z-index: 50;
      top: 0;
      left: 0;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    `, t;
  }
  createSVG() {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    return t.setAttribute("width", this.size.toString()), t.setAttribute("height", this.size.toString()), t.setAttribute("viewBox", `0 0 ${this.size} ${this.size}`), t.style.cssText = `
      display: block;
    `, t;
  }
  createBackgroundCircle() {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "circle"), e = this.size / 2 - 2;
    return t.setAttribute("cx", (this.size / 2).toString()), t.setAttribute("cy", (this.size / 2).toString()), t.setAttribute("r", e.toString()), t.setAttribute("fill", this.options.bgColor), t;
  }
  createProgressCircle() {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "circle"), e = this.size / 2 - 4, i = 2 * Math.PI * e;
    return t.setAttribute("cx", (this.size / 2).toString()), t.setAttribute("cy", (this.size / 2).toString()), t.setAttribute("r", e.toString()), t.setAttribute("fill", "none"), t.setAttribute("stroke", this.options.barColor), t.setAttribute("stroke-width", "2"), t.setAttribute("stroke-linecap", "round"), t.setAttribute("stroke-dasharray", i.toString()), t.setAttribute("stroke-dashoffset", i.toString()), t.setAttribute("transform", `rotate(-90 ${this.size / 2} ${this.size / 2})`), t.style.transition = "stroke-dashoffset 0.1s linear", t;
  }
  createTextElement() {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    return t.setAttribute("x", "50%"), t.setAttribute("y", "50%"), t.setAttribute("text-anchor", "middle"), t.setAttribute("dominant-baseline", "central"), t.setAttribute("fill", this.options.barColor), t.setAttribute("font-family", "Helvetica, Arial, sans-serif"), t.setAttribute("font-size", (this.size * 0.4).toString()), t.setAttribute("font-weight", "normal"), t.style.userSelect = "none", t.textContent = "0", t;
  }
  updateProgress() {
    const t = this.size / 2 - 4, e = 2 * Math.PI * t;
    let i;
    if (this.mode === "countdown") {
      const o = Math.max(0, this.duration - this.currentTime);
      if (i = o / this.duration, this.textElement) {
        const s = Math.round(o / 1e3);
        this.textElement.textContent = s.toString();
      }
    } else
      i = 1 - this.currentTime / this.duration;
    const n = e * (1 - i);
    this.progressCircle.setAttribute("stroke-dashoffset", n.toString());
  }
  show() {
    this.isVisible = !0, this.container.style.opacity = "1";
  }
  hide() {
    this.isVisible = !1, this.container.style.opacity = "0";
  }
  setCurrentTime(t) {
    this.currentTime = t, this.updateProgress();
  }
  setDuration(t) {
    this.duration = t, this.mode === "kinetic" && (this.duration = 0.95 * t), this.updateProgress();
  }
  begin() {
    this.interval || (this.isPaused = !1, this.intervalValue = Math.floor(this.currentTime / 100), this.interval = window.setInterval(() => {
      if (!this.isPaused) {
        const t = this.intervalValue++ * 100;
        t < this.duration ? this.setCurrentTime(t) : this.stop();
      }
    }, 100));
  }
  pause() {
    this.isPaused = !0;
  }
  unpause() {
    this.isPaused = !1;
  }
  reset() {
    this.stop(), this.intervalValue = 0, this.setCurrentTime(0);
  }
  stop() {
    this.interval && (clearInterval(this.interval), this.interval = null);
  }
  syncWithVideo(t) {
    const e = t * 1e3;
    Math.abs(e - this.currentTime) > 1e3 && (this.intervalValue = Math.floor(e / 100), this.setCurrentTime(e));
  }
  destroy() {
    this.stop(), this.container && this.container.parentNode && this.container.parentNode.removeChild(this.container);
  }
  get isCounting() {
    return this.interval !== null;
  }
  get paused() {
    return this.isPaused;
  }
}
const nt = {
  enabled: !1,
  mode: "countdown",
  size: "normal",
  barColor: "#fff",
  bgColor: "rgba(0, 0, 0, 0.2)",
  autoSync: !0
};
function ot(r) {
  return {
    ...nt,
    ...r
  };
}
const st = "#fff", rt = "drop-shadow(0px 2px 2px rgba(0,0,0,0.85))", at = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75" width="28" height="28" aria-hidden="true" focusable="false">
  <path d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z"
        fill="currentColor" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  <path d="M48,27.6a19.5,19.5 0 0 1 0,21.4
           M55.1,20.5a30,30 0 0 1 0,35.6
           M61.6,14a38.8,38.8 0 0 1 0,48.6"
        fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
</svg>
`.trim(), ct = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75" width="28" height="28" aria-hidden="true" focusable="false">
  <path d="m39,14-17,15H6V48H22l17,15z" fill="currentColor" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  <path d="m49,26 20,24m0-24-20,24" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
</svg>
`.trim(), u = class u {
  constructor(t, e, i, n, o) {
    this.scope = t, this.actionCtx = i, this.unitRef = o, this.status = "unstarted", this.state = {
      hasVideoPlayed: !1,
      hasVideoCompleted: !1
    }, this.lastClickAt = 0, this.suppressNextPausePlayButton = !1, u.instanceCount++, this.log = n.enter("VideoController#" + u.instanceCount), this.log.debug("constructor starting...", { hasActionCtx: !!i }), this.options = H(e), this.log.debug("Options initialized:", this.options), this.scope = t || screen, this.elementManager = new R(this.scope, this.options, this.log, this.actionCtx), this.safeframeHandler = new G(this.log), this.viewportObserver = new K(
      this.elementManager,
      this.options,
      (s) => this.handleViewportChange(s),
      this.log,
      this.scope
    ), this.playbackController = new Q(
      this.scope,
      this.elementManager,
      this.options,
      this.safeframeHandler,
      this.actionCtx,
      (s, a) => this.setStatus(s, a),
      this.log,
      this
    ), this.eventHandlers = new _(
      this.scope,
      this.elementManager,
      this.options,
      this.actionCtx,
      (s, a) => this.setStatus(s, a),
      this.state,
      this.log
    ), this.quartileTracker = new tt(
      this.elementManager,
      this.options,
      this.actionCtx,
      this.log
    ), this.instructionScene = new et(
      this.elementManager,
      this.options,
      this.actionCtx,
      () => {
        this.hasVideoPlayed || (this.hasVideoPlayed = !0, this.playIfAllowed());
      },
      this.log,
      this,
      this.unitRef
    ), this.log.debug("Checking videoCountdown option:", {
      hasVideoCountdown: !!this.options.videoCountdown,
      videoCountdown: this.options.videoCountdown,
      enabled: this.options.videoCountdown?.enabled
    }), this.options.videoCountdown?.enabled ? (this.log.debug("videoCountdown is enabled, calling initializeCountdown()"), this.initializeCountdown()) : this.log.debug("videoCountdown is NOT enabled or not present");
  }
  static isValidScreen(t) {
    return !!(t && typeof t.find == "function");
  }
  static resolveScreen(t, e) {
    if (u.isValidScreen(e))
      return e;
    if (typeof t?.getScreen == "function") {
      const i = t.getScreen();
      if (u.isValidScreen(i))
        return i;
    }
    try {
      if (typeof screen < "u" && u.isValidScreen(screen))
        return screen;
    } catch (i) {
      y.enter("VideoController").enter("setup").debug("Unable to access global 'screen' variable", i);
    }
    return e;
  }
  static resolveUnit(t, e, i) {
    if (e)
      return e;
    if (typeof t?.getUnit == "function")
      return t.getUnit();
    if (typeof i?.getUnit == "function")
      return i.getUnit();
    try {
      if (typeof unit < "u")
        return unit;
    } catch (n) {
      y.enter("VideoController").enter("setup").debug("Unable to access global 'unit' variable", n);
    }
    throw new w("unit not found in global scope");
  }
  /**
   * Automatically sets up the Video Controller by scanning the environment for Celtra globals.
   * Recommended for external loading scenarios.
   *
   * @param options Will be completed by defaults.
   */
  static setup(t) {
    y.enter("VideoController").enter("setup").debug("setup() called", t);
    const i = globalThis.window;
    if (!i)
      throw new w("window not found");
    const n = t.creative || i.creative, o = u.resolveScreen(n, t.screen || i.screen);
    if (!u.isValidScreen(o))
      throw new w(`Invalid screen ref: ${o}`);
    const s = u.resolveUnit(n, t.unit || i.unit, o), a = new ActionContext(o, {
      certainlyNotCausedByUserBehavior: !1,
      consideredUserInitiatedByBrowser: !1
    }), d = y.enter("VideoControllerInit"), f = new u(o, t, a, d, s);
    o.mbkVidController = f;
    const v = () => {
      f.init(), f.playAfterScene();
    };
    return s.hasAppearedAtLeastOnce ? v() : s.once("appeared", v), f;
  }
  // Getters for backward compatibility or easy access
  get playButton() {
    return this.elementManager.playButton;
  }
  get replayButton() {
    return this.elementManager.replayButton;
  }
  get unmutedButton() {
    return this.elementManager.unmutedButton;
  }
  get mutedButton() {
    return this.elementManager.mutedButton;
  }
  get soundButton() {
    return this.elementManager.soundButton;
  }
  get countdown() {
    return this.elementManager.countdown;
  }
  get hasVideoPlayed() {
    return this.state.hasVideoPlayed;
  }
  set hasVideoPlayed(t) {
    this.log.debug(`set hasVideoPlayed = ${t}`), this.state.hasVideoPlayed = t;
  }
  get hasVideoCompleted() {
    return this.state.hasVideoCompleted;
  }
  set hasVideoCompleted(t) {
    this.log.debug(`set hasVideoCompleted = ${t}`), this.state.hasVideoCompleted = t;
  }
  get isInViewport() {
    return this.viewportObserver.inViewport;
  }
  set isInViewport(t) {
    this.viewportObserver.isInViewport = t;
  }
  get visibilityObserver() {
    return this.viewportObserver.visibilityObserver;
  }
  // Expose modular methods for backward compatibility and testing
  hasBoolOption(t) {
    return p(this.options, t);
  }
  getScreenObject(t) {
    return this.elementManager.getScreenObject(t);
  }
  hasScreenObject(t) {
    return this.elementManager.hasScreenObject(t);
  }
  get celtraVideo() {
    return this.elementManager.celtraVideo;
  }
  get videoElement() {
    if (!this._videoElement)
      throw new w("Expected <video> element");
    return this._videoElement;
  }
  onPlaying() {
    if (this.log.debug("onPlaying()"), this.eventHandlers.onPlaying(this.isUserGesture()), this.celtraVideo.autoplay && this.options.scriptedPlay === !0 && !this.viewportObserver.inViewport && (this.options.scriptedPlay = "playing", this.scriptedPause()), this.videoCountdown) {
      const e = this.scope;
      !this.videoCountdown.isCounting && this.hasVideoPlayed ? e.beginCountdown?.() : this.videoCountdown.paused && e.unpauseCountdown?.();
    }
  }
  pause(t = noop) {
    this.log.debug("pause()"), this.celtraVideo.pauseAction(this.actionCtx, {}, t);
  }
  scriptedPause() {
    this.log.debug("scriptedPause()"), this.suppressPlayButtonOnNextPause(), this.elementManager.hidePlayButton(), this.pause(() => {
      this.playWhenAppearing();
    });
  }
  /** Whether a genuine tap on the video happened recently enough to have caused what is happening. */
  isUserGesture() {
    return Date.now() - this.lastClickAt < u.USER_CLICK_WINDOW_MS;
  }
  onPause() {
    this.log.debug("onPause()");
    const t = this.isUserGesture() && !this.suppressNextPausePlayButton;
    this.suppressNextPausePlayButton = !1, this.eventHandlers.onPause(t), this.videoCountdown && this.scope.pauseCountdown?.();
  }
  onTimeUpdate(t) {
    this.log.debug("onTimeUpdate()"), this.videoCountdown && this.options.videoCountdown?.autoSync && this.videoCountdown?.syncWithVideo(t);
  }
  onEnded() {
    this.eventHandlers.onEnded(), this.videoCountdown && this.scope.resetCountdown?.();
  }
  onMute() {
    this.eventHandlers.onMute();
  }
  onUnmute() {
    this.eventHandlers.onUnmute();
  }
  logger(t) {
    this.eventHandlers.logger(t);
  }
  setupInstructionScenePlayback(t) {
    this.instructionScene.setupInstructionScenePlayback(t);
  }
  hasInstructionScene() {
    return this.instructionScene.hasInstructionScene();
  }
  setupViewportObserver() {
    this.viewportObserver.setupViewportObserver();
  }
  removeSpinner() {
    return this.playbackController.removeSpinner();
  }
  hideNativeControls() {
    return this.elementManager.hideNativeControls();
  }
  playCheck() {
    return this.playbackController.playCheck();
  }
  fireChecks() {
    return this.playbackController.fireChecks();
  }
  setIndefinitePlay() {
    return this.playbackController.setIndefinitePlay();
  }
  get safeframeUtil() {
    return this.safeframeHandler.safeframeUtil;
  }
  set safeframeUtil(t) {
    this.safeframeHandler.safeframeUtil = t;
  }
  /**
   * Initializes the video controller and sets up all necessary event listeners
   */
  init() {
    this.log.debug("init() called"), this.setStatus("init"), this.elementManager.hidePlayButton(), typeof document < "u" && document.addEventListener("click", (t) => {
      let e = null;
      try {
        e = this.celtraVideo?.getNode?.();
      } catch {
        e = null;
      }
      const i = t.target, n = e?.getBoundingClientRect?.(), { clientX: o, clientY: s } = t, a = !!n && o >= n.left && o <= n.right && s >= n.top && s <= n.bottom, d = !!(e && i && e.contains(i));
      (a || d) && (this.lastClickAt = Date.now());
    }, !0), this.options.loopVideo && this.setIndefinitePlay(), this.log.debug("Celtra video is ", this.celtraVideo), this.options.debug && this.log.debug(this.options), this.options.loadSpinner || this.removeSpinner(), this.setupEventListeners(), this.setupViewportObserver(), this.hideNativeControls();
  }
  /**
   * Sets the status of the video controller and logs it if debug is enabled
   */
  setStatus(t, e = "status") {
    U(this.options, e) && (this.options[e] = t), this.options.debug && this.log.debug(`${e}: ${t}`);
  }
  /**
   * Handles video pausing/resuming based on viewport visibility
   */
  handleViewportChange(t) {
    this.log.debug("Handling viewport change:", {
      isInViewport: t,
      hasVideoPlayed: this.hasVideoPlayed,
      hasVideoCompleted: this.hasVideoCompleted,
      currentStatus: this.status
    }), !t && !this.hasVideoCompleted ? (this.log.debug("Pausing video - out of viewport and not completed first play"), this.scriptedPause()) : t ? t && !this.hasVideoCompleted && (this.hasVideoPlayed || this.celtraVideo.autoplay && this.options.scriptedPlay === "playing") ? (this.log.debug("Resuming video - back in viewport and not completed first play"), this.elementManager.hidePlayButton(), this.celtraVideo.playAction(this.actionCtx, {}, noop)) : this.hasVideoPlayed ? this.log.debug("Not playing video - in viewport but video has completed") : this.log.debug("Not playing video - in viewport but video has not started") : this.log.debug("Not pausing video - out of viewport but video has completed");
  }
  /**
   * Attempts to play the video if autoplay is allowed
   */
  playIfAllowed() {
    return this.playbackController.playIfAllowed();
  }
  /**
   * Handles the instruction scene playback logic
   */
  playAfterScene() {
    this.instructionScene.playAfterScene();
  }
  playWhenAppearing() {
    if (typeof IntersectionObserver > "u")
      throw new w("IntersectionObserver not available, cannot wait for video viewport appearance");
    this.log.debug("Waiting for video to appear in viewport...");
    const t = new IntersectionObserver((e) => {
      e.some((n) => n.isIntersecting) && (t.disconnect(), this.log.debug("Video appeared in viewport, playing..."), this.playIfAllowed());
    }, {
      threshold: 0.1
    });
    t.observe(this.videoElement);
  }
  suppressPlayButtonOnNextPause() {
    this.suppressNextPausePlayButton = !0;
  }
  listenEventsFrom(t) {
    t.addEventListener("volumechange", () => {
      t.muted ? this.onMute() : this.onUnmute(), this.updateSoundDomIcon(t.muted);
    });
  }
  /**
   * Toggles the video's sound state (mute/unmute)
   */
  toggleSound() {
    this.eventHandlers.toggleSound();
  }
  /**
   * Mounts a DOM-based sound button UI to #btn-sound (if present).
   * Keeps legacy Celtra ScreenObject UI as fallback when #btn-sound is missing.
   */
  mountSoundDomUI(t) {
    if (!p(this.options, "soundControl"))
      return;
    const e = document.getElementById("btn-sound");
    e && (this.soundDomHost = e, e.style.cursor = "pointer", e.style.display = "flex", e.style.alignItems = "center", e.style.justifyContent = "center", e.style.userSelect = "none", e.style.setProperty("-webkit-user-select", "none"), e.style.color = st, e.style.filter = rt, this.soundDomClickHandler && e.removeEventListener("click", this.soundDomClickHandler), this.soundDomClickHandler = () => {
      this.toggleSound();
    }, e.addEventListener("click", this.soundDomClickHandler), this.updateSoundDomIcon(typeof t?.muted == "boolean" ? t.muted : !0), this.options.debug && this.log.debug("Mounted sound DOM UI on #btn-sound", { muted: t?.muted }));
  }
  updateSoundDomIcon(t) {
    this.soundDomHost && (this.soundDomHost.innerHTML = t ? ct : at);
  }
  /**
   * Initializes the video countdown component
   */
  initializeCountdown() {
    if (this.log.debug("initializeCountdown called", { hasCountdownConfig: !!this.options.videoCountdown }), !this.options.videoCountdown)
      return;
    const t = this.elementManager.getScreenObject(this.options.video);
    if (!t) {
      this.log.error("Cannot initialize countdown: video not found");
      return;
    }
    const e = Math.round(t.getDuration()) * 1e3, i = ot(this.options.videoCountdown);
    this.log.debug("Countdown config:", { duration: e, countdownOptions: i });
    let n = document.getElementById("countdown-placeholder");
    if (n ? this.log.debug("Found countdown-placeholder, using it") : (this.log.debug("countdown-placeholder not found, using video parent"), n = t.getNode()?.parentElement || this.scope.getNode()), this.log.debug("Parent container:", n, n?.tagName, n?.id), !n)
      throw new w("Countdown parent container not found");
    this.videoCountdown = new it(n, e, i), this.log.debug("VideoCountdown instance created", this.videoCountdown), this.videoCountdown.show(), this.log.debug("VideoCountdown.show() called"), this.attachCountdownMethods(), this.options.debug && this.log.debug("Video countdown initialized successfully", {
      duration: e,
      options: i,
      countdownElement: this.videoCountdown
    });
  }
  /**
   * Attaches countdown helper methods to the screen object
   */
  attachCountdownMethods() {
    const t = this.scope;
    t.beginCountdown = () => {
      this.videoCountdown && !this.videoCountdown.isCounting && (this.videoCountdown.begin(), this.options.debug && this.log.debug("Countdown started"));
    }, t.pauseCountdown = () => {
      this.videoCountdown && (this.videoCountdown.pause(), this.options.debug && this.log.debug("Countdown paused"));
    }, t.unpauseCountdown = () => {
      this.videoCountdown && (this.videoCountdown.unpause(), this.options.debug && this.log.debug("Countdown unpaused"));
    }, t.resetCountdown = () => {
      this.videoCountdown && (this.videoCountdown.reset(), this.options.debug && this.log.debug("Countdown reset"));
    };
  }
  setupEventListeners() {
    const t = this.options.video;
    this.log.debug("Setting up listeners for:", t);
    const e = this.celtraVideo;
    e.on("playing", () => {
      this.onPlaying();
    }), e.on("pause", (n) => {
      const o = e.getDuration();
      if ((typeof n == "number" ? n >= o : (this._videoElement?.ended ?? !1) || e.getCurrentTime() >= o) || this.hasVideoCompleted) {
        this.onEnded();
        return;
      }
      this.onPause();
    }), e.on("timeupdate", (n) => {
      this.onTimeUpdate(n);
    }), this.mountSoundDomUI(e);
    const i = e.getNode();
    g.expectIntoWhenAppeared(this.scope, i, {
      onWaiting: () => {
        this.log.debug("Video element not found for event listeners, waiting for it to be inserted");
      }
    }).then((n) => {
      this._videoElement = n, this.log.debug(`Found video element in #${i.id}`), this.quartileTracker.setupQuartileListeners(), this.listenEventsFrom(n), (!this.hasInstructionScene() || this.options.scriptedPlay) && this.scriptedPause();
    }).catch((n) => {
      this.log.error(n);
    });
  }
};
u.instanceCount = 0, u.USER_CLICK_WINDOW_MS = 700;
let I = u;
const lt = y.enter("VideoProd");
function dt(r, t, e = {}) {
  const i = new ActionContext(t, {
    certainlyNotCausedByUserBehavior: !1,
    consideredUserInitiatedByBrowser: !1
  }), o = { ...{
    video: "vidPlayer",
    clicktoplay: !1,
    soundControl: !0,
    countdownActive: !0,
    loadSpinner: !0,
    showPlayBtnOnEnd: !1,
    instructionScene: "InstructionsScene",
    replayScene: "replayScene",
    tagservice: creative.runtimeParams.isTagservice
  }, ...e };
  return t.mbkVidController = new I(t, o, i, lt, r), r.once("appeared", () => {
    console.log("unit appeared******"), t.mbkVidController.init(), t.mbkVidController.playAfterScene();
  }), t.mbkVidController;
}
typeof unit < "u" && typeof screen < "u" && typeof ActionContext < "u" && dt(unit, screen);
export {
  dt as init
};
