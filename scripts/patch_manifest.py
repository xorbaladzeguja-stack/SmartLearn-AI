from pathlib import Path
import sys

manifest = Path("android/app/src/main/AndroidManifest.xml")
if not manifest.exists():
    print("AndroidManifest.xml not found")
    sys.exit(1)

content = manifest.read_text(encoding="utf-8")
permission = '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />'

if permission not in content:
    pos = content.find(">")
    if pos < 0:
        sys.exit("Invalid AndroidManifest.xml")
    content = content[:pos + 1] + "\n    " + permission + content[pos + 1:]
    manifest.write_text(content, encoding="utf-8")

print("Notification permission ready")
