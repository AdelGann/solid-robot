document.addEventListener("DOMContentLoaded", () => {
	const socket = io("https://solid-robot.vercel.app/");

	let audioChunks = [];
	let recording = false;

	document.getElementById("startRecording").addEventListener("click", () => {
		audioChunks = [];
		recording = true;
		console.log("Grabación iniciada");
	});

	document.getElementById("stopRecording").addEventListener("click", () => {
		recording = false;
		const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
		const audioUrl = URL.createObjectURL(audioBlob);
		const audioElement = document.getElementById("audio");
		audioElement.src = audioUrl;
		audioElement.play();
		console.log("Grabación detenida y guardada");

		// Crear y descargar el archivo WAV
		createWavFile(audioChunks, "grabacion.wav");
	});

	socket.on("audio", (data) => {
		if (recording) {
			const float32Array = Float32Array.from(data);
			audioChunks.push(float32Array.buffer);
			console.log("Datos de audio recibidos y añadidos a la grabación:", data);
		} else {
			console.warn("Grabación no activa, datos de audio no añadidos");
		}
	});
});

// Función para crear y descargar un archivo WAV
function createWavFile(audioBuffers, filename) {
	const interleaved = interleave(audioBuffers);
	const wavBuffer = encodeWAV(interleaved);
	const blob = new Blob([wavBuffer], { type: "audio/wav" });
	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

// Función para intercalar los buffers de audio
function interleave(audioBuffers) {
	const length = audioBuffers.reduce((acc, buffer) => acc + buffer.byteLength, 0);
	const interleaved = new Float32Array(length);
	let offset = 0;
	audioBuffers.forEach((buffer) => {
		interleaved.set(new Float32Array(buffer), offset);
		offset += buffer.byteLength / 4;
	});
	return interleaved;
}

// Función para codificar los datos en formato WAV
function encodeWAV(samples) {
	const buffer = new ArrayBuffer(44 + samples.length * 2);
	const view = new DataView(buffer);

	writeString(view, 0, "RIFF");
	view.setUint32(4, 36 + samples.length * 2, true);
	writeString(view, 8, "WAVE");
	writeString(view, 12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, 44100, true);
	view.setUint32(28, 44100 * 2, true);
	view.setUint16(32, 2, true);
	view.setUint16(34, 16, true);
	writeString(view, 36, "data");
	view.setUint32(40, samples.length * 2, true);

	floatTo16BitPCM(view, 44, samples);

	return buffer;
}

function writeString(view, offset, string) {
	for (let i = 0; i < string.length; i++) {
		view.setUint8(offset + i, string.charCodeAt(i));
	}
}

function floatTo16BitPCM(output, offset, input) {
	for (let i = 0; i < input.length; i++, offset += 2) {
		const s = Math.max(-1, Math.min(1, input[i]));
		output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
	}
}
