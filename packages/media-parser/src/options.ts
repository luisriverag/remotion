import type {Dimensions} from './get-dimensions';
import type {MediaParserLocation} from './get-location';
import type {
	AudioTrack,
	MediaParserAudioCodec,
	MediaParserVideoCodec,
	VideoTrack,
} from './get-tracks';
import type {LogLevel} from './log';
import type {MetadataEntry} from './metadata/get-metadata';
import type {Structure} from './parse-result';
import type {ReaderInterface} from './readers/reader';
import type {MediaParserEmbeddedImage} from './state/images';
import type {InternalStats} from './state/parser-state';
import type {OnAudioTrack, OnVideoTrack} from './webcodec-sample-types';

export type KnownAudioCodecs =
	| 'aac'
	| 'mp3'
	| 'aiff'
	| 'opus'
	| 'pcm'
	| 'vorbis'
	| 'unknown';

export type ParseMediaFields = {
	dimensions: boolean;
	durationInSeconds: boolean;
	slowDurationInSeconds: boolean;
	structure: boolean;
	fps: boolean;
	slowFps: boolean;
	videoCodec: boolean;
	audioCodec: boolean;
	tracks: boolean;
	rotation: boolean;
	unrotatedDimensions: boolean;
	internalStats: boolean;
	size: boolean;
	name: boolean;
	container: boolean;
	isHdr: boolean;
	metadata: boolean;
	location: boolean;
	mimeType: boolean;
	keyframes: boolean;
	slowKeyframes: boolean;
	slowNumberOfFrames: boolean;
	slowVideoBitrate: boolean;
	slowAudioBitrate: boolean;
	images: boolean;
	sampleRate: boolean;
	numberOfAudioChannels: boolean;
};

export type AllParseMediaFields = {
	dimensions: true;
	durationInSeconds: true;
	slowDurationInSeconds: true;
	slowNumberOfFrames: true;
	slowFps: true;
	structure: true;
	fps: true;
	videoCodec: true;
	audioCodec: true;
	tracks: true;
	rotation: true;
	unrotatedDimensions: true;
	internalStats: true;
	size: true;
	name: true;
	container: true;
	isHdr: true;
	metadata: true;
	location: true;
	mimeType: true;
	keyframes: true;
	slowKeyframes: true;
	images: true;
	sampleRate: true;
	numberOfAudioChannels: true;
	slowVideoBitrate: true;
	slowAudioBitrate: true;
};

export type AllOptions<Fields extends ParseMediaFields> = {
	dimensions: Fields['dimensions'];
	durationInSeconds: Fields['durationInSeconds'];
	slowDurationInSeconds: Fields['slowDurationInSeconds'];
	slowFps: Fields['slowFps'];
	structure: Fields['structure'];
	fps: Fields['fps'];
	videoCodec: Fields['videoCodec'];
	audioCodec: Fields['audioCodec'];
	tracks: Fields['tracks'];
	rotation: Fields['rotation'];
	unrotatedDimensions: Fields['unrotatedDimensions'];
	internalStats: Fields['internalStats'];
	size: Fields['size'];
	name: Fields['name'];
	container: Fields['container'];
	isHdr: Fields['isHdr'];
	metadata: Fields['metadata'];
	location: Fields['location'];
	mimeType: Fields['mimeType'];
	keyframes: Fields['keyframes'];
	slowKeyframes: Fields['slowKeyframes'];
	slowNumberOfFrames: Fields['slowNumberOfFrames'];
	images: Fields['images'];
	sampleRate: Fields['sampleRate'];
	numberOfAudioChannels: Fields['numberOfAudioChannels'];
	slowVideoBitrate: Fields['slowVideoBitrate'];
	slowAudioBitrate: Fields['slowAudioBitrate'];
};

export type Options<Fields extends ParseMediaFields> = Partial<
	AllOptions<Fields>
>;

export type TracksField = {
	videoTracks: VideoTrack[];
	audioTracks: AudioTrack[];
};

export type MediaParserContainer =
	| 'mp4'
	| 'webm'
	| 'avi'
	| 'transport-stream'
	| 'mp3'
	| 'aac'
	| 'flac'
	| 'wav';

