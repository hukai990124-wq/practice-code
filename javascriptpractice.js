// Three.js 用于创建和显示 3D 场景；GLTFLoader 负责读取 .glb/.gltf 模型文件。
import * as THREE from "three";
import{ GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
console.log("Three.js version", THREE.REVISION);
var loader = new GLTFLoader();
console.log("GLTFLoader initialized", loader);

// 1. 创建场景：场景是所有灯光、地形和宠物模型的共同容器。
var scene = new THREE.Scene();
scene.background = new THREE.Color(0xb8d9d5);
scene.fog = new THREE.Fog(0xb8d9d5, 22, 70);

// 2. 找到 HTML 中用于显示 3D 画布的容器，并清除其中旧内容。
var container = document.getElementById("pet");
container.textContent = "";

// 3. 创建透视摄像机；参数依次是视野角、宽高比、最近可见距离和最远可见距离。
var camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
);

camera.position.set(0, 0, 6);
camera.lookAt(0, 0, 0);

// 4. 创建 WebGL 渲染器，把 Three.js 场景绘制到浏览器画布中。
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

// 5. 添加主光和环境补光：主光提供方向感，半球光照亮阴影区域。
var light = new THREE.DirectionalLight(0xfff1d2, 2.2);
light.position.set(-5, 10, 7);
scene.add(light);

var ambientLight = new THREE.HemisphereLight(0xd9f3ff, 0x50633c, 1.5);
scene.add(ambientLight);

// 6. 搭建背景环境；地形、山丘、树和草丛都放进 meadow 组，便于统一管理。
var meadow = new THREE.Group();
scene.add(meadow);

var groundGeometry = new THREE.PlaneGeometry(100, 100, 48, 48);
groundGeometry.rotateX(-Math.PI / 2);
var groundPositions = groundGeometry.attributes.position;
// 逐点轻微改变地面高度来制造起伏；网格越密，起伏越平滑。
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
    // 用缩放后的低面数多面体表示山丘；参数控制位置、宽高深和材质。
    var hill = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), material);
    hill.position.set(x, y, z);
    hill.scale.set(scaleX, scaleY, scaleZ);
    meadow.add(hill);
}

// 每次调用传入一座山丘的位置和尺寸；负 z 值表示山丘在模型后方。
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
    // 树由圆柱树干和圆锥树冠组成，size 同时控制两部分的大小。
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
    // treeData 的三个数值依次是 x、z 和大小。
    addTree(treeData[0], treeData[1], treeData[2]);
});

var grassMaterial = new THREE.MeshStandardMaterial({ color: 0x83a94d, roughness: 1 });
var grassGeometry = new THREE.ConeGeometry(0.035, 0.24, 3);
// 随机放置小草丛增加地面细节；数量由下面循环的上限 90 控制。
for (var tuft = 0; tuft < 90; tuft++) {
    var grass = new THREE.Mesh(grassGeometry, grassMaterial);
    var angle = Math.random() * Math.PI * 2;
    var radius = 2.3 + Math.random() * 7;
    grass.position.set(Math.cos(angle) * radius, -1.52, Math.sin(angle) * radius - 1.5);
    grass.rotation.z = (Math.random() - 0.5) * 0.5;
    meadow.add(grass);
}

// 7. 异步加载 Draco 模型：文件读取完成后才会运行成功回调。
var dragon;

// load 的参数依次为模型路径、成功回调、加载进度回调和失败回调。
loader.load(
    "./blakcdragon.glb",

    function (gltf) {
        dragon = gltf.scene;
        scene.add(dragon);

        // 根据包围盒求模型中心和尺寸，再缩放到约 3 个场景单位并移到原点附近。
        var box = new THREE.Box3().setFromObject(dragon);
        var center = box.getCenter(new THREE.Vector3());
        var size = box.getSize(new THREE.Vector3());

        var maxSize = Math.max(size.x, size.y, size.z);
        if (maxSize > 0) {
            var scale = 3 / maxSize;
            dragon.scale.setScalar(scale);
            dragon.position.copy(center).multiplyScalar(-scale);
        }

        console.log("Draco Loaded!");
    },

    undefined,

    // 加载失败时把错误写入控制台，便于排查路径或模型文件问题。
    function (error) {
        console.error("Failed!：", error);
    }
);

// 8. 指针交互：左键拖动旋转模型，右键拖动平移模型。
// 用状态变量区分旋转拖动和平移拖动，并记住上一帧指针位置。
var isDragging = false;
var isMoving = false;
var previousPointerX = 0;
var previousPointerY = 0;

renderer.domElement.style.cursor = "grab";

// 按下指针时记录操作类型、起点，并捕获指针以便拖出画布仍能继续操作。
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
        // 把像素移动量换算为场景单位，使平移速度随缩放距离变化。
        var worldUnitsPerPixel = (2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / container.clientHeight;
        dragon.position.x += deltaX * worldUnitsPerPixel;
        dragon.position.y -= deltaY * worldUnitsPerPixel;
    } else {
        dragon.rotation.y += deltaX * 0.01;
    }

    previousPointerX = event.clientX;
    previousPointerY = event.clientY;
});

// 松开或取消指针时清除拖动状态，避免模型继续跟随鼠标。
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
    // 禁止右键菜单，右键才能用于拖动平移。
    event.preventDefault();
});

// 9. 滚轮缩放：改变相机与场景中心的距离，并限制最近/最远距离。
renderer.domElement.addEventListener("wheel", function (event) {
    event.preventDefault();
    camera.position.z = THREE.MathUtils.clamp(
        camera.position.z + event.deltaY * 0.005,
        2,
        12
    );
}, { passive: false });

// 10. 宠物选择与喂食交互：选择项的名称和 data-age 会同步到页面资料区。
var audioContext;
var feedButton = document.getElementById("feed");
var petMessage = document.getElementById("pet-message");
var petSelect = document.getElementById("pet-select");
var petName = document.getElementById("pet-name");
var petAge = document.getElementById("pet-age");
var selectedPetName = petSelect.options[petSelect.selectedIndex].textContent;

// 用户换选项后读取该 option 的文字和 data-age 属性并刷新界面。
petSelect.addEventListener("change", function () {
    var selectedOption = petSelect.options[petSelect.selectedIndex];
    selectedPetName = selectedOption.textContent;
    petName.textContent = selectedPetName;
    petAge.textContent = selectedOption.dataset.age;
    feedButton.textContent = "Feed " + selectedPetName;
    petMessage.textContent = selectedPetName + " is ready to meet you.";
});

// 点击喂食时用 Web Audio 实时合成声音，不需要额外音频文件。
feedButton.addEventListener("click", function () {
    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
        petMessage.textContent = "Your browser not support the voice";
        return;
    }

    audioContext = audioContext || new AudioContextClass();
    audioContext.resume();

    var now = audioContext.currentTime;
    var duration = 2.4;
    // master 是总音量节点，所有合成声部接入这里后再输出到扬声器。
    var master = audioContext.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.32, now + 0.12);
    master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    master.connect(audioContext.destination);

    // 低沉下滑的锯齿波经过低通滤波，构成吼声的低频主体。
    // 声音由低频吼声、高频嘶声和滤波噪声三层叠加而成。
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

    // 三角波经过带通滤波后叠在主体上，形成更尖锐的高频嘶吼。
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

    // 创建短噪声并滤波，补充粗糙气声；降低增益让声音自然结束。
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

    petMessage.textContent = selectedPetName + " is happy now! 🐉";
});

// 11. 每帧重新绘制场景；requestAnimationFrame 跟随浏览器刷新节奏运行。
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();


