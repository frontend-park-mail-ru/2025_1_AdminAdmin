export default function throttle(func, ms) {
    let isThrottled = false;
    let savedArgs = null;

    return (...args) => {
        if (isThrottled) {
            savedArgs = args;
            return;
        }

        func.apply(this, args);
        isThrottled = true;

        setTimeout(() => {
            isThrottled = false;
            if (savedArgs) {
                func.apply(this, savedArgs);
                savedArgs = null;
            }
        }, ms);
    };
}