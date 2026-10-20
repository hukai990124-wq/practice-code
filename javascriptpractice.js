// Three.js 用于创建和显示 3D 场景；GLTFLoader 负责读取 .glb/.gltf 模型文件。
import * as THREE from "three";
import{ GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
console.log("Three.js version", THREE.REVISION);
var loader = new GLTFLoader();
console.log("GLTFLoader initialized", loader);

// 1. 创建场景：场景是所有灯光、地形和宠物模型的共同容器。
var scene = new THREE.Scene();
var meadowSkyColor = new THREE.Color(0xb8d9d5);
scene.background = meadowSkyColor;
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
    antialias: true,
    alpha: true
});
renderer.setClearColor(0x000000, 0);

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
var activeCharacterModel;
var sirGavinModel;
var sirGavinLoading = false;
var sirGavinMixer;
var sirIdleAction;
var sirHandshakeAction;
var currentCharacterId = "draco";
var dragonMixer;
var dragonFeedAction;
var dragonPetAction;
var animationClock = new THREE.Clock();

// 角色展示设置：Sir.Gavin 使用城堡背景和上半身近景，Draco 保留草地全景。
function setCharacterPresentation(characterId) {
    var isSirGavin = characterId === "sir-gavin";
    container.classList.toggle("sir-gavin-background", isSirGavin);
    meadow.visible = !isSirGavin;
    scene.background = isSirGavin ? null : meadowSkyColor;
    scene.fog = isSirGavin ? null : new THREE.Fog(0xb8d9d5, 22, 70);

    var cameraHeight = isSirGavin ? 0.72 : 0;
    camera.position.set(0, cameraHeight, isSirGavin ? 2.9 : 6);
    camera.lookAt(0, cameraHeight, 0);
}

// 依据模型包围盒统一缩放并居中，保证不同角色能在同一个 3D 画布中展示。
function fitCharacterModel(model) {
    var box = new THREE.Box3().setFromObject(model);
    var center = box.getCenter(new THREE.Vector3());
    var size = box.getSize(new THREE.Vector3());
    var maxSize = Math.max(size.x, size.y, size.z);

    if (maxSize > 0) {
        var scale = 3 / maxSize;
        model.scale.setScalar(scale);
        model.position.copy(center).multiplyScalar(-scale);
    }
}

// Sir.Gavin 动作：加载模型自带的 3 秒循环待机和握手动画，并在两者间平滑切换。
function createSirGavinAnimationActions(model, animations) {
    var idleClip = animations.find(function (clip) {
        return clip.name === "Gavin_Idle_HandsOnHips_Loop";
    }) || animations.find(function (clip) {
        return clip.name.toLowerCase().includes("idle");
    });
    var handshakeClip = animations.find(function (clip) {
        return clip.name === "Gavin_RightHand_Handshake_Offer";
    }) || animations.find(function (clip) {
        return clip.name.toLowerCase().includes("handshake");
    });
    sirGavinMixer = new THREE.AnimationMixer(model);
    if (idleClip) {
        sirIdleAction = sirGavinMixer.clipAction(idleClip);
        sirIdleAction.setLoop(THREE.LoopRepeat, Infinity);
        sirIdleAction.play();
    } else {
        console.error("Sir.Gavin model does not contain an idle animation.");
    }

    if (handshakeClip) {
        sirHandshakeAction = sirGavinMixer.clipAction(handshakeClip);
        sirHandshakeAction.setLoop(THREE.LoopOnce, 1);
        sirHandshakeAction.clampWhenFinished = true;
        sirGavinMixer.addEventListener("finished", function (event) {
            if (event.action !== sirHandshakeAction) return;
            // 握手结束后淡出握手姿势，并从头恢复循环待机动作。
            sirHandshakeAction.fadeOut(0.25);
            if (sirIdleAction) sirIdleAction.reset().fadeIn(0.25).play();
        });
    } else {
        console.error("Sir.Gavin model does not contain a handshake animation.");
    }
}

