export function distanceBetween(objAx: number, objAy: number, objBx: number, objBy: number) {
    return Math.sqrt(((objAx - objBx) * (objAx - objBx))
        + ((objAy - objBy) * (objAy - objBy)));
}