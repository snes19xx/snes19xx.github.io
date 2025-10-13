import argparse
import os
import sys
from dataclasses import dataclass, field
from pathlib import Path
from signal import SIGINT, Signals, signal
from types import FrameType
from typing import Any, Literal, List, Tuple

from pick import pick
from PIL import Image
from rich import console, panel

Palette = Literal["green", "white", "mix"]
ImagePath = str
Images = List[ImagePath]


@dataclass
class Arguments:
    palette: Palette | None
    images: List[ImagePath] = field(default_factory=list)


class Parser(argparse.ArgumentParser):
    def __init__(self) -> None:
        super().__init__(
            description="A simple cli to manufacture Everforest themed wallpapers.",
            prefix_chars="-",
            argument_default=None,
            conflict_handler="error",
        )

        self.add_argument(
            "-p",
            "--palette",
            choices=["white", "green", "mix"],
            nargs="?",
            default="green",
            const="green",
            help="choose your palette, forest 'green' (default), snow 'white' or smooth 'mix'",
        )
        self.add_argument(
            "-i", "--images", nargs="+", type=str, help="path(s) to the image(s)."
        )

        self._parsed_args: argparse.Namespace
        self.arguments: Arguments

    def parse(self) -> None:
        self._parsed_args = self.parse_args()
        self.arguments = Arguments(
            palette=self._parsed_args.palette, images=self._parsed_args.images or []
        )


def is_palette(value: str | None) -> bool:
    return value in {"green", "white", "mix"}


def signal_handler(signum: int, _frame: FrameType | None = None) -> None:
    if signum == Signals.SIGINT:
        sys.exit(2)


class Console(console.Console):
    def __init__(self) -> None:
        super().__init__()

    def print_title(self) -> None:
        self.print(
            panel.Panel(
                "🏭 [bold green] Everforest Factory [/] 🏭",
                expand=False,
                border_style="green",
            )
        )


def select_palette() -> Palette:
    prompt: str = "🎨 [bold green]Palette (forest 'green', snow 'white' or smooth 'mix'):[/] "
    options: List[str] = ["green", "white", "mix"]

    value = pick(options, title=prompt, clear_screen=False)
    _, selection = value

    return selection if is_palette(selection) else "green"


class EverforestConverter:
    def __init__(self):
        # Everforest color palettes - more comprehensive
        self.palettes = {
            "green": [
                # Dark Everforest greens
                "#2B3339", "#3C4841", "#495157", "#5C6A32",
                "#627A3C", "#687E52", "#6E8452", "#7C945D",
                "#8CA468", "#A6B48C", "#B5C191", "#C5D1C1"
            ],
            "white": [
                # Light Everforest tones
                "#D3C6AA", "#DFD3B8", "#E1D8C0", "#E8DFC8",
                "#EDE4CF", "#F0E9D7", "#F5F0E1", "#FDF6E3",
                "#A6B0A0", "#B5C1AB", "#C5D1C1", "#DFE2D5"
            ],
            "mix": [
                # Balanced mix of greens and lights
                "#2B3339", "#5C6A32", "#7C945D", "#8CA468",
                "#D3C6AA", "#E1D8C0", "#F0E9D7", "#A6B48C",
                "#C5D1C1", "#495157", "#687E52", "#F5F0E1"
            ]
        }
    
    def hex_to_rgb(self, hex_color: str) -> Tuple[int, int, int]:
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    def find_closest_color(self, pixel: Tuple[int, int, int], palette: List[str]) -> Tuple[int, int, int]:
        target_r, target_g, target_b = pixel
        closest_color = None
        min_distance = float('inf')
        
        for hex_color in palette:
            r, g, b = self.hex_to_rgb(hex_color)
            distance = ((r - target_r) ** 2 + (g - target_g) ** 2 + (b - target_b) ** 2)
            if distance < min_distance:
                min_distance = distance
                closest_color = (r, g, b)
        
        return closest_color
    
    def convert_image(self, image_path: str, palette_name: str, output_path: str) -> bool:
        try:
            img = Image.open(image_path)
            img = img.convert('RGB')
            
            palette = self.palettes[palette_name]
            pixels = img.load()
            
            width, height = img.size
            for x in range(width):
                for y in range(height):
                    pixels[x, y] = self.find_closest_color(pixels[x, y], palette)
            
            img.save(output_path)
            return True
        except Exception as e:
            print(f"Error processing {image_path}: {e}")
            return False


class EverforestFactory:
    def __init__(self) -> None:
        _ = signal(SIGINT, signal_handler)
        self.console: Console = Console()
        self.parser: Parser = Parser()
        self.converter: EverforestConverter = EverforestConverter()

    def get_palette(self) -> Palette:
        palette: Palette | None = self.parser.arguments.palette
        palette = palette if palette is not None else select_palette()
        if is_palette(palette):
            return palette
        raise Exception("This is unreachable.")

    def select_paths(self) -> List[str]:
        prompt: str = "🖼️ [bold green]Image paths (separated by spaces):[/] "
        user_input = self.console.input(prompt)
        paths: List[str] = []
        for raw_path in user_input.split():
            path = Path(os.path.expanduser(raw_path))
            if "*" in raw_path:
                paths.extend(
                    [str(p) for p in path.parent.glob(path.name) if p.is_file()]
                )
            elif path.exists() and path.is_file():
                paths.append(str(path))
            else:
                self.console.print(f"❌ [red]Skipping {raw_path} (not a valid file)[/]")
        return paths

    def write_image_color(self, path: str, palette: str) -> None:
        parent = os.path.dirname(path)
        base = os.path.basename(path)
        dest = os.path.join(parent, f"everforest_{base}")

        self.console.print(f"🔨 [green]manufacturing '{base}' -> {dest}[/]")
        success = self.converter.convert_image(path, palette, dest)
        if success:
            self.console.print(f"✅ [bold green]Done![/] [green](saved to '{dest}')[/]")
        else:
            self.console.print(f"❌ [red]Failed to process '{base}'[/]")

    def process_images(self, images: Images, palette: str) -> bool:
        failed = 0
        passed = 0
        for path in images:
            if os.path.exists(path) and os.path.isfile(path):
                self.write_image_color(path, palette)
                passed += 1
            else:
                self.console.print(f"❌ [red]Skipping {path} (file not found) [/]")
                failed += 1

        if passed > 0 and failed == 0:
            self.console.print("🎉 [bold green]All images processed successfully![/]")
            return True
        elif failed and passed:
            self.console.print("🎉 [bold orange]Some images processed successfully![/]")
            return True
        else:
            self.console.print("🎉 [bold red]Couldn't process any images[/]")
            return False


def main() -> None:
    factory = EverforestFactory()
    
    try:
        factory.parser.parse()
    except SystemExit:
        return

    image_paths = factory.parser.arguments.images

    if not image_paths:
        factory.console.print_title()
        image_paths = factory.select_paths()
        if not image_paths:
            factory.console.print("❌ [red]No images provided[/]")
            sys.exit(1)

    palette = factory.get_palette()

    if factory.process_images(image_paths, palette) is not True:
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()