// 切换当前可见角色模型；模型加载完成前保留画布中的现有角色。
function activateCharacterModel(characterId) {
    currentCharacterId = characterId;
    setCharacterPresentation(characterId);

    if (characterId === "draco") {
        if (!dragon) return;
        if (activeCharacterModel !== dragon) {
            if (activeCharacterModel) scene.remove(activeCharacterModel);
            activeCharacterModel = dragon;
            scene.add(activeCharacterModel);
        }
        return;
    }

    if (sirGavinModel) {
        if (activeCharacterModel) scene.remove(activeCharacterModel);
        activeCharacterModel = sirGavinModel;
        scene.add(activeCharacterModel);
        // 再次选中 Sir.Gavin 时从待机动画起点重新循环。
        if (sirIdleAction) sirIdleAction.reset().play();
        return;
    }

    if (sirGavinLoading) return;
    sirGavinLoading = true;
    petMessage.textContent = "Sir.Gavin is joining…";
    loader.load(
        "./sir_gavin.glb",
        function (gltf) {
            sirGavinModel = gltf.scene;
            fitCharacterModel(sirGavinModel);
            createSirGavinAnimationActions(sirGavinModel, gltf.animations);
            sirGavinLoading = false;

            if (currentCharacterId === "sir-gavin") {
                if (activeCharacterModel) scene.remove(activeCharacterModel);
                activeCharacterModel = sirGavinModel;
                scene.add(activeCharacterModel);
                shakeHandsButton.disabled = false;
                petMessage.textContent = "Sir.Gavin is ready to shake hands.";
            }
        },
        undefined,
        function (error) {
            sirGavinLoading = false;
            console.error("Sir.Gavin model failed to load:", error);
            petMessage.textContent = "Could not load Sir.Gavin. Please check the model file.";
        }
    );
}

