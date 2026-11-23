from pathlib import Path
import re
import sys

manifest = Path("android/app/src/main/AndroidManifest.xml")

if not manifest.exists():
    sys.exit("AndroidManifest.xml not found")

content = manifest.read_text(encoding="utf-8")

permission = '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />'

content = re.sub(
    r'\s*<uses-permission\s+android:name="android.permission.POST_NOTIFICATIONS"\s*/>',
    '',
    content
)

match = re.search(r'<manifest\b[^>]*>', content)

if not match:
    sys.exit("Manifest opening tag not found")

content = (
    content[:match.end()]
    + "\n    " + permission
    + content[match.end():]
)

manifest.write_text(content, encoding="utf-8")
print("Manifest fixed successfully")
