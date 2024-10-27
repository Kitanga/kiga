/// <reference types="vite/client" />

export interface ICGVideoAddCallbacks {
    adStarted?: () => void,
    adFinished?: (...props) => void,
    adError?: () => void,
}