// load 的参数依次为模型路径、成功回调、加载进度回调和失败回调。
loader.load(
    "./blakcdragon.glb",

    function (gltf) {
        dragon = gltf.scene;

        // 按动画名称分别绑定 Feed 和 Pet 动作；两段都只播放一次并停在结束姿势。
        if (gltf.animations.length > 0) {
            dragonMixer = new THREE.AnimationMixer(dragon);
            var feedClip = gltf.animations.find(function (clip) {
                return clip.name.includes("HeadLift");
            });
            var petClip = gltf.animations.find(function (clip) {
                return clip.name.includes("HeadBow");
            });

            if (feedClip) {
                dragonFeedAction = dragonMixer.clipAction(feedClip);
                dragonFeedAction.setLoop(THREE.LoopOnce, 1);
                dragonFeedAction.clampWhenFinished = true;
            }

            if (petClip) {
                dragonPetAction = dragonMixer.clipAction(petClip);
                dragonPetAction.setLoop(THREE.LoopOnce, 1);
                dragonPetAction.clampWhenFinished = true;
            }
        }

        fitCharacterModel(dragon);

        // Draco 加载完成时只在当前选中 Draco 的情况下显示，避免覆盖正在显示的其他角色。
        if (currentCharacterId === "draco") {
            if (activeCharacterModel) scene.remove(activeCharacterModel);
            activeCharacterModel = dragon;
            scene.add(activeCharacterModel);
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
    if ((!isDragging && !isMoving) || !activeCharacterModel) return;

    var deltaX = event.clientX - previousPointerX;
    var deltaY = event.clientY - previousPointerY;

    if (isMoving) {
        // 把像素移动量换算为场景单位，使平移速度随缩放距离变化。
        var worldUnitsPerPixel = (2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / container.clientHeight;
        activeCharacterModel.position.x += deltaX * worldUnitsPerPixel;
        activeCharacterModel.position.y -= deltaY * worldUnitsPerPixel;
    } else {
        activeCharacterModel.rotation.y += deltaX * 0.01;
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
var petDracoButton = document.getElementById("pet-draco");
var petMessage = document.getElementById("pet-message");
var petSelect = document.getElementById("pet-select");
var petName = document.getElementById("pet-name");
var petAge = document.getElementById("pet-age");
var petNameLabel = document.getElementById("pet-name-label");
var petAgeLabel = document.getElementById("pet-age-label");
var petTitle = document.getElementById("pet-title");
var dracoActions = document.getElementById("draco-actions");
var shakeHandsButton = document.getElementById("shake-hands");
var readTextPanel = document.getElementById("read-text-panel");
var sirGavinChatPanel = document.getElementById("sir-gavin-chat");
var dracoText = document.getElementById("draco-text");
var dracoLanguage = document.getElementById("draco-language");
var readTextButton = document.getElementById("read-text");
var stopReadingButton = document.getElementById("stop-reading");
var selectedPetName = petSelect.options[petSelect.selectedIndex].textContent;

// Read Text功能：使用设备提供的 TTS，并以较低音调和较慢语速营造更厚实的龙声。
var speechSynthesisEngine = window.speechSynthesis;
var activeSpeechUtterance;

readTextButton.addEventListener("click", function () {
    var textToRead = dracoText.value.trim();
    if (!textToRead) {
        petMessage.textContent = "Enter some text for Draco to read.";
        dracoText.focus();
        return;
    }

    if (!speechSynthesisEngine) {
        petMessage.textContent = "Text-to-speech is not available in this browser.";
        return;
    }

    speechSynthesisEngine.cancel();
    activeSpeechUtterance = new SpeechSynthesisUtterance(textToRead);

    // 按用户选择的语言匹配设备语音，并优先挑选名称中能识别为男声的语音。
    var speechLanguage = dracoLanguage.value;
    var availableVoices = speechSynthesisEngine.getVoices();
    var languageVoices = availableVoices.filter(function (voice) {
        return voice.lang.toLowerCase().startsWith(speechLanguage.toLowerCase());
    });
    // 若没有地区匹配项，退回同一语言的其他地区声音，例如其他英语口音。
    if (languageVoices.length === 0) {
        var baseLanguage = speechLanguage.slice(0, 2).toLowerCase();
        languageVoices = availableVoices.filter(function (voice) {
            return voice.lang.toLowerCase().startsWith(baseLanguage);
        });
    }
    var maleVoiceNamePattern = /(^|[\s_-])(david|mark|guy|ryan|christopher|alex|daniel|james|george|oliver|thomas|andrew|keita|otoya|ichiro|hiroshi|takumi|kangkang|yunjian|yunxi|yunyang|male)(?=$|[\s_-])/i;
    var preferredMaleVoice = languageVoices.find(function (voice) {
        return voice.localService && maleVoiceNamePattern.test(voice.name);
    }) || languageVoices.find(function (voice) {
        return maleVoiceNamePattern.test(voice.name);
    });
    var selectedVoice = preferredMaleVoice || languageVoices.find(function (voice) {
        return voice.localService;
    });
    activeSpeechUtterance.voice = selectedVoice || languageVoices[0] || null;
    activeSpeechUtterance.lang = selectedVoice ? selectedVoice.lang : speechLanguage;
    activeSpeechUtterance.pitch = 0.58;
    activeSpeechUtterance.rate = 0.86;
    activeSpeechUtterance.volume = 1;

    activeSpeechUtterance.onstart = function () {
        petMessage.textContent = preferredMaleVoice
            ? "Draco is reading…"
            : "Draco is reading with an available voice; no recognized male voice was found on this device.";
    };
    activeSpeechUtterance.onend = function () {
        petMessage.textContent = "Draco finished reading.";
    };
    activeSpeechUtterance.onerror = function (event) {
        console.error("Text-to-speech playback failed:", event.error, event.message);
        if (event.error !== "canceled" && event.error !== "interrupted") {
            petMessage.textContent = selectedVoice && !selectedVoice.localService
                ? "The online voice for " + speechLanguage + " failed. Check the connection or install an offline voice for this language."
                : "Draco could not read that text (" + event.error + "). Check the selected language's voice availability.";
        }
    };

    speechSynthesisEngine.speak(activeSpeechUtterance);
});

stopReadingButton.addEventListener("click", function () {
    if (speechSynthesisEngine) speechSynthesisEngine.cancel();
    petMessage.textContent = "Draco stopped reading.";
});

// Contact Author功能：打开 GitHub 联系弹窗，并支持关闭按钮和点击遮罩关闭。
var contactAuthorTrigger = document.getElementById("contact-author-trigger");
var contactAuthorDialog = document.getElementById("contact-author-dialog");
var contactAuthorClose = document.getElementById("contact-author-close");

contactAuthorTrigger.addEventListener("click", function () {
    contactAuthorDialog.showModal();
});

contactAuthorClose.addEventListener("click", function () {
    contactAuthorDialog.close();
});

contactAuthorDialog.addEventListener("click", function (event) {
    if (event.target === contactAuthorDialog) {
        contactAuthorDialog.close();
    }
});

// 角色切换功能：同步角色资料、专属按钮和 3D 模型显示。
petSelect.addEventListener("change", function () {
    var selectedOption = petSelect.options[petSelect.selectedIndex];
    selectedPetName = selectedOption.textContent;
    currentCharacterId = selectedOption.value;
    var isDraco = currentCharacterId === "draco";

    petName.textContent = selectedPetName;
    petTitle.textContent = isDraco ? "Web Pet" : "Character";
    petNameLabel.textContent = isDraco ? "Pet Name" : "Character";
    petAgeLabel.textContent = isDraco ? "Age" : "Type";
    petAge.textContent = isDraco ? selectedOption.dataset.age : selectedOption.dataset.kind;
    dracoActions.hidden = !isDraco;
    shakeHandsButton.hidden = isDraco;
    shakeHandsButton.disabled = !isDraco && !sirGavinModel;
    // 根据所选角色切换专属下方区域：Draco使用朗读面板，Sir.Gavin显示预留聊天窗口。
    readTextPanel.hidden = !isDraco;
    sirGavinChatPanel.hidden = isDraco;

    if (isDraco) {
        if (sirGavinMixer) sirGavinMixer.stopAllAction();
        feedButton.textContent = "Feed " + selectedPetName;
        petDracoButton.textContent = "Pet " + selectedPetName;
    } else {
        if (dragonMixer) dragonMixer.stopAllAction();
        dragonRoar.pause();
        dragonPetSound.pause();
        if (speechSynthesisEngine) speechSynthesisEngine.cancel();
    }

    activateCharacterModel(currentCharacterId);
    petMessage.textContent = isDraco
        ? "Draco is ready to meet you."
        : sirGavinModel ? "Sir.Gavin is ready to shake hands." : "Sir.Gavin is joining…";
});

// 用项目里的真实龙吼音频替代 Web Audio 合成音；src 路径相对于 practice.html。
var dragonRoar = document.getElementById("dragon-roar");
dragonRoar.volume = 0.8;

// 抚摸 Draco 功能：播放新加入的抚摸回应音频，并显示指定的互动回应。
var dragonPetSound = document.getElementById("dragon-pet-sound");

petDracoButton.addEventListener("click", function () {
    if (currentCharacterId !== "draco") return;
    // 抚摸时播放模型专属的低头、收翼和尾巴回摆动作。
    if (dragonPetAction) {
        if (dragonFeedAction) dragonFeedAction.stop();
        dragonPetAction.reset();
        dragonPetAction.play();
    }

    dragonPetSound.pause();
    dragonPetSound.currentTime = 0;
    petMessage.textContent = "Draco accepts your petting.";

    dragonPetSound.play().catch(function (error) {
        console.error("抚摸回应音频播放失败：", error);
    });
});

// Shake hands功能：为 Sir.Gavin 提供握手动作、回应和 Kokoro 男声台词。
var sirHandshakeVoice = document.getElementById("sir-gavin-handshake-voice");
shakeHandsButton.addEventListener("click", function () {
    if (currentCharacterId !== "sir-gavin" || !sirGavinModel) return;
    // 再次点击会从抬手开始重播整段握手动作。
    if (sirHandshakeAction) {
        if (sirIdleAction) sirIdleAction.fadeOut(0.2);
        sirHandshakeAction.reset();
        sirHandshakeAction.fadeIn(0.2).play();
    }
    petMessage.textContent = "You shook hands with Sir.Gavin.";

    // 握手时播放 Kokoro 生成的低沉男声台词；每次点击都从头播放。
    sirHandshakeVoice.pause();
    sirHandshakeVoice.currentTime = 0;
    sirHandshakeVoice.play().catch(function (error) {
        console.error("Sir.Gavin handshake voice playback failed:", error);
        petMessage.textContent = "You shook hands with Sir.Gavin, but the voice could not be played.";
    });
});

feedButton.addEventListener("click", function () {
    if (currentCharacterId !== "draco") return;
    // 点击 Feed 时重置并播放模型动画，使动作与下面的龙吼同时开始。
    if (dragonFeedAction) {
        if (dragonPetAction) dragonPetAction.stop();
        dragonFeedAction.reset();
        dragonFeedAction.play();
    }

    // 重复点击时从头播放，避免多段龙吼叠在一起。
    dragonRoar.pause();
    dragonRoar.currentTime = 0;

    // 浏览器要求音频由用户操作触发；播放失败时给出可见提示。
    dragonRoar.play().then(function () {
        petMessage.textContent = selectedPetName + " is happy now! 🐉";
    }).catch(function (error) {
        console.error("龙吼音频播放失败：", error);
        petMessage.textContent = "Could not play the roar. Please check the audio file.";
    });
});

// 11. 每帧重新绘制场景；requestAnimationFrame 跟随浏览器刷新节奏运行。
function animate() {
    requestAnimationFrame(animate);
    // 每帧推进动画混合器，让 GLB 动画按真实经过时间播放。
    var frameDelta = animationClock.getDelta();
    if (dragonMixer && currentCharacterId === "draco") dragonMixer.update(frameDelta);
    if (sirGavinMixer && currentCharacterId === "sir-gavin") sirGavinMixer.update(frameDelta);
    renderer.render(scene, camera);
}

animate();


