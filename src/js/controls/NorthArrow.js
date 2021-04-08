import { Control } from "./Control";
import { Group } from 'three/src/objects/Group';
import { Vector3 } from 'three/src/math/Vector3';
import { ArrowHelper } from 'three/src/helpers/ArrowHelper';
import * as util from '../core/utilities';
import * as dom from '../core/domUtil';
import * as domEvent from '../core/domEvent';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { Scene } from 'three/src/scenes/Scene';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { BoxGeometry } from '../core/BoxGeometry';
import { Mesh } from 'three/src/objects/Mesh';
import * as material from '../clip/material';
import { Texture } from 'three/src/textures/Texture';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { DoubleSide } from 'three/src/constants';

import './NorthArrow.css';

export class NorthArrow extends Control {

    renderer;
    _mainMap;
    _scene;
    _camera;
    _center;
    objectGroup;
    labels = [];
    options = {
        position: 'bottomleft',
        width: 100,
        height: 100,
        headLength: 1,
        headWidth: 1,
    };

    constructor(options) {
        super(options);

        this.objectGroup = new Group();
        this.objectGroup.visible = true;
        util.setOptions(this, options);
    }

    onAdd(map) {
        this._mainMap = map;
        let container = this._container = dom.createDom("div", { "id": "inset", "class": "gba-control-minimap" });
        this._container.style.width = this.options.width + 'px';
        this._container.style.height = this.options.height + 'px';
        domEvent.disableClickPropagation(this._container);
        domEvent.on(this._container, 'mousewheel', domEvent.stopPropagation);

        let renderer = this.renderer = new WebGLRenderer({ alpha: true });
        renderer.setSize(this.options.width, this.options.height);
        container.appendChild(renderer.domElement);

        this._scene = new Scene();
        this._camera = new PerspectiveCamera(30, this.options.width / this.options.height, 0.1, 10000);
        this._camera.lookAt(map.center);
        const camDirection = new Vector3(-0.5, -Math.SQRT1_2, 0.5);
        // const camDirection = new Vector3(0, 0, 1);
        const camOffset = camDirection.multiplyScalar(map.size * 2);
        this._camera.position.copy(map.center);
        this._camera.position.add(camOffset);
        this._camera.lookAt(map.center);
        this._camera.up = this._map.camera.up;
        this._camera.updateProjectionMatrix();

        this._createArrow(this._scene);
        // this._buildLabels();
        return container;
    }

    animate() {
        // this._camera.position.copy(this._map.camera.position);
        // // this._camera.position.normalize().multiplyScalar(100);
        // // this._camera.position.setLength(this.oldLength);
        // // this._camera.up = this._map.camera.up; 
        // this._camera.lookAt(this._map.center);

        this._camera.position.copy(this._map.camera.position);
        this._camera.position.sub(this._map.target);
        this._camera.position.setLength(35);
        this._camera.lookAt(this._scene.position);

        // this._camera.near =10;
        // this._camera.far = 1000 * 25;
        // this._camera.lookAt(this._map.center);
        // this._camera.updateProjectionMatrix();

        this.renderer.render(this._scene, this._camera);
        // this._updateInsetLabelPositions();
    }

