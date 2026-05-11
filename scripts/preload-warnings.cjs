const { emit } = process;
process.emit = function(type, warning, ...args) {
  if (type === 'warning' && typeof warning === 'object' && warning?.message?.includes('Importing JSON modules')) {
    return false;
  }
  return emit.call(this, type, warning, ...args);
};