export type MediaParserKeyframe = {
	positionInBytes: number;
	sizeInBytes: number;
	presentationTimeInSeconds: number;
	decodingTimeInSeconds: number;
	trackId: number;
};

export interface ParseMediaCallbacks {
	onDimensions?: (dimensions: Dimensions | null) => void;
	onDurationInSeconds?: (durationInSeconds: number | null) => void;
	onSlowDurationInSeconds?: (durationInSeconds: number) => void;
	onSlowFps?: (fps: number) => void;
	onStructure?: (structure: Structure) => void;
	onFps?: (fps: number | null) => void;
	onVideoCodec?: (codec: MediaParserVideoCodec | null) => void;
	onAudioCodec?: (codec: MediaParserAudioCodec | null) => void;
	onTracks?: (tracks: TracksField) => void;
	onRotation?: (rotation: number | null) => void;
	onUnrotatedDimensions?: (dimensions: Dimensions | null) => void;
	onInternalStats?: (internalStats: InternalStats) => void;
	onSize?: (size: number | null) => void;
	onName?: (name: string) => void;
	onContainer?: (container: MediaParserContainer) => void;
	onIsHdr?: (isHdr: boolean) => void;
	onMetadata?: (metadata: MetadataEntry[]) => void;
	onLocation?: (location: MediaParserLocation | null) => void;
	onMimeType?: (mimeType: string | null) => void;
	onKeyframes?: (keyframes: MediaParserKeyframe[] | null) => void;
	onSlowKeyframes?: (keyframes: MediaParserKeyframe[]) => void;
	onSlowNumberOfFrames?: (samples: number) => void;
	onImages?: (images: MediaParserEmbeddedImage[]) => void;
	onSampleRate?: (sampleRate: number | null) => void;
	onNumberOfAudioChannels?: (numberOfChannels: number | null) => void;
	onSlowVideoBitrate?: (videoBitrate: number | null) => void;
	onSlowAudioBitrate?: (audioBitrate: number | null) => void;
}

export interface ParseMediaData {
	dimensions: Dimensions | null;
	durationInSeconds: number | null;
	slowDurationInSeconds: number;
	slowFps: number;
	structure: Structure;
	fps: number | null;
	videoCodec: MediaParserVideoCodec | null;
	audioCodec: MediaParserAudioCodec | null;
	tracks: TracksField;
	rotation: number | null;
	unrotatedDimensions: Dimensions | null;
	isHdr: boolean;
	internalStats: InternalStats;
	size: number | null;
	name: string;
	metadata: MetadataEntry[];
	location: MediaParserLocation | null;
	container: MediaParserContainer;
	mimeType: string | null;
	keyframes: MediaParserKeyframe[] | null;
	slowKeyframes: MediaParserKeyframe[];
	slowNumberOfFrames: number;
	images: MediaParserEmbeddedImage[];
	sampleRate: number | null;
	numberOfAudioChannels: number | null;
	slowVideoBitrate: number | null;
	slowAudioBitrate: number | null;
}

export type ParseMediaResult<T extends Partial<ParseMediaFields>> = {
	[K in keyof T]: T[K] extends true
		? K extends keyof ParseMediaData
			? ParseMediaData[K]
			: never
		: never;
};
export type ParseMediaDynamicOptions<F extends Options<ParseMediaFields>> = {
	fields?: F;
} & ParseMediaCallbacks;

export type ParseMediaProgress = {
	bytes: number;
	percentage: number | null;
	totalBytes: number | null;
};

export type ParseMediaOnProgress = (
	progress: ParseMediaProgress,
) => void | Promise<void>;

export type ParseMediaOptions<F extends Options<ParseMediaFields>> = {
	src: string | Blob;
	reader?: ReaderInterface;
	onAudioTrack?: OnAudioTrack;
	onVideoTrack?: OnVideoTrack;
	signal?: AbortSignal;
	logLevel?: LogLevel;
	onParseProgress?: ParseMediaOnProgress;
	progressIntervalInMs?: number;
} & ParseMediaDynamicOptions<F>;

export type ParseMedia = <F extends Options<ParseMediaFields>>(
	options: ParseMediaOptions<F>,
) => Promise<ParseMediaResult<F>>;
