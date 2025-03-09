const socket = io("https://solid-robot.vercel.app/");

let audioContext;
let mediaStream;
let audioWorkletNode;

document.getElementById("start").addEventListener("click", async () => {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		console.log("Micrófono activado");

		audioContext = new (window.AudioContext || window.webkitAudioContext)();
		mediaStream = stream;

		await audioContext.audioWorklet.addModule("./audio.js");
		console.log("AudioWorkletModule cargado");

		audioWorkletNode = new AudioWorkletNode(audioContext, "audio-processor");
		console.log("AudioWorkletNode creado");

		const source = audioContext.createMediaStreamSource(stream);
		source.connect(audioWorkletNode);
		audioWorkletNode.connect(audioContext.destination);

		audioWorkletNode.port.onmessage = (event) => {
			const data = event.data;
			if (data && data.length > 0) {
				socket.emit("audio", Array.from(data));
				console.log("Datos de audio emitidos:", Array.from(data));
			} else {
				console.warn("Datos de audio vacíos no enviados");
			}
		};
	} catch (error) {
		console.error("Error al iniciar la transmisión:", error);
	}
});

document.getElementById("stop").addEventListener("click", () => {
	if (mediaStream) {
		mediaStream.getTracks().forEach((track) => track.stop());
		console.log("Micrófono detenido");
	}
	if (audioWorkletNode) {
		audioWorkletNode.port.close();
		audioWorkletNode.disconnect();
		console.log("AudioWorkletNode desconectado");
	}
	if (audioContext) {
		audioContext.close();
		console.log("AudioContext cerrado");
	}
});
