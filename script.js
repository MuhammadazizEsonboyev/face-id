const photo = document.getElementById('photo');
const preview = document.getElementById('preview');
const startBtn = document.getElementById('startBtn');
const video = document.getElementById('video');
const status = document.getElementById('status');

let savedDescriptor; // rasmni saqlash uchun

// Modellarni CDN orqali yuklash
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/models')
]).then(() => {
    status.textContent = "Modellar yuklandi ✅";
});

// 1. Rasmni tanlash va saqlash
photo.addEventListener('change', async () => {
    const file = photo.files[0];
    if(!file) return;

    const img = await faceapi.bufferToImage(file);
    preview.src = img.src;

    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if(!detection){
        status.textContent = "Rasmda yuz topilmadi ❌";
        return;
    }

    savedDescriptor = detection.descriptor;
    status.textContent = "Rasm saqlandi ✅";
});

// 2. Kamera va solishtirish
startBtn.addEventListener('click', async () => {
    if(!savedDescriptor){
        alert("Avval rasm yuklang!");
        return;
    }

    // Kamera ishga tushadi
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    status.textContent = "Kamera ishlayapti, yuzni aniqlash...";

    // Har 1.5 soniyada solishtirish
    setInterval(async () => {
        const detection = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();
        if(!detection){
            status.textContent = "Kamerada yuz topilmadi ❌";
            return;
        }

        const distance = faceapi.euclideanDistance(savedDescriptor, detection.descriptor);
        const percent = Math.round((1 - distance) * 100);

        if(percent > 60){
            status.textContent = `✅ MOS! O'xshashlik: ${percent}%`;
            status.style.color = "green";
        } else {
            status.textContent = `❌ MOS EMAS: ${percent}%`;
            status.style.color = "red";
        }
    }, 1500);
});
