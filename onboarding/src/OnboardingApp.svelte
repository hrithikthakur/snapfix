<script>
  import { onMount } from 'svelte';

  const STEPS = [
    { key: 'intro', label: 'Introduction' },
    { key: 'permissions', label: 'System Settings' },
  ];

  let currentStep = 0;
  let showOnboarding = true;
  let snackbar = null;
  let onboardingElement;
  let snackbarTimeout;

  const featureHighlights = [
    {
      icon: '✨',
      title: 'Works everywhere',
      copy: 'Bring the shortcut into docs, email, chats, and any desktop app.'
    },
    {
      icon: '⚡',
      title: 'One effortless gesture',
      copy: 'Select text and tap Alt + Space (⌥ Space) to fix it without breaking flow.'
    },
    {
      icon: '🔒',
      title: 'Private & secure',
      copy: 'Processed locally with zero retained text so your writing stays yours.'
    }
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


  function completeOnboarding(skipped = false) {
    const timestamp = new Date().toISOString();

    if (skipped) {
      track('onboarding_skipped', { step: currentStep + 1, skipped_at: timestamp });
    } else {
      track('onboarding_step_completed', {
        step: currentStep + 1,
        step_name: getStepKey(currentStep),
      });
      track('onboarding_completed', {
        completion_date: timestamp,
        total_steps: STEPS.length,
      });
    }

    // Close the window after onboarding
    if (window?.electronAPI?.closeWindow) {
      window.electronAPI.closeWindow();
    } else {
      // Fallback: try to close via window.close()
      window.close();
    }
  }

  function handleNext() {
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
    window.snapfixOnboardingMounted = true;

    // Always show onboarding; clear any persisted flags from previous builds
    localStorage.removeItem('onboardingCompleted');
    localStorage.removeItem('onboardingCompletedDate');
    localStorage.removeItem('onboardingSkipped');

    onboardingElement?.classList.add('active');
    track('onboarding_started');
    track('onboarding_step_viewed', { step: 1, step_name: getStepKey(0) });

    return () => {
      window.snapfixOnboardingMounted = false;
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
        <div class="hero-pill">Always-on companion · Background helper</div>
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
        <p style="margin-top: 24px; font-size: 16px; color: rgba(255, 255, 255, 0.7);">
          Press <strong>⌥ Space</strong> (Alt+Space) to fix selected text instantly in any app.
        </p>
        <div class="highlight-grid">
          {#each featureHighlights as highlight}
            <div class="highlight-card">
              <span class="highlight-icon">{highlight.icon}</span>
              <div class="highlight-copy-block">
                <p class="highlight-title">{highlight.title}</p>
                <p class="highlight-copy">{highlight.copy}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
      <div class="onboarding-actions">
        <button class="onboarding-button primary" on:click={handleNext}>Continue</button>
      </div>
    </section>
  {:else if currentStep === 1}
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
          Complete Setup
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
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    overflow-x: hidden;
    position: relative;
    background: #0f0f23;
  }

  :global(body::before) {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.3), transparent),
      radial-gradient(ellipse 60% 80% at 90% 120%, rgba(0, 122, 255, 0.2), transparent),
      radial-gradient(ellipse 100% 100% at 10% 80%, rgba(88, 86, 214, 0.15), transparent),
      linear-gradient(135deg, #0a0a1f 0%, #0f0f23 50%, #1a0f2e 100%);
    z-index: -2;
  }

  :global(body::after) {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(0, 122, 255, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 20%, rgba(88, 86, 214, 0.04) 0%, transparent 50%);
    z-index: -1;
    animation: ambientFloat 20s ease-in-out infinite;
  }

  @keyframes ambientFloat {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.1); }
  }

  :global(#onboarding) {
    display: none;
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    padding: clamp(24px, 5vh, 48px) clamp(20px, 4vw, 32px) clamp(20px, 3vh, 32px);
    opacity: 0;
    visibility: hidden;
    min-height: 100vh;
    position: relative;
  }

  :global(#onboarding.active) {
    display: flex;
    flex-direction: column;
    opacity: 1;
    visibility: visible;
    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .onboarding-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 4px;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 10px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
  }

  .logo-mark {
    font-size: 24px;
    animation: float 3s ease-in-out infinite;
    filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.6));
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }

  .header-title {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 700;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .skip-link {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .skip-link:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.95);
    transform: translateY(-1px);
  }

  .step-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-bottom: clamp(24px, 5vh, 40px);
    position: relative;
    padding: 16px 0;
  }

  .step-indicator::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% - 80px);
    height: 3px;
    background: linear-gradient(90deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(0, 122, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.1) 100%
    );
    border-radius: 2px;
    z-index: 0;
  }

  .step-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    z-index: 1;
    border: 3px solid rgba(15, 15, 35, 0.8);
    backdrop-filter: blur(10px);
  }

  .step-dot::before {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    background: transparent;
    transition: all 0.5s ease;
  }

  .step-dot.active {
    background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
    width: 48px;
    border-radius: 8px;
    box-shadow: 
      0 4px 20px rgba(0, 122, 255, 0.5),
      0 0 40px rgba(88, 86, 214, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    border-color: rgba(15, 15, 35, 0.5);
  }

  .step-dot.active::before {
    background: radial-gradient(circle, rgba(0, 122, 255, 0.3) 0%, transparent 70%);
  }

  .step-dot.completed {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  .onboarding-step {
    display: none;
    animation: slideInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    flex-direction: column;
    justify-content: space-between;
    flex: 1 1 auto;
    min-height: 0;
    gap: 20px;
  }

  .onboarding-step.active {
    display: flex;
  }

  @keyframes slideInScale {
    from {
      opacity: 0;
      transform: translateX(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  .step-content {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 28px;
    padding: clamp(28px, 5vh, 48px);
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 0 0 1px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: relative;
    overflow: hidden;
  }

  .step-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: radial-gradient(ellipse 100% 80% at 50% 0%, rgba(88, 86, 214, 0.15), transparent);
    pointer-events: none;
  }

  .step-content h2 {
    font-size: clamp(24px, 4vw, 32px);
    font-weight: 700;
    background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 16px 0;
    letter-spacing: -0.5px;
    line-height: 1.2;
    position: relative;
  }

  .step-content p {
    font-size: clamp(15px, 2.5vw, 17px);
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 20px 0;
    line-height: 1.6;
    position: relative;
  }

  .step-content.centered {
    text-align: center;
    padding: clamp(32px, 6vh, 56px) clamp(24px, 6vw, 48px);
    justify-content: center;
  }

  .logo-container {
    margin-bottom: clamp(20px, 4vh, 32px);
    position: relative;
  }

  .hero-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    box-shadow: 
      0 4px 20px rgba(88, 86, 214, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    margin-bottom: 20px;
    letter-spacing: 0.02em;
  }

  .logo-glow {
    font-size: clamp(52px, 10vw, 80px);
    animation: logoGlow 3s ease-in-out infinite;
    filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 60px rgba(0, 122, 255, 0.4));
    position: relative;
  }

  @keyframes logoGlow {
    0%, 100% {
      transform: scale(1) rotate(0deg);
      filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 60px rgba(0, 122, 255, 0.4));
    }
    50% {
      transform: scale(1.08) rotate(2deg);
      filter: drop-shadow(0 0 50px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 80px rgba(0, 122, 255, 0.6));
    }
  }

  .hero-title {
    font-size: clamp(32px, 5vw, 48px);
    font-weight: 800;
    background: linear-gradient(135deg, 
      #ffffff 0%, 
      #e0e7ff 30%, 
      #c7d2fe 60%,
      #a5b4fc 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 20px 0;
    letter-spacing: -1.5px;
    line-height: 1.1;
    text-shadow: 0 0 60px rgba(255, 255, 255, 0.1);
  }

  .hero-subtitle {
    font-size: clamp(16px, 3vw, 20px);
    color: rgba(255, 255, 255, 0.65);
    margin: 0 0 32px 0;
    font-weight: 400;
    line-height: 1.5;
  }

  .keyboard-shortcut,
  .keyboard-shortcut-large {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    padding: 24px;
    margin: 24px 0;
    text-align: center;
    font-family: 'SF Mono', Monaco, monospace;
    box-shadow: 
      0 10px 40px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
  }

  .keyboard-shortcut::before,
  .keyboard-shortcut-large::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 20px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(0, 122, 255, 0.3), rgba(88, 86, 214, 0.3));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.5;
  }

  .highlight-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    width: 100%;
    margin-top: 24px;
  }

  .highlight-card {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    padding: 20px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 10px 40px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: default;
  }

  .highlight-card:hover {
    transform: translateY(-4px) scale(1.02);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.3),
      0 0 40px rgba(0, 122, 255, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .highlight-icon {
    font-size: 28px;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  }

  .highlight-copy-block {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .highlight-title {
    font-weight: 700;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    letter-spacing: -0.3px;
  }

  .highlight-copy {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
  }

  .keyboard-shortcut-large {
    margin: 16px 0;
  }

  .keyboard-shortcut kbd,
  .keyboard-shortcut-large kbd {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 14px 20px;
    margin: 0 6px;
    font-size: 18px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.3),
      0 1px 0 rgba(255, 255, 255, 0.2) inset,
      0 -1px 0 rgba(0, 0, 0, 0.2) inset;
    transition: all 0.2s ease;
    display: inline-block;
  }

  .keyboard-shortcut kbd:hover,
  .keyboard-shortcut-large kbd:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 6px 20px rgba(0, 0, 0, 0.4),
      0 1px 0 rgba(255, 255, 255, 0.3) inset;
  }

  .keyboard-shortcut .plus,
  .keyboard-shortcut-large .plus {
    color: rgba(255, 255, 255, 0.5);
    font-size: 20px;
    margin: 0 10px;
    font-weight: 300;
  }

  .demo-section {
    margin: 24px 0;
  }

  .demo-label {
    font-size: 16px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 12px;
    letter-spacing: -0.3px;
  }

  .demo-text-container {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 18px;
    margin-bottom: 18px;
    border: 2px dashed rgba(255, 255, 255, 0.2);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .demo-text-container.highlighted {
    border-color: #007aff;
    border-style: solid;
    background: rgba(0, 122, 255, 0.1);
    box-shadow: 
      0 0 0 4px rgba(0, 122, 255, 0.2),
      0 10px 40px rgba(0, 122, 255, 0.3);
  }

  .demo-text {
    width: 100%;
    font-size: 16px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.95);
    padding: 14px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    resize: vertical;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .demo-text:focus {
    outline: none;
    border-color: #007aff;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
  }

  .demo-button {
    width: 100%;
    padding: 16px 24px;
    font-size: 17px;
    font-weight: 700;
    background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
    color: white;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 
      0 8px 24px rgba(0, 122, 255, 0.4),
      0 0 40px rgba(88, 86, 214, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    margin-top: 16px;
    position: relative;
    overflow: hidden;
  }

  .demo-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  .demo-button:hover::before {
    left: 100%;
  }

  .demo-button:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      0 12px 32px rgba(0, 122, 255, 0.5),
      0 0 60px rgba(88, 86, 214, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }

  .demo-button:active {
    transform: translateY(0) scale(0.98);
  }

  .demo-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .demo-status {
    text-align: center;
    margin-top: 14px;
    padding: 12px;
    border-radius: 12px;
    animation: slideDown 0.4s ease;
  }

  .demo-success {
    font-size: 17px;
    font-weight: 700;
    color: #10b981;
    text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .permissions-visual {
    text-align: center;
    margin: 28px 0;
    padding: 28px;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    box-shadow: 
      0 10px 40px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .settings-icon {
    font-size: 56px;
    margin-bottom: 16px;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
    animation: rotate 20s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .settings-path {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    font-family: 'SF Mono', Monaco, monospace;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    border-radius: 10px;
    display: inline-block;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    font-weight: 500;
  }

  .permission-button {
    width: 100%;
    margin-top: 16px;
    padding: 16px 24px;
    font-size: 17px;
    font-weight: 700;
    background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
    color: white;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 
      0 8px 24px rgba(0, 122, 255, 0.4),
      0 0 40px rgba(88, 86, 214, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .permission-button:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 12px 32px rgba(0, 122, 255, 0.5),
      0 0 60px rgba(88, 86, 214, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }

  .checklist {
    margin: 28px 0;
  }

  .checklist-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    margin-bottom: 12px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .checklist-item.completed {
    background: rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.3);
    color: #10b981;
    box-shadow: 
      0 8px 24px rgba(16, 185, 129, 0.2),
      0 0 40px rgba(16, 185, 129, 0.1);
  }

  .check-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .checklist-item.completed .check-icon {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    box-shadow: 
      0 4px 12px rgba(16, 185, 129, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    animation: checkPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  @keyframes checkPop {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }

  .onboarding-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    padding: 0 4px;
    flex-wrap: wrap;
    margin-top: auto;
  }

  .onboarding-button {
    padding: 14px 26px;
    font-size: 17px;
    font-weight: 700;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .onboarding-button.primary {
    background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
    color: white;
    flex: 1;
    box-shadow: 
      0 8px 24px rgba(0, 122, 255, 0.4),
      0 0 40px rgba(88, 86, 214, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .onboarding-button.primary:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      0 12px 32px rgba(0, 122, 255, 0.5),
      0 0 60px rgba(88, 86, 214, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }

  .onboarding-button.secondary {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .onboarding-button.secondary:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }

  .onboarding-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none !important;
  }

  .snackbar {
    margin-top: 16px;
    padding: 14px 20px;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 600;
    text-align: center;
    backdrop-filter: blur(20px);
    border: 1px solid;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    animation: slideDown 0.4s ease;
  }

  .snackbar.error {
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
    border-color: rgba(239, 68, 68, 0.3);
  }

  .snackbar.info {
    background: rgba(59, 130, 246, 0.15);
    color: #93c5fd;
    border-color: rgba(59, 130, 246, 0.3);
  }

  @media (max-height: 720px) {
    :global(#onboarding) {
      padding: 24px 20px 20px;
    }

    .step-content {
      padding: 24px;
      border-radius: 24px;
    }

    .onboarding-button {
      flex: 1 1 100%;
      padding: 12px 20px;
    }

    .permission-button {
      padding: 14px 20px;
    }
  }

  @media (max-height: 640px) {
    .step-content {
      padding: 20px;
    }

    .keyboard-shortcut kbd,
    .keyboard-shortcut-large kbd {
      padding: 12px 16px;
    }

    .demo-button,
    .permission-button,
    .onboarding-button {
      padding: 12px 18px;
    }

    .checklist {
      margin: 16px 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>