    _createArrow(app_scene, size = 6) {
        let from = new Vector3(0, 0, 0);
        let headLength = this.options.headLength;//1;
        let headWidth = 1;//this.options.headWidth;//1;

        let xTo = new Vector3(1, 0, 0);
        // let xTo = new Vector3(from.x + 1, from.y, from.z);
        // let xDirection = xTo.clone().sub(from);
        //(this.objectGroup.add(new ArrowHelper(xTo, from, this._map.size * 0.5, 0xf00000, headLength, headWidth)); // Red = x
        this.objectGroup.add(new ArrowHelper(xTo, from, size, 0xff0000, headLength, headWidth)); // Red = x

        let yTo = new Vector3(0, 1, 0);
        // let yTo = new Vector3(from.x, from.y + 1, from.z);
        // let yDirection = yTo.clone().sub(from);
        this.objectGroup.add(new ArrowHelper(yTo, from, size, 0x3ad29f, headLength, headWidth)); // Green = y

        let zTo = new Vector3(0, 0, 1);//blue z
        // let zTo = new Vector3(from.x, from.y, from.z + 1);
        // let zDirection = zTo.clone().sub(from);
        this.objectGroup.add(new ArrowHelper(zTo, from, size, 0x6b716f, headLength, headWidth)); //8 is the length,  Gray = z; 20 and 10 are head length and width
      
        // let spritey = this._makeTextSprite(
        //     "top",
        //     { fontsize: 32, backgroundColor: { r: 255, g: 100, b: 100, a: 1 } }
        // );
        // // spritey.position.set(2.5, 2.5, 5);
        // this.objectGroup.add(spritey);


        // let myText = this.sprite = new SpriteText('top', 2);
        // myText.position.set(2.5, 2.5, 6);
        // this.objectGroup.add(myText);

      

        let eastTexture = this._makeTextTexture("E", 0.6, 'rgba(0,0,0,1)');
        let eastMaterial = new MeshBasicMaterial({            
            transparent: true,
            side: DoubleSide,
            map: eastTexture,
            // wireframe: true
        });
        let westTexture = this._makeTextTexture("W", 0.6, 'rgba(0,0,0,1)');
        let westMaterial = new MeshBasicMaterial({            
            transparent: true,
            side: DoubleSide,
            map: westTexture
        });
        let northTexture = this._makeTextTexture("N", 0.6, 'rgba(0,0,0,1)');
        let northMaterial = new MeshBasicMaterial({            
            transparent: true,
            side: DoubleSide,
            map: northTexture
        });
        let southTexture = this._makeTextTexture("S", 0.6, 'rgba(0,0,0,1)');
        let southMaterial = new MeshBasicMaterial({            
            transparent: true,
            side: DoubleSide,
            map: southTexture          
        });
        let topTexture = this._makeTextTexture("top", 0.6, 'rgba(0,0,0,1)');
        let topMaterial = new MeshBasicMaterial({            
            transparent: true,
            side: DoubleSide,
            map: topTexture
        });   

        // var mesh1 = new Mesh(
        //     new PlaneGeometry(5, 5),
        //     material1
        // );
        // // const yScale = this.textHeight * lines.length + border[1] * 2 + padding[1] * 2;
        // // mesh1.scale.set(yScale * canvas.width / canvas.height, yScale, 0);

        // mesh1.position.set(2.5, 2.5, 5.1);
        // this.objectGroup.add(mesh1);

        //add box:
        this.boxGeometry = new BoxGeometry(5, 5, 5);
        this.boxMesh = new Mesh(this.boxGeometry,
            [eastMaterial, westMaterial, northMaterial, southMaterial, topMaterial,  material.BoxBackFace]);
        // material.BoxBackFace.wireframe = true;
        this.boxMesh.position.set(2.5, 2.5, 2.5);
        this.objectGroup.add(this.boxMesh);

        if (app_scene) {
            app_scene.add(this.objectGroup);
        }
    }

    _makeTextTexture(message, textHeight = 0.6, color = 'rgba(0,0,0,1)') {   
        let text = `${message}`;
        // this.textHeight = textHeight;
        // this.color = color;
        let backgroundColor = 'rgba(248,248,255,0.8)'; // no background color

        let _padding = 3;
        let borderWidth = 0;
        let _borderRadius = 0;
        let borderColor = 'white';

        let strokeWidth = 0;
        let strokeColor = 'white';

        let fontFace = 'Arial';
        let fontSize = 100; // defines text resolution
        let fontWeight = 'normal';


        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const border = Array.isArray(borderWidth) ? borderWidth : [borderWidth, borderWidth]; // x,y border
        const relBorder = border.map(b => b * fontSize * 0.1); // border in canvas units

        const borderRadius = Array.isArray(_borderRadius) ? _borderRadius : [_borderRadius, _borderRadius, _borderRadius, _borderRadius]; // tl tr br bl corners
        const relBorderRadius = borderRadius.map(b => b * fontSize * 0.1); // border radius in canvas units

        const padding = Array.isArray(_padding) ? _padding : [_padding, _padding]; // x,y padding
        const relPadding = padding.map((p) => p * fontSize * 0.1); // padding in canvas units

        const lines = text.split('\n');
        const font = `${fontWeight} ${fontSize}px ${fontFace}`;

        ctx.font = font; // measure canvas with appropriate font
        const innerWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
        const innerHeight = fontSize * lines.length;
        canvas.width = innerWidth + relBorder[0] * 2 + relPadding[0] * 2;
        canvas.height = innerHeight + relBorder[1] * 2 + relPadding[1] * 2;

        // ctx.fillStyle = "rgba( 0, 0, 0, 0 )"; // transparent
        // ctx.fillRect( 0, 0, innerWidth, innerHeight );
        // paint background
        if (backgroundColor) {
            ctx.fillStyle = backgroundColor;
            if (!_borderRadius) {
                ctx.fillRect(relBorder[0], relBorder[1], canvas.width - relBorder[0] * 2, canvas.height - relBorder[1] * 2);
            } else { // fill with rounded corners
                ctx.beginPath();
                ctx.moveTo(relBorder[0], relBorderRadius[0]);
                [
                    [relBorder[0], relBorderRadius[0], canvas.width - relBorderRadius[1], relBorder[1], relBorder[1], relBorder[1]], // t
                    [canvas.width - relBorder[0], canvas.width - relBorder[0], canvas.width - relBorder[0], relBorder[1], relBorderRadius[1], canvas.height - relBorderRadius[2]], // r
                    [canvas.width - relBorder[0], canvas.width - relBorderRadius[2], relBorderRadius[3], canvas.height - relBorder[1], canvas.height - relBorder[1], canvas.height - relBorder[1]], // b
                    [relBorder[0], relBorder[0], relBorder[0], canvas.height - relBorder[1], canvas.height - relBorderRadius[3], relBorderRadius[0]], // t
                ].forEach(([x0, x1, x2, y0, y1, y2]) => {
                    ctx.quadraticCurveTo(x0, y0, x1, y1);
                    ctx.lineTo(x2, y2);
                });
                ctx.closePath();
                ctx.fill();
            }
        }

        // ctx.font = "Bold 10px Arial";
        // ctx.fillStyle = "rgba(255,0,0,1)";
        // ctx.textAlign = 'center';
        // ctx.textBaseline = 'middle';
        // ctx.fillText('Hello, world!', 5, 5);
        ctx.translate(...relBorder);
        ctx.translate(...relPadding);

        // paint text
        ctx.font = font; // Set font again after canvas is resized, as context properties are reset
        ctx.fillStyle = color;

        ctx.textBaseline = 'bottom';

        const drawTextStroke = strokeWidth > 0;
        if (drawTextStroke) {
            ctx.lineWidth = strokeWidth * fontSize / 10;
            ctx.strokeStyle = strokeColor;
        }       
  
        lines.forEach((line, index) => {
            const lineX = (innerWidth - ctx.measureText(line).width) / 2;
            const lineY = (index + 1) * fontSize;

           

            drawTextStroke == true && ctx.strokeText(line, lineX, lineY);
            ctx.fillText(line, lineX, lineY);
           
        });
       

        



        // canvas contents will be used for a texture
        let texture = new Texture(canvas)
        texture.needsUpdate = true;

        return texture;
    } 

