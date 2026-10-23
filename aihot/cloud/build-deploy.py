"""Build a separate Vercel upload folder; the MEEKA portal root is untouched."""
from pathlib import Path
import tarfile, shutil, hashlib, json

cloud = Path(__file__).resolve().parent
root = cloud.parent
out = cloud / "dist"
backend = out / "backend"
backend.mkdir(parents=True, exist_ok=True)
files = []
for item in root.rglob("*"):
    rel = item.relative_to(root)
    if not item.is_file() or any(part in {".git", "node_modules", ".data", "cloud", "tests"} for part in rel.parts):
        continue
    if item.name.startswith(".env") or item.name.endswith(".test.ts"):
        continue
    if rel.parts[:2] == ("apps", "web") and rel.as_posix() != "apps/web/package.json":
        continue
    files.append(item)
with tarfile.open(backend / "source.tar.gz", "w:gz") as archive:
    for item in sorted(files):
        archive.add(item, arcname=item.relative_to(root), recursive=False)
shutil.copyfile(cloud / "Dockerfile.vercel", backend / "Dockerfile.vercel")
shutil.copyfile(cloud / "supabase-ca.crt", backend / "supabase-ca.crt")
shutil.copyfile(cloud / "vercel.json", out / "vercel.json")
manifest = {"sourceFiles": len(files), "archiveSha256": hashlib.sha256((backend / "source.tar.gz").read_bytes()).hexdigest()}
(out / "source-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
print(out)
