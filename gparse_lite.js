const colors = require('colors')
const axios = require('axios')
const { JSDOM } = require('jsdom')
const fs = require('fs')
const fsp = require('fs').promises
const path = require('path')

let infoLabel = '[ INFO ]'.bgBlue.black.bold
let errorLabel = '[ ERROR ]'.bgRed.black.bold
let successLabel = '[ SUCCESS ]'.bgGreen.black.bold
let statusLabel = '[ STATUS ]'.bgYellow.black.bold

let url = 'https://bincol.ru/rasp/grupp.php'
let connCycleTimeout
let res
let dom
let doc

let id
let stringName
let outputJSON = {}

console.log(`Welcome to ${'gparse (lite method)'.bold}`)
checkAvailability().then((err) => {
    if (!err) {
        parseData().then(() => {
            try {
                writeJSON().then()
            } catch (err) {
                if (String(err).startsWith("TypeError")) {
                    return true
                }
            }
        })
    }
})

async function checkAvailability() {
    clearTimeout(connCycleTimeout)
    console.log(`${infoLabel} Trying to connect to ${url.green.underline}. Timeout: ${'60s'.bold}`)
    try {
        res = await axios.get(url, {
            timeout: 60000,
        })
        console.log(successLabel, `${url.green.underline} is available. Beginning the parse process`)
        res = res.data
        dom = new JSDOM(res)
        doc = dom.window.document
    } catch (err) {
        if (err.code !== 'ECONNABORTED') {
            console.log(`${errorLabel} Unknown axios error occurred: ${err}`)
        } else {
            console.log(`${errorLabel} Axios connection has timed out: ${err}`)
        }
        return err
    }
}
async function parseData() {
    await doc.querySelectorAll('.modernsmall').forEach(e => {
        id = e.getAttribute('href').slice(12)
        stringName = e.textContent
        outputJSON = {
            ...outputJSON,
            [id]: stringName
        }
    })
}
function writeJSON() {
    outputJSON = JSON.stringify(outputJSON)
    if (!fs.existsSync(path.join(__dirname, 'output_lite'))) {
        fs.mkdir(path.join(__dirname, 'output_lite'), (err) => {
            if (err) {
                console.log(`\n${errorLabel} Problem creating an output directory: ${err}`)
            }
        })
    }
    fs.writeFile(path.join(__dirname, 'output_lite', 'bincol_groups.json'), outputJSON, (err) => {
        if (err) {
            console.log(err)
        }
    })
}