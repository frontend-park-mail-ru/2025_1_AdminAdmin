export default function throttle<T extends (...args: any[]) => void>(
  func: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let isThrottled = false;
  let savedArgs: Parameters<T> | null = null;

  function wrapper(this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (isThrottled) {
      savedArgs = args;
      return;
    }

    func.apply(this, args);

    isThrottled = true;

    setTimeout(() => {
      isThrottled = false;
      if (savedArgs) {
        wrapper.apply(this, savedArgs);
        savedArgs = null;
      }
    }, ms);
  }

  return wrapper;
}
