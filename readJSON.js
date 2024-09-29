const fs = require('fs').promises
const path = require('path')
const express = require('express')

const app = express()

let data

let min = 244
let max = 345

let readd

readFile().then(outputContents)

async function readFile() {
    data = await fs.readFile(path.join(__dirname, 'output', 'bincol_groups.json'), 'utf-8')
}

async function outputContents() {
    data = JSON.parse(data)
    console.log(data)
    for (let i = min; i < max; i++) {
        readd = data[String(i).padStart(5, '0')]
        if (readd !== undefined) {
            console.log(readd)
        }
    }
}

app.get('/', (req, res) => {
    res.send(data)
})

app.listen(3000, () => {
    console.log('server started')
})