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
        const selectorChain = parseSelectorString(selectorString)

        selectedViewsIntoArray(selectorChain, systemViewController, outputArray)
        console.log(pluralizeResult`Selector string '${selectorString}' returned ${outputArray.length} result`)

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

function selectedViewsIntoArray (selectorChain, viewObj, outputArray, isChildNode = true) {
  // Base case and traversing the selectorChain
  const [selectors, keys] = selectorChain
  if (matchesSelector(selectorChain, viewObj) && isChildNode) {
    if (selectors.length === 1) {
      if (!outputArray.includes(viewObj)) outputArray.push(viewObj)
    } else {
      selectedViewsIntoArray([selectors.slice(1), keys.slice(1)], viewObj, outputArray, false)
    }
  }

  // Traverse to child nodes of viewObj
  if (viewObj['subviews'] && viewObj['subviews'].length > 0) {
    viewObj['subviews'].forEach(subView => selectedViewsIntoArray(selectorChain, subView, outputArray))
  }
  if (viewObj['contentView'] &&
      viewObj['contentView']['subviews'] &&
      viewObj['contentView']['subviews'].length > 0) {
    viewObj['contentView']['subviews'].forEach(subView => selectedViewsIntoArray(selectorChain, subView, outputArray))
  }
  if (viewObj['control']) selectedViewsIntoArray(selectorChain, viewObj['control'], outputArray)
}

function matchesSelector (selectorChain, viewObj) {
  const [selectors, keys] = selectorChain
  return viewObj[keys[0]] === selectors[0] || (Array.isArray(viewObj[keys[0]]) && viewObj[keys[0]].includes(selectors[0]))
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

function pluralizeResult (strings, exp1, exp2) {
  let output = `${strings[0]}${exp1}${strings[1]}${exp2}${strings[2]}.`
  if (exp1 === 1 || exp2 === 1) return output
  return output.replace('result', 'results')
}

function displayViewsAsJson (outputArray, selectorString) {
  console.log(SEPARATOR)
  outputArray.forEach(element => {
    console.log(JSON.colorStringify(element, null, 2))
    console.log(SEPARATOR)
  })
  console.log(pluralizeResult`>> Displayed ${outputArray.length} result for '${selectorString}'`)
  console.log('')
}

function displayAll () {
  console.log(SEPARATOR)
  console.log(JSON.colorStringify(systemViewController, null, 2))
  console.log(SEPARATOR)
  console.log('>> Displayed complete view hierarchy.')
  console.log('')
}

main()
