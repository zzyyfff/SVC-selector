'use strict'

const fs = require('fs')
const util = require('util')
util.inspect.styles.name = 'underline'
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

let rawdata = fs.readFileSync('SystemViewController.json')
let sysViewController = JSON.parse(rawdata)

const prompt = () => {
  const outputArray = []
  readline.question(`SVC-selector> `, (selectorString) => {
    let running = true
    selectorString = selectorString.trim()
    if (selectorString === '*') {
      console.log(util.inspect(sysViewController, false, null, true))
    } else if (selectorString === 'exit') {
      running = false
      readline.close()
    } else if (selectorString[0] === '.') {
      viewsOfKeyIntoArray(selectorString.slice(1), 'classNames', sysViewController, outputArray)
      console.log(`className '${selectorString}' returned ${outputArray.length} reseults`)
      displayJson(outputArray, 'className', selectorString)
    } else if (selectorString[0] === '#') {
      viewsOfKeyIntoArray(selectorString.slice(1), 'identifier', sysViewController, outputArray)
      console.log(`identifier '${selectorString}' returned ${outputArray.length} reseults`)
      displayJson(outputArray, 'identifier', selectorString)
    } else if (selectorString !== '') {
      viewsOfKeyIntoArray(selectorString, 'class', sysViewController, outputArray)
      console.log(`class '${selectorString}' returned ${outputArray.length} reseults`)
      displayJson(outputArray, 'class', selectorString)
    }
    if (running) prompt()
  })
}

function displayJson (outputArray, key, selector) {
  readline.question(`Display each result as JSON? (Y/n) `, (answer) => {
    if (answer === 'Y' ||
        answer === 'y' ||
        answer === 'Yes' ||
        answer === 'yes') {
      console.log('====================================================================================')
      outputArray.forEach(element => {
        console.log(util.inspect(element, false, null, true))
        console.log('====================================================================================')
      })
      console.log(`>> Displayed ${outputArray.length} reseults for ${key} '${selector}'`)
      console.log('')
      readline.pause()
      prompt()
    }
    readline.pause()
    prompt()
  })
}

function viewsOfKeyIntoArray (selector, key, obj, arr) {
  if (obj[key] === selector) arr.push(obj)
  if (Array.isArray(obj[key]) && obj[key].includes(selector)) arr.push(obj)
  if (obj['subviews'] && obj['subviews'].length > 0) {
    obj['subviews'].forEach(element => viewsOfKeyIntoArray(selector, key, element, arr))
  }
  if (obj['contentView'] &&
      obj['contentView']['subviews'] &&
      obj['contentView']['subviews'].length > 0) {
    obj['contentView']['subviews'].forEach(element => viewsOfKeyIntoArray(selector, key, element, arr))
  }
  if (obj['control']) viewsOfKeyIntoArray(selector, key, obj['control'], arr)
}

prompt()
