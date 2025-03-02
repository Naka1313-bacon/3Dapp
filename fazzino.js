import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { OrbitControls } from 'OrbitControls';

const modelInfo = {
  './assets/lovelyMt.glb': {
    title: 'ラブリー・Mt.Fuji・ミニ',
    size: '33×38cm',
    price: '132,000円 (税込)',
    shopUrl: 'https://www.fazzino.jp/guide/3Dart/Lovely-Mt.Fuji-Mini'
  },
  './assets/mistic.glb': {
    title: 'ミスティック・Mt.Fuji',
    size: '36×53cm',
    price: '220,000円 (税込)',
    shopUrl: 'https://www.fazzino.jp/guide/3Dart/Mystique-of-MtFuji'
  },
  './assets/shanghai.glb': {
    title: 'ハッピー上海',
    size: '33×38cm',
    price: '110,000円 (税込)',
    shopUrl: 'https://www.fazzino.jp/guide/3Dart/Shanghai-Mini'
  },
  './assets/santa.glb': {
    title: 'サンタ・アラウンド・ザ・ワールド（color）',
    size: '48×48cm',
    price: '264,000円 (税込)',
    shopUrl: 'https://example.com/shop/santa'
  },
};

function getDeviceType() {
  const width = window.innerWidth;
  console.log('Current window width:', width); // デバッグ用
  if (width <= 480) {
    console.log('Detected device: mobile');
    return 'mobile';
  }
  if (width <= 768) {
    console.log('Detected device: tablet');
    return 'tablet';
  }
  console.log('Detected device: desktop');
  return 'desktop';
}

function updateInfoPanel(modelUrl) {
  const info = modelInfo[modelUrl];
  if (!info) return;

  document.getElementById('modelTitle').textContent = info.title;
  document.getElementById('modelSize').textContent = `サイズ: ${info.size}`;
  document.getElementById('modelPrice').textContent = `価格: ${info.price}`;
  document.getElementById('modelLink').href = info.shopUrl;
}
// シーン、カメラ、レンダラーの初期設定
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);


updateControlsDistance();
function updateControlsDistance() {
  const deviceType = getDeviceType();
  console.log('Current device type:', deviceType); // デバッグ用

  switch (deviceType) {
    case 'mobile':
      controls.minDistance = 1;
      controls.maxDistance = 10;
      break;
    case 'tablet':
      controls.minDistance = 0;
      controls.maxDistance = 2;
      break;
    case 'desktop':
      controls.minDistance = 0;
      controls.maxDistance = 1.3;
      break;
  }
  
  // 現在の設定を確認
  console.log('Current distance settings:', {
    min: controls.minDistance,
    max: controls.maxDistance
  });
}
updateControlsDistance();


controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,       // 一本指で回転
  TWO: THREE.TOUCH.DOLLY_PAN    // 二本指でズームとパン
};
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,    // 左クリックで回転
  MIDDLE: THREE.MOUSE.DOLLY,   // ホイールクリックでズーム
  RIGHT: THREE.MOUSE.PAN      // 右クリックでパン
};

// キー操作の有効化
controls.enableKeys = true;
controls.keys = {
  LEFT: 'ArrowLeft',    // 左矢印キー
  UP: 'ArrowUp',       // 上矢印キー
  RIGHT: 'ArrowRight', // 右矢印キー
  BOTTOM: 'ArrowDown'  // 下矢印キー
};
// 現在のモデルを追跡する変数
let currentModel = null;

// モデルを読み込む関数
function loadModel(modelUrl) {
  const loader = new GLTFLoader();
  
  // 既存のモデルがある場合は削除
  if (currentModel) {
    scene.remove(currentModel);
  }

  loader.load(modelUrl, (gltf) => {
    const model = gltf.scene;
    
    model.traverse((child) => {
      if (child.isMesh) {
        const originalMaterial = child.material;
        const albedoMaterial = new THREE.MeshBasicMaterial();
        if (originalMaterial.map) {
          albedoMaterial.map = originalMaterial.map;
          albedoMaterial.map.needsUpdate = true;
        } else {
          albedoMaterial.color.copy(originalMaterial.color);
        }
        child.material = albedoMaterial;
      }
    });
    
    currentModel = model;
    scene.add(model);
    updateInfoPanel(modelUrl);
  }, undefined, (error) => {
    console.error('モデルの読み込みに失敗しました:', error);
  });
}

// セレクトボックスの変更イベントを監視
document.getElementById('modelChoice').addEventListener('change', (event) => {
  loadModel(event.target.value);
});

// 初期モデルの読み込み
loadModel(document.getElementById('modelChoice').value);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
window.addEventListener('orientationchange', () => {
  setTimeout(updateControlsDistance, 100); // 向き変更後に少し待ってから更新
});
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  setTimeout(updateControlsDistance, 100);
});