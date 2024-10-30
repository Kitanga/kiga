export function throttle<T extends Function>(fn: T, wait: number): T {
    let isCalled = false;

    return (function (...args: any[]) {
        if (!isCalled) {
            fn(...args);
            isCalled = true;
            setTimeout(function () {
                isCalled = false;
            }, wait)
        }
    } as any) as T;
}