/*! Copyright Mobkoi 2026 (v5.5.1) */
const m = {
  video: "vidPlayer",
  btnSound: "btnSound",
  icoIsMuted: "icoIsMuted",
  icoIsUnmuted: "icoIsUnmuted",
  btnPlay: "btnPlay",
  btnReplay: "btnReplay",
  countdown: "countdown"
}, Q = {
  ...m,
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
  debug: !1,
  mbkCustomEvents: [],
  tagservice: !1,
  autoplayrejected: !1
};
class J {
  constructor(t) {
    this.log = t.enter("SafeFrameUtil");
  }
  check() {
    const t = {}, e = typeof window < "u" && window.location && typeof window.location.href == "string" ? window.location.href : "", i = typeof creative < "u" && creative?.adapter && creative.adapter.safeFrameDetected || !1, s = /googlesyndication/i.test(e) || /safeframe/i.test(e);
    if (t.detected = !!(i || s), typeof window < "u")
      try {
        t.apiObject = typeof window.$sf < "u" ? window.$sf : window.parent.$sf;
      } catch (n) {
        this.log.debug("SafeFrameUtil", "cannot access window.parent.$sf", n), t.apiObject = typeof window.$sf < "u" ? window.$sf : void 0;
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
const H = new E("MOBKOI");
class A extends Error {
  constructor(t, e = void 0) {
    super(t), this.name = new.target.name, this.cause = typeof e == "string" ? new A(e, void 0) : e;
  }
  toString() {
    return super.toString() + (this.cause ? `
	because of:
` + this.cause.toString() : "");
  }
}
class X {
  constructor(t, e) {
    this.currentWindow = t, this.log = e;
  }
  /** Sends with `navigator.sendBeacon`, or an image request when the beacon is unavailable, refused or throws. */
  sendBeacon(t) {
    try {
      if (this.currentWindow.navigator?.sendBeacon?.(t))
        return !0;
    } catch (e) {
      this.log.debug("sendBeacon failed, falling back to an image", e);
    }
    return this.sendBeaconImage(t);
  }
  sendBeaconImage(t) {
    try {
      const e = this.currentWindow.Image;
      return e ? (new e().src = t, !0) : !1;
    } catch (e) {
      return this.log.debug("Image request failed", e), !1;
    }
  }
}
const Y = new X(globalThis, H.enter("HttpUtil")), b = class b extends E {
  constructor(t, e) {
    super(t), this.options = e;
  }
  get endpoint() {
    return this.options.errorEndpoint ?? b.defaultEndpoint;
  }
  /** Completes where errors are reported. Undefined values keep the current ones. */
  configure(t) {
    this.options.errorEndpoint = t.errorEndpoint ?? this.options.errorEndpoint, this.options.impressionId = t.impressionId ?? this.options.impressionId;
  }
  error(...t) {
    super.error(...t), this.report(t);
  }
  enter(t) {
    return this.add(new b(t, this.options));
  }
  report(t) {
    try {
      const e = t.find((s) => s instanceof Error), i = new URLSearchParams({
        level: "error",
        impression_id: this.options.impressionId ?? "",
        domain: globalThis.location?.hostname ?? "",
        url: globalThis.location?.href ?? "",
        message: [this.prefix, ...t.filter((s) => s !== e).map(String)].join(" "),
        error: e?.toString() ?? "",
        detail: e?.stack ?? "",
        env: globalThis.navigator?.userAgent ?? ""
      });
      Y.sendBeacon(`${this.endpoint}/log?${i}`);
    } catch (e) {
      this.debug("Could not report the error", e);
    }
  }
};
b.defaultEndpoint = "https://client-err.mobkoi.com";
let B = b;
const W = new B("Celtra", { errorEndpoint: void 0, impressionId: void 0 });
H.add(W);
const I = W, p = class p {
  static deepMerge(t, e) {
    const i = { ...t };
    for (const s of Object.keys(e)) {
      const n = e[s], o = t[s];
      n !== void 0 && (p.isPlainObject(o) && p.isPlainObject(n) ? i[s] = p.deepMerge(
        o,
        n
      ) : i[s] = n);
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
      if (i.length === 0 || p.forbiddenPathSegment(i) || !/^[A-Za-z0-9_$-]+$/.test(i))
        return null;
    return e;
  }
  /** Read an own property chain. Returns {@link ObjectUtil.missing} when any segment is absent. */
  static readPath(t, e) {
    let i = t;
    for (const s of e) {
      if (p.forbiddenPathSegment(s) || i === null || typeof i != "object" && typeof i != "function" || !Object.prototype.hasOwnProperty.call(i, s))
        return p.missing;
      i = i[s];
    }
    return i;
  }
  static isPlainObject(t) {
    return typeof t == "object" && t !== null && !Array.isArray(t) && Object.getPrototypeOf(t) === Object.prototype;
  }
  /** True when `key` is an own property of `object` (not inherited). */
  static hasOwn(t, e) {
    return Object.prototype.hasOwnProperty.call(t, e);
  }
  /**
   * Own-property boolean read. Missing key → `null`.
   * String `"true"` / `"false"` (Celtra params) are coerced; other strings are false.
   */
  static hasBool(t, e) {
    if (!p.hasOwn(t, e))
      return null;
    const i = t[e];
    return typeof i == "string" ? i === "true" : i;
  }
  static forbiddenPathSegment(t) {
    return t === "__proto__" || t === "prototype" || t === "constructor";
  }
};
p.missing = /* @__PURE__ */ Symbol("missing");
let d = p;
class k extends A {
}
class w extends k {
}
class Z {
  constructor(t, e, i) {
    this.context = t, this.options = e, this.elements = {}, this.log = i.enter("VideoElementManager");
  }
  get scope() {
    return this.context.screen;
  }
  get actionCtx() {
    return this.context.ctx;
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
    return e && this.scope.find(e) instanceof ScreenObject ? !0 : (this.log.warn(`warning: cannot find ScreenObject ${t}`), !1);
  }
  hasPlayButton() {
    return this.hasScreenObject(m.btnPlay);
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
const _ = 1e4;
class f {
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
      return f.cancellableRejectedPromise(new Error("Cannot wait for video element without a container"));
    const i = f.findInto(t);
    if (i)
      return Object.assign(Promise.resolve(i), { cancel: noop });
    e.onWaiting?.();
    let s, n, o = !0, a = noop;
    const u = () => {
      o = !1, s && (s.disconnect(), s = void 0), n && (clearTimeout(n), n = void 0);
    }, S = new Promise((P, M) => {
      a = () => {
        o && (u(), M(new Error("Video element wait cancelled")));
      };
      const G = () => {
        if (!o)
          return;
        const D = f.findInto(t);
        D && (u(), P(D));
      };
      typeof MutationObserver < "u" && (s = new MutationObserver(G), s.observe(t, { childList: !0, subtree: !0 }));
      const L = e.timeoutMs ?? _;
      n = setTimeout(() => {
        o && (u(), M(new w(`Timed out waiting ${L}ms for <video> element inside #${t.id}`)));
      }, L);
    });
    return Object.assign(S, { cancel: a });
  }
  /**
   * Wait for a Celtra view/page to appear before starting the DOM video wait.
   * This prevents inactive pages from timing out before Celtra inserts their <video>.
   */
  static expectIntoWhenAppeared(t, e, i = {}) {
    if (!t || t.hasAppearedAtLeastOnce)
      return f.expectInto(e, i);
    const s = typeof t.on == "function" ? t.on.bind(t) : typeof t.once == "function" ? t.once.bind(t) : void 0;
    if (!s)
      return f.expectInto(e, i);
    let n = !0, o, a = noop;
    const u = new Promise((S, P) => {
      a = () => {
        n && (n = !1, o?.cancel(), P(new Error("Video element wait cancelled")));
      }, s("appeared", () => {
        n && (o = f.expectInto(e, i), o.then(S).catch(P));
      });
    });
    return Object.assign(u, { cancel: a });
  }
  static cancellableRejectedPromise(t) {
    return Object.assign(Promise.reject(t), { cancel: noop });
  }
}
class tt {
  constructor(t, e, i, s, n) {
    this.elementManager = t, this.options = e, this.onViewportChange = i, this.activationView = n, this.isInViewport = !1, this.setupId = 0, this.log = s.enter("VideoViewportObserver");
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
    f.expectIntoWhenAppeared(this.activationView, i, {
      onWaiting: () => {
        this.log.warn("Video element not found for viewport observer, waiting for it to be inserted");
      }
    }).then((s) => {
      t === this.setupId && this.setupVisibilityObserver(s);
    }).catch((s) => {
      this.log.error(s);
    });
  }
  setupVisibilityObserver(t) {
    this.visibilityObserver?.disconnect(), this.visibilityObserver = new IntersectionObserver((e) => {
      e.forEach((i) => {
        const s = this.isInViewport;
        this.isInViewport = i.isIntersecting, s !== this.isInViewport && (this.log.debug("Viewport change detected:", this.isInViewport ? "in viewport" : "out of viewport"), this.onViewportChange(this.isInViewport));
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
class et {
  constructor(t) {
    this.log = t.enter("VideoSafeFrameHandler"), this.safeframeUtil = new J(this.log);
  }
  /**
   * Attempts to setup SafeFrame monitoring for video playback
   * @param video - The CeltraVideo object
   * @param actionCtx - Celtra ActionContext
   * @param playSuccessCheck - Callback for play success
   */
  setupSafeFrameMonitoring(t, e, i) {
    const s = this.safeframeUtil.get(), n = s?.ext?.inViewPercentage;
    if (s && typeof n == "function")
      try {
        let o = null;
        this.sfInterval = setInterval(() => {
          n() > 0.05 && o !== "ended" ? t.playAction(e, {}, i) : t.pauseAction(e, {}, i);
        }, 250), ["playing", "ended"].forEach((a) => {
          t.on(a, () => {
            o = a;
          });
        });
      } catch (o) {
        this.log.warn("sfInterval failed", o);
      }
  }
  stopMonitoring() {
    this.sfInterval && (clearInterval(this.sfInterval), this.sfInterval = void 0);
  }
}
class it {
  constructor(t, e, i, s, n, o, a) {
    this.context = t, this.elementManager = e, this.options = i, this.safeframeHandler = s, this.setStatus = n, this.controller = a, this.playSuccessFlag = !1, this.log = o.enter("VideoPlaybackController");
  }
  get scope() {
    return this.context.screen;
  }
  get actionCtx() {
    return this.context.ctx;
  }
  /**
   * Attempts to play the video if autoplay is allowed
   */
  playIfAllowed() {
    if (this.setStatus("checking autoplay status"), d.hasBool(
      this.options,
      "clicktoplay"
    ) || creative.userParams?.disableautoplay === "true" || creative.userParams?.disableautoplay === !0) {
      this.setStatus("autoplay disabled");
      const t = this.scope.find(this.options.video);
      t.autoplay && t.pauseAction(this.actionCtx, {}, noop);
      const e = d.hasBool(this.options, "showPlayBtnOnCtp");
      return this.log.debug("showPlayBtnOnCtp=", e), e && this.elementManager.showPlayButton(), !1;
    } else {
      this.setStatus("attempting autoplay");
      const t = () => {
        this.playSuccessFlag || (this.playCheck(), this.playSuccessFlag = !0);
      };
      try {
        const e = this.celtraVideo;
        !e.muted && !this.controller?.state.userUnmuted && e.muteAction(this.actionCtx, {}, noop), e._player.on("autoplayrejected", () => {
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
    const t = this.celtraVideo, e = t.getNode(), i = typeof screen < "u" ? screen : this.scope;
    if (!e) {
      this.log.debug("Video node not found for playback checks, waiting for playing event"), t.on("playing", () => this.playCheck());
      return;
    }
    if (!i.hasAppearedAtLeastOnce && typeof i.on == "function") {
      i.on("appeared", () => {
        f.findInto(e) ? this.fireChecks() : this.waitForVideoElement(e, () => this.fireChecks());
      });
      return;
    }
    this.waitForVideoElement(e, () => this.fireChecks(), i);
  }
  /**
   * Handles video playback checks and UI state based on video events
   */
  fireChecks() {
    const t = this.celtraVideo, e = t.getNode();
    if (!e) {
      this.log.debug("Video node not found for playback checks");
      return;
    }
    this.waitForVideoElement(e, (i) => this.setupPlaybackChecks(t, i), this.scope);
  }
  get celtraVideo() {
    return this.elementManager.getScreenObject(this.options.video);
  }
  waitForVideoElement(t, e, i) {
    if (this.videoElementWait)
      return;
    const s = f.expectIntoWhenAppeared(i, t, {
      onWaiting: () => {
        this.log.debug("Video element not found for playback checks, waiting for it to be inserted");
      }
    });
    this.videoElementWait = s, s.then((n) => {
      this.videoElementWait = void 0, e(n);
    }).catch((n) => {
      this.videoElementWait = void 0, n instanceof w && this.log.warn("Video element not found for playback checks before timeout");
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
    }), e.addEventListener("canplay", () => {
      this.log.debug("canplay"), this.elementManager.hidePlayButton(), this.controller?.unpauseCountdown();
    }), e.addEventListener("waiting", () => {
      this.controller?.pauseCountdown();
    }), setTimeout(() => {
      i.timeupdate || (this.elementManager.hasPlayButton() && this.elementManager.playButton.showAction(this.actionCtx, {}, noop), this.controller?.pauseCountdown());
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
          this.controller?.resetCountdown();
        } catch {
          this.setStatus("countdown reset failed", "warning");
        }
    });
  }
}
class F {
  constructor(t) {
    this.scope = t.scope, this.userInitiated = t.userInitiated;
  }
}
class q extends F {
  constructor(t, e) {
    super(t), this.actionContext = e;
  }
}
class N {
  constructor(t) {
    this.name = "celtra", this.log = t.enter("MbkCeltraChannel");
  }
  static actionContextOf(t) {
    return t instanceof q ? t.actionContext : void 0;
  }
  emit(t, e) {
    if (!t.legacyEvent)
      return !1;
    const i = typeof Creative < "u" ? Creative : void 0;
    if (typeof i?.trackCustomEventAction != "function")
      return this.log.debug("Creative API unavailable, no Celtra event for", t.legacyEvent), !1;
    const s = N.actionContextOf(e);
    if (!s)
      return this.log.warn("No ActionContext on the cause of", t.legacyEvent), !1;
    const n = t.legacyEvent;
    return i.trackCustomEventAction(s, { name: n }, () => this.log.debug("Celtra event accepted:", n)), !0;
  }
}
class st {
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
      const s = l.instance(i);
      e.unshift(s ? `${i.role}:${s}` : i.role);
    }
    return e.join(">");
  }
}
class h {
  /** Query parameters for one signal. Undefined values are omitted rather than sent empty. */
  static of(t, e) {
    const i = { k: t.verb, vs1: t.role };
    return h.set(i, "vs2", t.legacyEvent), h.set(i, "vs3", t.name), h.set(i, "vs4", l.path(t.scope) || void 0), h.set(i, "vs5", t.mode), h.set(i, "vi1", t.index), h.set(i, "vi2", t.ms), h.set(i, "vi3", t.from), h.set(i, "vi4", t.to), h.set(i, "vi5", t.completed === void 0 ? void 0 : Number(t.completed)), h.set(i, "vf1", t.percent), h.set(i, "vf2", t.modeMs), h.set(i, "iid", e), i;
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
    const s = t.includes("{{event}}") ? t.replace("{{event}}", encodeURIComponent(e.legacyEvent ?? e.verb)) : t, n = s.includes("?") ? "&" : "?";
    return `${s}${n}${h.toQueryString(h.of(e, i))}`;
  }
  static set(t, e, i) {
    i != null && i !== "" && (t[e] = i);
  }
}
const g = class g {
  constructor(t) {
    this.options = t;
  }
  get endpoint() {
    return this.options.endpoint ?? this.runtimeParam(g.endpointParam) ?? g.defaults.endpoint;
  }
  get errorEndpoint() {
    return this.options.errorEndpoint ?? this.runtimeParam(g.errorEndpointParam);
  }
  // leftover for video package
  get impressionId() {
    return this.options.impressionId ?? this.runtimeParam(g.impressionIdParam) ?? (typeof creative < "u" ? creative?.sessionId : void 0);
  }
  get pixelFallback() {
    return this.options.pixelFallback ?? g.defaults.pixelFallback;
  }
  get log() {
    return this.options.log ?? g.defaults.log();
  }
  /** Completes the configuration in place. Later values win, undefined ones leave the current one. */
  update(t) {
    const e = Object.keys(t).reduce((i, s) => {
      const n = t[s];
      return n !== void 0 && (i[s] = n), i;
    }, {});
    this.options = { ...this.options, ...e };
  }
  runtimeParam(t) {
    const i = (typeof creative < "u" ? creative : void 0)?.runtimeParams?.[t];
    return typeof i == "string" && i ? i : void 0;
  }
};
g.endpointParam = "externalSignalTrackerURI", g.impressionIdParam = "externalSessionId", g.errorEndpointParam = "externalClientErrorURI", g.defaults = {
  endpoint: "https://events.mobkoi.com/engagement",
  pixelFallback: !0,
  log: () => new E("mbk")
};
let y = g;
class nt {
  constructor(t, e) {
    this.config = t, this.name = "beacon", this.log = e.enter("MbkBeaconChannel");
  }
  emit(t) {
    const e = this.config.endpoint;
    if (!e)
      return this.log.debug(`No ${y.endpointParam}, raw signal not sent`), !1;
    const i = globalThis.navigator?.sendBeacon;
    if (typeof i != "function")
      return this.log.debug("sendBeacon unavailable"), !1;
    const s = h.url(e, t, this.config.impressionId), n = i.call(globalThis.navigator, s);
    return this.log.debug(n ? "queued" : "refused", s), n;
  }
}
const U = class U {
};
U.mapping = [
  { kind: { verb: "click", role: "cta" }, legacyEvent: () => "clickSite" },
  { kind: { verb: "click", role: "unit" }, legacyEvent: () => "clickSite" }
];
let j = U;
class z {
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
        const { legacyEvent: i, ...s } = t, n = e(s);
        if (typeof n != "string" || !n) {
          this.log.warn(`Resolver for ${l.of(t)} produced no name`, n);
          return;
        }
        return n;
      } catch (i) {
        this.log.warn(`Resolver for ${l.of(t)} failed, no Celtra event emitted`, i);
        return;
      }
  }
}
class ot {
  constructor(t, e) {
    this.config = t, this.name = "pixel", this.pending = /* @__PURE__ */ new Set(), this.log = e.enter("MbkPixelChannel");
  }
  emit(t) {
    const e = this.config.endpoint;
    if (!e)
      return !1;
    if (typeof Image != "function")
      return this.log.debug("Image unavailable"), !1;
    const i = h.url(e, t, this.config.impressionId), s = new Image();
    this.pending.add(s);
    const n = () => this.pending.delete(s);
    return s.onload = n, s.onerror = n, s.src = i, this.log.debug("sent", i), !0;
  }
}
class rt {
  constructor(t, e) {
    this.config = t, this.log = e.enter("MbkTrackErrorReporter");
  }
  report(t, e, i) {
    this.log.warn(`Channel "${t}" failed for ${l.of(e)}`, i);
    const s = this.config.errorEndpoint;
    if (s)
      try {
        const n = [
          `error=${encodeURIComponent(`mbkTrack:${t}`)}`,
          `reason=${encodeURIComponent(String(i?.message ?? i))}`,
          `k=${encodeURIComponent(e.verb)}`
        ], o = this.config.impressionId;
        o && n.push(`iid=${encodeURIComponent(o)}`);
        const a = `${s}${s.includes("?") ? "&" : "?"}${n.join("&")}`;
        globalThis.navigator?.sendBeacon?.(a);
      } catch (n) {
        this.log.debug("Could not report the channel failure", n);
      }
  }
}
class K extends A {
}
class at {
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
      this.log.error(new K(`Segment ${e} hook failed at ${i}ms`, s));
    }
  }
}
const c = class c {
  constructor(t) {
    this.tracks = /* @__PURE__ */ new Map(), this.emitted = /* @__PURE__ */ new Set(), this.states = /* @__PURE__ */ new Map(), this.config = new y(t), this.log = this.config.log.enter("MbkImpression"), this.startedAt = c.now(), this.beacon = new nt(this.config, this.log), this.pixel = new ot(this.config, this.log), this.reporter = new rt(this.config, this.log), this.coreLegacyEvents = new z(this.log, "core", j.mapping), this.visibility = new at(this, globalThis.document, this.log);
  }
  /** The one impression of this creative, created on first use. */
  static shared(t) {
    const e = c.storage(), i = e[c.storageKey];
    if (i)
      return i.configure(t), i;
    const s = new c(t);
    return e[c.storageKey] = s, s;
  }
  /** Releases and drops it. For tests, and for a creative that reloads its scripts. */
  static reset() {
    const t = c.storage();
    t[c.storageKey]?.release(), delete t[c.storageKey];
  }
  /**
   * Stash on `unit` when available, else on the window, following the precedent set by
   * `CreativeScript` / `setup()` is the precedent for a per-creative singleton.
   */
  static storage() {
    const t = globalThis;
    return t.unit ? t.unit : (t[c.windowStorageKey] || (t[c.windowStorageKey] = {}), t[c.windowStorageKey]);
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
        throw new K(
          `"${t}" is already tracked as a ${s.constructor.name}, not a ${i.name}. Every instance of one script must pick the same specialisation.`
        );
      return s;
    }
    const n = e();
    return this.tracks.set(t, n), n;
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
    const i = l.signature(t);
    switch (e) {
      case "repeated":
        return !0;
      case "once":
        return this.emitted.has(i) ? (this.log.debug("Already emitted, skipping", i), !1) : (this.emitted.add(i), !0);
      case "state": {
        const s = l.subject(t);
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
c.storageKey = "mbkImpression", c.windowStorageKey = "__mbkTrackStorage";
let O = c;
class V {
  constructor(t, e) {
    this.impression = t, this.key = e, this.log = t.log.enter(`${this.constructor.name}(${e})`), this.legacyEvents = new z(this.log, e, []);
  }
  /**
   * The track of that script, created on first use, completed with its dictionary.
   *
   * The instance is read and dropped: nothing here keeps a reference to a partially constructed
   * object.
   */
  static shared(t, e) {
    const i = O.shared(e);
    return i.track(t.trackingKey, () => new V(i, t.trackingKey), V).declare(t.legacyEventsMapping);
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
    return new F(t);
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
    return e || this.log.debug(`No resolver for ${l.of(t)}, raw signal only`), e;
  }
}
class x extends V {
  /**
   * @throws when the same script is already tracked as a plain {@link MbkTrack}. See
   *   {@link MbkImpression.track}.
   */
  static shared(t, e) {
    const i = O.shared({ log: I.enter("mbk"), ...e }), s = i.track(
      t.trackingKey,
      () => new x(i, t.trackingKey, e.initiator),
      x
    );
    return s.contexts.useInitiator(e.initiator), s.declare(t.legacyEventsMapping);
  }
  constructor(t, e, i) {
    super(t, e), this.contexts = new st(e, this.log, i), this.celtra = new N(this.log);
  }
  /**
   * A Celtra context, carrying the `ActionContext` this cause's legacy events are fired with: the
   * one the call site forwarded from its handler, else a fresh user-initiated one when the cause is
   * a gesture, else this script's common passive one.
   */
  context(t) {
    const e = t.actionContext ?? this.contexts.forCause(t.userInitiated);
    return new q(t, e);
  }
  /** The legacy event first, unchanged, then the raw channels. */
  emitChannels(t, e) {
    this.impression.send(this.celtra, t, e), super.emitChannels(t, e);
  }
}
class ct {
  constructor(t, e, i, s, n, o) {
    this.elementManager = t, this.options = e, this.setStatus = i, this.state = s, this.context = n, this.trackingKey = "video", this.mediaPlay = { verb: "play", role: "media" }, this.mediaPause = { verb: "pause", role: "media" }, this.mediaLegacy = { verb: "legacy", role: "media" }, this.legacyEventsMapping = [], this.log = o.enter("VideoEventHandlers"), this.track = x.shared(this, {
      initiator: this.elementManager.getScreenObject(this.options.video),
      impressionId: this.context.impressionId,
      endpoint: this.context.endpoint,
      errorEndpoint: this.context.errorEndpoint
    }), this.playback = this.track.context({ scope: void 0, userInitiated: !1, actionContext: this.actionCtx });
  }
  get actionCtx() {
    return this.context.ctx;
  }
  get scope() {
    return this.context.screen;
  }
  onPlaying(t) {
    this.trackPlayback(this.mediaPlay, t), this.state.hasVideoPlayed = !0, this.state.hasVideoCompleted = !1, this.elementManager.hidePlayButton(), this.elementManager.hasScreenObject(m.btnReplay) && this.elementManager.replayButton.hideAction(this.actionCtx, {}, noop), d.hasBool(this.options, "soundControl") && this.elementManager.hasScreenObject(m.btnSound) && this.elementManager.soundButton.showAction(this.actionCtx, {}, noop), d.hasBool(this.options, "countdownActive") && this.elementManager.hasScreenObject(m.countdown) && this.elementManager.countdown.showAction(this.actionCtx, {}, noop), this.setStatus("playing");
  }
  /**
   * @param userInitiated — analytics: true only for a real on-video tap
   * @param showPlayButton — UI: true for any non-scripted pause (tap, CTA, etc.); false for viewport/scripted
   */
  onPause(t, e = t) {
    this.trackPlayback(this.mediaPause, t), e && this.elementManager.showPlayButton(), this.setStatus("paused");
  }
  onMute() {
    if (d.hasBool(this.options, "soundControl")) {
      const t = this.elementManager.unmutedButton, e = this.elementManager.mutedButton;
      t && typeof t.hideAction == "function" && t.hideAction(this.actionCtx, {}, noop), e && typeof e.showAction == "function" && e.showAction(this.actionCtx, {}, noop);
    }
    this.setStatus("muted");
  }
  onUnmute() {
    if (d.hasBool(this.options, "soundControl")) {
      const t = this.elementManager.unmutedButton, e = this.elementManager.mutedButton;
      t && typeof t.showAction == "function" && t.showAction(this.actionCtx, {}, noop), e && typeof e.hideAction == "function" && e.hideAction(this.actionCtx, {}, noop);
    }
    this.setStatus("unmuted");
  }
  onEnded() {
    this.state.hasVideoCompleted = !0, this.elementManager.hasScreenObject(m.btnReplay) && this.elementManager.replayButton.showAction(this.actionCtx, {}, noop), d.hasBool(this.options, "showPlayBtnOnEnd") ? this.elementManager.showPlayButton() : this.elementManager.hidePlayButton(), this.elementManager.hasScreenObject(m.btnSound) && (d.hasBool(this.options, "showSoundBtnOnEnd") ? this.elementManager.soundButton.showAction(this.actionCtx, {}, noop) : this.elementManager.soundButton.hideAction(this.actionCtx, {}, noop)), this.elementManager.hasScreenObject(m.countdown) && (d.hasBool(this.options, "showCountdownOnEnd") ? this.elementManager.countdown.showAction(this.actionCtx, {}, noop) : this.elementManager.countdown.hideAction(this.actionCtx, {}, noop)), this.setStatus("ended");
  }
  toggleSound() {
    const t = this.scope.find(String(this.options.video));
    t.muted ? (t.unMuteAction(this.actionCtx, {}, noop), this.state.userUnmuted = !0, this.logger("mbk_video_unmuted")) : (t.muteAction(this.actionCtx, {}, noop), this.state.userUnmuted = !1, this.logger("mbk_video_muted"));
  }
  logger(t) {
    this.options.mbkCustomEvents.indexOf(t) === -1 ? (this.log.debug(`[Event] - ${t}`), this.options.mbkCustomEvents.push(t), this.track.once({ ...this.mediaLegacy, name: this.options.video, legacyEvent: t }, this.playback)) : this.log.debug("event already exist", this.options.mbkCustomEvents);
  }
  /**
   * One playback signal, with its cause.
   *
   * A user-initiated context is built for each gesture rather than reused, because the flag it
   * carries is a claim about the browser's user-activation window. The automatic ones share the
   * playback context.
   */
  trackPlayback(t, e) {
    const i = { scope: void 0, userInitiated: !0, actionContext: void 0 }, s = e ? this.track.context(i) : this.playback;
    this.track.state({ ...t, name: this.options.video }, s);
  }
}
class ht {
  constructor(t, e, i, s) {
    this.elementManager = t, this.options = e, this.context = i, this.trackingKey = "video", this.mediaProgress = { verb: "progress", role: "media" }, this.quartileEventMap = {
      videoStart: "video_start",
      videoFirstQuartile: "video_p25",
      videoMidpoint: "video_p50",
      videoThirdQuartile: "video_p75",
      videoComplete: "video_complete"
    }, this.legacyEventsMapping = [
      { kind: this.mediaProgress, legacyEvent: (n) => this.legacyQuartileEvent(n.percent) }
    ], this.quartilePercents = {
      videoStart: 0,
      videoFirstQuartile: 25,
      videoMidpoint: 50,
      videoThirdQuartile: 75,
      videoComplete: 100
    }, this.log = s.enter("VideoQuartileTracker"), this.quartileEvents = this.createQuartileEvents(), this.track = x.shared(this, {
      initiator: this.elementManager.getScreenObject(this.options.video),
      impressionId: this.context.impressionId,
      endpoint: this.context.endpoint,
      errorEndpoint: this.context.errorEndpoint
    }), this.playback = this.track.context({
      scope: void 0,
      userInitiated: !1,
      actionContext: this.context.ctx
    });
  }
  resetQuartileEvents() {
    Object.values(this.quartileEventMap).forEach((t) => {
      this.quartileEvents[t] = !1;
    });
  }
  resetTrackingSession() {
    this.resetQuartileEvents(), this.track.impression.forgetMedia(this.options.video);
  }
  setupQuartileListeners() {
    const t = this.elementManager.getScreenObject(this.options.video);
    if (!t?._player) {
      this.log.warn("Video player not found for quartile tracking");
      return;
    }
    const e = document.createElement("div");
    document.body.appendChild(e), Object.keys(this.quartileEventMap).forEach((i) => {
      const s = this.quartileEventMap[i];
      t._player.on(i, () => {
        if (!this.quartileEvents[s])
          if (this.log.debug(`Tracking: ${s}`), this.quartileEvents[s] = !0, this.track.once(
            { ...this.mediaProgress, name: this.options.video, percent: this.quartilePercents[i] },
            this.playback
          ), this.options.tagservice) {
            const n = new Image();
            n.src = this.buildTrackingUrl(s), e.appendChild(n);
          } else
            this.postToParent(s);
      });
    });
  }
  buildTrackingUrl(t) {
    return creative.runtimeParams.externalVideoTrackerURI.replace("{{event}}", t);
  }
  postToParent(t) {
    const e = (u) => typeof u == "string" && u.length > 0 && u !== "null" ? u : void 0, i = globalThis.location, s = e(i?.origin), n = e(i?.href), o = n ? e(new URL(n).origin) : void 0, a = this.options.postMessageTargetOrigin ?? s ?? o ?? "*";
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
      throw new w(`No Celtra event for a media progress at ${t}%`);
    return this.quartileEventMap[e];
  }
  createQuartileEvents() {
    const t = {};
    return Object.values(this.quartileEventMap).forEach((e) => {
      t[e] = !1;
    }), t;
  }
}
class lt {
  constructor(t, e, i, s, n) {
    this.options = t, this.onSceneEnd = e, this.controller = s, this.unit = n, this.log = i.enter("VideoInstructionScene");
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
    this.log.debug("Setting up instruction scene playback:", e), this.setupInstructionScenePlayback(e);
  }
}
class dt {
  constructor(t, e, i) {
    this.parentElement = t, this.options = i, this.currentTime = 0, this.isPaused = !1, this.interval = null, this.intervalValue = 0, this.duration = e, this.mode = i.mode;
    const s = this.resolveDimensions(i);
    this.width = s.width, this.height = s.height, this.mode === "kinetic" && (this.duration = 0.95 * this.duration), this.container = this.createContainer(), this.svg = this.createSVG(), this.progressCircle = this.createProgressCircle(), this.textElement = this.createTextElement(), this.svg.appendChild(this.createBackgroundCircle()), this.svg.appendChild(this.progressCircle), this.mode === "countdown" && this.svg.appendChild(this.textElement), this.container.appendChild(this.svg), this.parentElement.appendChild(this.container), this.updateProgress();
  }
  /** Circle diameter uses the shorter side when width/height differ. */
  get size() {
    return Math.min(this.width, this.height);
  }
  resolveDimensions(t) {
    const e = parseFloat(t.width), i = parseFloat(t.height), s = t.width !== "" && Number.isFinite(e) && e > 0, n = t.height !== "" && Number.isFinite(i) && i > 0;
    if (s && n)
      return { width: e, height: i };
    if (s)
      return { width: e, height: e };
    if (n)
      return { width: i, height: i };
    const o = this.getSizeInPixels(t.size);
    return { width: o, height: o };
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
      z-index: 999999;
      ${this.getPositionStyles()}
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    `, t;
  }
  getPositionStyles() {
    const { top: t, left: e, bottom: i, right: s } = this.options;
    return `top: ${t}; left: ${e}; bottom: ${i}; right: ${s};`;
  }
  createSVG() {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    return t.setAttribute("width", this.width.toString()), t.setAttribute("height", this.height.toString()), t.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`), t.style.cssText = `
      display: block;
    `, t;
  }
  createBackgroundCircle() {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "circle"), e = this.width / 2, i = this.height / 2, s = this.size / 2 - 2;
    return t.setAttribute("cx", e.toString()), t.setAttribute("cy", i.toString()), t.setAttribute("r", s.toString()), t.setAttribute("fill", this.options.bgColor), t;
  }
  createProgressCircle() {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "circle"), e = this.width / 2, i = this.height / 2, s = this.size / 2 - 4, n = 2 * Math.PI * s;
    return t.setAttribute("cx", e.toString()), t.setAttribute("cy", i.toString()), t.setAttribute("r", s.toString()), t.setAttribute("fill", "none"), t.setAttribute("stroke", this.options.barColor), t.setAttribute("stroke-width", "2"), t.setAttribute("stroke-linecap", "round"), t.setAttribute("stroke-dasharray", n.toString()), t.setAttribute("stroke-dashoffset", n.toString()), t.setAttribute("transform", `rotate(-90 ${e} ${i})`), t.style.transition = "stroke-dashoffset 0.1s linear", t;
  }
  createTextElement() {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    return t.setAttribute("x", "50%"), t.setAttribute("y", "50%"), t.setAttribute("text-anchor", "middle"), t.setAttribute("dominant-baseline", "central"), t.setAttribute("fill", this.options.barColor), t.setAttribute("font-family", "Helvetica, Arial, sans-serif"), t.setAttribute("font-size", (this.size * 0.4).toString()), t.setAttribute("font-weight", "normal"), t.style.userSelect = "none", t.textContent = "0", t;
  }
  updateProgress() {
    const t = this.size / 2 - 4, e = 2 * Math.PI * t;
    let i;
    if (this.mode === "countdown") {
      const n = Math.max(0, this.duration - this.currentTime);
      if (i = n / this.duration, this.textElement) {
        const o = Math.round(n / 1e3);
        this.textElement.textContent = o.toString();
      }
    } else
      i = 1 - this.currentTime / this.duration;
    const s = e * (1 - i);
    this.progressCircle.setAttribute("stroke-dashoffset", s.toString());
  }
  show() {
    this.container.style.opacity = "1";
  }
  hide() {
    this.container.style.opacity = "0";
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
  /**
   * Sync countdown time from a media clock in seconds.
   */
  sync(t) {
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
const ut = {
  mode: "countdown",
  size: "normal",
  barColor: "#fff",
  bgColor: "rgba(0, 0, 0, 0.2)",
  top: "25px",
  left: "5px",
  bottom: "auto",
  right: "auto",
  width: "",
  height: ""
}, R = (r) => r !== void 0 && r !== "auto", pt = (r) => {
  const t = r ?? {}, e = { ...ut, ...t };
  return R(t.bottom) && t.top === void 0 && (e.top = "auto"), R(t.right) && t.left === void 0 && (e.left = "auto"), e;
}, gt = "#fff", ft = "drop-shadow(0px 2px 2px rgba(0,0,0,0.85))", mt = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75" width="28" height="28" aria-hidden="true" focusable="false">
  <path d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z"
        fill="currentColor" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  <path d="M48,27.6a19.5,19.5 0 0 1 0,21.4
           M55.1,20.5a30,30 0 0 1 0,35.6
           M61.6,14a38.8,38.8 0 0 1 0,48.6"
        fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
</svg>
`.trim(), vt = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75" width="28" height="28" aria-hidden="true" focusable="false">
  <path d="m39,14-17,15H6V48H22l17,15z" fill="currentColor" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  <path d="m49,26 20,24m0-24-20,24" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
</svg>
`.trim(), v = class v {
  constructor(t, e, i) {
    if (this.context = t, this.scriptName = i, this.status = "unstarted", this.state = {
      hasVideoPlayed: !1,
      hasVideoCompleted: !1,
      // Explicit user unmute via the sound control; cleared if they mute again. Survives scroll/swipe
      // re-entry so playIfAllowed does not force-mute after the user chose sound.
      userUnmuted: !1
    }, this.lastClickAt = 0, this.suppressNextPausePlayButton = !1, !t.ctx)
      throw new w("ActionContext not found");
    v.instanceCount++, this.log = I.enter(this.scriptName).enter("VideoController#" + v.instanceCount), this.options = {
      ...e,
      mbkCustomEvents: [...e.mbkCustomEvents],
      ...e.videoCountdown ? { videoCountdown: { autoSync: !0, ...e.videoCountdown } } : {}
    }, this.log.debug("Options initialized:", this.options), this.context.screen.mbkVidController = this, this.elementManager = new Z(this.context, this.options, this.log), this.safeframeHandler = new et(this.log), this.viewportObserver = new tt(
      this.elementManager,
      this.options,
      (s) => this.handleViewportChange(s),
      this.log,
      this.context.screen
    ), this.playbackController = new it(
      this.context,
      this.elementManager,
      this.options,
      this.safeframeHandler,
      (s, n) => this.setStatus(s, n),
      this.log,
      this
    ), this.eventHandlers = new ct(
      this.elementManager,
      this.options,
      (s, n) => this.setStatus(s, n),
      this.state,
      this.context,
      this.log
    ), this.quartileTracker = new ht(
      this.elementManager,
      this.options,
      this.context,
      this.log
    ), this.instructionScene = new lt(
      this.options,
      () => {
        this.hasVideoPlayed || (this.hasVideoPlayed = !0, this.playIfAllowed());
      },
      this.log,
      this,
      this.context.unit
    ), this.log.debug("videoCountdown options:", this.options.videoCountdown), this.options.countdownActive && this.initializeCountdown();
  }
  /** Validated in the constructor; CeltraContext.ctx is optional at the type level. */
  get actionCtx() {
    return this.context.ctx;
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
  get celtraVideo() {
    return this.elementManager.celtraVideo;
  }
  get videoElement() {
    if (!this._videoElement)
      throw new w("Expected <video> element");
    return this._videoElement;
  }
  onPlaying() {
    this.log.debug("onPlaying()"), this.eventHandlers.onPlaying(this.isUserGesture()), this.celtraVideo.autoplay && this.options.scriptedPlay === !0 && !this.viewportObserver.inViewport && (this.options.scriptedPlay = "playing", this.scriptedPause()), this.videoCountdown && (!this.videoCountdown.isCounting && this.hasVideoPlayed ? (this.videoCountdown.show(), this.videoCountdown.begin()) : this.videoCountdown.paused && this.videoCountdown.unpause());
  }
  pause(t = noop) {
    this.log.debug("pause()"), this.celtraVideo.pauseAction(this.actionCtx, {}, t);
  }
  scriptedPause() {
    this.log.debug("scriptedPause()"), this._videoElement?.paused ? this.suppressNextPausePlayButton = !1 : this.suppressPlayButtonOnNextPause(), this.elementManager.hidePlayButton(), this.pause(() => {
      this.playWhenAppearing();
    });
  }
  /** Whether a genuine on-video tap happened recently enough to mark play/pause as user-initiated for analytics. */
  isUserGesture() {
    return Date.now() - this.lastClickAt < v.USER_CLICK_WINDOW_MS;
  }
  onPause() {
    this.log.debug("onPause()");
    const t = !this.suppressNextPausePlayButton, e = this.isUserGesture();
    this.suppressNextPausePlayButton = !1, this.eventHandlers.onPause(e, t), this.videoCountdown && this.videoCountdown.pause();
  }
  pauseCountdown() {
    this.videoCountdown?.pause();
  }
  unpauseCountdown() {
    this.videoCountdown?.unpause();
  }
  resetCountdown() {
    this.videoCountdown?.reset();
  }
  onTimeUpdate(t) {
    this.log.debug("onTimeUpdate()"), this.videoCountdown && this.options.videoCountdown?.autoSync && this.videoCountdown?.sync(t);
  }
  onEnded() {
    if (this.eventHandlers.onEnded(), this.videoCountdown) {
      this.videoCountdown.reset();
      const t = d.hasBool(this.options, "showCountdownOnEnd");
      this.videoCountdown[t ? "show" : "hide"]();
    }
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
   * Starts the controller once the unit has appeared (or immediately when already appeared).
   * Called by CreativeScript bootstrap after create().
   */
  start() {
    const t = () => {
      this.init(), this.playAfterScene();
    }, e = this.context.unit;
    if (e?.hasAppearedAtLeastOnce) {
      t();
      return;
    }
    if (typeof e?.once == "function") {
      e.once("appeared", t);
      return;
    }
    t();
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
      const i = t.target, s = e?.getBoundingClientRect?.(), { clientX: n, clientY: o } = t, a = !!s && n >= s.left && n <= s.right && o >= s.top && o <= s.bottom, u = !!(e && i && e.contains(i));
      (a || u) && (this.lastClickAt = Date.now());
    }, !0), this.options.loopVideo && this.setIndefinitePlay(), this.log.debug("Celtra video is ", this.celtraVideo), this.log.debug(this.options), this.options.loadSpinner || this.removeSpinner(), this.setupEventListeners(), typeof this.context.screen.on == "function" && this.context.screen.on("appeared", () => this.rebindDom()), this.context.screen.hasAppearedAtLeastOnce && this.rebindDom({
      scriptedPause: !this.hasInstructionScene() || !!this.options.scriptedPlay
    }), this.hideNativeControls();
  }
  /**
   * Sets the status of the video controller and logs it
   */
  setStatus(t, e = "status") {
    d.hasOwn(this.options, e) && (this.options[e] = t), this.log.debug(`${e}: ${t}`);
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
      e.some((s) => s.isIntersecting) && (t.disconnect(), this.log.debug("Video appeared in viewport, playing..."), this.playIfAllowed());
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
    if (!d.hasBool(this.options, "soundControl"))
      return;
    const e = document.getElementById("btn-sound");
    e && (this.soundDomHost = e, e.style.cursor = "pointer", e.style.display = "flex", e.style.alignItems = "center", e.style.justifyContent = "center", e.style.userSelect = "none", e.style.setProperty("-webkit-user-select", "none"), e.style.color = gt, e.style.filter = ft, this.soundDomClickHandler && e.removeEventListener("click", this.soundDomClickHandler), this.soundDomClickHandler = () => {
      this.toggleSound();
    }, e.addEventListener("click", this.soundDomClickHandler), this.updateSoundDomIcon(typeof t?.muted == "boolean" ? t.muted : !0), this.log.debug("Mounted sound DOM UI on #btn-sound", { muted: t?.muted }));
  }
  updateSoundDomIcon(t) {
    this.soundDomHost && (this.soundDomHost.innerHTML = t ? vt : mt);
  }
  /**
   * Initializes the video countdown component
   */
  initializeCountdown() {
    if (!this.options.countdownActive)
      return;
    if (this.options.countdown !== m.countdown && !this.elementManager.hasScreenObject(m.countdown))
      throw new w(
        `Countdown component "${this.options.countdown}" not found; Check your Celtra component names.`
      );
    this.videoCountdown?.destroy(), this.videoCountdown = void 0;
    const t = this.elementManager.countdown?.node, e = pt(
      t ? {
        ...this.options.videoCountdown,
        ...v.RESET_COUNTDOWN_OPTIONS
      } : this.options.videoCountdown
    );
    t && this.options.videoCountdown && this.log.warn(
      "Both videoCountdown options and a Celtra countdown component are set; using the Celtra component as the countdown host"
    );
    const i = this.celtraVideo, s = i.getNode(), n = t || s?.parentElement || this.context.screen.getNode();
    if (!n)
      throw new w("Countdown parent container not found");
    const o = Math.round(i.getDuration()) * 1e3;
    this.videoCountdown = new dt(n, o, e), this.videoCountdown.show();
  }
  rebindDom(t = {}) {
    this.hasVideoPlayed = !1, this.hasVideoCompleted = !1, this.quartileTracker.resetTrackingSession(), this.viewportObserver.disconnect(), this.viewportObserver.setupViewportObserver();
    const e = this.celtraVideo.getNode();
    f.expectIntoWhenAppeared(this.context.screen, e).then((i) => {
      this._videoElement = i, this.quartileTracker.setupQuartileListeners(), this.listenEventsFrom(i), this.options.countdownActive && this.initializeCountdown(), t.scriptedPause && (!this.hasInstructionScene() || this.options.scriptedPlay) && this.scriptedPause();
    }).catch((i) => {
      this.log.error(i);
    });
  }
  setupEventListeners() {
    const t = this.options.video;
    this.log.debug("Setting up listeners for:", t);
    const e = this.celtraVideo;
    e.on("playing", () => {
      this.onPlaying();
    }), e.on("pause", (i) => {
      const s = e.getDuration();
      if ((typeof i == "number" ? i >= s : (this._videoElement?.ended ?? !1) || e.getCurrentTime() >= s) || this.hasVideoCompleted) {
        this.onEnded();
        return;
      }
      this.onPause();
    }), e.on("timeupdate", (i) => {
      this.onTimeUpdate(i);
    }), this.mountSoundDomUI(e);
  }
};
v.instanceCount = 0, v.USER_CLICK_WINDOW_MS = 700, v.RESET_COUNTDOWN_OPTIONS = {
  top: "0",
  left: "0",
  bottom: "auto",
  right: "auto"
};
let T = v;
class wt {
  constructor(t) {
    this.options = t, this.creative = this.resolveCreative(t.creative), this.screen = this.resolveScreen(t.screen), this.unit = this.resolveUnit(t.unit), this.ctx = this.resolveCtx(t.ctx);
  }
  get impressionId() {
    return this.options.impressionId ?? this.runtimeParam(y.impressionIdParam) ?? this.creative.sessionId;
  }
  get endpoint() {
    return this.options.mbkTracking?.endpoint ?? this.trackingSetting("endpoint") ?? this.runtimeParam(y.endpointParam);
  }
  get errorEndpoint() {
    return this.options.mbkTracking?.errorEndpoint ?? this.trackingSetting("errorEndpoint") ?? this.runtimeParam(y.errorEndpointParam);
  }
  resolveCreative(t) {
    const e = t ?? this.readGlobal("creative");
    if (!e)
      throw new k('Celtra context: "creative" not found');
    return e;
  }
  resolveScreen(t) {
    if (this.isCeltraScreen(t))
      return t;
    if (typeof this.creative.getScreen == "function") {
      const i = this.creative.getScreen();
      if (this.isCeltraScreen(i))
        return i;
    }
    const e = this.readGlobal("screen");
    if (this.isCeltraScreen(e))
      return e;
    throw new k('Celtra context: "screen" not found');
  }
  resolveUnit(t) {
    const e = t ?? this.creative.getUnit?.() ?? this.screen.getUnit?.() ?? this.readGlobal("unit");
    if (!e)
      throw new k('Celtra context: "unit" not found');
    return e;
  }
  resolveCtx(t) {
    const e = t ?? this.readGlobal("ctx") ?? this.readGlobal("mbkCtx");
    return e || !this.screen || typeof ActionContext > "u" ? e : new ActionContext(this.screen, {
      certainlyNotCausedByUserBehavior: !1,
      consideredUserInitiatedByBrowser: !1
    });
  }
  runtimeParam(t) {
    const e = this.creative.runtimeParams?.[t];
    return typeof e == "string" && e ? e : void 0;
  }
  trackingSetting(t) {
    const e = this.creative.runtimeParams?.mbkTracking;
    if (this.isTrackingSettings(e)) {
      const i = e[t];
      return typeof i == "string" && i ? i : void 0;
    }
  }
  isTrackingSettings(t) {
    return !!(t && typeof t == "object");
  }
  isCeltraScreen(t) {
    return !!(t && typeof t.find == "function");
  }
  readGlobal(t) {
    return globalThis[t];
  }
}
const C = class C {
  init(t) {
    const e = I.enter(this.name);
    try {
      const i = new wt(t);
      I.configure({ errorEndpoint: i.errorEndpoint, impressionId: i.impressionId });
      const s = this.registryKey(i), n = C.registry.get(s);
      if (n)
        return e.debug("already initialized"), n;
      const o = d.deepMerge(this.defaultConfig, t), a = this.create(i, o);
      return C.registry.set(s, a), a.start(), a;
    } catch (i) {
      e.error(i);
    }
  }
  /** Override to choose the singleton key (default: one instance per unit). */
  registryKey(t) {
    return t.unit ?? t.screen;
  }
};
C.registry = /* @__PURE__ */ new WeakMap();
let $ = C;
class yt extends $ {
  constructor() {
    super(...arguments), this.name = "Video", this.defaultConfig = Q;
  }
  registryKey(t) {
    return t.screen;
  }
  create(t, e) {
    return new T(t, e, this.name);
  }
}
const bt = (r) => new yt().init(r);
export {
  bt as setup
};
