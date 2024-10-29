/// <reference types="vite/client" />

export interface ICGVideoAddCallbacks {
    adStarted?: () => void,
    adFinished?: (...props) => void,
    adError?: () => void,
}

declare global {
    interface Window {
        /**
         * Sets the section that the user should be on
         * @param thresholdIX The threshold that should be targetted
         */
        setThreshold: (thresholdIX: number) => void
    }
}
