export default async (context, locale) => {
  return await Promise.resolve({
    navmenu: {
      homepage: "Homepage",
      about: "About",
      blog: "Blog",
      group: "Group",
      terms: "Terms of Use",
      privacy: "Privacy Policy",
      contact: "Contact",
      language: "Language:",
      old_version: "#oldversion",
      statistics: "Statistics",
      changelog: "Changelog",
    },
    terms: {
      content:
        "Radio channels are sourced from stations around the world, we are not responsible for the content of Radio channels. Please think before you plan to follow something. The website is completely free, does not charge or make money in any way on the website.",
    },
    contact: {
      content:
        "We always appreciate any comments or contributions to stream links to diversify Radio channels on the website. For any contributions, please contact the contact below. Thank you.",
    },
    world: {
      africa: {
        name: "Africa",
        algeria: "Algeria",
        nigeria: "Nigeria",
      },
      asia: {
        name: "Asia",
        vietnam: "Vietnam",
        singapore: "Singapore",
        korea: "Korea",
        china: "China",
        hong_kong: "Hong Kong",
        japan: "Japan",
        malaysia: "Malaysia",
        philippines: "Philippines",
        indonesia: "Indonesia",
        thailand: "Thailand",
        bangladesh: "Bangladesh",
        pakistan: "Pakistan",
        india: "India",
      },
      central_america: {
        name: "Central America",
        costa_rica: "Costa Rica",
        el_salvador: "El Salvador",
        guatemala: "Guatemala",
        honduras: "Honduras",
      },
      europe: {
        name: "Europe",
        united_kingdom: "United Kingdom",
        ukraine: "Ukraine",
        russia: "Russia",
      },
      north_america: {
        name: "North America",
        cuba: "Cuba",
        haiti: "Haiti",
        jamaica: "Jamaica",
        mexico: "Mexico",
        puerto_rico: "Puerto Rico",
        dominican_republic: "Dominican Republic",
        trinidad_and_tobago: "Trinidad and Tobago",
      },
      oceania: {
        name: "Oceania",
        australia: "Australia",
        new_zealand: "New Zealand",
      },
      south_america: {},
    },
    panel: {
      most_popular: "Most popular in {name}",
      frequency: "Frequency",
      play_from_radio: "Play from Radio",
      country: "Country",
      radio_in: "Radio in {name}",
      description: "Description",
      category: "Category",
      schedule: "Schedule",
      playlist: "Playlist",
      next: "Next",
      lyric: "Lyric",
      no_lyric: "No lyric",
      updating: "Updating...",
    },
    button: {
      back: "Back",
      close: "Close",
    },
    popup: {
      search: {
        text: "Search...",
        stats:
          "Page {page} of {nbPages} - {nbHits} hits retrieved in {processingTimeMS} ms",
      },
    },
    notify: {
      success: "Success",
      success_content: "Can play radio: {radio}",
      error: "Error",
      error_content: "Unable to play radio: {radio}",
    },
    statistics_tooltip: {
      text: "Incidents: {num} | Downtime: {time} mins | {response}ms",
    },
    404: {
      content:
        "We would like to inform that the page you are looking for, does not exist!",
    },
    table: {
      status: "Status",
      commit: "Commit",
      created: "Created",
      updated: "Updated",
      published: "Published",
      view: "View",
    },
    alert: {
      play_button:
        "By default of the browser, you need to press the ▶ button to start listening to the Radio.",
    },
    text: {
      guide: "Guide",
      the_last_90_days: "The last 90 days",
    },
  });
};
