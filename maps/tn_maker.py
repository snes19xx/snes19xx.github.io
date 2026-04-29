import os
from pathlib import Path
from PIL import Image

def generate_webp_thumbnails(root_directory: str):
    root_path = Path(root_directory)
    
    for webp_path in root_path.rglob("*.webp"):
        

        if webp_path.name.endswith("_thumbnail.webp") or "thumbnails" in webp_path.parts:
            continue
            
        try:
            with Image.open(webp_path) as img:
                new_width = max(1, int(img.width * 0.30))
                new_height = max(1, int(img.height * 0.30))
                
                resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                target_dir = webp_path.parent / "thumbnails"
                target_dir.mkdir(parents=True, exist_ok=True)
                
                target_filename = f"{webp_path.stem}_thumbnail.webp"
                target_path = target_dir / target_filename
                
                resized_img.save(target_path, format="WEBP")
                print(f"Success: Created {target_path}")
                
        except Exception as e:
            print(f"Failed to process {webp_path}. Error: {e}")

if __name__ == "__main__":
    target_directory = os.getcwd()
    print(f"Scanning for .webp files in: {target_directory}")
    generate_webp_thumbnails(target_directory)
    print("Processing complete.")