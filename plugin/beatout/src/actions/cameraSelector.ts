import { action, DialAction, KeyAction, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { type State } from '../state'

@action({ UUID: "com.kokima.beatout.camera" })
export class CameraSelector extends SingletonAction<CameraSettings> {
	private state: State; // WebSocket instantie
	private action?: DialAction<CameraSettings> | KeyAction<CameraSettings>;

    constructor(state: State) {
        super(); 
		this.state = state
		this.state.registerSelectedCamera(this.onCameraSwitched)
    }

	/*
	private updateAppearance(cameraId: string, ev?: WillAppearEvent<CameraSettings>) {
		this.steamDeck.
    	const client = ev?.action.client || this.streamDeck.client;
		if (!client) return;

		// Check of dit de "juiste" camera is
		const isSelected = cameraId === this.state.selectedCameraId;

		// Stel kleur in: groen als geselecteerd, rood als niet
		const color = isSelected ? { r: 0, g: 200, b: 0 } : { r: 200, g: 0, b: 0 };

		client.setFillColor(ev?.context || this.streamDeck.context, color);
	} */

	onCameraSwitched (selectedCameraId: string) {
		console.log('Camera switches to ', selectedCameraId, this.action)
		// this.action?.showAlert()
	}
	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible. This could be due to the Stream Deck first
	 * starting up, or the user navigating between pages / folders etc.. There is also an inverse of this event in the form of {@link streamDeck.client.onWillDisappear}. In this example,
	 * we're setting the title to the "cameraId".
	 */
	override onWillAppear(ev: WillAppearEvent<CameraSettings>): void | Promise<void> {
		this.action = ev.action
		return ev.action.setTitle(`${ev.payload.settings.cameraId}`);
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed. Stream Deck provides various events for tracking interaction
	 * with devices including key down/up, dial rotations, and device connectivity, etc. When triggered, {@link ev} object contains information about the event including any payloads
	 * and action information where applicable. In this example, our action will display a counter that increments by one each press. We track the current count on the action's persisted
	 * settings using `setSettings` and `getSettings`.
	 */ 
	override async onKeyDown(ev: KeyDownEvent<CameraSettings>): Promise<void> {
		const { settings } = ev.payload;
		this.state.switchCamera(settings.cameraId)
	}
}

/**
 * Settings for {@link IncrementCounter}.
 */
type CameraSettings = {
	cameraId: string;
};
