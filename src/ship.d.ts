export interface IShipConfig {
    /** Width of container */
    w: number
    /** Height of container */
    h: number
    c: {
        /** The Name of the part, corresponds to the name of the sprite used */
        n: string
        /** X position */
        x: number
        /** Y position */
        y: number
        // /** Width of part */
        // w: number
        // /** Width of part */
        // h: number
    }[]
}