import { useZingMp3 } from "../../../composables/useZingMp3";

export default defineEventHandler((event) => {
  const zing = useZingMp3();
  const query = getQuery(event);

  const songId = Array.isArray(query.id) ? query.id[0] : query.id;
  if (typeof songId !== "string") {
    throw new Error("Invalid song ID");
  }
  return zing.get_home_chart();
});
