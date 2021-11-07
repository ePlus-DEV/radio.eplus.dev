export default async (context, locale) => {
  return await Promise.resolve({
    navmenu: {
      homepage: "Homepage",
      about: "About",
      blog: "Blog",
      group: "Group",
      terms: "Terms",
      contact: "Contact",
      language: "Language:",
      old_version: "#oldversion",
      statistics: "Statistics"
    },
    terms: {
      content:
        "Radio channels are sourced from stations around the world, we are not responsible for the content of Radio channels. Please think before you plan to follow something. The website is completely free, does not charge or make money in any way on the website."
    },
    contact: {
      content:
        "We always appreciate any comments or contributions to stream links to diversify Radio channels on the website. For any contributions, please contact the contact below. Thank you."
    },
    world: {
      africa: {},
      asia: {
        name: "Asia",
        vietnam: "Vietnam",
        singapore: "Singapore",
        korea: "Korea",
        china: "China",
        hong_kong: "Hong Kong"
      },
      central_america: {},
      europe: {
        name: "Europe",
        united_kingdom: "United Kingdom"
      },
      north_america: {
        name: "North America",
        cuba: "Cuba"
      },
      oceania: {
        name: "Oceania",
        australia: "Australia",
        new_zealand: "New Zealand"
      },
      south_america: {}
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
      playlist: "Playlist"
    },
    button: {
      back: "Back",
      close: "Close"
    },
    popup: {
      search: {
        text: "Search...",
        stats:
          "Page {page} of {nbPages} - {nbHits} hits retrieved in {processingTimeMS} ms"
      }
    },
    notify: {
      success: "Success",
      success_content: "Can play radio: {radio}",
      error: "Error",
      error_content: "Unable to play radio: {radio}"
    },
    statistics_tooltip: {
      text: "Incidents: {num} | Downtime: {time} mins"
    },
    404: {
      content:
        "We would like to inform that the page you are looking for, does not exist!"
    }
  });
};
