const video = document.createElement('video');
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
const mouth  = document.getElementById('mouth');
let W, H;

// 1. pedir cámara
navigator.mediaDevices.getUserMedia({video:true}).then(s => {
  video.srcObject = s;
  video.play();
  video.onloadedmetadata = () => {
    W = canvas.width  = video.videoWidth;
    H = canvas.height = video.videoHeight;
  };
});

// 2. cargar Mediapipe FaceMesh
import('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js').then(mp => {
  const faceMesh = new mp.FaceMesh({locateFile: f =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`});
  faceMesh.setOptions({maxNumFaces:1});
  faceMesh.onResults(({multiFaceLandmarks:l}) => {
    ctx.clearRect(0,0,W,H);
    if(!l.length) return;
    // puntos 13 y 14 = centro labio sup/inf
    const top=l[0][13], bot=l[0][14];
    const mh = Math.hypot((bot.y-top.y)*H,(bot.x-top.x)*W)*2; // alto
    const mw = mh*1.4;                                        // ancho
    const x  = top.x*W - mw/2;
    const y  = top.y*H - mh/4;
    ctx.drawImage(mouth,x,y,mw,mh);
  });

  import('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
    .then(({Camera}) =>
      new Camera(video,{onFrame:async()=>faceMesh.send({image:video})}).start());
});
