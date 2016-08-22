const INDIEGOGO_URL = 'https://www.indiegogo.com/projects/haxeflixel-games-software#/backers'
const SHOW_MORE_SELECTOR = '.campaignBackers-seeMore'
const SHOW_MORE_BUTTON_SELECTOR = '.campaignBackers-seeMore a'
const PLEDGE_ITEM_SELECTOR = '.campaignBackers-pledge'
const Nightmare = require('nightmare')
const fs = require('fs')
const vo = require('vo');

vo(run)(function (err, result) {
    if (err) throw err;

    console.log('Total of', result.length, 'backers')
    fs.writeFileSync('backers.json', JSON.stringify(result, null, 4))
    process.exit(0)
});

function* run() {
    var nightmare = Nightmare({
        show: false,
        openDevTools: true,
        waitTimeout: 90000000
    })
        .goto(INDIEGOGO_URL)
        .wait(1000)
        .wait(SHOW_MORE_BUTTON_SELECTOR)

    var moreExists = true
    var count = 1
    while (moreExists) {
        yield nightmare
            .click(SHOW_MORE_BUTTON_SELECTOR)
            .wait(1000)

        console.log('Show more button count', count)
        count++

        moreExists = yield nightmare.visible('.campaignBackers-seeMore')
        var pledges = yield nightmare.evaluate(queryPledges, PLEDGE_ITEM_SELECTOR)
        console.log('Pledges found', pledges.length)
    }

    var pledges = yield nightmare.evaluate(parseQueryPledges, PLEDGE_ITEM_SELECTOR)
    yield nightmare.end()
    return pledges
}

function queryPledges(PLEDGE_ITEM_SELECTOR) {
    return Array.prototype.map.call(
        document.querySelectorAll(PLEDGE_ITEM_SELECTOR),
        link => link
    )
}

function parseQueryPledges(PLEDGE_ITEM_SELECTOR) {
    var pledges = document.querySelectorAll(PLEDGE_ITEM_SELECTOR)
    var pledgeItems = Array.prototype.map.call(pledges, pledgeElement => {
        var pledge = {
            imgSrc: pledgeElement.querySelector('img').src,
            name: pledgeElement.querySelector('.campaignBackers-pledge-backer-details-text').innerText,
            url: pledgeElement.querySelector('.campaignBackers-pledge-backer-details-text').href
        }
        var amount = pledgeElement.querySelector('.campaignBackers-pledge-amount-bold').innerText.replace(/[^.\d$]/g, '')
        if (amount && amount !== '') pledge.amount = amount
        return pledge
    })
    return pledgeItems
}
