class AudioProcessor extends AudioWorkletProcessor {
	constructor() {
		super();
		this.port.onmessage = (event) => {
			this.port.postMessage(event.data);
		};
	}

	process(inputs, outputs, parameters) {
		const input = inputs[0];
		if (input.length > 0) {
			this.port.postMessage(input[0]);
		}
		return true;
	}
}

registerProcessor("audio-processor", AudioProcessor);
