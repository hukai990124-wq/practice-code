import * as THREE from "three";
import{ GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
var profile = {
    name: "HuKai",
    intro: "A person from China, and studying code now.",
    details: [["Age", 27], 
    ["location", "Tokyo"],
     ["Language", "Chinese,English,Japanese"]
]
};

var detailsHtml = profile.details.map(function (item) {
    return "<dt>" + item[0] + "</dt><dd>" + item[1] + "</dd>";
}).join("");

document.getElementById("profile").innerHTML =
    "<h1>" + profile.name + "</h1>" +
    '<p class="intro">' + profile.intro + "</p>" +
    "<dl>" + detailsHtml + "</dl>";
var nameElement = document.querySelector("h1");

nameElement.addEventListener("click", function () {
    var color = ["#76e4d2", "#b7fff1", "#8bb9c7"];
    var randomIndex = Math.floor(Math.random() * color.length);
    nameElement.style.color = color[randomIndex];
});
console.log("Three.js version", THREE.REVISION);
var loader = new GLTFLoader();
console.log("GLTFLoader initialized", loader);

// 1. 创建3D场景
var scene = new THREE.Scene();
scene.background = new THREE.Color(0xb8d9d5);
scene.fog = new THREE.Fog(0xb8d9d5, 22, 70);

// 2. 找到HTML中的宠物容器
var container = document.getElementById("pet");
container.textContent = "";

// 3. 创建摄像机
var camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
);

camera.position.set(0, 1, 6);

// 4. 创建渲染器
var renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(
    container.clientWidth,
    container.clientHeight
);

container.appendChild(renderer.domElement);

window.addEventListener("resize", function () {
    var width = container.clientWidth;
    var height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// 5. 为原野添加日光与柔和的天空补光
var light = new THREE.DirectionalLight(0xfff1d2, 2.2);
light.position.set(-5, 10, 7);
scene.add(light);

var ambientLight = new THREE.HemisphereLight(0xd9f3ff, 0x50633c, 1.5);
scene.add(ambientLight);

// 6. 用 Three.js 搭建简洁的草原、远山与树木
var meadow = new THREE.Group();
scene.add(meadow);

var groundGeometry = new THREE.PlaneGeometry(100, 100, 48, 48);
groundGeometry.rotateX(-Math.PI / 2);
var groundPositions = groundGeometry.attributes.position;
for (var vertex = 0; vertex < groundPositions.count; vertex++) {
    var groundX = groundPositions.getX(vertex);
    var groundZ = groundPositions.getZ(vertex);
    var gentleRise = Math.sin(groundX * 0.16) * 0.12 + Math.cos(groundZ * 0.13) * 0.1;
    groundPositions.setY(vertex, -1.65 + gentleRise);
}
groundGeometry.computeVertexNormals();
var ground = new THREE.Mesh(
    groundGeometry,
    new THREE.MeshStandardMaterial({ color: 0x4f8b45, roughness: 1, flatShading: true })
);
ground.receiveShadow = true;
meadow.add(ground);

var hillMaterial = new THREE.MeshStandardMaterial({
    color: 0x47764d,
    roughness: 1,
    flatShading: true
});
var distantHillMaterial = new THREE.MeshStandardMaterial({
    color: 0x6e9a67,
    roughness: 1,
    flatShading: true
});

function addHill(x, y, z, scaleX, scaleY, scaleZ, material) {
    var hill = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), material);
    hill.position.set(x, y, z);
    hill.scale.set(scaleX, scaleY, scaleZ);
    meadow.add(hill);
}

addHill(-16, 1.4, -25, 13, 5, 8, distantHillMaterial);
addHill(2, 0.6, -29, 17, 4, 9, distantHillMaterial);
addHill(20, 1.6, -24, 12, 5, 8, distantHillMaterial);
addHill(-25, 0.1, -15, 10, 3.5, 7, hillMaterial);
addHill(24, 0.3, -17, 11, 4, 7, hillMaterial);

var trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x65513b, roughness: 1 });
var canopyMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x3f6745, roughness: 1, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: 0x527a4c, roughness: 1, flatShading: true })
];

function addTree(x, z, size) {
    var tree = new THREE.Group();
    tree.position.set(x, -1.5, z);

    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * size, 0.2 * size, 1.1 * size, 6), trunkMaterial);
    trunk.position.y = 0.55 * size;
    tree.add(trunk);

    var canopy = new THREE.Mesh(
        new THREE.ConeGeometry(0.75 * size, 1.8 * size, 7),
        canopyMaterials[Math.floor(Math.random() * canopyMaterials.length)]
    );
    canopy.position.y = 1.8 * size;
    tree.add(canopy);
    meadow.add(tree);
}

[
    [-9, -8, 1.2], [-12, -12, 1.6], [-7, -17, 1.35],
    [10, -9, 1.3], [13, -14, 1.7], [8, -19, 1.2],
    [-18, -8, 1.8], [19, -10, 1.6], [-21, -18, 1.4], [22, -20, 1.5]
].forEach(function (treeData) {
    addTree(treeData[0], treeData[1], treeData[2]);
});

var grassMaterial = new THREE.MeshStandardMaterial({ color: 0x83a94d, roughness: 1 });
var grassGeometry = new THREE.ConeGeometry(0.035, 0.24, 3);
for (var tuft = 0; tuft < 90; tuft++) {
    var grass = new THREE.Mesh(grassGeometry, grassMaterial);
    var angle = Math.random() * Math.PI * 2;
    var radius = 2.3 + Math.random() * 7;
    grass.position.set(Math.cos(angle) * radius, -1.52, Math.sin(angle) * radius - 1.5);
    grass.rotation.z = (Math.random() - 0.5) * 0.5;
    meadow.add(grass);
}

