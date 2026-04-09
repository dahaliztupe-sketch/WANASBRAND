export const triggerHaptic = (duration: number = 10) => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(duration);
  }
};
