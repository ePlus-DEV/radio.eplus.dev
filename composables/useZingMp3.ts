import crypto from "crypto";
import axios from "axios";

/**
 * Class representing the Zing MP3 API client.
 * Provides methods to interact with various endpoints of the Zing MP3 API.
 * https://www.npmjs.com/package/zingmp3-api-next
 */
class Zingmp3 {
  private readonly URL: string;
  private readonly API_KEY: string;
  private readonly SECRET_KEY: string;
  private readonly CTIME: string;
  private readonly VERSION: string;

  constructor(
    URL: string,
    API_KEY: string,
    SECRET_KEY: string,
    CTIME: string,
    VERSION: string
  ) {
    this.URL = URL;
    this.API_KEY = API_KEY;
    this.SECRET_KEY = SECRET_KEY;
    this.CTIME = CTIME;
    this.VERSION = VERSION;
  }

  // Hash signature
  private static get_hash_256(str: string): string {
    return crypto.createHash("sha256").update(str).digest("hex");
  }

  /**
   * Generates an HMAC SHA-512 hash.
   * @param {string} str - The string to hash.
   * @param {string} key - The key to use for hashing.
   * @returns {string} The resulting HMAC SHA-512 hash.
   */
  private static get_hmac_512(str: string, key: string): string {
    const hmac = crypto.createHmac("sha512", key);
    return hmac.update(Buffer.from(str, "utf-8")).digest("hex");
  }

  /**
   * Generates a hash signature for API paths that include an ID.
   * @param {string} api_path - The API path.
   * @param {string} id - The ID to include in the hash.
   * @returns {string} The resulting hash signature.
   */
  private hash_has_id_signature(api_path: string, id: string): string {
    return Zingmp3.get_hmac_512(
      api_path +
        Zingmp3.get_hash_256(
          `ctime=${this.CTIME}id=${id}version=${this.VERSION}`
        ),
      this.SECRET_KEY
    );
  }

  /**
   * Generates a hash signature for API paths that do not include an ID.
   * @param {string} api_path - The API path.
   * @returns {string} The resulting hash signature.
   */
  private hash_no_id_signature(api_path: string): string {
    return Zingmp3.get_hmac_512(
      api_path +
        Zingmp3.get_hash_256(`ctime=${this.CTIME}version=${this.VERSION}`),
      this.SECRET_KEY
    );
  }

  /**
   * Generates a hash signature for the home radio API path.
   * @param {string} api_path - The API path.
   * @param {number} count - The count parameter.
   * @returns {string} The resulting hash signature.
   */
  private hash_home_radio_signature(api_path: string, count: number): string {
    return Zingmp3.get_hmac_512(
      api_path +
        Zingmp3.get_hash_256(
          `count=${count}ctime=${this.CTIME}page=1version=${this.VERSION}`
        ),
      this.SECRET_KEY
    );
  }

  /**
   * Generates a hash signature for the list genre API path.
   * @param {string} api_path - The API path.
   * @param {string} id - The ID to include in the hash.
   * @param {number} page - The page number.
   * @returns {string} The resulting hash signature.
   */
  private hash_list_genre_signature(
    api_path: string,
    id: string,
    page: number
  ): string {
    return Zingmp3.get_hmac_512(
      api_path +
        Zingmp3.get_hash_256(
          `count=10ctime=${this.CTIME}id=${id}page=${page}version=${this.VERSION}`
        ),
      this.SECRET_KEY
    );
  }

  /**
   * Generates a hash signature for the list MV API path.
   * @param {string} api_path - The API path.
   * @param {number} count - The count parameter.
   * @param {string} id - The ID to include in the hash.
   * @param {string} type - The type parameter.
   * @param {number} page - The page number.
   * @returns {string} The resulting hash signature.
   */
  private hash_list_mv_signature(
    api_path: string,
    count: number,
    id: string,
    type: string,
    page: number
  ): string {
    return Zingmp3.get_hmac_512(
      api_path +
        Zingmp3.get_hash_256(
          `count=${count}ctime=${this.CTIME}id=${id}page=${page}type=${type}version=${this.VERSION}`
        ),
      this.SECRET_KEY
    );
  }

