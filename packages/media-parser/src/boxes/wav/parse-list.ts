import type {BufferIterator} from '../../buffer-iterator';
import type {MetadataEntry} from '../../metadata/get-metadata';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import type {WavList, WavStructure} from './types';

export const parseList = ({
	iterator,
	state,
}: {
	iterator: BufferIterator;
	state: ParserState;
}): Promise<ParseResult> => {
	const ckSize = iterator.getUint32Le(); // chunkSize
	const box = iterator.startBox(ckSize);

	const startOffset = iterator.counter.getOffset();
	const type = iterator.getByteString(4, false);
	if (type !== 'INFO') {
		throw new Error(`Only supporting LIST INFO, but got ${type}`);
	}

	const metadata: MetadataEntry[] = [];

	while (iterator.counter.getOffset() < startOffset + ckSize) {
		const key = iterator.getByteString(4, false);
		const size = iterator.getUint32Le();
		const value = iterator.getByteString(size, true);
		metadata.push({
			key,
			trackId: null,
			value,
		});
	}

	const wavList: WavList = {
		type: 'wav-list',
		metadata,
	};

	(state.structure.getStructure() as WavStructure).boxes.push(wavList);

	box.expectNoMoreBytes();

	return Promise.resolve({skipTo: null});
};
