import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { type State } from '../state'

@action({ UUID: "com.kokima.beatout.camera" })
export class CameraSelector extends SingletonAction<CameraSettings> {
	private state: State;

    constructor(state: State) {
        super(); 
		this.state = state
		this.state.registerSelectedCamera(id => this.onCameraSwitched(id))
    }

	onCameraSwitched (selectedCameraId: string) {
		this.actions.forEach(async ev => {
			const settings = await ev.getSettings()
			let url = "imgs/actions/camera/camera-regular.png"
			if (settings.cameraId === selectedCameraId) {
				url = "imgs/actions/camera/camera-selected.png"
			}
			await ev.setImage(url)
        });
	}
	override async onWillAppear(ev: WillAppearEvent<CameraSettings>): Promise<void> {
		const cameraId = ev.payload.settings.cameraId;
		await ev.action.setSettings({ cameraId }),
		await ev.action.setImage("imgs/actions/camera/camera-regular.png")
	}

	override async onKeyDown(ev: KeyDownEvent<CameraSettings>): Promise<void> {
		const { settings } = ev.payload;
		this.state.switchCamera(settings.cameraId)
	}
}

type CameraSettings = {
	cameraId: string;
};
