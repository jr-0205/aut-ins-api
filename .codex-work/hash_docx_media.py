from __future__ import annotations

import hashlib
import sys
import zipfile
from pathlib import Path


for value in sys.argv[1:]:
    source = Path(value)
    print(source)
    with zipfile.ZipFile(source) as archive:
        for name in archive.namelist():
            if name.startswith("word/media/"):
                print(name, hashlib.sha256(archive.read(name)).hexdigest())
