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
        const inline = process(parent.getDocument(), parseTarget(target), attrs)
        return this.createInline(parent, 'quoted', inline.text, {
          type: 'monospaced',
          attributes: { role:  inline.role},
        })
      })
    })
  }
}

function parseTarget(target) {
  return target
}

function process(document, target, attrs) {


  const location = document.getAttribute('javadoc-location', 'xref:attachment$api/java')
  const format = document.getAttribute('javadoc-format', 'xref:attachment$api/java')

  const className = target.split('.').slice(-1)
  const path = target.replaceAll('.', '/') + '.html'
  const text = `${location}/${path}[\`${className}\`,role=apiref]`
  const role = 'api-target:' + target;
  return {text,role}
}


// target = location | class | method 

module.exports = { register, createExtensionGroup }
