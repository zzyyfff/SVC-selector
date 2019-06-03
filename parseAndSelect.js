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

const SEPARATOR = '===================================================================================='

const prompt = () => {
  const outputArray = []
  readline.question(`SVC-selector> `, (selectorString) => {
    let running = true
    selectorString = selectorString.trim()
    if (selectorString === '*') {
      console.log(SEPARATOR)
      console.log(util.inspect(sysViewController, false, null, true))
      console.log(SEPARATOR)
      console.log('Displaying complete view hierarchy')
      console.log('')
    } else if (selectorString === 'exit') {
      running = false
      readline.close()
    } else if (selectorString[0] !== '') {
      const [selectors, keys] = parseSelectorString(selectorString)
      selectedViewsIntoArray(selectors, keys, sysViewController, outputArray)
      console.log(`Selector string '${selectorString}' returned ${outputArray.length} reseults`)
      displayJson(outputArray, 'className', selectorString)
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

function displayJson (outputArray, key, selector) {
  readline.question(`Display each result as JSON? (Y/n) `, (answer) => {
    if (answer === 'Y' ||
        answer === 'y' ||
        answer === 'Yes' ||
        answer === 'yes') {
      console.log(SEPARATOR)
      outputArray.forEach(element => {
        console.log(util.inspect(element, false, null, true))
        console.log(SEPARATOR)
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

prompt()
