dayjs.extend(dayjs_plugin_relativeTime);
let page = 1;

function getItems(username) {
  fetchAsync(username, page)
    .then(filterUselessEvents)
    .then((data) => {
      $(".loader").css("display", "none");
      $(".timeline-user").css("display", "block");

      data.forEach((element) => {
        $(".timeline").append(`
          <div class="item">
            <img class="avatar" src="${element.actor.avatar_url}">
            <span>
              <a class="link" href="https://github.com/${
                element.actor.display_login
              }" target="_blank">${element.actor.display_login}</a>
              ${getEventType(element.type, element.payload).eventPrefix}
              <a class="link" href="https://github.com/${
                element.repo.name
              }" target="_blank">${element.repo.name}</a>
              ${getEventType(element.type, element.payload).eventSuffix}
              <span class="date">${dayjs(element.created_at).fromNow()}</span>
            </span>
          </div>
        `);
      });
      page = page + 1;
    })
    .catch((reason) => console.log(reason.message));
}

function getEventType(type, payload) {
  let eventPrefix = "";
  let eventSuffix = "";

  switch (type) {
    case "WatchEvent":
      eventPrefix = "starred";
      eventSuffix = "";
      break;
    case "ForkEvent":
      eventPrefix = `forked <a href="${payload.forkee.html_url}" class="link">${payload.forkee.full_name}</a> from `;
      eventSuffix = "";
      break;
    case "PublicEvent":
      eventPrefix = "made";
      eventSuffix = "public";
      break;
    case "CreateEvent":
      eventPrefix = "created a repository";
      eventSuffix = "";
      break;
    case "PullRequestEvent":
      eventPrefix = "opened a pull request in";
      eventSuffix = "";
      break;
    case "PushEvent":
      eventPrefix = "pushed a commit";
      eventSuffix = "";
      break;
    default:
      eventPrefix = "";
      eventSuffix = "";
  }
  return { eventPrefix, eventSuffix };
}

function filterUselessEvents(events) {
  return events.filter((element) => element.type !== "MemberEvent");
}

function addUsernameToSearchParams(username) {
  const url = new URL(document.location.href);
  const params = new URLSearchParams(url.search);
  params.set("username", username);
  window.history.pushState(
    {},
    "",
    decodeURIComponent(`${location.pathname}?${params}`)
  );
}

function getTimeline(username) {
  page = 1;
  addUsernameToSearchParams(username);
  $(".items").html(
    `<h2 class="align-items-center timeline-user">@${username}'s Timeline</h2>`
  );
  $("#load-more").css("display", "block");

  getItems(username);
}

$("#get-timeline").click((e) => {
  e.preventDefault();
  let username = $("#username").val().trim();

  getTimeline(username);
});

$("#load-more").click((e) => {
  e.preventDefault();
  let username = $("#username").val().trim();

  getItems(username);
});

async function fetchAsync(username, page = 1) {
  $(".loader").css("display", "block");

  let data = await fetch(
    `https://api.github.com/users/${username}/received_events?page=${page}`
  );
  let timeline = await data.json();
  return timeline;
}

function main() {
  const params = new URLSearchParams(location.search);
  const username = params.get("username");

  if (username) {
    $("#username").val(username);
    getTimeline(username);
  }
}

main();
