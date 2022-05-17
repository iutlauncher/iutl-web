import os, yaml, json


class GamesData:
    def __init__(self, directory):
        self._dir = directory
        self._games = list()

    @property
    def games(self):
        return self._games

    def load(self):
        for file in os.listdir(self._dir):
            with open(self._dir / file, "rt", encoding="utf-8") as f:
                game = yaml.full_load(f.read())
                self._games.append(game)

    def dump_json(self, output_dir):
        with open(output_dir / "index.json", "wt+", encoding="utf-8") as f:
            f.write(json.dumps([self.flatten(game) for game in self._games]))
        for game in self._games:
            with open(
                output_dir / (game["uuid"] + ".json"), "wt+", encoding="utf-8"
            ) as f:
                f.write(json.dumps(game))

    @staticmethod
    def flatten(game):
        return {
            "uuid": game["uuid"],
            "title": game["title"],
            "description": game["description"],
        }
