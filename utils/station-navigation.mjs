export const getAdjacentStation = (
  stations,
  activeStationId,
  offset,
) => {
  if (!Array.isArray(stations) || (offset !== -1 && offset !== 1)) return undefined;

  // A partially loaded queue can contain empty entries. Never select one as
  // the next playable station or match its missing ID against an unset ID.
  const seenIds = new Set();
  const playable = stations.filter((station) => {
    if (!station || station.id == null || station.id === '' || seenIds.has(station.id)) return false;
    seenIds.add(station.id);
    return true;
  });
  if (playable.length < 2) return undefined;

  const currentIndex = playable.findIndex(
    (station) => station.id === activeStationId,
  );

  if (currentIndex < 0) {
    return offset > 0 ? playable[0] : playable[playable.length - 1];
  }

  const nextIndex =
    (currentIndex + offset + playable.length) % playable.length;

  return playable[nextIndex];
};
