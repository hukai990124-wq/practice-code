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

// 7. 让龙自动旋转
function animate() {
    requestAnimationFrame(animate);

    if (dragon) {
        dragon.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
}

animate();