// 7. 加载你的龙模型
var dragon;

loader.load(
    "./blakcdragon.glb",

    function (gltf) {
        dragon = gltf.scene;
        scene.add(dragon);

        // 让模型自动居中
        var box = new THREE.Box3().setFromObject(dragon);
        var center = box.getCenter(new THREE.Vector3());
        var size = box.getSize(new THREE.Vector3());

        var maxSize = Math.max(size.x, size.y, size.z);
        if (maxSize > 0) {
            var scale = 3 / maxSize;
            dragon.scale.setScalar(scale);
            dragon.position.copy(center).multiplyScalar(-scale);
        }

        console.log("龙模型加载成功！");
    },

    undefined,

    function (error) {
        console.error("模型加载失败：", error);
    }
);

// 8. 鼠标拖动旋转龙模型
var isDragging = false;
var isMoving = false;
var previousPointerX = 0;
var previousPointerY = 0;

renderer.domElement.style.cursor = "grab";

renderer.domElement.addEventListener("pointerdown", function (event) {
    isMoving = event.button === 2;
    isDragging = !isMoving;
    previousPointerX = event.clientX;
    previousPointerY = event.clientY;
    renderer.domElement.style.cursor = isMoving ? "move" : "grabbing";
    renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener("pointermove", function (event) {
    if ((!isDragging && !isMoving) || !dragon) return;

    var deltaX = event.clientX - previousPointerX;
    var deltaY = event.clientY - previousPointerY;

    if (isMoving) {
        var worldUnitsPerPixel = (2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / container.clientHeight;
        dragon.position.x += deltaX * worldUnitsPerPixel;
        dragon.position.y -= deltaY * worldUnitsPerPixel;
    } else {
        dragon.rotation.y += deltaX * 0.01;
    }

    previousPointerX = event.clientX;
    previousPointerY = event.clientY;
});

renderer.domElement.addEventListener("pointerup", function (event) {
    isDragging = false;
    isMoving = false;
    renderer.domElement.style.cursor = "grab";

    if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
    }
});

renderer.domElement.addEventListener("pointercancel", function () {
    isDragging = false;
    isMoving = false;
    renderer.domElement.style.cursor = "grab";
});

renderer.domElement.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});

// 9. 滚轮缩放视角
renderer.domElement.addEventListener("wheel", function (event) {
    event.preventDefault();
    camera.position.z = THREE.MathUtils.clamp(
        camera.position.z + event.deltaY * 0.005,
        2,
        12
    );
}, { passive: false });

// 10. 用 Web Audio 合成龙吼；点击按钮时播放
var audioContext;
var feedButton = document.getElementById("feed");
var petMessage = document.getElementById("pet-message");

feedButton.addEventListener("click", function () {
    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
        petMessage.textContent = "你的浏览器不支持合成音频。";
        return;
    }

    audioContext = audioContext || new AudioContextClass();
    audioContext.resume();

    var now = audioContext.currentTime;
    var duration = 2.4;
    var master = audioContext.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.32, now + 0.12);
    master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    master.connect(audioContext.destination);

    // 低沉下滑的锯齿波，加上滤波噪声，形成粗粝的咆哮质感。
    var growl = audioContext.createOscillator();
    var growlGain = audioContext.createGain();
    var growlFilter = audioContext.createBiquadFilter();
    growl.type = "sawtooth";
    growl.frequency.setValueAtTime(210, now);
    growl.frequency.exponentialRampToValueAtTime(85, now + duration);
    growlFilter.type = "lowpass";
    growlFilter.frequency.setValueAtTime(1100, now);
    growlFilter.frequency.exponentialRampToValueAtTime(420, now + duration);
    growlGain.gain.setValueAtTime(0.42, now);
    growlGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    growl.connect(growlFilter);
    growlFilter.connect(growlGain);
    growlGain.connect(master);
    growl.start(now);
    growl.stop(now + duration);

    // 更高的滑音叠加在低吼上，增加尖锐、像龙的嘶吼感。
    var shriek = audioContext.createOscillator();
    var shriekFilter = audioContext.createBiquadFilter();
    var shriekGain = audioContext.createGain();
    shriek.type = "triangle";
    shriek.frequency.setValueAtTime(720, now + 0.08);
    shriek.frequency.exponentialRampToValueAtTime(260, now + duration);
    shriekFilter.type = "bandpass";
    shriekFilter.frequency.setValueAtTime(1500, now);
    shriekFilter.frequency.exponentialRampToValueAtTime(700, now + duration);
    shriekFilter.Q.value = 1.4;
    shriekGain.gain.setValueAtTime(0.0001, now);
    shriekGain.gain.exponentialRampToValueAtTime(0.2, now + 0.18);
    shriekGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    shriek.connect(shriekFilter);
    shriekFilter.connect(shriekGain);
    shriekGain.connect(master);
    shriek.start(now);
    shriek.stop(now + duration);

    var bufferSize = Math.floor(audioContext.sampleRate * duration);
    var noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    var noiseData = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    var noise = audioContext.createBufferSource();
    var noiseFilter = audioContext.createBiquadFilter();
    var noiseGain = audioContext.createGain();
    noise.buffer = noiseBuffer;
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(1400, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(650, now + duration);
    noiseFilter.Q.value = 0.8;
    noiseGain.gain.setValueAtTime(0.14, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now);
    noise.stop(now + duration);

    petMessage.textContent = "Dragon is pleasure now!!🐉";
});

// 11. 持续渲染场景
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();


