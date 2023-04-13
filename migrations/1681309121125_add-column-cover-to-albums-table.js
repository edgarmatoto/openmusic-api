exports.up = (pgm) => {
  pgm.addColumn('albums', {
    coverUrl: {
      type: 'VARCHAR(255)',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('albums', 'cover');
};