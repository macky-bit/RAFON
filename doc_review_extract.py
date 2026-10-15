from pathlib import Path
import sys
import xml.etree.ElementTree as ET
import zipfile

source = Path(sys.argv[1])
target = Path(sys.argv[2])
ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
with zipfile.ZipFile(source) as archive:
    root = ET.fromstring(archive.read("word/document.xml"))

lines = []
for index, paragraph in enumerate(root.findall(".//w:p", ns), 1):
    text = "".join(node.text or "" for node in paragraph.findall(".//w:t", ns)).strip()
    if not text:
        continue
    style = paragraph.find("./w:pPr/w:pStyle", ns)
    label = style.get(f"{{{ns['w']}}}val") if style is not None else "body"
    lines.append(f"{index:04d} [{label}] {text}")

target.write_text("\n".join(lines), encoding="utf-8")
print(f"Extracted {len(lines)} non-empty paragraphs to {target}")
