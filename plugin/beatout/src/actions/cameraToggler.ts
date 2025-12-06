import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { type State } from '../state'

@action({ UUID: "com.kokima.beatout.camera-toggle" })
export class CameraToggler extends SingletonAction<ToggleSettings> {
	private state: State;

    constructor(state: State) {
        super(); 
		this.state = state
		this.state.registerToggleCamera(enable => this.onCameraToggleUpdate(enable))
		console.error("HELLO WORLD 3")
    }

	onCameraToggleUpdate (enable: boolean) {
		console.error("HELL on")
		let url = "imgs/actions/camera/toggle-regular.png"
		if (enable) {
			url = "imgs/actions/camera/toggle-selected.png"
		}
		console.log("url", url)
		this.actions.forEach(async ev => {
			await ev.setImage(url)
        });
	}
	override async onWillAppear(ev: WillAppearEvent<ToggleSettings>): Promise<void> {
		await ev.action.setImage("imgs/actions/camera/toggle-selected.png")
	}

	override async onKeyDown(ev: KeyDownEvent<ToggleSettings>): Promise<void> {
		this.state.setCameraToggle(!this.state.cameraSelectorEnabled)
	}
}

type ToggleSettings = {
};
