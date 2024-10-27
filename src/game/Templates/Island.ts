import { Object3D } from "three";

export class Island {
    get x() {
        return this.object.position.x;
    }
    get y() {
        return this.object.position.z;
    }

    health = 100;
    
    isIsland = true;
    
    /**
     * Island representation for collisions and the like
     * @param object The island instance dummy
     * @param r radius of island
     */
    constructor(public object: Object3D, public r: number) {}
}