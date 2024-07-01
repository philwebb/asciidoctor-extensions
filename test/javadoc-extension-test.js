/* eslint-env mocha */
'use strict'

const Asciidoctor = require('@asciidoctor/core')()
const { expect, heredoc } = require('./harness')
const { name: packageName } = require('#package')

describe('javadoc-extension', () => {
  const ext = require(packageName + '/javadoc-extension')

  let config
  let contentCatalog
  let file

  const addFile = ({ component = 'acme', version = '2.0', module = 'ROOT', family = 'page', relative }, contents) => {
    contents = Buffer.from(contents)
    const entry = {
      contents,
      src: { component, version, module, family, relative, path: relative },
      pub: { moduleRootPath: '' },
    }
    contentCatalog.files.push(entry)
    return entry
  }

  const createContentCatalog = () => ({
    files: [],
    findBy (criteria) {
      const criteriaEntries = Object.entries(criteria)
      const accum = []
      for (const candidate of this.files) {
        const candidateSrc = candidate.src
        if (criteriaEntries.every(([key, val]) => candidateSrc[key] === val)) accum.push(candidate)
      }
      return accum
    },
  })

  const run = (input = [], opts = {}) => {
    file.contents = Buffer.from(Array.isArray(input) ? input.join('\n') : input)
    const context = { config, contentCatalog, file }
    opts.extension_registry = ext.register(opts.extension_registry || Asciidoctor.Extensions.create(), context)
    opts.sourcemap = true
    if (opts.convert) {
      delete opts.convert
      return Asciidoctor.convert(input, opts)
    }
    return Asciidoctor.load(input, opts)
  }

  beforeEach(() => {
    config = {}
    contentCatalog = createContentCatalog()
    file = addFile({ relative: 'index.adoc' }, '= Index Page')
  })

  describe('bootstrap', () => {
    it('should be able to require extension', () => {
      expect(ext).to.be.instanceOf(Object)
      expect(ext.register).to.be.instanceOf(Function)
    })

    it('should not register to bound extension registry if register function called with no arguments', () => {
      try {
        ext.register.call(Asciidoctor.Extensions)
        const extGroups = Asciidoctor.Extensions.getGroups()
        const extGroupKeys = Object.keys(extGroups)
        expect(extGroupKeys).to.be.empty()
      } finally {
        Asciidoctor.Extensions.unregisterAll()
      }
    })

    it('should not register extension group if context is undefined', () => {
      const input = []
      const opts = { extension_registry: ext.register(Asciidoctor.Extensions.create()) }
      const extensions = Asciidoctor.load(input, opts).getExtensions()
      expect(extensions).to.be.undefined()
    })

    it('should be able to call register function exported by extension', () => {
      const extensions = run().getExtensions()
      expect(extensions.getInlineMacros()).to.have.lengthOf(1)
    })
  })

  describe('javadoc macro', () => {
    it('should convert using sensible defaults', () => {
      const input = heredoc`
        = Page Title

        javadoc:com.example.MyClass[]
        `
      const actual = run(input, { convert: true })
      console.log(actual)
      expect(actual).to.include(
        '<code class="api-target:com.example.MyClass"><a href="attachment$api/java/com/example/MyClass.html" class="apiref">`MyClass`</a></code>'
      )
    })

    it('should convert with specified location when has javadoc-location attribute', () => {
      const input = heredoc`
        = Page Title
        :javadoc-location: xref:api:java

        javadoc:com.example.MyClass[]
        `
      const actual = run(input, { convert: true })
      console.log(actual)
      expect(actual).to.include(
        '<code class="api-target:com.example.MyClass"><a href="api:java/com/example/MyClass.html" class="apiref">`MyClass`</a></code>'
      )
    })

    it('should convert with specified location when has location in macro', () => {
    })

    it('should convert with specified format when has format full', () => {

    })

    it('should convert with specified format when has format annotation', () => {

    })

    it('should convert with specified format when has format short', () => {

    })

    it('should convert with specified text when has link text', () => {

    })

    it('should convert with method reference', () => {

    })

  })
})
