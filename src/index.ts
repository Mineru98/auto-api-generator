import fs from "fs";
import YAML from "yaml";
import path from "path";
import process from "process";
import { ArgumentParser } from "argparse";

import { getDeepKeys } from "./utils";

function generateExpress({ config, route, model }: any) {
    const { port, name, version } = config;
    const modeList: string[] = getDeepKeys(model);

    const routes: string[] = [];
    const rootRoutes = Object.keys(route).filter((item) => item !== "prefix");

    for (let i = 0; i < rootRoutes.length; i++) {
        const prefix = rootRoutes[i];
        const subRoutes = Object.keys(route[rootRoutes[i]]);
        for (let j = 0; j < subRoutes.length; j++) {
            routes.push(prefix + "/" + subRoutes[j]);
        }
    }

    const routesData: any = {};
    for (let i = 0; i < rootRoutes.length; i++) {
        routesData[rootRoutes[i]] = `const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const express = require("express");
const router = express.Router();

`;
        routes.map((_route: string) => {
            const test = _route.split("/")[_route.split("/").length - 1];
            if (_route.startsWith(rootRoutes[i]) && !_route.endsWith("/index")) {
                routesData[rootRoutes[i] as string] += `const ${test}Router = require("./${test}");\n`;
            }
            routesData[_route as string] = `const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const express = require("express");
const router = express.Router({ mergeParams: true });

`;
        });

        routesData[rootRoutes[i] as string] += "\n";

        routes.map((_route: string) => {
            const test = _route.split("/")[_route.split("/").length - 1];
            if (_route.startsWith(rootRoutes[i])) {
                if (!_route.endsWith("/index")) {
                    if (Object.keys(route[rootRoutes[i]][test]).includes("prefix")) {
                        routesData[rootRoutes[i] as string] += `router.use("${route[rootRoutes[i]][test]["prefix"]}/${test}", ${test}Router);\n`;
                    } else {
                        routesData[rootRoutes[i] as string] += `router.use("/${test}", ${test}Router);\n`;
                    }
                }
            }
        });

        routesData[rootRoutes[i] as string] += "\n";

        routes.map((_route: string) => {
            const test = _route.split("/")[_route.split("/").length - 1];
            if (_route.startsWith(rootRoutes[i])) {
                if (_route.endsWith("/index")) {
                    const subRoutes = Object.keys(route[rootRoutes[i]][test]);
                    subRoutes.map((subRoute) => {
                        if (subRoute === "/") {
                            if (Object.keys(route[rootRoutes[i]][test][subRoute]).includes("GET")) {
                                routesData[rootRoutes[i] as string] += `router.get("${subRoute}", (req, res) => {\n`;
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["GET"]).includes("params")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${route[rootRoutes[i]][test][subRoute]["GET"]["params"].join(
                                        ", "
                                    )} } = req.params\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["GET"]).includes("query")) {
                                    routesData[rootRoutes[i] as string] += `\tconst {`;
                                    Object.keys(route[rootRoutes[i]][test][subRoute]["GET"]["query"]).map((key) => {
                                        if (typeof route[rootRoutes[i]][test][subRoute]["GET"]["query"][key] === "object") {
                                            if (route[rootRoutes[i]][test][subRoute]["GET"]["query"][key]["type"] === "number") {
                                                routesData[rootRoutes[i] as string] += `${key} = ${
                                                    route[rootRoutes[i]][test][subRoute]["GET"]["query"][key]["default"]
                                                }, `;
                                            } else {
                                                routesData[rootRoutes[i] as string] += `${key} = '${
                                                    route[rootRoutes[i]][test][subRoute]["GET"]["query"][key]["default"]
                                                }', `;
                                            }
                                        } else {
                                            routesData[rootRoutes[i] as string] += `${key}, `;
                                        }
                                    });
                                    routesData[rootRoutes[i] as string] += `} = req.query\n`;
                                }
                                routesData[rootRoutes[i] as string] += `});\n\n`;
                            } else if (Object.keys(route[rootRoutes[i]][test][subRoute]).includes("POST")) {
                                routesData[rootRoutes[i] as string] += `router.post("${subRoute}", (req, res) => {\n`;
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]).includes("params")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${route[rootRoutes[i]][test][subRoute]["POST"]["params"].join(
                                        ", "
                                    )} } = req.params\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]).includes("query")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]["query"]).join(
                                        ", "
                                    )} } = req.query\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]).includes("body")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]["body"]).join(
                                        ", "
                                    )} } = req.body\n`;
                                }
                                routesData[rootRoutes[i] as string] += `});\n\n`;
                            }
                        } else {
                            if (Object.keys(route[rootRoutes[i]][test][subRoute]).includes("GET")) {
                                routesData[rootRoutes[i] as string] += `router.get("${subRoute}", (req, res) => {\n`;
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["GET"]).includes("params")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${route[rootRoutes[i]][test][subRoute]["GET"]["params"].join(
                                        ", "
                                    )} } = req.params\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["GET"]).includes("query")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["GET"]["query"]).join(
                                        ", "
                                    )} } = req.query\n`;
                                }
                                routesData[rootRoutes[i] as string] += `});\n\n`;
                            } else if (Object.keys(route[rootRoutes[i]][test][subRoute]).includes("POST")) {
                                routesData[rootRoutes[i] as string] += `router.post("${subRoute}", (req, res) => {\n`;
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]).includes("params")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${route[rootRoutes[i]][test][subRoute]["POST"]["params"].join(
                                        ", "
                                    )} } = req.params\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]).includes("query")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]["query"]).join(
                                        ", "
                                    )} } = req.query\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]).includes("body")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]["body"]).join(
                                        ", "
                                    )} } = req.body\n`;
                                }
                                routesData[rootRoutes[i] as string] += `});\n\n`;
                            } else if (Object.keys(route[rootRoutes[i]][test][subRoute]).includes("PATCH")) {
                                routesData[rootRoutes[i] as string] += `router.patch("${subRoute}", (req, res) => {\n`;
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["PATCH"]).includes("params")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${route[rootRoutes[i]][test][subRoute]["PATCH"]["params"].join(
                                        ", "
                                    )} } = req.params\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["PATCH"]).includes("query")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${Object.keys(
                                        route[rootRoutes[i]][test][subRoute]["PATCH"]["query"]
                                    ).join(", ")} } = req.query\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["PATCH"]).includes("body")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["PATCH"]["body"]).join(
                                        ", "
                                    )} } = req.body\n`;
                                }
                                routesData[rootRoutes[i] as string] += `});\n\n`;
                            } else if (Object.keys(route[rootRoutes[i]][test][subRoute]).includes("PUT")) {
                                routesData[rootRoutes[i] as string] += `router.put("${subRoute}", (req, res) => {\n`;
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["PUT"]).includes("params")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${route[rootRoutes[i]][test][subRoute]["PUT"]["params"].join(
                                        ", "
                                    )} } = req.params\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["PUT"]).includes("query")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["PUT"]["query"]).join(
                                        ", "
                                    )} } = req.query\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["PUT"]).includes("body")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["PUT"]["body"]).join(
                                        ", "
                                    )} } = req.body\n`;
                                }
                                routesData[rootRoutes[i] as string] += `});\n\n`;
                            } else if (Object.keys(route[rootRoutes[i]][test][subRoute]).includes("DELETE")) {
                                routesData[rootRoutes[i] as string] += `router.delete("${subRoute}", (req, res) => {\n`;
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["DELETE"]).includes("params")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${route[rootRoutes[i]][test][subRoute]["DELETE"]["params"].join(
                                        ", "
                                    )} } = req.params\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["DELETE"]).includes("query")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${Object.keys(
                                        route[rootRoutes[i]][test][subRoute]["DELETE"]["query"]
                                    ).join(", ")} } = req.query\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["DELETE"]).includes("body")) {
                                    routesData[rootRoutes[i] as string] += `\tconst { ${Object.keys(
                                        route[rootRoutes[i]][test][subRoute]["DELETE"]["body"]
                                    ).join(", ")} } = req.body\n`;
                                }
                                routesData[rootRoutes[i] as string] += `});\n\n`;
                            }
                        }
                    });
                } else {
                    const subRoutes = Object.keys(route[rootRoutes[i]][test]);
                    subRoutes.map((subRoute) => {
                        if (subRoute === "/") {
                            if (Object.keys(route[rootRoutes[i]][test][subRoute]).includes("GET")) {
                                routesData[_route] += `router.get("${subRoute}", (req, res) => {\n`;
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["GET"]).includes("params")) {
                                    routesData[_route] += `\tconst { ${route[rootRoutes[i]][test][subRoute]["GET"]["params"].join(", ")} } = req.params\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["GET"]).includes("query")) {
                                    routesData[_route] += `\tconst {`;
                                    Object.keys(route[rootRoutes[i]][test][subRoute]["GET"]["query"]).map((key) => {
                                        if (typeof route[rootRoutes[i]][test][subRoute]["GET"]["query"][key] === "object") {
                                            if (route[rootRoutes[i]][test][subRoute]["GET"]["query"][key]["type"] === "number") {
                                                routesData[_route] += `${key} = ${route[rootRoutes[i]][test][subRoute]["GET"]["query"][key]["default"]}, `;
                                            } else {
                                                routesData[_route] += `${key} = '${route[rootRoutes[i]][test][subRoute]["GET"]["query"][key]["default"]}', `;
                                            }
                                        } else {
                                            routesData[_route] += `${key}, `;
                                        }
                                    });
                                    routesData[_route] += `} = req.query\n`;
                                }
                                routesData[_route] += `});\n\n`;
                            } else if (Object.keys(route[rootRoutes[i]][test][subRoute]).includes("POST")) {
                                routesData[_route] += `router.post("${subRoute}", (req, res) => {\n`;
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]).includes("params")) {
                                    routesData[_route] += `\tconst { ${route[rootRoutes[i]][test][subRoute]["POST"]["params"].join(", ")} } = req.params\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]).includes("query")) {
                                    routesData[_route] += `\tconst {`;
                                    Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]["query"]).map((key) => {
                                        if (typeof route[rootRoutes[i]][test][subRoute]["POST"]["query"][key] === "object") {
                                            if (route[rootRoutes[i]][test][subRoute]["POST"]["query"][key]["type"] === "number") {
                                                routesData[_route] += `${key} = ${route[rootRoutes[i]][test][subRoute]["POST"]["query"][key]["default"]}, `;
                                            } else {
                                                routesData[_route] += `${key} = '${route[rootRoutes[i]][test][subRoute]["POST"]["query"][key]["default"]}', `;
                                            }
                                        } else {
                                            routesData[_route] += `${key}, `;
                                        }
                                    });
                                    routesData[_route] += `} = req.query\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]).includes("body")) {
                                    routesData[_route] += `\tconst { ${route[rootRoutes[i]][test][subRoute]["POST"]["body"].join(", ")} } = req.body\n`;
                                }
                                routesData[_route] += `});\n\n`;
                            }
                        } else if (subRoute !== "prefix") {
                            if (Object.keys(route[rootRoutes[i]][test][subRoute]).includes("GET")) {
                                routesData[_route] += `router.get("${subRoute}", (req, res) => {\n`;
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["GET"]).includes("params")) {
                                    routesData[_route] += `\tconst { ${route[rootRoutes[i]][test][subRoute]["GET"]["params"].join(", ")} } = req.params\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["GET"]).includes("query")) {
                                    routesData[_route] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["GET"]["query"]).join(
                                        ", "
                                    )} } = req.query\n`;
                                }
                                routesData[_route] += `});\n\n`;
                            } else if (Object.keys(route[rootRoutes[i]][test][subRoute]).includes("POST")) {
                                routesData[_route] += `router.post("${subRoute}", (req, res) => {\n`;
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]).includes("params")) {
                                    routesData[_route] += `\tconst { ${route[rootRoutes[i]][test][subRoute]["POST"]["params"].join(", ")} } = req.params\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]).includes("query")) {
                                    routesData[_route] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]["query"]).join(
                                        ", "
                                    )} } = req.query\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]).includes("body")) {
                                    routesData[_route] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["POST"]["body"]).join(
                                        ", "
                                    )} } = req.body\n`;
                                }
                                routesData[_route] += `});\n\n`;
                            } else if (Object.keys(route[rootRoutes[i]][test][subRoute]).includes("PATCH")) {
                                routesData[_route] += `router.patch("${subRoute}", (req, res) => {\n`;
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["PATCH"]).includes("params")) {
                                    routesData[_route] += `\tconst { ${route[rootRoutes[i]][test][subRoute]["PATCH"]["params"].join(", ")} } = req.params\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["PATCH"]).includes("query")) {
                                    routesData[_route] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["PATCH"]["query"]).join(
                                        ", "
                                    )} } = req.query\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["PATCH"]).includes("body")) {
                                    routesData[_route] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["PATCH"]["body"]).join(
                                        ", "
                                    )} } = req.body\n`;
                                }
                                routesData[_route] += `});\n\n`;
                            } else if (Object.keys(route[rootRoutes[i]][test][subRoute]).includes("PUT")) {
                                routesData[_route] += `router.put("${subRoute}", (req, res) => {\n`;
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["PUT"]).includes("params")) {
                                    routesData[_route] += `\tconst { ${route[rootRoutes[i]][test][subRoute]["PUT"]["params"].join(", ")} } = req.params\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["PUT"]).includes("query")) {
                                    routesData[_route] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["PUT"]["query"]).join(
                                        ", "
                                    )} } = req.query\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["PUT"]).includes("body")) {
                                    routesData[_route] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["PUT"]["body"]).join(
                                        ", "
                                    )} } = req.body\n`;
                                }
                                routesData[_route] += `});\n\n`;
                            } else if (Object.keys(route[rootRoutes[i]][test][subRoute]).includes("DELETE")) {
                                routesData[_route] += `router.delete("${subRoute}", (req, res) => {\n`;
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["DELETE"]).includes("params")) {
                                    routesData[_route] += `\tconst { ${route[rootRoutes[i]][test][subRoute]["DELETE"]["params"].join(", ")} } = req.params\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["DELETE"]).includes("query")) {
                                    routesData[_route] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["DELETE"]["query"]).join(
                                        ", "
                                    )} } = req.query\n`;
                                }
                                if (Object.keys(route[rootRoutes[i]][test][subRoute]["DELETE"]).includes("body")) {
                                    routesData[_route] += `\tconst { ${Object.keys(route[rootRoutes[i]][test][subRoute]["DELETE"]["body"]).join(
                                        ", "
                                    )} } = req.body\n`;
                                }
                                routesData[_route] += `});\n\n`;
                            }
                        }
                    });
                    routesData[_route] += "module.exports = router;";
                }
            }
        });
        routesData[rootRoutes[i] as string] += "module.exports = router;";
    }

    const rootRouteRequire = rootRoutes.map((item) => `const ${item}Router = require("./route/${item}");`);
    const rootRoutePath = rootRoutes.map((item) => `app.use("${route["prefix"]}/${item}", ${item}Router);`);

    const packageData = `{
    "name": "${name}",
    "version": "${version}",
    "scripts": {},
    "dependencies": {
        "cookie-parser": "1.4.6",
        "express": "4.17.3",
        "express-asyncify": "1.0.1"
    },
    "devDependencies": {}
}`;

    const indexData = `const express = require("express");
const asyncify = require("express-asyncify");
const cookieParser = require("cookie-parser");

${rootRouteRequire.join("\n")}

const app = asyncify(express());

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

${rootRoutePath.join("\n")}

app.listen(${port});
    `;

    !fs.existsSync(path.join(process.cwd(), `dist`)) && fs.mkdirSync(path.join(process.cwd(), `dist`));
    !fs.existsSync(path.join(process.cwd(), `dist/route`)) && fs.mkdirSync(path.join(process.cwd(), `dist/route`));
    for (let i = 0; i < rootRoutes.length; i++) {
        !fs.existsSync(path.join(process.cwd(), `dist/route/${rootRoutes[i]}`)) && fs.mkdirSync(path.join(process.cwd(), `dist/route/${rootRoutes[i]}`));
    }
    for (let i = 0; i < routes.filter((item) => item !== "index").length; i++) {
        !fs.existsSync(path.join(process.cwd(), `dist/route/${routes.filter((item) => item !== "index")[i]}`)) &&
            fs.mkdirSync(path.join(process.cwd(), `dist/route/${routes.filter((item) => item !== "index")[i]}`));
    }

    fs.writeFile(path.join(process.cwd(), `dist/package.json`), packageData, "utf8", () => {});
    fs.writeFile(path.join(process.cwd(), `dist/index.js`), indexData, "utf8", () => {});
    for (let i = 0; i < rootRoutes.length; i++) {
        fs.writeFile(path.join(process.cwd(), `dist/route/${rootRoutes[i]}/index.js`), routesData[rootRoutes[i]], "utf8", () => {});
    }
    for (let i = 0; i < routes.filter((item) => item !== "index").length; i++) {
        fs.writeFile(
            path.join(process.cwd(), `dist/route/${routes.filter((item) => item !== "index")[i]}/index.js`),
            routesData[routes.filter((item) => item !== "index")[i]],
            "utf8",
            () => {}
        );
    }
}

const parser = new ArgumentParser({
    description: "API Generator",
    add_help: true,
});

parser.add_argument("-v", "--version", { action: "version", version: "0.0.1" });
parser.add_argument("-f", "--file", { help: "import yaml file" });

const { file } = parser.parse_args();

if (file !== undefined) {
    const fileUrl = path.join(process.cwd(), file);
    fs.readFile(fileUrl, "utf-8", (err, data) => {
        if (err) {
            if (err.code == "ENOENT") {
                console.log("Error: ENOENT: no such file or directory, open " + err.path);
            } else {
                console.error(err);
            }
        } else {
            const obj = YAML.parse(data as any);
            generateExpress(obj);
        }
    });
} else {
    console.log("Error: file flag is empty.(-f, --file)");
}
