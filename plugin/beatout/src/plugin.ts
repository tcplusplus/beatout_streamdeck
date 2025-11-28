import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { State } from './state'
import { CameraSelector } from "./actions/cameraSelector";

streamDeck.logger.setLevel(LogLevel.TRACE);

try {
    const state = new State()
    streamDeck.actions.registerAction(new CameraSelector(state));
} catch(e) {
    console.log('error', e)
}




// Finally, connect to the Stream Deck.
streamDeck.connect();
