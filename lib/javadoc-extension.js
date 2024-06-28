'use strict'

const toProc = require('./util/to-proc')

function register (registry, context) {
  if (!(registry && context)) return // NOTE only works as scoped extension for now
  registry.$groups().$store('springio/javadoc', toProc(createExtensionGroup(context)))
  return registry
}

function createExtensionGroup () {
  return function () {
    this.inlineMacro(function () {
      this.named('javadoc')
      this.process((parent, target, attrs) => {
        const doc = parent.getDocument()
        const location = doc.getAttribute('javadoc-location', 'xref:attachment$api/java')
        const className = target.split('.').slice(-1)
        const path = target.replaceAll('.', '/') + '.html'
        const text = `${location}/${path}[\`${className}\`, role=apiref]`
        return this.createInline(parent, 'quoted', text, { type: 'monospaced' })
      })
    })
  }
}

module.exports = { register, createExtensionGroup }
