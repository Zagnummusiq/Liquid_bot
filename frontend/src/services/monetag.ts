export const MONETAG_ZONE_ID = '8984545';

export const DIRECT_LINKS = [
  '8984644', // Terrific link
  '9611956', // Positive link
  '9181340', // Light link
  '8929450', // Positive link
  '8109845', // Efficient link
  '9610697', // Pungent link
  '9611854', // Strong link
  '9022048', // Wise link
  '9135943', // Industrious link
  '8348809', // Beautiful link
  '8929419', // Immortal link
  '8984539', // Good link
  '9126522', // Strong link
  '8109847', // Skillful link
  '8939304', // Hot link
  '8109846', // Fabulous link
  '8111059', // Rich link
  '9003389'  // Sharp-witted link
];

declare global {
  interface Window {
    [key: string]: any;
  }
}

export const showAd = async (type: 'rewarded' | 'pop' | 'inApp' = 'rewarded'): Promise<void> => {
  const adFnName = `show_${MONETAG_ZONE_ID}`;
  
  if (typeof window[adFnName] !== 'function') {
    console.error(`Monetag SDK function ${adFnName} not found.`);
    return;
  }

  try {
    if (type === 'rewarded') {
      await window[adFnName]();
    } else if (type === 'pop') {
      await window[adFnName]('pop');
    } else if (type === 'inApp') {
      window[adFnName]({
        type: 'inApp',
        inAppSettings: {
          frequency: 2,
          capping: 0.1,
          interval: 30,
          timeout: 5,
          everyPage: false
        }
      });
    }
  } catch (error) {
    console.error('Ad playback error:', error);
  }
};

export const triggerAutoMonetization = () => {
  // Randomly open a direct link in the background/new tab occasionally
  const randomIndex = Math.floor(Math.random() * DIRECT_LINKS.length);
  const linkId = DIRECT_LINKS[randomIndex];
  
  // Open the Monetag direct link in a new tab
  try {
    const url = `https://whomeerog.com/4/${linkId}`;
    window.open(url, '_blank');
    console.log(`Auto-monetizing link opened: ${url}`);
  } catch (error) {
    console.error('Failed to open auto-monetization link:', error);
  }
};
