import { describe, expect, it } from 'vitest'
import { buildListQuery, parseListSort, parseListState } from '~/utils/query'

const DEFAULT_FILTERS = { search: '', status: '', productType: '' }

describe('list query helpers', () => {
  it('parses sort expressions', () => {
    expect(parseListSort('policyNumber:asc')).toEqual({ key: 'policyNumber', order: 'asc' })
    expect(parseListSort('totalPremium:desc')).toEqual({ key: 'totalPremium', order: 'desc' })
    expect(parseListSort('createdAt')).toEqual({ key: 'createdAt', order: 'asc' })
    expect(parseListSort(':desc')).toBeNull()
    expect(parseListSort(undefined)).toBeNull()
    expect(parseListSort(42)).toBeNull()
  })

  it('reads only known filters plus pagination and sort from the URL', () => {
    const state = parseListState(
      {
        search: 'ABC',
        status: 'active',
        productType: 'Motor',
        unknown: 'ignored',
        page: '3',
        pageSize: '25',
        sort: 'totalPremium:desc',
      },
      DEFAULT_FILTERS,
    )

    expect(state).toEqual({
      filters: { search: 'ABC', status: 'active', productType: 'Motor' },
      page: 3,
      pageSize: 25,
      sort: { key: 'totalPremium', order: 'desc' },
    })
  })

  it('falls back to safe pagination defaults', () => {
    const state = parseListState(
      { page: '0', pageSize: '-2', status: 123, sort: 'bad' },
      DEFAULT_FILTERS,
    )
    expect(state.page).toBe(1)
    expect(state.pageSize).toBeNull()
    expect(state.filters.status).toBe('')
    expect(state.sort).toEqual({ key: 'bad', order: 'asc' })
  })

  it('serializes filters and omits blanks plus page 1', () => {
    const query = buildListQuery({
      filters: { search: 'ABC', status: '', productType: 'Motor' },
      page: 1,
      sort: { key: 'createdAt', order: 'desc' },
      base: { quotationId: '9', status: 'stale' },
    })

    expect(query).toEqual({
      quotationId: '9',
      search: 'ABC',
      productType: 'Motor',
      sort: 'createdAt:desc',
    })
  })

  it('keeps page numbers above one and deletes stale values', () => {
    const query = buildListQuery({
      filters: { search: '' },
      page: 4,
      sort: null,
      base: { page: '2', sort: 'old:asc', search: 'old' },
    })
    expect(query).toEqual({ page: '4' })
  })

  it('round-trips through parse and build', () => {
    const state = parseListState(
      { search: 'hello', status: 'active', page: '2', sort: 'name:desc' },
      DEFAULT_FILTERS,
    )
    const query = buildListQuery({ ...state })
    const restored = parseListState(query, DEFAULT_FILTERS)
    expect(restored.filters).toEqual(state.filters)
    expect(restored.page).toBe(2)
    expect(restored.sort).toEqual({ key: 'name', order: 'desc' })
  })
})
