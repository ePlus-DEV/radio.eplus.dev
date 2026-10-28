export function playbackHealth({ online, error, unsupported, waiting }) {
  if (!online) return 'offline';
  if (error) return unsupported ? 'unsupported' : 'exhausted';
  return waiting ? 'connecting' : '';
}
