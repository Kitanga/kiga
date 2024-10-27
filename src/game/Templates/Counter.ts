export class Counter {
    currentCount = 0;
    
    constructor(public maxCount: number, public callback: () => void, startImmediately = false) {
        startImmediately && callback();
    }

    update(dt: number) {
        this.currentCount += dt;
        
        if (this.currentCount >= this.maxCount) {
            this.currentCount = 0;

            this.callback();
        }
    }
}