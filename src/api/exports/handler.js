const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);
    
    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;
    const { targetEmail } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const playlists = await this._playlistsService.getPlaylistById(
      playlistId,
    );
    const songsFromPlaylist = await this._playlistsService.getSongsFromPlaylist(
      playlistId,
    );

    const message = {
      playlist: {
        id: playlists.id,
        name: playlists.name,
        songs: songsFromPlaylist,
      },
      targetEmail,
    };

    console.log('message :>> ', message);

    await this._producerService.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
