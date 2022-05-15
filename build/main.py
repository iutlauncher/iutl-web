from jinja2 import Environment, FileSystemLoader

import cssmin, jsmin

import os, shutil
from pathlib import Path

from games_data import GamesData


class Builder:
    def __init__(self, source, destination, stylesheets, images, scripts, games):
        self._env = Environment(loader=FileSystemLoader(source))
        self._srcdir = Path(source)
        self._destdir = Path(destination)
        self._cssdir = Path(stylesheets)
        self._imgdir = Path(images)
        self._jsdir = Path(scripts)
        self._gamesdir = Path(games)

    def build(self):
        self.cleanup()

        self.copy_stylesheets()
        self.copy_scipts()
        self.copy_images()

        entries = GamesData(self._gamesdir)
        entries.load()
        entries.dump_json(self._destdir / "api.json")
        entries.dump_search_index(self._destdir / "static" / "search_index.js")

        self.render(
            "index.j2",
            "index.html",
            title="Accueil",
        )

    def cleanup(self):
        if self._destdir.is_dir():
            shutil.rmtree(self._destdir)
        os.mkdir(self._destdir)
        os.mkdir(self._destdir / "static")

    def copy_stylesheets(self):
        for file in self._cssdir.glob("*.css"):
            with open(file, "rt", encoding="utf-8") as f:
                content = f.read()

            with open(
                self._destdir / "static" / (file.stem + ".min.css"),
                "wt+",
                encoding="utf-8",
            ) as f:
                f.write(cssmin.cssmin(content))

    def copy_images(self):
        for file in os.listdir(self._imgdir):
            with open(self._imgdir / file, "rb") as f:
                content = f.read()

            with open(self._destdir / "static" / file, "wb+") as f:
                f.write(content)

    def copy_scipts(self):
        for file in self._jsdir.glob("*.js"):
            with open(file, "rt", encoding="utf-8") as f:
                content = f.read()

            with open(
                self._destdir / "static" / (file.stem + ".min.js"),
                "wt+",
                encoding="utf-8",
            ) as f:
                f.write(jsmin.jsmin(content))

    def render(self, source, destination, **kwargs):
        template = self._env.get_template(str(source))
        relroot = "../" * (len(Path(destination).parts) - 1)
        with open(self._destdir / destination, "wt+", encoding="utf8") as f:
            f.write(template.render(ROOT=relroot, **kwargs))


if __name__ == "__main__":
    Builder(
        source="templates/",
        destination="site/",
        games="entries/",
        stylesheets="style/",
        scripts="scripts/",
        images="images/",
    ).build()
