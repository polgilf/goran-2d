
  const api = { PALETTE, VIEWS, ANIMS, KEYPOSES, ART: { front: F, side: typeof S !== 'undefined' ? S : null }, create, buildMarkup, partMarkup, sampleTrack, EASE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Goran = api;
})(typeof window !== 'undefined' ? window : globalThis);
