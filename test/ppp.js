import * as L from '../dist/partial.lenses.cjs'
import * as R from 'ramda'

// Combinators for Parsing and Pretty-Printing with partial isomorphisms -------

const sourceOf = R.ifElse(
  R.is(String),
  R.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'),
  L.get('source')
)

const join = (lhs, rhs) => {
  if (lhs.length && rhs.length) {
    const t = lhs[lhs.length - 1] + rhs[0]
    if (/\w\w|[^(]\(|→/.test(t)) return lhs + ' ' + rhs
  }
  return lhs + rhs
}

export const token = pattern => {
  const re = RegExp(`^(${sourceOf(pattern)})\\s*((?:.|\n)*)$`)
  return L.iso(
    s => (R.is(String, s) && (s = re.exec(s)) ? R.tail(s) : undefined),
    pair => (R.is(Array, pair) ? join(...pair) : undefined)
  )
}

export const of = value => L.mapping(input => [input, [value, input]])

export const isomap = R.curry((iso, ppp) => [ppp, L.cross([iso, []])])

const empty = of([])

const append = piso => [
  L.cross([[], piso]),
  L.mapping((xs, y, s) => [[xs, [y, s]], [[...xs, y], s]])
]

export const sequence = (...pisos) => [empty, pisos.map(append)]

export const many = piso => [empty, L.iterate(append(piso))]

export const alternatives = L.alternatives

export const trim = piso => [
  L.reread(R.replace(/^\s*/, '')),
  piso,
  L.mapping(r => [[r, ''], r])
]
