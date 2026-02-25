import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './OnboardingTutorial.scss';

const tutorialDateLabel = (isoDate) => {
  if (!isoDate) return 'Not completed yet';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Completed';
  return date.toLocaleString();
};

const OnboardingTutorial = ({
  tutorial = null,
  onTutorialUpdate,
  isUpdating = false,
  updateError = '',
  videoUrl = '',
  storageKey = 'onboarding-tutorial-last-played',
}) => {
  const videoRef = useRef(null);
  const sessionMaxProgressRef = useRef(0);
  const hasPlayedInSessionRef = useRef(false);
  const lastSentPayloadRef = useRef(null);
  const queuedPayloadRef = useRef(null);
  const syncInFlightRef = useRef(false);
  const lastDispatchAtRef = useRef(0);
  const [localProgress, setLocalProgress] = useState(0);
  const [lastPlayedAt, setLastPlayedAt] = useState(null);

  const safeTutorial = useMemo(
    () => ({
      required: true,
      hasInteracted: false,
      interactionType: null,
      watchProgressPercent: 0,
      manualAcknowledged: false,
      completionThresholdPercent: 90,
      isCompleted: false,
      completedAt: null,
      ...(tutorial || {}),
    }),
    [tutorial],
  );

  const completionThreshold = safeTutorial.completionThresholdPercent || 90;
  const displayedProgress = Math.max(
    Math.round(localProgress || 0),
    Math.round(safeTutorial.watchProgressPercent || 0),
  );

  useEffect(() => {
    const serverProgress = Number(safeTutorial.watchProgressPercent || 0);
    setLocalProgress((prev) => Math.max(prev, serverProgress));
  }, [safeTutorial.watchProgressPercent]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setLastPlayedAt(stored);
    } catch {
      // Ignore localStorage failures.
    }
  }, [storageKey]);

  useEffect(() => {
    if (!lastPlayedAt) return;
    try {
      window.localStorage.setItem(storageKey, lastPlayedAt);
    } catch {
      // Ignore localStorage failures.
    }
  }, [lastPlayedAt, storageKey]);

  const buildPayload = (payload) => ({
    hasInteracted: true,
    ...payload,
  });

  const dispatchSyncPayload = (payload) => {
    syncInFlightRef.current = true;
    lastDispatchAtRef.current = Date.now();
    lastSentPayloadRef.current = JSON.stringify(payload);
    onTutorialUpdate?.(payload);
  };

  const updateTutorial = (payload) => {
    const nextPayload = buildPayload(payload);
    const payloadKey = JSON.stringify(nextPayload);
    if (lastSentPayloadRef.current === payloadKey) return;

    const now = Date.now();
    const elapsed = now - lastDispatchAtRef.current;
    const minDispatchIntervalMs = 900;
    const underMinInterval = elapsed < minDispatchIntervalMs;

    if (syncInFlightRef.current || isUpdating || underMinInterval) {
      queuedPayloadRef.current = nextPayload;
      return;
    }

    dispatchSyncPayload(nextPayload);
  };

  useEffect(() => {
    if (isUpdating) {
      syncInFlightRef.current = true;
      return;
    }

    syncInFlightRef.current = false;
    if (!queuedPayloadRef.current) return;

    const payload = queuedPayloadRef.current;
    queuedPayloadRef.current = null;
    if (JSON.stringify(payload) === lastSentPayloadRef.current) return;
    dispatchSyncPayload(payload);
  }, [isUpdating]);

  const setPlayedNow = () => {
    const nowIso = new Date().toISOString();
    setLastPlayedAt(nowIso);
  };

  const flushTutorialProgress = ({ forceCompleted = false } = {}) => {
    const serverProgress = Math.round(safeTutorial.watchProgressPercent || 0);
    const sessionProgress = Math.round(sessionMaxProgressRef.current || 0);
    const nextProgress = Math.min(100, Math.max(serverProgress, sessionProgress));
    const shouldComplete =
      forceCompleted ||
      safeTutorial.isCompleted ||
      nextProgress >= completionThreshold;

    const progressChanged = nextProgress > serverProgress;
    const completionChanged = shouldComplete && !safeTutorial.isCompleted;
    const shouldSync = hasPlayedInSessionRef.current || progressChanged || completionChanged;

    if (!shouldSync) return;

    updateTutorial({
      interactionType: shouldComplete ? 'completed' : 'progress',
      watchProgressPercent: nextProgress,
      ...(completionChanged ? { completedAt: new Date().toISOString() } : {}),
    });

    hasPlayedInSessionRef.current = false;
    sessionMaxProgressRef.current = nextProgress;
  };

  const handlePlay = () => {
    setPlayedNow();
    hasPlayedInSessionRef.current = true;
  };

  const handleTimeUpdate = (event) => {
    const videoElement = event.currentTarget;
    if (!videoElement?.duration) return;

    const percent = Math.min(
      100,
      Math.round((videoElement.currentTime / videoElement.duration) * 100),
    );

    setLocalProgress((prev) => Math.max(prev, percent));
    sessionMaxProgressRef.current = Math.max(sessionMaxProgressRef.current, percent);
  };

  const handlePause = () => {
    flushTutorialProgress();
  };

  const handleEnded = () => {
    setPlayedNow();
    setLocalProgress(100);
    sessionMaxProgressRef.current = 100;
    flushTutorialProgress({ forceCompleted: true });
  };

  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    const playPromise = videoRef.current.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Browsers can block autoplay; user can press play manually.
      });
    }
  };

  const handleManualAcknowledge = () => {
    setPlayedNow();
    updateTutorial({
      interactionType: 'manual_ack',
      manualAcknowledged: true,
      completedAt: new Date().toISOString(),
    });
  };

  return (
    <section
      className="onboarding-tutorial"
      aria-labelledby="onboarding-tutorial-title"
    >
      <div className="onboarding-tutorial__header">
        <h2 id="onboarding-tutorial-title">Onboarding tutorial</h2>
        <span
          className={`onboarding-tutorial__status ${safeTutorial.isCompleted ? 'is-complete' : 'is-incomplete'}`}
          role="status"
          aria-live="polite"
        >
          {safeTutorial.isCompleted ? 'Completed' : 'Required before saving'}
        </span>
      </div>

      <p className="onboarding-tutorial__intro">
        Watch this tutorial to complete your profile setup. You can replay it any
        time after completion.
      </p>

      {!safeTutorial.isCompleted ? (
        <p className="onboarding-tutorial__gate" role="alert">
          Profile save actions stay disabled until the tutorial is completed.
        </p>
      ) : null}

      <div className="onboarding-tutorial__player">
        {videoUrl ? (
          <video
            ref={videoRef}
            controls
            preload="metadata"
            onPlay={handlePlay}
            onTimeUpdate={handleTimeUpdate}
            onPause={handlePause}
            onEnded={handleEnded}
            aria-describedby="onboarding-tutorial-meta"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
        ) : (
          <div className="onboarding-tutorial__fallback" role="note">
            Tutorial video is currently unavailable. Use manual acknowledge if you
            cannot access the tutorial right now.
          </div>
        )}
      </div>

      <div id="onboarding-tutorial-meta" className="onboarding-tutorial__meta">
        <p>
          Progress: {displayedProgress}% (minimum {completionThreshold}%)
        </p>
        <p>
          Last played: {tutorialDateLabel(lastPlayedAt || safeTutorial.completedAt)}
        </p>
      </div>

      <div className="onboarding-tutorial__actions">
        <button
          type="button"
          className="btn not-disabled"
          onClick={handleReplay}
          disabled={isUpdating}
        >
          Replay tutorial
        </button>
        <button
          type="button"
          className="btn not-disabled"
          onClick={handleManualAcknowledge}
          disabled={isUpdating || safeTutorial.isCompleted}
        >
          I cannot play video, acknowledge manually
        </button>
      </div>

      {isUpdating ? (
        <p className="onboarding-tutorial__saving" aria-live="polite">
          Saving tutorial progress...
        </p>
      ) : null}

      {updateError ? (
        <p className="onboarding-tutorial__error" role="alert">
          {updateError}
        </p>
      ) : null}
    </section>
  );
};

OnboardingTutorial.propTypes = {
  tutorial: PropTypes.shape({
    required: PropTypes.bool,
    hasInteracted: PropTypes.bool,
    interactionType: PropTypes.string,
    watchProgressPercent: PropTypes.number,
    manualAcknowledged: PropTypes.bool,
    completionThresholdPercent: PropTypes.number,
    isCompleted: PropTypes.bool,
    completedAt: PropTypes.string,
  }),
  onTutorialUpdate: PropTypes.func.isRequired,
  isUpdating: PropTypes.bool,
  updateError: PropTypes.string,
  videoUrl: PropTypes.string,
  storageKey: PropTypes.string,
};

export default OnboardingTutorial;
