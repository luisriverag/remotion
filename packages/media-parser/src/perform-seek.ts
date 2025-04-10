import {Log} from './log';
import {seekBackwards} from './seek-backwards';
import {seekForward} from './seek-forwards';
import type {ParserState} from './state/parser-state';
import {isByteInVideoSection} from './state/video-section';

export const performSeek = async ({
	seekTo,
	state,
	userInitiated,
}: {
	seekTo: number;
	state: ParserState;
	userInitiated: boolean;
}): Promise<void> => {
	const {
		iterator,
		logLevel,
		mode,
		contentLength,
		seekInfiniteLoop,
		videoSection,
		controller,
	} = state;

	const byteInVideoSection = isByteInVideoSection({
		position: seekTo,
		videoSections: videoSection.getVideoSections(),
	});
	if (byteInVideoSection !== 'in-section' && userInitiated) {
		const sections = videoSection.getVideoSections();
		const sectionStrings = sections.map((section) => {
			return `start: ${section.start}, end: ${section.size + section.start}`;
		});
		throw new Error(
			`Cannot seek to a byte that is not in the video section. Seeking to: ${seekTo}, sections: ${sectionStrings.join(
				' | ',
			)}`,
		);
	}

	seekInfiniteLoop.registerSeek(seekTo);

	if (seekTo <= iterator.counter.getOffset() && mode === 'download') {
		throw new Error(
			`Seeking backwards is not supported in parseAndDownloadMedia() mode. Current position: ${iterator.counter.getOffset()}, seekTo: ${seekTo}`,
		);
	}

	if (seekTo > state.contentLength) {
		throw new Error(
			`Cannot seek beyond the end of the file: ${seekTo} > ${contentLength}`,
		);
	}

	if (mode === 'download') {
		Log.verbose(
			logLevel,
			`Skipping over video data from position ${iterator.counter.getOffset()} -> ${seekTo}. Fetching but not reading all the data inbetween because in download mode`,
		);
		iterator.discard(seekTo - iterator.counter.getOffset());
		return;
	}

	await controller._internals.checkForAbortAndPause();

	const alreadyAtByte = iterator.counter.getOffset() === seekTo;
	if (alreadyAtByte) {
		Log.verbose(logLevel, `Already at the desired position, seeking done`);
		return;
	}

	const skippingForward = seekTo > iterator.counter.getOffset();
	controller._internals.performedSeeksSignal.recordSeek({
		from: iterator.counter.getOffset(),
		to: seekTo,
		type: userInitiated ? 'user-initiated' : 'internal',
	});
	if (skippingForward) {
		await seekForward({state, seekTo, userInitiated});
	} else {
		await seekBackwards(state, seekTo);
	}

	await state.controller?._internals.checkForAbortAndPause();
};
