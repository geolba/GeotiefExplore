import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { Mesh } from 'three/src/objects/Mesh';
import { Layer } from './Layer'

class BoxLayer extends Layer {

    constructor(params) {
        super();

        this.visible = true;
        this.name = params.name;
        this.color = params.color;
        this.geometry = new BoxGeometry(params.width, params.height, params.depth);
        this.material = new MeshBasicMaterial({
            color: this.color
        });
        this.materials = [];
        this.materials.push(this.material);
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.position.x = 4282010;
        this.mesh.position.y = 2302070;
        this.mesh.position.z =  -13616.3;
    }

    setVisible(visible) {
        this.visible = visible;
        this.mesh.visible = visible;
        this.emit('visibility-change');
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

    scaleZ(z) {
        this.mesh.scale.z = z;
        //this.objectGroup.scale.z = z;
    }

    setWireframeMode(wireframe) {
        this.materials.forEach(function (mat) {
            //if (m.w) return;
            //m.mat.wireframe = wireframe;
            mat.wireframe = wireframe;
        });
    }
}

export { BoxLayer };