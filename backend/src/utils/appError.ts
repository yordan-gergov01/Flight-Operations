class AppError extends Error {
  public statusCode: number;
  public status: "fail" | "error";
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode.toString().startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // saves the correct prototype
    // this is necessary because we're extending a built-in class
    Object.setPrototypeOf(this, new.target.prototype);

    // this is the target object for stack trace
    // this.constructor tells V8 to exclude this constructor from the stack trace, so that when the error is logged, only the relevant parts of the code are not shown, not the internal AppError call.
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
