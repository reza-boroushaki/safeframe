/*! Copyright Mobkoi 2026 (v5.5.1) */
class L {
  constructor(t) {
    this.log = t.enter("SafeFrameUtil");
  }
  check() {
    const t = {}, e = typeof window < "u" && window.location && typeof window.location.href == "string" ? window.location.href : "", n = typeof creative < "u" && creative?.adapter && creative.adapter.safeFrameDetected || !1, i = /googlesyndication/i.test(e) || /safeframe/i.test(e);
    if (t.detected = !!(n || i), typeof window < "u")
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
class T {
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
    return this.add(new T(t));
  }
  add(t) {
    return t.parent = this, t;
  }
}
const z = new T("MOBKOI"), P = z.enter("Celtra"), j = P.enter("VideoControllerOptions"), F = {
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
function $(s) {
  j.debug("initializeOptions()", s), j.debug("options.videoCountdown:", s.videoCountdown);
  const t = s.debug ?? (typeof creative < "u" && creative.userParams?.thisDebug === "true"), e = {
    ...F,
    debug: t,
    ...s,
    mbkCustomEvents: s.mbkCustomEvents ? [...s.mbkCustomEvents] : []
  };
  return j.debug("initializeOptions returning:", e), j.debug("result.videoCountdown:", e.videoCountdown), e;
}
function N(s, t) {
  return Object.prototype.hasOwnProperty.call(s, t);
}
function y(s, t) {
  if (N(s, t)) {
    const e = s[t];
    return typeof e == "string" ? e === "true" : e;
  }
  return null;
}
class E extends Error {
  constructor(t, e) {
    super(t), this.cause = e;
  }
}
class H {
  constructor(t, e, n, i) {
    this.scope = t, this.options = e, this.actionCtx = i, this.elements = {}, this.log = n.enter("VideoElementManager");
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
        throw new E(`FAILED to find Celtra video component "${t}"; Check your Celtra component names.`);
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
const G = 1e4;
class _ extends Error {
  constructor(t) {
    super(t), this.name = "VideoElementWaitTimeoutError";
  }
}
class C {
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
      return C.cancellableRejectedPromise(new Error("Cannot wait for video element without a container"));
    const n = C.findInto(t);
    if (n)
      return Object.assign(Promise.resolve(n), { cancel: noop });
    e.onWaiting?.();
    let i, o, r = !0, a = noop;
    const l = () => {
      r = !1, i && (i.disconnect(), i = void 0), o && (clearTimeout(o), o = void 0);
    }, c = new Promise((u, m) => {
      a = () => {
        r && (l(), m(new Error("Video element wait cancelled")));
      };
      const g = () => {
        if (!r)
          return;
        const V = C.findInto(t);
        V && (l(), u(V));
      };
      typeof MutationObserver < "u" && (i = new MutationObserver(g), i.observe(t, { childList: !0, subtree: !0 }));
      const S = e.timeoutMs ?? G;
      o = setTimeout(() => {
        r && (l(), m(new _(`Timed out waiting ${S}ms for <video> element inside #${t.id}`)));
      }, S);
    });
    return Object.assign(c, { cancel: a });
  }
  /**
   * Wait for a Celtra view/page to appear before starting the DOM video wait.
   * This prevents inactive pages from timing out before Celtra inserts their <video>.
   */
  static expectIntoWhenAppeared(t, e, n = {}) {
    if (!t || t.hasAppearedAtLeastOnce)
      return C.expectInto(e, n);
    const i = typeof t.on == "function" ? t.on.bind(t) : typeof t.once == "function" ? t.once.bind(t) : void 0;
    if (!i)
      return C.expectInto(e, n);
    let o = !0, r, a = noop;
    const l = new Promise((c, u) => {
      a = () => {
        o && (o = !1, r?.cancel(), u(new Error("Video element wait cancelled")));
      }, i("appeared", () => {
        o && (r = C.expectInto(e, n), r.then(c).catch(u));
      });
    });
    return Object.assign(l, { cancel: a });
  }
  static cancellableRejectedPromise(t) {
    return Object.assign(Promise.reject(t), { cancel: noop });
  }
}
class R {
  constructor(t, e, n, i, o) {
    this.elementManager = t, this.options = e, this.onViewportChange = n, this.activationView = o, this.isInViewport = !1, this.setupId = 0, this.log = i.enter("VideoViewportObserver");
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
    const n = e.getNode();
    C.expectIntoWhenAppeared(this.activationView, n, {
      onWaiting: () => {
        this.log.warn("Video element not found for viewport observer, waiting for it to be inserted");
      }
    }).then((i) => {
      t === this.setupId && this.setupVisibilityObserver(i);
    }).catch((i) => {
      this.log.error(i);
    });
  }
  setupVisibilityObserver(t) {
    this.visibilityObserver?.disconnect(), this.visibilityObserver = new IntersectionObserver((e) => {
      e.forEach((n) => {
        const i = this.isInViewport;
        this.isInViewport = n.isIntersecting, i !== this.isInViewport && (this.log.debug("Viewport change detected:", this.isInViewport ? "in viewport" : "out of viewport"), this.onViewportChange(this.isInViewport));
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
class q {
  constructor(t) {
    this.log = t.enter("VideoSafeFrameHandler"), this.safeframeUtil = new L(this.log);
  }
  /**
   * Attempts to setup SafeFrame monitoring for video playback
   * @param video - The CeltraVideo object
   * @param actionCtx - Celtra ActionContext
   * @param playSuccessCheck - Callback for play success
   */
  setupSafeFrameMonitoring(t, e, n) {
    const i = this.safeframeUtil.get(), o = i?.ext?.inViewPercentage;
    if (i && typeof o == "function")
      try {
        let r = null;
        this.sfInterval = setInterval(() => {
          o() > 0.05 && r !== "ended" ? t.playAction(e, {}, n) : t.pauseAction(e, {}, n);
        }, 250), ["playing", "ended"].forEach((a) => {
          t.on(a, () => {
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
class K {
  constructor(t, e, n, i, o, r, a, l) {
    this.scope = t, this.elementManager = e, this.options = n, this.safeframeHandler = i, this.actionCtx = o, this.setStatus = r, this.controller = l, this.playSuccessFlag = !1, this.log = a.enter("VideoPlaybackController");
  }
  /**
   * Attempts to play the video if autoplay is allowed
   */
  playIfAllowed() {
    if (this.setStatus("checking autoplay status"), y(
      this.options,
      "clicktoplay"
    ) || creative.userParams?.disableautoplay === "true" || creative.userParams?.disableautoplay === !0) {
      this.setStatus("autoplay disabled");
      const t = this.scope.find(this.options.video);
      t.autoplay && t.pauseAction(this.actionCtx, {}, noop);
      const e = y(this.options, "showPlayBtnOnCtp");
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
    const t = this.controller && typeof this.controller.getScreenObject == "function" ? this.controller.getScreenObject(this.options.video) : this.elementManager.getScreenObject(this.options.video), e = t.getNode(), n = typeof screen < "u" ? screen : this.scope, i = () => {
      this.controller && typeof this.controller.fireChecks == "function" ? this.controller.fireChecks() : this.fireChecks();
    };
    if (!e) {
      this.log.debug("Video node not found for playback checks, waiting for playing event"), t.on("playing", () => this.playCheck());
      return;
    }
    if (!n.hasAppearedAtLeastOnce && typeof n.on == "function") {
      n.on("appeared", () => {
        C.findInto(e) ? i() : this.waitForVideoElement(e, () => i());
      });
      return;
    }
    this.waitForVideoElement(e, i, n);
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
    this.waitForVideoElement(e, (n) => this.setupPlaybackChecks(t, n), this.scope);
  }
  waitForVideoElement(t, e, n) {
    if (this.videoElementWait)
      return;
    const i = C.expectIntoWhenAppeared(n, t, {
      onWaiting: () => {
        this.log.debug("Video element not found for playback checks, waiting for it to be inserted");
      }
    });
    this.videoElementWait = i, i.then((o) => {
      this.videoElementWait = void 0, e(o);
    }).catch((o) => {
      this.videoElementWait = void 0, o instanceof _ && this.log.warn("Video element not found for playback checks before timeout");
    });
  }
  clearVideoElementWait() {
    this.videoElementWait && (this.videoElementWait.cancel(), this.videoElementWait = void 0);
  }
  setupPlaybackChecks(t, e) {
    this.clearVideoElementWait();
    const n = { timeupdate: 0 };
    t.on("timeupdate", () => {
      n.timeupdate++;
    });
    const i = typeof screen < "u" ? screen : this.scope;
    e.addEventListener("canplay", () => {
      this.log.debug("canplay"), this.elementManager.hidePlayButton(), i.unpauseCountdown && i.unpauseCountdown();
    }), e.addEventListener("waiting", () => {
      i.pauseCountdown && i.pauseCountdown();
    }), setTimeout(() => {
      n.timeupdate || (this.elementManager.hasPlayButton() && this.elementManager.playButton.showAction(this.actionCtx, {}, noop), i.pauseCountdown && i.pauseCountdown());
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
class Q {
  constructor(t, e, n, i, o, r, a) {
    this.scope = t, this.elementManager = e, this.options = n, this.actionCtx = i, this.setStatus = o, this.state = r, this.log = a.enter("VideoEventHandlers");
  }
  onPlaying() {
    this.state.hasVideoPlayed = !0, this.state.hasVideoCompleted = !1, this.elementManager.hidePlayButton(), this.elementManager.hasScreenObject("btnReplay") && this.elementManager.replayButton.hideAction(this.actionCtx, {}, noop), y(this.options, "soundControl") && this.elementManager.hasScreenObject("btnSound") && this.elementManager.soundButton.showAction(this.actionCtx, {}, noop), y(this.options, "countdownActive") && this.elementManager.hasScreenObject("countdown") && this.elementManager.countdown.showAction(this.actionCtx, {}, noop), this.setStatus("playing");
  }
  onPause(t) {
    t && this.elementManager.showPlayButton(), this.setStatus("paused");
  }
  onMute() {
    if (y(this.options, "soundControl")) {
      const t = this.elementManager.unmutedButton, e = this.elementManager.mutedButton;
      t && typeof t.hideAction == "function" && t.hideAction(this.actionCtx, {}, noop), e && typeof e.showAction == "function" && e.showAction(this.actionCtx, {}, noop);
    }
    this.setStatus("muted");
  }
  onUnmute() {
    if (y(this.options, "soundControl")) {
      const t = this.elementManager.unmutedButton, e = this.elementManager.mutedButton;
      t && typeof t.showAction == "function" && t.showAction(this.actionCtx, {}, noop), e && typeof e.hideAction == "function" && e.hideAction(this.actionCtx, {}, noop);
    }
    this.setStatus("unmuted");
  }
  onEnded() {
    this.state.hasVideoCompleted = !0, this.elementManager.hasScreenObject("btnReplay") && this.elementManager.replayButton.showAction(this.actionCtx, {}, noop), y(this.options, "showPlayBtnOnEnd") ? this.elementManager.showPlayButton() : this.elementManager.hidePlayButton(), this.elementManager.hasScreenObject("btnSound") && (y(this.options, "showSoundBtnOnEnd") ? this.elementManager.soundButton.showAction(this.actionCtx, {}, noop) : this.elementManager.soundButton.hideAction(this.actionCtx, {}, noop)), this.elementManager.hasScreenObject("countdown") && (y(this.options, "showCountdownOnEnd") ? this.elementManager.countdown.showAction(this.actionCtx, {}, noop) : this.elementManager.countdown.hideAction(this.actionCtx, {}, noop)), this.setStatus("ended");
  }
  toggleSound() {
    const t = this.scope.find(String(this.options.video));
    t.muted ? (this.options.debug && this.log.debug("Unmuting video"), t.unMuteAction(this.actionCtx, {}, noop), this.logger("mbk_video_unmuted")) : (this.options.debug && this.log.debug("Muting video"), t.muteAction(this.actionCtx, {}, noop), this.logger("mbk_video_muted"));
  }
  logger(t) {
    this.options.mbkCustomEvents.indexOf(t) === -1 ? (this.options.debug && this.log.debug(`[Event] - ${t}`), this.options.mbkCustomEvents.push(t), Creative.trackCustomEventAction(this.actionCtx, { name: t }, noop)) : this.options.debug && this.log.debug("event already exist", this.options.mbkCustomEvents);
  }
}
class J {
  constructor(t, e, n, i) {
    this.elementManager = t, this.options = e, this.actionCtx = n, this.quartileEventMap = {
      videoStart: "video_start",
      videoFirstQuartile: "video_p25",
      videoMidpoint: "video_p50",
      videoThirdQuartile: "video_p75",
      videoComplete: "video_complete"
    }, this.log = i.enter("VideoQuartileTracker"), this.quartileEvents = this.createQuartileEvents();
  }
  createQuartileEvents() {
    const t = {};
    return Object.values(this.quartileEventMap).forEach((e) => {
      t[e] = !1;
    }), t;
  }
  setupQuartileListeners() {
    const t = this.elementManager.getScreenObject(this.options.video);
    if (!t?._player) {
      this.log.warn("Video player not found for quartile tracking");
      return;
    }
    const e = document.createElement("div");
    document.body.appendChild(e), Object.keys(this.quartileEventMap).forEach((n) => {
      const i = this.quartileEventMap[n];
      t._player.on(n, () => {
        if (!this.quartileEvents[i])
          if (this.log.debug(`Tracking: ${i}`), this.quartileEvents[i] = !0, typeof Creative < "u" && Creative.trackCustomEventAction && Creative.trackCustomEventAction(this.actionCtx, { name: i }, noop), this.options.tagservice) {
            const o = new Image();
            o.src = this.buildTrackingUrl(i), e.appendChild(o);
          } else
            this.postToParent(i);
      });
    });
  }
  buildTrackingUrl(t) {
    return creative.runtimeParams.externalVideoTrackerURI.replace("{{event}}", t);
  }
  postToParent(t) {
    const e = (l) => typeof l == "string" && l.length > 0 && l !== "null" ? l : void 0, n = globalThis.location, i = e(n?.origin), o = e(n?.href), r = o ? e(new URL(o).origin) : void 0, a = this.options.postMessageTargetOrigin ?? i ?? r ?? "*";
    globalThis.parent.parent.postMessage({ type: "TRACKING_EVENT", event: t }, a);
  }
}
class X {
  constructor(t, e, n, i, o, r, a) {
    this.elementManager = t, this.options = e, this.actionCtx = n, this.onSceneEnd = i, this.controller = r, this.unit = a, this.log = o.enter("VideoInstructionScene");
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
const A = P.enter("VideoCountdown");
class Y {
  constructor(t, e, n) {
    this.parentElement = t, this.options = n, this.currentTime = 0, this.isVisible = !1, this.isPaused = !1, this.interval = null, this.intervalValue = 0, A.debug("Constructor called", {
      parentElement: t,
      duration: e,
      options: n,
      parentTag: t?.tagName
    }), this.duration = e, this.mode = n.mode, this.size = this.getSizeInPixels(n.size), this.mode === "kinetic" && (this.duration = 0.95 * this.duration), this.container = this.createContainer(), A.debug("Container created", this.container), this.svg = this.createSVG(), A.debug("SVG created", this.svg), this.progressCircle = this.createProgressCircle(), this.textElement = this.createTextElement(), this.svg.appendChild(this.createBackgroundCircle()), this.svg.appendChild(this.progressCircle), this.mode === "countdown" && (this.svg.appendChild(this.textElement), A.debug("Text element added")), this.container.appendChild(this.svg), A.debug("SVG appended to container"), this.parentElement.appendChild(this.container), A.debug("Container appended to parent. Parent children:", this.parentElement.children.length), this.updateProgress(), A.debug("Progress updated. Container in DOM:", document.contains(this.container));
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
    const t = document.createElementNS("http://www.w3.org/2000/svg", "circle"), e = this.size / 2 - 4, n = 2 * Math.PI * e;
    return t.setAttribute("cx", (this.size / 2).toString()), t.setAttribute("cy", (this.size / 2).toString()), t.setAttribute("r", e.toString()), t.setAttribute("fill", "none"), t.setAttribute("stroke", this.options.barColor), t.setAttribute("stroke-width", "2"), t.setAttribute("stroke-linecap", "round"), t.setAttribute("stroke-dasharray", n.toString()), t.setAttribute("stroke-dashoffset", n.toString()), t.setAttribute("transform", `rotate(-90 ${this.size / 2} ${this.size / 2})`), t.style.transition = "stroke-dashoffset 0.1s linear", t;
  }
  createTextElement() {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    return t.setAttribute("x", "50%"), t.setAttribute("y", "50%"), t.setAttribute("text-anchor", "middle"), t.setAttribute("dominant-baseline", "central"), t.setAttribute("fill", this.options.barColor), t.setAttribute("font-family", "Helvetica, Arial, sans-serif"), t.setAttribute("font-size", (this.size * 0.4).toString()), t.setAttribute("font-weight", "normal"), t.style.userSelect = "none", t.textContent = "0", t;
  }
  updateProgress() {
    const t = this.size / 2 - 4, e = 2 * Math.PI * t;
    let n;
    if (this.mode === "countdown") {
      const o = Math.max(0, this.duration - this.currentTime);
      if (n = o / this.duration, this.textElement) {
        const r = Math.round(o / 1e3);
        this.textElement.textContent = r.toString();
      }
    } else
      n = 1 - this.currentTime / this.duration;
    const i = e * (1 - n);
    this.progressCircle.setAttribute("stroke-dashoffset", i.toString());
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
const Z = {
  enabled: !1,
  mode: "countdown",
  size: "normal",
  barColor: "#fff",
  bgColor: "rgba(0, 0, 0, 0.2)",
  autoSync: !0
};
function tt(s) {
  return {
    ...Z,
    ...s
  };
}
const et = "#fff", nt = "drop-shadow(0px 2px 2px rgba(0,0,0,0.85))", it = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75" width="28" height="28" aria-hidden="true" focusable="false">
  <path d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z"
        fill="currentColor" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  <path d="M48,27.6a19.5,19.5 0 0 1 0,21.4
           M55.1,20.5a30,30 0 0 1 0,35.6
           M61.6,14a38.8,38.8 0 0 1 0,48.6"
        fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
</svg>
`.trim(), ot = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75" width="28" height="28" aria-hidden="true" focusable="false">
  <path d="m39,14-17,15H6V48H22l17,15z" fill="currentColor" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  <path d="m49,26 20,24m0-24-20,24" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
</svg>
`.trim(), b = class b {
  constructor(t, e, n, i, o) {
    this.scope = t, this.actionCtx = n, this.unitRef = o, this.status = "unstarted", this.state = {
      hasVideoPlayed: !1,
      hasVideoCompleted: !1
    }, this.lastClickAt = 0, this.suppressNextPausePlayButton = !1, b.instanceCount++, this.log = i.enter("VideoController#" + b.instanceCount), this.log.debug("constructor starting...", { hasActionCtx: !!n }), this.options = $(e), this.log.debug("Options initialized:", this.options), this.scope = t || screen, this.elementManager = new H(this.scope, this.options, this.log, this.actionCtx), this.safeframeHandler = new q(this.log), this.viewportObserver = new R(
      this.elementManager,
      this.options,
      (r) => this.handleViewportChange(r),
      this.log,
      this.scope
    ), this.playbackController = new K(
      this.scope,
      this.elementManager,
      this.options,
      this.safeframeHandler,
      this.actionCtx,
      (r, a) => this.setStatus(r, a),
      this.log,
      this
    ), this.eventHandlers = new Q(
      this.scope,
      this.elementManager,
      this.options,
      this.actionCtx,
      (r, a) => this.setStatus(r, a),
      this.state,
      this.log
    ), this.quartileTracker = new J(
      this.elementManager,
      this.options,
      this.actionCtx,
      this.log
    ), this.instructionScene = new X(
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
    if (b.isValidScreen(e))
      return e;
    if (typeof t?.getScreen == "function") {
      const n = t.getScreen();
      if (b.isValidScreen(n))
        return n;
    }
    try {
      if (typeof screen < "u" && b.isValidScreen(screen))
        return screen;
    } catch (n) {
      P.enter("VideoController").enter("setup").debug("Unable to access global 'screen' variable", n);
    }
    return e;
  }
  static resolveUnit(t, e, n) {
    if (e)
      return e;
    if (typeof t?.getUnit == "function")
      return t.getUnit();
    if (typeof n?.getUnit == "function")
      return n.getUnit();
    try {
      if (typeof unit < "u")
        return unit;
    } catch (i) {
      P.enter("VideoController").enter("setup").debug("Unable to access global 'unit' variable", i);
    }
    throw new E("unit not found in global scope");
  }
  /**
   * Automatically sets up the Video Controller by scanning the environment for Celtra globals.
   * Recommended for external loading scenarios.
   *
   * @param options Will be completed by defaults.
   */
  static setup(t) {
    P.enter("VideoController").enter("setup").debug("setup() called", t);
    const n = globalThis.window;
    if (!n)
      throw new E("window not found");
    const i = t.creative || n.creative, o = b.resolveScreen(i, t.screen || n.screen);
    if (!b.isValidScreen(o))
      throw new E(`Invalid screen ref: ${o}`);
    const r = b.resolveUnit(i, t.unit || n.unit, o), a = new ActionContext(o, {
      certainlyNotCausedByUserBehavior: !1,
      consideredUserInitiatedByBrowser: !1
    }), l = P.enter("VideoControllerInit"), c = new b(o, t, a, l, r);
    o.mbkVidController = c;
    const u = () => {
      c.init(), c.playAfterScene();
    };
    return r.hasAppearedAtLeastOnce ? u() : r.once("appeared", u), c;
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
    return y(this.options, t);
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
      throw new E("Expected <video> element");
    return this._videoElement;
  }
  onPlaying() {
    if (this.log.debug("onPlaying()"), this.eventHandlers.onPlaying(), this.celtraVideo.autoplay && this.options.scriptedPlay === !0 && !this.viewportObserver.inViewport && (this.options.scriptedPlay = "playing", this.scriptedPause()), this.videoCountdown) {
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
  onPause() {
    this.log.debug("onPause()");
    const e = Date.now() - this.lastClickAt < b.USER_CLICK_WINDOW_MS && !this.suppressNextPausePlayButton;
    this.suppressNextPausePlayButton = !1, this.eventHandlers.onPause(e), this.videoCountdown && this.scope.pauseCountdown?.();
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
      const n = t.target, i = e?.getBoundingClientRect?.(), { clientX: o, clientY: r } = t, a = !!i && o >= i.left && o <= i.right && r >= i.top && r <= i.bottom, l = !!(e && n && e.contains(n));
      (a || l) && (this.lastClickAt = Date.now());
    }, !0), this.options.loopVideo && this.setIndefinitePlay(), this.log.debug("Celtra video is ", this.celtraVideo), this.options.debug && this.log.debug(this.options), this.options.loadSpinner || this.removeSpinner(), this.setupEventListeners(), this.setupViewportObserver(), this.hideNativeControls();
  }
  /**
   * Sets the status of the video controller and logs it if debug is enabled
   */
  setStatus(t, e = "status") {
    N(this.options, e) && (this.options[e] = t), this.options.debug && this.log.debug(`${e}: ${t}`);
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
      throw new E("IntersectionObserver not available, cannot wait for video viewport appearance");
    this.log.debug("Waiting for video to appear in viewport...");
    const t = new IntersectionObserver((e) => {
      e.some((i) => i.isIntersecting) && (t.disconnect(), this.log.debug("Video appeared in viewport, playing..."), this.playIfAllowed());
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
    if (!y(this.options, "soundControl"))
      return;
    const e = document.getElementById("btn-sound");
    e && (this.soundDomHost = e, e.style.cursor = "pointer", e.style.display = "flex", e.style.alignItems = "center", e.style.justifyContent = "center", e.style.userSelect = "none", e.style.setProperty("-webkit-user-select", "none"), e.style.color = et, e.style.filter = nt, this.soundDomClickHandler && e.removeEventListener("click", this.soundDomClickHandler), this.soundDomClickHandler = () => {
      this.toggleSound();
    }, e.addEventListener("click", this.soundDomClickHandler), this.updateSoundDomIcon(typeof t?.muted == "boolean" ? t.muted : !0), this.options.debug && this.log.debug("Mounted sound DOM UI on #btn-sound", { muted: t?.muted }));
  }
  updateSoundDomIcon(t) {
    this.soundDomHost && (this.soundDomHost.innerHTML = t ? ot : it);
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
    const e = Math.round(t.getDuration()) * 1e3, n = tt(this.options.videoCountdown);
    this.log.debug("Countdown config:", { duration: e, countdownOptions: n });
    let i = document.getElementById("countdown-placeholder");
    if (i ? this.log.debug("Found countdown-placeholder, using it") : (this.log.debug("countdown-placeholder not found, using video parent"), i = t.getNode()?.parentElement || this.scope.getNode()), this.log.debug("Parent container:", i, i?.tagName, i?.id), !i)
      throw new E("Countdown parent container not found");
    this.videoCountdown = new Y(i, e, n), this.log.debug("VideoCountdown instance created", this.videoCountdown), this.videoCountdown.show(), this.log.debug("VideoCountdown.show() called"), this.attachCountdownMethods(), this.options.debug && this.log.debug("Video countdown initialized successfully", {
      duration: e,
      options: n,
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
    }), e.on("pause", (i) => {
      const o = e.getDuration();
      if ((typeof i == "number" ? i >= o : (this._videoElement?.ended ?? !1) || e.getCurrentTime() >= o) || this.hasVideoCompleted) {
        this.onEnded();
        return;
      }
      this.onPause();
    }), e.on("timeupdate", (i) => {
      this.onTimeUpdate(i);
    }), this.mountSoundDomUI(e);
    const n = e.getNode();
    C.expectIntoWhenAppeared(this.scope, n, {
      onWaiting: () => {
        this.log.debug("Video element not found for event listeners, waiting for it to be inserted");
      }
    }).then((i) => {
      this._videoElement = i, this.log.debug(`Found video element in #${n.id}`), this.quartileTracker.setupQuartileListeners(), this.listenEventsFrom(i), (!this.hasInstructionScene() || this.options.scriptedPlay) && this.scriptedPause();
    }).catch((i) => {
      this.log.error(i);
    });
  }
};
b.instanceCount = 0, b.USER_CLICK_WINDOW_MS = 700;
let U = b;
function W(s = {}) {
  const {
    win: t = typeof window < "u" ? window : globalThis,
    pollInterval: e = 25,
    timeout: n = 8e3,
    debug: i = !1
  } = s, o = ["creative", "screen", "unit"], r = {
    creative: (d) => d != null,
    screen: (d) => d != null,
    unit: (d) => d != null
  }, a = Date.now(), l = (...d) => i && console.log("[waitForCeltraGlobals]", ...d), c = () => Date.now(), u = () => c() - a;
  function m() {
    return {
      creative: g(t, "creative"),
      screen: g(t, "screen"),
      unit: g(t, "unit")
    };
  }
  function g(d, O) {
    try {
      return d[O];
    } catch {
      return;
    }
  }
  function S(d) {
    return o.every((O) => {
      const w = d[O];
      return (r[O] || ((p) => p != null))(w);
    });
  }
  function V(d) {
    const O = {}, w = {};
    return o.forEach((f) => {
      const p = Object.getOwnPropertyDescriptor(t, f);
      if (w[f] = p, p && p.configurable === !1) {
        l(`Cannot intercept "${f}" (non-configurable).`);
        return;
      }
      let v = p && "value" in p ? p.value : g(t, f);
      try {
        Object.defineProperty(t, f, {
          configurable: !0,
          enumerable: !0,
          get() {
            return v;
          },
          set(x) {
            v = x, l(`Intercepted assignment to "${f}"`, x), d();
          }
        }), O[f] = !0;
      } catch (x) {
        l(`Failed to intercept "${f}"`, x);
      }
    }), function() {
      Object.keys(O).forEach((p) => {
        try {
          const v = w[p];
          v ? Object.defineProperty(t, p, v) : delete t[p];
        } catch (v) {
          l(`Failed to restore "${p}"`, v);
        }
      });
    };
  }
  return new Promise((d, O) => {
    let w = !1, f = null, p = null, v = null;
    function x(I, M) {
      w || (w = !0, f && clearInterval(f), p && clearTimeout(p), v && v(), I ? d(M) : O(M));
    }
    function B(I) {
      if (w)
        return;
      const M = m();
      if (S(M)) {
        const D = {
          creative: M.creative,
          screen: M.screen,
          unit: M.unit,
          meta: {
            trigger: I,
            elapsedMs: u(),
            windowPath: "current"
          }
        };
        x(!0, D);
      }
    }
    B("immediate"), !w && (v = V(() => B("intercept")), B("post-intercept"), !w && (f = setInterval(() => B("poll"), e), p = setTimeout(() => {
      const I = m();
      x(!1, {
        error: new Error(
          `Timed out after ${n}ms waiting for Celtra globals: ${o.join(", ")}`
        ),
        found: I,
        meta: {
          elapsedMs: u(),
          windowPath: "current"
        }
      });
    }, n)));
  });
}
function st(s = {}) {
  const {
    win: t = typeof window < "u" ? window : globalThis,
    includeTop: e = !0,
    maxDepth: n = 3,
    debug: i = !1
  } = s, o = (...c) => i && console.log("[waitForCeltraGlobalsAnyWindow]", ...c);
  function r(c, u, m) {
    if (u < 0)
      return;
    let g;
    try {
      g = Array.from(c.frames || []);
    } catch {
      return;
    }
    for (let S = 0; S < g.length; S++) {
      const V = g[S];
      try {
        V.location.href, m.push(V), r(V, u - 1, m);
      } catch {
      }
    }
  }
  const a = [];
  e && a.push(t), r(t, n, a), o("Candidate windows:", a.length);
  const l = a.map(
    (c) => W({ ...s, win: c }).then((u) => ({
      ...u,
      meta: {
        ...u.meta,
        windowPath: c === t ? "current" : "iframe(same-origin)"
      }
    }))
  );
  return typeof Promise.any == "function" ? Promise.any(l) : new Promise((c, u) => {
    const m = [];
    let g = !1;
    l.forEach((S, V) => {
      S.then((d) => {
        g || (g = !0, c(d));
      }).catch((d) => {
        m[V] = d, m.length === l.length && !g && (g = !0, u(
          new AggregateError(
            m,
            `All ${l.length} windows failed to provide Celtra globals`
          )
        ));
      });
    });
  });
}
const rt = P.enter("VideoControllerInit"), h = P.enter("VideoIndex");
function at(s, t, e = {}, n) {
  h.debug("init() starting", { hasUnit: !!s, hasScreen: !!t, hasCtx: !!n });
  let i = n;
  if (!i && typeof ActionContext < "u")
    try {
      i = new ActionContext(t, {
        certainlyNotCausedByUserBehavior: !1,
        consideredUserInitiatedByBrowser: !1
      }), h.debug("ActionContext created successfully");
    } catch (o) {
      h.warn("ActionContext creation failed. Video play actions may fail.", o);
    }
  try {
    const o = new U(t, e, i, rt, s);
    t.mbkVidController = o, h.debug("VideoController instance created");
    const r = () => {
      h.debug("Starting VideoController initialization..."), o.init(), o.playAfterScene();
    };
    return s?.hasAppearedAtLeastOnce ? (h.debug("Unit/Screen already appeared, starting immediately"), r()) : typeof s?.once == "function" ? (h.debug("Waiting for 'appeared' event..."), s.once("appeared", r)) : (h.debug("No unit or 'appeared' event, starting immediately"), r()), o;
  } catch (o) {
    h.error("Critical error during init():", o);
  }
}
const k = (s) => s && typeof s.find == "function";
function lt(s, t) {
  if (k(t))
    return t;
  h.debug("Global screen is native or invalid, searching via creative...");
  let e = t;
  if (typeof s?.getScreen == "function" && (e = s.getScreen(), k(e)))
    return e;
  try {
    if (typeof screen < "u" && k(screen))
      return screen;
  } catch (n) {
    h.debug("Unable to access global 'screen' variable", n);
  }
  return e;
}
function ct(s, t, e) {
  if (t)
    return t;
  if (typeof s?.getUnit == "function")
    return s.getUnit();
  if (typeof e?.getUnit == "function")
    return e.getUnit();
  try {
    if (typeof unit < "u")
      return unit;
  } catch (n) {
    h.debug("Unable to access global 'unit' variable", n);
  }
}
function dt(s = {}) {
  h.debug("setup() called", s);
  const t = globalThis;
  h.debug("Environment snapshot", t, t.creative, t.screen, t.CreativeUnit);
  const e = s.creative || t.creative, n = s.unit || t.unit, i = s.screen || t.screen, o = s.ctx || t.ctx || t.mbkCtx, r = !!(s.creative || s.unit || s.screen);
  r ? h.debug("Using explicitly passed globals (recommended)") : h.debug("Falling back to global scope discovery");
  const a = lt(e, i), l = ct(e, n, a);
  if (h.debug("Environment check (Window):", {
    creative: !!e,
    unit: !!l,
    screen: k(a),
    ctx: !!o,
    explicitArgs: r
  }), !k(a)) {
    h.error("Video Controller: Could not find a valid Celtra Screen object. Passing globals explicitly in .setup() is recommended.");
    return;
  }
  return at(l || a, a, s, o);
}
typeof addCssRule == "function" && addCssRule(".video-player-engine video", "background: none;");
typeof window < "u" && (window.waitForCeltraGlobals = W, window.waitForCeltraGlobalsAnyWindow = st);
export {
  U as VideoController,
  Y as VideoCountdown,
  H as VideoElementManager,
  Q as VideoEventHandlers,
  X as VideoInstructionScene,
  K as VideoPlaybackController,
  J as VideoQuartileTracker,
  q as VideoSafeFrameHandler,
  R as VideoViewportObserver,
  F as defaultVideoControllerOptions,
  Z as defaultVideoCountdownOptions,
  y as hasBoolOption,
  N as hasOption,
  at as init,
  tt as initializeCountdownOptions,
  $ as initializeOptions,
  dt as setup,
  W as waitForCeltraGlobals,
  st as waitForCeltraGlobalsAnyWindow
};
