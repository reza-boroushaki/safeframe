/*! Copyright Mobkoi 2026 (v5.5.1) */
class te {
  constructor(e) {
    this.log = e.enter("SafeFrameUtil");
  }
  check() {
    const e = {}, t = typeof window < "u" && window.location && typeof window.location.href == "string" ? window.location.href : "", n = typeof creative < "u" && creative?.adapter && creative.adapter.safeFrameDetected || !1, i = /googlesyndication/i.test(t) || /safeframe/i.test(t);
    if (e.detected = !!(n || i), typeof window < "u")
      try {
        e.apiObject = typeof window.$sf < "u" ? window.$sf : window.parent.$sf;
      } catch (o) {
        this.log.debug("SafeFrameUtil", "cannot access window.parent.$sf", o), e.apiObject = typeof window.$sf < "u" ? window.$sf : void 0;
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
class R {
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
    return this.add(new R(e));
  }
  add(e) {
    return e.parent = this, e;
  }
}
const ne = new R("MOBKOI"), A = ne.enter("Celtra"), D = A.enter("VideoControllerOptions"), ie = {
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
function oe(s) {
  D.debug("initializeOptions()", s), D.debug("options.videoCountdown:", s.videoCountdown);
  const e = s.debug ?? (typeof creative < "u" && creative.userParams?.thisDebug === "true"), t = {
    ...ie,
    debug: e,
    ...s,
    mbkCustomEvents: s.mbkCustomEvents ? [...s.mbkCustomEvents] : []
  };
  return D.debug("initializeOptions returning:", t), D.debug("result.videoCountdown:", t.videoCountdown), t;
}
function Q(s, e) {
  return Object.prototype.hasOwnProperty.call(s, e);
}
function V(s, e) {
  if (Q(s, e)) {
    const t = s[e];
    return typeof t == "string" ? t === "true" : t;
  }
  return null;
}
class U extends Error {
  constructor(e, t) {
    super(e), this.cause = t;
  }
}
class se {
  constructor(e, t, n, i) {
    this.scope = e, this.options = t, this.actionCtx = i, this.elements = {}, this.log = n.enter("VideoElementManager");
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
  getScreenObject(e) {
    if (this.elements[e])
      return this.elements[e];
    const t = this.scope.find(e);
    return t instanceof ScreenObject && (this.elements[e] = t), this.elements[e];
  }
  get celtraVideo() {
    if (!this._celtraVideo) {
      const e = this.options.video, t = this.getScreenObject(e);
      if (!t)
        throw new U(`FAILED to find Celtra video component "${e}"; Check your Celtra component names.`);
      this._celtraVideo = t;
    }
    return this._celtraVideo;
  }
  /**
   * Checks if a screen object exists and is valid.
   *
   * @param optionName - The option key that holds the screen object name
   * @returns Whether the screen object exists and is valid
   */
  hasScreenObject(e) {
    const t = this.options[e];
    return t && this.scope.find(t) instanceof ScreenObject ? !0 : (this.options.debug && this.log.warn(`warning: cannot find ScreenObject ${e}`), !1);
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
    const e = this.scope.find(this.options.video);
    return e ? e.getNode().querySelector("div#hideable-controls") : null;
  }
  /**
   * Hides the native video controls
   */
  hideNativeControls() {
    const e = this.getNativeControls();
    e ? e.style.display = "none" : defer(() => this.hideNativeControls());
  }
}
const x = A.enter("VideoElementHelper"), re = 1e4;
class J extends Error {
  constructor(e) {
    super(e), this.name = "VideoElementWaitTimeoutError";
  }
}
class l {
  static describeContainer(e) {
    if (!e)
      return { container: null };
    const t = e instanceof HTMLVideoElement ? e : e.querySelector("video");
    return {
      containerId: e.id || "(no id)",
      containerTag: e.tagName,
      videoFound: !!t,
      videoConnected: t?.isConnected ?? !1,
      childCount: e.childNodes.length
    };
  }
  /**
   * Look for a <video> inside a container.
   */
  static findInto(e) {
    if (!e)
      return x.log("*** [findInto] no container"), null;
    const t = e instanceof HTMLVideoElement ? e : e.querySelector("video");
    return x.log("*** [findInto]", l.describeContainer(e)), t;
  }
  /**
   * Wait for <video> to be inside a container.
   */
  static expectInto(e, t = {}) {
    if (x.log("*** [expectInto] start", l.describeContainer(e)), !e)
      return x.log("*** [expectInto] rejected — container is null"), l.cancellableRejectedPromise(new Error("Cannot wait for video element without a container"));
    const n = l.findInto(e);
    if (n)
      return x.log("*** [expectInto] resolved immediately", { containerId: e.id || "(no id)" }), Object.assign(Promise.resolve(n), { cancel: noop });
    x.log("*** [expectInto] no <video> yet — waiting via MutationObserver", { containerId: e.id || "(no id)" }), t.onWaiting?.();
    let i, o, r = !0, a = noop;
    const c = () => {
      r = !1, i && (i.disconnect(), i = void 0), o && (clearTimeout(o), o = void 0);
    }, d = new Promise((h, C) => {
      a = () => {
        r && (c(), C(new Error("Video element wait cancelled")));
      };
      const b = () => {
        if (!r)
          return;
        const I = l.findInto(e);
        I && (x.log("*** [expectInto] <video> inserted", {
          containerId: e.id || "(no id)",
          videoConnected: I.isConnected
        }), c(), h(I));
      };
      typeof MutationObserver < "u" && (i = new MutationObserver(b), i.observe(e, { childList: !0, subtree: !0 }));
      const S = t.timeoutMs ?? re;
      o = setTimeout(() => {
        r && (x.log("*** [expectInto] timed out", {
          containerId: e.id || "(no id)",
          timeoutMs: S
        }), c(), C(new J(`Timed out waiting ${S}ms for <video> element inside #${e.id}`)));
      }, S);
    });
    return Object.assign(d, { cancel: a });
  }
  /**
   * Wait for a Celtra view/page to appear before starting the DOM video wait.
   * This prevents inactive pages from timing out before Celtra inserts their <video>.
   */
  static expectIntoWhenAppeared(e, t, n = {}) {
    if (!e || e.hasAppearedAtLeastOnce)
      return x.log("*** [expectIntoWhenAppeared] view already appeared — expectInto now", l.describeContainer(t)), l.expectInto(t, n);
    const i = typeof e.on == "function" ? e.on.bind(e) : typeof e.once == "function" ? e.once.bind(e) : void 0;
    if (!i)
      return x.log("*** [expectIntoWhenAppeared] no appeared listener — expectInto now", l.describeContainer(t)), l.expectInto(t, n);
    x.log("*** [expectIntoWhenAppeared] waiting for view appeared before expectInto", l.describeContainer(t));
    let o = !0, r, a = noop;
    const c = new Promise((d, h) => {
      a = () => {
        o && (o = !1, r?.cancel(), h(new Error("Video element wait cancelled")));
      }, i("appeared", () => {
        o && (x.log("*** [expectIntoWhenAppeared] view appeared — starting expectInto", l.describeContainer(t)), r = l.expectInto(t, n), r.then(d).catch(h));
      });
    });
    return Object.assign(c, { cancel: a });
  }
  static cancellableRejectedPromise(e) {
    return Object.assign(Promise.reject(e), { cancel: noop });
  }
}
class ae {
  constructor(e, t, n, i, o) {
    this.elementManager = e, this.options = t, this.onViewportChange = n, this.activationView = o, this.isInViewport = !1, this.setupId = 0, this.log = i.enter("VideoViewportObserver");
  }
  get inViewport() {
    return this.isInViewport;
  }
  /**
   * Sets up the IntersectionObserver to monitor video visibility in the viewport
   */
  setupViewportObserver() {
    const e = ++this.setupId, t = this.elementManager.getScreenObject(this.options.video);
    if (!t) {
      this.log.log("*** [viewport] Celtra video ScreenObject not found", { name: this.options.video });
      return;
    }
    const n = t.getNode();
    this.log.log("*** [viewport] container before wait", {
      setupId: e,
      ...l.describeContainer(n)
    }), l.expectIntoWhenAppeared(this.activationView, n, {
      onWaiting: () => {
        this.log.warn("Video element not found for viewport observer, waiting for it to be inserted");
      }
    }).then((i) => {
      e === this.setupId && (this.log.log("*** [viewport] <video> ready for observer", {
        setupId: e,
        videoConnected: i.isConnected
      }), this.setupVisibilityObserver(i));
    }).catch((i) => {
      this.log.error(i);
    });
  }
  setupVisibilityObserver(e) {
    this.visibilityObserver?.disconnect(), this.visibilityObserver = new IntersectionObserver((t) => {
      t.forEach((n) => {
        const i = this.isInViewport;
        this.isInViewport = n.isIntersecting, i !== this.isInViewport && (this.log.debug("Viewport change detected:", this.isInViewport ? "in viewport" : "out of viewport"), this.onViewportChange(this.isInViewport));
      });
    }, {
      threshold: 0.1,
      // Lower threshold to detect visibility changes earlier
      rootMargin: "0px"
      // No margin around the viewport
    }), this.visibilityObserver.observe(e), this.log.debug("Viewport observer set up for video element");
  }
  disconnect() {
    this.setupId++, this.visibilityObserver && (this.visibilityObserver.disconnect(), this.visibilityObserver = void 0);
  }
}
class ce {
  constructor(e) {
    this.log = e.enter("VideoSafeFrameHandler"), this.safeframeUtil = new te(this.log);
  }
  /**
   * Attempts to setup SafeFrame monitoring for video playback
   * @param video - The CeltraVideo object
   * @param actionCtx - Celtra ActionContext
   * @param playSuccessCheck - Callback for play success
   */
  setupSafeFrameMonitoring(e, t, n) {
    const i = this.safeframeUtil.get(), o = i?.ext?.inViewPercentage;
    if (i && typeof o == "function")
      try {
        let r = null;
        this.sfInterval = setInterval(() => {
          o() > 0.05 && r !== "ended" ? e.playAction(t, {}, n) : e.pauseAction(t, {}, n);
        }, 250), ["playing", "ended"].forEach((a) => {
          e.on(a, () => {
            r = a;
          });
        });
      } catch (r) {
        this.log.warn("sfInterval failed", r);
      }
  }
  stopMonitoring() {
    this.sfInterval && (clearInterval(this.sfInterval), this.sfInterval = void 0);
  }
}
class le {
  constructor(e, t, n, i, o, r, a, c) {
    this.scope = e, this.elementManager = t, this.options = n, this.safeframeHandler = i, this.actionCtx = o, this.setStatus = r, this.controller = c, this.playSuccessFlag = !1, this.log = a.enter("VideoPlaybackController");
  }
  /**
   * Attempts to play the video if autoplay is allowed
   */
  playIfAllowed() {
    if (this.setStatus("checking autoplay status"), V(
      this.options,
      "clicktoplay"
    ) || creative.userParams?.disableautoplay === "true" || creative.userParams?.disableautoplay === !0) {
      this.setStatus("autoplay disabled");
      const e = this.scope.find(this.options.video);
      e.autoplay && e.pauseAction(this.actionCtx, {}, noop);
      const t = V(this.options, "showPlayBtnOnCtp");
      return this.log.debug("showPlayBtnOnCtp=", t), t && this.elementManager.showPlayButton(), !1;
    } else {
      this.setStatus("attempting autoplay");
      const e = () => {
        this.playSuccessFlag || (this.controller && typeof this.controller.playCheck == "function" ? this.controller.playCheck() : this.playCheck(), this.playSuccessFlag = !0);
      };
      try {
        const t = this.controller && typeof this.controller.getScreenObject == "function" ? this.controller.getScreenObject(this.options.video) : this.elementManager.getScreenObject(this.options.video);
        t.muted || t.muteAction(this.actionCtx, {}, noop), t._player.on("autoplayrejected", () => {
          this.log.debug("autoplayrejected"), this.options.scriptedPlay || (this.elementManager.showPlayButton(), this.options.autoplayrejected = !0);
        }), t.hasAppearedAtLeastOnce ? t.playAction(this.actionCtx, {}, e) : t.once("appeared", () => {
          t.playAction(this.actionCtx, {}, e);
        }), this.safeframeHandler.setupSafeFrameMonitoring(t, this.actionCtx, e);
      } catch (t) {
        this.log.error("play attempt failed", t), this.setStatus("play attempt failed - status : " + (this.controller?.status || "unknown"), "warning"), this.elementManager.showPlayButton();
      }
      return !0;
    }
  }
  /**
   * Checks if the video is ready to play and handles playback state
   */
  playCheck() {
    const e = this.controller && typeof this.controller.getScreenObject == "function" ? this.controller.getScreenObject(this.options.video) : this.elementManager.getScreenObject(this.options.video), t = e.getNode(), n = typeof screen < "u" ? screen : this.scope, i = () => {
      this.controller && typeof this.controller.fireChecks == "function" ? this.controller.fireChecks() : this.fireChecks();
    };
    if (!t) {
      this.log.debug("Video node not found for playback checks, waiting for playing event"), e.on("playing", () => this.playCheck());
      return;
    }
    if (!n.hasAppearedAtLeastOnce && typeof n.on == "function") {
      n.on("appeared", () => {
        l.findInto(t) ? i() : this.waitForVideoElement(t, () => i());
      });
      return;
    }
    this.waitForVideoElement(t, i, n);
  }
  /**
   * Handles video playback checks and UI state based on video events
   */
  fireChecks() {
    const e = this.controller && typeof this.controller.getScreenObject == "function" ? this.controller.getScreenObject(this.options.video) : this.elementManager.getScreenObject(this.options.video), t = e.getNode();
    if (!t) {
      this.log.debug("Video node not found for playback checks");
      return;
    }
    this.waitForVideoElement(t, (n) => this.setupPlaybackChecks(e, n), this.scope);
  }
  waitForVideoElement(e, t, n) {
    if (this.videoElementWait)
      return;
    this.log.log("*** [playback] container before wait", l.describeContainer(e));
    const i = l.expectIntoWhenAppeared(n, e, {
      onWaiting: () => {
        this.log.debug("Video element not found for playback checks, waiting for it to be inserted");
      }
    });
    this.videoElementWait = i, i.then((o) => {
      this.videoElementWait = void 0, t(o);
    }).catch((o) => {
      this.videoElementWait = void 0, o instanceof J && this.log.warn("Video element not found for playback checks before timeout");
    });
  }
  clearVideoElementWait() {
    this.videoElementWait && (this.videoElementWait.cancel(), this.videoElementWait = void 0);
  }
  setupPlaybackChecks(e, t) {
    this.clearVideoElementWait();
    const n = { timeupdate: 0 };
    e.on("timeupdate", () => {
      n.timeupdate++;
    });
    const i = typeof screen < "u" ? screen : this.scope;
    t.addEventListener("canplay", () => {
      this.log.debug("canplay"), this.elementManager.hidePlayButton(), i.unpauseCountdown && i.unpauseCountdown();
    }), t.addEventListener("waiting", () => {
      i.pauseCountdown && i.pauseCountdown();
    }), setTimeout(() => {
      n.timeupdate || (this.elementManager.hasPlayButton() && this.elementManager.playButton.showAction(this.actionCtx, {}, noop), i.pauseCountdown && i.pauseCountdown());
    }, 1500);
  }
  /**
   * Removes the loading spinner from the video player
   */
  removeSpinner() {
    const e = this.scope.find(this.options.video);
    e._player ? (e._player._controlsController._spinnerHide(), e._player._controlsController._spinnerShow = noop, e._player._controlsController._spinnerShown = !1) : defer(() => this.removeSpinner());
  }
  /**
   * Sets up indefinite playback (looping) for the video
   */
  setIndefinitePlay() {
    const e = this.scope.find(this.options.video);
    e.indefinitely = !0, this.options.countdownActive && e.on("pause", (t) => {
      if (t >= e.getDuration())
        try {
          this.scope.resetCountdown?.();
        } catch {
          this.setStatus("countdown reset failed", "warning");
        }
    });
  }
}
class X {
  constructor(e) {
    this.scope = e.scope, this.userInitiated = e.userInitiated;
  }
}
class Y extends X {
  constructor(e, t) {
    super(e), this.actionContext = t;
  }
}
class G {
  constructor(e) {
    this.name = "celtra", this.log = e.enter("MbkCeltraChannel");
  }
  static actionContextOf(e) {
    return e instanceof Y ? e.actionContext : void 0;
  }
  emit(e, t) {
    if (!e.legacyEvent)
      return !1;
    const n = typeof Creative < "u" ? Creative : void 0;
    if (typeof n?.trackCustomEventAction != "function")
      return this.log.debug("Creative API unavailable, no Celtra event for", e.legacyEvent), !1;
    const i = G.actionContextOf(t);
    if (!i)
      return this.log.warn("No ActionContext on the cause of", e.legacyEvent), !1;
    const o = e.legacyEvent;
    return n.trackCustomEventAction(i, { name: o }, () => this.log.debug("Celtra event accepted:", o)), !0;
  }
}
class de {
  constructor(e, t, n) {
    this.key = e, this.initiator = n, this.log = t.enter(`MbkCeltraContexts(${e})`);
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
    const n = this.create(!1);
    return n && (this.passive = n), n;
  }
  create(e) {
    const t = globalThis, n = this.initiator ?? t.screen ?? t.unit;
    if (typeof t.ActionContext == "function" && n)
      try {
        return new t.ActionContext(n, {
          certainlyNotCausedByUserBehavior: !e,
          consideredUserInitiatedByBrowser: e
        });
      } catch (i) {
        this.log.warn("Could not create an ActionContext, falling back to the ambient one", i);
      }
    return t.mbkCtx ?? t.ctx;
  }
}
class m {
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
      m.of(e),
      m.instance(e),
      m.path(e.scope),
      e.percent,
      e.from,
      e.to,
      e.completed,
      e.mode,
      e.legacyEvent
    ].map((n) => n === void 0 ? "" : String(n)).join("|");
  }
  /**
   * What the signal is about: the role, which instance, and where. Everything but what happened to
   * it, which is the verb and the values.
   *
   * This is what a state is keyed on: two players hold two independent states, and a `play` followed
   * by a `pause` is one subject changing rather than two things happening.
   */
  static subject(e) {
    return [e.role, m.instance(e), m.path(e.scope)].join("|");
  }
  /** `"2"`, `"vidPlayer1"`, or `""` for a singleton such as the unit. */
  static instance(e) {
    return e.index !== void 0 ? String(e.index) : e.name ?? "";
  }
  /** Containment as one string, outermost first: `"panel:2>section:3"`. */
  static path(e) {
    const t = [];
    for (let n = e; n; n = n.scope) {
      const i = m.instance(n);
      t.unshift(i ? `${n.role}:${i}` : n.role);
    }
    return t.join(">");
  }
}
class f {
  /** Query parameters for one signal. Undefined values are omitted rather than sent empty. */
  static of(e, t) {
    const n = { k: e.verb, vs1: e.role };
    return f.set(n, "vs2", e.legacyEvent), f.set(n, "vs3", e.name), f.set(n, "vs4", m.path(e.scope) || void 0), f.set(n, "vs5", e.mode), f.set(n, "vi1", e.index), f.set(n, "vi2", e.ms), f.set(n, "vi3", e.from), f.set(n, "vi4", e.to), f.set(n, "vi5", e.completed === void 0 ? void 0 : Number(e.completed)), f.set(n, "vf1", e.percent), f.set(n, "vf2", e.modeMs), f.set(n, "iid", t), n;
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
  static url(e, t, n) {
    const i = e.includes("{{event}}") ? e.replace("{{event}}", encodeURIComponent(t.legacyEvent ?? t.verb)) : e, o = i.includes("?") ? "&" : "?";
    return `${i}${o}${f.toQueryString(f.of(t, n))}`;
  }
  static set(e, t, n) {
    n != null && n !== "" && (e[t] = n);
  }
}
const O = class O {
  constructor(e) {
    this.options = e;
  }
  get endpoint() {
    return this.options.endpoint ?? this.runtimeParam(O.endpointParam);
  }
  get errorEndpoint() {
    return this.options.errorEndpoint ?? this.runtimeParam(O.errorEndpointParam);
  }
  get impressionId() {
    return this.options.impressionId ? this.options.impressionId : (typeof creative < "u" ? creative : void 0)?.sessionId;
  }
  get pixelFallback() {
    return this.options.pixelFallback ?? O.defaults.pixelFallback;
  }
  get log() {
    return this.options.log ?? O.defaults.log();
  }
  /** Completes the configuration in place. Later values win, undefined ones leave the current one. */
  update(e) {
    const t = Object.keys(e).reduce((n, i) => {
      const o = e[i];
      return o !== void 0 && (n[i] = o), n;
    }, {});
    this.options = { ...this.options, ...t };
  }
  runtimeParam(e) {
    const n = (typeof creative < "u" ? creative : void 0)?.runtimeParams?.[e];
    return typeof n == "string" && n ? n : void 0;
  }
};
O.endpointParam = "externalSignalTrackerURI", O.errorEndpointParam = "externalClientErrorURI", O.defaults = {
  pixelFallback: !0,
  log: () => new R("mbk")
};
let F = O;
class ue {
  constructor(e, t) {
    this.config = e, this.name = "beacon", this.log = t.enter("MbkBeaconChannel");
  }
  emit(e) {
    const t = this.config.endpoint;
    if (!t)
      return this.log.debug(`No ${F.endpointParam}, raw signal not sent`), !1;
    const n = globalThis.navigator?.sendBeacon;
    if (typeof n != "function")
      return this.log.debug("sendBeacon unavailable"), !1;
    const i = f.url(t, e, this.config.impressionId), o = n.call(globalThis.navigator, i);
    return this.log.debug(o ? "queued" : "refused", i), o;
  }
}
const K = class K {
};
K.mapping = [
  { kind: { verb: "click", role: "cta" }, legacyEvent: () => "clickSite" },
  { kind: { verb: "click", role: "unit" }, legacyEvent: () => "clickSite" }
];
let H = K;
class Z {
  constructor(e, t, n) {
    this.key = t, this.resolvers = /* @__PURE__ */ new Map(), this.log = e.enter(`MbkLegacyEvents(${t})`), this.declare(n);
  }
  /** Adds or replaces resolvers. Later declaration wins for the same kind. */
  declare(e) {
    for (const t of e) {
      if (!t?.kind || typeof t.legacyEvent != "function") {
        this.log.warn("Ignoring malformed legacy mapping", t);
        continue;
      }
      this.resolvers.set(m.of(t.kind), t.legacyEvent);
    }
    return this;
  }
  has(e) {
    return this.resolvers.has(m.of(e));
  }
  /**
   * @returns the Celtra event name for this signal, or `undefined` when no resolver is registered
   *   for its kind or when the registered one threw.
   */
  resolve(e) {
    const t = this.resolvers.get(m.of(e));
    if (t)
      try {
        const { legacyEvent: n, ...i } = e, o = t(i);
        if (typeof o != "string" || !o) {
          this.log.warn(`Resolver for ${m.of(e)} produced no name`, o);
          return;
        }
        return o;
      } catch (n) {
        this.log.warn(`Resolver for ${m.of(e)} failed, no Celtra event emitted`, n);
        return;
      }
  }
}
class he {
  constructor(e, t) {
    this.config = e, this.name = "pixel", this.pending = /* @__PURE__ */ new Set(), this.log = t.enter("MbkPixelChannel");
  }
  emit(e) {
    const t = this.config.endpoint;
    if (!t)
      return !1;
    if (typeof Image != "function")
      return this.log.debug("Image unavailable"), !1;
    const n = f.url(t, e, this.config.impressionId), i = new Image();
    this.pending.add(i);
    const o = () => this.pending.delete(i);
    return i.onload = o, i.onerror = o, i.src = n, this.log.debug("sent", n), !0;
  }
}
class pe {
  constructor(e, t) {
    this.config = e, this.log = t.enter("MbkTrackErrorReporter");
  }
  report(e, t, n) {
    this.log.warn(`Channel "${e}" failed for ${m.of(t)}`, n);
    const i = this.config.errorEndpoint;
    if (i)
      try {
        const o = [
          `error=${encodeURIComponent(`mbkTrack:${e}`)}`,
          `reason=${encodeURIComponent(String(n?.message ?? n))}`,
          `k=${encodeURIComponent(t.verb)}`
        ], r = this.config.impressionId;
        r && o.push(`iid=${encodeURIComponent(r)}`);
        const a = `${i}${i.includes("?") ? "&" : "?"}${o.join("&")}`;
        globalThis.navigator?.sendBeacon?.(a);
      } catch (o) {
        this.log.debug("Could not report the channel failure", o);
      }
  }
}
const v = class v {
  constructor(e) {
    this.tracks = /* @__PURE__ */ new Map(), this.emitted = /* @__PURE__ */ new Set(), this.states = /* @__PURE__ */ new Map(), this.config = new F(e), this.log = this.config.log.enter("MbkImpression"), this.startedAt = v.now(), this.beacon = new ue(this.config, this.log), this.pixel = new he(this.config, this.log), this.reporter = new pe(this.config, this.log), this.coreLegacyEvents = new Z(this.log, "core", H.mapping);
  }
  /** The one impression of this creative, created on first use. */
  static shared(e) {
    const t = v.storage(), n = t[v.storageKey];
    if (n)
      return n.configure(e), n;
    const i = new v(e);
    return t[v.storageKey] = i, i;
  }
  /** Drops it. For tests, and for a creative that reloads its scripts. */
  static reset() {
    delete v.storage()[v.storageKey];
  }
  /**
   * Stash on `unit` when available, else on the window, following the precedent set by
   * `CpxTracker.getStorageObject()`.
   */
  static storage() {
    const e = globalThis;
    return e.unit ? e.unit : (e[v.windowStorageKey] || (e[v.windowStorageKey] = {}), e[v.windowStorageKey]);
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
  track(e, t, n) {
    const i = this.tracks.get(e);
    if (i) {
      if (!(i instanceof n))
        throw new Error(
          `MbkTrack: script "${e}" is already tracked as a ${i.constructor.name}, not a ${n.name}. Every instance of one script must pick the same specialisation.`
        );
      return i;
    }
    const o = t();
    return this.tracks.set(e, o), o;
  }
  /**
   * Marks the start of the impression, which every timestamp is relative to.
   *
   * Called implicitly at construction. Call it explicitly from the first `appeared` the creative
   * sees if that is a better origin; it is ignored once signals have been emitted, so the clock
   * cannot move under data already sent.
   */
  markStart() {
    return this.emitted.size > 0 || this.states.size > 0 ? (this.log.debug("Impression start not moved: signals were already emitted"), !1) : (this.startedAt = v.now(), !0);
  }
  /** Milliseconds since the start of the impression. */
  elapsedMs() {
    return Math.round(v.now() - this.startedAt);
  }
  /**
   * Whether this signal goes out under that emission, recording what it needs to for the next one.
   *
   * Everything is recorded **synchronously**, before any channel: this is the CustomWipeable defect,
   * where the flag was pushed inside the asynchronous tracking callback so two calls could both pass.
   */
  admits(e, t) {
    const n = m.signature(e);
    switch (t) {
      case "repeated":
        return !0;
      case "once":
        return this.emitted.has(n) ? (this.log.debug("Already emitted, skipping", n), !1) : (this.emitted.add(n), !0);
      case "state": {
        const i = m.subject(e);
        return this.states.get(i) === n ? (this.log.debug("Unchanged, skipping", n), !1) : (this.states.set(i, n), !0);
      }
    }
  }
  /** The raw channels: the beacon, then the image pixel when the beacon did not take it. */
  emitRaw(e, t) {
    !this.send(this.beacon, e, t) && this.config.pixelFallback && this.send(this.pixel, e, t);
  }
  /** One channel, isolated: it can fail without touching the others. */
  send(e, t, n) {
    try {
      return e.emit(t, n);
    } catch (i) {
      return this.reporter.report(e.name, t, i), !1;
    }
  }
};
v.storageKey = "mbkImpression", v.windowStorageKey = "__mbkTrackStorage";
let W = v;
class z {
  constructor(e, t) {
    this.impression = e, this.key = t, this.log = e.log.enter(`${this.constructor.name}(${t})`), this.legacyEvents = new Z(this.log, t, []);
  }
  /**
   * The track of that script, created on first use, completed with its dictionary.
   *
   * The instance is read and dropped: nothing here keeps a reference to a partially constructed
   * object.
   */
  static shared(e, t) {
    const n = W.shared(t);
    return n.track(e.trackingKey, () => new z(n, e.trackingKey), z).declare(e.legacyEventsMapping);
  }
  /** Adds this script's Celtra event names. A later declaration wins for the same kind. */
  declare(e) {
    return this.legacyEvents.declare(e), this;
  }
  /** A context of the kind this specialisation builds: what caused the signals, and where. */
  context(e) {
    return new X(e);
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
  emit(e, t, n) {
    const i = { ...e, ms: this.impression.elapsedMs() };
    !i.scope && t.scope && (i.scope = t.scope), this.impression.admits(i, n) && (i.legacyEvent = e.legacyEvent ?? this.resolveLegacyEvent(i), this.log.debug("emit", i), this.emitChannels(i, t));
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
    return t || this.log.debug(`No resolver for ${m.of(e)}, raw signal only`), t;
  }
}
class N extends z {
  constructor(e, t, n) {
    super(e, t), this.contexts = new de(t, this.log, n), this.celtra = new G(this.log);
  }
  /**
   * @throws when the same script is already tracked as a plain {@link MbkTrack}. See
   *   {@link MbkImpression.track}.
   */
  static shared(e, t) {
    const n = W.shared(t);
    return n.track(
      e.trackingKey,
      () => new N(n, e.trackingKey, t.initiator),
      N
    ).declare(e.legacyEventsMapping);
  }
  /**
   * A Celtra context, carrying the `ActionContext` this cause's legacy events are fired with: the
   * one the call site forwarded from its handler, else a fresh user-initiated one when the cause is
   * a gesture, else this script's common passive one.
   */
  context(e) {
    const t = e.actionContext ?? this.contexts.forCause(e.userInitiated);
    return new Y(e, t);
  }
  /** The legacy event first, unchanged, then the raw channels. */
  emitChannels(e, t) {
    this.impression.send(this.celtra, e, t), super.emitChannels(e, t);
  }
}
class ge {
  constructor(e, t, n, i, o, r, a) {
    this.scope = e, this.elementManager = t, this.options = n, this.actionCtx = i, this.setStatus = o, this.state = r, this.trackingKey = "video", this.mediaPlay = { verb: "play", role: "media" }, this.mediaPause = { verb: "pause", role: "media" }, this.mediaLegacy = { verb: "legacy", role: "media" }, this.legacyEventsMapping = [], this.log = a.enter("VideoEventHandlers"), this.track = N.shared(this, {}), this.playback = this.track.context({ scope: void 0, userInitiated: !1, actionContext: this.actionCtx });
  }
  onPlaying(e) {
    this.trackPlayback(this.mediaPlay, e), this.state.hasVideoPlayed = !0, this.state.hasVideoCompleted = !1, this.elementManager.hidePlayButton(), this.elementManager.hasScreenObject("btnReplay") && this.elementManager.replayButton.hideAction(this.actionCtx, {}, noop), V(this.options, "soundControl") && this.elementManager.hasScreenObject("btnSound") && this.elementManager.soundButton.showAction(this.actionCtx, {}, noop), V(this.options, "countdownActive") && this.elementManager.hasScreenObject("countdown") && this.elementManager.countdown.showAction(this.actionCtx, {}, noop), this.setStatus("playing");
  }
  onPause(e) {
    this.trackPlayback(this.mediaPause, e), e && this.elementManager.showPlayButton(), this.setStatus("paused");
  }
  onMute() {
    if (V(this.options, "soundControl")) {
      const e = this.elementManager.unmutedButton, t = this.elementManager.mutedButton;
      e && typeof e.hideAction == "function" && e.hideAction(this.actionCtx, {}, noop), t && typeof t.showAction == "function" && t.showAction(this.actionCtx, {}, noop);
    }
    this.setStatus("muted");
  }
  onUnmute() {
    if (V(this.options, "soundControl")) {
      const e = this.elementManager.unmutedButton, t = this.elementManager.mutedButton;
      e && typeof e.showAction == "function" && e.showAction(this.actionCtx, {}, noop), t && typeof t.hideAction == "function" && t.hideAction(this.actionCtx, {}, noop);
    }
    this.setStatus("unmuted");
  }
  onEnded() {
    this.state.hasVideoCompleted = !0, this.elementManager.hasScreenObject("btnReplay") && this.elementManager.replayButton.showAction(this.actionCtx, {}, noop), V(this.options, "showPlayBtnOnEnd") ? this.elementManager.showPlayButton() : this.elementManager.hidePlayButton(), this.elementManager.hasScreenObject("btnSound") && (V(this.options, "showSoundBtnOnEnd") ? this.elementManager.soundButton.showAction(this.actionCtx, {}, noop) : this.elementManager.soundButton.hideAction(this.actionCtx, {}, noop)), this.elementManager.hasScreenObject("countdown") && (V(this.options, "showCountdownOnEnd") ? this.elementManager.countdown.showAction(this.actionCtx, {}, noop) : this.elementManager.countdown.hideAction(this.actionCtx, {}, noop)), this.setStatus("ended");
  }
  toggleSound() {
    const e = this.scope.find(String(this.options.video));
    e.muted ? (this.options.debug && this.log.debug("Unmuting video"), e.unMuteAction(this.actionCtx, {}, noop), this.logger("mbk_video_unmuted")) : (this.options.debug && this.log.debug("Muting video"), e.muteAction(this.actionCtx, {}, noop), this.logger("mbk_video_muted"));
  }
  logger(e) {
    this.options.mbkCustomEvents.indexOf(e) === -1 ? (this.options.debug && this.log.debug(`[Event] - ${e}`), this.options.mbkCustomEvents.push(e), this.track.once({ ...this.mediaLegacy, name: this.options.video, legacyEvent: e }, this.playback)) : this.options.debug && this.log.debug("event already exist", this.options.mbkCustomEvents);
  }
  /**
   * One playback signal, with its cause.
   *
   * A user-initiated context is built for each gesture rather than reused, because the flag it
   * carries is a claim about the browser's user-activation window. The automatic ones share the
   * playback context.
   */
  trackPlayback(e, t) {
    const n = { scope: void 0, userInitiated: !0, actionContext: void 0 }, i = t ? this.track.context(n) : this.playback;
    this.track.state({ ...e, name: this.options.video }, i);
  }
}
class fe {
  constructor(e, t, n, i) {
    this.elementManager = e, this.options = t, this.actionCtx = n, this.trackingKey = "video", this.mediaProgress = { verb: "progress", role: "media" }, this.quartileEventMap = {
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
    }, this.log = i.enter("VideoQuartileTracker"), this.quartileEvents = this.createQuartileEvents(), this.track = N.shared(this, {}), this.playback = this.track.context({ scope: void 0, userInitiated: !1, actionContext: this.actionCtx });
  }
  setupQuartileListeners() {
    const e = this.elementManager.getScreenObject(this.options.video);
    if (!e?._player) {
      this.log.warn("Video player not found for quartile tracking");
      return;
    }
    const t = document.createElement("div");
    document.body.appendChild(t), Object.keys(this.quartileEventMap).forEach((n) => {
      const i = this.quartileEventMap[n];
      e._player.on(n, () => {
        if (!this.quartileEvents[i])
          if (this.log.debug(`Tracking: ${i}`), this.quartileEvents[i] = !0, this.track.once(
            { ...this.mediaProgress, name: this.options.video, percent: this.quartilePercents[n] },
            this.playback
          ), this.options.tagservice) {
            const o = new Image();
            o.src = this.buildTrackingUrl(i), t.appendChild(o);
          } else
            this.postToParent(i);
      });
    });
  }
  buildTrackingUrl(e) {
    return creative.runtimeParams.externalVideoTrackerURI.replace("{{event}}", e);
  }
  postToParent(e) {
    const t = (c) => typeof c == "string" && c.length > 0 && c !== "null" ? c : void 0, n = globalThis.location, i = t(n?.origin), o = t(n?.href), r = o ? t(new URL(o).origin) : void 0, a = this.options.postMessageTargetOrigin ?? i ?? r ?? "*";
    globalThis.parent.parent.postMessage({ type: e, data: {} }, a);
  }
  /**
   * The Celtra event name for a media progress, derived from the two maps above rather than from a
   * third table, so the names cannot drift.
   *
   * @throws when the percentage is not a quartile, which produces no Celtra event rather than an
   *   invented one. The raw signal still carries the exact percentage.
   */
  legacyQuartileEvent(e) {
    const t = Object.keys(this.quartilePercents).find((n) => this.quartilePercents[n] === e);
    if (!t)
      throw new Error(`No Celtra event for a media progress at ${e}%`);
    return this.quartileEventMap[t];
  }
  createQuartileEvents() {
    const e = {};
    return Object.values(this.quartileEventMap).forEach((t) => {
      e[t] = !1;
    }), e;
  }
}
class me {
  constructor(e, t, n, i, o, r, a) {
    this.elementManager = e, this.options = t, this.actionCtx = n, this.onSceneEnd = i, this.controller = r, this.unit = a, this.log = o.enter("VideoInstructionScene");
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
  setupInstructionScenePlayback(e) {
    if (!e) {
      this.controller && typeof this.controller.setStatus == "function" ? this.controller.setStatus("Instruction scene not found", "warning") : this.log.warn("Instruction scene not found");
      return;
    }
    this.controller.pause(), e._player.addEventListener("end", () => {
      this.log.debug(`${e.name}_ended`), this.onSceneEnd();
    });
  }
  /**
   * Handles the instruction scene playback logic
   */
  playAfterScene() {
    if (!this.hasInstructionScene())
      return;
    const e = this.unit || (typeof unit < "u" ? unit : null);
    if (!e) {
      this.log.warn("Unit object not found for instruction scene");
      return;
    }
    const t = e.find(this.options.instructionScene);
    this.log.debug("Setting up instruction scene playback:", t), this.controller && typeof this.controller.setupInstructionScenePlayback == "function" ? this.controller.setupInstructionScenePlayback(t) : this.setupInstructionScenePlayback(t);
  }
}
const j = A.enter("VideoCountdown");
class ve {
  constructor(e, t, n) {
    this.parentElement = e, this.options = n, this.currentTime = 0, this.isVisible = !1, this.isPaused = !1, this.interval = null, this.intervalValue = 0, j.debug("Constructor called", {
      parentElement: e,
      duration: t,
      options: n,
      parentTag: e?.tagName
    }), this.duration = t, this.mode = n.mode, this.size = this.getSizeInPixels(n.size), this.mode === "kinetic" && (this.duration = 0.95 * this.duration), this.container = this.createContainer(), j.debug("Container created", this.container), this.svg = this.createSVG(), j.debug("SVG created", this.svg), this.progressCircle = this.createProgressCircle(), this.textElement = this.createTextElement(), this.svg.appendChild(this.createBackgroundCircle()), this.svg.appendChild(this.progressCircle), this.mode === "countdown" && (this.svg.appendChild(this.textElement), j.debug("Text element added")), this.container.appendChild(this.svg), j.debug("SVG appended to container"), this.parentElement.appendChild(this.container), j.debug("Container appended to parent. Parent children:", this.parentElement.children.length), this.updateProgress(), j.debug("Progress updated. Container in DOM:", document.contains(this.container));
  }
  getSizeInPixels(e) {
    switch (e) {
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
    const e = document.createElement("div");
    return e.className = "mbk-countdown", e.style.cssText = `
      position: absolute;
      z-index: 50;
      top: 0;
      left: 0;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    `, e;
  }
  createSVG() {
    const e = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    return e.setAttribute("width", this.size.toString()), e.setAttribute("height", this.size.toString()), e.setAttribute("viewBox", `0 0 ${this.size} ${this.size}`), e.style.cssText = `
      display: block;
    `, e;
  }
  createBackgroundCircle() {
    const e = document.createElementNS("http://www.w3.org/2000/svg", "circle"), t = this.size / 2 - 2;
    return e.setAttribute("cx", (this.size / 2).toString()), e.setAttribute("cy", (this.size / 2).toString()), e.setAttribute("r", t.toString()), e.setAttribute("fill", this.options.bgColor), e;
  }
  createProgressCircle() {
    const e = document.createElementNS("http://www.w3.org/2000/svg", "circle"), t = this.size / 2 - 4, n = 2 * Math.PI * t;
    return e.setAttribute("cx", (this.size / 2).toString()), e.setAttribute("cy", (this.size / 2).toString()), e.setAttribute("r", t.toString()), e.setAttribute("fill", "none"), e.setAttribute("stroke", this.options.barColor), e.setAttribute("stroke-width", "2"), e.setAttribute("stroke-linecap", "round"), e.setAttribute("stroke-dasharray", n.toString()), e.setAttribute("stroke-dashoffset", n.toString()), e.setAttribute("transform", `rotate(-90 ${this.size / 2} ${this.size / 2})`), e.style.transition = "stroke-dashoffset 0.1s linear", e;
  }
  createTextElement() {
    const e = document.createElementNS("http://www.w3.org/2000/svg", "text");
    return e.setAttribute("x", "50%"), e.setAttribute("y", "50%"), e.setAttribute("text-anchor", "middle"), e.setAttribute("dominant-baseline", "central"), e.setAttribute("fill", this.options.barColor), e.setAttribute("font-family", "Helvetica, Arial, sans-serif"), e.setAttribute("font-size", (this.size * 0.4).toString()), e.setAttribute("font-weight", "normal"), e.style.userSelect = "none", e.textContent = "0", e;
  }
  updateProgress() {
    const e = this.size / 2 - 4, t = 2 * Math.PI * e;
    let n;
    if (this.mode === "countdown") {
      const o = Math.max(0, this.duration - this.currentTime);
      if (n = o / this.duration, this.textElement) {
        const r = Math.round(o / 1e3);
        this.textElement.textContent = r.toString();
      }
    } else
      n = 1 - this.currentTime / this.duration;
    const i = t * (1 - n);
    this.progressCircle.setAttribute("stroke-dashoffset", i.toString());
  }
  show() {
    this.isVisible = !0, this.container.style.opacity = "1";
  }
  hide() {
    this.isVisible = !1, this.container.style.opacity = "0";
  }
  setCurrentTime(e) {
    this.currentTime = e, this.updateProgress();
  }
  setDuration(e) {
    this.duration = e, this.mode === "kinetic" && (this.duration = 0.95 * e), this.updateProgress();
  }
  begin() {
    this.interval || (this.isPaused = !1, this.intervalValue = Math.floor(this.currentTime / 100), this.interval = window.setInterval(() => {
      if (!this.isPaused) {
        const e = this.intervalValue++ * 100;
        e < this.duration ? this.setCurrentTime(e) : this.stop();
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
  syncWithVideo(e) {
    const t = e * 1e3;
    Math.abs(t - this.currentTime) > 1e3 && (this.intervalValue = Math.floor(t / 100), this.setCurrentTime(t));
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
const be = {
  enabled: !1,
  mode: "countdown",
  size: "normal",
  barColor: "#fff",
  bgColor: "rgba(0, 0, 0, 0.2)",
  autoSync: !0
};
function we(s) {
  return {
    ...be,
    ...s
  };
}
const ye = "#fff", Ce = "drop-shadow(0px 2px 2px rgba(0,0,0,0.85))", xe = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75" width="28" height="28" aria-hidden="true" focusable="false">
  <path d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z"
        fill="currentColor" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  <path d="M48,27.6a19.5,19.5 0 0 1 0,21.4
           M55.1,20.5a30,30 0 0 1 0,35.6
           M61.6,14a38.8,38.8 0 0 1 0,48.6"
        fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
</svg>
`.trim(), Se = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75" width="28" height="28" aria-hidden="true" focusable="false">
  <path d="m39,14-17,15H6V48H22l17,15z" fill="currentColor" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  <path d="m49,26 20,24m0-24-20,24" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
</svg>
`.trim(), y = class y {
  constructor(e, t, n, i, o) {
    this.scope = e, this.actionCtx = n, this.unitRef = o, this.status = "unstarted", this.state = {
      hasVideoPlayed: !1,
      hasVideoCompleted: !1
    }, this.lastClickAt = 0, this.suppressNextPausePlayButton = !1, y.instanceCount++, this.log = i.enter("VideoController#" + y.instanceCount), this.log.debug("constructor starting...", { hasActionCtx: !!n }), this.options = oe(t), this.log.debug("Options initialized:", this.options), this.scope = e || screen, this.elementManager = new se(this.scope, this.options, this.log, this.actionCtx), this.safeframeHandler = new ce(this.log), this.viewportObserver = new ae(
      this.elementManager,
      this.options,
      (r) => this.handleViewportChange(r),
      this.log,
      this.scope
    ), this.playbackController = new le(
      this.scope,
      this.elementManager,
      this.options,
      this.safeframeHandler,
      this.actionCtx,
      (r, a) => this.setStatus(r, a),
      this.log,
      this
    ), this.eventHandlers = new ge(
      this.scope,
      this.elementManager,
      this.options,
      this.actionCtx,
      (r, a) => this.setStatus(r, a),
      this.state,
      this.log
    ), this.quartileTracker = new fe(
      this.elementManager,
      this.options,
      this.actionCtx,
      this.log
    ), this.instructionScene = new me(
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
  static isValidScreen(e) {
    return !!(e && typeof e.find == "function");
  }
  static resolveScreen(e, t) {
    if (y.isValidScreen(t))
      return t;
    if (typeof e?.getScreen == "function") {
      const n = e.getScreen();
      if (y.isValidScreen(n))
        return n;
    }
    try {
      if (typeof screen < "u" && y.isValidScreen(screen))
        return screen;
    } catch (n) {
      A.enter("VideoController").enter("setup").debug("Unable to access global 'screen' variable", n);
    }
    return t;
  }
  static resolveUnit(e, t, n) {
    if (t)
      return t;
    if (typeof e?.getUnit == "function")
      return e.getUnit();
    if (typeof n?.getUnit == "function")
      return n.getUnit();
    try {
      if (typeof unit < "u")
        return unit;
    } catch (i) {
      A.enter("VideoController").enter("setup").debug("Unable to access global 'unit' variable", i);
    }
    throw new U("unit not found in global scope");
  }
  /**
   * Automatically sets up the Video Controller by scanning the environment for Celtra globals.
   * Recommended for external loading scenarios.
   *
   * @param options Will be completed by defaults.
   */
  static setup(e) {
    A.enter("VideoController").enter("setup").debug("setup() called", e);
    const n = globalThis.window;
    if (!n)
      throw new U("window not found");
    const i = e.creative || n.creative, o = y.resolveScreen(i, e.screen || n.screen);
    if (!y.isValidScreen(o))
      throw new U(`Invalid screen ref: ${o}`);
    const r = y.resolveUnit(i, e.unit || n.unit, o), a = new ActionContext(o, {
      certainlyNotCausedByUserBehavior: !1,
      consideredUserInitiatedByBrowser: !1
    }), c = A.enter("VideoControllerInit"), d = new y(o, e, a, c, r);
    o.mbkVidController = d;
    const h = () => {
      d.init(), d.playAfterScene();
    };
    return r.hasAppearedAtLeastOnce ? h() : r.once("appeared", h), d;
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
  set hasVideoPlayed(e) {
    this.log.debug(`set hasVideoPlayed = ${e}`), this.state.hasVideoPlayed = e;
  }
  get hasVideoCompleted() {
    return this.state.hasVideoCompleted;
  }
  set hasVideoCompleted(e) {
    this.log.debug(`set hasVideoCompleted = ${e}`), this.state.hasVideoCompleted = e;
  }
  get isInViewport() {
    return this.viewportObserver.inViewport;
  }
  set isInViewport(e) {
    this.viewportObserver.isInViewport = e;
  }
  get visibilityObserver() {
    return this.viewportObserver.visibilityObserver;
  }
  // Expose modular methods for backward compatibility and testing
  hasBoolOption(e) {
    return V(this.options, e);
  }
  getScreenObject(e) {
    return this.elementManager.getScreenObject(e);
  }
  hasScreenObject(e) {
    return this.elementManager.hasScreenObject(e);
  }
  get celtraVideo() {
    return this.elementManager.celtraVideo;
  }
  get videoElement() {
    if (!this._videoElement)
      throw new U("Expected <video> element");
    return this._videoElement;
  }
  onPlaying() {
    if (this.log.debug("onPlaying()"), this.eventHandlers.onPlaying(this.isUserGesture()), this.celtraVideo.autoplay && this.options.scriptedPlay === !0 && !this.viewportObserver.inViewport && (this.options.scriptedPlay = "playing", this.scriptedPause()), this.videoCountdown) {
      const t = this.scope;
      !this.videoCountdown.isCounting && this.hasVideoPlayed ? t.beginCountdown?.() : this.videoCountdown.paused && t.unpauseCountdown?.();
    }
  }
  pause(e = noop) {
    this.log.debug("pause()"), this.celtraVideo.pauseAction(this.actionCtx, {}, e);
  }
  scriptedPause() {
    this.log.debug("scriptedPause()"), this.suppressPlayButtonOnNextPause(), this.elementManager.hidePlayButton(), this.pause(() => {
      this.playWhenAppearing();
    });
  }
  /** Whether a genuine tap on the video happened recently enough to have caused what is happening. */
  isUserGesture() {
    return Date.now() - this.lastClickAt < y.USER_CLICK_WINDOW_MS;
  }
  onPause() {
    this.log.debug("onPause()");
    const e = this.isUserGesture() && !this.suppressNextPausePlayButton;
    this.suppressNextPausePlayButton = !1, this.eventHandlers.onPause(e), this.videoCountdown && this.scope.pauseCountdown?.();
  }
  onTimeUpdate(e) {
    this.log.debug("onTimeUpdate()"), this.videoCountdown && this.options.videoCountdown?.autoSync && this.videoCountdown?.syncWithVideo(e);
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
  logger(e) {
    this.eventHandlers.logger(e);
  }
  setupInstructionScenePlayback(e) {
    this.instructionScene.setupInstructionScenePlayback(e);
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
  set safeframeUtil(e) {
    this.safeframeHandler.safeframeUtil = e;
  }
  /**
   * Initializes the video controller and sets up all necessary event listeners
   */
  init() {
    this.log.debug("init() called"), this.setStatus("init"), this.elementManager.hidePlayButton(), typeof document < "u" && document.addEventListener("click", (e) => {
      let t = null;
      try {
        t = this.celtraVideo?.getNode?.();
      } catch {
        t = null;
      }
      const n = e.target, i = t?.getBoundingClientRect?.(), { clientX: o, clientY: r } = e, a = !!i && o >= i.left && o <= i.right && r >= i.top && r <= i.bottom, c = !!(t && n && t.contains(n));
      (a || c) && (this.lastClickAt = Date.now());
    }, !0), this.options.loopVideo && this.setIndefinitePlay(), this.log.debug("Celtra video is ", this.celtraVideo), this.options.debug && this.log.debug(this.options), this.options.loadSpinner || this.removeSpinner(), this.setupEventListeners(), this.setupViewportObserver(), this.hideNativeControls();
  }
  /**
   * Sets the status of the video controller and logs it if debug is enabled
   */
  setStatus(e, t = "status") {
    Q(this.options, t) && (this.options[t] = e), this.options.debug && this.log.debug(`${t}: ${e}`);
  }
  /**
   * Handles video pausing/resuming based on viewport visibility
   */
  handleViewportChange(e) {
    this.log.debug("Handling viewport change:", {
      isInViewport: e,
      hasVideoPlayed: this.hasVideoPlayed,
      hasVideoCompleted: this.hasVideoCompleted,
      currentStatus: this.status
    }), !e && !this.hasVideoCompleted ? (this.log.debug("Pausing video - out of viewport and not completed first play"), this.scriptedPause()) : e ? e && !this.hasVideoCompleted && (this.hasVideoPlayed || this.celtraVideo.autoplay && this.options.scriptedPlay === "playing") ? (this.log.debug("Resuming video - back in viewport and not completed first play"), this.elementManager.hidePlayButton(), this.celtraVideo.playAction(this.actionCtx, {}, noop)) : this.hasVideoPlayed ? this.log.debug("Not playing video - in viewport but video has completed") : this.log.debug("Not playing video - in viewport but video has not started") : this.log.debug("Not pausing video - out of viewport but video has completed");
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
      throw new U("IntersectionObserver not available, cannot wait for video viewport appearance");
    this.log.debug("Waiting for video to appear in viewport...");
    const e = new IntersectionObserver((t) => {
      t.some((i) => i.isIntersecting) && (e.disconnect(), this.log.debug("Video appeared in viewport, playing..."), this.playIfAllowed());
    }, {
      threshold: 0.1
    });
    e.observe(this.videoElement);
  }
  suppressPlayButtonOnNextPause() {
    this.suppressNextPausePlayButton = !0;
  }
  listenEventsFrom(e) {
    e.addEventListener("volumechange", () => {
      e.muted ? this.onMute() : this.onUnmute(), this.updateSoundDomIcon(e.muted);
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
  mountSoundDomUI(e) {
    if (!V(this.options, "soundControl"))
      return;
    const t = document.getElementById("btn-sound");
    t && (this.soundDomHost = t, t.style.cursor = "pointer", t.style.display = "flex", t.style.alignItems = "center", t.style.justifyContent = "center", t.style.userSelect = "none", t.style.setProperty("-webkit-user-select", "none"), t.style.color = ye, t.style.filter = Ce, this.soundDomClickHandler && t.removeEventListener("click", this.soundDomClickHandler), this.soundDomClickHandler = () => {
      this.toggleSound();
    }, t.addEventListener("click", this.soundDomClickHandler), this.updateSoundDomIcon(typeof e?.muted == "boolean" ? e.muted : !0), this.options.debug && this.log.debug("Mounted sound DOM UI on #btn-sound", { muted: e?.muted }));
  }
  updateSoundDomIcon(e) {
    this.soundDomHost && (this.soundDomHost.innerHTML = e ? Se : xe);
  }
  /**
   * Initializes the video countdown component
   */
  initializeCountdown() {
    if (this.log.debug("initializeCountdown called", { hasCountdownConfig: !!this.options.videoCountdown }), !this.options.videoCountdown)
      return;
    const e = this.elementManager.getScreenObject(this.options.video);
    if (!e) {
      this.log.error("Cannot initialize countdown: video not found");
      return;
    }
    const t = Math.round(e.getDuration()) * 1e3, n = we(this.options.videoCountdown);
    this.log.debug("Countdown config:", { duration: t, countdownOptions: n });
    let i = document.getElementById("countdown-placeholder");
    if (i ? this.log.debug("Found countdown-placeholder, using it") : (this.log.debug("countdown-placeholder not found, using video parent"), i = e.getNode()?.parentElement || this.scope.getNode()), this.log.debug("Parent container:", i, i?.tagName, i?.id), !i)
      throw new U("Countdown parent container not found");
    this.videoCountdown = new ve(i, t, n), this.log.debug("VideoCountdown instance created", this.videoCountdown), this.videoCountdown.show(), this.log.debug("VideoCountdown.show() called"), this.attachCountdownMethods(), this.options.debug && this.log.debug("Video countdown initialized successfully", {
      duration: t,
      options: n,
      countdownElement: this.videoCountdown
    });
  }
  /**
   * Attaches countdown helper methods to the screen object
   */
  attachCountdownMethods() {
    const e = this.scope;
    e.beginCountdown = () => {
      this.videoCountdown && !this.videoCountdown.isCounting && (this.videoCountdown.begin(), this.options.debug && this.log.debug("Countdown started"));
    }, e.pauseCountdown = () => {
      this.videoCountdown && (this.videoCountdown.pause(), this.options.debug && this.log.debug("Countdown paused"));
    }, e.unpauseCountdown = () => {
      this.videoCountdown && (this.videoCountdown.unpause(), this.options.debug && this.log.debug("Countdown unpaused"));
    }, e.resetCountdown = () => {
      this.videoCountdown && (this.videoCountdown.reset(), this.options.debug && this.log.debug("Countdown reset"));
    };
  }
  logVideoDomState(e) {
    let t = null;
    try {
      t = this.celtraVideo?.getNode?.();
    } catch {
      t = null;
    }
    this.log.log(`*** [${e}] video DOM state`, {
      cachedConnected: this._videoElement?.isConnected ?? !1,
      cachedInDocument: this._videoElement ? document.contains(this._videoElement) : !1,
      liveContainer: l.describeContainer(t)
    });
  }
  setupEventListeners() {
    const e = this.options.video;
    this.log.debug("Setting up listeners for:", e);
    const t = this.celtraVideo;
    t.on("playing", () => {
      this.logVideoDomState("playing"), this.onPlaying();
    }), t.on("pause", (i) => {
      this.logVideoDomState("pause");
      const o = t.getDuration();
      if ((typeof i == "number" ? i >= o : (this._videoElement?.ended ?? !1) || t.getCurrentTime() >= o) || this.hasVideoCompleted) {
        this.onEnded();
        return;
      }
      this.onPause();
    }), t.on("timeupdate", (i) => {
      this.onTimeUpdate(i);
    }), this.mountSoundDomUI(t);
    const n = t.getNode();
    this.log.log("*** [eventListeners] container before wait", l.describeContainer(n)), l.expectIntoWhenAppeared(this.scope, n, {
      onWaiting: () => {
        this.log.debug("Video element not found for event listeners, waiting for it to be inserted");
      }
    }).then((i) => {
      this._videoElement = i, this.log.log("*** [eventListeners] Found video element", {
        containerId: n.id || "(no id)",
        videoConnected: i.isConnected
      }), this.quartileTracker.setupQuartileListeners(), this.listenEventsFrom(i), (!this.hasInstructionScene() || this.options.scriptedPlay) && this.scriptedPause();
    }).catch((i) => {
      this.log.error(i);
    });
  }
};
y.instanceCount = 0, y.USER_CLICK_WINDOW_MS = 700;
let q = y;
function _(s = {}) {
  const {
    win: e = typeof window < "u" ? window : globalThis,
    pollInterval: t = 25,
    timeout: n = 8e3,
    debug: i = !1
  } = s, o = ["creative", "screen", "unit"], r = {
    creative: (u) => u != null,
    screen: (u) => u != null,
    unit: (u) => u != null
  }, a = Date.now(), c = (...u) => i && console.log("[waitForCeltraGlobals]", ...u), d = () => Date.now(), h = () => d() - a;
  function C() {
    return {
      creative: b(e, "creative"),
      screen: b(e, "screen"),
      unit: b(e, "unit")
    };
  }
  function b(u, k) {
    try {
      return u[k];
    } catch {
      return;
    }
  }
  function S(u) {
    return o.every((k) => {
      const E = u[k];
      return (r[k] || ((g) => g != null))(E);
    });
  }
  function I(u) {
    const k = {}, E = {};
    return o.forEach((w) => {
      const g = Object.getOwnPropertyDescriptor(e, w);
      if (E[w] = g, g && g.configurable === !1) {
        c(`Cannot intercept "${w}" (non-configurable).`);
        return;
      }
      let P = g && "value" in g ? g.value : b(e, w);
      try {
        Object.defineProperty(e, w, {
          configurable: !0,
          enumerable: !0,
          get() {
            return P;
          },
          set(M) {
            P = M, c(`Intercepted assignment to "${w}"`, M), u();
          }
        }), k[w] = !0;
      } catch (M) {
        c(`Failed to intercept "${w}"`, M);
      }
    }), function() {
      Object.keys(k).forEach((g) => {
        try {
          const P = E[g];
          P ? Object.defineProperty(e, g, P) : delete e[g];
        } catch (P) {
          c(`Failed to restore "${g}"`, P);
        }
      });
    };
  }
  return new Promise((u, k) => {
    let E = !1, w = null, g = null, P = null;
    function M(T, B) {
      E || (E = !0, w && clearInterval(w), g && clearTimeout(g), P && P(), T ? u(B) : k(B));
    }
    function L(T) {
      if (E)
        return;
      const B = C();
      if (S(B)) {
        const ee = {
          creative: B.creative,
          screen: B.screen,
          unit: B.unit,
          meta: {
            trigger: T,
            elapsedMs: h(),
            windowPath: "current"
          }
        };
        M(!0, ee);
      }
    }
    L("immediate"), !E && (P = I(() => L("intercept")), L("post-intercept"), !E && (w = setInterval(() => L("poll"), t), g = setTimeout(() => {
      const T = C();
      M(!1, {
        error: new Error(
          `Timed out after ${n}ms waiting for Celtra globals: ${o.join(", ")}`
        ),
        found: T,
        meta: {
          elapsedMs: h(),
          windowPath: "current"
        }
      });
    }, n)));
  });
}
function Ie(s = {}) {
  const {
    win: e = typeof window < "u" ? window : globalThis,
    includeTop: t = !0,
    maxDepth: n = 3,
    debug: i = !1
  } = s, o = (...d) => i && console.log("[waitForCeltraGlobalsAnyWindow]", ...d);
  function r(d, h, C) {
    if (h < 0)
      return;
    let b;
    try {
      b = Array.from(d.frames || []);
    } catch {
      return;
    }
    for (let S = 0; S < b.length; S++) {
      const I = b[S];
      try {
        I.location.href, C.push(I), r(I, h - 1, C);
      } catch {
      }
    }
  }
  const a = [];
  t && a.push(e), r(e, n, a), o("Candidate windows:", a.length);
  const c = a.map(
    (d) => _({ ...s, win: d }).then((h) => ({
      ...h,
      meta: {
        ...h.meta,
        windowPath: d === e ? "current" : "iframe(same-origin)"
      }
    }))
  );
  return typeof Promise.any == "function" ? Promise.any(c) : new Promise((d, h) => {
    const C = [];
    let b = !1;
    c.forEach((S, I) => {
      S.then((u) => {
        b || (b = !0, d(u));
      }).catch((u) => {
        C[I] = u, C.length === c.length && !b && (b = !0, h(
          new AggregateError(
            C,
            `All ${c.length} windows failed to provide Celtra globals`
          )
        ));
      });
    });
  });
}
const Ee = A.enter("VideoControllerInit"), p = A.enter("VideoIndex");
function Pe(s, e, t = {}, n) {
  p.debug("init() starting", { hasUnit: !!s, hasScreen: !!e, hasCtx: !!n });
  let i = n;
  if (!i && typeof ActionContext < "u")
    try {
      i = new ActionContext(e, {
        certainlyNotCausedByUserBehavior: !1,
        consideredUserInitiatedByBrowser: !1
      }), p.debug("ActionContext created successfully");
    } catch (o) {
      p.warn("ActionContext creation failed. Video play actions may fail.", o);
    }
  try {
    const o = new q(e, t, i, Ee, s);
    e.mbkVidController = o, p.debug("VideoController instance created");
    const r = () => {
      p.debug("Starting VideoController initialization..."), o.init(), o.playAfterScene();
    };
    return s?.hasAppearedAtLeastOnce ? (console.log("unit?.hasAppearedAtLeastOnce******"), p.debug("Unit/Screen already appeared, starting immediately"), r()) : typeof s?.once == "function" ? (console.log("unit once******"), p.debug("Waiting for 'appeared' event..."), s.once("appeared", r)) : (console.log("no unit or 'appeared' event, starting immediately******"), p.debug("No unit or 'appeared' event, starting immediately"), r()), o;
  } catch (o) {
    p.error("Critical error during init():", o);
  }
}
const $ = (s) => s && typeof s.find == "function";
function Ve(s, e) {
  if ($(e))
    return e;
  p.debug("Global screen is native or invalid, searching via creative...");
  let t = e;
  if (typeof s?.getScreen == "function" && (t = s.getScreen(), $(t)))
    return t;
  try {
    if (typeof screen < "u" && $(screen))
      return screen;
  } catch (n) {
    p.debug("Unable to access global 'screen' variable", n);
  }
  return t;
}
function ke(s, e, t) {
  if (e)
    return e;
  if (typeof s?.getUnit == "function")
    return s.getUnit();
  if (typeof t?.getUnit == "function")
    return t.getUnit();
  try {
    if (typeof unit < "u")
      return unit;
  } catch (n) {
    p.debug("Unable to access global 'unit' variable", n);
  }
}
function Oe(s = {}) {
  p.debug("setup() called", s);
  const e = globalThis;
  p.debug("Environment snapshot", e, e.creative, e.screen, e.CreativeUnit);
  const t = s.creative || e.creative, n = s.unit || e.unit, i = s.screen || e.screen, o = s.ctx || e.ctx || e.mbkCtx, r = !!(s.creative || s.unit || s.screen);
  r ? p.debug("Using explicitly passed globals (recommended)") : p.debug("Falling back to global scope discovery");
  const a = Ve(t, i), c = ke(t, n, a);
  if (p.debug("Environment check (Window):", {
    creative: !!t,
    unit: !!c,
    screen: $(a),
    ctx: !!o,
    explicitArgs: r
  }), !$(a)) {
    p.error("Video Controller: Could not find a valid Celtra Screen object. Passing globals explicitly in .setup() is recommended.");
    return;
  }
  return Pe(c || a, a, s, o);
}
typeof addCssRule == "function" && addCssRule(".video-player-engine video", "background: none;");
typeof window < "u" && (window.waitForCeltraGlobals = _, window.waitForCeltraGlobalsAnyWindow = Ie);
export {
  q as VideoController,
  ve as VideoCountdown,
  se as VideoElementManager,
  ge as VideoEventHandlers,
  me as VideoInstructionScene,
  le as VideoPlaybackController,
  fe as VideoQuartileTracker,
  ce as VideoSafeFrameHandler,
  ae as VideoViewportObserver,
  ie as defaultVideoControllerOptions,
  be as defaultVideoCountdownOptions,
  V as hasBoolOption,
  Q as hasOption,
  Pe as init,
  we as initializeCountdownOptions,
  oe as initializeOptions,
  Oe as setup,
  _ as waitForCeltraGlobals,
  Ie as waitForCeltraGlobalsAnyWindow
};
