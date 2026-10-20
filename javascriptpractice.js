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
var previousPointerX = 0;

renderer.domElement.style.cursor = "grab";

renderer.domElement.addEventListener("pointerdown", function (event) {
    isDragging = true;
    previousPointerX = event.clientX;
    renderer.domElement.style.cursor = "grabbing";
    renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener("pointermove", function (event) {
    if (!isDragging || !dragon) return;

    var deltaX = event.clientX - previousPointerX;
    dragon.rotation.y += deltaX * 0.01;
    previousPointerX = event.clientX;
});

renderer.domElement.addEventListener("pointerup", function (event) {
    isDragging = false;
    renderer.domElement.style.cursor = "grab";

    if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
    }
});

renderer.domElement.addEventListener("pointercancel", function () {
    isDragging = false;
    renderer.domElement.style.cursor = "grab";
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
    var duration = 1.25;
    var master = audioContext.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.45, now + 0.08);
    master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    master.connect(audioContext.destination);

    // 低沉下滑的锯齿波，加上滤波噪声，形成粗粝的咆哮质感。
    var growl = audioContext.createOscillator();
    var growlGain = audioContext.createGain();
    var growlFilter = audioContext.createBiquadFilter();
    growl.type = "sawtooth";
    growl.frequency.setValueAtTime(115, now);
    growl.frequency.exponentialRampToValueAtTime(42, now + duration);
    growlFilter.type = "lowpass";
    growlFilter.frequency.setValueAtTime(700, now);
    growlFilter.frequency.exponentialRampToValueAtTime(180, now + duration);
    growlGain.gain.setValueAtTime(0.7, now);
    growlGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    growl.connect(growlFilter);
    growlFilter.connect(growlGain);
    growlGain.connect(master);
    growl.start(now);
    growl.stop(now + duration);

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
    noiseFilter.frequency.setValueAtTime(850, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(300, now + duration);
    noiseFilter.Q.value = 0.8;
    noiseGain.gain.setValueAtTime(0.22, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now);
    noise.stop(now + duration);

    petMessage.textContent = "嗷——！龙听见你了。";
});

// 10. 持续渲染场景
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();


