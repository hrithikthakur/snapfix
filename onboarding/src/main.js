import OnboardingApp from './OnboardingApp.svelte';

function mount() {
  const target = document.getElementById('onboarding');
  if (!target) {
    return;
  }

  new OnboardingApp({ target });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}

