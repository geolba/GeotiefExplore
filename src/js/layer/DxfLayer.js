import { Group } from 'three/src/objects/Group';

class DxfLayer extends Layer {

    constructor() {
        super();

        this.objectGroup = new Group();
        this.queryableObjects = [];
        this.borderVisible = false;
        this.declaredClass = "DxfLayer";
    }
}


export { DxfLayer };