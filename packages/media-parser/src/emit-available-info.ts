import {getAudioCodec} from './get-audio-codec';
import {getContainer} from './get-container';
import type {Dimensions} from './get-dimensions';
import {getDimensions} from './get-dimensions';
import {getDuration} from './get-duration';
import {getFps} from './get-fps';
import {getIsHdr} from './get-is-hdr';
import {getKeyframes} from './get-keyframes';
import {getLocation} from './get-location';
import {getNumberOfAudioChannels} from './get-number-of-audio-channels';
import {getSampleRate} from './get-sample-rate';
import {getTracks} from './get-tracks';
import {getVideoCodec} from './get-video-codec';
import {getMetadata} from './metadata/get-metadata';
import type {
	AllParseMediaFields,
	Options,
	ParseMediaCallbacks,
	ParseMediaFields,
	ParseMediaResult,
} from './options';
import type {ParserState} from './state/parser-state';

export const emitAvailableInfo = ({
	hasInfo,
	callbacks,
	state,
	returnValue,
	contentLength,
	name,
	mimeType,
	fieldsInReturnValue,
}: {
	hasInfo: Record<keyof Options<ParseMediaFields>, boolean>;
	callbacks: ParseMediaCallbacks;
	fieldsInReturnValue: Options<ParseMediaFields>;
	state: ParserState;
	returnValue: ParseMediaResult<AllParseMediaFields>;
	contentLength: number | null;
	mimeType: string | null;
	name: string;
}) => {
	const keys = Object.keys(hasInfo) as (keyof Options<ParseMediaFields>)[];

	const {emittedFields} = state;

	for (const key of keys) {
		if (key === 'structure') {
			if (hasInfo.structure && !emittedFields.structure) {
				callbacks.onStructure?.(state.structure.getStructure());
				if (fieldsInReturnValue.structure) {
					returnValue.structure = state.structure.getStructure();
				}

				emittedFields.structure = true;
			}

			continue;
		}

		if (key === 'durationInSeconds') {
			if (hasInfo.durationInSeconds) {
				if (!emittedFields.durationInSeconds) {
					const durationInSeconds = getDuration(state);
					callbacks.onDurationInSeconds?.(durationInSeconds);
					if (fieldsInReturnValue.durationInSeconds) {
						returnValue.durationInSeconds = durationInSeconds;
					}

					emittedFields.durationInSeconds = true;
				}
			}

			continue;
		}

		if (key === 'slowDurationInSeconds') {
			if (
				hasInfo.slowDurationInSeconds &&
				!emittedFields.slowDurationInSeconds
			) {
				const slowDurationInSeconds =
					getDuration(state) ??
					state.slowDurationAndFps.getSlowDurationInSeconds();
				callbacks.onSlowDurationInSeconds?.(slowDurationInSeconds);
				if (fieldsInReturnValue.slowDurationInSeconds) {
					returnValue.slowDurationInSeconds = slowDurationInSeconds;
				}

				emittedFields.slowDurationInSeconds = true;
			}

			continue;
		}

		if (key === 'fps') {
			if (hasInfo.fps) {
				if (!emittedFields.fps) {
					const fps = getFps(state.structure.getStructure());
					callbacks.onFps?.(fps);
					if (fieldsInReturnValue.fps) {
						returnValue.fps = fps;
					}

					emittedFields.fps = true;
				}

				if (!emittedFields.slowFps) {
					const fps = getFps(state.structure.getStructure());
					if (fps) {
						callbacks.onSlowFps?.(fps);
						if (fieldsInReturnValue.slowFps) {
							returnValue.slowFps = fps;
						}

						emittedFields.slowFps = true;
					}
				}
			}

			continue;
		}

		// must be handled after fps
		if (key === 'slowFps') {
			if (hasInfo.slowFps && !emittedFields.slowFps) {
				const slowFps = state.slowDurationAndFps.getFps();
				callbacks.onSlowFps?.(slowFps);
				if (fieldsInReturnValue.slowFps) {
					returnValue.slowFps = slowFps;
				}

				emittedFields.slowFps = true;
			}

			continue;
		}

		if (key === 'dimensions') {
			if (hasInfo.dimensions && !emittedFields.dimensions) {
				const dimensionsQueried = getDimensions(state);
				const dimensions: Dimensions | null =
					dimensionsQueried === null
						? null
						: {
								height: dimensionsQueried.height,
								width: dimensionsQueried.width,
							};
				callbacks.onDimensions?.(dimensions);
				if (fieldsInReturnValue.dimensions) {
					returnValue.dimensions = dimensions;
				}

				emittedFields.dimensions = true;
			}

			continue;
		}

		if (key === 'unrotatedDimensions') {
			if (hasInfo.unrotatedDimensions && !emittedFields.unrotatedDimensions) {
				const dimensionsQueried = getDimensions(state);
				const unrotatedDimensions: Dimensions | null =
					dimensionsQueried === null
						? null
						: {
								height: dimensionsQueried.unrotatedHeight,
								width: dimensionsQueried.unrotatedWidth,
							};

				callbacks.onUnrotatedDimensions?.(unrotatedDimensions);
				if (fieldsInReturnValue.unrotatedDimensions) {
					returnValue.unrotatedDimensions = unrotatedDimensions;
				}

				emittedFields.unrotatedDimensions = true;
			}

			continue;
		}

		if (key === 'rotation') {
			if (hasInfo.rotation && !emittedFields.rotation) {
				const dimensionsQueried = getDimensions(state);
				const rotation = dimensionsQueried?.rotation ?? 0;

				callbacks.onRotation?.(rotation);
				if (fieldsInReturnValue.rotation) {
					returnValue.rotation = rotation;
				}

				emittedFields.rotation = true;
			}

			continue;
		}

		if (key === 'videoCodec') {
			if (!emittedFields.videoCodec && hasInfo.videoCodec) {
				const videoCodec = getVideoCodec(state);
				callbacks.onVideoCodec?.(videoCodec);
				if (fieldsInReturnValue.videoCodec) {
					returnValue.videoCodec = videoCodec;
				}

				emittedFields.videoCodec = true;
			}

			continue;
		}

		if (key === 'audioCodec') {
			if (!emittedFields.audioCodec && hasInfo.audioCodec) {
				const audioCodec = getAudioCodec(state);
				callbacks.onAudioCodec?.(audioCodec);
				if (fieldsInReturnValue.audioCodec) {
					returnValue.audioCodec = audioCodec;
				}

				emittedFields.audioCodec = true;
			}

			continue;
		}

		if (key === 'tracks') {
			if (!emittedFields.tracks && hasInfo.tracks) {
				const {videoTracks, audioTracks} = getTracks(state);
				callbacks.onTracks?.({videoTracks, audioTracks});
				if (fieldsInReturnValue.tracks) {
					returnValue.tracks = {videoTracks, audioTracks};
				}

				emittedFields.tracks = true;
			}

			continue;
		}

		if (key === 'internalStats') {
			// Special case: Always emitting internal stats at the end
			if (hasInfo.internalStats) {
				const internalStats = state.getInternalStats();
				if (fieldsInReturnValue.internalStats) {
					returnValue.internalStats = internalStats;
				}

				emittedFields.internalStats = true;
			}

			continue;
		}

		if (key === 'size') {
			if (!emittedFields.size && hasInfo.size) {
				callbacks.onSize?.(contentLength);
				if (fieldsInReturnValue.size) {
					returnValue.size = contentLength;
				}

				emittedFields.size = true;
			}

			continue;
		}

		if (key === 'mimeType') {
			if (!emittedFields.mimeType && hasInfo.mimeType) {
				callbacks.onMimeType?.(mimeType);
				if (fieldsInReturnValue.mimeType) {
					returnValue.mimeType = mimeType;
				}

				emittedFields.mimeType = true;
			}

			continue;
		}

		if (key === 'name') {
			if (!emittedFields.name && hasInfo.name) {
				callbacks.onName?.(name);
				if (fieldsInReturnValue.name) {
					returnValue.name = name;
				}

				emittedFields.name = true;
			}

			continue;
		}

		if (key === 'isHdr') {
			if (!returnValue.isHdr && hasInfo.isHdr) {
				const isHdr = getIsHdr(state);
				callbacks.onIsHdr?.(isHdr);
				if (fieldsInReturnValue.isHdr) {
					returnValue.isHdr = isHdr;
				}

				emittedFields.isHdr = true;
			}

			continue;
		}

		if (key === 'container') {
			if (!returnValue.container && hasInfo.container) {
				const container = getContainer(state.structure.getStructure());
				callbacks.onContainer?.(container);
				if (fieldsInReturnValue.container) {
					returnValue.container = container;
				}

				emittedFields.container = true;
			}

			continue;
		}

		if (key === 'metadata') {
			if (!emittedFields.metadata && hasInfo.metadata) {
				const metadata = getMetadata(state.structure.getStructure());
				callbacks.onMetadata?.(metadata);
				if (fieldsInReturnValue.metadata) {
					returnValue.metadata = metadata;
				}

				emittedFields.metadata = true;
			}

			continue;
		}

		if (key === 'location') {
			if (!emittedFields.location && hasInfo.location) {
				const location = getLocation(state.structure.getStructure());
				callbacks.onLocation?.(location);
				if (fieldsInReturnValue.location) {
					returnValue.location = location;
				}

				emittedFields.location = true;
			}

			continue;
		}

		if (key === 'slowKeyframes') {
			if (!emittedFields.slowKeyframes && hasInfo.slowKeyframes) {
				callbacks.onSlowKeyframes?.(state.keyframes.getKeyframes());
				if (fieldsInReturnValue.slowKeyframes) {
					returnValue.slowKeyframes = state.keyframes.getKeyframes();
				}

				emittedFields.slowKeyframes = true;
			}

			continue;
		}

		if (key === 'slowNumberOfFrames') {
			if (!emittedFields.slowNumberOfFrames && hasInfo.slowNumberOfFrames) {
				callbacks.onSlowNumberOfFrames?.(
					state.slowDurationAndFps.getSlowNumberOfFrames(),
				);
				if (fieldsInReturnValue.slowNumberOfFrames) {
					returnValue.slowNumberOfFrames =
						state.slowDurationAndFps.getSlowNumberOfFrames();
				}

				emittedFields.slowNumberOfFrames = true;
			}

			continue;
		}

		if (key === 'slowAudioBitrate') {
			if (!emittedFields.slowAudioBitrate && hasInfo.slowAudioBitrate) {
				callbacks.onSlowAudioBitrate?.(
					state.slowDurationAndFps.getAudioBitrate(),
				);
				if (fieldsInReturnValue.slowAudioBitrate) {
					returnValue.slowAudioBitrate =
						state.slowDurationAndFps.getAudioBitrate();
				}

				emittedFields.slowAudioBitrate = true;
			}

			continue;
		}

		if (key === 'slowVideoBitrate') {
			if (!emittedFields.slowVideoBitrate && hasInfo.slowVideoBitrate) {
				callbacks.onSlowVideoBitrate?.(
					state.slowDurationAndFps.getVideoBitrate(),
				);
				if (fieldsInReturnValue.slowVideoBitrate) {
					returnValue.slowVideoBitrate =
						state.slowDurationAndFps.getVideoBitrate();
				}

				emittedFields.slowVideoBitrate = true;
			}

			continue;
		}

		if (key === 'keyframes') {
			if (!emittedFields.keyframes && hasInfo.keyframes) {
				callbacks.onKeyframes?.(getKeyframes(state.structure.getStructure()));
				if (fieldsInReturnValue.keyframes) {
					returnValue.keyframes = getKeyframes(state.structure.getStructure());
				}

				emittedFields.keyframes = true;
			}

			continue;
		}

		if (key === 'images') {
			if (!emittedFields.images && hasInfo.images) {
				callbacks.onImages?.(state.images.images);
				if (fieldsInReturnValue.images) {
					returnValue.images = state.images.images;
				}

				emittedFields.images = true;
			}

			continue;
		}

		if (key === 'sampleRate') {
			if (!emittedFields.sampleRate && hasInfo.sampleRate) {
				const sampleRate = getSampleRate(state);
				callbacks.onSampleRate?.(sampleRate);
				if (fieldsInReturnValue.sampleRate) {
					returnValue.sampleRate = sampleRate;
				}

				emittedFields.sampleRate = true;
			}

			continue;
		}

		if (key === 'numberOfAudioChannels') {
			if (
				!emittedFields.numberOfAudioChannels &&
				hasInfo.numberOfAudioChannels
			) {
				const numberOfAudioChannels = getNumberOfAudioChannels(state);
				callbacks.onNumberOfAudioChannels?.(numberOfAudioChannels);
				if (fieldsInReturnValue.numberOfAudioChannels) {
					returnValue.numberOfAudioChannels = numberOfAudioChannels;
				}

				emittedFields.numberOfAudioChannels = true;
			}

			continue;
		}

		throw new Error(`Unhandled key: ${key satisfies never}`);
	}
};
