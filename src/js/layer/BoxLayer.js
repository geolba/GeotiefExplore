import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { Mesh } from 'three/src/objects/Mesh';
import { Layer } from './Layer'

class BoxLayer extends Layer {

    constructor(size) {
        super();

        this.geometry = new BoxGeometry(size.width, size.height, size.depth);
        this.material = new MeshBasicMaterial({
            color: 800080
        });

        this.mesh = new Mesh(this.geometry, this.material);
    }

    onAdd(map) {
        this.build(this.getScene());
        //this.update();
        this.emit('add');
    }
    
    build(app_scene) {
        // this.objects.push(layer);
        app_scene.add(this.getMesh());
    }

    getMesh() {
        return this.mesh;
    }
}

export { BoxLayer };