const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(
    albumsService,
    storageService,
    albumsValidator,
  ) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._albumsValidator = albumsValidator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._albumsValidator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._albumsService.addAlbum({
      name,
      year,
    });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const albums = await this._albumsService.getAlbums();
    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._albumsService.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._albumsValidator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._albumsService.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._albumsService.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postUploadAlbumCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;
    this._albumsValidator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(
      cover,
      cover.hapi,
    );

    const fileLocation = `${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    await this._albumsService.editAlbumCover(fileLocation, id);

    const response = h.response({
      status: 'success',
      message: 'Cover album berhasil disimpan',
    });
    response.code(201);
    return response;
  }

  async postLikesAlbumHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const message = await this._albumsService.likeTheAlbum(id, credentialId);
    const response = h.response({
      status: 'success',
      message,
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesByIdHandler(request, h) {
    const { id } = request.params;
    const { likes, source } = await this._albumsService.getAlbumLikesById(id);
    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.header('X-Data-Source', source);
    response.code(200);
    return response;
  }

  async deleteLikesAlbumHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._albumsService.deleteLikesAlbum(id, credentialId);
    return {
      status: 'success',
      message: 'Like berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;
