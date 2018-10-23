dayjs.extend(dayjs_plugin_relativeTime)
let page = 1

function getItems (username) {
    fetchAsync(username, page)
        .then(filterUselessEvents)
        .then(data => {
            $('.loader').css('display', 'none')
            $('.timeline').css('display', 'block')

            data.forEach(element => {
                $('.items').append(`
                <div class="row item-row">
                    <div class="col-md-9 d-flex align-self-center">
                        <img src="${element.actor.avatar_url}">

                        <span>
                            <a class="link" href="https://github.com/${element.actor.display_login}" target="_blank">${element.actor.display_login}</a>
                            ${getEventType(element.type, element.payload)}
                            <a class="link" href="https://github.com/${element.repo.name}" target="_blank">${element.repo.name}</a>
                        </span>
                    </div>

                    <div class="col-md-3 align-self-center text-right">
                        <span class="align-middle time"> ${dayjs(element.created_at).fromNow()}</span>
                    </div>
                </div>
                `)
            })

            page = page + 1

        })
        .catch(reason => console.log(reason.message))
}

function getEventType (type, payload) {
    let event = ''

    switch(type) {
        case 'WatchEvent':
            event = 'starred'
            break
        case 'ForkEvent':
            event = `forked <a href="${payload.forkee.html_url}" class="link">${payload.forkee.full_name}</a> from `
            break
        case 'PublicEvent':
            event = 'made public'
            break
        case 'CreateEvent':
            event = 'created a repository'
            break
        case 'PullRequestEvent':
            event = 'opened a pull request in'
            break
        case 'PushEvent':
            event = 'pushed a commit'
            break;
        default:
            event = ''
    }
    return event
}

function filterUselessEvents(events) {
    return events.filter(element => element.type !== 'MemberEvent')
}

function addUsernameToSearchParams(username) {
    const url = new URL(document.location.href)
    const params = new URLSearchParams(url.search)
    params.set('username', username)
    window.history.pushState({}, "", decodeURIComponent(`${location.pathname}?${params}`))
}

function getTimeline(username) {
    page = 1

    addUsernameToSearchParams(username)

    $('.items').html(`<h2 class="align-items-center timeline">@${username}'s Timeline</h2>`)
    $('.load-more').removeClass('d-none')
    getItems(username)
}

$('#get-timeline').click(e => {
    e.preventDefault()

    let username = $('#username').val().trim()

    getTimeline(username)
})

$('#load-more').click((e) => {
    e.preventDefault()
    let username = $('#username').val().trim()

    getItems(username)
})

async function fetchAsync (username, page = 1) {
    $('.loader').css('display', 'block')

    let response = await fetch(`https://api.github.com/users/${username}/received_events?page=${page}`)
    let data = await response.json()
    return data
}

function main() {
    const params = new URLSearchParams(location.search)
    const username = params.get('username')

    if (username) {
        $('#username').val(username)
        getTimeline(username)
    }
}

main()
