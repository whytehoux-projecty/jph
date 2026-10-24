import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * cn() for the commercial UI kit.
 *
 * The project's type tokens (text-small, text-body, text-h2 …) are custom, so
 * the stock tailwind-merge reads them as text *colours* and silently drops the
 * real colour class next to them (e.g. `text-paper-50 text-small` lost the
 * white text on primary buttons). This merge knows they are font sizes.
 * Kept local to commercial-ui so the portal's shared cn() is unchanged.
 */
const twMerge = extendTailwindMerge({
    extend: {
        classGroups: {
            'font-size': [
                {
                    text: [
                        'display-xl', 'display-lg', 'display-sm',
                        'h1', 'h2', 'h3', 'h4',
                        'lead', 'body-lg', 'body', 'small', 'label',
                        'data', 'data-lg', 'figure',
                    ],
                },
            ],
        },
    },
});

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
