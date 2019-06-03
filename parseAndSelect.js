'use strict'

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

const fs = require('fs')
let rawdata = fs.readFileSync('SystemViewController.json')
let sysViewController = JSON.parse(rawdata)
require('node-json-color-stringify')
const SEPARATOR = '===================================================================================='

const prompt = () => {
  const outputArray = []
  readline.question(`SVC-selector> `, (selectorString) => {
    let running = true
    selectorString = selectorString.trim()
    if (selectorString === '*') {
      displayAll()
    } else if (selectorString === 'exit') {
      running = false
      readline.close()
    } else if (selectorString[0] !== '') {
      const [selectors, keys] = parseSelectorString(selectorString)
      selectedViewsIntoArray(selectors, keys, sysViewController, outputArray)
      displayViewsAsJson(outputArray, selectorString)
    }
    if (running) prompt()
  })
}

function selectedViewsIntoArray (selectors, keys, obj, arr) {
  if (selectors.length === 1) {
    if (obj[keys[0]] === selectors[0] && !arr.includes(obj)) arr.push(obj)
    if (Array.isArray(obj[keys[0]]) && obj[keys[0]].includes(selectors[0]) && !arr.includes(obj)) arr.push(obj)
  } else {
    if (obj[keys[0]] === selectors[0]) selectedViewsIntoArray(selectors.slice(1), keys.slice(1), obj, arr)
    if (Array.isArray(obj[keys[0]]) && obj[keys[0]].includes(selectors[0])) selectedViewsIntoArray(selectors.slice(1), keys.slice(1), obj, arr)
  }

  if (obj['subviews'] && obj['subviews'].length > 0) {
    obj['subviews'].forEach(element => selectedViewsIntoArray(selectors, keys, element, arr))
  }
  if (obj['contentView'] &&
      obj['contentView']['subviews'] &&
      obj['contentView']['subviews'].length > 0) {
    obj['contentView']['subviews'].forEach(element => selectedViewsIntoArray(selectors, keys, element, arr))
  }
  if (obj['control']) selectedViewsIntoArray(selectors, keys, obj['control'], arr)
}

function parseSelectorString (selectorString) {
  const [selectors, keys] = [selectorString.split(' '), []]

  for (let i = 0; i < selectors.length; i++) {
    if (selectors[i][0] === '.') {
      keys.push('classNames')
      selectors[i] = selectors[i].slice(1)
    } else if (selectors[i][0] === '#') {
      keys.push('identifier')
      selectors[i] = selectors[i].slice(1)
    } else {
      keys.push('class')
    }
  }

  return [selectors, keys]
}

function displayViewsAsJson (outputArray, selectorString) {
  console.log(`Selector string '${selectorString}' returned ${outputArray.length} reseults`)

  readline.question(`Display each result as JSON? (Y/n) `, (answer) => {
    if (answer === 'Y' ||
        answer === 'y' ||
        answer === 'Yes' ||
        answer === 'yes') {
      console.log(SEPARATOR)
      outputArray.forEach(element => {
        console.log(JSON.colorStringify(element, null, 2))
        console.log(SEPARATOR)
      })
      console.log(`>> Displayed ${outputArray.length} reseults for ${selectorString}'`)
      console.log('')
      readline.pause()
      prompt()
    }
    readline.pause()
    prompt()
  })
}

function displayAll () {
  console.log(SEPARATOR)
  console.log(JSON.colorStringify(sysViewController, null, 2))
  console.log(SEPARATOR)
  console.log('Complete view hierarchy.')
  console.log('')
}

prompt()
