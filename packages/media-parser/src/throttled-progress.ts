import type {ParseMediaOnProgress, ParseMediaProgress} from './options';

type ReturnType = {
	get: () => ParseMediaProgress;
	update: ParseMediaProgressFn | null;
	stopAndGetLastProgress: () => void;
};

export type ParseMediaProgressFn = (
	state: (prevState: ParseMediaProgress) => ParseMediaProgress,
) => void;

export const throttledStateUpdate = ({
	updateFn,
	everyMilliseconds,
	signal,
}: {
	updateFn: ParseMediaOnProgress | null;
	everyMilliseconds: number;
	signal: AbortSignal | undefined;
	totalBytes: number | null;
}): ReturnType => {
	let currentState: ParseMediaProgress = {
		bytes: 0,
		percentage: null,
		totalBytes: null,
	};

	if (!updateFn) {
		return {
			get: () => currentState,
			update: null,
			stopAndGetLastProgress: () => {},
		};
	}

	let lastUpdated: ParseMediaProgress | null = null;

	const callUpdateIfChanged = () => {
		if (currentState === lastUpdated) {
			return;
		}

		updateFn(currentState);
		lastUpdated = currentState;
	};

	const interval = setInterval(() => {
		callUpdateIfChanged();
	}, everyMilliseconds);

	const onAbort = () => {
		clearInterval(interval);
	};

	signal?.addEventListener('abort', onAbort, {once: true});

	return {
		get: () => currentState,
		update: (fn) => {
			currentState = fn(currentState);
		},
		stopAndGetLastProgress: () => {
			clearInterval(interval);
			signal?.removeEventListener('abort', onAbort);
			return currentState;
		},
	};
};
