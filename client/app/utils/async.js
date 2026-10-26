/**
 * Wraps an async task so concurrent callers share the same in-flight promise.
 * This prevents duplicate network requests during route resolution.
 */
export const createSingleFlight = (task) => {
  let pending = null

  return (...args) => {
    if (pending) return pending

    let run
    try {
      run = Promise.resolve(task(...args))
    } catch (error) {
      run = Promise.reject(error)
    }
    pending = run
    const clear = () => {
      if (pending === run) pending = null
    }
    run.then(clear, clear)
    return run
  }
}
