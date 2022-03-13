import path from "path";
import process from "process";
import { ArgumentParser } from "argparse";
import { version } from "../package.json";

// console.clear();
const parser = new ArgumentParser({
    description: "Argparse example",
    add_help: true,
});

parser.add_argument("-v", "--version", { action: "version", version });
parser.add_argument("-f", "--file", { help: "import yaml file" });

const { file } = parser.parse_args();

console.dir(path.join(process.cwd(), file));
