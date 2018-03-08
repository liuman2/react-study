module.exports = () => ({
  plugins: [
    require('autoprefixer')({
      "browsers": "> 1%, last 4 versions, not ie < 9",
    }),
  ],
});
