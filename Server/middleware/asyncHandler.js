const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const wrapAsync = (handlers) => {
  const wrapped = {};
  for (const [name, fn] of Object.entries(handlers)) {
    wrapped[name] = asyncHandler(fn);
  }
  return wrapped;
};

module.exports = { asyncHandler, wrapAsync };
