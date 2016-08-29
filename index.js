const Nightmare = require('nightmare')
const fs = require('fs')
const vo = require('vo')

if (typeof process.env.PROJECT_NAME === 'undefined')
    throw 'Please provide a indiegogo project name as an environment variable PROJECT_NAME'

const INDIEGOGO_URL = `https://www.indiegogo.com/projects/${process.env.PROJECT_NAME}#/backers`
const SHOW_MORE_SELECTOR = '.campaignBackers > .campaignBackers-seeMore'
const SHOW_MORE_BUTTON_SELECTOR = '.campaignBackers-seeMore > a'
const BACKERS_COMPONENT_SELECTOR = 'campaign-backers > .campaignBackers'
const WAIT_TIME = 1000
const DEBUG = typeof process.env.DEBUG !== 'undefined'
const DEBUG_OPTIONS = {
    show: true,
    openDevTools: true,
    waitTimeout: 90000000
}

var nightmareOptions = DEBUG ? DEBUG_OPTIONS : {}

vo(run)(function (err, result) {
    if (err) throw err

    console.log('Total of', result.length, 'backers')
    result = result.sort(sortAmounts).reverse()

    fs.writeFileSync('backers.json', JSON.stringify(result, null, 4))
    process.exit(0)
})

function* run() {
    console.log(`Gathering info from ${INDIEGOGO_URL}`)
    var nightmare = Nightmare(nightmareOptions)
        .goto(INDIEGOGO_URL)
        .wait(WAIT_TIME)
        .wait(SHOW_MORE_BUTTON_SELECTOR)

    var moreExists = true
    while (moreExists) {
        var currentHeight = yield nightmare.evaluate(function () {
            return document.body.scrollHeight
        })

        yield nightmare.scrollTo(currentHeight, 0)
            .wait(WAIT_TIME)

        yield nightmare
            .click(SHOW_MORE_BUTTON_SELECTOR)
            .wait(WAIT_TIME)

        var currentHeight = yield nightmare.evaluate(function () {
            return document.body.scrollHeight
        })

        yield nightmare.scrollTo(currentHeight, 0)
            .wait(WAIT_TIME)

        moreExists = yield nightmare.evaluate(SHOW_MORE_SELECTOR => {
            return document.querySelectorAll(SHOW_MORE_SELECTOR).length > 1
        }, SHOW_MORE_SELECTOR)

        console.log('Loading more backers...')
    }

    console.log('All backers loaded')

    var allPledges = yield nightmare.evaluate(resolveAllBackers, BACKERS_COMPONENT_SELECTOR)
    yield nightmare.end()

    return allPledges
}

function resolveAllBackers(BACKERS_COMPONENT_SELECTOR) {
    var pledgeItemElements = document.querySelector(BACKERS_COMPONENT_SELECTOR).children
    var pledgeItems = Array.prototype.map.call(pledgeItemElements, parsePledge)

    return pledgeItems

    function parsePledge(pledgeElement) {
        var pledge = {
            imgSrc: pledgeElement.querySelector('img').src,
            name: pledgeElement.querySelector('.campaignBackers-pledge-backer-details-text').innerText,
            url: pledgeElement.querySelector('.campaignBackers-pledge-backer-details-text').href
        }
        var amount = pledgeElement.querySelector('.campaignBackers-pledge-amount-bold').innerText
        if (amount.match(/\$/)) {
            pledge.amount = amount.replace(/[^.\d$]/g, '')
        } else {
            pledge.amount = amount
        }
        return pledge
    }
}

function sortAmounts(a, b) {
    return parseAmount(a) - parseAmount(b)
}

function parseAmount(backer) {
    var amount = backer.amount
    if (typeof amount === 'undefined' || amount === '' || amount === 'Private') {
        amount = "$0"
    }
    var value = parseInt(amount.replace('$', ''))
    return value
}