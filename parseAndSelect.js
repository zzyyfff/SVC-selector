'use strict'

require('node-json-color-stringify')
const fs = require('fs')
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

const SEPARATOR = '===================================================================================='

const rawdata = fs.readFileSync('SystemViewController.json')
const systemViewController = JSON.parse(rawdata)

const main = (running = true) => {
  if (!running) return
  const outputArray = []
  svcPromptPromise()
    .then(selectorString => {
      if (selectorString === '*') {
        displayAll()
      } else if (selectorString === 'exit') {
        running = false
        readline.close()
      } else if (selectorString !== '') {
        const [selectors, keys] = parseSelectorString(selectorString)

        selectedViewsIntoArray(selectors, keys, systemViewController, outputArray)
        console.log(pluralize`Selector string '${selectorString}' returned ${outputArray.length} reseult`)

        if (outputArray.length > 0) return displayPromptPromise(outputArray, selectorString)
      }
    })
    .then(() => main(running))
}

const svcPromptPromise = () => {
  return new Promise((resolve, reject) => {
    readline.question(`SVC-selector> `, (selectorString) => {
      selectorString = selectorString.trim()
      resolve(selectorString)
    })
  })
}

const displayPromptPromise = (outputArray, selectorString) => {
  return new Promise((resolve, reject) => {
    readline.question(`Display each result as JSON? (Y/n) `, (answer) => {
      if (answer === 'Y' ||
          answer === 'y' ||
          answer === 'Yes' ||
          answer === 'yes') {
        displayViewsAsJson(outputArray, selectorString)
      }
      readline.pause()
      resolve()
    })
  })
}

function selectedViewsIntoArray (selectors, keys, obj, outputArray, isChildNode = true) {
  if (matchesSelector(selectors, keys, obj) && isChildNode) {
    if (selectors.length === 1) {
      if (!outputArray.includes(obj)) outputArray.push(obj)
    } else {
      selectedViewsIntoArray(selectors.slice(1), keys.slice(1), obj, outputArray, false)
    }
  }

  if (obj['subviews'] && obj['subviews'].length > 0) {
    obj['subviews'].forEach(element => selectedViewsIntoArray(selectors, keys, element, outputArray))
  }
  if (obj['contentView'] &&
      obj['contentView']['subviews'] &&
      obj['contentView']['subviews'].length > 0) {
    obj['contentView']['subviews'].forEach(element => selectedViewsIntoArray(selectors, keys, element, outputArray))
  }
  if (obj['control']) selectedViewsIntoArray(selectors, keys, obj['control'], outputArray)
}

function matchesSelector (selectors, keys, obj) {
  return obj[keys[0]] === selectors[0] || (Array.isArray(obj[keys[0]]) && obj[keys[0]].includes(selectors[0]))
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

function pluralize (strings, selectorString, outputArrayLength) {
  let finalS = 's'
  if (outputArrayLength === 1) finalS = ''
  return `${strings[0]}${selectorString}${strings[1]}${outputArrayLength}${strings[2]}${finalS}.`
}

function displayViewsAsJson (outputArray, selectorString) {
  console.log(SEPARATOR)
  outputArray.forEach(element => {
    console.log(JSON.colorStringify(element, null, 2))
    console.log(SEPARATOR)
  })

  console.log(`>> Displayed ${outputArray.length} reseults for ${selectorString}'`)
  console.log('')
}

function displayAll () {
  console.log(SEPARATOR)
  console.log(JSON.colorStringify(systemViewController, null, 2))
  console.log(SEPARATOR)

  console.log('>> Complete view hierarchy.')
  console.log('')
}

main()
