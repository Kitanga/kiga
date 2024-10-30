export function debounce<T extends Function>(func: T, wait: number, immediate = false): T {
    var timeout: any;
    return function () {
        // @ts-ignore
        var context = this, args = arguments;
        clearTimeout(timeout as any);
        timeout = setTimeout(function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
    } as any;
}