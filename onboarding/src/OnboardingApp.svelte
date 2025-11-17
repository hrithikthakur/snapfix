<script>
  import { onMount } from 'svelte';

  const STEPS = [
    { key: 'welcome', label: 'Welcome' },
    { key: 'keyboard_shortcut', label: 'Shortcut' },
    { key: 'permissions', label: 'Permissions' },
    { key: 'how_to_use', label: 'Ready' },
  ];

  const DEFAULT_DEMO_TEXT = 'I have alot of work to do tomorow. This is a test sentance with some erors.';

  let currentStep = 0;
  let demoText = DEFAULT_DEMO_TEXT;
  let demoFixed = false;
  let demoLoading = false;
  let demoStatus = '';
  let demoHighlight = false;
  let showOnboarding = true;
  let snackbar = null;
  let apiKey = '';

  let onboardingElement;
  let mainAppElement;
  let snackbarTimeout;

  const checklistItems = [
    { key: 'tried', label: 'Tried your first correction' },
    { key: 'shortcut', label: 'Shortcut learned' },
    { key: 'ready', label: 'Ready to use SnapFix' },
  ];

  function track(eventName, payload = {}) {
    if (window?.electronAPI?.trackEvent) {
      window.electronAPI.trackEvent(eventName, payload);
    }
  }

  function showSnackbar(severity, message) {
    if (snackbarTimeout) {
      clearTimeout(snackbarTimeout);
    }
    snackbar = { severity, message };
    snackbarTimeout = setTimeout(() => {
      snackbar = null;
    }, 5000);
  }

  function getStepKey(step) {
    return STEPS[step]?.key || 'unknown';
  }

  async function fetchApiKey() {
    if (!window?.electronAPI?.getApiKey) {
      return;
    }
    try {
      apiKey = await window.electronAPI.getApiKey();
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not found');
      }
    } catch (error) {
      showSnackbar('error', `API key error: ${error.message}`);
    }
  }

  function resetDemo() {
    demoText = DEFAULT_DEMO_TEXT;
    demoFixed = false;
    demoStatus = '';
    demoHighlight = false;
  }

  async function tryDemo() {
    if (demoLoading) {
      return;
    }

    if (demoFixed) {
      resetDemo();
      return;
    }

    if (!apiKey) {
      await fetchApiKey();
    }

    if (!apiKey) {
      showSnackbar('error', 'Demo unavailable without an API key.');
      return;
    }

    if (!window.snapfixCallGemini) {
      showSnackbar('error', 'Demo not available in this build.');
      return;
    }

    demoLoading = true;
    demoHighlight = true;
    demoStatus = 'Fixing…';
    track('onboarding_demo_attempted');

    try {
      const corrected = await window.snapfixCallGemini(demoText, apiKey, () => {});
      if (!corrected) {
        throw new Error('No response from API');
      }
      demoText = corrected;
      demoFixed = true;
      demoStatus = '✓ Fixed!';
      track('onboarding_demo_completed');
    } catch (error) {
      demoStatus = '';
      demoHighlight = false;
      showSnackbar('error', `Demo failed: ${error.message}`);
    } finally {
      demoLoading = false;
    }
  }

  function completeOnboarding(skipped = false) {
    const timestamp = new Date().toISOString();
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('onboardingCompletedDate', timestamp);

    if (skipped) {
      localStorage.setItem('onboardingSkipped', 'true');
      track('onboarding_skipped', { step: currentStep + 1, skipped_at: timestamp });
    } else {
      localStorage.removeItem('onboardingSkipped');
      track('onboarding_step_completed', {
        step: currentStep + 1,
        step_name: getStepKey(currentStep),
      });
      track('onboarding_completed', {
        completion_date: timestamp,
        total_steps: STEPS.length,
      });
    }

    onboardingElement?.classList.remove('active');
    mainAppElement?.classList.remove('hidden');
    showOnboarding = false;
  }

  function handleNext() {
    if (currentStep === 1 && !demoFixed) {
      return;
    }

    if (currentStep >= STEPS.length - 1) {
      completeOnboarding(false);
      return;
    }

    track('onboarding_step_completed', {
      step: currentStep + 1,
      step_name: getStepKey(currentStep),
    });

    currentStep += 1;

    track('onboarding_step_viewed', {
      step: currentStep + 1,
      step_name: getStepKey(currentStep),
    });
  }

  function handleBack() {
    if (currentStep === 0) {
      return;
    }
    currentStep -= 1;
    track('onboarding_step_viewed', {
      step: currentStep + 1,
      step_name: getStepKey(currentStep),
    });
  }

  function handleSkip() {
    completeOnboarding(true);
  }

  function handleSkipPermissions() {
    track('onboarding_permissions_skipped');
    handleNext();
  }

  async function handleOpenSettings() {
    track('onboarding_permissions_opened');
    if (window?.electronAPI?.openSystemSettings) {
      await window.electronAPI.openSystemSettings();
    } else {
      showSnackbar('info', 'Open System Settings > Privacy & Security > Accessibility');
    }
  }

  onMount(() => {
    onboardingElement = document.getElementById('onboarding');
    mainAppElement = document.getElementById('mainApp');

    const isCompleted = localStorage.getItem('onboardingCompleted') === 'true';
    if (isCompleted) {
      onboardingElement?.classList.remove('active');
      mainAppElement?.classList.remove('hidden');
      showOnboarding = false;
      return;
    }

    onboardingElement?.classList.add('active');
    mainAppElement?.classList.add('hidden');
    track('onboarding_started');
    track('onboarding_step_viewed', { step: 1, step_name: getStepKey(0) });
    fetchApiKey();

    const keyListener = (event) => {
      if (currentStep === 1 && (event.altKey || event.metaKey) && event.code === 'Space') {
        event.preventDefault();
        if (!demoFixed) {
          tryDemo();
        }
      }
    };

    window.addEventListener('keydown', keyListener);

    return () => {
      window.removeEventListener('keydown', keyListener);
      if (snackbarTimeout) {
        clearTimeout(snackbarTimeout);
      }
    };
  });
