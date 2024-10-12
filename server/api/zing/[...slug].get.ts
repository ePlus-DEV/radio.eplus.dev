import { useZingMp3 } from "../../../composables/useZingMp3";

export default defineEventHandler((event) => {
  const zing = useZingMp3();
  const query = getQuery(event);

  const Id = Array.isArray(query.id) ? query.id[0] : query.id;
  if (typeof Id !== "string") {
    throw new Error("Invalid song ID");
  }

  const slug = getRouterParam(event, 'slug')

  switch (slug) {
    case "song":
      return zing.get_song(Id);
    case "song-info":
      return zing.get_song_info(Id);
    case "lyric":
      return zing.get_song_lyric(Id);
    case "home":
      return zing.get_home();
    case "chart-home":
      return zing.get_home_chart();
    case "newrelease-chart":
      return zing.get_new_release_chart();
    case "week-chart":
      return zing.get_week_chart(Id, query.week ? Number(query.week) : 0);
    case "radio-program-list":
      return zing.get_radio_program_list(Id);
    case "radio-program-detail":
      return zing.get_radio_program_detail(Id);
    case "radio":
      return zing.get_radio;
    case "radio-comment":
      return zing.get_radio_comment(Id);
    case "get_list_by_genre":
      return zing.get_list_by_genre(Id);
    default:
      throw new Error("Invalid slug");
  }
});
