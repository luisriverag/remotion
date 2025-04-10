import {disallowForwardSeekIfSamplesAreNeeded} from './disallow-forward-seek-if-samples-are-needed';
import {Log} from './log';
import type {ParserState} from './state/parser-state';

export const seekForward = async ({
	state,
	seekTo,
	userInitiated,
}: {
	state: ParserState;
	seekTo: number;
	userInitiated: boolean;
}) => {
	const {iterator} = state;

	if (userInitiated) {
		disallowForwardSeekIfSamplesAreNeeded({
			state,
			seekTo,
			previousPosition: iterator.counter.getOffset(),
		});
	}

	const alreadyHasBuffer =
		iterator.bytesRemaining() >= seekTo - iterator.counter.getOffset();

	Log.verbose(
		state.logLevel,
		`Performing seek from ${iterator.counter.getOffset()} to ${seekTo}`,
	);

	// (a) starting byte has already been fetched

	if (alreadyHasBuffer) {
		iterator.skipTo(seekTo);
		Log.verbose(state.logLevel, `Already read ahead enough, skipping forward`);
		return state.currentReader;
	}

	// (b) starting byte has not been fetched yet, making new reader
	const time = Date.now();
	Log.verbose(
		state.logLevel,
		`Skipping over video data from position ${iterator.counter.getOffset()} -> ${seekTo}. Re-reading because this portion is not available`,
	);

	const {reader: newReader} = await state.readerInterface.read({
		src: state.src,
		range: seekTo,
		controller: state.controller,
	});
	iterator.skipTo(seekTo);
	await state.discardReadBytes(true);

	Log.verbose(
		state.logLevel,
		`Re-reading took ${Date.now() - time}ms. New position: ${iterator.counter.getOffset()}`,
	);
	state.currentReader = newReader;
};
