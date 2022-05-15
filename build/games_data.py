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

    def dump_json(self, output_file):
        with open(output_file, "wt+", encoding="utf-8") as f:
            f.write(json.dumps(self._games))

    def dump_search_index(self, output_file):
        c = 0
        with open(output_file, "wt+", encoding="utf-8") as f:
            f.write("const UNPROCESSED_INDEX=")
            f.write(
                json.dumps([self.flatten(game, c := c + 1) for game in self._games])
            )
            f.write(";")

    @staticmethod
    def flatten(game, uid):
        return {
            "id": str(uid),
            "title": game["title"],
            "desc": game["description"],
        }
