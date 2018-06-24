

/**
 * Provides custom error objects for taut
 **/
 
class AssetError extends Error {    
    /**
     * Primary error object type AssetError
     * @param       {string} message       Custom Message
     * @param       {object} upstreamError Additional information. Usually
     *                                     another Error
     * @constructor
     */
    constructor (message, upstreamError) {
        super(message);
        this.name = this.constructor.name;
        this.upstreamError = upstreamError;
        if (upstreamError && upstreamError.message) {
            this.message = this.message + ': ' + upstreamError.message;
        }
        Error.captureStackTrace(this, this.constructor);
    }
}


class TooBigAssetError extends AssetError {
    /**
     * TooBigAssetError
     * @param       {object} upstreamError Additional information. Usually
     *                                     another Error
     * @constructor
     */
    constructor (upstreamError) {
        super('Upload file too large', upstreamError);
        this.name = this.constructor.name;
        this.upstreamError = upstreamError; 
        if (upstreamError && typeof upstreamError === 'number') {
            this.message = this.message + ': ' + upstreamError + ' bytes';
        }
        Error.captureStackTrace(this, this.constructor);
    }
}

class FailedAssetError extends AssetError {
    /**
     * TooBigAssetError
     * @param       {object} upstreamError Additional information. Usually
     *                                     another Error
     * @constructor
     */
    constructor (upstreamError) {
        super('Failed during save', upstreamError);
        this.name = this.constructor.name;
    }
}

class DeleteFailedAssetError extends AssetError {
    /**
     * TooBigAssetError
     * @param       {object} upstreamError Additional information. Usually
     *                                     another Error
     * @constructor
     */
    constructor (upstreamError) {
        super('Delete failed', upstreamError);
        this.name = this.constructor.name;
    }
}

class RenameFailedAssetError extends AssetError {
    /**
     * TooBigAssetError
     * @param       {object} upstreamError Additional information. Usually
     *                                     another Error
     * @constructor
     */
    constructor (upstreamError) {
        super('Rename failed', upstreamError);
        this.name = this.constructor.name;
    }
}

class HashMismatchAssetError extends AssetError {
    /**
     * TooBigAssetError
     * @param       {object} upstreamError Additional information. Usually
     *                                     another Error
     * @constructor
     */
    constructor (upstreamError) {
        super('Hash mismatch between name and content', upstreamError);
    }
}



module.exports = AssetError;
module.exports.AssetError = AssetError; 
module.exports.TooBigAssetError = TooBigAssetError;
module.exports.FailedAssetError = FailedAssetError;
module.exports.DeleteFailedAssetError = DeleteFailedAssetError;
module.exports.RenameFailedAssetError = RenameFailedAssetError;
module.exports.HashMismatchAssetError = HashMismatchAssetError;
