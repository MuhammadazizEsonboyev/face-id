const video = document.getElementById('video');
const imageUpload = document.getElementById('imageUpload');
const uploadedImage = document.getElementById('uploadedImage');
const result = document.getElementById('result');
const compareBtn = document.getElementById('compareBtn');

let referenceDescriptor;

// Kamera yoqish
async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
}

// Modellarni yuklash
Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models')
]).then(startCamera);

// Yuklangan rasmni o‘qish
imageUpload.addEventListener('change', async () => {
    const file = imageUpload.files[0];
    const img = await faceapi.bufferToImage(file);
    uploadedImage.src = img.src;

    const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) {
        result.textContent = "Rasmda yuz topilmadi ❌";
        return;
    }

    referenceDescriptor = detection.descriptor;
    result.textContent = "Rasm yuklandi va yuz saqlandi ✅";
});

// Solishtirish
compareBtn.addEventListener('click', async () => {
    if (!referenceDescriptor) {
        result.textContent = "Avval rasm yuklang!";
        return;
    }

    const liveDetection = await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!liveDetection) {
        result.textContent = "Kamerada yuz topilmadi!";
        return;
    }

    const distance = faceapi.euclideanDistance(
        referenceDescriptor,
        liveDetection.descriptor
    );

    let similarity = Math.round((1 - distance) * 100);

    if(similarity > 60){
        result.textContent = `✅ Moslik: ${similarity}% - Bu bir xil odam`;
        result.style.color = "green";
    } else {
        result.textContent = `❌ Mos emas: ${similarity}%`;
        result.style.color = "red";
    }
});
