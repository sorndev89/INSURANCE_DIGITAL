import { describe, expect, it, vi } from 'vitest'
import { createSingleFlight } from '~/utils/async'

describe('createSingleFlight', () => {
  it('shares one in-flight promise between concurrent callers', async () => {
    let resolveTask
    const task = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveTask = resolve
        }),
    )
    const run = createSingleFlight(task)

    const first = run('a')
    const second = run('b')
    expect(first).toBe(second)
    expect(task).toHaveBeenCalledTimes(1)
    expect(task).toHaveBeenCalledWith('a')

    resolveTask('done')
    await expect(first).resolves.toBe('done')
    await expect(second).resolves.toBe('done')
  })

  it('allows a new call after the previous one settles', async () => {
    const task = vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second')
    const run = createSingleFlight(task)

    await expect(run()).resolves.toBe('first')
    await expect(run()).resolves.toBe('second')
    expect(task).toHaveBeenCalledTimes(2)
  })

  it('clears the lock after a rejection so retries work', async () => {
    const task = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce('ok')
    const run = createSingleFlight(task)

    await expect(run()).rejects.toThrow('boom')
    await expect(run()).resolves.toBe('ok')
    expect(task).toHaveBeenCalledTimes(2)
  })

  it('passes through resolved synchronous values', async () => {
    const run = createSingleFlight((value) => value * 2)
    await expect(run(21)).resolves.toBe(42)
  })
})