    _buildLabels() {

        let f = [
            { a: ["x"], cl: "red-label", centroid: [[8, 0, 0]] },
            { a: ["y"], cl: "green-label", centroid: [[0, 8, 0]] },
            { a: ["z"], cl: "gray-label", centroid: [[0, 0, 8]] }
        ];

        let getPointsFunc = function (f) { return f.centroid; };


        // create parent element for labels
        var e = document.createElement("div");
        this._container.appendChild(e);
        e.style.display = (this.objectGroup.visible) ? "block" : "none";
        let labelParentElement = this.labelParentElement = e; //lable parent div for this layer

        for (let i = 0, l = f.length; i < l; i++) {
            let labelInfo = f[i];
            // labelInfo.aElems = [];
            // labelInfo.aObjs = [];
            let text = labelInfo.a[0];
            if (text === null || text === "") continue;

            let classLabel = labelInfo.cl;
            if (classLabel === undefined || classLabel === "") classLabel = "label";

            let pts = getPointsFunc(labelInfo);
            for (let j = 0, m = pts.length; j < m; j++) {
                let pt = pts[j];

                // create div element for label
                let e = document.createElement("div");
                e.appendChild(document.createTextNode(text));
                e.className = classLabel;// "label";
                labelParentElement.appendChild(e);

                let pt1 = new Vector3(pt[0], pt[1], pt[2]);    // top

                this.labels.push({ labelDiv: e, pt: pt1 });
            }
        }



    }

    _updateInsetLabelPositions() {
        // this.sprite.quaternion.copy(this._camera.quaternion); // to look at camera
        let widthHalf = this.options.width / 2;
        let heightHalf = this.options.height / 2;
        // var autosize = appSettings.Options.label.autoSize;

        let camera_pos = this._camera.position;
        let target = new Vector3(0, 0, 0);
        let c2t = target.sub(camera_pos);
        let c2l = new Vector3();
        let v = new Vector3();

        // make a list of [label index, distance to camera]
        let idx_dist = [];
        for (let i = 0, l = this.labels.length; i < l; i++) {
            idx_dist.push([i, camera_pos.distanceTo(this.labels[i].pt)]);
        }

        // sort label indexes in descending order of distances
        idx_dist.sort(function (a, b) {
            if (a[1] < b[1]) return 1;
            if (a[1] > b[1]) return -1;
            return 0;
        });

        let label, labelDiv, x, y;
        // var minFontSize = appSettings.Options.label.minFontSize;
        for (let i = 0, l = idx_dist.length; i < l; i++) {
            label = this.labels[idx_dist[i][0]];
            labelDiv = label.labelDiv;
            if (c2l.subVectors(label.pt, camera_pos).dot(c2t) > 0) {
                // label is in front
                // calculate label position
                v.copy(label.pt);
                v.project(this._camera);

                x = (v.x * widthHalf) + widthHalf;
                y = -(v.y * heightHalf) + heightHalf;

                // set label position
                labelDiv.style.display = "block";
                labelDiv.style.left = (x - (labelDiv.offsetWidth / 2)) + "px";
                labelDiv.style.top = (y - (labelDiv.offsetHeight / 2)) + "px";
                labelDiv.style.zIndex = i + 1;

            }
            else {
                // label is in back
                labelDiv.style.display = "none";
            }
        }
    }

}