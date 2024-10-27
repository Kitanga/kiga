import { ColliderDesc, RigidBodyDesc, World } from '@dimforge/rapier2d-compat';
import { Object3D } from 'three';

export const SCALE_FACTOR = 1;

export class PhysicsController {
    static instance: PhysicsController

    static getInstance() {
        if (this.instance) {
            return this.instance;
        } else {
            return this.instance = new PhysicsController();
        }
    }

    world: World

    private constructor() {
        this.world = new World({ x: 0, y: 0 });
    }

    attachDynamicRigidBody(mesh: Object3D, width: number, height: number, canSleep = false, linearDamp = 10) {
        const {
            world,
        } = this;

        const rigidBodyDesc = RigidBodyDesc.dynamic();

        rigidBodyDesc.setCanSleep(canSleep);
        rigidBodyDesc.lockRotations();
        rigidBodyDesc.setLinearDamping(linearDamp);
        rigidBodyDesc.setAdditionalMass(0.1);

        // Create rigid body
        const rigidBody = world.createRigidBody(rigidBodyDesc);
        rigidBody.setEnabled(true);

        // Create collider
        const rigidColliderDesc = ColliderDesc.cuboid(width, height);
        const rigidCollider = world.createCollider(rigidColliderDesc, rigidBody);

        // Place somewhere
        return mesh.userData['rigidBody'] = rigidBody;
    }

    /**
     * Creates a static rigidbody at the given position with a circle collider of given radius
     * 
     * @param mesh An Object to attach the rigidBody to
     * @param radius Circle radius
     * @param x Circle center X
     * @param y Circle center Y
     */
    attachStaticCircleRigidBody(mesh: Object3D, radius: number, x: number, y: number) {
        const {
            world,
        } = this;

        const rigidBodyDesc = RigidBodyDesc.fixed();

        // Create rigid body
        const rigidBody = world.createRigidBody(rigidBodyDesc);
        rigidBody.setTranslation({ x: x * SCALE_FACTOR, y: y * SCALE_FACTOR }, true);

        // const geom = mesh.geometry as BoxGeometry;

        // geom.computeBoundingBox();

        // Create collider
        const rigidColliderDesc = ColliderDesc.ball(radius * SCALE_FACTOR);
        const rigidCollider = world.createCollider(rigidColliderDesc, rigidBody);

        // Place somewhere
        mesh.userData['rigidBody'] = rigidBody;
    }
    /**
     * Creates a static rigidbody at the given position with a circle collider of given radius
     * 
     * @param mesh An Object to attach the rigidBody to
     * @param radius Circle radius
     * @param x Circle center X
     * @param y Circle center Y
     */
    attachStaticCuboidRigidBody(vertices: Float32Array) {
        const {
            world,
        } = this;

        const rigidBodyDesc = RigidBodyDesc.fixed();

        // Create rigid body
        const rigidBody = world.createRigidBody(rigidBodyDesc);
        // rigidBody.setTranslation({ x: x * SCALE_FACTOR, y: y * SCALE_FACTOR }, true);

        // const geom = mesh.geometry as BoxGeometry;

        // geom.computeBoundingBox();

        // Create collider
        // const rigidColliderDesc = ColliderDesc.cuboid(width * 0.5 * SCALE_FACTOR, height * 0.5 * SCALE_FACTOR);
        const rigidColliderDesc = ColliderDesc.polyline(vertices);
        const rigidCollider = world.createCollider(rigidColliderDesc, rigidBody);

        return rigidBody;
    }
}