</script>

{#if showOnboarding}
  <div class="onboarding-header">
    <div class="header-content">
      <span class="logo-mark">⚡</span>
      <span class="header-title">SnapFix Onboarding</span>
    </div>
    <button class="skip-link" on:click={handleSkip}>Skip for now</button>
  </div>

  <div class="step-indicator">
    {#each STEPS as step, index}
      <div class="step-dot" class:active={index === currentStep} class:completed={index < currentStep}></div>
    {/each}
  </div>

  {#if currentStep === 0}
    <section class="onboarding-step active">
      <div class="step-content centered">
        <div class="logo-container">
          <div class="logo-glow">⚡</div>
        </div>
        <h1 class="hero-title">Write smarter in one keypress</h1>
        <p class="hero-subtitle">Snapfix fixes your text anywhere on your Mac with lightning speed.</p>
        <div class="keyboard-shortcut">
          <kbd>⌥</kbd>
          <span class="plus">+</span>
          <kbd>Space</kbd>
        </div>
      </div>
      <div class="onboarding-actions">
        <button class="onboarding-button primary" on:click={handleNext}>Get Started</button>
      </div>
    </section>
  {:else if currentStep === 1}
    <section class="onboarding-step active">
      <div class="step-content">
        <h2>Your magic shortcut</h2>
        <p>Press <strong>⌥ Space</strong> (Alt+Space) to fix selected text instantly.</p>

        <div class="demo-section">
          <p class="demo-label">Try it now:</p>
          <div class="demo-text-container" class:highlighted={demoHighlight}>
            <textarea
              class="demo-text"
              rows="4"
              bind:value={demoText}
              on:focus={() => (demoHighlight = true)}
              on:blur={() => (demoHighlight = demoFixed)}
            ></textarea>
          </div>
          <div class="keyboard-shortcut-large">
            <kbd>⌥</kbd>
            <span class="plus">+</span>
            <kbd>Space</kbd>
          </div>
          {#if demoStatus}
            <div class="demo-status">
              <span class="demo-success">{demoStatus}</span>
            </div>
          {/if}
          <button class="demo-button" on:click={tryDemo} disabled={demoLoading}>
            {#if demoLoading}
              Fixing…
            {:else if demoFixed}
              Try again
            {:else}
              Try it now
            {/if}
          </button>
        </div>
      </div>
      <div class="onboarding-actions">
        <button class="onboarding-button secondary" on:click={handleBack}>Previous</button>
        <button class="onboarding-button primary" on:click={handleNext} disabled={!demoFixed}>
          Continue
        </button>
      </div>
    </section>
  {:else if currentStep === 2}
    <section class="onboarding-step active">
      <div class="step-content">
        <h2>Enable permissions to fix text everywhere</h2>
        <p>Snapfix needs Accessibility permissions to replace text in other apps.</p>
        <div class="permissions-visual">
          <div class="settings-icon">⚙️</div>
          <div class="settings-path">System Settings → Privacy & Security → Accessibility</div>
        </div>
        <button class="permission-button" on:click|preventDefault={handleOpenSettings}>
          Open System Settings
        </button>
        <button class="onboarding-button secondary" on:click={handleSkipPermissions} style="width: 100%; margin-top: 12px;">
          I'll do this later
        </button>
      </div>
      <div class="onboarding-actions">
        <button class="onboarding-button secondary" on:click={handleBack}>Previous</button>
        <button class="onboarding-button primary" on:click={handleNext}>
          Continue
        </button>
      </div>
    </section>
  {:else}
    <section class="onboarding-step active">
      <div class="step-content">
        <h2>You're all set</h2>
        <p>Select text in any app and press <strong>⌥ Space</strong> to fix it instantly.</p>
        <div class="checklist">
          {#each checklistItems as item, index}
            <div
              class="checklist-item"
              class:completed={(index === 0 && demoFixed) || (index === 1 && currentStep >= 2) || (index === 2 && currentStep >= 3)}
            >
              <span class="check-icon">✓</span>
              <span>{item.label}</span>
            </div>
          {/each}
        </div>
      </div>
      <div class="onboarding-actions">
        <button class="onboarding-button primary" on:click={() => completeOnboarding(false)} style="width: 100%;">
          Start Using Snapfix
        </button>
      </div>
    </section>
  {/if}

  {#if snackbar}
    <div
      class="snackbar"
      class:error={snackbar.severity === 'error'}
      class:info={snackbar.severity === 'info'}
    >
      {snackbar.message}
    </div>
  {/if}
{/if}

<style>
  :global(#onboarding) {
    display: none;
    width: 100%;
    max-width: 680px;
    margin: 0 auto;
    padding: clamp(16px, 4vh, 32px) clamp(16px, 4vw, 24px) clamp(12px, 3vh, 24px);
    opacity: 0;
    visibility: hidden;
    min-height: 100vh;
    height: 100vh;
  }

  :global(#onboarding.active) {
    display: flex;
    flex-direction: column;
    opacity: 1;
    visibility: visible;
    animation: fadeInUp 0.6s ease;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .onboarding-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #86868b;
    font-weight: 600;
  }

  .logo-mark {
    font-size: 20px;
  }

  .header-title {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .skip-link {
    background: transparent;
    border: none;
    color: #86868b;
    font-size: 15px;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .skip-link:hover {
    color: #1d1d1f;
  }

  .step-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: clamp(8px, 2vw, 16px);
    margin-bottom: clamp(12px, 4vh, 24px);
    position: relative;
  }

  .step-indicator::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% - 40px);
    height: 2px;
    background: #e5e5ea;
    z-index: 0;
  }

  .step-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #d2d2d7;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1;
    border: 3px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .step-dot.active {
    background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
    width: 40px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
  }

  .step-dot.completed {
    background: #4caf50;
  }

  .onboarding-step {
    display: none;
    animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    flex-direction: column;
    justify-content: space-between;
    flex: 1 1 auto;
    min-height: 0;
    gap: 12px;
  }

  .onboarding-step.active {
    display: flex;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(12px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .step-content {
    background: white;
    border-radius: 20px;
    padding: clamp(18px, 4vh, 32px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    margin-bottom: 16px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .step-content.centered {
    text-align: center;
    padding: clamp(24px, 6vh, 48px) clamp(20px, 6vw, 48px);
  }

  .logo-container {
    margin-bottom: clamp(12px, 4vh, 28px);
  }

  .logo-glow {
    font-size: clamp(40px, 9vw, 64px);
    animation: sparkle 2s ease-in-out infinite;
    filter: drop-shadow(0 0 20px rgba(0, 122, 255, 0.5));
  }

  @keyframes sparkle {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.9;
    }
  }

  .hero-title {
    font-size: clamp(28px, 4vw, 38px);
    font-weight: 700;
    background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 16px 0;
    letter-spacing: -1px;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-size: clamp(16px, 3vw, 18px);
    color: #86868b;
    margin: 0;
    font-weight: 400;
    line-height: 1.4;
  }

  .keyboard-shortcut,
  .keyboard-shortcut-large {
    background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
    border-radius: 16px;
    padding: 20px;
    margin: 16px 0;
    text-align: center;
    font-family: 'SF Mono', Monaco, monospace;
    border: 2px solid #e5e5ea;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
  }

  .keyboard-shortcut-large {
    margin: 12px 0;
  }

  .keyboard-shortcut kbd,
  .keyboard-shortcut-large kbd {
    background: white;
    border: 2px solid #d2d2d7;
    border-radius: 8px;
    padding: 10px 16px;
    margin: 0 4px;
    font-size: 15px;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.8) inset;
    transition: all 0.2s ease;
    display: inline-block;
  }

  .keyboard-shortcut .plus,
  .keyboard-shortcut-large .plus {
    color: #86868b;
    font-size: 18px;
    margin: 0 8px;
    font-weight: 300;
  }

  .demo-section {
    margin: 16px 0;
  }

  .demo-label {
    font-size: 15px;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 8px;
  }

  .demo-text-container {
    background: #f5f5f7;
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 14px;
    border: 2px dashed #d2d2d7;
    transition: all 0.3s ease;
  }

  .demo-text-container.highlighted {
    border-color: #007aff;
    background: #e3f2fd;
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
  }

  .demo-text {
    width: 100%;
    font-size: 16px;
    line-height: 1.6;
    color: #1d1d1f;
    padding: 10px;
    background: white;
    border-radius: 8px;
    border: 1px solid transparent;
    resize: vertical;
  }

  .demo-text:focus {
    outline: none;
    border-color: #007aff;
  }

  .demo-button {
    width: 100%;
    padding: 12px 20px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
    margin-top: 12px;
  }

  .demo-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .demo-status {
    text-align: center;
    margin-top: 10px;
    padding: 10px;
    border-radius: 10px;
    animation: slideDown 0.3s ease;
  }

  .demo-success {
    font-size: 16px;
    font-weight: 600;
    color: #2e7d32;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .permissions-visual {
    text-align: center;
    margin: 20px 0;
    padding: 20px;
    background: #f5f5f7;
    border-radius: 14px;
  }

  .settings-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .settings-path {
    font-size: 14px;
    color: #515154;
    font-family: 'SF Mono', Monaco, monospace;
    padding: 10px 16px;
    background: white;
    border-radius: 8px;
    display: inline-block;
    border: 1px solid #e5e5ea;
  }

  .permission-button {
    width: 100%;
    margin-top: 12px;
    padding: 14px 20px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
  }

  .permission-button:hover {
    transform: translateY(-2px);
  }

  .checklist {
    margin: 20px 0;
  }

  .checklist-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    margin-bottom: 10px;
    background: #f5f5f7;
    border-radius: 12px;
    font-size: 15px;
    color: #515154;
    transition: all 0.3s ease;
  }

  .checklist-item.completed {
    background: #e8f5e9;
    color: #2e7d32;
  }

  .check-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #d2d2d7;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    flex-shrink: 0;
  }

  .checklist-item.completed .check-icon {
    background: #4caf50;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
  }

  .onboarding-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 0 4px;
    flex-wrap: wrap;
    margin-top: auto;
  }

  .onboarding-button {
    padding: 12px 22px;
    font-size: 16px;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .onboarding-button.primary {
    background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
    color: white;
    flex: 1;
    box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
  }

  .onboarding-button.secondary {
    background: #f5f5f7;
    color: #1d1d1f;
    border: 2px solid transparent;
  }

  .onboarding-button.secondary:hover {
    background: #e5e5ea;
    border-color: #d2d2d7;
  }

  .onboarding-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .snackbar {
    margin-top: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
  }

  .snackbar.error {
    background: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
  }

  .snackbar.info {
    background: #e3f2fd;
    color: #1565c0;
    border: 1px solid #bbdefb;
  }

  @media (max-height: 640px) {
    :global(#onboarding) {
      padding: 20px 16px 16px;
    }

    .step-content {
      padding: 20px;
      border-radius: 16px;
    }

    .onboarding-button {
      flex: 1 1 100%;
      padding: 10px 16px;
    }

    .permission-button {
      padding: 12px 16px;
    }
  }

  @media (max-height: 560px) {
    .step-content {
      padding: 18px;
    }

    .keyboard-shortcut kbd,
    .keyboard-shortcut-large kbd {
      padding: 10px 14px;
    }

    .demo-button,
    .permission-button,
    .onboarding-button {
      padding: 10px 14px;
    }

    .checklist {
      margin: 12px 0;
    }
  }
</style>

