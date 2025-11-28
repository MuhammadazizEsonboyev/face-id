const video = document.getElementById('video');
const imageUpload = document.getElementById('imageUpload');
const result = document.getElementById('result');
const checkBtn = document.getElementById('checkFace');


let referenceDescriptor = null;


// MODELLARNI YUKLASH
Promise.all([
faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
faceapi.nets.faceRecognitionNet.loadFromUri('./models')
]).then(startVideo);


// KAMERANI YOQISH
function startVideo() {
navigator.mediaDevices.getUserMedia({ video: {} })
.then(stream => video.srcObject = stream)
.catch(err => console.error(err));
}


// RASM YUKLANGANDA UNI O'QISH
imageUpload.addEventListener('change', async () => {
const file = imageUpload.files[0];
const img = await faceapi.bufferToImage(file);


const detections = await faceapi
.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
.withFaceLandmarks()
.withFaceDescriptor();


if (!detections) {
result.innerText = '❌ Yuz aniqlanmadi. Boshqa rasm tanlang.';
return;
}


referenceDescriptor = detections.descriptor;
result.innerText = '✅ Rasm saqlandi. Endi yuzni tekshirishingiz mumkin.';
});


// REAL VAQTDA SOLISHTIRISH
checkBtn.addEventListener('click', async () => {
if (!referenceDescriptor) {
result.innerText = '⚠️ Avval rasm yuklang!';
return;
}


const detection = await faceapi
.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
.withFaceLandmarks()
.withFaceDescriptor();


if (!detection) {
result.innerText = '❌ Kamera yuzni ko‘rmadi';
return;
}


const distance = faceapi.euclideanDistance(referenceDescriptor, detection.descriptor);


if (distance < 0.6) {
result.innerText = '✅ BU SIZ! (Moslik aniqlandi)';
} else {
result.innerText = '❌ BU SIZ EMASSIZ!';
}
});