  /**
   * Generates a hash signature for the category MV API path.
   * @param {string} api_path - The API path.
   * @param {string} id - The ID to include in the hash.
   * @param {string} type - The type parameter.
   * @returns {string} The resulting hash signature.
   */
  private hash_catergory_mv_signature(
    api_path: string,
    id: string,
    type: string
  ): string {
    return Zingmp3.get_hmac_512(
      api_path +
        Zingmp3.get_hash_256(
          `ctime=${this.CTIME}id=${id}type=${type}version=${this.VERSION}`
        ),
      this.SECRET_KEY
    );
  }

  /**
   * Generates a hash signature for the search API path.
   * @param {string} api_path - The API path.
   * @param {number} count - The count parameter.
   * @param {number} page - The page number.
   * @param {string} type - The type parameter.
   * @returns {string} The resulting hash signature.
   */
  private hash_search_signature(
    api_path: string,
    count: number,
    page: number,
    type: string
  ): string {
    return Zingmp3.get_hmac_512(
      api_path +
        Zingmp3.get_hash_256(
          `count=${count}ctime=${this.CTIME}page=${page}type=${type}version=${this.VERSION}`
        ),
      this.SECRET_KEY
    );
  }

  // Get Cookie
  private async get_cookie(): Promise<string | { error: string }> {
    try {
      const response = await axios.get(`${this.URL}`);
      const cookie_jar: string[] | undefined = response.headers["set-cookie"];
      const cookie = cookie_jar?.filter((_value, index) => index === 1)[0];

      if (cookie) {
        return cookie;
      } else {
        return { error: "Cookie not found" };
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Send Request
  private async send_request(
    api_path: string,
    params: object,
    is_suggestion = false
  ): Promise<Record<string, unknown>> {
    // Change base url for suggestion keyword
    const client = axios.create({
      baseURL: is_suggestion ? "https://ac.zingmp3.vn" : this.URL,
    });

    client.interceptors.response.use((response) => response.data);

    try {
      const cookie = await this.get_cookie();
      const response = await client.get(api_path, {
        headers: {
          Cookie: typeof cookie === "string" ? cookie : "",
        },
        params: {
          ...params,
          ctime: this.CTIME,
          version: this.VERSION,
          apiKey: this.API_KEY,
        },
      });

      return response as unknown as Record<string, unknown>;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the home page data.
   * @returns {Promise<Record<string, unknown>>} The home page data.
   */
  public async get_home(): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/page/get/home";
    const count = 30;

    try {
      const response = await this.send_request(api_path, {
        page: "1",
        count,
        segmentId: "-1",
        sig: this.hash_home_radio_signature(api_path, count),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the streaming information for a song.
   * @param {string} id - The ID of the song.
   * @returns {Promise<Record<string, unknown>>} The streaming information of the song.
   */
  public async get_song(id: string): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/song/get/streaming";

    try {
      const response = await this.send_request(api_path, {
        id,
        sig: this.hash_has_id_signature(api_path, id),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the information of a song.
   * @param {string} id - The ID of the song.
   * @returns {Promise<Record<string, unknown>>} The information of the song.
   */
  public async get_song_info(id: string): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/song/get/info";

    try {
      const response = await this.send_request(api_path, {
        id,
        sig: this.hash_has_id_signature(api_path, id),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the lyrics of a song.
   * @param {string} id - The ID of the song.
   * @returns {Promise<Record<string, unknown>>} The lyrics of the song.
   */
  public async get_song_lyric(id: string): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/lyric/get/lyric";

    try {
      const response = await this.send_request(api_path, {
        id,
        sig: this.hash_has_id_signature(api_path, id),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the home chart data.
   * @returns {Promise<Record<string, unknown>>} The home chart data.
   */
  public async get_home_chart(): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/page/get/chart-home";

    try {
      const response = await this.send_request(api_path, {
        sig: this.hash_no_id_signature(api_path),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the new release chart data.
   * @returns {Promise<Record<string, unknown>>} The new release chart data.
   */
  public async get_new_release_chart(): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/page/get/newrelease-chart";

    try {
      const response = await this.send_request(api_path, {
        sig: this.hash_no_id_signature(api_path),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the week chart data.
   * @param {string} id - The ID of the chart.
   * @param {number} [week=0] - The week number.
   * @param {number} [year=0] - The year.
   * @returns {Promise<Record<string, unknown>>} The week chart data.
   */
  public async get_week_chart(
    id: string,
    week = 0,
    year = 0
  ): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/page/get/week-chart";

    try {
      const response = await this.send_request(api_path, {
        id,
        week,
        year,
        sig: this.hash_has_id_signature(api_path, id),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the radio data.
   * @returns {Promise<Record<string, unknown>>} The radio data.
   */
  public async get_radio(): Promise<unknown> {
    const api_path = "/api/v2/page/get/radio";
    const count = 10;
    const page = 1;

    try {
      const response = await this.send_request(api_path, {
        page,
        count,
        sig: this.hash_home_radio_signature(api_path, count),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the information of a radio.
   * @param {string} id - The ID of the radio.
   * @returns {Promise<Record<string, unknown>>} The information of the radio.
   */
  public async get_radio_info(id: string): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/livestream/get/info";

    try {
      const response = await this.send_request(api_path, {
        id,
        sig: this.hash_has_id_signature(api_path, id),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the list of radio programs.
   * @param {string} id - The ID of the radio.
   * @returns {Promise<Record<string, unknown>>} The list of radio programs.
   */
  public async get_radio_program_list(
    id: string
  ): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/livestream/program/get/list";

    try {
      const response = await this.send_request(api_path, {
        id,
        sig: this.hash_has_id_signature(api_path, id),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the details of a radio program.
   * @param {string} id - The ID of the radio program.
   * @returns {Promise<Record<string, unknown>>} The details of the radio program.
   */
  public async get_radio_program_detail(
    id: string
  ): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/livestream/program/get/detail";

    try {
      const response = await this.send_request(api_path, {
        id,
        sig: this.hash_has_id_signature(api_path, id),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the comments for a radio.
   * @param {string} id - The ID of the radio.
   * @returns {Promise<Record<string, unknown>>} The comments of the radio.
   */
  public async get_radio_comment(id: string): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/download/livestream/get/comments";

    try {
      const response = await this.send_request(api_path, {
        id,
        sig: this.hash_has_id_signature(api_path, id),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches a list of items by genre.
   * @param {string} id - The ID of the genre.
   * @param {number} [page=1] - The page number.
   * @returns {Promise<Record<string, unknown>>} The list of items by genre.
   */
  public async get_list_by_genre(
    id: string,
    page = 1
  ): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/feed/get/list-by-genre";
    const count = 10;

    try {
      const response = await this.send_request(api_path, {
        id,
        page,
        count,
        sig: this.hash_list_genre_signature(api_path, id, page),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the information of an artist.
   * @param {string} name - The name of the artist.
   * @returns {Promise<Record<string, unknown>>} The information of the artist.
   */
  public async get_artist(name: string): Promise<unknown> {
    const api_path = "/api/v2/page/get/artist";

    try {
      const response = await this.send_request(api_path, {
        alias: name,
        sig: this.hash_no_id_signature(api_path),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the hub home data.
   * @returns {Promise<Record<string, unknown>>} The hub home data.
   */
  public async get_hub_home(): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/page/get/hub-home";

    try {
      const response = await this.send_request(api_path, {
        sig: this.hash_no_id_signature(api_path),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the details of a hub.
   * @param {string} id - The ID of the hub.
   * @returns {Promise<Record<string, unknown>>} The details of the hub.
   */
  public async get_hub_detail(id: string): Promise<unknown> {
    const api_path = "/api/v2/page/get/hub-detail";

    try {
      const response = await this.send_request(api_path, {
        id,
        sig: this.hash_has_id_signature(api_path, id),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the top 100 songs.
   * @returns {Promise<Record<string, unknown>>} The top 100 songs.
   */
  public async get_top_100(): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/page/get/top-100";

    try {
      const response = await this.send_request(api_path, {
        sig: this.hash_no_id_signature(api_path),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches a list of music videos.
   * @param {string} id - The ID of the genre.
   * @param {string} [sort="listen"] - The sort order (listen, hot, new).
   * @param {number} [page=1] - The page number.
   * @param {number} [count=15] - The number of items per page.
   * @returns {Promise<Record<string, unknown>>} The list of music videos.
   */
  public async get_list_mv(
    id: string,
    sort = "listen",
    page = 1,
    count = 15
  ): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/video/get/list";
    const sort_list = ["listen", "hot", "new"];
    const type = "genre";

    try {
      if (!sort_list.includes(sort))
        throw new Error("Sort must be listen || hot || new.");

      const response = await this.send_request(api_path, {
        id,
        type,
        page,
        count,
        sort,
        sig: this.hash_list_mv_signature(api_path, count, id, type, page),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the category music video information.
   * @param {string} id - The ID of the category.
   * @returns {Promise<Record<string, unknown>>} The category music video information.
   */
  public async get_category_mv(id: string): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/genre/get/info";
    const type = "video";

    try {
      const response = await this.send_request(api_path, {
        id,
        type,
        sig: this.hash_catergory_mv_signature(api_path, id, type),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the music video information.
   * @param {string} id - The ID of the music video.
   * @returns {Promise<Record<string, unknown>>} The music video information.
   */
  public async get_mv(id: string): Promise<unknown> {
    const api_path = "/api/v2/page/get/video";

    try {
      const response = await this.send_request(api_path, {
        id,
        sig: this.hash_has_id_signature(api_path, id),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the playlist information.
   * @param {string} id - The ID of the playlist.
   * @returns {Promise<Record<string, unknown>>} The playlist information.
   */
  public async get_playlist(id: string): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/page/get/playlist";

    try {
      const response = await this.send_request(api_path, {
        id,
        sig: this.hash_has_id_signature(api_path, id),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Fetches the suggested playlists for a given playlist ID.
   * @param {string} id - The ID of the playlist.
   * @returns {Promise<Record<string, unknown>>} The suggested playlists.
   */
  public async get_suggested_playlists(
    id: string
  ): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/playlist/get/section-bottom";

    try {
      const response = await this.send_request(api_path, {
        id,
        sig: this.hash_has_id_signature(api_path, id),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Search all (Music, Playlist, Artist, Video)
  public async search_all(keyword: string): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/search/multi";

    try {
      const response = await this.send_request(api_path, {
        q: keyword,
        sig: this.hash_no_id_signature(api_path),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Searches for items by type.
   * @param {string} keyword - The search keyword.
   * @param {string} type - The type of items to search for (song, playlist, artist, video).
   * @param {number} [page=1] - The page number.
   * @param {number} [count=18] - The number of items per page.
   * @returns {Promise<Record<string, unknown>>} The search results.
   */
  public async search_by_type(
    keyword: string,
    type: string,
    page = 1,
    count = 18
  ): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/search";
    const type_list = ["song", "playlist", "artist", "video"];
    try {
      if (!type_list.includes(type))
        throw new Error("Type must be song || playlist || artist || video.");

      const response = await this.send_request(api_path, {
        q: keyword,
        type,
        page,
        count,
        sig: this.hash_search_signature(api_path, count, page, type),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Default suggest keyword
  public async get_recommend_keyword(): Promise<Record<string, unknown>> {
    const api_path = "/api/v2/app/get/recommend-keyword";

    try {
      const response = await this.send_request(api_path, {
        sig: this.hash_no_id_signature(api_path),
      });

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Suggest keyword when searching
  public async get_suggestion_keyword(
    keyword?: string
  ): Promise<Record<string, unknown>> {
    const api_path = "/v1/web/suggestion-keywords";

    try {
      const response = await this.send_request(
        api_path,
        {
          num: "10",
          query: keyword,
          language: "vi",
          sig: this.hash_no_id_signature(api_path),
        },
        true
      );

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }
}

/**
 * Factory function to create an instance of Zingmp3 API client.
 * @returns {Zingmp3} An instance of Zingmp3 API client.
 */
export const useZingMp3 = () => {
  const URL = "https://zingmp3.vn";
  const API_KEY = "88265e23d4284f25963e6eedac8fbfa3";
  const SECRET_KEY = "2aa2d1c561e809b267f3638c4a307aab";
  const CTIME = String(Math.floor(Date.now() / 1000));
  const VERSION = "1.6.40";

  return new Zingmp3(URL, API_KEY, SECRET_KEY, CTIME, VERSION);
};
