import { extname } from "path";
import { FileNotFoundError, InvalidFileError } from "../../utils/errors.js";
import { existsSync } from "fs";
import YAML from "yaml";
import { readFile } from "fs/promises";

const loadJsonFile = async (filePath: string) => {
  const content = await readFile(filePath, "utf-8");
  return JSON.parse(content);
}

const loadYamlFile = async (filePath: string) => {
  const content = await readFile(filePath, "utf-8");
  return YAML.parse(content);
}

const loadJsFile = async (filePath: string) => {
  const { default: content } = await import(filePath);
  return content;
}


const loadInputFiles = async (filePaths: string[]) => {
  let inputs: Record<string, unknown> = {};
  for (const filePath of filePaths) {
    const type = extname(filePath);
    if (!existsSync(filePath)) {
      throw new FileNotFoundError(filePath);
    }
    try {
      switch (type) {
        case ".json":
          inputs = {
            ...inputs,
            ...(await loadJsonFile(filePath)),
          };
          break;
        case ".yaml":
        case ".yml":
          inputs = {
            ...inputs,
            ...(await loadYamlFile(filePath)),
          };
          break;
        case ".js":
          inputs = {
            ...inputs,
            ...(await loadJsFile(filePath)),
          };
          break;
        default:
          throw new InvalidFileError(filePath);
      }
    } catch (error) {
      throw new InvalidFileError(filePath);
    }
  }
}

export { loadInputFiles };
