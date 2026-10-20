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
    var color = ["red", "orange", "purple"];
    var randomIndex = Math.floor(Math.random() * color.length);
    nameElement.style.color = color[randomIndex];
});
console.log("Three.js version", THREE.REVISION);
var loader = new GLTFLoader();
console.log("GLTFLoader initialized", loader);

// 1. 创建3D场景
var scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);

// 2. 找到HTML中的宠物容器
var container = document.getElementById("pet");
container.textContent = "";

// 设置容器尺寸
container.style.width = "600px";
container.style.maxWidth = "100%";
container.style.height = "400px";

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

renderer.setSize(
    container.clientWidth,
    container.clientHeight
);

container.appendChild(renderer.domElement);

// 5. 添加灯光
var light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 5, 5);
scene.add(light);

var ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// 6. 加载你的龙模型
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

// 7. 鼠标拖动旋转龙模型
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

// 8. 滚轮缩放视角
renderer.domElement.addEventListener("wheel", function (event) {
    event.preventDefault();
    camera.position.z = THREE.MathUtils.clamp(
        camera.position.z + event.deltaY * 0.005,
        2,
        12
    );
}, { passive: false });

// 9. 用 Web Audio 合成龙吼；点击按钮时播放
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

// 10. 持续渲染场景
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();


