"""
Beatout 2025
Tom Cuypers
A specific implementation of a streamdeck input as sensor
"""
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal
import logging

from PIL import Image
from StreamDeck.DeviceManager import DeviceManager
from StreamDeck.Devices import StreamDeck
from StreamDeck.ImageHelpers import PILHelper

@dataclass
class ImageSet:
    normal: bytes
    selected: bytes
    error: bytes


class Sensor:           # To replace with real Sensor
    def __init__(self, config: dict[str, Any]) -> None:
        self.id: str | None = config.get('id')
        self.config: dict[str, Any] = config.get('data', {})

class StreamDeckSensor(Sensor):
    def __init__(self, config: dict[str, Any]) -> None:
        super().__init__(config=config)
        self._streamdeck_manager = DeviceManager()
        self.images: list[ImageSet] = []
        self._current_code: list[int] = []

    def load_images(self, deck: StreamDeck) -> None:
        images_path = self.config.get('images')
        self.images = []

        for key_index, image_path in enumerate(sorted(Path(images_path).glob("*"))):
            logging.info("Loading image %s onto streamdeck", image_path.name)
            image = Image.open(image_path)

            normal_image = PILHelper.create_scaled_image(deck, image, margins=[0, 0, 0, 0])
            normal_icon = PILHelper.to_native_format(deck, normal_image)

            # Selected image → groene overlay
            selected_image = image.copy()
            overlay = Image.new("RGBA", selected_image.size, (0, 255, 0, 100))  # groen, semi-transparant
            selected_image.paste(overlay, (0, 0), overlay)
            selected_scaled = PILHelper.create_scaled_image(deck, selected_image, margins=[0, 0, 0, 0])
            selected_icon = PILHelper.to_native_format(deck, selected_scaled)

            # Error image → rode overlay
            error_image = image.copy()
            overlay = Image.new("RGBA", error_image.size, (255, 0, 0, 100))  # rood, semi-transparant
            error_image.paste(overlay, (0, 0), overlay)
            error_scaled = PILHelper.create_scaled_image(deck, error_image, margins=[0, 0, 0, 0])
            error_icon = PILHelper.to_native_format(deck, error_scaled)

            self.images.append(ImageSet(
                normal=normal_icon,
                selected=selected_icon,
                error=error_icon
            ))

    def set_normal_images(self, deck: StreamDeck) -> None:
       for key_index in range(deck.key_count()):
           deck.set_key_image(key_index, self.images[key_index].normal)

    def set_selected_image(self, deck: StreamDeck, key_index: int) -> None:
        deck.set_key_image(key_index, self.images[key_index].selected)

    def set_error_image(self, deck: StreamDeck, key_index: int) -> None:
        deck.set_key_image(key_index, self.images[key_index].error)

    def setup(self) -> bool:
        decks = self._streamdeck_manager.enumerate()
        if not decks:
            logging.error("No StreamDeck devices found")
            return False
        deck = decks[0]
        deck.open()
        deck.reset()
        logging.info("Connection with streamdeck established")
        brightness = self.config.get('brightness', 50)
        deck.set_brightness(brightness)
        logging.info("Streamdeck brightness set to %d", brightness)
        self.load_images(deck)
        self.set_normal_images(deck)
        deck.set_key_callback(self.key_change_cb)

    def blink(self, deck: StreamDeck, success: bool) -> None:
        for _ in range(5):
            for key_index in range(deck.key_count()):
                if success:
                    self.set_selected_image(deck, key_index)
                else:
                    self.set_error_image(deck, key_index)
            time.sleep(0.2)
            self.set_normal_images(deck)
            time.sleep(0.2)

    def check_code(self, deck: StreamDeck) -> None:
        if self._current_code == [0, 1, 2, 3]:
            logging.info("Correct code entered!")
            self.blink(deck, success=True)
        elif len(self._current_code) == 4:
            self.blink(deck, success=False)

        if len(self._current_code) == 4:
            for key_index in range(deck.key_count()):
                self.set_normal_images(deck)
            self._current_code = []

    def key_change_cb(self, deck: StreamDeck, key: int, state: bool):
        print(f"Key {key} {'pressed' if state else 'released'}")
        if state and key not in self._current_code:
            self.set_selected_image(deck, key)
            self._current_code.append(key)
            self.check_code(deck)

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    path = Path(__file__).parent / "stargate"
    sensor = StreamDeckSensor(config={
        'id': 'streamdeck',
        'data': {
            'brightness': 100,
            'images': str(path),
        }
    })
    sensor.setup()
    while True:
        time.sleep(1)
