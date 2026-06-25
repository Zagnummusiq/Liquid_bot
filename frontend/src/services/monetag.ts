export const MONETAG_ZONE_ID = '8984545';

let cachedLinks: string[] = [];

export const fetchMonetizationLinks = async (): Promise<string[]> => {
  if (cachedLinks.length > 0) return cachedLinks;
  
  try {
    const response = await fetch('https://botlife-app.onrender.com/api/monetization/links');
    if (response.ok) {
      cachedLinks = await response.json();
      return cachedLinks;
    }
  } catch (error) {
    console.error('Failed to fetch monetization links from backend:', error);
  }
  
  // Fallback to static links if backend fails
  return [
    '8984644', '9611956', '9181340', '8929450', '8109845', 
    '9610697', '9611854', '9022048', '9135943', '8348809', 
    '8929419', '8984539', '9126522', '8109847', '8939304', 
    '8109846', '8111059', '9003389'
  ];
};

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

export const triggerAutoMonetization = async () => {
  const links = await fetchMonetizationLinks();
  const randomIndex = Math.floor(Math.random() * links.length);
  const linkId = links[randomIndex];
  
  try {
    const url = `https://whomeerog.com/4/${linkId}`;
    window.open(url, '_blank');
    console.log(`Auto-monetizing link opened: ${url}`);
  } catch (error) {
    console.error('Failed to open auto-monetization link:', error);
  }
};
