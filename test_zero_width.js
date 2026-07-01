// Quick test to verify the issue
const { renderHook } = require('@testing-library/react');
const { useSEO } = require('./dist/index.js');

// Reset DOM
document.head.innerHTML = '';
document.title = '';

// Test 1: ogImageWidth: 0 with legacy ogImage
console.log('Testing ogImageWidth: 0...');
const { rerender: rerender1 } = renderHook(() =>
  useSEO({
    ogImage: 'https://example.com/img.jpg',
    ogImageWidth: 0,
    ogImageHeight: 630,
    autoCanonical: false,
    enableWarnings: false,
  })
);

const widthMeta = document.querySelector('meta[property="og:image:width"]');
const heightMeta = document.querySelector('meta[property="og:image:height"]');

console.log('Width meta present:', !!widthMeta);
if (widthMeta) {
  console.log('Width meta content:', widthMeta.getAttribute('content'));
}
console.log('Height meta present:', !!heightMeta);
if (heightMeta) {
  console.log('Height meta content:', heightMeta.getAttribute('content'));
}

// Reset for next test
document.head.innerHTML = '';
document.title = '';

// Test 2: twitterPlayerWidth: 0 (for comparison)
console.log('\nTesting twitterPlayerWidth: 0...');
renderHook(() =>
  useSEO({
    twitterCard: 'player',
    twitterPlayer: 'https://example.com/player',
    twitterPlayerWidth: 0,
    autoCanonical: false,
    enableWarnings: false,
  })
);

const playerWidthMeta = document.querySelector('meta[name="twitter:player:width"]');
console.log('Player width meta present:', !!playerWidthMeta);
if (playerWidthMeta) {
  console.log('Player width meta content:', playerWidthMeta.getAttribute('content'));
}
