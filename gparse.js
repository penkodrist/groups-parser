const colors = require('colors')
const axios = require('axios')
const { JSDOM } = require('jsdom')
const fs = require('fs')
const fsp = require('fs').promises
const path = require('path')

let infoLabel = '[ INFO ]'.bgBlue.black.bold
let errorLabel = '[ ERROR ]'.bgRed.black.bold
let successLabel = '[ SUCCESS ]'.bgGreen.black.bold
let processLabel = '[ PROCESS ]'.bgMagenta.black.bold

let idsParsed = 0

let groupsFound = 0
let emptyGroupsFound = 0
let abortedIDs = 0
let i = 1
let iLimit = 999
let data = ''
let dom
let doc
let isDeprecated

let axiosExistenceTimeout = 10000

let groupsJson = {}

let loaderSequence = ["/", "-", "\\", "|"]
let e = 0
let loaderInterval

process.stdout.write(`${infoLabel} Welcome to ${'gparse'.bold}\n`)
setTimeout(() => {
    checkAvailability().then((err) => {
        if (!err) {
            loaderInterval = setInterval(() => {
                process.stdout.write(`\r${`[${loaderSequence[e]}]`.bold.green} Currently parsed ID: ${String(i).bold} | Groups IDs parsed: ${String(idsParsed).bold} | Groups found: ${String(groupsFound).bold} | Empty groups found: ${String(emptyGroupsFound).bold} | IDs aborted: ${String(abortedIDs).bold}`)
                if (e < loaderSequence.length - 1) {
                    e++
                } else {
                    e = 0
                }
            }, 250)
            groupsParse()
        }
    })
}, 100)

async function checkAvailability() {
    try {
        console.log(infoLabel, `Trying to get access to ${'https://bincol.ru/rasp/view.php'.underline.green}. Timeout: 30s`)
        const res = await axios.get('https://bincol.ru/rasp/view.php', {
            timeout: 30000
        })
        console.log(successLabel, `${'https://bincol.ru/rasp/view.php'.underline.green} is available.`)
        console.log(infoLabel, `Beginning parsing process. It can take a long time, so take a cup of whatever you want and just wait.`)
    } catch (err) {
        console.log(errorLabel, `${'https://bincol.ru/rasp/view.php'.underline.green} is unavailable. Exiting.`)
        process.exit()
    }
}

function groupsParse() {
    if (i <= iLimit) {
        checkExistence(`https://bincol.ru/rasp/view.php?id=${String(i).padStart(5, '0')}`, i).then()
        i++
        idsParsed++
    } else {
        clearInterval(loaderInterval)
        formJson().then()
        console.log(`\n${successLabel} Script has ended its work`)
        process.exit()
    }
}

async function checkExistence(url, index) {
    try {
        const res = await axios.get(url, {
            timeout: axiosExistenceTimeout
        })
        data = res.data
        dom = new JSDOM(data)
        doc = dom.window.document
        if (doc.querySelector('body > table > tbody > tr > td > p > b > b:nth-child(2)') === null) {
            groupsFound++
            await addGroup(String(index).padStart(5, '0'), doc.querySelector('body > table > tbody > tr:nth-child(1) > td > p > b').textContent)
        } else if (doc.querySelector('body > table > tbody > tr > td > p > b > b:nth-child(2)').textContent === "Deprecated") {
            emptyGroupsFound++
            isDeprecated = true
        }
        groupsParse()
        return true
    } catch(err) {
        if (String(err).startsWith('TypeError')) {
            return true
        }
        if (err.code !== `ECONNABORTED`) {
            console.log(`\n${errorLabel} Unknown connection error:`, err.code)
        } else if (err.code === `ECONNABORTED`) {
            console.log(`\n${errorLabel} Connection timeout:`, err.code)
            abortedIDs++
            groupsParse()
        }
        return false
    }
}

async function addGroup(id, readableText) {
    groupsJson = {
        ...groupsJson,
        [id]: readableText
    }
}

function formJson() {
    if (!fs.existsSync(path.join(__dirname, 'output'))) {
        fs.mkdir(path.join(__dirname, 'output'), (err) => {
            if (err) {
                console.log(`\n${errorLabel} Problem creating an output directory: ${err}`)
            }
        })
    }
    fs.writeFile(path.join(__dirname, 'output', 'bincol_groups.json'), JSON.stringify(groupsJson), (err) => {
        if (err) {
            console.log(err)
        }
    })
}
