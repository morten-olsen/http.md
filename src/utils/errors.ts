class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

class FileNotFoundError extends BaseError {
  constructor(filePath: string) {
    super(`File not found: ${filePath}`);
  }
}

class InvalidFileError extends BaseError {
  constructor(filePath: string) {
    super(`Invalid file: ${filePath}`);
  }
}

class InvalidFormatError extends BaseError {
  constructor(format: string) {
    super(`Invalid format: ${format}`);
  }
}

class ScriptError extends BaseError {
  constructor(message: string) {
    super(`Script error: ${message}`);
  }
}

class ParsingError extends BaseError {
  constructor(message: string) {
    super(`Parsing error: ${message}`);
  }
}

class RequiredError extends BaseError {
  constructor(name: string) {
    super(`Required input "${name}" is missing`);
  }
}

export { BaseError, FileNotFoundError, InvalidFileError, InvalidFormatError, ScriptError, ParsingError, RequiredError };
