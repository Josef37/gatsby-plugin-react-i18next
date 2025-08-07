module.exports = (api) => {
  const isTest = api.env('test');

  if (isTest) {
    return {presets: ['babel-preset-gatsby', '@babel/preset-typescript']};
  }

  return {
    presets: [['babel-preset-gatsby-package', {browser: true}]]
  };
};
