import type {ParseResult} from '../../parse-result';
import {makeSkip} from '../../skip';
import {maySkipVideoData} from '../../state/may-skip-video-data';
import type {ParserState} from '../../state/parser-state';
import {getCurrentVideoSection} from '../../state/video-section';
import {expectRiffBox} from './expect-riff-box';
import {parseVideoSection} from './parse-video-section';

export const parseRiffBody = async (
	state: ParserState,
): Promise<ParseResult> => {
	if (
		state.videoSection.isCurrentByteInVideoSection(state.iterator) ===
		'in-section'
	) {
		if (
			maySkipVideoData({
				state,
			}) &&
			state.riff.getAvcProfile()
		) {
			const videoSection = getCurrentVideoSection({
				offset: state.iterator.counter.getOffset(),
				videoSections: state.videoSection.getVideoSections(),
			});
			if (!videoSection) {
				throw new Error('No video section defined');
			}

			// only skipping forward in query mode
			return Promise.resolve(makeSkip(videoSection.start + videoSection.size));
		}

		await parseVideoSection(state);
		return null;
	}

	const box = await expectRiffBox(state);
	if (box !== null) {
		const structure = state.getRiffStructure();
		structure.boxes.push(box);
	}

	return null;
};
